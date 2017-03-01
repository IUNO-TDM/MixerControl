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
var AdminProductionComponent = (function () {
    function AdminProductionComponent(socketService) {
        this.socketService = socketService;
        this.state = "";
        this.queue = new Array();
        this.orders = new Array();
    }
    AdminProductionComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.queueConnection = this.socketService.get("/production", "state", "stateChange")
            .subscribe(function (state) {
            return _this.state = state;
        });
        this.stateConnection = this.socketService.get("/production", "queue", "queueChange")
            .subscribe(function (queue) {
            return _this.queue = queue;
        });
    };
    AdminProductionComponent.prototype.ngOnDestroy = function () {
        this.queueConnection.unsubscribe();
        this.stateConnection.unsubscribe();
    };
    AdminProductionComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'my-admin-production',
            templateUrl: 'admin-production.template.html',
            providers: [socketio_service_1.SocketService]
        }), 
        __metadata('design:paramtypes', [socketio_service_1.SocketService])
    ], AdminProductionComponent);
    return AdminProductionComponent;
}());
exports.AdminProductionComponent = AdminProductionComponent;
//# sourceMappingURL=admin-production.component.js.map