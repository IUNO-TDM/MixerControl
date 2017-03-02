/**
 * Created by goergch on 01.03.17.
 */

import {Component, OnInit, OnDestroy} from '@angular/core';

import {SocketService} from "../services/socketio.service";
import {AdminService} from "../services/admin.service";
import {Subscription} from "rxjs";
import {Order} from "../models/models"
@Component({
    moduleId: module.id,
    selector: 'my-admin-production',
    templateUrl: 'admin-production.template.html',
    providers: [SocketService, AdminService]
})

export class AdminProductionComponent implements OnInit, OnDestroy {
    queueConnection: Subscription;
    stateConnection: Subscription;
    state = "";
    queue = new Array<Order>();

    orders = new Array<Order>();

    constructor(private socketService: SocketService, private adminService: AdminService) {
    }


    ngOnInit(): void {
        this.queueConnection = this.socketService.get("/production", "state", "stateChange")
            .subscribe(state =>
                this.state = state);
        this.stateConnection = this.socketService.get("/production", "queue", "queueChange")
            .subscribe(queue =>
                this.queue = queue as Array<Order>);
    }

    ngOnDestroy(): void {
        this.queueConnection.unsubscribe();
        this.stateConnection.unsubscribe();
    }

    ResumeProduction(): void {
        this.adminService.resumeProduction();
    }

    PauseProduction(): void {
        this.adminService.pauseProduction();
    }

    StartProcessing(): void {
        this.adminService.startProcessing();
    }


}