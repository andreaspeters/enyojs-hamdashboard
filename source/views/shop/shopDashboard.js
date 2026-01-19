enyo.kind({
	name: "MyApps.ShopDashboard",
	kind: "FittableRows",
	fit: true,
	test: "",
	components:[
		{kind: "onyx.Toolbar", style:"height: 45px; font-size: 17px;", components: [
			{content: "Dashboard"}
		]},
		{kind: "onyx.Toolbar", components: [
     			{flex: 1}
		]}
	],
});
