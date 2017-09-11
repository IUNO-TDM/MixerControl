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
  // states = {};
  // orders:Dictionary<Order>  = {};

  constructor(private socketService: SocketService) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<OrderLine[]> {


    this.ordersObservable = this.socketService.get("/orders", "allOrders", "add").map(order => {
      var o: Order = order;
      let map = new Map<string, Order>();

      this.orders.set("key", o);
      // console.log(this.orders.get("key")); // value
      console.log(this.orders)
      // this.orders[o.orderNumber] = o;
      return this.orders;
    });

    // this.ordersStatesObservable = this.socketService.get("/orders", "allOrders", "state").map(o => {
    //   console.log(this.orders);
    //   // console.log(String(o.orderNumber));
    //   // console.log(this.orders[o.orderNumber]);
    //   // console.log(this);
    //   // console.log("Count: " + this.orders.length);
    //
    //
    //   var order = this.orders.get("key");
    //   console.log(order)
    //   if(order){
    //
    //     // order.toState = o.toState;
    //     this.orders[String(order.orderNumber)] = order;
    //     console.log(order);
    //   }
    //
    //   return this.orders;
    // });

    return this.ordersObservable.map(() => {
      var array = new Array<OrderLine>();
      for (let order of Array.from(this.orders.values())) {
        var orderLine = new OrderLine();
        orderLine.DrinkId = order.drinkId;
        orderLine.DrinkName = "nix";
        orderLine.OrderNr = String(order.orderNumber);
        // orderLine.State = (order as any).toState;
        array.push(orderLine);
      }
      return array;
    })

    // return this.ordersStatesObservable.switchMap()

    // this.addConnection =
    //
    // this.stateConnection = this.socketService.get("/orders", "allOrders", "state")
    //   .subscribe(o =>
    //     this.states[o.orderNumber] = o.toState);

    // this.orderLineObservable = this.
    //
    //
    //
    //
    // return this._drinkObservable.map((drink: Drink) => {
    //
    //
    //   var drinkPosition1: OrderLine;
    //   drinkPosition1 = new OrderLine();
    //   drinkPosition1.Artikel = drink.title;
    //   drinkPosition1.Pos = "1";
    //   drinkPosition1.Menge = "1";
    //   drinkPosition1.UnterPosPreis = "";
    //   drinkPosition1.Preis = String(drink.retailPrice / 100000) + " IUNO";
    //   drinkPosition1.Gesamt = String(drink.retailPrice / 100000) + " IUNO";
    //
    //
    //   var posArray: Array<DrinkPosition> = Array(4);
    //   posArray[0] = drinkPosition1;
    //   posArray[1] = drinkPosition2;
    //   posArray[2] = drinkPosition3;
    //   posArray[3] = drinkPosition4;
    //
    //   return posArray;
    // });
  }

  disconnect() {
    // this.addConnection.unsubscribe();
    // this.stateConnection.unsubscribe();
  }
}

