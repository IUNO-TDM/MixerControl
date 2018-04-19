import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {OrderService} from '../services/order.service';
import {AdminService} from "../services/admin.service";
import {Balance} from "../models/Balance";


@Component({
    selector: 'qr-dialog',
    templateUrl: './qrdialog.template.html',
    providers: [OrderService, AdminService],
    styleUrls: ['./qrdialog.component.css']

})
export class QrDialogComponent implements OnInit {
    errorMessage = '';
    paymentRequest = '';
    elementType: 'url' | 'canvas' | 'img' = 'url';
    balance: Balance;

    constructor(public dialogRef: MatDialogRef<QrDialogComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any,
                private orderService: OrderService, private adminService: AdminService) {
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


        this.adminService.getWalletBalance().subscribe(balance => {
            this.balance = balance;
        });

    }

}
