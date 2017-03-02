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
var component_service_1 = require('../services/component.service');
var admin_service_1 = require('../services/admin.service');
var AdminComponentComponent = (function () {
    function AdminComponentComponent(componentService, adminService) {
        this.componentService = componentService;
        this.adminService = adminService;
        this.selectedValue = null;
    }
    AdminComponentComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.componentService.getComponents().then(function (components) { return _this.components = components; });
        this.adminService.getPumps().then(function (pumps) { return _this.pumps = pumps; });
    };
    AdminComponentComponent.prototype.ngOnDestroy = function () {
    };
    AdminComponentComponent.prototype.onPumpChange = function ($event, nr) {
        console.log(this.pumps);
        var pump = null;
        for (var i = 0; i < this.pumps.length; i++) {
            if (this.pumps[i].nr == nr) {
                pump = this.pumps[i];
            }
        }
        this.adminService.setPump(nr, pump.component.id);
        // I want to do something here for new selectedDevice, but what I
        // got here is always last selection, not the one I just select.
    };
    AdminComponentComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'my-admin-component',
            templateUrl: 'admin-component.template.html',
            providers: [component_service_1.ComponentService, admin_service_1.AdminService]
        }), 
        __metadata('design:paramtypes', [component_service_1.ComponentService, admin_service_1.AdminService])
    ], AdminComponentComponent);
    return AdminComponentComponent;
}());
exports.AdminComponentComponent = AdminComponentComponent;
//# sourceMappingURL=admin-component.component.js.map