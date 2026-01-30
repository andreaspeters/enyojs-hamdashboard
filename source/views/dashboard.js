enyo.kind({
	name: "MyApps.KCMainView",
	kind: "FittableRows",
	authtoken: "",
	config: {
		'server': "http://localhost/~andreas/webseite-aventer/index.php?article_id=128",
		'lat': 53.7561,
		'lon': 9.7125,
		'distance': 10000,
		'gps': true,
	},

	components:[
		{kind: "Panels", name: "productPanel", fit: true, components: [
			{kind: "FittableRows", fit: true, components: [
				{kind: "FittableColumns", fit: true, components: [
					{name: "utcTime", classes: "utcTime", allowHtml: true},
					{kind: "onyx.IconButton", src:"assets/enyo-icons-master/spaz_enyo1_icons/icon-settings.png", classes:"btn-settings", ondown: "btnClickSettings"}
				]},

				{kind: "FittableColumns", fit: true, components: [
					{content: "Lat: ", classes: "lat-pos label"}, {name: "lat", content: "0.00", classes: "lat-pos"},
					{content: "Lon: ", classes: "lon-pos label"}, {name: "lon", content: "0.00", classes: "lon-pos"},
					{content: "Loc: ", classes: "loc-pos label"}, {name: "loc", content: "JO", classes: "lon-pos"},
				]},

				{kind: "FittableColumns", style: "padding:10px;", components: [
					{kind: "SolarWeatherView" },
				]},

				{kind: "enyo.Panels",
					pattern: "carousel",
				 	draggable: true,
				 	wrap: true,
				 	animate: true,
				 	index: 0,
				 	fit: true,
				 	style: "height: 100%;",
				 	components: [
						{kind: "FittableColumns", style: "padding:10px;", components: [
							{kind: "SatTrackView"},
					 		{kind: "SatPolarView"},
						]},
				 		{kind: "SatWorldView"},
				 	]
				},
				{fit: true}
			]}
		]},

		// Configuration Dialog
		{kind: "onyx.Popup", name: "settings", width:"400px", floating: true, centered: true, modal: true, scrim:true, components: [
			{tag: "hr", content: "Settings"},
			{tag: "p", components: [
				{kind: "onyx.InputDecorator", components: [
					{kind: "onyx.Input", name: "latitude", placeholder: "Latitude"}
				]}
			]},
			{kind: "onyx.InputDecorator", components: [
				{kind: "onyx.Input", name: "longitude", placeholder: "Longitude"}
			]},
			{tag: "p", components: [
				{kind: "FittableColumns", components: [
					{kind: "enyo.Checkbox", name: "cbGPS", checked: true, classes:"checkbox"},
					{content: "Enable GPS"}
				]},
				{kind: "onyx.Button", ondown: "btnClickSaveSettings", name: "btnSaveSettings", style: "width: 50%;", content: "Save", classes: "onyx-affirmative"},
				{kind: "onyx.Button", ondown: "btnClickCancelSettings", name: "btnCancelSettings", style: "width: 50%;", content: "Cancel", classes: "onyx-negative", style: "margin-left: 10px;"},
			]}
		]}
	],

	rendered: function() {
		this.inherited(arguments);

		this.config.lat = parseFloat(localStorage.getItem('latitude'));
		this.config.lon = parseFloat(localStorage.getItem('longitude'));
		this.config.gps = localStorage.getItem('gps') === "true" ? true : false;

		this.getCurrentUTCTime();
		setInterval(enyo.bind(this, this.getCurrentUTCTime), 1000);
		setInterval(enyo.bind(this, this.refresh), 2000);

		if (this.config.gps) {
			this.getGPSPostion();
		}
	},

	getGPSPostion: function() {
		var self = this;
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				function (pos) {
					self.config.lat = pos.coords.latitude;
					self.config.lon = pos.coords.longitude;

					localStorage.setItem('latitude', self.config.lat);
					localStorage.setItem('longitude', self.config.lon);
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

		localStorage.setItem('latitude', this.config.lat);
		localStorage.setItem('longitude', this.config.lon);
	},

	latLonToMaidenhead: function() {
		var lat = parseFloat(this.config.lat);
		var lon = parseFloat(this.config.lon);

		if (isNaN(lat) || isNaN(lon)) return null;

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
    var subLon = Math.floor((lon % 2) * 12);
    var subLat = Math.floor((lat % 1) * 24);

		return String.fromCharCode(A + fieldLon, A + fieldLat) +
		squareLon.toString() + squareLat.toString() +	String.fromCharCode(A + subLon, A + subLat);
	},

	getCurrentUTCTime: function() {
		const now = new Date();
		this.$.utcTime.setContent(now.toISOString().split('T')[1].split('.')[0] + ' UTC');
	},

	btnClickSettings: function(inSender, inEvent) {
		this.$.latitude.setContent(this.config.lat);
		this.$.longitude.setContent(this.config.lon);
		this.$.cbGPS.checked = this.config.gps;

		this.$.settings.show();
	},

	btnClickSaveSettings: function(inSender, inEvent) {
		this.config.lat = parseFloat(this.$.latitude.getValue());
		this.config.lon = parseFloat(this.$.longitude.getValue());
		this.config.gps = this.$.cbGPS.checked;

		localStorage.setItem("latitude", this.$.latitude.getValue());
		localStorage.setItem("longitude", this.$.longitude.getValue());
		localStorage.setItem("gps", this.$.cbGPS.checked);

		this.$.lat.setContent(this.config.lat);
		this.$.lon.setContent(this.config.lon);
		this.$.loc.setContent(this.latLonToMaidenhead());

		this.$.settings.hide();
	},

	btnClickCancelSettings: function(inSender, inEvent) {
		this.$.settings.hide();
	}

});
