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
const router_1 = require('@angular/router');
require('rxjs/add/operator/switchMap');
const drink_service_1 = require('../services/drink.service');
const user_service_1 = require('../services/user.service');
const order_service_1 = require('../services/order.service');
const socketio_service_1 = require("../services/socketio.service");
let OrderComponent = class OrderComponent {
    constructor(route, router, drinkService, userService, orderService, socketService) {
        this.route = route;
        this.router = router;
        this.drinkService = drinkService;
        this.userService = userService;
        this.orderService = orderService;
        this.socketService = socketService;
        this.showDialog = false;
        this.orderURL = "NULL";
    }
    ngOnInit() {
        this.route.params.subscribe(params => {
            this.orderProgressConnection =
                this.orderProgressConnection =
                    this.socketService.get("/orders", params['id'], "progress")
                        .subscribe(progress => this.progress = progress['progress']);
            this.orderStateConnection =
                this.socketService.get("/orders", params['id'], "state")
                    .subscribe(state => this.orderState = state);
        });
        this.route.params.
            switchMap((params) => this.orderService.getOrder(params['id']))
            .subscribe(order => {
            this.order = order;
            this.drinkService.getDrink(order.drinkId).then(drink => {
                this.drink = drink;
                this.userService.getUser(this.drink.authorId).then(user => this.user = user)
                    .catch(error => this.error = error);
            });
        });
    }
    ngOnDestroy() {
        this.orderProgressConnection.unsubscribe();
        this.orderStateConnection.unsubscribe();
    }
    ProductionStart() {
        this.route.params.
            switchMap((params) => this.orderService.sendProductionStart(params['id']))
            .subscribe(response => console.log(response));
    }
    ShowPaymentModal() {
        this.showDialog = true;
    }
    Home() {
        this.router.navigateByUrl(`/`);
    }
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
exports.OrderComponent = OrderComponent;
//# sourceMappingURL=order.component.js.map