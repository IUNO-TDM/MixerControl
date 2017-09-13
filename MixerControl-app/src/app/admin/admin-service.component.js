/**
 * Created by goergch on 02.03.17.
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
const core_1 = require('@angular/core');
const socketio_service_1 = require("../services/socketio.service");
const admin_service_1 = require("../services/admin.service");
let AdminServiceComponent = class AdminServiceComponent {
    constructor(socketService, adminService) {
        this.socketService = socketService;
        this.adminService = adminService;
    }
    ;
    ngOnInit() {
        this.pqStateConnection = this.socketService.get("/production", "state", "state")
            .subscribe(state => this.pqState = state);
        this.pcServiceStateConnection = this.socketService.get("/production", "pumpControlService", "pumpControlServiceState")
            .subscribe(state => this.pcServiceState = state);
        this.pcModeConnection = this.socketService.get("/production", "pumpControlMode", "pumpControlMode")
            .subscribe(state => this.pcMode = state);
        this.adminService.getPumps().then(pumps => this.pumps = pumps);
    }
    ;
    ngOnDestroy() {
        this.pcModeConnection.unsubscribe();
        this.pcServiceStateConnection.unsubscribe();
        this.pqStateConnection.unsubscribe();
    }
    ;
    ActivateService() {
        this.adminService.setServiceMode(true);
    }
    DeactivateService() {
        this.adminService.setServiceMode(false);
    }
    SetPump(nr, activate) {
        this.adminService.activatePump(nr, activate);
    }
    SetAllPumps(activate) {
        for (var i = 0; i < this.pumps.length; i++) {
            this.adminService.activatePump(this.pumps[i].nr, activate);
        }
    }
};
AdminServiceComponent = __decorate([
    core_1.Component({
        moduleId: module.id,
        selector: 'my-admin-service',
        templateUrl: 'admin-service.template.html',
        providers: [socketio_service_1.SocketService, admin_service_1.AdminService]
    }), 
    __metadata('design:paramtypes', [socketio_service_1.SocketService, admin_service_1.AdminService])
], AdminServiceComponent);
exports.AdminServiceComponent = AdminServiceComponent;
//# sourceMappingURL=admin-service.component.js.map