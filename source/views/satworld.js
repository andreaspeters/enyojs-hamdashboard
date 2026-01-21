enyo.kind({
	name: "SatWorldView",
	classes: "sattrack-panel",
	config: {
		'geo':  "source/data/world.geojson",
	},
	components: [
		{content: "<canvas id=\"worldmap\" width=\"970px\" height=\"400\"></canvas>", classes:"skyplot", allowHtml: true},
	],

	rendered: function() {
		this.loadWorldGeoJSON();
		setInterval(enyo.bind(this, this.drawWorldMapWithSatellites), 2000);
	},

	loadWorldGeoJSON: function() {
		var ajax = new enyo.Ajax({url: this.config.geo, handleAs: "json"});
		ajax.response(this, "onWorldGeoJSONLoaded");
		ajax.go();
	},

	onWorldGeoJSONLoaded: function(inSender, inResponse) {
		this.geojson = inResponse;
	},

	drawWorldMapWithSatellites: function() {
		var canvas = document.getElementById("worldmap");
		if (!canvas) return;

		var ctx = canvas.getContext("2d");
		var w = canvas.width;
		var h = canvas.height;

		// Background
		ctx.clearRect(0, 0, w, h);
		ctx.fillStyle = "#000000";
		ctx.fillRect(0, 0, w, h);

		// Continets
		this.drawWorldContinents(ctx, w, h);

		// Grid
		ctx.strokeStyle = "#333333";
		ctx.lineWidth = 1;

		for (var lon = -180; lon <= 180; lon += 30) {
			var x = (lon + 180) / 360 * w;
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, h);
			ctx.stroke();
		}

		for (var lat = -90; lat <= 90; lat += 30) {
			var y = (90 - lat) / 180 * h;
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(w, y);
			ctx.stroke();
		}

		var now = new Date();

		// Satelitte
		for (var i = 0; i < this.owner.$.satTrackView.tracks.length; i++) {
			var sat = this.owner.$.satTrackView.tracks[i];
			if (!sat.tle1 || !sat.tle2) continue;

			var satrec;
			try {
				satrec = satellite.twoline2satrec(sat.tle1, sat.tle2);
			} catch (e) {
				continue;
			}

			// Tracks with different color
			ctx.strokeStyle = this.owner.$.satTrackView.getSatelliteColorByName(sat.name);
			ctx.lineWidth = 1;
			ctx.beginPath();

			var first = true;
			var lastLon = null;

			for (var t = 0; t <= 2 * 60 * 60; t += 60) { // 2h, 60s Schritte
				var time = new Date(now.getTime() + t * 1000);

				var pv = satellite.propagate(satrec, time);
				if (!pv.position) continue;

				var gmst = satellite.gstime(time);
				var geo = satellite.eciToGeodetic(pv.position, gmst);

				var lat = satellite.radiansToDegrees(geo.latitude);
				var lon = satellite.radiansToDegrees(geo.longitude);

				// Wrap Lon
				if (lon > 180) lon -= 360;
				if (lon < -180) lon += 360;

				var x = (lon + 180) / 360 * w;
				var y = (90 - lat) / 180 * h;

				if (first) {
					ctx.moveTo(x, y);
					first = false;
				} else {
					if (lastLon !== null && Math.abs(lon - lastLon) > 180) {
						ctx.stroke();
						ctx.beginPath();
						ctx.moveTo(x, y);
					} else {
						ctx.lineTo(x, y);
					}
				}

				lastLon = lon;
			}
			ctx.stroke();

			// Satelitte WHITE
			var pvNow = satellite.propagate(satrec, now);
			if (!pvNow.position) continue;

			var gmstNow = satellite.gstime(now);
			var geoNow = satellite.eciToGeodetic(pvNow.position, gmstNow);

			var latNow = satellite.radiansToDegrees(geoNow.latitude);
			var lonNow = satellite.radiansToDegrees(geoNow.longitude);

			if (lonNow > 180) lonNow -= 360;
			if (lonNow < -180) lonNow += 360;

			var xNow = (lonNow + 180) / 360 * w;
			var yNow = (90 - latNow) / 180 * h;

			ctx.fillStyle = "#ffffff";
			ctx.beginPath();
			ctx.arc(xNow, yNow, 3, 0, Math.PI * 2);
			ctx.fill();

			ctx.font = "10px monospace";
			ctx.fillText(sat.name, xNow + 4, yNow);
		}
	},

	drawWorldContinents: function(ctx, w, h) {
		if (!this.geojson || !this.geojson.features) return;

		function lonToX(lon) {
			return (lon + 180) / 360 * w;
		}

		function latToY(lat) {
			return (90 - lat) / 180 * h;
		}

		ctx.fillStyle = "#1e1e1e";
		ctx.strokeStyle = "#444444";
		ctx.lineWidth = 0.5;

		for (var f = 0; f < this.geojson.features.length; f++) {
			var feature = this.geojson.features[f];
			var geom = feature.geometry;

			if (!geom) continue;

			if (geom.type === "Polygon") {
				drawPolygon(geom.coordinates);
			}

			if (geom.type === "MultiPolygon") {
				for (var p = 0; p < geom.coordinates.length; p++) {
					drawPolygon(geom.coordinates[p]);
				}
			}
		}

		function drawPolygon(rings) {
			for (var r = 0; r < rings.length; r++) {
				var ring = rings[r];
				if (ring.length < 2) continue;

				ctx.beginPath();
				ctx.moveTo(
					lonToX(ring[0][0]),
					latToY(ring[0][1])
				);

				for (var i = 1; i < ring.length; i++) {
					ctx.lineTo(
						lonToX(ring[i][0]),
						latToY(ring[i][1])
					);
				}

				ctx.closePath();
				ctx.fill();
				ctx.stroke();
			}
		}
	},

});

