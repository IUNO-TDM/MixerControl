import {BrowserModule} from '@angular/platform-browser';
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
  MdIconModule
} from '@angular/material';
import 'hammerjs';
import {CdkTableModule} from '@angular/cdk/table';


import {NgxQRCodeModule} from '@techiediaries/ngx-qrcode';
import {QrScannerModule} from 'angular2-qrscanner';
import {PaymentComponent} from './order/payment.component';
import {QrDialog} from "./order/qrdialog";
import {ScanDialog} from "./order/scannerdialog";


@NgModule({
  declarations: [
    AppComponent,
    routedComponents,
    PaymentComponent,
    QrDialog,
    ScanDialog
  ],
  imports: [
    BrowserModule,
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
    MdIconModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [QrDialog, ScanDialog]
})
export class AppModule {
}
