import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatSnackBar, MatSnackBarConfig} from '@angular/material';
import {OrderService} from "../services/order.service";
import {QrScannerComponent} from 'angular2-qrscanner';
import {DrinkService} from '../services/drink.service'
import {Drink} from "../models/Drink";
import {Router} from "@angular/router";

@Component({
  selector: 'scan-dialog',
  template: `

    <h2 mat-dialog-title>Den Coupon vor die Kamera halten</h2>

    <mat-dialog-content>
      <qr-scanner
        [debug]="false"        
      [canvasWidth]="640"    
      [canvasHeight]="480"   
      [mirror]="false"      
      [stopAfterScan]="true" 
      [updateTime]="500"     
      (onRead)="decodedOutput($event)"></qr-scanner>
    </mat-dialog-content>

    <mat-dialog-actions >
      <button
        mat-raised-button
        color="primary"
        mat-dialog-close>schließen</button>

    </mat-dialog-actions>
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
    public dialogRef: MatDialogRef<ScanDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private orderService: OrderService,
    private drinkService: DrinkService,
    public snackBar: MatSnackBar,
    private router: Router) {}

  ngOnInit(){

    this.orderService.getPaymentRequest(this.data.order.orderNumber)
      .then(paymentRequest =>  this.paymentRequest = paymentRequest);

    this.drinkService.getDrink(this.data.order.drinkId).subscribe(drink => this.drink = drink);
  }

  decodedOutput(text: string) {
    //TODO remove this logging later
    console.log("Scanned QR-Code: " + text);
    this.orderService.sendPayment(this.data.order.orderNumber, text)
      .then(response => {
          var data = response.json();
          console.log(this.drink);
          console.log(data);
          if(this.drink){
            console.log("dfghjkl");
            if(data.coin < this.drink.retailPrice) {
              let config = new MatSnackBarConfig();
              this.snackBar.open("Der Coupon hat mit " + data.coin / 100000 + " IUNO zu wenig Guthaben", "", {duration: 5000});
              this.qrScannerComponent.startScanning()
            }else{
              let config = new MatSnackBarConfig();
              this.snackBar.open("Auf dem Coupon verbleibt ein Guthaben von " + (data.coin - this.drink.retailPrice)/ 100000 + " IUNO", "", {duration: 5000});
              this.dialogRef.close();
            }
          }else {
            this.dialogRef.close();
          }


        },
        resp => {
          console.log(resp);
          if(resp.status){
            if(resp.status == 404){
              let config = new MatSnackBarConfig();
              let snackBarRef = this.snackBar.open("Der Zahlungsauftrag ist im PaymentService nicht vorhanden","Neuer Auftrag",{duration: 5000});
              snackBarRef.onAction().subscribe(()=> this.router.navigateByUrl('/drink/'+this.drink.id));
            }else if(resp.status == 422){
              let config = new MatSnackBarConfig();
              this.snackBar.open("Ungültiger Coupon","OK",{duration: 5000});
              this.qrScannerComponent.startScanning();
            } else if(resp.status == 409){
              let config = new MatSnackBarConfig();
              this.snackBar.open("Dieser Coupon wurde bereits für diesen Auftrag eingescannt.","",{duration: 5000});
              this.qrScannerComponent.startScanning();
            }else{
              this.snackBar.open(resp,"",{duration: 5000});
              this.qrScannerComponent.startScanning();
            }
          }else{
            this.snackBar.open(resp,"",{duration: 5000});
            this.qrScannerComponent.startScanning();
          }
          // console.log(err);
          // this.snackBar.open(err);

        });
  }

}
