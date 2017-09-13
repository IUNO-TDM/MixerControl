"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
/**
 * Created by goergch on 14.02.17.
 */
const core_1 = require('@angular/core');
const router_1 = require('@angular/router');
const order_service_1 = require('../services/order.service');
const angular2_qrscanner_1 = require('angular2-qrscanner');
const angular2_notifications_1 = require("angular2-notifications");
let PaymentComponent = class PaymentComponent {
    constructor(route, orderService, _service) {
        this.route = route;
        this.orderService = orderService;
        this._service = _service;
        this.options = {
            position: ["bottom", "RIGHT"],
            timeOut: 5000,
            lastOnBottom: true
        };
    }
    ngOnInit() {
        this.route.params.
            switchMap((params) => this.orderService.getPaymentRequest(params['id']))
            .then(paymentRequest => this.paymentRequest = paymentRequest);
    }
    onRead(text) {
        //TODO remove this logging later
        console.log("Scanned QR-Code: " + text);
        this.route.params.subscribe((params) => {
            this.orderService.sendPayment(params['id'], text)
                .then(response => {
                if (response.status != 200) {
                    this.qrScannerComponent.startScanning();
                }
                console.log(response);
            }, err => {
                console.log(err);
                this.qrScannerComponent.startScanning();
                this._service.alert("Fehler beim QR-Code lesen", "Bitte probieren Sie es noch einmal.");
            });
        });
    }
};
__decorate([
    core_1.ViewChild(angular2_qrscanner_1.QrScannerComponent), 
    __metadata('design:type', angular2_qrscanner_1.QrScannerComponent)
], PaymentComponent.prototype, "qrScannerComponent", void 0);
PaymentComponent = __decorate([
    core_1.Component({
        moduleId: module.id,
        selector: 'my-payment',
        templateUrl: 'payment.template.html',
        providers: [order_service_1.OrderService]
    }), 
    __metadata('design:paramtypes', [router_1.ActivatedRoute, order_service_1.OrderService, angular2_notifications_1.NotificationsService])
], PaymentComponent);
exports.PaymentComponent = PaymentComponent;
//# sourceMappingURL=payment.component.js.map