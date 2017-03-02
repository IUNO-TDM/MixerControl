/**
 * Created by goergch on 01.03.17.
 */

import {Component, OnInit, OnDestroy} from '@angular/core';

import {SocketService} from "../services/socketio.service";
import {Subscription} from "rxjs";
@Component({
    moduleId: module.id,
    selector: 'my-admin-status',
    templateUrl: 'admin-status.template.html',
    providers: [SocketService]
})

export class AdminStatusComponent implements OnInit,OnDestroy {
    pcServiceStateConnection: Subscription;
    pcModeConnection: Subscription;
    pqStateConnection: Subscription;
    pcServiceState: string;
    pqState: string;
    pcMode: string;

    constructor(private socketService: SocketService) {
    };

    ngOnInit() {
        this.pqStateConnection = this.socketService.get("/production","state","stateChange")
            .subscribe(state => this.pqState = state);
        this.pcServiceStateConnection = this.socketService.get("/production","pumpControlService","stateChange")
            .subscribe(state => this.pcServiceState = state);
        this.pcModeConnection = this.socketService.get("/production","pumpControlMode","modeChange")
            .subscribe(state => this.pcMode = state);
    };

    ngOnDestroy(){
        this.pcModeConnection.unsubscribe();
        this.pcServiceStateConnection.unsubscribe();
        this.pqStateConnection.unsubscribe();
    };
}