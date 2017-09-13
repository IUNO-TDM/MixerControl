import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from "@angular/forms";
import {NgModule} from '@angular/core';
import {HttpModule} from '@angular/http';

import {AppComponent} from './app.component';
import {AppRoutingModule, routedComponents} from './app-routing.module';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
  MdButtonModule,
  MdCheckboxModule,
  MdCardModule,
  MdRadioModule,
  MdGridListModule,
  MdMenuModule,
  MdToolbarModule,
  MdTableModule,
  MdDialogModule,
  MdProgressSpinnerModule,
  MdProgressBarModule,
  MdIconModule,
  MdListModule, MdTabsModule, MdSelectModule, MdSliderModule, MdSnackBarModule,
} from '@angular/material';
import 'hammerjs';
import {CdkTableModule} from '@angular/cdk/table';


import {NgxQRCodeModule} from '@techiediaries/ngx-qrcode';
import {QrScannerModule} from 'angular2-qrscanner';
import {PaymentComponent} from './order/payment.component';
import {QrDialog} from "./order/qrdialog.component";
import {ScanDialog} from "./order/scannerdialog.component";
import {AdminComponentComponent} from "./admin/admin-component.component";
import {AdminOrdersComponent} from "./admin/admin-orders.component";
import {AdminProductionComponent} from "./admin/admin-production.component";
import {AdminServiceComponent} from "./admin/admin-service.component";
import {AdminComponentDialogComponent} from "./admin/admin-component-dialog.component";
import {AdminAmountDialogComponent} from "./admin/admin-amount-dialog.component";


@NgModule({
  declarations: [
    AppComponent,
    routedComponents,
    PaymentComponent,
    QrDialog,
    ScanDialog,
    AdminComponentComponent,
    AdminOrdersComponent,
    AdminProductionComponent,
    AdminServiceComponent,
    AdminComponentDialogComponent,
    AdminAmountDialogComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpModule,
    MdButtonModule,
    MdCheckboxModule,
    MdCardModule,
    MdRadioModule,
    MdGridListModule,
    MdMenuModule,
    MdToolbarModule,
    NgxQRCodeModule,
    QrScannerModule,
    MdTableModule,
    CdkTableModule,
    MdDialogModule,
    MdProgressSpinnerModule,
    MdProgressBarModule,
    MdIconModule,
    MdListModule,
    MdTabsModule,
    MdSelectModule,
    MdSliderModule,
    MdSnackBarModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [QrDialog, ScanDialog, AdminComponentDialogComponent, AdminAmountDialogComponent]
})
export class AppModule {
}
