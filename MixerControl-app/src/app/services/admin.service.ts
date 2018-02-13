import {Injectable} from '@angular/core';
import {Headers, Http, Response, RequestOptions} from '@angular/http';
import {Pump} from '../models/Pump';
import {TdmProgram} from '../juice-program-configurator/models/tdmprogram';


@Injectable()
export class AdminService {
    private adminUrl = 'api/admin/';  // URL to web api

    constructor(private http: Http) {
    }


    resumeProduction(): Promise<Number> {
        let url = `${this.adminUrl}production/resume`;
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        let body = "";
        return this.http.post(url, body, options).toPromise().then(response => response.status);
    }

    pauseProduction(): Promise<Number> {
        let url = `${this.adminUrl}production/pause`;
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        let body = "";
        return this.http.post(url, body, options).toPromise().then(response => response.status);
    }

    startProcessing(): Promise<Number> {
        let url = `${this.adminUrl}production/startConfirm`;
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        let body = "";
        return this.http.post(url, body, options).toPromise().then(response => response.status);
    }

    setServiceMode(active: boolean): Promise<Number> {
        let url = `${this.adminUrl}pumps/service`;

        let body = "false";
        if (active) {
            body = "true";
        }

        return this.http.post(url, body, null).toPromise().then(response => response.status);
    }

    getPumps(): Promise<Pump[]> {
        let url = `${this.adminUrl}pumps`;
        return this.http
            .get(url)
            .toPromise()
            .then(response => response.json() as Pump[])
            .catch(this.handleError);
    }

    setPump(pumpId: string, componentId: string): Promise<number> {
        let url = `${this.adminUrl}pumps/${pumpId}`;
        // let headers = new Headers({ 'Content-Type': 'application/json' });
        // let options = new RequestOptions({ headers: headers });
        let body = componentId;
        return this.http.put(url, body, null).toPromise().then(response => response.status);
    }

    activatePump(pumpId: string, activate: boolean) {
        let url = `${this.adminUrl}pumps/${pumpId}/active`;
        // let headers = new Headers({ 'Content-Type': 'application/json' });
        // let options = new RequestOptions({ headers: headers });
        let body = activate ? 'true' : 'false';
        return this.http.post(url, body, null).toPromise().then(response => response.status);
    }

    getStandardAmounts(): Promise<any> {
        let url = `${this.adminUrl}pumps/standardAmount`;
        return this.http
            .get(url)
            .toPromise()
            .then(response => response.json() as any[])
    }

    resetComponent(pumpId: string, amount: string): Promise<Response> {
        let url = `${this.adminUrl}pumps/${pumpId}/amount`;
        let body = amount;
        return this.http.put(url, body, null).toPromise();
    }

    setStandardAmount(pumpId: string, amount: string): Promise<Response> {
        let url = `${this.adminUrl}pumps/${pumpId}/standardAmount`;
        let body = amount;
        return this.http.put(url, body, null).toPromise();
    }

    runProgram(program: TdmProgram) {
        let url = `${this.adminUrl}program`;
        return this.http.post(url, program.getJSON()).toPromise();
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }
}
