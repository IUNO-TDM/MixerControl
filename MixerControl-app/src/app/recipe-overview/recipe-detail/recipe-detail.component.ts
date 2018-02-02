import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import * as models from '../../models/models';
import {Router} from '@angular/router';
import {Order} from '../../models/Order';
import {OrderService} from '../../services/order.service';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css'],
  providers: [OrderService]
})
export class RecipeDetailComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<RecipeDetailComponent>, @Inject(MAT_DIALOG_DATA) public data, private router: Router, private orderService: OrderService) {
    this.drink = data.drink;
    this.user = data.user;
  }

  drink: models.Drink;
  user: models.User;

  ngOnInit() {
  }

  order() {
    const order = new Order();
    order.drinkId = this.drink.id;
    order.orderName = 'Detlef Drinker';
    this.orderService.createOrder(order).then(orderLocation => {

      const orderURL = orderLocation;
      const orderNumber = orderURL.split('/').pop();

      this.router.navigateByUrl(`/orders/${orderNumber}`);
      this.dialogRef.close();
    });
  }

  setStyles() {
    const styles = {
      'background-color': this.data.backgroundColor
    };
    return styles;
  }
}
