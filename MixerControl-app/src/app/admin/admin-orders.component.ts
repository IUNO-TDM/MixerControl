/**
 * Created by goergch on 01.03.17.
 */

import {Component, OnInit, OnDestroy} from '@angular/core';

import {SocketService} from "../services/socketio.service";
import {Subscription} from "rxjs";
import {Order} from "../models/models"
@Component({
    moduleId: module.id,
    selector: 'my-admin-orders',
    templateUrl: 'admin-orders.template.html',
    providers: [SocketService]
})

export class AdminOrdersComponent implements OnInit, OnDestroy {
    addConnection: Subscription;
    stateConnection: Subscription;
    states = {};

    orders = new Array<Order>();

    constructor(private socketService: SocketService) {
    }


    ngOnInit(): void {
        this.addConnection = this.socketService.get("/orders", "allOrders", "add")
            .subscribe(order =>
                this.orders.push(order as Order));
        this.stateConnection = this.socketService.get("/orders", "allOrders", "state")
            .subscribe(o =>
                this.states[o.orderNumber] = o.toState);
    }

    ngOnDestroy(): void {
        this.addConnection.unsubscribe();
        this.stateConnection.unsubscribe();
    }


}