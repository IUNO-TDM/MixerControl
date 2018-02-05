import { Injectable } from '@angular/core';

import 'rxjs/add/operator/toPromise';
import { Observable } from 'rxjs/Rx';

import {Order} from '../models/Order';
import {AdressValuePair} from '../models/AdressValuePair';

import {HttpClient, HttpResponse} from '@angular/common/http';
@Injectable()
export class OrderService {
  private ordersUrl = 'api/orders/';  // URL to web api

  constructor(private http: HttpClient) { }

  getOrder(id: string): Observable<Order> {
    const url = `${this.ordersUrl}/${id}`;
    return this.http.get<Order>(url);
  }


  createOrder(order: Order): Observable<string> {
    return this.http.post<Order>(this.ordersUrl, order, { observe: 'response' }).map(response => response.headers.get('Location'));
  }

  getPaymentRequest(id: string): Observable<string> {
    const url = `${this.ordersUrl}${id}/PaymentRequest`;
    return this.http.get(url).map(resp => resp['PaymentRequest']);
  }

  sendPayment(id: string, payment: string): Observable<AdressValuePair> {
    const url = `${this.ordersUrl}${id}/Payment`;

    return this.http.put<AdressValuePair>(url, payment);
  }

  sendProductionStart(id: string): Observable<any> {
    // const headers = new Headers({ 'Content-Type': 'text/plain' });
    // const options = new RequestOptions({ headers: headers });
    const url = `${this.ordersUrl}${id}/productionStart`;

    return this.http.put(url, 'true');
  }
}
