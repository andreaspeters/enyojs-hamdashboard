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


	Author:  Andreas Peters
	Company: avEnter UG (haftungsbeschraenkt)
	www:	 https://www.aventer.biz
	EMail:   ap [at] aventer [dot] biz

*/
enyo.kind({
	name: "MyApps.ShopTaxList",
	kind: "FittableRows",
	components:[
		{kind: "enyo.List", name: "taxList", onSetupItem: "setupTaxList", style: "min-width: 600px;", components: [	
			{classes: "item", components: [
				{name: "taxName", classes: "nice-padding", allowHtml: true}
			]}
		]},
	],


	/*
		Function:		rendered
		Description:	This function load the TaxList after the windows is rendered	
		Parameters:		none
		Return:			none
	*/
	rendered: function() {
		this.inherited(arguments);
		this.owner.owner.jsonCall("getTaxList", "", enyo.bind(this, "successGetTaxList"), enyo.bind(this.owner.owner, "errorShop"));
	},

	/*
		Function:		successGetTaxList
		Description:	This function is a event after successfull load of TaxList.
		Parameters:		inSender = jsonCall Object, inResponse = The Response as JSON Object
		Return:			none
	*/
	successGetTaxList: function(inSender, inResponse) {
		if (inResponse.method == "getTaxList") {
			this.tax = inResponse.data;

			this.$.taxList.setCount(this.tax.length);
			this.$.taxList.render();
		}
	},

	/*
		Function:		setupTaxList
		Description:	Event function of TaxList. Will create the TaxList Items.
		Parameters:		inSender and inEvent as Object from TaxList
		Return:			none
	*/
	setupTaxList: function(inSender, inEvent) {
		this.$.taxName.setContent(this.tax[inEvent.index]['name']);

		// BackendUser click on a tax 
		if (inSender.isSelected(inEvent.index)) {
			console.log(this.tax[inEvent.index]['name']);
		}
	

	},
});
