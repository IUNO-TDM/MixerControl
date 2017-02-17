import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router }   from '@angular/router';
import 'rxjs/add/operator/switchMap';
import {Drink} from '../models/Drink'
import {User} from '../models/User'
import {Order} from '../models/Order'
import {DrinkService} from '../services/drink.service'
import {UserService} from '../services/user.service'
import {OrderService} from '../services/order.service'
import {SocketService} from "../services/socketio.service";

@Component({
  moduleId: module.id,
  selector: 'my-order',
  templateUrl: 'order.template.html',
  providers: [DrinkService, UserService, OrderService, SocketService]
})

export class OrderComponent implements OnInit {
  order: Order;
  drink: Drink;
  user: User;
  error: any;
  orderState: string;
  progress: number;

  orderURL = "NULL";
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private drinkService: DrinkService,
    private userService: UserService,
    private orderService: OrderService,
    private socketService: SocketService
  ) { }



  ngOnInit(): void{

    this.route.params.
    switchMap((params: Params) => this.socketService.get("/orders", params['id'], "state"))
      .subscribe(state => {
        this.orderState = state;
      });
    this.route.params.
    switchMap((params: Params) => this.socketService.get("/orders", params['id'], "progress"))
      .subscribe(progress => {
        this.progress = progress['progress'];
      });

    this.route.params.
    switchMap((params: Params) => this.orderService.getOrder(params['id']))
      .subscribe(order => {
        this.order = order;
        this.drinkService.getDrink(order.drinkId).then(drink => {
          this.drink = drink;
          this.userService.getUser(this.drink.authorId).then(user => this.user = user)
            .catch(error => this.error = error);
        })
      });

  }

  ProductionStart(){
    this.route.params.
    switchMap((params: Params) => this.orderService.sendProductionStart(params['id']))
      .subscribe(response => console.log(response));
  }

}
