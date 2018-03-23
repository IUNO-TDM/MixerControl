/**
 * Created by goergch on 01.03.17.
 */
/**
 * Created by goergch on 01.03.17.
 */

import {Component, OnInit, OnDestroy} from '@angular/core';
import {Order} from '../../models/models';
import {DataSource} from '@angular/cdk/collections';
import {OrdersSocketService} from '../../services/orders-socket.service';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';

@Component({
  moduleId: module.id,
  selector: 'my-admin-orders',
  templateUrl: 'admin-orders.template.html',
  providers: [OrdersSocketService]
})

export class AdminOrdersComponent implements OnInit, OnDestroy {

  displayedColumns = ['OrderNr', 'DrinkId', 'DrinkName', 'State'];


  dataSource: OrdersDataSource | null;

  constructor(private ordersSocketService: OrdersSocketService) {
  }


  ngOnInit(): void {
    this.dataSource = new OrdersDataSource(this.ordersSocketService);
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
  orders = new Map<number, Order>();
  orderStates = new Map<number, string>();
  constructor(private ordersSocketService: OrdersSocketService) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<OrderLine[]> {

    this.ordersSocketService.joinRoom('allOrders');

    this.ordersObservable = this.ordersSocketService.getUpdates('add').map(order => {
      const o: Order = order;
      this.orders.set(o.orderNumber, o);
      console.log(o);
      return this.orders;
    });


    this.ordersStatesObservable = this.ordersSocketService.getUpdates('state').map(o => {
      this.orderStates.set(o.orderNumber, o.toState);
      return this.orderStates;
    });



    return Observable.merge(this.ordersObservable, this.ordersStatesObservable, 2).map(() => {
    // return this.ordersObservable.map(() => {
      const array = new Array<OrderLine>();
      // console.log(this.orders);
      for (const o of Array.from(this.orders.values())) {
        const orderLine = new OrderLine();
        orderLine.DrinkId = o.drinkId;
        orderLine.DrinkName = o.orderName;
        orderLine.OrderNr = String(o.orderNumber);
        if (this.orderStates.has(o.orderNumber)) {
          orderLine.State = this.orderStates.get(o.orderNumber);
        }
        array.push(orderLine);
      }
      return array;
    });

  }

  disconnect() {

  }
}

