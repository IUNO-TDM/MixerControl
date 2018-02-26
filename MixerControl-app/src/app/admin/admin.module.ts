import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AdminAmountDialogComponent} from './admin-amount-dialog/admin-amount-dialog.component';
import {AdminComponentDialogComponent} from './admin-component-dialog/admin-component-dialog.component';
import {AdminComponentComponent} from './admin-component/admin-component.component';
import {AdminOrdersComponent} from './admin-orders/admin-orders.component';
import {AdminProductionComponent} from './admin-production/admin-production.component';
import {AdminRecipeComponent} from './admin-recipe/admin-recipe.component';
import {AdminServiceComponent} from './admin-service/admin-service.component';
import {
    MatButtonModule, MatCardModule, MatCheckboxModule, MatDialogModule, MatIconModule, MatListModule, MatMenuModule,
    MatRadioModule, MatSelectModule, MatSliderModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule
} from '@angular/material';
import {CdkTableModule} from '@angular/cdk/table';
import {OrdersSocket} from '../services/orders-socket.service';
import {ProductionSocket} from '../services/production-socket.service';
import {FlexLayoutModule} from '@angular/flex-layout';
import {HttpClientModule} from '@angular/common/http';
import {AdminComponent} from './admin.component';
import {InternetconnectionModule} from '../internetconnection/internetconnection.module';
import {FormsModule} from '@angular/forms';
import {routing} from "./admin.routing";
import {AdminWalletComponent} from './admin-wallet/admin-wallet.component';
import {CocktailConfiguratorModule, ComponentService} from 'cocktail-configurator'

@NgModule({
    declarations: [
        AdminComponent,
        AdminAmountDialogComponent,
        AdminComponentDialogComponent,
        AdminComponentComponent,
        AdminOrdersComponent,
        AdminProductionComponent,
        AdminRecipeComponent,
        AdminServiceComponent,
        AdminWalletComponent,
    ], imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatCheckboxModule,
        MatCardModule,
        MatRadioModule,
        MatMenuModule,
        MatToolbarModule,
        MatTableModule,
        CdkTableModule,
        MatDialogModule,
        MatIconModule,
        MatListModule,
        MatTabsModule,
        MatSelectModule,
        MatSliderModule,
        HttpClientModule,
        FlexLayoutModule,
        InternetconnectionModule,
        CocktailConfiguratorModule,
        routing

    ],
    entryComponents: [
        AdminComponentDialogComponent,
        AdminAmountDialogComponent
    ],
    providers: [ProductionSocket, OrdersSocket, ComponentService],
})
export class AdminModule {
}
