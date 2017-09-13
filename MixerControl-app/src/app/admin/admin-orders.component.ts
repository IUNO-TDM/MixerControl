/**
 * Created by goergch on 01.03.17.
 */

import {Component, OnInit, OnDestroy} from '@angular/core';

import {SocketService} from "../services/socketio.service";
import {Subscription, Observable} from "rxjs";
import {Order} from "../models/models"
import {DataSource} from '@angular/cdk/collections';

@Component({
  moduleId: module.id,
  selector: 'my-admin-orders',
  templateUrl: 'admin-orders.template.html',
  providers: [SocketService]
})

export class AdminOrdersComponent implements OnInit, OnDestroy {

  displayedColumns = ['OrderNr', 'DrinkId', 'DrinkName', 'State'];


  dataSource: OrdersDataSource | null;

  constructor(private socketService: SocketService) {
  }


  ngOnInit(): void {
    this.dataSource = new OrdersDataSource(this.socketService)
  }

  ngOnDestroy(): void {

  }


}

export class OrderLine {
  OrderNr: string;
  DrinkId: string;
  DrinkName: string;
  State: string;
}

interface Dictionary<T> {
  [Key: string]: T;
}

export class OrdersDataSource extends DataSource<any> {
  ordersObservable: Observable<any>;
  ordersStatesObservable: Observable<any>;
  orders = new Map<string, Order>();
  orderStates = new Map<string,string>();
  constructor(private socketService: SocketService) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<OrderLine[]> {


    this.ordersObservable = this.socketService.get("/orders", "allOrders", "add").map(order => {
      var o: Order = order;
      this.orders.set(o.orderNumber, o);

      return this.orders;
    });
    this.ordersStatesObservable = this.socketService.get("/orders", "allOrders", "state").map(o => {
      this.orderStates.set(o.orderNumber, o.toState);
      return this.orderStates;
    });



    return Observable.merge(this.ordersObservable, this.ordersStatesObservable,2).map(() => {
    // return this.ordersObservable.map(() => {
      var array = new Array<OrderLine>();
      // console.log(this.orders);
      for (let order of Array.from(this.orders.values())) {
        var orderLine = new OrderLine();
        orderLine.DrinkId = order.drinkId;
        orderLine.DrinkName = order.orderName;
        orderLine.OrderNr = String(order.orderNumber);
        if(this.orderStates.has(order.orderNumber)){
          orderLine.State = this.orderStates.get(order.orderNumber);
        }
        array.push(orderLine);
      }
      return array;
    })

  }

  disconnect() {

  }
}

