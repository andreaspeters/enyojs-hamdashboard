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
	name: "MyApps.ShopCategoryList",
	kind: "FittableRows",
	components:[
		{kind: "enyo.List", name: "categoryList", onSetupItem: "setupCategoryList", style: "min-width: 600px;", components: [	
			{classes: "item", components: [
				{name: "categoryName", classes: "nice-padding", allowHtml: true}
			]}
		]},
	],


	/*
		Function:		rendered
		Description:	This function load the CategoryList after the windows is rendered	
		Parameters:		none
		Return:			none
	*/
	rendered: function() {
		this.inherited(arguments);
		this.owner.owner.jsonCall("getCategoryList", "", enyo.bind(this, "successGetCategoryList"), enyo.bind(this.owner.owner, "errorShop"));
	},

	/*
		Function:		successGetCategoryList
		Description:	This function is a event after successfull load of CategoryList.
		Parameters:		inSender = jsonCall Object, inResponse = The Response as JSON Object
		Return:			none
	*/
	successGetCategoryList: function(inSender, inResponse) {
		if (inResponse.method == "getCategoryList") {
			this.category = inResponse.data;

			this.$.categoryList.setCount(this.category.length);
			this.$.categoryList.render();
		}
	},

	/*
		Function:		setupCategoryList
		Description:	Event function of CategoryList. Will create the CategoryList Items.
		Parameters:		inSender and inEvent as Object from CategoryList
		Return:			none
	*/
	setupCategoryList: function(inSender, inEvent) {
		this.$.categoryName.setContent(this.category[inEvent.index]['name']);

		// BackendUser click on a category 
		if (inSender.isSelected(inEvent.index)) {
			console.log(this.category[inEvent.index]['name']);
		}
	

	},
});
