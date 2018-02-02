import {Component, OnInit, HostListener} from '@angular/core';
import {Router} from '@angular/router';

import {DrinkService} from '../services/drink.service';
import {UserService} from '../services/user.service';
import {ComponentService} from '../services/component.service';
import * as models from '../models/models';

@Component({
  moduleId: module.id,
  selector: 'my-drinkList',
  templateUrl: 'drink-list.template.html',
  providers: [DrinkService, UserService, ComponentService],
  styleUrls: ['./drink-list.component.css'],
})


export class DrinkListComponent implements OnInit {
  drinks: models.Drink[] = [];
  users: models.User[] = [];
  error: any;
  gridcols: any = 2;
  components: models.Component[] = [];
  filterComponents: any;

  constructor(private componentService: ComponentService,
              private router: Router,
              private drinkService: DrinkService,
              private userService: UserService) {
  }

  refreshUsers(): void {
    const loadingUser = new models.User();
    loadingUser.firstname = 'User';
    loadingUser.lastname = 'Loading';
    for (const drink of this.drinks) {
      if (!this.users[drink.authorId]) {
        this.users[drink.authorId] = loadingUser;
        this.userService.getUser(drink.authorId).then(user => {
          this.users[drink.authorId] = user;
        });
      }

    }
  }

  getDrinks(): void {
    this.drinkService
      .getDrinks().subscribe(drinks => {
        this.drinks = drinks;
        this.refreshUsers();
      }, error2 => this.error = error2);
    return;
  }

  getBack(): void {
    this.router.navigateByUrl('/');
  }


  ngOnInit(): void {
    this.getDrinks();
    this.resize(window.innerWidth);
    this.componentService.getComponents(true).then(components => this.components = components);
  }

  resize(width) {
    if (width < 300) {
      this.gridcols = 1;
    } else if (width < 600) {
      this.gridcols = 2;
    } else if (width < 900) {
      this.gridcols = 3;
    } else {
      this.gridcols = 4;

    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event) {
    const element = event.target.innerWidth;
    console.log('window resize ' + element);
    this.resize(element);

  }

}
