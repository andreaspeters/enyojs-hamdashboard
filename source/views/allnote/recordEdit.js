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
	name: "MyApps.RecordEdit",
	kind: "enyo.Control",
	classes: "onyx",
	clickX: new Array(),
	clickY: new Array(),
	clickDrag: new Array(),
	published: {
		index: ""
	},
	components:[
		{tag: "div", id:"recordEditMetaTabs", components:[
			{tag: "ul", components: [
				{tag: "li", components:[
					{tag: "a", attributes: { href: "#tabs-1" }, content:"A"}
				]},
				{tag: "li", components:[
					{tag: "a", attributes: { href: "#tabs-2" }, content:"B"}
				]},
				{tag: "li", components:[
					{tag: "a", attributes: { href: "#tabs-3" }, content:"C"}
				]}
			]},
			{tag: "div", id:"tabs-1", components: [
				{kind: "FittableColumns", components: [
					{kind: "myInput", name:"title", label:"Subject:"},
					{components: [
						{tag: "label", attribute: { for: "finish"}, style: "padding-right: 5px;", content: "Finish:"},
						{kind: "onyx.Checkbox", name: "finish", onchange: "onChangeFinish"}
					]}
				]},
				{tag: "p"},
				{kind: "onyx.InputDecorator", name: "content", fit: true}
			]},
			{tag: "div", id:"tabs-2", components: [
				{kind: "enyo.Canvas", name: "pencilEdit", onmousedown:"onMouseDownPencilEdit", onmousemove: "onMouseDownPencilEdit", components: [
				]}
			]},
			{tag: "div", id:"tabs-3", components: [
				{kind: "FittableColumns", components: [
					{kind: "myInput", name: "dateCreate", label: "Create:"}, 
					{kind: "myInput", name: "dateUpdate", label: "Update:"} 
				]},
				{kind: "FittableColumns", components: [
					{kind: "myInput", name: "dateTaskBegin", label: "Task Begin:"}, 
					{kind: "myInput", name: "dateTaskEnd", label: "Task End:"}, 
				]},
				{kind: "FittableColumns", components: [
					{kind: "myPopup", name: "category", title: "Category", onSelect:"selectCategoryItem"},
					{kind: "myPopup", name: "tags", title: "Tags", onSelect:"selectTagsItem"}
				]},
			]}
		]},
		{kind: "onyx.MenuDecorator", components: [
			{kind: "onyx.Button", name:"saveRecord", content: "SAVE", classes: "onyx-affirmative"}
		]}
	],

	selectCategoryItem: function(inSender, inEvent) {
		console.log(inEvent);
	},

	selectTagsItem: function(inSender, inEvent) {
		console.log(inEvent);
	},

	/*
		Function:		successGetRecordById
		Description:	The record was loaded successfull
		Parameters:		inSender = JSON Call object, inReponse = The JSON Repsone
		Return:			none
	*/
	successGetRecordById: function(inSender, inResponse) {
		if (inResponse.method == "getRecordById") {
			this.$.title.setContent(inResponse.data.subject);
			this.$.dateUpdate.setContent(inResponse.data.update);
			this.$.dateTaskBegin.setContent(inResponse.data.scheduledbegin);
			this.$.dateTaskEnd.setContent(inResponse.data.scheduledend);
			 res = inResponse.data.description;
			this.$.content.setContent(res);
		}
		
		CKEDITOR.replace("app_mainView_kCMainView_allNoteView_right_recordEditPanel_content");
		CKEDITOR.config.height = 300;
		CKEDITOR.config.entities = false;
		CKEDITOR.config.htmlEncodeOutput = false;
	},


	rendered: function() {
		this.inherited(arguments);
		$("#recordEditMetaTabs").tabs();
		this.$.category.setItems([{name: "TestA", id: "1"},{name: "TestB", id: "2"}]);
		this.$.tags.setItems([{name: "TestA", id: "1"},{name: "TestB", id: "2"}]);


		this.owner.owner.jsonCall("getRecordById", {id:this.index}, enyo.bind(this, "successGetRecordById"), enyo.bind(this.owner.owner, "errorAllNote"));
	},

	
});
