import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {PaymentComponent} from './order/payment.component';

import {AppComponent} from './app.component';
import {AppRoutingModule, routedComponents} from './app-routing.module';
import {QRCodeModule} from 'angular2-qrcode';
import {QrScannerModule} from 'angular2-qrscanner';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import {AdminOrdersComponent} from './admin/admin-orders.component';
import {AdminComponentComponent} from './admin/admin-component.component';
import {AdminProductionComponent} from './admin/admin-production.component';
import {AdminStatusComponent} from './admin/admin-status.component';
import {ComponentMatchesPipe} from './admin/component-matches.pipe'

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        AppRoutingModule,
        HttpModule,
        QRCodeModule,
        QrScannerModule,
        NgbModule.forRoot()
        // InMemoryWebApiModule.forRoot(InMemoryDataService, { delay: 600 })
    ],
    declarations: [
        AppComponent,
        PaymentComponent,
        routedComponents,
        AdminOrdersComponent,
        AdminComponentComponent,
        AdminProductionComponent,
        AdminStatusComponent,
        ComponentMatchesPipe
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
