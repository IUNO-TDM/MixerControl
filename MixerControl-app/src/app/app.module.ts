import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';

import {NoopAnimationsModule} from '@angular/platform-browser/animations';

import 'hammerjs';
import {InternetconnectionModule} from "./internetconnection/internetconnection.module";

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        // BrowserAnimationsModule,
        NoopAnimationsModule,

        InternetconnectionModule,
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
