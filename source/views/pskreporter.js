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
	timer: null,
	data: [],
	components: [
		{content: "PSK Reporter Map", classes: "header", style: "margin-left: 20px;"},
		{content: "<canvas id=\"worldmap-psk\" width=\"970px\" height=\"400\"></canvas>", classes:"skyplot", allowHtml: true},
	],

	rendered: function() {
		this.zoom = 1;
		this.offsetX = 0;
		this.offsetY = 0;
		this.hasNode().addEventListener("wheel", this.bindSafely(this.wheelHandler));
	},

	refresh: function() {
		if (this.owner.config.callsign != "" && this.connect == false) {
			this.getConnectMQTT();
		}

		this.map = this.owner.$.satWorldView.drawWorldMap("worldmap-psk", this.zoom, this.offsetX, this.offsetY);

		// paint old data
		for (var i = 0; i < self.data.length; i++) {
			var text = this.data[i];
			var s = this.maidenheadToLatLon(text.sl);
			var r = this.maidenheadToLatLon(text.rl);

			if (s != null && r != null) {
				this.drawLine(this.map.ctx, s.lat, s.lon, r.lat, r.lon, text.rc, this.map.w, this.map.h, this.randomColor());
			}
		}
	},

	panelActivated: function() {
		if (!this.timer) {
			console.log('Enable psk panel');
			this.timer = setInterval(enyo.bind(this, this.refresh), 2000);
		}
	},

	panelDeactivated: function() {
		if (this.timer) {
			clearInterval(this.timer);
			this.topic = null;
			this.connect = false;
			this.timer = null;
		}
	},

	getConnectMQTT: function() {
		self = this;
		console.log('Try connect MQTT');
  	this.client = mqtt.connect(this.config.mqtt, {
			maxPacketSize: 1024 * 1024,
			maxPacketLength: 1024 * 1024,
  	  reconnectPeriod: 1000,
  	});

		this.client.on("message", function (topic, message) {
			var text = JSON.parse(message.toString());
			self.data.push(text);
		});

  	this.client.on("connect", function() {
  	  console.log("Connected with PSKReporter MQTT Broker!");

  	  self.topic = self.config.filter+'/'+self.owner.config.callsign+'/#';
  	  self.client.subscribe(self.topic, function(err) {
  	    if (!err) {
					self.connect = true;
					console.log("Subscribed: "+self.topic);
				} else {
		  	  console.error("MQTT Error:", err);
				}
  	  });
  	});

  	this.client.on("error", function(err) {
  	  console.error("MQTT Error:", err);
  	});
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

	randomColor: function() {
		const letters = '0123456789ABCDEF';
		var color = '#';
		for (var i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 16)];
		}
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

			if (i === 0) ctx.moveTo(p.x, p.y);
			else ctx.lineTo(p.x, p.y);
		}

		ctx.strokeStyle = color;
		ctx.lineWidth = 1 / this.zoom;
    ctx.stroke();

		this.drawTextBox(ctx, call, p.x + this.offsetX, p.y + this.offsetY, 5, 5, color)
	},

	drawTextBox: function(ctx, text, x, y, padding, radius, color) {
		var zoom = this.zoom;

		var baseFontSize = 10;
		ctx.font = (baseFontSize / zoom) + "px monospace";

		var metrics = ctx.measureText(text);
		var textWidth = metrics.width;
		var textHeight = baseFontSize;

		var boxWidth = textWidth + (padding * 2) / zoom;
		var boxHeight = textHeight + (padding * 2) / zoom;

		var r = radius / zoom;
		var pad = padding / zoom;

		ctx.lineWidth = 1 / zoom;

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

		ctx.strokeStyle = this.darkenColor(color, 20);
		ctx.stroke();

		// text
		ctx.fillStyle = color;
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
		var rHex = r.toString(16).padStart(2, "0");
		var gHex = g.toString(16).padStart(2, "0");
		var bHex = b.toString(16).padStart(2, "0");

		return "#" + rHex + gHex + bHex;
	},

	wheelHandler: function(inEvent) {
  	inEvent.preventDefault();

  	const zoomFactor = 1.1;

  	// Mousposition
  	const rect = this.hasNode().getBoundingClientRect();
  	const mouseX = inEvent.clientX - rect.left;
  	const mouseY = inEvent.clientY - rect.top;

  	const oldZoom = this.zoom;

  	// Zoom in/out
  	if (inEvent.deltaY < 0) {
  	    this.zoom *= zoomFactor;
  	} else {
  	    this.zoom /= zoomFactor;
  	}

  	this.offsetX = mouseX - (mouseX - this.offsetX) * (this.zoom / oldZoom);
  	this.offsetY = mouseY - (mouseY - this.offsetY) * (this.zoom / oldZoom);

		this.owner.$.satWorldView.drawWorldMap("worldmap-psk", this.zoom, this.offsetX, this.offsetY)

  	return false;
	},
});


