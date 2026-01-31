enyo.kind({
	name: "PSKReporterView",
	classes: "psk-panel",
	config: {
		'mqtt': 'wss://mqtt.pskreporter.info:1886',
		'filter': 'pskr/filter/v2/+/+',
	},
	topic: null,
	map: null,
	connect: false,
	components: [
		{content: "<canvas id=\"worldmap-psk\" width=\"970px\" height=\"400\"></canvas>", classes:"skyplot", allowHtml: true},
	],

	rendered: function() {
		setInterval(enyo.bind(this, this.refresh), 2000);
	},

	refresh: function() {
		if (this.owner.config.callsign != null && this.connect == false) {
			this.getConnectMQTT();
		}
		if (this.map == null) {
			this.map = this.owner.$.satWorldView.drawWorldMap("worldmap-psk");
		}
	},

	getConnectMQTT: function() {
		self = this;
  	this.client = mqtt.connect(this.config.mqtt, {
  	  reconnectPeriod: 1000,
  	});

		this.client.on("message", function (topic, message) {
		    var text = JSON.parse(message.toString());
				var s = self.maidenheadToLatLon(text.sl);
				var r = self.maidenheadToLatLon(text.rl);

				console.log(text);

				if (s != null && r != null) {
					self.drawLine(self.map.ctx, s.lat, s.lon, r.lat, r.lon, text.rc, self.map.w, self.map.h, self.randomColor());
				}
		});

  	this.client.on("connect", function() {
  	  console.log("Connected with PSKReporter MQTT Broker!");

  	  self.topic = self.config.filter+'/'+self.owner.config.callsign+'/#';
  	  self.client.subscribe(self.topic, function(err) {
  	    if (!err) {
					self.connect = true;
					console.log("Subscribed: "+self.topic);
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

		// Mindestformat prüfen (AA00aa00)
		var A = 'A'.charCodeAt(0);

		var fieldLon = locator.charCodeAt(0) - A;
		var fieldLat = locator.charCodeAt(1) - A;

		var squareLon = parseInt(locator.charAt(2), 10);
		var squareLat = parseInt(locator.charAt(3), 10);

		var subLon = locator.charCodeAt(4) - A;
		var subLat = locator.charCodeAt(5) - A;

		// Basisposition
		var lon = fieldLon * 20;
		var lat = fieldLat * 10;

		lon += squareLon * 2;
		lat += squareLat * 1;

		lon += subLon / 12;
		lat += subLat / 24;

		// Falls 8-stellig (Extended Square)
		if (locator.length >= 8) {
			var extLon = parseInt(locator.charAt(6), 10);
			var extLat = parseInt(locator.charAt(7), 10);

			lon += extLon * (2 / 10 / 12);   // 2° / 10 / 12
			lat += extLat * (1 / 10 / 24);   // 1° / 10 / 24

			// Mittelpunkt des erweiterten Feldes
			lon += (2 / 10 / 12) / 2;
			lat += (1 / 10 / 24) / 2;
		} else {
			// Mittelpunkt des Subsquare
			lon += (1 / 12) / 2;
			lat += (1 / 24) / 2;
		}

		// Offset zurückrechnen
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
		let color = '#';
		for (let i = 0; i < 6; i++) {
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
		ctx.lineWidth = 1;
		ctx.font = "10px monospace";
		ctx.fillText(call, p.x, p.y);
		ctx.stroke();
	}



});


