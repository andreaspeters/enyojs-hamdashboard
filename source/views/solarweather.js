enyo.kind({
	name: "SolarWeatherView",
	classes: "solar-panel",
	config: {
		'server': "https://www.hamqsl.com/solarxml.php"
	},
	weather: {},
	components: [
		{classes: "goodday", components: [
			{name: "goodday", allowHtml: true},
		]},

		{classes: "content", components: [
			{kind: "enyo.Table", classes: "vhf-table", components: [
				{classes: "header", components: [
					{content: "Item"},
					{content: "Status"},
				]},
				{classes: "row", components: [
					{content: "Aurora", classes: "label"}, {name: "aurora", allowHtml: true},
				]},
				{classes: "row", components: [
					{content: "6m EsEU", classes: "label"}, {name: "vhf6m", allowHtml: true},
				]},
				{classes: "row", components: [
					{content: "4m EsEU", classes: "label"}, {name: "vhf4m", allowHtml: true},
				]},
				{classes: "row", components: [
					{content: "2m EsEU", classes: "label"}, {name: "vhf2meu", allowHtml: true},
				]},
				{classes: "row", components: [
					{content: "2m EsNA", classes: "label"}, {name: "vhf2mna", allowHtml: true},
				]},
			]},
			{kind: "enyo.Table", classes: "hf-table", components: [
				{classes: "header", components: [
					{content: "Band"},
					{content: "Day"},
					{content: "Night"},
				]},
				{classes: "row", components: [
					{content: "80m-40m", classes: "label"}, {name: "day8040", allowHtml: true}, {name: "night8040", allowHtml: true},
				]},
				{classes: "row", components: [
					{content: "30m-20m", classes: "label"}, {name: "day3020", allowHtml: true}, {name: "night3020", allowHtml: true},
				]},
				{classes: "row", components: [
					{content: "17m-15m", classes: "label"}, {name: "day1715", allowHtml: true}, {name: "night1715", allowHtml: true},
				]},
				{classes: "row", components: [
					{content: "12m-10m", classes: "label"}, {name: "day1210", allowHtml: true}, {name: "night1210", allowHtml: true},
				]},
				{classes: "row", components: [
					{content: "GEO Magfield", classes: "label"}, {name: "geomag", allowHtml: true}
				]},
				{classes: "row", components: [
					{content: "Sig Noise Lvl", classes: "label"}, {name: "signalnoise", allowHtml: true}
				]},
				{classes: "row", components: [
					{content: "MUF US Boulder", classes: "label"}, {name: "muf", allowHtml: true}
				]},
			]},
			{kind: "enyo.Table", classes: "misc-table", components: [
				{classes: "row", components: [
					{content: "SolarFlux (SNI)", classes: "label"}, {name: "solarflux", allowHtml: true},
				]},
				{classes: "row", components: [
					{content: "Sunspots (SN)", classes: "label"}, {name: "sunspots", allowHtml: true},
				]},
				{classes: "row", components: [
					{content: "Short Interference", classes: "label"}, {name: "kindex", allowHtml: true},
				]},
				{classes: "row", components: [
					{content: "Middle Interference", classes: "label"}, {name: "aindex", allowHtml: true},
				]},
				{classes: "row", components: [
					{content: "X-Ray", classes: "label"}, {name: "xray", allowHtml: true},
				]},
				{classes: "row", components: [
					{content: "Protonflux", classes: "label"}, {name: "protonflux", allowHtml: true},
				]},
				{classes: "row", components: [
					{content: "Electronflux", classes: "label"}, {name: "electronflux", allowHtml: true},
				]},
			]},
		]},
	],

	rendered: function() {
		this.getData();
		setInterval(enyo.bind(this, this.getData), 60000);
	},

	refresh: function() {
		// VHF
		this.$.aurora.setContent(this.setcolor(this.weather.vhf[0].condition));
		this.$.vhf2meu.setContent(this.setcolor(this.weather.vhf[1].condition));
		this.$.vhf2mna.setContent(this.setcolor(this.weather.vhf[2].condition));
		this.$.vhf6m.setContent(this.setcolor(this.weather.vhf[3].condition));
		this.$.vhf4m.setContent(this.setcolor(this.weather.vhf[4].condition));

		// KW
		this.$.day8040.setContent(this.setcolor(this.weather.bands.day[0].condition));
		this.$.night8040.setContent(this.setcolor(this.weather.bands.night[0].condition));

		this.$.day3020.setContent(this.setcolor(this.weather.bands.day[1].condition));
		this.$.night3020.setContent(this.setcolor(this.weather.bands.night[1].condition));

		this.$.day1715.setContent(this.setcolor(this.weather.bands.day[2].condition));
		this.$.night1715.setContent(this.setcolor(this.weather.bands.night[2].condition));

		this.$.day1210.setContent(this.setcolor(this.weather.bands.day[3].condition));
		this.$.night1210.setContent(this.setcolor(this.weather.bands.night[3].condition));

    this.$.geomag.setContent(this.weather.geomagfield);
    this.$.signalnoise.setContent(this.weather.signalnoise);
    this.$.solarflux.setContent(this.weather.solarflux);
    this.$.sunspots.setContent(this.weather.sunspots);
    this.$.kindex.setContent(this.kIndexToText(this.weather.kindex) + ' (' + this.weather.kindex + ')');
    this.$.aindex.setContent(this.aIndexToText(this.weather.aindex) + ' (' + this.weather.aindex + ')');
    this.$.xray.setContent(this.weather.xray);
    this.$.protonflux.setContent(this.weather.protonflux);
    this.$.electronflux.setContent(this.weather.electronflux);
		this.$.goodday.setContent('Good day for Hamradio? <span style="color:'+this.calculateHamRadioTrafficLight().color + '">' + this.calculateHamRadioTrafficLight().text + '</span>');
	},

	getData: function() {
		var request = new XMLHttpRequest()
		var self = this
		request.open('GET', this.config.server, true);
		request.onreadystatechange = function() {
			if (request.readyState == 4) {
				if (request.responseText) {
					var xmlRequest = request.responseXML.getElementsByTagName("response");
					self.weather = self.parseSolarXML(request.responseText);
					self.refresh();
				}
			}
		}
		request.send();
	},

	parseSolarXML: function(xmlText) {
		var parser = new DOMParser();
		var xml = parser.parseFromString(xmlText, "text/xml");

		function getText(tag) {
			var el = xml.getElementsByTagName(tag)[0];
			return el ? el.textContent.trim() : null;
		}

		var data = {
			updated: getText("updated"),
			solarflux: Number(getText("solarflux")),
			aindex: Number(getText("aindex")),
			kindex: Number(getText("kindex")),
			xray: getText("xray"),
			sunspots: Number(getText("sunspots")),
			heliumline: Number(getText("heliumline")),
			protonflux: Number(getText("protonflux")),
			electronflux: Number(getText("electonflux")),
			aurora: Number(getText("aurora")),
			solarwind: Number(getText("solarwind")),
			magneticfield: Number(getText("magneticfield")),
			geomagfield: getText("geomagfield"),
			signalnoise: getText("signalnoise"),
			muf: getText("muf"),

			bands: {
				day: [],
				night: []
			},

			vhf: []
		};

		// HF band conditions
		var bands = xml.getElementsByTagName("band");
		for (var i = 0; i < bands.length; i++) {
			var band = bands[i];
			var time = band.getAttribute("time");
			if (data.bands[time]) {
				data.bands[time].push({
					band: band.getAttribute("name"),
					condition: band.textContent.trim()
				});
			}
		}

		// VHF conditions
		var ph = xml.getElementsByTagName("phenomenon");
		for (var j = 0; j < ph.length; j++) {
			data.vhf.push({
				name: ph[j].getAttribute("name"),
				location: ph[j].getAttribute("location"),
				condition: ph[j].textContent.trim()
			});
		}

		return data;
	},

	setcolor: function(value) {
		if (value == "Fair") {
			return "<span style=\"color:yellow\">" + value + "</span>";
		}

		if (value == "Good") {
			return "<span style=\"color:#00ff66\">" + value + "</span>";
		}

		if (value == "Poor") {
			return "<span style=\"color:red\">" + value + "</span>";
		}

		if (value == "Band Closed") {
			return "<span style=\"color:red\">" + value + "</span>";
		}

		if (value == "Band Open") {
			return "<span style=\"color:#00ff66\">" + value + "</span>";
		}

		if (value == "MID LAT AUR") {
			return "<span style=\"color:#00ff66\">" + value + "</span>";
		}

		return value;
	},

	kIndexToText: function(k) {
		k = parseInt(k, 10);

		if (k <= 1) return "Quiet";
		if (k === 2) return "Unsettled";
		if (k === 3) return "Active";
		if (k === 4) return "Minor Storm";
		if (k === 5) return "Storm (G1)";
		if (k === 6) return "Strong Storm (G2)";
		if (k === 7) return "Severe Storm (G3)";
		if (k === 8) return "Extreme Storm (G4)";
		return "Extreme Storm (G5)";
	},

	aIndexToText: function(a) {
		a = parseInt(a, 10);

		if (a <= 7) return "Quiet";
		if (a <= 15) return "Unsettled";
		if (a <= 29) return "Active";
		if (a <= 49) return "Minor Storm";
		if (a <= 99) return "Storm";
		return "Severe Storm";
	},

	getXrayClass: function(xray) {
		if (!xray || xray.length === 0) return "A";
		return xray.charAt(0).toUpperCase(); // A, B, C, M, X
	},

	calculateHamRadioTrafficLight: function(data) {
		var solarflux = parseInt(this.weather.solarflux, 10);
		var aindex    = parseInt(this.weather.aindex, 10);
		var kindex    = parseInt(this.weather.kindex, 10);
		var proton    = parseInt(this.weather.protonflux, 10);
		var xrayClass = this.getXrayClass(this.weather.xray);

		// Red
		if (
			xrayClass === "M" || xrayClass === "X" ||
			kindex >= 5 ||
			aindex >= 50 ||
			proton >= 1000
		) {
			return {
				color: "red",
				text: "HF Blackout or severe disturbance"
			};
		}

		// Yellow
		if (
			xrayClass === "C" ||
			kindex >= 3 ||
			aindex >= 20 ||
			solarflux < 120
		) {
			return {
				color: "yellow",
				text: "Unstable HF conditions"
			};
		}

		// Green
		return {
			color: "green",
			text: "Stable HF conditions"
		};
	}
});


