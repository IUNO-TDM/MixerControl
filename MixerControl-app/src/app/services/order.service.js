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
const core_1 = require('@angular/core');
const http_1 = require('@angular/http');
require('rxjs/add/operator/toPromise');
let OrderService = class OrderService {
    constructor(http) {
        this.http = http;
        this.ordersUrl = 'api/orders/'; // URL to web api
    }
    getOrder(id) {
        let url = `${this.ordersUrl}/${id}`;
        return this.http
            .get(url)
            .toPromise()
            .then(response => {
            let order = response.json();
            console.log(order);
            return order;
        })
            .catch(this.handleError);
    }
    createOrder(order) {
        let headers = new http_1.Headers({ 'Content-Type': 'application/json' });
        let options = new http_1.RequestOptions({ headers: headers });
        let body = JSON.stringify(order);
        return this.http.post(this.ordersUrl, body, options).
            toPromise().then(response => response.headers.get("Location"));
    }
    getPaymentRequest(id) {
        let url = `${this.ordersUrl}${id}/PaymentRequest`;
        return this.http
            .get(url)
            .toPromise()
            .then(response => {
            let paymentRequest = response.text();
            console.log(paymentRequest);
            return paymentRequest;
        })
            .catch(this.handleError);
    }
    sendPayment(id, payment) {
        let headers = new http_1.Headers({ 'Content-Type': 'text/plain' });
        let options = new http_1.RequestOptions({ headers: headers });
        let url = `${this.ordersUrl}${id}/Payment`;
        return this.http.put(url, payment, options).toPromise().then(response => {
            return response;
        }).catch(this.handleError);
    }
    sendProductionStart(id) {
        let headers = new http_1.Headers({ 'Content-Type': 'text/plain' });
        let options = new http_1.RequestOptions({ headers: headers });
        let url = `${this.ordersUrl}${id}/productionStart`;
        return this.http.put(url, "true", options).toPromise();
    }
    handleError(error) {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }
};
OrderService = __decorate([
    core_1.Injectable(), 
    __metadata('design:paramtypes', [http_1.Http])
], OrderService);
exports.OrderService = OrderService;
//# sourceMappingURL=order.service.js.map