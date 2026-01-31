enyo.kind({
	name: "SatPolarView",
	classes: "sattrack-panel",
	tle: "",
	timer: null,
	components: [
		{content: "<canvas id=\"skyplot\" width=\"400\" height=\"400\"></canvas>", classes:"skyplot", allowHtml: true},
	],

	panelActivated: function() {
		if (!this.timer) {
			console.log('Enable satpolar panel');
			this.timer = setInterval(enyo.bind(this, this.drawSatellitesOnSkyplot), 2000);
		}
	},

	panelDeactivated: function() {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
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
		if (this.owner.config.lat == 0.00 || this.owner.config.lon == 0.00) {
			return;
		}
		var maxDistanceKm = this.owner.config.distance;

		var canvas = document.getElementById("skyplot");
		if (!canvas) return;

		var ctx = canvas.getContext("2d");

		var size = canvas.width;
		var cx = size / 2;
		var cy = size / 2;
		var rOuter = size * 0.45;

		// Grid
		this.drawSkyplotGrid(ctx, size);

		// Viewer
		var observerGd = {
			latitude: satellite.degreesToRadians(this.owner.config.lat),
			longitude: satellite.degreesToRadians(this.owner.config.lon),
			height: 0
		};

		ctx.font = "10px monospace";

		// Satelittes
		for (var i = 0; i < this.owner.$.satTrackView.tracks.length; i++) {
			var sat = this.owner.$.satTrackView.tracks[i];

			if (!sat.tle1 || !sat.tle2) continue;
			if (sat.elevation_deg <= 0) continue;
			if (sat.distance_km > maxDistanceKm) continue;

			// Track in different color
			var track = this.computeSkyplotTrack(
				sat,
				observerGd,
				15,   // ±15 Minuten
				30    // 30 Sekunden
			);

			if (track.length > 1) {
	  		ctx.strokeStyle = this.owner.$.satTrackView.getSatelliteColorByName(sat.name);
				ctx.lineWidth = 1;
				ctx.beginPath();

				for (var j = 0; j < track.length; j++) {
					var az = track[j].az * Math.PI / 180;
					var el = track[j].el;

					var r = (90 - el) / 90 * rOuter;
					var x = cx + r * Math.sin(az);
					var y = cy - r * Math.cos(az);

					if (j === 0)
						ctx.moveTo(x, y);
					else
						ctx.lineTo(x, y);
				}
				ctx.stroke();
			}

			// Satelitte WHITE
			var az = sat.azimuth_deg * Math.PI / 180;
			var el = sat.elevation_deg;

			var r = (90 - el) / 90 * rOuter;
			var x = cx + r * Math.sin(az);
			var y = cy - r * Math.cos(az);

			ctx.fillStyle = "#ffffff";
			ctx.beginPath();
			ctx.arc(x, y, 4, 0, Math.PI * 2);
			ctx.fill();

			ctx.fillText(sat.name, x + 6, y);
		}
	},

	computeSkyplotTrack: function(sat, observerGd, minutes, stepSeconds) {
		var now = new Date();
		var points = [];

		var satrec = satellite.twoline2satrec(sat.tle1, sat.tle2);

		for (var t = -minutes * 60; t <= minutes * 60; t += stepSeconds) {
			var time = new Date(now.getTime() + t * 1000);

			var pv = satellite.propagate(satrec, time);
			if (!pv.position) continue;

			var gmst = satellite.gstime(time);
			var ecf = satellite.eciToEcf(pv.position, gmst);
			var look = satellite.ecfToLookAngles(observerGd, ecf);

			var el = satellite.radiansToDegrees(look.elevation);
			if (el <= 0) continue;

			points.push({
				az: satellite.radiansToDegrees(look.azimuth),
				el: el
			});
		}

		return points;
	},

});




