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
	name: "MyApps.OpenID",
	kind: "FittableRows",
	classes: "onyx enyo-fit",
	config: {'server': ""},
	components:[
		{kind: "onyx.Toolbar", style:"height: 45px; font-size: 17px;", components: [
			{content: "avEnter - OpenID"}
		]},
		{kind: "enyo.Panels", fit: true, arrangerKind: "CollapsingArranger", wrap: false, components: [
			{name: "left", classes: "list", components: [
				{kind: "MyApps.OpenIDMenuList", name: "menuList", style: "min-width: 250px"}
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
	],

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
