enyo.kind({
	name: "MyApps.ShopProductView",
	kind: "FittableRows",
	fit: true,
	published: {
		index: ""
	},
	param : [],
	components:[
		{kind: "enyo.Scroller", components: [
		{name: "shopMeta", components: [
			{kind: "FittableColumns", components: [
				{kind: "myInput", name: "title", label: "Title:"}
			]},
			{kind: "FittableColumns", components: [
				{kind: "myInput", name: "price", label: "Netto Price:"},
				{kind: "myInput", name: "discount", label: "Discount:"}
			]},
			{kind: "FittableColumns", components: [
				{kind: "myInput", name: "count", label: "Count:"},
				{kind: "myInput", name: "weight", label: "Weight:"}
			]},
			{kind: "FittableColumns", components: [
				{kind: "myInput", name: "dimension_h", label: "Height:"},
				{kind: "myInput", name: "dimension_w", label: "Width:"},
				{kind: "myInput", name: "dimension_d", label: "Deep:"}
			]}
		]},
		{kind: "onyx.InputDecorator", style: "height: 460px", fit: true, components: [
			{kind: "onyx.RichText", name: "description"}
		]},
		{kind: "FittableColumns", components: [ 
			{kind: "ImageCarousel", name: "imagePreview", fit: true, defaultScale:"auto"},
			{kind: "onyx.IconButton", name: "addimage", ontab: "btnAddImage"}
		]},
		{kind: "FittableColumns", components: [
			{kind: "myPopup", title: "Category", name: "category", onSelect: "categoryItemSelected"},
			{kind: "myPopup", title: "Delivery", name: "delivery", onSelect: "deliveryItemSelected"},
			{kind: "myPopup", title: "Tax", name: "tax", onSelect: "taxItemSelected"},
			{kind: "myPopup", title: "Type", name: "type", onSelect: "typItemSelected"},
			{kind: "myPopup", title: "Status", name: "status", onSelect: "statusItemSelected"},
		]},
		{kind: "FittableColumns", components: [
			{kind: "onyx.Button", name: "btnSave", content: "Save", ondown: "btnOnSave", classes: "onyx-affirmative"}
		]}
		]}
	],

	/*
		Function:		rendered
		Description:	This function load the ProductList after the windows is rendered 
		Parameters:		none
		Return:			none
	*/
	rendered: function() {
		this.inherited(arguments);


		// Load Product Information and popup contents 
		this.owner.owner.jsonCall("getDetailOfProduct", {"id":this.index}, enyo.bind(this, "successGetDetailOfProduct"), enyo.bind(this.owner.owner, "errorShop"));

		this.owner.owner.jsonCall("getCategoryList", "", enyo.bind(this, "successGetCategoryList"), enyo.bind(this.owner.owner, "errorShop"));
		this.owner.owner.jsonCall("getTaxList", "", enyo.bind(this, "successGetTaxList"), enyo.bind(this.owner.owner, "errorShop"));
		this.owner.owner.jsonCall("getDeliveryList", "", enyo.bind(this, "successGetDeliveryList"), enyo.bind(this.owner.owner, "errorShop"));
		this.owner.owner.jsonCall("getTypeList", "", enyo.bind(this, "successGetTypeList"), enyo.bind(this.owner.owner, "errorShop"));
		this.owner.owner.jsonCall("getStatusList", "", enyo.bind(this, "successGetStatusList"), enyo.bind(this.owner.owner, "errorShop"));

	},

	/*
		Function:		successGetDetailOfProduct
		Description:	Product Details was loaded successful
		Parameters:		inSender = jsonCall Object, inResponse = JSON Object
		Return:			none
	*/
	successGetDetailOfProduct: function(inSender, inResponse) {
		if (inResponse.method == "getDetailOfProduct") {
			this.product = inResponse.data[0];
			this.$.title.setContent(this.product['name']);
			this.$.price.setContent(this.product['price']);
			this.$.count.setContent(this.product['count']);
			this.$.weight.setContent(this.product['weight']);
			this.$.dimension_h.setContent(this.product['dimension-h']);
			this.$.dimension_w.setContent(this.product['dimension-w']);
			this.$.dimension_d.setContent(this.product['dimension-d']);
			this.$.description.setValue(this.product['description']);

			// Replace the RichText field with the CKEDITOR
			CKEDITOR.replace("app_mainView_kCMainView_shopView_right_productView_description");
			CKEDITOR.config.height = 300;
		}
	},

	successGetCategoryList: function(inSender, inResponse) {
		if (inResponse.method == "getCategoryList") {
			this.$.category.setItems(inResponse.data);
		}
	},

	successGetTaxList: function(inSender, inResponse) {
		if (inResponse.method == "getTaxList") {
			this.$.tax.setItems(inResponse.data);
		}
	},

	successGetDeliveryList: function(inSender, inResponse) {
		if (inResponse.method == "getDeliveryList") {
			this.$.delivery.setItems(inResponse.data);
		}
	},

	successGetTypeList: function(inSender, inResponse) {
		if (inResponse.method == "getTypeList") {
			this.$.type.setItems(inResponse.data);
		}
	},

	successGetStatusList: function(inSender, inResponse) {
		if (inResponse.method == "getStatusList") {
		}
	},


	/*
		Function:		btnOnSave
		Description:	Save the product information
		Parameters:		inSender = Sender Object
						inEvent = Event Object
		Return:
	*/

	btnOnSave: function(inSender, inEvent) {
		console.log("save");
	},




});
