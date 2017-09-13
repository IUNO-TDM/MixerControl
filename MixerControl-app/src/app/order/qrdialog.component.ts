import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MdDialogRef, MD_DIALOG_DATA} from '@angular/material';
import {OrderService} from "../services/order.service";


@Component({
  selector: 'qr-dialog',
  templateUrl: './qrdialog.template.html',
  providers: [OrderService],
  styleUrls: ['./qrdialog.component.css']

})
export class QrDialog implements OnInit{
  errorMessage= "";
  paymentRequest = "";
  elementType:  'url' | 'canvas' | 'img' = 'url';

  constructor(
    public dialogRef: MdDialogRef<QrDialog>,
    @Inject(MD_DIALOG_DATA) public data: any,
    private orderService: OrderService,) {


    // this.paymentRequest = data.message;

  }

  ngOnInit(){

    this.orderService.getPaymentRequest(this.data.order.orderNumber)
      .then(paymentRequest => {
        this.paymentRequest = paymentRequest;
        this.errorMessage = "";
      }).catch(error => {
        this.errorMessage = error;
        this.paymentRequest = "";
    });

  }

}
