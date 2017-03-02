import { Injectable } from '@angular/core';
import { Headers, Http, Response, RequestOptions } from '@angular/http';
import {Pump} from '../models/models';


@Injectable()
export class AdminService {
    private adminUrl = 'api/admin/';  // URL to web api

    constructor(private http: Http) { }


    resumeProduction():Promise<Number>{
        let url = `${this.adminUrl}production/resume`;
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        let body = "";
        return this.http.post(url, body, options).
        toPromise().then(response => response.status);
    }
    pauseProduction():Promise<Number>{
        let url = `${this.adminUrl}production/pause`;
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        let body = "";
        return this.http.post(url, body, options).
        toPromise().then(response => response.status);
    }

    startProcessing():Promise<Number>{
        let url = `${this.adminUrl}production/startConfirm`;
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        let body = "";
        return this.http.post(url, body, options).
        toPromise().then(response => response.status);
    }

    getPumps():Promise<Pump[]>{
        let url = `${this.adminUrl}pumps`;
        return this.http
            .get(url)
            .toPromise()
            .then(response => response.json() as Pump[])
            .catch(this.handleError);
    }
    setPump(pumpId: string, componentId: string):Promise<number>{
        let url = `${this.adminUrl}pumps/${pumpId}`;
        // let headers = new Headers({ 'Content-Type': 'application/json' });
        // let options = new RequestOptions({ headers: headers });
        let body = componentId;
        return this.http.put(url, body, null).
        toPromise().then(response => response.status);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }
}
