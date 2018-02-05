/**
 * Created by goergch on 14.02.17.
 */
import {Component, OnInit, ViewChild} from '@angular/core';
import { ActivatedRoute, Params }   from '@angular/router';
import {OrderService} from '../services/order.service';
import {QrScannerComponent} from 'angular2-qrscanner';
// import {NotificationsService} from "angular2-notifications";

@Component({

  moduleId: module.id,
  selector: 'my-payment',
  templateUrl: 'payment.template.html',
  providers: [OrderService]
})

export class PaymentComponent implements OnInit {
  paymentRequest: string;
  elementtype:  'url' | 'canvas' | 'img' = 'url';
  @ViewChild(QrScannerComponent)
  private qrScannerComponent: QrScannerComponent;
    public options = {
        position: ['bottom', 'RIGHT'],
        timeOut: 5000,
        lastOnBottom: true

    };
  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    // private _service: NotificationsService
  ) { }

  ngOnInit(): void{

    this.route.params.
    switchMap((params: Params) => this.orderService.getPaymentRequest(params['id']))
      .subscribe(paymentRequest =>  this.paymentRequest = paymentRequest);

}

  // onRead(text: string) {
  //   // TODO remove this logging later
  //   console.log('Scanned QR-Code: ' + text);
  //   this.route.params.subscribe((params: Params) => {
  //     this.orderService.sendPayment(params['id'], text)
  //         .subscribe(response => {
  //           console.log(response);
  //         },
  //         err => {
  //           console.log(err);
  //           this.qrScannerComponent.startScanning();
  //           // this._service.alert("Fehler beim QR-Code lesen", "Bitte probieren Sie es noch einmal.");
  //         });
  //   });
  // }
}
