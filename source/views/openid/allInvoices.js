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
	name: "MyApps.OpenIDAllInvoices",
	kind: "FittableRows",
	components:[
		{kind: "List", name: "invoiceList", onSetupItem: "setupInvoiceList", components: [
			{classes: "item", name: "item", components: [
				{name: "invoiceNumber",  allowHtml: true},
				{name: "invoiceDate",  allowHtml: true},
				{name: "invoicePaymentDate",  allowHtml: true},
				{name: "invoiceAmount",  allowHtml: true},
				{name: "invoiceStatus", allowHtml: true},
				{name: "invoicePDF",  allowHtml: true}
			]}
		]}
	],

	/*
		Function:		successGetRecords
		Description:	Records loading was successfull
		Parameter:		inResponse as JSON Object with the Record List
		Return:			none
	*/
	successGetInvoices: function(inSender, inResponse) {
		if (inResponse.method == "getInvoicesOfClient") {
			this.invoice = inResponse.data;
			this.$.invoiceList.setCount(this.invoice.length);
			this.$.invoiceList.render();
		}
	},

	/*
		Function:		setupRecordList
		Description:	Crete the List of records
		Parameter:		inSender and inEvent of the List Object
		Return:			none
	*/
	setupInvoiceList: function(inSender, inEvent) {
		this.$.invoiceNumber.setContent(this.invoice[inEvent.index].invoice_number);
		this.$.invoiceDate.setContent(this.invoice[inEvent.index].invoice_date);
		this.$.invoicePaymentDate.setContent(this.invoice[inEvent.index].payment_date);
		this.$.invoiceAmount.setContent(this.invoice[inEvent.index].invoice_amount);
		this.$.invoicePDF.setContent("<a href=\"/24-0-print-out-invoice.html?getid="+this.invoice[inEvent.index].invoice_id+"\">PDF</a>");

		if (inSender.isSelected(inEvent.index)) {
			this.owner.owner.$.right.destroyComponents();
			this.owner.owner.$.right.createComponents([{tag: "embed", style: "height:100%;width:100%", src: "https://"+this.owner.owner.owner.config['username']+":"+this.owner.owner.owner.config['password']+"@www.aventer.biz/24-0-print-out-invoice.html?getid="+this.invoice[inEvent.index].invoice_id+""}], {owner: this.owner.owner.$.right});
			this.owner.owner.$.right.render();
			this.owner.owner.$.right.reflow();
		}
	},

	rendered: function() {
		this.inherited(arguments);
		this.owner.owner.owner.jsonCall("getInvoicesOfClient", "", enyo.bind(this, "successGetInvoices"), enyo.bind(this.owner.owner.owner, "errorKC"));
	},
	

});
