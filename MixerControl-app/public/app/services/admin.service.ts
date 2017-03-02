import { Injectable } from '@angular/core';
import { Headers, Http, Response, RequestOptions } from '@angular/http';



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

}
