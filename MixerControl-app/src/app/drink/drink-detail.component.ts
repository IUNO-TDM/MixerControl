import {Component, OnInit, HostListener} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import 'rxjs/add/operator/switchMap';
import {Drink} from '../models/Drink';
import {User} from '../models/User';
import {Order} from '../models/Order';
import {DrinkService} from '../services/drink.service';
import {UserService} from '../services/user.service';
import {OrderService} from '../services/order.service';


@Component({
  moduleId: module.id,
  selector: 'my-drinkDetail',
  templateUrl: 'drink-detail.template.html',
  providers: [DrinkService, UserService, OrderService],
  styleUrls: ['./drink-detail.component.css'],
})

export class DrinkDetailComponent implements OnInit {
  drink: Drink;
  user: User;
  error: any;
  orderURL = 'NULL';
  components = '';

  gridcols: any = 2;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private drinkService: DrinkService,
              private userService: UserService,
              private orderService: OrderService) {
  }


  ngOnInit(): void {

    // this.resize(window.innerWidth);
    this.route.params.switchMap((params: Params) => this.drinkService.getDrink(params['id']))
      .subscribe(drink => {
        this.drink = drink;
        const _components: string[] = [];
        for (const entry of this.drink.components) {
          _components.push(entry.name);
        }
        this.components = _components.join(', ');
        this.userService.getUser(this.drink.authorId).then(user => this.user = user)
          .catch(error => this.error = error);
      });

  }

  getBack(): void {
    this.router.navigateByUrl('/drinks');
  }

  onClickMe() {
    const order = new Order();
    order.drinkId = this.drink.id;
    order.orderName = 'Detlef Drinker';
    // this.orderService.createOrder(order).subscribe(orderLocation => {
    //
    //   this.orderURL = orderLocation;
    //   const orderNumber = this.orderURL.split('/').pop();
    //
    //   this.router.navigateByUrl(`/orders/${orderNumber}`);
    // });
  }

}
