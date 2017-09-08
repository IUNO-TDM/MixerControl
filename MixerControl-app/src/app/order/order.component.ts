import {
  Component, OnInit, Inject, OnDestroy, ViewChild, QueryList, ElementRef, ContentChildren,
  ViewChildren
} from '@angular/core';
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
import {MdDialog, MdDialogRef, MD_DIALOG_DATA, MdGridTile, MdGridList} from '@angular/material';
import {QrDialog} from "./qrdialog.component";
import {ScanDialog} from "./scannerdialog.component";




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


  @ViewChildren(MdGridTile)gridTiles;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private drinkService: DrinkService,
    private userService: UserService,
    private orderService: OrderService,
    private socketService: SocketService,
    private dialog: MdDialog
  ) {

  }


  refreshStepCards(state): void{
    // 0= OFF, 1 = Active, 2= Highlighted, 3= FINISHED
    // var pState = "";
    if(state && state.toState){
      state = state.toState;
    }

    var step1 = 0;
    var step2 = 0;
    var step3 = 0;
    var step4 = 0;
    if(state == "uninitialized" || state == "error"){
      step1 = 0;
      step2 = 0;
      step3 = 0;
      step4 = 0;
    }else if(state == "waitingOffer" || state == "waitingPaymentRequest"|| state == "waitingPayment"){
      step1 = 2;
      step2 = 0;
      step3 = 0;
      step4 = 0;
    }else if(state == "waitingLicenseAvailable"){
      step1 = 3;
      step2 = 2;
      step3 = 0;
      step4 = 0;
    }else if(state == "waitingLicense"){
      step1 = 3;
      step2 = 3;
      step3 = 2;
      step4 = 0;
    }else if(state == "waitForProduction" || state == "readyForProduction" || state == "orderPaused"){
      step1 = 3;
      step2 = 3;
      step3 = 3;
      step4 = 1;
    }else if(state == "inProduction"|| state == "startProduction" ){
      step1 = 3;
      step2 = 3;
      step3 = 3;
      step4 = 2;
    }else if(state === "productionFinished" ){
      step1 = 3;
      step2 = 3;
      step3 = 3;
      step4 = 3;
    }

    var tile1  = this.gridTiles.find(x => x._element.nativeElement.classList.contains('payment'));
    var tile2  = this.gridTiles.find(x => x._element.nativeElement.classList.contains('licensepayment'));
    var tile3  = this.gridTiles.find(x => x._element.nativeElement.classList.contains('license'));
    var tile4  = this.gridTiles.find(x => x._element.nativeElement.classList.contains('production'));

    for(let t of [tile1, tile2, tile3, tile4]){
        var cl = t._element.nativeElement.classList;
        cl.remove('step1');
        cl.remove('step2');
        cl.remove('step3');
        cl.remove('step4');
    }
    tile1._element.nativeElement.classList.add('step'+step1);
    tile2._element.nativeElement.classList.add('step'+step2);
    tile3._element.nativeElement.classList.add('step'+step3);
    tile4._element.nativeElement.classList.add('step'+step4);
  }


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
                    this.refreshStepCards(state);
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
      console.log(drink.licensefee)
      drinkPosition.Preis = String(drink.licensefee / 100000) + " IUNO";
      drinkPosition.Gesamt = String(drink.licensefee / 100000) + " IUNO";
      var posArray: Array<DrinkPosition> = Array(1);
      posArray[0] = drinkPosition;
      return posArray;
    });
  }

  disconnect() {}
}

