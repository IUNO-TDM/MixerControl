import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {Drink} from '../models/Drink'
import {DrinkService} from '../services/drink.service'


@Component({
  moduleId: module.id,
  selector: 'my-drinkList',
  templateUrl: 'drink-list.template.html',
  providers: [DrinkService]
})

export class DrinkListComponent implements OnInit {
  drinks: Drink[];
  error: any;

  constructor(
    private router: Router,
    private drinkService: DrinkService
  ) { }

  getDrinks(): void {
    this.drinkService
      .getDrinks()
      .then(drinks => this.drinks = drinks)
      .catch(error=> this.error = error);
    return;
  }

  ngOnInit(): void{
    this.getDrinks();
  }
}
