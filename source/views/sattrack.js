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
	components: [
		{content: "<canvas id=\"skyplot\" width=\"400\" height=\"400\"></canvas>", classes:"skyplot", allowHtml: true},
		{classes:"sat-table header", components: [
			{classes: "row", components: [
				{content: "Sat Name", classes: "col-name item left"},
				{content: "Sat Lat", classes: "col-lat item left"},
				{content: "Sat Long", classes: "col-lon item left"},
				{content: "Sat Dist", classes: "col-distance item left"}
			]}
		]},
		{kind: "enyo.List", name: "satList", classes:"sat-table", onSetupItem: "setupSatList", components: [
			{classes: "row", components: [
				{name: "satName", classes: "col-name item", allowHtml: true},
				{name: "satLat", classes: "col-lat item", allowHtml: true},
				{name: "satLon", classes: "col-lon item", allowHtml: true},
				{name: "satDistance", classes: "col-distance item", allowHtml: true}
			]}
		]},
	],

	rendered: function() {
		this.tle = this.config.local;
		this.downloadHamTLEs();
		setInterval(enyo.bind(this, this.updateSatData), 2000);
		setInterval(enyo.bind(this, this.drawSatellitesOnSkyplot), 2000);
		setInterval(enyo.bind(this, this.downloadHamTLEs), 1440000);
		//this.downloadHamTLEs(this.config.server);
		//this.downloadHamTLEs("source/data/amateur.txt");
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
    const myAlt = 10;
		this.getHamSatellitesByDistance();

		this.$.satList.setCount(this.tracks.length);
		this.$.satList.render();
	},

	setupSatList: function(inSender, inEvent) {
		this.$.satName.setContent(this.tracks[inEvent.index].name);
		this.$.satLat.setContent(this.tracks[inEvent.index].latitude);
		this.$.satLon.setContent(this.tracks[inEvent.index].longitude);
		this.$.satDistance.setContent(this.tracks[inEvent.index].distance_km);
	},

	drawSkyplotGrid: function(ctx, size) {
		const cx = size / 2;
		const cy = size / 2;
		const rOuter = size * 0.45;
		const rInner = rOuter * 0.5;

		ctx.clearRect(0, 0, size, size);

		ctx.strokeStyle = "#ffffff";
		ctx.lineWidth = 1;

		// Außenkreis (Horizont)
		ctx.beginPath();
		ctx.arc(cx, cy, rOuter, 0, Math.PI * 2);
		ctx.stroke();

		// Innerer Kreis (45° Elevation)
		ctx.beginPath();
		ctx.arc(cx, cy, rInner, 0, Math.PI * 2);
		ctx.stroke();

		// Kreuzlinien
		ctx.beginPath();
		ctx.moveTo(cx, cy - rOuter);
		ctx.lineTo(cx, cy + rOuter);
		ctx.moveTo(cx - rOuter, cy);
		ctx.lineTo(cx + rOuter, cy);
		ctx.stroke();

		// Beschriftung
		ctx.font = "12px monospace";
		ctx.fillStyle = "#ffffff";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";

		ctx.fillText("N", cx, cy - rOuter - 10);
		ctx.fillText("S", cx, cy + rOuter + 10);
		ctx.fillText("E", cx + rOuter + 10, cy);
		ctx.fillText("W", cx - rOuter - 10, cy);
	},

	drawSatellitesOnSkyplot: function() {
		var maxDistanceKm = 4000;

		var canvas = document.getElementById("skyplot");
		var ctx = canvas.getContext("2d");

		var size = canvas.width;
		var cx = size / 2;
		var cy = size / 2;
		var rOuter = size * 0.45;

		this.drawSkyplotGrid(ctx, size);

		for (var i = 0; i < this.tracks.length; i++) {
			var sat = this.tracks[i];
			if (sat.elevation_deg <= 0) continue;
			if (sat.distance_km > maxDistanceKm) continue;

			var az = sat.azimuth_deg * Math.PI / 180;
			var el = sat.elevation_deg;

			var r = (90 - el) / 90 * rOuter;

			var x = cx + r * Math.sin(az);
			var y = cy - r * Math.cos(az);

			ctx.beginPath();
			ctx.arc(x, y, 4, 0, Math.PI * 2);
			ctx.fillStyle = "#ffffff";
			ctx.fill();

			ctx.font = "10px monospace";
			ctx.fillText(sat.name, x + 6, y);
		}
	},

	downloadHamTLEs: function() {
		var ajax = new enyo.Ajax({ url: this.tle });
		ajax.go();
		ajax.response(this, "processHamTLEs");
		// handle error
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
	}

});



