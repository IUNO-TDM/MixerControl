import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import {PaymentComponent} from './order/payment.component';

import { AppComponent } from './app.component';
import { AppRoutingModule, routedComponents } from './app-routing.module';
import { QRCodeModule } from 'angular2-qrcode';
import { QrScannerModule} from 'angular2-qrscanner';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpModule,
    QRCodeModule,
    QrScannerModule
    // InMemoryWebApiModule.forRoot(InMemoryDataService, { delay: 600 })
  ],
  declarations: [
    AppComponent,
    PaymentComponent,
    routedComponents
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
