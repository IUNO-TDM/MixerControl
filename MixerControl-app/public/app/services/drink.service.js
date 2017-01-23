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
var DrinkService = (function () {
    function DrinkService(http) {
        this.http = http;
        this.drinksUrl = 'api/drinks'; // URL to web api
    }
    DrinkService.prototype.getDrinks = function () {
        return this.http
            .get(this.drinksUrl)
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(this.handleError);
    };
    DrinkService.prototype.getDrink = function (id) {
        var url = this.drinksUrl + "/" + id;
        return this.http
            .get(url)
            .toPromise()
            .then(function (response) {
            var drink = response.json();
            console.log(drink);
            return drink;
        })
            .catch(this.handleError);
    };
    DrinkService.prototype.handleError = function (error) {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    };
    DrinkService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [http_1.Http])
    ], DrinkService);
    return DrinkService;
}());
exports.DrinkService = DrinkService;
//# sourceMappingURL=drink.service.js.map