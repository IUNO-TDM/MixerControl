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
var socketio_service_1 = require("../services/socketio.service");
var OrderComponent = (function () {
    function OrderComponent(route, router, drinkService, userService, orderService, socketService) {
        this.route = route;
        this.router = router;
        this.drinkService = drinkService;
        this.userService = userService;
        this.orderService = orderService;
        this.socketService = socketService;
        this.orderURL = "NULL";
    }
    OrderComponent.prototype.ngOnInit = function () {
        // this.route.params.
        // switchMap((params: Params) => this.socketService.get("/orders", params['id'], "state"))
        //   .subscribe(state => {
        //     this.orderState = state;
        //   });
        // this.route.params.
        // switchMap((params: Params) => this.socketService.get("/orders", params['id'], "progress"))
        //   .subscribe(progress => {
        //     this.progress = progress['progress'];
        //   });
        var _this = this;
        this.route.params.subscribe(function (params) {
            _this.orderProgressConnection =
                _this.orderProgressConnection =
                    _this.socketService.get("/orders", params['id'], "progress")
                        .subscribe(function (progress) { return _this.progress = progress['progress']; });
            _this.orderStateConnection =
                _this.socketService.get("/orders", params['id'], "state")
                    .subscribe(function (state) { return _this.orderState = state; });
        });
        this.route.params.
            switchMap(function (params) { return _this.orderService.getOrder(params['id']); })
            .subscribe(function (order) {
            _this.order = order;
            _this.drinkService.getDrink(order.drinkId).then(function (drink) {
                _this.drink = drink;
                _this.userService.getUser(_this.drink.authorId).then(function (user) { return _this.user = user; })
                    .catch(function (error) { return _this.error = error; });
            });
        });
    };
    OrderComponent.prototype.ngOnDestroy = function () {
        this.orderProgressConnection.unsubscribe();
        this.orderStateConnection.unsubscribe();
    };
    OrderComponent.prototype.ProductionStart = function () {
        var _this = this;
        this.route.params.
            switchMap(function (params) { return _this.orderService.sendProductionStart(params['id']); })
            .subscribe(function (response) { return console.log(response); });
    };
    OrderComponent.prototype.Home = function () {
        this.router.navigateByUrl("/");
    };
    OrderComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'my-order',
            templateUrl: 'order.template.html',
            providers: [drink_service_1.DrinkService, user_service_1.UserService, order_service_1.OrderService, socketio_service_1.SocketService]
        }), 
        __metadata('design:paramtypes', [router_1.ActivatedRoute, router_1.Router, drink_service_1.DrinkService, user_service_1.UserService, order_service_1.OrderService, socketio_service_1.SocketService])
    ], OrderComponent);
    return OrderComponent;
}());
exports.OrderComponent = OrderComponent;
//# sourceMappingURL=order.component.js.map