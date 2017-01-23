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
var router_1 = require('@angular/router');
var drink_service_1 = require('../services/drink.service');
var DrinkListComponent = (function () {
    function DrinkListComponent(router, drinkService) {
        this.router = router;
        this.drinkService = drinkService;
    }
    DrinkListComponent.prototype.getDrinks = function () {
        var _this = this;
        this.drinkService
            .getDrinks()
            .then(function (drinks) { return _this.drinks = drinks; })
            .catch(function (error) { return _this.error = error; });
        return;
    };
    DrinkListComponent.prototype.ngOnInit = function () {
        this.getDrinks();
    };
    DrinkListComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'my-drinkList',
            templateUrl: 'drink-list.template.html',
            providers: [drink_service_1.DrinkService]
        }), 
        __metadata('design:paramtypes', [router_1.Router, drink_service_1.DrinkService])
    ], DrinkListComponent);
    return DrinkListComponent;
}());
exports.DrinkListComponent = DrinkListComponent;
//# sourceMappingURL=drink-list.component.js.map