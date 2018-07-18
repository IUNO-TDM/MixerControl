import { AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar, MatSnackBarConfig, MatSnackBarRef } from '@angular/material';
import { OrderService } from '../services/order.service';
import { QrScannerComponent } from 'angular2-qrscanner';
import { DrinkService } from '../services/drink.service';
import { Drink } from '../models/Drink';
import { Router } from '@angular/router';
import { OrderSnackBarComponent } from "./order-snack-bar/order-snack-bar.component";
import { LOCALE_ID } from '@angular/core';
import * as stringFormat from 'string-format';

@Component({
    selector: 'scan-dialog',
    templateUrl: './scannerdialog.component.html',
    providers: [OrderService, DrinkService]
})
export class ScanDialogComponent implements OnInit, AfterViewInit, OnDestroy {
    messages = {
        couponAlreadyRedeemed: 'This coupon has already been used and is invalidated.\nPlease scan another coupon!',
        couponRedeemedEntirely: 'Coupon successfully used for payment.\nThe coupon is now empty!',
        couponRedeemedPartly: 'Coupon successfully used for payment.\nOn the coupon remain {}',
        couponBalanceInsufficient: 'On the coupon were only {} IUNO. Please scan another coupon!',
        errorPaymentNotFound: 'The payment order does not exist in the PaymentService.',
        errorPaymentNotFoundButton: 'New Order',
        errorInvalidCoupon: 'Invalid coupon',
        errorCouponAlreadyScanned: 'This coupon has already been scanned for this order.',
    }
    locale: string = "en"
    drink: Drink;
    paymentRequest = '^234567890ß';
    elementType: 'url' | 'canvas' | 'img' = 'url';
    rescanTimer: number;
    @ViewChild(QrScannerComponent)
    private qrScannerComponent: QrScannerComponent;

    constructor(public dialogRef: MatDialogRef<ScanDialogComponent>,
        @Inject(LOCALE_ID) locale: string,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private orderService: OrderService,
        private drinkService: DrinkService,
        public snackBar: MatSnackBar,
        private router: Router) {
        this.locale = locale
        switch (locale) {
            case 'de':
                this.messages.couponAlreadyRedeemed = 'Dieser Coupon wurde bereits verwendet und ist entwertet.\nBitte einen anderen Coupon scannen!'
                this.messages.couponRedeemedEntirely = 'Coupon erfolgreich zum Bezahlen genutzt.\nDer Coupon ist nun leer!'
                this.messages.couponRedeemedPartly = 'Coupon erfolgreich zum Bezahlen genutzt.\nAuf dem Coupon verbleiben {}'
                this.messages.couponBalanceInsufficient = 'Auf dem Coupon waren nur {} IUNO.\nBitte noch einen Coupon scannen!'
                this.messages.errorPaymentNotFound = 'Der Zahlungsauftrag ist im PaymentService nicht vorhanden.'
                this.messages.errorPaymentNotFoundButton = 'Neuer Auftrag'
                this.messages.errorInvalidCoupon = 'Ungültiger Coupon'
                this.messages.errorCouponAlreadyScanned = 'Dieser Coupon wurde bereits für diesen Auftrag eingescannt.'

                break
            default:
                // nothing to do here. Default language 'en' is already set.
                break
        }
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
        config.data = { message: message };
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
                        this.createSnackBar(5000, this.messages.couponAlreadyRedeemed);
                        this.setRescanTimer(3000);
                    } else if (avPair.coin < this.drink.retailPrice) {
                        this.createSnackBar(5000, stringFormat(this.messages.couponBalanceInsufficient, avPair.coin / 100000));
                        this.setRescanTimer(3000);
                    } else if ((avPair.coin === this.drink.retailPrice)) {
                        this.createSnackBar(5000, this.messages.couponRedeemedEntirely);
                        this.dialogRef.close();
                    } else {
                        this.createSnackBar(5000, stringFormat(this.messages.couponRedeemedPartly, (avPair.coin - this.drink.retailPrice) / 100000 + ' IUNO!'));

                        this.dialogRef.close();
                    }
                } else {
                    this.dialogRef.close();
                }


            }, error2 => {
                console.log(error2);
                if (error2.status) {
                    if (error2.status === 404) {
                        const snackBarRef = this.createSnackBar(20000, this.messages.errorPaymentNotFound, this.messages.errorPaymentNotFoundButton);
                        snackBarRef.onAction().subscribe(() => this.router.navigateByUrl('/drink/' + this.drink.id));
                    } else if (error2.status === 422) {
                        this.createSnackBar(5000, this.messages.errorInvalidCoupon);
                        this.setRescanTimer(3000);

                    } else if (error2.status === 409) {
                        this.createSnackBar(5000, this.messages.errorCouponAlreadyScanned);
                        this.setRescanTimer(3000);
                    } else if (error2.message) {
                        this.createSnackBar(5000, error2.message);
                        this.setRescanTimer(3000);
                    }
                } else {
                    const config = new MatSnackBarConfig();
                    config.data = { message: error2 };
                    config.duration = 5000;
                    this.snackBar.openFromComponent(OrderSnackBarComponent, config);
                    this.setRescanTimer(3000);
                }
            });


    }

}
