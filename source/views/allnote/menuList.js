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
	name: "MyApps.MenuList",
	menu: [],
	components:[
		{kind: "enyo.List", name: "menuItemList", fit:true, onSetupItem: "setupMenuItemList", components: [
			{classes: "item", components: [
				{name: "menuItemListName", classes: "nice-padding", allowHtml: true}
			]}
		]}

	],


	/*
		Function:		setupMenuItemList
		Description:	Start on event of the MenuItemList. Create the MenuItems
		Parameter:		Sender and Event Object of MenuItemList
		Return:			none
	*/
	setupMenuItemList: function(inSender, inEvent) {
		this.$.menuItemListName.setContent(this.menu[inEvent.index].name);

		if (inSender.isSelected(inEvent.index)) {		
			// Destroy middle and right panel components to cleanup the windows
			this.owner.$.middle.destroyComponents();
			this.owner.$.right.destroyComponents();

			// Create the kind component against the selected menu item
			switch (this.menu[inEvent.index].id) {
				case "2": 
					this.owner.$.middle.createComponents([{kind: "MyApps.RecordList", name: "recordListPanel"}], {owner: this.owner.$.middle}); 
					break;
			}
			this.owner.$.middle.render();
			this.owner.$.middle.reflow();
		
		}
	},

	/*
		Function:		successGetMenu
		Description:	Create the Menu Items
		Parameter:		inResponse = JSON Object of menu
		Return:			none
	*/
	successGetMenu: function(inResponse) {
		if (inResponse.method == "getMenu") {
			this.menu = inResponse.data;
			this.$.menuItemList.setCount(this.menu.length);
			this.$.menuItemList.render();
		}
	},



	/*
		Function:		rendered
		Description:	This function are always used after the rendering ob the whole application
		Parameter:		none
		Return:			none
	*/
	rendered: function() {
		this.inherited(arguments);
        // API Server ermitteln
        this.owner.config['server'] = this.owner.owner.getAPIFromKind("AllNoteView");
		this.owner.authtoken = this.owner.makeAuthToken(this.owner.owner.config['username'], this.owner.owner.config['password']);

		this.successGetMenu({method: "getMenu", data: [{name: "Open Tasks", id: "1"},{name: "All Records", id: "2"}, {name: "Timesheet", id: "3"}]});
	},
});
