import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MdDialogRef, MD_DIALOG_DATA} from '@angular/material';
import {OrderService} from "../services/order.service";
import {QrScannerComponent} from 'angular2-qrscanner';

@Component({
  selector: 'scan-dialog',
  template: `

    <h2 md-dialog-title>Scan this code with a Bitcoin Wallet App</h2>

    <md-dialog-content>
      <qr-scanner
        [debug]="false"        
      [canvasWidth]="640"    
      [canvasHeight]="480"   
      [mirror]="false"      
      [stopAfterScan]="true" 
      [updateTime]="500"     
      (onRead)="decodedOutput($event)"></qr-scanner>
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
export class ScanDialog implements OnInit{
  paymentRequest = "^234567890ß";
  elementType:  'url' | 'canvas' | 'img' = 'url';

  @ViewChild(QrScannerComponent)
  private qrScannerComponent: QrScannerComponent;

  constructor(
    public dialogRef: MdDialogRef<ScanDialog>,
    @Inject(MD_DIALOG_DATA) public data: any,
    private orderService: OrderService,) {


    // this.paymentRequest = data.message;

  }

  ngOnInit(){

    this.orderService.getPaymentRequest(this.data.orderId)
      .then(paymentRequest =>  this.paymentRequest = paymentRequest);

  }

  decodedOutput(text: string) {
    //TODO remove this logging later
    console.log("Scanned QR-Code: " + text);
    this.orderService.sendPayment(this.data.orderId, text)
      .then(response => {
          console.log(response);
          if (response.status != 200) {
            this.qrScannerComponent.startScanning();
          }else {
            this.dialogRef.close();
          }


        },
        err => {
          console.log(err);
          this.qrScannerComponent.startScanning();
          // this._service.alert("Fehler beim QR-Code lesen", "Bitte probieren Sie es noch einmal.");
        });
  }

}
