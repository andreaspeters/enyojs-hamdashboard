/*
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
/*
	Author: 	Andreas Peters
	EMail:  	mailbox[@]andreas-peters[dot]net
	Homepage:	www.andreas-peters.net
*/
enyo.kind({
	name: "MyApps.AllNoteView",
	kind: "FittableRows",
	classes: "onyx enyo-fit",
	config: {'server': ""},
	components:[
		{kind: "onyx.Toolbar", style:"height: 45px; font-size: 17px;", components: [
			{content: "avEnter - allNote"}
		]},
		{kind: "enyo.Panels", fit: true, arrangerKind: "CollapsingArranger", wrap: false, components: [
			{name: "left", classes: "list", components: [
				{kind: "MyApps.MenuList", name: "menuList", style: "min-width: 250px"}
			]},
			{name: "middle", classes: "list", style: "min-width: 500px;", components: [
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

		// Konfigurations Dialog 
		{kind: "onyx.Popup", name: "settings", floating: true, centered: true, modal: true, scrim:true, components: [
			{tag: "hr", content: "SuSE Manager Login Information"},
			{tag: "p", components: [
				{kind: "onyx.InputDecorator", style: "width:91%", components: [
					{kind: "onyx.Input", name: "server", placeholder: "SuSE Manager Server Name"}
				]}
			]},
			{tag: "p", components: [
				{kind: "onyx.InputDecorator", style: "width:91%", components: [
					{kind: "onyx.Input", name: "username", placeholder: "Your Username"}
				]}
			]},
			{kind: "onyx.InputDecorator", style: "width:91%", components: [
				{kind: "onyx.Input", name: "password", placeholder: "Your Password", type: "password"}
			]},
			{tag: "p", components: [
				{kind: "onyx.Button", name: "btnSaveSettings", ondown: "btnClickSaveSettings", style: "width: 50%;", content: "Save", classes: "onyx-affirmative"},
				{kind: "onyx.Button", name: "btnCancelSettings", style: "width: 40%; margin-left: 15px;", content: "Cancel", classes: "onyx-negative"}
			]}
		]},
	],

	makeAuthToken: function(username, password) {
		var tok = username + ":" + password;
		var hash = base64_encode(tok);
		return "Basic " + hash;
	},

	jsonCall: function(method, param, responseFunction, errorFunction) {
		var ajax = new enyo.Ajax({
		    method: "POST",
			url: this.config['server'],
			postBody: {
				"func": method,
				"param": JSON.stringify(param)
			},
        	headers: { 'Authorization': this.authtoken }
    	});
    	ajax.go();
    
		ajax.response(responseFunction);
    	ajax.error(errorFunction);
	},

	errorAllNote: function(inSender, inResponse) {
		console.log("Error: "+JSON.stringify(inSender)+" "+inResponse);
	},

	/*
		Function:		clickSettings
		Description:	ondown Event of the settings button
		Parameter:		inSender and inEvent Object ob settings button
		Return:			none
	*/
	clickSettings: function(inSender, inEvent) {
		this.$.settings.show();

		this.$.username.setValue(localStorage.getItem('username'));
		this.$.password.setValue(localStorage.getItem('password'));
		this.$.server.setValue(localStorage.getItem('server'));
	},

	/*
		Function:		btsSaveSettings
		Description:	Save the user credentials and serverstring into a html5 localdb
		Parameter:		Button object Sender and Event
		Return:			none
	*/
	btnClickSaveSettings: function(inSender, inEvent) {
		localStorage.setItem("username", this.$.username.value);
		localStorage.setItem("password", this.$.password.value);
		localStorage.setItem("server", this.$.server.value);
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
