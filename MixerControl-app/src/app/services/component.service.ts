import { Injectable } from '@angular/core';

import 'rxjs/add/operator/toPromise';

import {Component} from '../models/models';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class ComponentService {
    private componentsUrl = 'api/components';  // URL to web api

    constructor(private http: HttpClient) { }

    getComponents(filtered): Observable<Component[]> {
        let url = this.componentsUrl;
        if (filtered) {
            url = `${this.componentsUrl}/?filtered=true`;
        }
        return this.http.get<Component[]>(url);
    }
}
