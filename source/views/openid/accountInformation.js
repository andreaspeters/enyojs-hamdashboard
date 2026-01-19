/*
	Author: 	Andreas Peters
	EMail:  	mailbox[@]andreas-peters[dot]net
	Homepage:	www.andreas-peters.net
*/
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
enyo.kind({
	name: "MyApps.OpenIDAccountInformation",
	kind: "FittableRows",
	components:[
		{tag: "h4", content: "Account Information"},
		{tag: "div", name:"account", components: [
			{kind: "myInput", name: "firstname", label: "Firstname"},
			{kind: "myInput", name: "name", label: "Name"},
			{kind: "myInput", name: "email", label: "EMail"},
			{kind: "myInput", name: "street", label: "Street"},
			{kind: "myInput", name: "plz", label: "PLZ"},
			{kind: "myInput", name: "city", label: "City"},
			{kind: "myInput", name: "country", label: "Country"},
			{kind: "myInput", name: "company", label: "Company"}
		]},
		{tag: "br"},
		{kind: "Group", name: "buttonGroup", components: [
			{kind: "onyx.Button", content: "SAVE", name: "save", ontab: "btnSaveOnClick", classes: "onyx-affirmative"},
			{kind: "onyx.Button", content: "CANCEL", nname: "cancel", ontab: "btnCancelOnClick", classes: "onyx-negative"}
		]}
	],

	/*
		Function:		successGetUser
		Description:	Records loading was successfull
		Parameter:		inResponse as JSON Object with the Record List
		Return:			none
	*/
	successGetUser: function(inSender, inResponse) {
		if (inResponse.method == "getUser") {
			this.user = inResponse.data[0];
			this.setUserForm();
		}
	},

	/*
		Function:		setUserForm
		Description:	Fillout the user formular with the user account information
		Parameters:		
		Return:
	*/
	setUserForm: function() {
		this.$.firstname.setContent(this.user.firstname);
		this.$.name.setContent(this.user.name);
		this.$.email.setContent(this.user.email);
		this.$.street.setContent(this.user.street);
		this.$.plz.setContent(this.user.plz);
		this.$.city.setContent(this.user.city);
		this.$.country.setContent(this.user.country);
		this.$.company.setContent(this.user.company);
	},

	rendered: function() {
		this.inherited(arguments);
		this.owner.owner.owner.jsonCall("getUser", "", enyo.bind(this, "successGetUser"), enyo.bind(this.owner.owner.owner, "errorKC"));
	},
	

});
