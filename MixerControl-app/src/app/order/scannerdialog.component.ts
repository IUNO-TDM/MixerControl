import {AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatSnackBar, MatSnackBarConfig, MatSnackBarRef} from '@angular/material';
import {OrderService} from '../services/order.service';
import {QrScannerComponent} from 'angular2-qrscanner';
import {DrinkService} from '../services/drink.service';
import {Drink} from '../models/Drink';
import {Router} from '@angular/router';
import {OrderSnackBarComponent} from "./order-snack-bar/order-snack-bar.component";

@Component({
    selector: 'scan-dialog',
    templateUrl: './scannerdialog.component.html',
    providers: [OrderService, DrinkService]
})
export class ScanDialogComponent implements OnInit, AfterViewInit, OnDestroy {
    drink: Drink;
    paymentRequest = '^234567890ß';
    elementType: 'url' | 'canvas' | 'img' = 'url';
    rescanTimer: number;
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
        this.qrScannerComponent.capturedQr.subscribe(result => {
            this.decodedOutput(result);
        });
        this.startScanning();
    }

    ngOnDestroy() {
        this.clearRescanTimer();
        this.stopScanning();
    }


    startScanning() {
        this.qrScannerComponent.startScanning(null);

    }

    stopScanning() {
        this.qrScannerComponent.stopScanning();
    }


    setRescanTimer(timeout: number) {
        this.clearRescanTimer();
        this.rescanTimer = setTimeout(() => {
            this.startScanning();
        }, timeout);
    }

    clearRescanTimer() {
        if (this.rescanTimer) {
            clearTimeout(this.rescanTimer);
            this.rescanTimer = 0;
        }
    }

    createSnackBar(duration: number, message: string, action?: string): MatSnackBarRef<any> {
        const config = new MatSnackBarConfig();
        config.data = {message: message};
        if (action) {
            config.data['action'] = action;
        }
        config.duration = duration;
        return this.snackBar.openFromComponent(OrderSnackBarComponent, config);
    }

    decodedOutput(text: string) {
        // TODO remove this logging later
        console.log('Scanned QR-Code: ' + text);
        this.orderService.sendPayment(this.data.order.orderNumber, text)
            .subscribe(avPair => {
                if (this.drink) {
                    if (avPair.coin === 0) {
                        this.createSnackBar(5000, 'Dieser Coupon wurde bereits verwendet und ist entwertet.\nBitte einen anderen Coupon scannen!');
                        this.setRescanTimer(3000);
                    } else if (avPair.coin < this.drink.retailPrice) {
                        this.createSnackBar(5000, 'Auf dem Coupon waren nur ' + avPair.coin / 100000 + ' IUNO.\nBitte noch einen Coupon scannen!');
                        this.setRescanTimer(3000);
                    } else if ((avPair.coin === this.drink.retailPrice)) {
                        this.createSnackBar(5000, 'Coupon erfolgreich zum Bezahlen genutzt.\nDer Coupon ist nun leer!');
                        this.dialogRef.close();
                    } else {
                        this.createSnackBar(5000, 'Coupon erfolgreich zum Bezahlen genutzt.\nAuf dem Coupon verbleiben '
                            + (avPair.coin - this.drink.retailPrice) / 100000 + ' IUNO!');

                        this.dialogRef.close();
                    }
                } else {
                    this.dialogRef.close();
                }


            }, error2 => {
                console.log(error2);
                if (error2.status) {
                    if (error2.status === 404) {
                        const snackBarRef = this.createSnackBar(20000, 'Der Zahlungsauftrag ist im PaymentService nicht vorhanden', 'Neuer Auftrag');
                        snackBarRef.onAction().subscribe(() => this.router.navigateByUrl('/drink/' + this.drink.id));
                    } else if (error2.status === 422) {
                        this.createSnackBar(5000, 'Ungültiger Coupon');
                        this.setRescanTimer(3000);

                    } else if (error2.status === 409) {
                        this.createSnackBar(5000, 'Dieser Coupon wurde bereits für diesen Auftrag eingescannt');
                        this.setRescanTimer(3000);
                    } else if (error2.message) {
                        this.createSnackBar(5000, error2.message);
                        this.setRescanTimer(3000);
                    }
                } else {
                    const config = new MatSnackBarConfig();
                    config.data = {message: error2};
                    config.duration = 5000;
                    this.snackBar.openFromComponent(OrderSnackBarComponent, config);
                    this.setRescanTimer(3000);
                }
            });


    }

}
