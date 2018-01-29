import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import {Component} from '../models/models';

@Injectable()
export class ComponentService {
    private componentsUrl = 'api/components';  // URL to web api

    constructor(private http: Http) { }

    getComponents(filtered): Promise<Component[]> {
        let url = this.componentsUrl;
        if (filtered) {
            url = `${this.componentsUrl}/?filtered=true`;
        }
        return this.http
            .get(url)
            .toPromise()
            .then(response => response.json() as Component[])
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }
}
