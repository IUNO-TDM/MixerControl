import {Component, Inject, OnInit, ViewChild, AfterViewInit, OnDestroy} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatSnackBar, MatSnackBarConfig} from '@angular/material';
import {OrderService} from '../services/order.service';
import {QrScannerComponent} from 'angular2-qrscanner';
import {DrinkService} from '../services/drink.service';
import {Drink} from '../models/Drink';
import {Router} from '@angular/router';
import {OrderSnackBarComponent} from "./order-snack-bar/order-snack-bar.component";

@Component({
  selector: 'scan-dialog',
  template: `

    <h2 mat-dialog-title>Den Coupon vor die Kamera halten</h2>

    <mat-dialog-content>
      <div style="width:640px; height:480px; ">
        <qr-scanner
          [debug]="false"
          [canvasWidth]="640"
          [canvasHeight]="480"
          [stopAfterScan]="true"
          [updateTime]="500"></qr-scanner>
      </div>

    </mat-dialog-content>

    <mat-dialog-actions>
      <button
        mat-raised-button
        color="primary"
        mat-dialog-close>schließen
      </button>

    </mat-dialog-actions>
  `,
  providers: [OrderService, DrinkService]
})
export class ScanDialogComponent implements OnInit, AfterViewInit, OnDestroy {
  drink: Drink;
  paymentRequest = '^234567890ß';
  elementType: 'url' | 'canvas' | 'img' = 'url';

  @ViewChild(QrScannerComponent)
  private qrScannerComponent: QrScannerComponent;

  constructor(public dialogRef: MatDialogRef<ScanDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private orderService: OrderService,
              private drinkService: DrinkService,
              public snackBar: MatSnackBar,
              private router: Router) {
  }

  ngOnInit() {

    this.orderService.getPaymentRequest(this.data.order.orderNumber)
      .subscribe(paymentRequest => this.paymentRequest = paymentRequest);

    this.drinkService.getDrink(this.data.order.drinkId).subscribe(drink => this.drink = drink);

  }

  ngAfterViewInit() {
    this.startScanning();
  }

  ngOnDestroy() {
    this.stopScanning();
  }


  startScanning() {

    this.qrScannerComponent.capturedQr.subscribe(result => {
      this.decodedOutput(result);
    });
    this.qrScannerComponent.startScanning(null);

  }

  stopScanning() {
    this.qrScannerComponent.stopScanning();
  }

  decodedOutput(text: string) {
    // TODO remove this logging later
    console.log('Scanned QR-Code: ' + text);
    this.orderService.sendPayment(this.data.order.orderNumber, text)
      .subscribe(avPair => {
        if (this.drink) {
          if (avPair.coin === 0) {
            const config = new MatSnackBarConfig();
            config.data = {message: 'Dieser Coupon wurde bereits verwendet und ist entwertet.\nBitte noch einen Coupon scannen!'};
            config.duration = 5000;
            this.snackBar.openFromComponent(OrderSnackBarComponent, config);
            setTimeout(() => {
              this.startScanning();
            },3000);
          } else if (avPair.coin < this.drink.retailPrice) {
            const config = new MatSnackBarConfig();
            config.data = {message: 'Auf dem Coupon waren nur ' + avPair.coin / 100000 + ' IUNO.\nBitte noch einen Coupon scannen!'};
            config.duration = 5000;
            this.snackBar.openFromComponent(OrderSnackBarComponent, config);
            setTimeout(() => {
              this.startScanning();
            },3000);
          } else if ((avPair.coin === this.drink.retailPrice)) {
            const config = new MatSnackBarConfig();
            config.data = {message: 'Coupon erfolgreich zum Bezahlen genutzt.\nDer Coupon ist nun leer!'};
            config.duration = 5000;
            this.snackBar.openFromComponent(OrderSnackBarComponent, config);
            this.dialogRef.close();
          } else {
            const config = new MatSnackBarConfig();
            config.data = {message: 'Coupon erfolgreich zum Bezahlen genutzt.\nAuf dem Coupon verbleiben '
              + (avPair.coin - this.drink.retailPrice) / 100000 + ' IUNO!'};
            config.duration = 5000;
            this.snackBar.openFromComponent(OrderSnackBarComponent, config);
            this.dialogRef.close();
          }
        } else {
          this.dialogRef.close();
        }


      }, error2 => {
        console.log(error2);
        if (error2.status) {
          if (error2.status === 404) {
            const config = new MatSnackBarConfig();
            config.data = {message: 'Der Zahlungsauftrag ist im PaymentService nicht vorhanden', action: 'Neuer Auftrag'};
            config.duration = 5000;
            const snackBarRef = this.snackBar.openFromComponent(OrderSnackBarComponent, config);
            snackBarRef.onAction().subscribe(() => this.router.navigateByUrl('/drink/' + this.drink.id));
          } else if (error2.status === 422) {
            const config = new MatSnackBarConfig();
            config.data = {message: 'Ungültiger Coupon'};
            config.duration = 5000;
            this.snackBar.openFromComponent(OrderSnackBarComponent, config);
            setTimeout(() => {
              this.startScanning();
            },3000);

          } else if (error2.status === 409) {
            const config = new MatSnackBarConfig();
            config.data = {message: 'Dieser Coupon wurde bereits für diesen Auftrag eingescannt'};
            config.duration = 5000;
            this.snackBar.openFromComponent(OrderSnackBarComponent, config);

            setTimeout(() => {
              this.startScanning();
            },3000);
          } else if (error2.message){
            const config = new MatSnackBarConfig();
            config.data = {message: error2.message};
            config.duration = 5000;
            this.snackBar.openFromComponent(OrderSnackBarComponent, config);

            setTimeout(() => {
              this.startScanning();
            },3000);
          }
        } else {
          const config = new MatSnackBarConfig();
          config.data = {message: error2};
          config.duration = 5000;
          this.snackBar.openFromComponent(OrderSnackBarComponent, config);
          setTimeout(() => {
            this.startScanning();
          },3000);
        }
      });


  }

}
