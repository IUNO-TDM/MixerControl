import { Injectable } from '@angular/core';

import 'rxjs/add/operator/toPromise';

import {User} from '../models/User';
import {Observable} from 'rxjs/Observable';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class UserService {
  private usersUrl = 'api/users';  // URL to web api

  constructor(private http: HttpClient) { }

  getUser(id: string): Observable<User> {
    const url = `${this.usersUrl}/${id}`;
    return this.http.get<User>(url);
  }
}
