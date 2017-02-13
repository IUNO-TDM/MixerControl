import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router }   from '@angular/router';
import 'rxjs/add/operator/switchMap';
import {Drink} from '../models/Drink'
import {User} from '../models/User'
import {Order} from '../models/Order'
import {DrinkService} from '../services/drink.service'
import {UserService} from '../services/user.service'
import {OrderService} from '../services/order.service'
import {SocketService} from '../services/socketio.service'


@Component({
  moduleId: module.id,
  selector: 'my-drinkDetail',
  templateUrl: 'drink-detail.template.html',
  providers: [DrinkService, UserService, OrderService, SocketService]
})

export class DrinkDetailComponent implements OnInit {
  drink: Drink;
  user: User;
  error: any;
  orderURL = "NULL";

  constructor(private route: ActivatedRoute,
              private router: Router,
              private drinkService: DrinkService,
              private userService: UserService,
              private orderService: OrderService,
              private socketService: SocketService) {
  }


  ngOnInit(): void {
    this.route.params.switchMap((params: Params) => this.drinkService.getDrink(params['id']))
      .subscribe(drink => {
        this.drink = drink;
        this.userService.getUser(this.drink.authorId).then(user => this.user = user)
          .catch(error => this.error = error);
      });

  }

  onClickMe() {
    var order = new Order();
    order.drinkId = this.drink.id;
    order.orderName = "Detlef Drinker";
    this.orderService.createOrder(order).then(orderLocation => {

      this.orderURL = orderLocation;
      let orderNumber = this.orderURL.split('/').pop();

      this.router.navigateByUrl(`/orders/${orderNumber}`);
    });
  }
}
