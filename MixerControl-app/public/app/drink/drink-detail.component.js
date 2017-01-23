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
require('rxjs/add/operator/switchMap');
var drink_service_1 = require('../services/drink.service');
var user_service_1 = require('../services/user.service');
var DrinkDetailComponent = (function () {
    function DrinkDetailComponent(route, drinkService, userService) {
        this.route = route;
        this.drinkService = drinkService;
        this.userService = userService;
    }
    DrinkDetailComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.route.params.
            switchMap(function (params) { return _this.drinkService.getDrink(params['id']); })
            .subscribe(function (drink) {
            _this.drink = drink;
            _this.userService.getUser(_this.drink.authorId).then(function (user) { return _this.user = user; })
                .catch(function (error) { return _this.error = error; });
        });
    };
    DrinkDetailComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'my-drinkDertail',
            templateUrl: 'drink-detail.template.html',
            providers: [drink_service_1.DrinkService, user_service_1.UserService]
        }), 
        __metadata('design:paramtypes', [router_1.ActivatedRoute, drink_service_1.DrinkService, user_service_1.UserService])
    ], DrinkDetailComponent);
    return DrinkDetailComponent;
}());
exports.DrinkDetailComponent = DrinkDetailComponent;
//# sourceMappingURL=drink-detail.component.js.map