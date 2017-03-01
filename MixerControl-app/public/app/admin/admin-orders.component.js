/**
 * Created by goergch on 01.03.17.
 */
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
var socketio_service_1 = require("../services/socketio.service");
var AdminOrdersComponent = (function () {
    function AdminOrdersComponent(socketService) {
        this.socketService = socketService;
        this.states = {};
        this.orders = new Array();
    }
    AdminOrdersComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.addConnection = this.socketService.get("/orders", "allOrders", "add")
            .subscribe(function (order) {
            return _this.orders.push(JSON.parse(order));
        });
        this.stateConnection = this.socketService.get("/orders", "allOrders", "state")
            .subscribe(function (o) {
            return _this.states[o.orderNumber] = o.toState;
        });
    };
    AdminOrdersComponent.prototype.ngOnDestroy = function () {
        this.addConnection.unsubscribe();
    };
    AdminOrdersComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'my-admin-orders',
            templateUrl: 'admin-orders.template.html',
            providers: [socketio_service_1.SocketService]
        }), 
        __metadata('design:paramtypes', [socketio_service_1.SocketService])
    ], AdminOrdersComponent);
    return AdminOrdersComponent;
}());
exports.AdminOrdersComponent = AdminOrdersComponent;
//# sourceMappingURL=admin-orders.component.js.map