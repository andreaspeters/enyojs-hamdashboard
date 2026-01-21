enyo.kind({
	name: "MyApps.KCMainView",
	kind: "FittableRows",
	authtoken: "",
	config: {
		'server': "http://localhost/~andreas/webseite-aventer/index.php?article_id=128",
		'username': "",
		'password': "",
		'lat': 53.7561,
		'lon': 9.7125,
		'distance': 10000,
	},

	components:[
		{kind: "Panels", name: "productPanel", fit: true, components: [
			{kind: "FittableRows", fit: true, components: [
				{name: "utcTime", classes: "utcTime", allowHtml: true},

				{kind: "FittableColumns", fit: true, components: [
					{content: "Lat: ", classes: "lat-pos label"}, {name: "lat", content: "0.00", classes: "lat-pos"},
					{content: "Lon: ", classes: "lon-pos label"}, {name: "lon", content: "0.00", classes: "lon-pos"},
					{content: "Loc: ", classes: "loc-pos label"}, {name: "loc", content: "JO", classes: "lon-pos"},
        ]},

        {kind: "FittableColumns", style: "padding:10px;", components: [
					{kind: "SolarWeatherView" },
        ]},

				{kind: "FittableColumns", style: "padding:10px;", components: [
					{kind: "SatTrackView"}, // feste Breite für links
					{name: "SatDashboardCarousel",
						kind: "enyo.Panels",
						pattern: "carousel",
						draggable: true,
						wrap: true,
						animate: true,
						index: 0,

						fit: true,
						style: "height: 400px;",
						components: [
						    {kind: "SatWorldView", fit: true},
						    {kind: "SatPolarView", fit: true}
						]
					}
				]},


				{fit: true}

			]}
		]},
	],

	rendered: function() {
		this.inherited(arguments);
		this.getCurrentUTCTime();
		setInterval(enyo.bind(this, this.getCurrentUTCTime), 1000);
		setInterval(enyo.bind(this, this.refresh), 2000);
		this.getGPSPostion();
	},

	getGPSPostion: function() {
		var self = this;
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				function (pos) {
					self.config.lat = pos.coords.latitude;
					self.config.lon = pos.coords.longitude;
				},
				function (err) {
					enyo.log("GPS Error:", err.message);
				},
				{
					enableHighAccuracy: true,
					timeout: 10000,
					maximumAge: 0
				}
			);
		} else {
		    enyo.log("Geolocation not possible");
		}
	},

	refresh: function() {
		this.$.lat.setContent(this.config.lat);
		this.$.lon.setContent(this.config.lon);
		this.$.loc.setContent(this.latLonToMaidenhead());
	},

	latLonToMaidenhead: function() {
		var lat = this.config.lat;
		var lon = this.config.lon;

		// Validierung
		if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
			return null;
		}

		// Offset
		lon += 180;
		lat += 90;

		var A = 'A'.charCodeAt(0);

		// Field (AA–RR)
		var fieldLon = Math.floor(lon / 20);
		var fieldLat = Math.floor(lat / 10);

		// Square (00–99)
		var squareLon = Math.floor((lon % 20) / 2);
		var squareLat = Math.floor(lat % 10);

		// Subsquare (aa–xx)
		var subLon = Math.floor(((lon % 2) / 2) * 24);
		var subLat = Math.floor((lat % 1) * 24);

		return String.fromCharCode(A + fieldLon, A + fieldLat) +
		squareLon.toString() + squareLat.toString() +	String.fromCharCode(A + subLon, A + subLat);
	},

	getCurrentUTCTime: function() {
    const now = new Date();
		this.$.utcTime.setContent(now.toISOString().split('T')[1].split('.')[0] + ' UTC');
	},

});
