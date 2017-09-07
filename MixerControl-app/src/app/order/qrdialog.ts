import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MdDialogRef, MD_DIALOG_DATA} from '@angular/material';
import {OrderService} from "../services/order.service";


@Component({
  selector: 'qr-dialog',
  template: `

    <h2 md-dialog-title>Scan this code with a Bitcoin Wallet App</h2>

    <md-dialog-content>
      <ngx-qrcode [qrc-element-type]="elementType" [qrc-value] = "paymentRequest"></ngx-qrcode>
    </md-dialog-content>

    <md-dialog-actions >
      <button
        md-raised-button
        color="primary"
        md-dialog-close>Close</button>

    </md-dialog-actions>
  `,
  providers: [OrderService]
})
export class QrDialog implements OnInit{
  paymentRequest = "^234567890ß";
  elementType:  'url' | 'canvas' | 'img' = 'url';

  constructor(
    public dialogRef: MdDialogRef<QrDialog>,
    @Inject(MD_DIALOG_DATA) public data: any,
    private orderService: OrderService,) {


    // this.paymentRequest = data.message;

  }

  ngOnInit(){

    this.orderService.getPaymentRequest(this.data.orderId)
      .then(paymentRequest =>  this.paymentRequest = paymentRequest);

  }

}
