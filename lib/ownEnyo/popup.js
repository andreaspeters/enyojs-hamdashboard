enyo.kind({
	name: "myPopup",
	kind: enyo.Control,
	published: {
		title: "",
		onSelect: "",
		setActive: "",
	},
	components:[
		{kind: "onyx.PickerDecorator", name: "popup", onSelect: "itemSelected"},
	],

	create: function() {
    	this.inherited(arguments);
		this.onSelectChanged();
  	},

	/*
		Function:
		Description:
		Parameters:
		Return:
	*/
	onSelectChanged: function() {
		try {
			this.$.popup.setAttribute("onSelect", enyo.bind(this.owner, this.onSelect));
		} catch (e) {
		}
	},

	setItems: function(items) {
		var length = items.length - 1;

		this.$.popup.destroyComponents();
		this.$.popup.createComponents([
				{content: this.title},
				{kind: "onyx.Picker", name: "items"}
			], {owner: this});
		for (var i = 0; i <= length; i++) {
			if (this.setActive == i) {
				var isActive = true;
			} else {
				var isActive = false;
			}
			this.$.items.createComponents([{content: items[i].name, active: isActive}], {owner: this});
		}

		this.$.popup.render();
		this.$.popup.reflow();
	},

	itemSelected: function(inSender, inEvent) {
	
	}
});
