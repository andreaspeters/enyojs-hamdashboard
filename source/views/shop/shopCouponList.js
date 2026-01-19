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
	name: "MyApps.ShopCouponList",
	kind: "FittableRows",
	components:[
		{kind: "enyo.List", name: "couponList", onSetupItem: "setupCouponList", style: "min-width: 600px;", components: [	
			{classes: "item", components: [
				{name: "couponName", classes: "nice-padding", allowHtml: true}
			]}
		]},
	],


	/*
		Function:		rendered
		Description:	This function load the CouponList after the windows is rendered	
		Parameters:		none
		Return:			none
	*/
	rendered: function() {
		this.inherited(arguments);
		this.owner.owner.jsonCall("getCouponsList", "", enyo.bind(this, "successGetCouponsList"), enyo.bind(this.owner.owner, "errorShop"));
	},

	/*
		Function:		successGetCouponsList
		Description:	This function is a event after successfull load of ProductList.
		Parameters:		inSender = jsonCall Object, inResponse = The Response as JSON Object
		Return:			none
	*/
	successGetCouponsList: function(inSender, inResponse) {
		if (inResponse.method == "getCouponsList") {
			this.coupons = inResponse.data;

			this.$.couponList.setCount(this.coupons.length);
			this.$.couponList.render();
		}
	},

	/*
		Function:		setupCouponList
		Description:	Event function of CouponList. Will create the CouponList Items.
		Parameters:		inSender and inEvent as Object from CouponList
		Return:			none
	*/
	setupCouponList: function(inSender, inEvent) {
		this.$.couponName.setContent(this.coupons[inEvent.index]['name']);

		// BackendUser click on a coupon 
		if (inSender.isSelected(inEvent.index)) {
			console.log(this.coupons[inEvent.index]['name']);
		}
	

	},
});
