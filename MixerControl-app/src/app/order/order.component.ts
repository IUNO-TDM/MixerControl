import { Component, OnInit,Inject, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router }   from '@angular/router';
import 'rxjs/add/operator/switchMap';
import {Drink} from '../models/Drink'
import {User} from '../models/User'
import {Order} from '../models/Order'
import {DrinkService} from '../services/drink.service'
import {UserService} from '../services/user.service'
import {OrderService} from '../services/order.service'
import {SocketService} from "../services/socketio.service";
import {Subscription} from "rxjs";
import {DataSource} from '@angular/cdk/collections';
import {Observable} from "rxjs";
import {MdDialog, MdDialogRef, MD_DIALOG_DATA} from '@angular/material';
import {QrDialog} from "./qrdialog";
import {ScanDialog} from "./scannerdialog";
@Component({
  moduleId: module.id,
  selector: 'my-order',
  templateUrl: 'order.template.html',
  styleUrls: ['./order.component.css'],
  providers: [DrinkService, UserService, OrderService, SocketService]
})

export class OrderComponent implements OnInit, OnDestroy {
  scanDialogRef: MdDialogRef<ScanDialog> | null;
  qrDialogRef: MdDialogRef<QrDialog> | null;
  order: Order;
  drink: Drink;
  user: User;
  error: any;
  orderState: any;
  progress: number;
  orderStateConnection: Subscription;
  orderProgressConnection: Subscription;
  showDialog: boolean = false;
  orderURL = "NULL";

  displayedColumns = ['Pos', 'Menge', 'Artikel', 'Preis', 'Gesamt'];
  dataSource: ExampleDataSource | null;
  config = {
    disableClose: false,
    panelClass: 'custom-overlay-pane-class',
    hasBackdrop: true,
    backdropClass: '',
    width: '',
    height: '',
    position: {
      top: '',
      bottom: '',
      left: '',
      right: ''
    },
    data: {
      orderId: ''
    }
  };
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private drinkService: DrinkService,
    private userService: UserService,
    private orderService: OrderService,
    private socketService: SocketService,
    private dialog: MdDialog
  ) {}



  ngOnInit(): void{



    this.route.params.subscribe( params => {
          this.orderProgressConnection =
              this.orderProgressConnection =
                  this.socketService.get("/orders",params['id'], "progress")
                  .subscribe(progress =>this.progress = progress['progress']);
          this.orderStateConnection =
              this.socketService.get("/orders",params['id'], "state")
                  .subscribe(state => {
                    if(state != 'waitingPayment'){
                      if(this.qrDialogRef){
                        this.qrDialogRef.close();
                      }
                      if(this.scanDialogRef){
                        this.scanDialogRef.close();
                      }
                    }
                    return this.orderState = state
                  });
        }
      );

    var orderObservable = this.route.params.
      switchMap((params: Params) => this.orderService.getOrder(params['id']));
    orderObservable.subscribe(order => {
        this.order = order;
        this.drinkService.getDrink(order.drinkId).then(drink => {
          this.drink = drink;
          this.userService.getUser(this.drink.authorId).then(user => this.user = user)
            .catch(error => this.error = error);
        })
      });

    var drinkObservable = orderObservable.switchMap((order: Order) => this.drinkService.getDrink(order.drinkId));
    this.dataSource = new ExampleDataSource(drinkObservable);
  }

  ngOnDestroy(): void {
    this.orderProgressConnection.unsubscribe();
    this.orderStateConnection.unsubscribe();
  }

  ProductionStart(){
    this.route.params.
    switchMap((params: Params) => this.orderService.sendProductionStart(params['id']))
      .subscribe(response => console.log(response));
  }

  ShowPaymentModalQR(){
    // this.showDialog = true;
    this.config.data.orderId = this.order.orderNumber;
    this.qrDialogRef = this.dialog.open(QrDialog, this.config);

    // this.qrDialogRef.beforeClose().subscribe((result: string) => {
    //   // this.lastBeforeCloseResult = result;
    // });
    this.qrDialogRef.afterClosed().subscribe((result: string) => {
      // this.lastAfterClosedResult = result;
      this.qrDialogRef = null;
    });
  }

  ShowPaymentModalScan(){
    this.config.data.orderId = this.order.orderNumber;
    this.scanDialogRef = this.dialog.open(ScanDialog, this.config);
    this.scanDialogRef.afterClosed().subscribe((result: string) => {
      // this.lastAfterClosedResult = result;
      this.scanDialogRef = null;
    });
  }

  Home(){
    this.router.navigateByUrl(`/`);
  }

}

export class DrinkPosition {
  Pos: number;
  Menge: number;
  Artikel: string;
  Preis: string;
  Gesamt: string;
}

export class ExampleDataSource extends DataSource<any> {

  constructor(private _drinkObservable: Observable<Drink>){
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<DrinkPosition[]> {

    return this._drinkObservable.map((drink: Drink) => {
      var drinkPosition: DrinkPosition;
      drinkPosition = new DrinkPosition();
      drinkPosition.Artikel = drink.title;
      drinkPosition.Pos = 1;
      drinkPosition.Menge = 1;
      console.log(drink.licencefee)
      drinkPosition.Preis = String(drink.licencefee / 100000) + " IUNO";
      drinkPosition.Gesamt = String(drink.licencefee / 100000) + " IUNO";
      var posArray: Array<DrinkPosition> = Array(1);
      posArray[0] = drinkPosition;
      return posArray;
    });
  }

  disconnect() {}
}

