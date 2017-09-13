import { Injectable } from '@angular/core';
import { Headers, Http, Response, RequestOptions } from '@angular/http';

import 'rxjs/add/operator/toPromise';
import { Observable } from "rxjs/Rx";

import {Order} from '../models/Order';

@Injectable()
export class OrderService {
  private ordersUrl = 'api/orders/';  // URL to web api

  constructor(private http: Http) { }

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

  getPaymentRequest(id: string): Promise<string> {
    let url = `${this.ordersUrl}${id}/PaymentRequest`;
    return this.http
      .get(url)
      .toPromise()
      .then(response => {
        let paymentRequest =  response.text();
        console.log(paymentRequest);
        return paymentRequest;
      })
      .catch(this.handleError);
  }

  sendPayment(id: string, payment: string): Promise<Response>{
    let headers = new Headers({ 'Content-Type': 'text/plain' });
    let options = new RequestOptions({ headers: headers });
    let url = `${this.ordersUrl}${id}/Payment`;

    return this.http.put(url,payment, options).toPromise().then(response => {
      return response;
    }).catch(this.handleError)
  }

  sendProductionStart(id: string): Promise<Response>{
    let headers = new Headers({ 'Content-Type': 'text/plain' });
    let options = new RequestOptions({ headers: headers });
    let url = `${this.ordersUrl}${id}/productionStart`;

    return this.http.put(url,"true", options).toPromise();
  }



  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject( error);
  }
}
