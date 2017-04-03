import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {Drink} from '../models/Drink'
import {DrinkService} from '../services/drink.service'
import {UserService} from '../services/user.service'
import {User} from "../models/User";

@Component({
  moduleId: module.id,
  selector: 'my-drinkList',
  templateUrl: 'drink-list.template.html',
  providers: [DrinkService, UserService]
})

export class DrinkListComponent implements OnInit {
  drinks: Drink[] = [];
  users: User[] = [];
  error: any;

  constructor(
    private router: Router,
    private drinkService: DrinkService,
    private userService: UserService
  ) { }
  refreshUsers(): void{
    let loadingUser = new User();
    loadingUser.firstname = "User";
    loadingUser.lastname = "Loading";
    for(let drink of this.drinks){
      if(!this.users[drink.authorId]){
        this.users[drink.authorId] = loadingUser;
        this.userService.getUser(drink.authorId).then(user => {
          this.users[drink.authorId] = user;
        });
      }

    }
  };
  getDrinks(): void {
    this.drinkService
      .getDrinks()
      .then(drinks => {
        this.drinks = drinks;
        this.refreshUsers();
      })
      .catch(error=> this.error = error);
    return;
  }
  getBack(): void{
      this.router.navigateByUrl("/");
  }

  ngOnInit(): void{
    this.getDrinks();
  }


}
