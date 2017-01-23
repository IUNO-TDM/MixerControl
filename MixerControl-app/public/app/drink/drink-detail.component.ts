import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params }   from '@angular/router';
import 'rxjs/add/operator/switchMap';
import {Drink} from '../models/Drink'
import {User} from '../models/User'
import {DrinkService} from '../services/drink.service'
import {UserService} from '../services/user.service'


@Component({
  moduleId: module.id,
  selector: 'my-drinkDertail',
  templateUrl: 'drink-detail.template.html',
  providers: [DrinkService, UserService]
})

export class DrinkDetailComponent implements OnInit {
  drink: Drink;
  user: User;
  error: any;

  constructor(
    private route: ActivatedRoute,
    private drinkService: DrinkService,
    private userService: UserService
  ) { }



  ngOnInit(): void{
    this.route.params.
    switchMap((params: Params) => this.drinkService.getDrink(params['id']))
      .subscribe(drink => {
        this.drink = drink;
        this.userService.getUser(this.drink.authorId).then(user => this.user = user)
          .catch(error=> this.error = error);
      });

  }
}
