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
var core_1 = require('@angular/core');
var router_1 = require('@angular/router');
var order_service_1 = require('../services/order.service');
var angular2_qrscanner_1 = require('angular2-qrscanner');
var angular2_notifications_1 = require("angular2-notifications");
var PaymentComponent = (function () {
    function PaymentComponent(route, orderService, _service) {
        this.route = route;
        this.orderService = orderService;
        this._service = _service;
        this.options = {
            position: ["bottom", "RIGHT"],
            timeOut: 5000,
            lastOnBottom: true
        };
    }
    PaymentComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.route.params.
            switchMap(function (params) { return _this.orderService.getPaymentRequest(params['id']); })
            .subscribe(function (paymentRequest) {
            _this.paymentRequest = paymentRequest;
        });
    };
    PaymentComponent.prototype.onRead = function (text) {
        var _this = this;
        //TODO remove this logging later
        console.log("Scanned QR-Code: " + text);
        this.route.params.subscribe(function (params) {
            _this.orderService.sendPayment(params['id'], text)
                .then(function (response) {
                if (response.status != 200) {
                    _this.qrScannerComponent.startScanning();
                }
                console.log(response);
            }, function (err) {
                console.log(err);
                _this.qrScannerComponent.startScanning();
                _this._service.alert("Fehler beim QR-Code lesen", "Bitte probieren Sie es noch einmal.");
            });
        });
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
    return PaymentComponent;
}());
exports.PaymentComponent = PaymentComponent;
//# sourceMappingURL=payment.component.js.map