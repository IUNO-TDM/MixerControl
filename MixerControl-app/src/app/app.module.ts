import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {HttpModule} from '@angular/http';

import { AppComponent } from './app.component';
import { AppRoutingModule ,routedComponents} from './app-routing.module';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MdButtonModule, MdCheckboxModule, MdCardModule, MdRadioModule, MdGridListModule, MdMenuModule, MdToolbarModule} from '@angular/material';
import 'hammerjs';



import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import {QrScannerModule} from 'angular2-qrscanner';
import {PaymentComponent} from './order/payment.component';

@NgModule({
  declarations: [
    AppComponent,
    routedComponents,
    PaymentComponent
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
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
