enyo.kind({
	name: "MyApps.ShopView",
	kind: "FittableRows",
	authtoken: "",
	config: {'server': ""},
	style: "background-color: #dddddd;",
	components:[
		{kind: "onyx.Toolbar", style:"height: 45px; font-size: 17px;", components: [
			{content: "avEnter - ShopSystem"}
		]},
		{kind: "enyo.Panels", name: "view",  wrap: false, fit: true, arrangerKind: "CollapsingArranger", components: [
			{name: "left", classes: "list", components:[
				{kind: "MyApps.ShopPanel", name:"shopMenuPanel", fit:true, style: "width: 300px"}
			]},
			{name: "middle", classes: "list", style: "min-width: 610px;", components: [
			]},
			{name: "right", fit: true, components: [
			]}
		]},
		{kind: "onyx.Toolbar", style:"height: 45px; font-size: 17px;", components: [
			{kind: "onyx.TooltipDecorator", components: [
				{kind: "onyx.IconButton", name: "btnBackMainMenu", ondown: "clickBackMainMenu", src:"assets/enyo-icons-master/sample_enyo2_icons/toolbar-icon-reply.png", style: "margin-top: -6px;"},
				{kind: "onyx.Tooltip", content: "Main Menu"}
			]}
		]},
	],

	jsonCall: function(method, param, responseFunction, errorFunction) {
		console.log(this.config['server']);
		var ajax = new enyo.Ajax({
		    method: "POST",
			url: this.config['server'],
			postBody: {
				"func": method,
				"param": JSON.stringify(param)
			}
//        	headers: { 'Authorization': this.onwer.authtoken }
    	});
    	ajax.go();
    
		ajax.response(responseFunction);
    	ajax.error(errorFunction);
	},

	errorShop: function(inSender, inResponse) {
		console.log("Error: "+JSON.stringify(inSender)+" "+inResponse);
	},

	/*
		Function:		clickBackMainMenu
		Description:	Change back to the MembersArea Main Menu
		Parameters:		inSender = Button Object, inEvent = Button Event
		Return:			none
	*/
	clickBackMainMenu: function(inSender, inEvent) {
		console.log(this.owner.$.productPanel);
		this.owner.$.productPanel.setIndex(0);
	}

});
