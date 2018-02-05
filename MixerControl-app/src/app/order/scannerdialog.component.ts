import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatSnackBar, MatSnackBarConfig} from '@angular/material';
import {OrderService} from '../services/order.service';
import {QrScannerComponent} from 'angular2-qrscanner';
import {DrinkService} from '../services/drink.service';
import {Drink} from '../models/Drink';
import {Router} from '@angular/router';

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
export class ScanDialogComponent implements OnInit {
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

  decodedOutput(text: string) {
    // TODO remove this logging later
    console.log('Scanned QR-Code: ' + text);
    this.orderService.sendPayment(this.data.order.orderNumber, text)
      .subscribe(avPair => {
        console.log(this.drink);
        console.log(avPair);
        if (this.drink) {
          console.log('dfghjkl');
          if (avPair.coin < this.drink.retailPrice) {
            const config = new MatSnackBarConfig();
            this.snackBar.open('Der Coupon hat mit ' + avPair.coin / 100000 +
              ' IUNO zu wenig Guthaben', '', {duration: 5000});
            this.qrScannerComponent.startScanning();
          } else {
            const config = new MatSnackBarConfig();
            this.snackBar.open('Auf dem Coupon verbleibt ein Guthaben von ' +
              (avPair.coin - this.drink.retailPrice) / 100000 + ' IUNO', '', {duration: 5000});
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
            const snackBarRef = this.snackBar.open('Der Zahlungsauftrag ist im PaymentService nicht vorhanden',
              'Neuer Auftrag', {duration: 5000});
            snackBarRef.onAction().subscribe(() => this.router.navigateByUrl('/drink/' + this.drink.id));
          }else if (error2.status === 422) {
            const config = new MatSnackBarConfig();
            this.snackBar.open('Ungültiger Coupon', 'OK', {duration: 5000});
            this.qrScannerComponent.startScanning();
          } else if (error2.status === 409) {
            const config = new MatSnackBarConfig();
            this.snackBar.open('Dieser Coupon wurde bereits für diesen Auftrag eingescannt.', '',
              {duration: 5000});
            this.qrScannerComponent.startScanning();
          }else {
            this.snackBar.open(error2, '', {duration: 5000});
            this.qrScannerComponent.startScanning();
          }
        }else {
          this.snackBar.open(error2, '', {duration: 5000});
          this.qrScannerComponent.startScanning();
        }
      });


  }

}
