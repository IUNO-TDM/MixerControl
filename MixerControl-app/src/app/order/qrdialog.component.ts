import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {OrderService} from '../services/order.service';


@Component({
  selector: 'qr-dialog',
  templateUrl: './qrdialog.template.html',
  providers: [OrderService],
  styleUrls: ['./qrdialog.component.css']

})
export class QrDialogComponent implements OnInit {
  errorMessage = '';
  paymentRequest = '';
  elementType: 'url' | 'canvas' | 'img' = 'url';

  constructor(public dialogRef: MatDialogRef<QrDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private orderService: OrderService,) {
  }

  ngOnInit() {

    this.orderService.getPaymentRequest(this.data.order.orderNumber)
      .subscribe(paymentRequest => {
        this.paymentRequest = paymentRequest;
        this.errorMessage = '';
      }, error => {
        this.errorMessage = error;
        this.paymentRequest = '';
      });

  }

}
