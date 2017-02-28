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
var core_1 = require('@angular/core');
var http_1 = require('@angular/http');
require('rxjs/add/operator/toPromise');
var OrderService = (function () {
    function OrderService(http) {
        this.http = http;
        this.ordersUrl = 'api/orders/'; // URL to web api
    }
    OrderService.prototype.getOrder = function (id) {
        var url = this.ordersUrl + "/" + id;
        return this.http
            .get(url)
            .toPromise()
            .then(function (response) {
            var order = response.json();
            console.log(order);
            return order;
        })
            .catch(this.handleError);
    };
    OrderService.prototype.createOrder = function (order) {
        var headers = new http_1.Headers({ 'Content-Type': 'application/json' });
        var options = new http_1.RequestOptions({ headers: headers });
        var body = JSON.stringify(order);
        return this.http.post(this.ordersUrl, body, options).
            toPromise().then(function (response) { return response.headers.get("Location"); });
    };
    OrderService.prototype.getPaymentRequest = function (id) {
        var url = "" + this.ordersUrl + id + "/PaymentRequest";
        return this.http
            .get(url)
            .toPromise()
            .then(function (response) {
            var paymentRequest = response.text();
            console.log(paymentRequest);
            return paymentRequest;
        })
            .catch(this.handleError);
    };
    OrderService.prototype.sendPayment = function (id, payment) {
        var headers = new http_1.Headers({ 'Content-Type': 'text/plain' });
        var options = new http_1.RequestOptions({ headers: headers });
        var url = "" + this.ordersUrl + id + "/Payment";
        return this.http.put(url, payment, options).toPromise();
    };
    OrderService.prototype.sendProductionStart = function (id) {
        var headers = new http_1.Headers({ 'Content-Type': 'text/plain' });
        var options = new http_1.RequestOptions({ headers: headers });
        var url = "" + this.ordersUrl + id + "/productionStart";
        return this.http.put(url, "true", options).toPromise();
    };
    OrderService.prototype.handleError = function (error) {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    };
    OrderService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [http_1.Http])
    ], OrderService);
    return OrderService;
}());
exports.OrderService = OrderService;
//# sourceMappingURL=order.service.js.map