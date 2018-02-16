import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {routing} from './order.routing';
import {OrderComponent} from './order.component';
import {QrDialogComponent} from './qrdialog.component';
import {ScanDialogComponent} from './scannerdialog.component';
import {FormsModule} from '@angular/forms';
import {OrdersSocket} from '../services/orders-socket.service';
import {ProductionSocket} from '../services/production-socket.service';
import {
  MatButtonModule, MatCardModule, MatChipsModule, MatDialogModule, MatExpansionModule, MatGridListModule, MatIconModule,
  MatListModule,
  MatProgressBarModule,
  MatProgressSpinnerModule, MatRadioModule, MatSnackBarModule, MatTableModule
} from '@angular/material';
import {CdkTableModule} from '@angular/cdk/table';
import {SocketIoModule} from 'ng-socket-io';
import {InternetconnectionModule} from '../internetconnection/internetconnection.module';
import {HttpClientModule} from '@angular/common/http';
import {NgxQRCodeModule} from 'ngx-qrcode2';
import {FlexLayoutModule} from '@angular/flex-layout';
import {NgQrScannerModule} from 'angular2-qrscanner';

@NgModule({
  imports: [
    CommonModule,
    routing,
    FormsModule,
    HttpClientModule,
    InternetconnectionModule,
    MatButtonModule,
    MatCardModule,
    MatRadioModule,
    NgxQRCodeModule,
    NgQrScannerModule,
    MatTableModule,
    CdkTableModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatIconModule,
    MatListModule,
    MatSnackBarModule,
    SocketIoModule,
    MatExpansionModule,
    MatChipsModule,
    HttpClientModule,
    FlexLayoutModule,
    MatGridListModule,
  ],
  declarations: [OrderComponent, QrDialogComponent, ScanDialogComponent],
  entryComponents: [QrDialogComponent, ScanDialogComponent],

  providers: [ProductionSocket, OrdersSocket],
})
export class OrderModule { }
