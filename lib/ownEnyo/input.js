enyo.kind({
	name: "myInput",
	kind: enyo.Control,
	published: {
		label: ""
	},
	components:[
		{tag: "label", name:"label", attribute: { for: "input"}, style: "padding-right: 5px;"},
		{kind: "onyx.InputDecorator", components: [
			{kind: "onyx.Input", name: "input"} 
		]}
	],

	create: function() {
    	this.inherited(arguments);
    	this.labelChanged();
  	},

  	labelChanged: function() {
    	this.$.label.setContent(this.label);
  	},

	setContent: function(content) {
		this.$.input.setValue(content);
	}
});
