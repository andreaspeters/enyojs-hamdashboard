enyo.kind({
	name: "MyApps.ShopProductList",
	kind: "FittableRows",
	components:[
		{kind: "enyo.List", name: "productList", onSetupItem: "setupProductList", style: "min-width: 600px;", components: [	
			{classes: "item", components: [
				{name: "productName", classes: "nice-padding", allowHtml: true}
			]}
		]},
	],


	/*
		Function:		rendered
		Description:	This function load the ProductList after the windows is rendered	
		Parameters:		none
		Return:			none
	*/
	rendered: function() {
		this.inherited(arguments);
		this.owner.owner.jsonCall("getProductsList", "", enyo.bind(this, "successGetProductsList"), enyo.bind(this.owner.owner, "errorShop"));
	},

	/*
		Function:		successGetProductList
		Description:	This function is a event after successfull load of ProductList.
		Parameters:		inSender = jsonCall Object, inResponse = The Response as JSON Object
		Return:			none
	*/
	successGetProductsList: function(inSender, inResponse) {
		if (inResponse.method == "getProductsList") {
			this.products = inResponse.data;

			this.$.productList.setCount(this.products.length);
			this.$.productList.render();
		}
	},

	/*
		Function:		setupProductList
		Description:	Event function of ProductList. Will create the ProductList Items.
		Parameters:		inSender and inEvent as Object from ProductList
		Return:			none
	*/
	setupProductList: function(inSender, inEvent) {
		this.$.productName.setContent(this.products[inEvent.index]['name']);

		// BackendUser click on a product 
		if (inSender.isSelected(inEvent.index)) {
			// Destroy the productView Components if it exist
			try {
				this.owner.owner.$.right.$.productView.destroy();
			} catch (e) {
			}
			this.owner.owner.$.right.createComponents([{kind: "MyApps.ShopProductView", name: "productView", index:this.products[inEvent.index]['id']}], {owner: this.owner.owner.$.right});
			this.owner.owner.$.right.render();
			this.owner.owner.$.right.reflow();
		}

	},
});
