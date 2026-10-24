enyo.kind({
	name: "SatTrackView",
	classes: "sattrack-panel",
	tle: "",
	config: {
		'server': "https://celestrak.org/NORAD/elements/amateur.txt",
		'local':  "source/data/amateur.txt",
	},
	sats: [],
	tracks: [],
	timer: null,
	tleTimer: null,
	tleRequestInProgress: false,
	requestedTle: null,
	passCache: null,
	passQueue: null,
	pendingPasses: null,
	passTimer: null,

	create: function() {
		this.inherited(arguments);
		this.passCache = {};
		this.passQueue = [];
		this.pendingPasses = {};
	},
	components: [
		{classes:"sat-table header", components: [
			{classes: "row", components: [
				{content: "Sat Name", classes: "col-name item left"},
				{content: "AOS", classes: "col-aos item right"},
				{content: "LOS", classes: "col-los item right"},
				{content: "Dur", classes: "col-dur item right"},
				{content: "Dist", classes: "col-distance item right"}
			]}
		]},
		{kind: "enyo.List", name: "satList", classes:"sat-table", onSetupItem: "setupSatList", components: [
			{classes: "row", components: [
				{name: "satName", classes: "col-name item", allowHtml: true},
				{name: "satAos", classes: "col-aos item", allowHtml: true},
				{name: "satLos", classes: "col-los item", allowHtml: true},
				{name: "satDur", classes: "col-dur item", allowHtml: true},
				{name: "satDistance", classes: "col-distance item", allowHtml: true}
			]}
		]},
	],

	rendered: function() {
		this.inherited(arguments);
		this.downloadHamTLEs(this.config.server);
	},

	panelActivated: function() {
		if (!this.timer) {
			console.log('Enable sattrack panel');
			this.tleTimer = setInterval(enyo.bind(this, this.downloadHamTLEs), 86400000);
			this.timer = setInterval(enyo.bind(this, this.updateSatData), 5000);
		}
	},

	panelDeactivated: function() {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
		if (this.tleTimer) {
			clearInterval(this.tleTimer);
			this.tleTimer = null;
		}
	},

	getHamSatellitesByDistance: function() {
		var now = new Date();
		var observerGd = {
			latitude: satellite.degreesToRadians(this.owner.config.lat),
			longitude: satellite.degreesToRadians(this.owner.config.lon),
			height: 10 / 1000.0
		};

		this.tracks = [];

		if (!this.sats.length) return;

		for (var i = 0; i < this.sats.length; i++) {
			var sat = this.sats[i];
			try {
				var satrec = satellite.twoline2satrec(sat.tle1, sat.tle2);
				var pv = satellite.propagate(satrec, now);
				if (!pv.position) continue;

				var gmst = satellite.gstime(now);

				var geodetic = satellite.eciToGeodetic(pv.position, gmst);
				var ecf = satellite.eciToEcf(pv.position, gmst);
				var look = satellite.ecfToLookAngles(observerGd, ecf);

				this.tracks.push({
				    tle1: sat.tle1,
				    tle2: sat.tle2,
				    name: sat.name,
				    latitude: satellite.radiansToDegrees(geodetic.latitude),
				    longitude: satellite.radiansToDegrees(geodetic.longitude),
				    altitude_km: geodetic.height,
				    azimuth_deg: satellite.radiansToDegrees(look.azimuth),
				    elevation_deg: satellite.radiansToDegrees(look.elevation),
				    distance_km: look.rangeSat
				});
			} catch (e) {
			}
		}


		this.tracks.sort(function(a, b) {
		    return a.distance_km - b.distance_km;
		});
		this.tracks = this.tracks.slice(0, 11);
	},

  updateSatData: function() {
		if (isNaN(parseFloat(this.owner.config.lat)) || isNaN(parseFloat(this.owner.config.lon))) {
			return;
		}

    this.getHamSatellitesByDistance();

		this.$.satList.setCount(this.tracks.length);
		this.$.satList.render();
	},

	setupSatList: function(inSender, inEvent) {
		var sat = this.tracks[inEvent.index];
		if (!sat) return;
		this.$.satName.setContent(sat.name);
		this.$.satDistance.setContent(Math.round(sat.distance_km));
		var pass = this.computeAosLosForSatellite(sat);
		if (pass != null) {
			var aos = pass.aos.toISOString();
			var los = pass.los.toISOString();
			this.$.satAos.setContent(aos.substring(11, 16));
			this.$.satLos.setContent(los.substring(11, 16));
			this.$.satDur.setContent(pass.duration_sec + "s");
		} else {
			this.$.satAos.setContent("--:--");
			this.$.satLos.setContent("--:--");
			this.$.satDur.setContent("--");
		}
	},

	getSatelliteColorByName: function(name) {
		var hash = 0;
		for (var i = 0; i < name.length; i++) {
			hash = name.charCodeAt(i) + ((hash << 5) - hash);
		}

		var r = (hash >> 0) & 0xFF;
		var g = (hash >> 8) & 0xFF;
		var b = (hash >> 16) & 0xFF;

		// abdunkeln für bessere Sichtbarkeit
		r = (r + 128) % 256;
		g = (g + 128) % 256;
		b = (b + 128) % 256;

		return "rgb(" + r + "," + g + "," + b + ")";
	},

	computeAosLosForSatellite: function(sat) {
		if (!sat.tle1 || !sat.tle2) return null;
		var now = new Date();
		var cacheKey = sat.tle1;
		var cached = this.passCache[cacheKey];
		if (cached && now.getTime() - cached.time < 60000) return cached.pass;
		if (this.pendingPasses[cacheKey]) return null;

		var satrec;
		try {
			satrec = satellite.twoline2satrec(sat.tle1, sat.tle2);
		} catch (e) {
			this.passCache[cacheKey] = { time: now.getTime(), pass: null };
			return null;
		}

		this.pendingPasses[cacheKey] = true;
		this.passQueue.push({
			cacheKey: cacheKey,
			satrec: satrec,
			observerGd: {
				latitude: satellite.degreesToRadians(this.owner.config.lat),
				longitude: satellite.degreesToRadians(this.owner.config.lon),
				height: 0
			},
			startTime: now.getTime(),
			nextSecond: 0,
			aos: null,
			los: null,
			wasAbove: false
		});
		this.schedulePassCalculation();
		return null;
	},

	schedulePassCalculation: function() {
		if (this.passTimer !== null || !this.passQueue.length) return;
		var self = this;
		this.passTimer = setTimeout(function() {
			self.processPassCalculationChunk();
		}, 10);
	},

	processPassCalculationChunk: function() {
		this.passTimer = null;
		if (!this.passQueue.length) return;

		var job = this.passQueue[0];
		var work = 0;
		var maxWorkPerTurn = 25;
		var maxSeconds = 120 * 60;

		while (work < maxWorkPerTurn && job.nextSecond <= maxSeconds && !job.los) {
			var time = new Date(job.startTime + job.nextSecond * 1000);
			var pv = satellite.propagate(job.satrec, time);
			job.nextSecond += 10;
			work++;
			if (!pv.position) continue;

			var gmst = satellite.gstime(time);
			var ecf = satellite.eciToEcf(pv.position, gmst);
			var look = satellite.ecfToLookAngles(job.observerGd, ecf);
			var elevation = satellite.radiansToDegrees(look.elevation);

			if (!job.wasAbove && elevation > 0) {
				job.aos = new Date(time.getTime());
				job.wasAbove = true;
			}
			if (job.wasAbove && elevation <= 0) {
				job.los = new Date(time.getTime());
			}
		}

		if (job.los || job.nextSecond > maxSeconds) {
			var pass = null;
			if (job.aos && job.los) {
				pass = {
					aos: job.aos,
					los: job.los,
					duration_sec: Math.round((job.los - job.aos) / 1000)
				};
			}
			this.passCache[job.cacheKey] = { time: new Date().getTime(), pass: pass };
			delete this.pendingPasses[job.cacheKey];
			this.passQueue.shift();
			if (this.$ && this.$.satList) this.$.satList.render();
		}

		this.schedulePassCalculation();
	},

	clearPassCalculations: function() {
		if (this.passTimer !== null) {
			clearTimeout(this.passTimer);
			this.passTimer = null;
		}
		this.passQueue = [];
		this.pendingPasses = {};
	},

	downloadHamTLEs: function(url) {
		if (this.tleRequestInProgress) return;
		this.requestedTle = url || this.config.server;
		this.tleRequestInProgress = true;
		var ajax = new enyo.Ajax({ url: this.requestedTle });
		ajax.response(this, "processHamTLEs");
		ajax.error(this, "processError");
		ajax.go();
	},

	processHamTLEs: function(inSender, inResponse) {
		this.tleRequestInProgress = false;
		var text = inResponse;
		if (typeof text !== "string") {
			this.processError(inSender, "Invalid TLE response");
			return;
		}
		var lines = text.split(/\r?\n/);
		var sats = [];
		for (var i = 0; i + 2 < lines.length; i++) {
			var name = lines[i].trim();
			var tle1 = lines[i + 1].trim();
			var tle2 = lines[i + 2].trim();
			if (name && tle1.indexOf("1 ") === 0 && tle2.indexOf("2 ") === 0) {
				sats.push({ name: name, tle1: tle1, tle2: tle2 });
				i += 2;
			}
		}
		if (!sats.length) {
			this.processError(inSender, "No valid TLE records");
			return;
		}
		this.sats = sats;
		this.clearPassCalculations();
		this.passCache = {};
	},

	processError: function(inSender, inResponse) {
		this.tleRequestInProgress = false;
		console.error("TLE request failed:", inResponse);
		if (this.requestedTle !== this.config.local) {
			this.downloadHamTLEs(this.config.local);
		}
	}

});



