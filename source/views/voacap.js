enyo.kind({
	name: "VoacapView",
	classes: "voacap-panel",
	showing: false,
	config: {
		'api':  "https://www.voacap.com/hf/wheel2.php",
	},
	voaparams: {
		date: "2026-02-03",
		txname: "JI28to",
		txantenna: "v14gd.ant",
		txantenna2: "v14gd.ant",
		txantenna3: "v14gd.ant",
		txantenna4: "v14gd.ant",
		txantenna5: "d60m.ant",
		txantenna6: "d60m.ant",
		txantenna7: "d60m.ant",
		txantenna8: "d60m.ant",
		txantenna9: "d60m.ant",
		txlat: "-1.4100",
		txlon: "5.6320",
		txpower: "1.2000",
		txmode: "13",

		rxname: "JO41wo",
		rxlat: "51.6180",
		rxlon: "9.8438",
		rxantenna: "2elevert.ant",
		rxantenna2: "2elevert.ant",
		rxantenna3: "2elevert.ant",
		rxantenna4: "2elevert.ant",
		rxantenna5: "d60m.ant",
		rxantenna6: "d60m.ant",
		rxantenna7: "d60m.ant",
		rxantenna8: "d60m.ant",
		rxantenna9: "d60m.ant",

		method: "30",
		mintoa: "3.00",
		noise: "153",
		path: "0",
		ssn: "-1",
		es: "0°=3",
		km: "",
		lpmplat: "",
		lpmplon: ""
	},
	voa: null,
	timer: null,
	components: [
		{kind: "enyo.List", name:"voacapList", classes: "voacap-table", onSetupItem: "setupVOACAPList", components: [
			{classes: "row", components: [
				{name: "abandUTC", classes: "col-cel hour item left", allowHtml:true},
				{name: "aband3", classes: "col-cel item left", allowHtml:true},
				{name: "aband5", classes: "col-cel item left", allowHtml:true},
				{name: "aband7", classes: "col-cel item left", allowHtml:true},
				{name: "aband10", classes: "col-cel item left", allowHtml:true},
				{name: "aband14", classes: "col-cel item left", allowHtml:true},
				{name: "aband18", classes: "col-cel item left", allowHtml:true},
				{name: "aband21", classes: "col-cel item left", allowHtml:true},
				{name: "aband24", classes: "col-cel item left", allowHtml:true},
				{name: "aband28", classes: "col-cel item left", allowHtml:true},
				{name: "bbandUTC", classes: "col-cel hour item left", allowHtml:true},
				{name: "bband3", classes: "col-cel item left", allowHtml:true},
				{name: "bband5", classes: "col-cel item left", allowHtml:true},
				{name: "bband7", classes: "col-cel item left", allowHtml:true},
				{name: "bband10", classes: "col-cel item left", allowHtml:true},
				{name: "bband14", classes: "col-cel item left", allowHtml:true},
				{name: "bband18", classes: "col-cel item left", allowHtml:true},
				{name: "bband21", classes: "col-cel item left", allowHtml:true},
				{name: "bband24", classes: "col-cel item left", allowHtml:true},
				{name: "bband28", classes: "col-cel item left", allowHtml:true}
			]}
		]},
	],

	create: function () {
		this.inherited(arguments);
		console.log("VoacapView created");
		const now = new Date();
		this.voaparams.txname = this.owner.owner.config.loc
		this.voaparams.txlat = this.owner.owner.config.lat;
		this.voaparams.txlon = this.owner.owner.config.lon;
		this.voaparams.date = now.toISOString().split('T')[0];

		this.loadVOACAPP();
	},

	loadVOACAPP: function() {
		var ajax = new enyo.Ajax({
			url: this.config.api,
			method: "POST",
			handleAs: "json",
			postBody: enyo.Ajax.objectToQuery(this.voaparams),
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			}
		});
		ajax.response(this, "onVOACAPJSONLoaded");
		ajax.go();
	},

	onVOACAPJSONLoaded: function(inSender, inResponse) {
		this.voa = inResponse;
		this.$.voacapList.setCount(12);
		this.$.voacapList.render();
	},

	setupVOACAPList: function(inSender, inEvent) {
		var bands = ["UTC","3","5","7","10","14","18","21","24","28"];
		if (inEvent.index == 0) {
			for (var i = 1; i < bands.length; i++) {
				var band = bands[i];
				this.$["aband" + band].addClass("voacap-header");
				this.$["bband" + band].addClass("voacap-header");
				this.$["aband" + band].setContent(band);
				this.$["bband" + band].setContent(band);
			}
		}

		if (inEvent.index < 10 ) {
		  this.$.abandUTC.setContent("&nbsp;"+inEvent.index);
		  this.$.bbandUTC.setContent(inEvent.index+12);
		} else {
		  this.$.abandUTC.setContent(inEvent.index);
		  this.$.bbandUTC.setContent(inEvent.index+12);
		}

		this.updateBandCells(0, "aband", inEvent, bands);
		this.updateBandCells(12, "bband", inEvent, bands);
	},

	updateBandCells: function(indexOffset, cellPrefix, inEvent, bands) {
		for (var i = 1; i < bands.length; i++) {
			var band = bands[i];
			var val = this.voa[inEvent.index+indexOffset][band];
			var cell = this.$[cellPrefix + band];
			if (!cell) continue;

      if (inEvent.index != 0) {
				cell.setContent("&nbsp;");
			}

			this.resetCell(cell);

			if (val !== undefined) {
				if (val < 0.3) {
					cell.addClass("red");
				} else if (val < 0.6) {
					cell.addClass("yellow");
				} else {
					cell.addClass("green");
				}
			}
		}
	},

	resetCell: function(ctrl) {
		ctrl.removeClass("green");
		ctrl.removeClass("yellow");
		ctrl.removeClass("red");
	}

});


