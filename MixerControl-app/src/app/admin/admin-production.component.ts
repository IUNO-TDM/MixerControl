/**
 * Created by goergch on 01.03.17.
 */

import {Component, OnInit, OnDestroy} from '@angular/core';

import {SocketService} from "../services/socketio.service";
import {AdminService} from "../services/admin.service";
import {Subscription, Observable} from "rxjs";
import {Order} from "../models/models"

import {DataSource} from '@angular/cdk/collections';
@Component({
    moduleId: module.id,
    selector: 'my-admin-production',
    templateUrl: 'admin-production.template.html',
    providers: [SocketService, AdminService]
})

export class AdminProductionComponent implements OnInit, OnDestroy {
    queueConnection: Subscription;
    // stateConnection: Subscription;
    state = "";
    queue = new Array<Order>();

    orders = new Array<Order>();


    displayedColumns = ['OrderNr', 'DrinkId', 'DrinkName'];
  dataSource: ProductionDataSource | null;

    constructor(private socketService: SocketService, private adminService: AdminService) {

    }


    ngOnInit(): void {
      this.dataSource = new ProductionDataSource(this.socketService);
      this.queueConnection = this.socketService.get("/production", "state", "state")
            .subscribe(state =>
                this.state = state);



    }

    ngOnDestroy(): void {
        this.queueConnection.unsubscribe();
        // this.stateConnection.unsubscribe();
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



export class ProductionLine {
  OrderNr: string;
  DrinkId: string;
  DrinkName: string;
}

export class ProductionDataSource extends DataSource<any> {
  queueObservable: Observable<any>;


  constructor(private socketService: SocketService) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<ProductionLine[]> {
    this.queueObservable = this.socketService.get("/production", "queue", "queue");
    return this.queueObservable.map(queue =>{
      var array = new Array<ProductionLine>();
      console.log(queue);
      for (let o of queue) {
        var order = o as Order;
        var productionLine = new ProductionLine();
        productionLine.DrinkId = order.drinkId;
        productionLine.DrinkName = order.orderName;
        productionLine.OrderNr = String(order.orderNumber);
        array.push(productionLine);
      }
      return array;
    })


    // return Observable.merge(this.ordersObservable, this.ordersStatesObservable,2).map(() => {
    //   // return this.ordersObservable.map(() => {
    //   var array = new Array<OrderLine>();
    //   console.log(this.orders);
    //   for (let order of Array.from(this.orders.values())) {
    //     var orderLine = new OrderLine();
    //     orderLine.DrinkId = order.drinkId;
    //     orderLine.DrinkName = order.orderName;
    //     orderLine.OrderNr = String(order.orderNumber);
    //     if(this.orderStates.has(order.orderNumber)){
    //       orderLine.State = this.orderStates.get(order.orderNumber);
    //     }
    //     array.push(orderLine);
    //   }
    //   return array;
    // })

  }

  disconnect() {
  }
}
