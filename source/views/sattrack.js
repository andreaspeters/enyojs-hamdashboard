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
		this.tle = this.config.local;
		this.downloadHamTLEs();
	},

	panelActivated: function() {
		if (!this.timer) {
			console.log('Enable sattrack panel');
			setInterval(enyo.bind(this, this.downloadHamTLEs), 1440000);
			this.timer = setInterval(enyo.bind(this, this.updateSatData), 5000);
		}
	},

	panelDeactivated: function() {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
	},

	getHamSatellitesByDistance: function() {
		const now = new Date();
		const observerGd = {
			latitude: satellite.degreesToRadians(this.owner.config.lat),
			longitude: satellite.degreesToRadians(this.owner.config.lon),
			height: 10 / 1000.0
		};

		this.tracks = [];

		if (this.sats.length <= 10) return;

		for (var i = 0; i <= 10; i++) {
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
	},

  updateSatData: function() {
		if (this.owner.config.lat == 0.00 || this.owner.config.lon == 0.00) {
			return;
		}

    const myAlt = 10;
		this.getHamSatellitesByDistance();

		this.$.satList.setCount(this.tracks.length);
		this.$.satList.render();
	},

	setupSatList: function(inSender, inEvent) {
		this.$.satName.setContent(this.tracks[inEvent.index].name);
		this.$.satDistance.setContent(Math.round(this.tracks[inEvent.index].distance_km));
		var pass = this.computeAosLosForSatellite(this.tracks[inEvent.index]);
		if (pass != null) {
			var aos = pass.aos.toISOString();
			var los = pass.los.toISOString();
			this.$.satAos.setContent(aos.substring(11, 16));
			this.$.satLos.setContent(los.substring(11, 16));
			this.$.satDur.setContent(pass.duration_sec + "s");
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
		var observerGd = {
			latitude: satellite.degreesToRadians(this.owner.config.lat),
			longitude: satellite.degreesToRadians(this.owner.config.lon),
			height: 0
		};

		if (!sat.tle1 || !sat.tle2) return null;

		var satrec;
		try {
			satrec = satellite.twoline2satrec(sat.tle1, sat.tle2);
		} catch (e) {
			return null;
		}

		var now = new Date();
		var stepSeconds = 10;
		var maxMinutes = 120; // max. 2h

		var aos = null;
		var los = null;
		var wasAbove = false;

		for (var t = 0; t <= maxMinutes * 60; t += stepSeconds) {
			var time = new Date(now.getTime() + t * 1000);

			var pv = satellite.propagate(satrec, time);
			if (!pv.position) continue;

			var gmst = satellite.gstime(time);
			var ecf = satellite.eciToEcf(pv.position, gmst);
			var look = satellite.ecfToLookAngles(observerGd, ecf);

			var el = satellite.radiansToDegrees(look.elevation);

			// AOS
			if (!wasAbove && el > 0) {
				aos = new Date(time.getTime());
				wasAbove = true;
			}

			// LOS
			if (wasAbove && el <= 0) {
				los = new Date(time.getTime());
				break;
			}
		}

		if (!aos || !los) return null;

		return {
			aos: aos,
			los: los,
			duration_sec: Math.round((los - aos) / 1000)
		};
	},

	downloadHamTLEs: function() {
		var ajax = new enyo.Ajax({ url: this.tle });
		ajax.go();
		ajax.response(this, "processHamTLEs");
		ajax.error(this, "processError");
	},

	processHamTLEs: function(inSender, inResponse) {
		const text = inResponse;
		const lines = text.split(/\r?\n/);

		this.sats = [];

		for (var i = 0; i < lines.length; i += 3) {
			if (!lines[i + 2]) continue;

			this.sats.push({
				name: lines[i].trim(),
				tle1: lines[i + 1].trim(),
				tle2: lines[i + 2].trim()
			});
		}
	},

	processError: function(inSender, inResponse) {
		this.tle = this.config.local;
		this.downloadHamTLEs;
 		this.tle = this.config.server;
	}

});



