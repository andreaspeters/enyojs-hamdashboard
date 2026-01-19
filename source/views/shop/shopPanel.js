enyo.kind({
	name: "MyApps.ShopPanel",
	kind: "FittableRows",
	fit: true,
	menu: [],
	components:[
		{kind: "enyo.List", name: "menuList", fit: true, onSetupItem: "setupMenuItemList", components: [	
			{classes: "item", components: [
				{name: "menuItemListName", allowHtml: true}
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
		if (this.menu.length == 0) {
			this.menu.push({name: "Products", id: 1});
			this.menu.push({name: "Coupon", id: 2});
			this.menu.push({name: "Order", id: 3});
			this.menu.push({name: "Category", id: 4});
			this.menu.push({name: "Tax", id: 5});

			this.$.menuList.setCount(this.menu.length);
			this.$.menuList.render();
			// API Server ermitteln
			this.owner.config['server'] = this.owner.owner.getAPIFromKind("ShopView");
		}
		this.$.menuList.render();

	},


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
				case 1: 
					this.owner.$.middle.createComponents([{kind: "MyApps.ShopProductList", name: "productList"}], {owner: this.owner.$.middle}); 
					break;
				case 2: 
					this.owner.$.middle.createComponents([{kind: "MyApps.ShopCouponList", name: "couponList"}], {owner: this.owner.$.middle}); 
					break;
				case 4: 
					this.owner.$.middle.createComponents([{kind: "MyApps.ShopCategoryList", name: "categoryList"}], {owner: this.owner.$.middle}); 
					break;
				case 5: 
					this.owner.$.middle.createComponents([{kind: "MyApps.ShopTaxList", name: "taxList"}], {owner: this.owner.$.middle}); 
					break;
			}
			this.owner.$.middle.render();
			this.owner.$.middle.reflow();
		
		}
	},


});
