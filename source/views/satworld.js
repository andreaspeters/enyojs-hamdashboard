enyo.kind({
	name: "SatWorldView",
	classes: "sattrack-panel",
	config: {
		'geo':  "source/data/world.geojson",
	},
	map: null,
	timer: null,
	components: [
		{content: "<canvas id=\"worldmap\" width=\"970px\" height=\"400\"></canvas>", classes:"skyplot", allowHtml: true},
	],

	rendered: function() {
		this.loadWorldGeoJSON();
	},

	panelActivated: function() {
		if (!this.timer) {
			console.log("Enable satworld panel");
			this.timer = setInterval(enyo.bind(this, this.drawWorldMapWithSatellites), 10000);
		}
	},

	panelDeactivated: function() {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
	},

	loadWorldGeoJSON: function() {
		var ajax = new enyo.Ajax({url: this.config.geo, handleAs: "json"});
		ajax.response(this, "onWorldGeoJSONLoaded");
		ajax.go();
	},

	onWorldGeoJSONLoaded: function(inSender, inResponse) {
		this.geojson = inResponse;
		if (this.map == null) {
			this.map = this.drawWorldMap("worldmap", 1, 0, 0);
		}
	},


	drawWorldMap: function(name, zoom, offsetX, offsetY) {
		var canvas = document.getElementById(name);
		if (!canvas) return;

		var ctx = canvas.getContext("2d");
		var w = canvas.width;
		var h = canvas.height;

		// Background
		ctx.clearRect(0, 0, w, h);
		ctx.fillStyle = "#000000";
		ctx.fillRect(0, 0, w, h);

		ctx.save();

		this.drawWorldContinents(ctx, w, h, zoom, offsetX, offsetY);

		// Grid
		ctx.strokeStyle = "#333333";
		ctx.lineWidth = 1;

		for (var lon = -180; lon <= 180; lon += 30) {
			var worldX = (lon + 180) / 360 * w;
			var x = worldX * zoom + offsetX;
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, h);
			ctx.stroke();
		}

		for (var lat = -90; lat <= 90; lat += 30) {
			var worldY = (90 - lat) / 180 * h;
			var y = worldY * zoom + offsetY;
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(w, y);
			ctx.stroke();
		}

		// Draw My Pos RED
		var latNow = this.owner.config.lat;
		var lonNow = this.owner.config.lon;

		if (lonNow > 180) lonNow -= 360;
		if (lonNow < -180) lonNow += 360;

		var worldXNow = (lonNow + 180) / 360 * w;
		var worldYNow = (90 - latNow) / 180 * h;

		var xNow = worldXNow * zoom + offsetX;
		var yNow = worldYNow * zoom + offsetY;

		ctx.fillStyle = "#ff0000";
		ctx.beginPath();
		ctx.arc(xNow, yNow, 2, 0, Math.PI * 2);
		ctx.fill();

		ctx.restore();

		return { ctx: ctx, w: w, h: h };
	},


	drawWorldMapWithSatellites: function() {
		var map = this.drawWorldMap("worldmap", 1, 0, 0);
		var ctx = map.ctx;
		var w = map.w;
		var h = map.h;
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

	drawWorldContinents: function(ctx, w, h, zoom, offsetX, offsetY) {
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

				var firstX = lonToX(ring[0][0]) * zoom + offsetX;
				var firstY = latToY(ring[0][1]) * zoom + offsetY;
				ctx.moveTo(firstX, firstY);

				for (var i = 1; i < ring.length; i++) {
					var x = lonToX(ring[i][0]) * zoom + offsetX;
					var y = latToY(ring[i][1]) * zoom + offsetY;
					ctx.lineTo(x, y);
				}

				ctx.closePath();
				ctx.fill();
				ctx.stroke();
			}
		}
	},

});

