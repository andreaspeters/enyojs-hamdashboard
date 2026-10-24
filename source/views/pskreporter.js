enyo.kind({
	name: "PSKReporterView",
	classes: "psk-panel",
	config: {
		'mqtt': 'ws://mqtt.pskreporter.info:1885',
		'filter': 'pskr/filter/v2/+/+',
	},
	topic: null,
	map: null,
	connect: false,
	connecting: false,
	timer: null,
	data: [],
	drawnCount: 0,
	redrawReports: false,
	zoom: 1,
	offsetX: 0,
	offsetY: 0,
	components: [
		{content: "PSK Reporter Map", classes: "header", style: "margin-left: 20px;"},
		{content: "<canvas id=\"worldmap-psk\" width=\"970px\" height=\"400\"></canvas>", classes:"skyplot", allowHtml: true},
	],

	rendered: function() {
		if (!this.timer) this.timer = setInterval(enyo.bind(this, this.refresh), 2000);
		this.hasNode().addEventListener("wheel", this.bindSafely(this.wheelHandler));
		this.hasNode().addEventListener("mousedown", this.bindSafely(this.onMouseDown));
		this.hasNode().addEventListener("mousemove", this.bindSafely(this.onMouseMove));
		this.hasNode().addEventListener("mouseup", this.bindSafely(this.onMouseUp));

		this.hasNode().addEventListener('touchstart', this.bindSafely(this.onMouseDown));
	},

	destroy: function() {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
		if (this.client && this.client.end) this.client.end();
		this.inherited(arguments);
	},

	refresh: function() {
		if (this.map == null) {
			this.map = this.owner.$.satWorldView.drawWorldMap("worldmap-psk", this.zoom, this.offsetX, this.offsetY);
			this.drawnCount = 0;
		}

		// Try MQTT/WebSocket on webOS when its browser exposes the WebSocket API.
		if (window.PalmSystem && typeof WebSocket === "undefined") return;

		if (this.owner.config.callsign != "" && !this.connect && !this.connecting) {
			this.getConnectMQTT();
		}

		if (this.redrawReports) {
			this.map = this.owner.$.satWorldView.drawWorldMap("worldmap-psk", this.zoom, this.offsetX, this.offsetY);
			this.drawnCount = 0;
			this.redrawReports = false;
		}

		// Draw each report once; redraw only when the retained data window rolls over.
		for (var i = this.drawnCount; i < this.data.length; i++) {
			var text = this.data[i];
			var r = this.maidenheadToLatLon(text.rl);

			if (r != null) {
				this.drawLine(this.map.ctx, this.owner.config.lat, this.owner.config.lon, r.lat, r.lon, text.rc, this.map.w, this.map.h, this.randomColor(text.rc));
			}
		}
		this.drawnCount = this.data.length;
	},

	getConnectMQTT: function() {
		if (this.client || this.connecting || this.connect || !this.owner.config.callsign) return;
		this.connecting = true;
		var self = this;
		console.log('Try connect MQTT');
		try {
		this.client = mqtt.connect(this.config.mqtt, {
			maxPacketSize: 1024 * 1024,
			maxPacketLength: 1024 * 1024,
			reconnectPeriod: 1000
		});

		this.client.on("message", function (topic, message) {
			try {
				var text = JSON.parse(message.toString());
				if (!text || !text.rl || !text.rc) return;
				self.data.push(text);
				if (self.data.length > 1000) {
					self.data.shift();
					self.redrawReports = true;
				}
			} catch (e) {
				console.error("Invalid PSK Reporter message:", e);
			}
		});

		this.client.on("connect", function() {
			console.log("Connected with PSKReporter MQTT Broker!");
			self.topic = self.config.filter+'/'+self.owner.config.callsign+'/#';
			self.client.subscribe(self.topic, function(err) {
				if (!err) {
					self.connecting = false;
					self.connect = true;
					console.log("Subscribed: "+self.topic);
				} else {
					self.connecting = false;
					console.error("MQTT Error:", err);
				}
			});
		});

		this.client.on("error", function(err) {
			console.error("MQTT Error:", err);
		});
		this.client.on("close", function() {
			self.connect = false;
		});
	} catch (e) {
		this.connecting = false;
		console.error("PSK Reporter connection failed:", e);
	}
	},

	maidenheadToLatLon: function(locator) {
		if (!locator || locator.length < 6) return null;

		locator = locator.trim();

		var A = 'A'.charCodeAt(0);

		var fieldLon = locator.charCodeAt(0) - A;
		var fieldLat = locator.charCodeAt(1) - A;

		var squareLon = parseInt(locator.charAt(2), 10);
		var squareLat = parseInt(locator.charAt(3), 10);

		var subLon = locator.charCodeAt(4) - A;
		var subLat = locator.charCodeAt(5) - A;

		// base position
		var lon = fieldLon * 20;
		var lat = fieldLat * 10;

		lon += squareLon * 2;
		lat += squareLat * 1;

		lon += subLon / 12;
		lat += subLat / 24;

		// Extended Square
		if (locator.length >= 8) {
			var extLon = parseInt(locator.charAt(6), 10);
			var extLat = parseInt(locator.charAt(7), 10);

			lon += extLon * (2 / 10 / 12);   // 2° / 10 / 12
			lat += extLat * (1 / 10 / 24);   // 1° / 10 / 24

			lon += (2 / 10 / 12) / 2;
			lat += (1 / 10 / 24) / 2;
		} else {
			lon += (1 / 12) / 2;
			lat += (1 / 24) / 2;
		}

		lon -= 180;
		lat -= 90;

		return {
			lat: lat,
			lon: lon
		};
	},

	latLonToXY: function(lat, lon, width, height) {
		var x = (lon + 180) * (width / 360);
		var y = (90 - lat) * (height / 180);
		return {x: x, y: y};
	},

	randomColor: function(callsign) {
		if (!callsign) return "#FFFFFF";

		var hash = 0;
		for (var i = 0; i < callsign.length; i++) {
			hash = callsign.charCodeAt(i) + ((hash << 5) - hash);
			hash = hash & hash; // 32bit
		}

		var r = (hash >> 16) & 255;
		var g = (hash >> 8) & 255;
		var b = hash & 255;

		// lighter color
		r = Math.floor((r + 256) / 2);
		g = Math.floor((g + 256) / 2);
		b = Math.floor((b + 256) / 2);

		// to hex
		var color = "#" +
		    ("0" + r.toString(16)).slice(-2) +
		    ("0" + g.toString(16)).slice(-2) +
		    ("0" + b.toString(16)).slice(-2);

		return color;
	},

	drawLine: function(ctx, lat1, lon1, lat2, lon2, call, width, height, color) {
		var steps = 40; // mehr = runder
		ctx.beginPath();

		for (var i = 0; i <= steps; i++) {
			var f = i / steps;

			var A = Math.sin((1 - f) * Math.PI / 2);
			var B = Math.sin(f * Math.PI / 2);

			var x = A * Math.cos(lat1 * Math.PI/180) * Math.cos(lon1 * Math.PI/180) +
			        B * Math.cos(lat2 * Math.PI/180) * Math.cos(lon2 * Math.PI/180);

			var y = A * Math.cos(lat1 * Math.PI/180) * Math.sin(lon1 * Math.PI/180) +
			        B * Math.cos(lat2 * Math.PI/180) * Math.sin(lon2 * Math.PI/180);

			var z = A * Math.sin(lat1 * Math.PI/180) +
			        B * Math.sin(lat2 * Math.PI/180);

			var lat = Math.atan2(z, Math.sqrt(x*x + y*y)) * 180/Math.PI;
			var lon = Math.atan2(y, x) * 180/Math.PI;

			var p = this.latLonToXY(lat, lon, width, height);

			p.x = p.x * this.zoom + this.offsetX;
			p.y = p.y * this.zoom + this.offsetY;

			if (i === 0) ctx.moveTo(p.x, p.y);
			else ctx.lineTo(p.x, p.y);
		}

		ctx.strokeStyle = color;
		ctx.lineWidth = 1;
    ctx.stroke();

		this.drawTextBox(ctx, call, p.x, p.y, 5, 5, color)
	},

	drawTextBox: function(ctx, text, x, y, padding, radius, color) {
		ctx.font = "10px monospace";

		var metrics = ctx.measureText(text);
		var textWidth = metrics.width;
		var textHeight = 10;

		var boxWidth = textWidth + (padding * 2);
		var boxHeight = textHeight + (padding * 2);

		var r = radius;
		var pad = padding;

		ctx.lineWidth = 1;

		// paint box
		ctx.beginPath();
		ctx.moveTo(x + r, y);
		ctx.lineTo(x + boxWidth - r, y);
		ctx.quadraticCurveTo(x + boxWidth, y, x + boxWidth, y + r);
		ctx.lineTo(x + boxWidth, y + boxHeight - r);
		ctx.quadraticCurveTo(x + boxWidth, y + boxHeight, x + boxWidth - r, y + boxHeight);
		ctx.lineTo(x + r, y + boxHeight);
		ctx.quadraticCurveTo(x, y + boxHeight, x, y + boxHeight - r);
		ctx.lineTo(x, y + r);
		ctx.quadraticCurveTo(x, y, x + r, y);
		ctx.closePath();

		// box and border color
		ctx.fillStyle = "white"; // bg color
		ctx.fill();

		ctx.strokeStyle = color;
		ctx.stroke();

		// text
		ctx.fillStyle = this.darkenColor(color, 20);
		ctx.fillText(text, x + pad, y + pad + textHeight * 0.8);
	},

	darkenColor: function(hexColor, amount) {
		// hex to rbg
		var c = hexColor.replace("#", "");
		if (c.length === 3) {
			c = c.split("").map(function(ch){ return ch + ch; }).join("");
		}
		var num = parseInt(c, 16);
		if (isNaN(num)) return hexColor;

		var r = (num >> 16) & 255;
		var g = (num >> 8) & 255;
		var b = num & 255;

		// make it darker
		r = Math.max(0, Math.min(255, Math.floor(r * (1 - amount / 100))));
		g = Math.max(0, Math.min(255, Math.floor(g * (1 - amount / 100))));
		b = Math.max(0, Math.min(255, Math.floor(b * (1 - amount / 100))));

		// back to hex
		var rHex = ("0" + r.toString(16)).slice(-2);
		var gHex = ("0" + g.toString(16)).slice(-2);
		var bHex = ("0" + b.toString(16)).slice(-2);

		return "#" + rHex + gHex + bHex;
	},

	wheelHandler: function(e) {
		e.preventDefault();

		var rect = this.hasNode().getBoundingClientRect();
		var mouseX = e.clientX - rect.left;
		var mouseY = e.clientY - rect.top;

		var oldZoom = this.zoom;

		if (e.deltaY < 0) {
		    this.zoom *= 1.1;
		} else {
		    this.zoom /= 1.1;
		}

		this.offsetX = mouseX - (mouseX - this.offsetX) * (this.zoom / oldZoom);
		this.offsetY = mouseY - (mouseY - this.offsetY) * (this.zoom / oldZoom);

		this.map = this.owner.$.satWorldView.drawWorldMap("worldmap-psk", this.zoom, this.offsetX, this.offsetY);
		this.drawnCount = 0;
		this.redrawReports = false;

		return false;
	},

	onMouseDown: function(e) {
		e.preventDefault();
		// left mouse button
		if (e.button != 1 && e.button != 2) {
			if (this.owner.$.solarWeatherView.$.voacap.showing) {
				var pos = this.getLatLonFromMouse(e);
				this.owner.$.solarWeatherView.$.voacap.voaparams.rxname = this.owner.latLonToMaidenhead(pos.lat, pos.lon);
				this.owner.$.solarWeatherView.$.voacap.voaparams.rxlat = pos.lat;
				this.owner.$.solarWeatherView.$.voacap.voaparams.rxlon = pos.lon;
				this.owner.$.solarWeatherView.$.voacap.loadVOACAPP();
			}
		}
		// middle mouse btn
		if (e.button == 1) {
			this.isDragging = true;
			this.lastMouseX = e.clientX;
			this.lastMouseY = e.clientY;
		}
		// right mouse btn
		if (e.button == 2) {
		}
	},

	onMouseMove: function(e) {
		if (!this.isDragging) return;

		var dx = e.clientX - this.lastMouseX;
		var dy = e.clientY - this.lastMouseY;

		this.lastMouseX = e.clientX;
		this.lastMouseY = e.clientY;

		this.offsetX += dx;
		this.offsetY += dy;

		this.map = this.owner.$.satWorldView.drawWorldMap("worldmap-psk", this.zoom, this.offsetX, this.offsetY);
		this.drawnCount = 0;
		this.redrawReports = false;
	},

	onMouseUp: function(e) {
		if (e.button !== 1) return;
		this.isDragging = false;
	},


	getLatLonFromMouse: function (e) {
		var rect = this.hasNode().getBoundingClientRect();

		var screenX = e.clientX - rect.left;
		var screenY = e.clientY - rect.top;

		var w = this.map.w;
		var h = this.map.h;

		var worldX = (screenX - this.offsetX) / this.zoom;
		var worldY = (screenY - this.offsetY) / this.zoom;

		if (worldX < 0 || worldX > w || worldY < 0 || worldY > h) {
		    return null;
		}

		var lon = (worldX / w) * 360 - 180;
		var lat = 90 - (worldY / h) * 180;

		return {
			lat: lat,
			lon: lon
		};
	}


});


