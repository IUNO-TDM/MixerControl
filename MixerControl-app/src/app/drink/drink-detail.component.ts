import { Component, OnInit, HostListener } from '@angular/core';
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
  providers: [DrinkService, UserService, OrderService, SocketService],
  styleUrls: ['./drink-detail.component.css'],
})

export class DrinkDetailComponent implements OnInit {
  drink: Drink;
  user: User;
  error: any;
  orderURL = "NULL";
  components = "";

  gridcols: any = 2;
  constructor(private route: ActivatedRoute,
              private router: Router,
              private drinkService: DrinkService,
              private userService: UserService,
              private orderService: OrderService,
              private socketService: SocketService) {
  }


  ngOnInit(): void {

    this.resize(window.innerWidth);
    this.route.params.switchMap((params: Params) => this.drinkService.getDrink(params['id']))
      .subscribe(drink => {
        this.drink = drink;
        let _components: string[] = [];
        for (let entry of this.drink.components) {
            _components.push(entry.name);
        }
        this.components = _components.join(', ');
        this.userService.getUser(this.drink.authorId).then(user => this.user = user)
          .catch(error => this.error = error);
      });

  }
 getBack(): void{
      this.router.navigateByUrl("/drinks")
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
  resize(width) {
    if (width < 600) {
      this.gridcols = 2;
    }else if (width < 900) {
      this.gridcols = 3;
    }else {
      this.gridcols = 4;

    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event) {
    const element = event.target.innerWidth;
    console.log("window resize " +  element);
    this.resize(element);

  }


}
