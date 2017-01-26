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
var Order_1 = require('../models/Order');
var drink_service_1 = require('../services/drink.service');
var user_service_1 = require('../services/user.service');
var order_service_1 = require('../services/order.service');
var socketio_service_1 = require('../services/socketio.service');
var DrinkDetailComponent = (function () {
    function DrinkDetailComponent(route, router, drinkService, userService, orderService, socketService) {
        this.route = route;
        this.router = router;
        this.drinkService = drinkService;
        this.userService = userService;
        this.orderService = orderService;
        this.socketService = socketService;
        this.orderURL = "NULL";
    }
    DrinkDetailComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.route.params.switchMap(function (params) { return _this.drinkService.getDrink(params['id']); })
            .subscribe(function (drink) {
            _this.drink = drink;
            _this.userService.getUser(_this.drink.authorId).then(function (user) { return _this.user = user; })
                .catch(function (error) { return _this.error = error; });
        });
    };
    DrinkDetailComponent.prototype.onClickMe = function () {
        var _this = this;
        var order = new Order_1.Order();
        order.drinkID = "4711";
        order.customerName = "Detlef Drinker";
        this.orderService.createOrder(order).then(function (orderLocation) {
            _this.orderURL = orderLocation;
            var orderNumber = _this.orderURL.split('/').pop();
            _this.socketService.get("/orders", orderNumber, "state").subscribe(function (state) { return _this.orderState = state.toState; });
            // this.router.navigateByUrl(`/orders/${orderNumber}`);
        });
    };
    DrinkDetailComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'my-drinkDetail',
            templateUrl: 'drink-detail.template.html',
            providers: [drink_service_1.DrinkService, user_service_1.UserService, order_service_1.OrderService, socketio_service_1.SocketService]
        }), 
        __metadata('design:paramtypes', [router_1.ActivatedRoute, router_1.Router, drink_service_1.DrinkService, user_service_1.UserService, order_service_1.OrderService, socketio_service_1.SocketService])
    ], DrinkDetailComponent);
    return DrinkDetailComponent;
}());
exports.DrinkDetailComponent = DrinkDetailComponent;
//# sourceMappingURL=drink-detail.component.js.map