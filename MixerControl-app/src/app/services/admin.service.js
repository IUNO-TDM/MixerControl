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
let AdminService = class AdminService {
    constructor(http) {
        this.http = http;
        this.adminUrl = 'api/admin/'; // URL to web api
    }
    resumeProduction() {
        let url = `${this.adminUrl}production/resume`;
        let headers = new http_1.Headers({ 'Content-Type': 'application/json' });
        let options = new http_1.RequestOptions({ headers: headers });
        let body = "";
        return this.http.post(url, body, options).
            toPromise().then(response => response.status);
    }
    pauseProduction() {
        let url = `${this.adminUrl}production/pause`;
        let headers = new http_1.Headers({ 'Content-Type': 'application/json' });
        let options = new http_1.RequestOptions({ headers: headers });
        let body = "";
        return this.http.post(url, body, options).
            toPromise().then(response => response.status);
    }
    startProcessing() {
        let url = `${this.adminUrl}production/startConfirm`;
        let headers = new http_1.Headers({ 'Content-Type': 'application/json' });
        let options = new http_1.RequestOptions({ headers: headers });
        let body = "";
        return this.http.post(url, body, options).
            toPromise().then(response => response.status);
    }
    setServiceMode(active) {
        let url = `${this.adminUrl}pumps/service`;
        let body = "false";
        if (active) {
            body = "true";
        }
        return this.http.post(url, body, null).
            toPromise().then(response => response.status);
    }
    getPumps() {
        let url = `${this.adminUrl}pumps`;
        return this.http
            .get(url)
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }
    setPump(pumpId, componentId) {
        let url = `${this.adminUrl}pumps/${pumpId}`;
        // let headers = new Headers({ 'Content-Type': 'application/json' });
        // let options = new RequestOptions({ headers: headers });
        let body = componentId;
        return this.http.put(url, body, null).
            toPromise().then(response => response.status);
    }
    activatePump(pumpId, activate) {
        let url = `${this.adminUrl}pumps/${pumpId}/active`;
        // let headers = new Headers({ 'Content-Type': 'application/json' });
        // let options = new RequestOptions({ headers: headers });
        let body = activate ? 'true' : 'false';
        return this.http.post(url, body, null).
            toPromise().then(response => response.status);
    }
    getStandardAmounts() {
        let url = `${this.adminUrl}pumps/standardAmount`;
        return this.http
            .get(url)
            .toPromise()
            .then(response => response.json());
    }
    resetComponent(pumpId, amount) {
        let url = `${this.adminUrl}pumps/${pumpId}/amount`;
        let body = amount.toString();
        return this.http.put(url, body, null).toPromise();
    }
    handleError(error) {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }
};
AdminService = __decorate([
    core_1.Injectable(), 
    __metadata('design:paramtypes', [http_1.Http])
], AdminService);
exports.AdminService = AdminService;
//# sourceMappingURL=admin.service.js.map