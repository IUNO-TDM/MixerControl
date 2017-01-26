import { Injectable } from '@angular/core';
import { Headers, Http, Response, RequestOptions } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import {Order} from '../models/Order';

@Injectable()
export class OrderService {
  private ordersUrl = 'api/orders/';  // URL to web api

  constructor(private http: Http) { }
  //
  // getDrinks(): Promise<Drink[]> {
  //   return this.http
  //     .get(this.drinksUrl)
  //     .toPromise()
  //     .then(response => response.json() as Drink[])
  //     .catch(this.handleError);
  // }
  //
  getOrder(id: string): Promise<Order> {
    let url = `${this.ordersUrl}/${id}`;
    return this.http
      .get(url)
      .toPromise()
      .then(response => {
        let order =  response.json() as Order;
        console.log(order);
        return order;
      })
      .catch(this.handleError);
  }


  createOrder(order: Order): Promise<string>{
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    let body = JSON.stringify(order);
    return this.http.post(this.ordersUrl, body, options).
      toPromise().then(response => response.headers.get("Location"));
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
