import { Injectable } from '@angular/core';

import 'rxjs/add/operator/toPromise';

import {Drink} from '../models/Drink';
import {Observable} from "rxjs/Observable";
import {HttpClient} from "@angular/common/http";

@Injectable()
export class DrinkService {
  private drinksUrl = 'api/drinks';  // URL to web api

  constructor(private http: HttpClient) { }

  getDrinks(): Observable<Drink[]> {
    return this.http
      .get<Drink[]>(this.drinksUrl);
  }

  getDrink(id: string): Observable<Drink> {
    let url = `${this.drinksUrl}/${id}`;
    return this.http
      .get<Drink>(url);
  }


  getDrinkBackgroundColor(id: string): Observable<any> {
    let url = `${this.drinksUrl}/${id}/image/backgroundColor`;
    return this.http.get(url,{ responseType: 'text' });
  }


  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
