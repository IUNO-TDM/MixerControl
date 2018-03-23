import { Injectable } from '@angular/core';

import 'rxjs/add/operator/toPromise';

import {Drink} from '../models/Drink';
import {Observable} from 'rxjs/Observable';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class DrinkService {
  private drinksUrl = 'api/drinks';  // URL to web api

  constructor(private http: HttpClient) { }

  getDrinks(): Observable<Drink[]> {
    return this.http.get<Drink[]>(this.drinksUrl);
  }

  getDrink(id: string): Observable<Drink> {
    const url = `${this.drinksUrl}/${id}`;
    return this.http.get<Drink>(url);
  }
}
