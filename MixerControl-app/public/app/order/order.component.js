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
var order_service_1 = require('../services/order.service');
var OrderComponent = (function () {
    function OrderComponent(route, router, drinkService, userService, orderService) {
        this.route = route;
        this.router = router;
        this.drinkService = drinkService;
        this.userService = userService;
        this.orderService = orderService;
        this.orderURL = "NULL";
    }
    OrderComponent.prototype.ngOnInit = function () {
        // this.route.params.
        // switchMap((params: Params) => this.drinkService.getDrink(params['id']))
        //   .subscribe(drink => {
        //     this.drink = drink;
        //     this.userService.getUser(this.drink.authorId).then(user => this.user = user)
        //       .catch(error=> this.error = error);
        //   });
    };
    OrderComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'my-order',
            templateUrl: 'order.template.html',
            providers: [drink_service_1.DrinkService, user_service_1.UserService, order_service_1.OrderService]
        }), 
        __metadata('design:paramtypes', [router_1.ActivatedRoute, router_1.Router, drink_service_1.DrinkService, user_service_1.UserService, order_service_1.OrderService])
    ], OrderComponent);
    return OrderComponent;
}());
exports.OrderComponent = OrderComponent;
//# sourceMappingURL=order.component.js.map