import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {InternetConnectionComponent} from './internetconnection.component';
import {InternetConnectionSocket} from '../services/internetconnection-socket.service';
import {MatIconModule} from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule
  ],
  declarations: [
    InternetConnectionComponent
  ],
  providers: [
    InternetConnectionSocket
  ],
  exports: [
    InternetConnectionComponent
  ]
})
export class InternetconnectionModule { }
