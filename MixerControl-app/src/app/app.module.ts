import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {NgModule} from '@angular/core';
import {HttpModule} from '@angular/http';

import {AppComponent} from './app.component';
import {AppRoutingModule, routedComponents} from './app-routing.module';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

import {
    MatButtonModule,
    MatCheckboxModule,
    MatCardModule,
    MatRadioModule,
    MatGridListModule,
    MatMenuModule,
    MatToolbarModule,
    MatTableModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatIconModule,
    MatListModule,
    MatTabsModule,
    MatSelectModule,
    MatSliderModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatChipsModule,
} from '@angular/material';
import 'hammerjs';
import {CdkTableModule} from '@angular/cdk/table';


import {NgxQRCodeModule} from 'ngx-qrcode2';
import {QrScannerModule} from 'angular2-qrscanner';
import {QrDialogComponent} from './order/qrdialog.component';
import {ScanDialogComponent} from './order/scannerdialog.component';
import {AdminComponentComponent} from './admin/admin-component.component';
import {AdminOrdersComponent} from './admin/admin-orders.component';
import {AdminProductionComponent} from './admin/admin-production.component';
import {AdminServiceComponent} from './admin/admin-service.component';
import {AdminComponentDialogComponent} from './admin/admin-component-dialog.component';
import {AdminAmountDialogComponent} from './admin/admin-amount-dialog.component';
import {ProductionSocket} from './services/production-socket.service';
import {OrdersSocket} from './services/orders-socket.service';
import {SocketIoModule} from 'ng-socket-io';
import {InternetConnectionComponent} from './general/internetconnection.component';
import {InternetConnectionSocket} from './services/internetconnection-socket.service';
import {DrinkFilterPipe} from './drink/drink-filter-pipe';
import {RecipeOverviewModule} from './recipe-overview/recipe-overview.module';
import {HttpClientModule} from '@angular/common/http';
import {FlexLayoutModule} from '@angular/flex-layout';
import {JuiceProgramConfiguratorModule} from './juice-program-configurator/juice-program-configurator.module';
import {AdminRecipeComponent } from './admin/admin-recipe/admin-recipe.component';


@NgModule({
    declarations: [
        AppComponent,
        InternetConnectionComponent,
        routedComponents,
        QrDialogComponent,
        ScanDialogComponent,
        AdminComponentComponent,
        AdminOrdersComponent,
        AdminProductionComponent,
        AdminServiceComponent,
        AdminComponentDialogComponent,
        AdminAmountDialogComponent,
        DrinkFilterPipe,
        AdminRecipeComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        // NoopAnimationsModule,
        HttpModule,
        MatButtonModule,
        MatCheckboxModule,
        MatCardModule,
        MatRadioModule,
        MatGridListModule,
        MatMenuModule,
        MatToolbarModule,
        NgxQRCodeModule,
        QrScannerModule,
        MatTableModule,
        CdkTableModule,
        MatDialogModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        MatIconModule,
        MatListModule,
        MatTabsModule,
        MatSelectModule,
        MatSliderModule,
        MatSnackBarModule,
        SocketIoModule,
        MatExpansionModule,
        MatChipsModule,
        RecipeOverviewModule,
        HttpClientModule,
        FlexLayoutModule,
        JuiceProgramConfiguratorModule
    ],
    providers: [ProductionSocket, OrdersSocket, InternetConnectionSocket],
    bootstrap: [AppComponent],
    entryComponents: [QrDialogComponent, ScanDialogComponent, AdminComponentDialogComponent, AdminAmountDialogComponent]
})
export class AppModule {
}
