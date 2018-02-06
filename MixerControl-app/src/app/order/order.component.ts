import {
  Component, OnInit, Inject, OnDestroy, ViewChild, QueryList, ElementRef, ContentChildren,
  ViewChildren
} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import 'rxjs/add/operator/switchMap';
import {Drink} from '../models/Drink';
import {User} from '../models/User';
import {Order} from '../models/Order';
import {DrinkService} from '../services/drink.service';
import {UserService} from '../services/user.service';
import {OrderService} from '../services/order.service';
import {DataSource} from '@angular/cdk/collections';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatGridTile, MatGridList} from '@angular/material';
import {QrDialogComponent} from './qrdialog.component';
import {ScanDialogComponent} from './scannerdialog.component';
import {OrdersSocketService} from '../services/orders-socket.service';
import {ProductionSocketService} from '../services/production-socket.service';
import {Subscription} from 'rxjs/Subscription';
import {Observable} from 'rxjs/Observable';


@Component({
  moduleId: module.id,
  selector: 'my-order',
  templateUrl: 'order.template.html',
  styleUrls: ['./order.component.css'],
  providers: [DrinkService, UserService, OrderService, OrdersSocketService, ProductionSocketService]
})

export class OrderComponent implements OnInit, OnDestroy {
  queueConnection: Subscription;
  queueObservable: Observable<any>;
  queuePlace = -1;
  scanDialogRef: MatDialogRef<ScanDialogComponent> | null;
  qrDialogRef: MatDialogRef<QrDialogComponent> | null;
  orderToBeDisplayed: Order;
  a: Order;
  drink: Drink;
  user: User;
  error: any;
  orderState: any;
  progress: number;
  orderStateConnection: Subscription;
  orderProgressConnection: Subscription;
  showDialog = false;
  orderURL = 'NULL';

  displayedColumns = ['Pos', 'Menge', 'Artikel', 'UnterPosPreis', 'Preis', 'Gesamt'];
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
      order: new Order
    }
  };


  @ViewChildren(HTMLDivElement) divs;

  @ViewChild('order') orderDiv;
  @ViewChild('payment') paymentDiv;
  @ViewChild('license') licenseDiv;
  @ViewChild('production') productionDiv;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private drinkService: DrinkService,
              private userService: UserService,
              private orderService: OrderService,
              private productionSocketService: ProductionSocketService,
              private ordersSocketService: OrdersSocketService,
              private dialog: MatDialog) {

  }


  refreshStepCards(state): void {
    // 0= OFF, 1 = Active, 2= Highlighted, 3= FINISHED
    // var pState = "";
    if (state && state.toState) {
      state = state.toState;
    }

    let step1 = 0;
    let step2 = 0;
    let step3 = 0;
    let step4 = 0;
    if (state === 'uninitialized' || state === 'error') {
      step1 = 0;
      step2 = 0;
      step3 = 0;
      step4 = 0;
    } else if (state === 'waitingOffer' || state === 'waitingPaymentRequest') {
      step1 = 2;
      step2 = 0;
      step3 = 0;
      step4 = 0;
    } else if (state === 'waitingPayment' || state === 'waitingLicenseAvailable') {
      step1 = 3;
      step2 = 2;
      step3 = 0;
      step4 = 0;
    } else if (state === 'waitingLicense') {
      step1 = 3;
      step2 = 3;
      step3 = 2;
      step4 = 0;
    } else if (state === 'waitForProduction' || state === 'readyForProduction' || state === 'orderPaused') {
      step1 = 3;
      step2 = 3;
      step3 = 3;
      step4 = 2;
    } else if (state === 'inProduction' || state === 'startProduction') {
      step1 = 3;
      step2 = 3;
      step3 = 3;
      step4 = 2;
    } else if (state === 'productionFinished') {
      step1 = 3;
      step2 = 3;
      step3 = 3;
      step4 = 3;
    }
    // console.log(this.gridTiles);


    for (const t of [this.orderDiv, this.paymentDiv, this.licenseDiv, this.productionDiv]) {
      const cl = t.nativeElement.classList;
      cl.remove('step1');
      cl.remove('step2');
      cl.remove('step3');
      cl.remove('step4');
    }
    this.orderDiv.nativeElement.classList.add('step' + step1);
    this.paymentDiv.nativeElement.classList.add('step' + step2);
    this.licenseDiv.nativeElement.classList.add('step' + step3);
    this.productionDiv.nativeElement.classList.add('step' + step4);
  }


  ngOnInit(): void {
    const orderObservable = this.route.params.switchMap((params: Params) => this.orderService.getOrder(params['id']));
    // orderObservable;
    orderObservable.subscribe(o => {
        console.log(o);
        this.orderToBeDisplayed = o;

        this.orderProgressConnection = this.ordersSocketService.getUpdates('progress')
          .subscribe(progress => {
            if (progress.orderNumber === this.orderToBeDisplayed.orderNumber) {
              this.progress = progress.progress;
            }

            return this.progress;
          });
        this.orderStateConnection =
          this.ordersSocketService.getUpdates('state')
            .subscribe(state => {
              if (state.orderNumber === this.orderToBeDisplayed.orderNumber) {
                if (state !== 'waitingPayment') {
                  if (this.qrDialogRef) {
                    this.qrDialogRef.close();
                  }
                  if (this.scanDialogRef) {
                    this.scanDialogRef.close();
                  }
                }
                this.refreshStepCards(state);
                return this.orderState = state;
              }

            });

        this.ordersSocketService.joinRoom(String(this.orderToBeDisplayed.orderNumber));


        this.drinkService.getDrink(o.drinkId).subscribe(drink => {
          this.drink = drink;
          this.userService.getUser(this.drink.authorId).then(user => this.user = user,
              error => this.error = error);
        });
      },
      err => {
        console.log(err);
        if (err && err.status && err.status === 404) {
          this.router.navigateByUrl('/');
        }
      },
      () => console.log('yay'));

    const drinkObservable = orderObservable.switchMap((o: Order) => this.drinkService.getDrink(o.drinkId));
    this.dataSource = new ExampleDataSource(drinkObservable);

    this.queueObservable = this.productionSocketService.getUpdates('queue');
    this.queueConnection = this.queueObservable.subscribe(queue => {
      const list = queue as Array<any>;
      for (const o of list) {
        if (o.orderNumber === this.orderToBeDisplayed.orderNumber) {
          this.queuePlace = o.queuePlace;
        }
      }
    });
    this.productionSocketService.joinRoom('queue');

  }


  ngOnDestroy(): void {
    if (this.orderProgressConnection) {
      this.orderProgressConnection.unsubscribe();
    }
    if (this.orderStateConnection) {
      this.orderStateConnection.unsubscribe();
    }
    if (this.queueConnection) {
      this.queueConnection.unsubscribe();
    }
  }

  ProductionStart() {
    this.route.params.switchMap((params: Params) => this.orderService.sendProductionStart(params['id']))
      .subscribe(response => console.log(response));
  }

  ShowPaymentModalQR() {
    // this.showDialog = true;
    this.config.data.order = this.orderToBeDisplayed;
    this.qrDialogRef = this.dialog.open(QrDialogComponent, this.config);

    // this.qrDialogRef.beforeClose().subscribe((result: string) => {
    //   // this.lastBeforeCloseResult = result;
    // });
    this.qrDialogRef.afterClosed().subscribe((result: string) => {
      // this.lastAfterClosedResult = result;
      this.qrDialogRef = null;
    });
  }

  ShowPaymentModalScan() {
    this.config.data.order = this.orderToBeDisplayed;
    this.scanDialogRef = this.dialog.open(ScanDialogComponent, this.config);
    this.scanDialogRef.afterClosed().subscribe((result: string) => {
      // this.lastAfterClosedResult = result;
      this.scanDialogRef = null;
    });
  }

  Home() {
    this.router.navigateByUrl(`/`);
  }

}

export class DrinkPosition {
  Pos: string;
  Menge: string;
  Artikel: string;
  UnterPosPreis: string;
  Preis: string;
  Gesamt: string;
}

export class ExampleDataSource extends DataSource<any> {

  constructor(private _drinkObservable: Observable<Drink>) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<DrinkPosition[]> {

    return this._drinkObservable.map((drink: Drink) => {


      let drinkPosition1: DrinkPosition;
      drinkPosition1 = new DrinkPosition();
      drinkPosition1.Artikel = drink.title;
      drinkPosition1.Pos = '1';
      drinkPosition1.Menge = '1';
      drinkPosition1.UnterPosPreis = '';
      drinkPosition1.Preis = String(drink.retailPrice / 100000) + ' IUNO';
      drinkPosition1.Gesamt = String(drink.retailPrice / 100000) + ' IUNO';

      let drinkPosition2: DrinkPosition;
      drinkPosition2 = new DrinkPosition();
      drinkPosition2.Artikel = '*Marktplatzprovision';
      drinkPosition2.Pos = '';
      drinkPosition2.Menge = '';
      drinkPosition2.UnterPosPreis = String(drink.licensefee * 0.3 / 100000) + ' IUNO';
      drinkPosition2.Preis = '';
      drinkPosition2.Gesamt = '';

      let drinkPosition3: DrinkPosition;
      drinkPosition3 = new DrinkPosition();
      drinkPosition3.Artikel = '*Nutzungslizenz';
      drinkPosition3.Pos = '';
      drinkPosition3.Menge = '';
      drinkPosition3.UnterPosPreis = String(drink.licensefee * 0.7 / 100000) + ' IUNO';
      drinkPosition3.Preis = '';
      drinkPosition3.Gesamt = '';

      let drinkPosition4: DrinkPosition;
      drinkPosition4 = new DrinkPosition();
      drinkPosition4.Artikel = '*Zubereitung';
      drinkPosition4.Pos = '';
      drinkPosition4.Menge = '';
      drinkPosition4.UnterPosPreis = String((drink.retailPrice - drink.licensefee) / 100000) + ' IUNO';
      drinkPosition4.Preis = '';
      drinkPosition4.Gesamt = '';


      const posArray: Array<DrinkPosition> = Array(4);
      posArray[0] = drinkPosition1;
      posArray[1] = drinkPosition2;
      posArray[2] = drinkPosition3;
      posArray[3] = drinkPosition4;

      return posArray;
    });
  }

  disconnect() {
  }
}

