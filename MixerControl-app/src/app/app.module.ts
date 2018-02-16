import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';

import {NoopAnimationsModule} from '@angular/platform-browser/animations';

import 'hammerjs';
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    // BrowserAnimationsModule,
    NoopAnimationsModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
