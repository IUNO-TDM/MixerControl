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
var platform_browser_1 = require('@angular/platform-browser');
var forms_1 = require('@angular/forms');
var http_1 = require('@angular/http');
var payment_component_1 = require('./order/payment.component');
var app_component_1 = require('./app.component');
var app_routing_module_1 = require('./app-routing.module');
var angular2_qrcode_1 = require('angular2-qrcode');
var angular2_qrscanner_1 = require('angular2-qrscanner');
var ng_bootstrap_1 = require('@ng-bootstrap/ng-bootstrap');
var admin_orders_component_1 = require('./admin/admin-orders.component');
var admin_component_component_1 = require('./admin/admin-component.component');
var admin_production_component_1 = require('./admin/admin-production.component');
var admin_status_component_1 = require('./admin/admin-status.component');
var admin_service_component_1 = require('./admin/admin-service.component');
var AppModule = (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        core_1.NgModule({
            imports: [
                platform_browser_1.BrowserModule,
                forms_1.FormsModule,
                app_routing_module_1.AppRoutingModule,
                http_1.HttpModule,
                angular2_qrcode_1.QRCodeModule,
                angular2_qrscanner_1.QrScannerModule,
                ng_bootstrap_1.NgbModule.forRoot()
            ],
            declarations: [
                app_component_1.AppComponent,
                payment_component_1.PaymentComponent,
                app_routing_module_1.routedComponents,
                admin_orders_component_1.AdminOrdersComponent,
                admin_component_component_1.AdminComponentComponent,
                admin_production_component_1.AdminProductionComponent,
                admin_status_component_1.AdminStatusComponent,
                admin_service_component_1.AdminServiceComponent
            ],
            bootstrap: [app_component_1.AppComponent]
        }), 
        __metadata('design:paramtypes', [])
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map