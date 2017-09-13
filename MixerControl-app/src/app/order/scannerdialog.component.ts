import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MdDialogRef, MD_DIALOG_DATA, MdSnackBar, MdSnackBarConfig} from '@angular/material';
import {OrderService} from "../services/order.service";
import {QrScannerComponent} from 'angular2-qrscanner';
import {DrinkService} from '../services/drink.service'
import {Drink} from "../models/Drink";

@Component({
  selector: 'scan-dialog',
  template: `

    <h2 md-dialog-title>Den Coupon vor die Kamera halten</h2>

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
        md-dialog-close>schließen</button>

    </md-dialog-actions>
  `,
  providers: [OrderService, DrinkService]
})
export class ScanDialog implements OnInit{
  drink: Drink;
  paymentRequest = "^234567890ß";
  elementType:  'url' | 'canvas' | 'img' = 'url';

  @ViewChild(QrScannerComponent)
  private qrScannerComponent: QrScannerComponent;

  constructor(
    public dialogRef: MdDialogRef<ScanDialog>,
    @Inject(MD_DIALOG_DATA) public data: any,
    private orderService: OrderService,
    private drinkService: DrinkService,
    public snackBar: MdSnackBar) {}

  ngOnInit(){

    this.orderService.getPaymentRequest(this.data.order.orderNumber)
      .then(paymentRequest =>  this.paymentRequest = paymentRequest);

    this.drinkService.getDrink(this.data.order.drinkId).then(drink => this.drink = drink);
  }

  decodedOutput(text: string) {
    //TODO remove this logging later
    console.log("Scanned QR-Code: " + text);
    this.orderService.sendPayment(this.data.order.orderNumber, text)
      .then(response => {
          console.log(response);
          if (response.status != 200) {
            console.log("This should not happen. I cannot believe that this codepath is active");
            this.qrScannerComponent.startScanning();
          }else {
            // this.dialogRef.close();
          }
          var data = response.json();
          if(this.drink && data && data.coin){
            if(data.coin < this.drink.retailPrice) {
              let config = new MdSnackBarConfig();
              this.snackBar.open("Der Coupon hat mit " + data.coin / 100000 + " IUNO zu wenig Guthaben", "Ok", {duration: 5000});
            }else{
              let config = new MdSnackBarConfig();
              this.snackBar.open("Auf dem Coupon verbleibt ein Guthaben von " + (data.coin - this.drink.retailPrice)/ 100000 + " IUNO", "", {duration: 5000});
            }
          }

        },
        resp => {
          console.log(resp);
          if(resp.status){
            if(resp.status == 404){
              let config = new MdSnackBarConfig();
              this.snackBar.open("Der Zahlungsauftrag ist im PaymentService nicht vorhanden","Neuer Auftrag",{duration: 5000});
            }else if(resp.status == 422){
              let config = new MdSnackBarConfig();
              this.snackBar.open("Ungültiger Coupon","OK",{duration: 5000});
              this.qrScannerComponent.startScanning();
            } else if(resp.status == 409){
              let config = new MdSnackBarConfig();
              this.snackBar.open("Dieser Coupon wurde bereits für diesen Auftrag eingescannt.","OK",{duration: 5000});
              this.qrScannerComponent.startScanning();
            }else{
              this.snackBar.open(resp,"OK",{duration: 5000});
              this.qrScannerComponent.startScanning();
            }
          }else{
            this.snackBar.open(resp,"OK",{duration: 5000});
            this.qrScannerComponent.startScanning();
          }
          // console.log(err);
          // this.snackBar.open(err);

        });
  }

}
