import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import {User} from '../models/User';

@Injectable()
export class UserService {
  private usersUrl = 'api/users';  // URL to web api

  constructor(private http: Http) { }


  getUser(id: string): Promise<User> {
    let url = `${this.usersUrl}/${id}`;
    return this.http
      .get(url)
      .toPromise()
      .then(response => {
        let drink =  response.json() as User;
        return drink;
      })
      .catch(this.handleError);
  }


  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
