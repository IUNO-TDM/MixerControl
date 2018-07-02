import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';

import {NoopAnimationsModule} from '@angular/platform-browser/animations';

import 'hammerjs';
import {InternetconnectionModule} from "./internetconnection/internetconnection.module";
import { TdmCommonModule } from 'tdm-common';
import { HttpClientModule } from '@angular/common/http';

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
        HttpClientModule,
        TdmCommonModule.forRoot()
    ],
    providers: [
        {provide: 'componentSourceUrl', useValue: '/api/components'}
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
