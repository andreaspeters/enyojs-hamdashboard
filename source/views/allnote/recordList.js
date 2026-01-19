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
	name: "MyApps.RecordList",
	kind: "FittableRows",
	components:[
		{kind: "enyo.List", name: "recordList", onSetupItem: "setupRecordList", components: [
			{classes: "item", name: "item", components: [
				{name: "recordListTitle",  allowHtml: true},
				{name: "recordListDate",  allowHtml: true}
			]}
		]}
	],

	/*
		Function:		successGetRecords
		Description:	Records loading was successfull
		Parameter:		inResponse as JSON Object with the Record List
		Return:			none
	*/
	successGetRecords: function(inSender, inResponse) {
		if (inResponse.method == "getRecords") {
			this.records = inResponse.data;
			this.$.recordList.setCount(this.records.length);
			this.$.recordList.render();
		}
	},

	/*
		Function:		setupRecordList
		Description:	Crete the List of records
		Parameter:		inSender and inEvent of the List Object
		Return:			none
	*/
	setupRecordList: function(inSender, inEvent) {
		this.$.recordListTitle.setContent(this.records[inEvent.index].subject);
		if (this.records[inEvent.index].update != "null") {
			this.$.recordListDate.setContent(this.records[inEvent.index].update);
		}

		if (inSender.isSelected(inEvent.index)) {
			this.owner.owner.$.right.destroyComponents();
			this.owner.owner.$.right.createComponents([{kind: "MyApps.RecordEdit", name: "recordEditPanel", index:this.records[inEvent.index].id}], {owner: this.owner.owner.$.right});
			this.owner.owner.$.right.render();
			this.owner.owner.$.right.reflow();
		}
	},

	rendered: function() {
		this.inherited(arguments);
		this.owner.owner.jsonCall("getRecords", "", enyo.bind(this, "successGetRecords"), enyo.bind(this.owner.owner, "errorAllNote"));
	},
	

});
