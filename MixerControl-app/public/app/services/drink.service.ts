import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import {Drink} from '../models/Drink';

@Injectable()
export class DrinkService {
  private drinksUrl = 'api/drinks';  // URL to web api

  constructor(private http: Http) { }

  getDrinks(): Promise<Drink[]> {
    return this.http
      .get(this.drinksUrl)
      .toPromise()
      .then(response => response.json() as Drink[])
      .catch(this.handleError);
  }

  getDrink(id: string): Promise<string> {
    let url = `${this.drinksUrl}/${id}`;
    return this.http
      .get(url)
      .toPromise()
      .then(response => {
        let drink =  response.json() as Drink;
        console.log(drink);
        return drink;
      })
      .catch(this.handleError);
  }


  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
