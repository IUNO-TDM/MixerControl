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
var user_service_1 = require('../services/user.service');
var User_1 = require("../models/User");
var DrinkListComponent = (function () {
    function DrinkListComponent(router, drinkService, userService) {
        this.router = router;
        this.drinkService = drinkService;
        this.userService = userService;
        this.drinks = [];
        this.users = [];
    }
    DrinkListComponent.prototype.refreshUsers = function () {
        var _this = this;
        var loadingUser = new User_1.User();
        loadingUser.firstname = "User";
        loadingUser.lastname = "Loading";
        var _loop_1 = function(drink) {
            if (!this_1.users[drink.authorId]) {
                this_1.users[drink.authorId] = loadingUser;
                this_1.userService.getUser(drink.authorId).then(function (user) {
                    _this.users[drink.authorId] = user;
                });
            }
        };
        var this_1 = this;
        for (var _i = 0, _a = this.drinks; _i < _a.length; _i++) {
            var drink = _a[_i];
            _loop_1(drink);
        }
    };
    ;
    DrinkListComponent.prototype.getDrinks = function () {
        var _this = this;
        this.drinkService
            .getDrinks()
            .then(function (drinks) {
            _this.drinks = drinks;
            _this.refreshUsers();
        })
            .catch(function (error) { return _this.error = error; });
        return;
    };
    DrinkListComponent.prototype.getBack = function () {
        this.router.navigateByUrl("/");
    };
    DrinkListComponent.prototype.ngOnInit = function () {
        this.getDrinks();
    };
    DrinkListComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'my-drinkList',
            templateUrl: 'drink-list.template.html',
            providers: [drink_service_1.DrinkService, user_service_1.UserService]
        }), 
        __metadata('design:paramtypes', [router_1.Router, drink_service_1.DrinkService, user_service_1.UserService])
    ], DrinkListComponent);
    return DrinkListComponent;
}());
exports.DrinkListComponent = DrinkListComponent;
//# sourceMappingURL=drink-list.component.js.map