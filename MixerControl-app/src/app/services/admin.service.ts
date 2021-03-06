import {Injectable} from '@angular/core';
import {Pump} from '../models/Pump';
import {Observable} from 'rxjs/Observable';
import {Balance} from '../models/Balance';
import {HttpClient, HttpResponse, HttpHeaders} from '@angular/common/http';
import {TdmCocktailProgram} from 'tdm-common';


@Injectable()
export class AdminService {
    private adminUrl = '/api/admin/';  // URL to web api

    constructor(private http: HttpClient) {
    }


    hasStartButton(): Observable<boolean> {
        const url = `${this.adminUrl}startbutton`;
        return this.http.get<boolean>(url);
    }

    getWalletBalance(): Observable<Balance> {
        const url = `${this.adminUrl}wallet/balance`;
        return this.http.get<Balance>(url);
    }


    resumeProduction(): Observable<HttpResponse<Object>> {
        const url = `${this.adminUrl}production/resume`;

        return this.http.post(url, {}, {responseType: 'text', observe: 'response'});
    }

    pauseProduction(): Observable<HttpResponse<Object>> {
        const url = `${this.adminUrl}production/pause`;

        return this.http.post(url, {}, {responseType: 'text', observe: 'response'});
    }

    startProcessing(): Observable<HttpResponse<Object>> {
        const url = `${this.adminUrl}production/startConfirm`;
        return this.http.post(url, {}, {responseType: 'text', observe: 'response'});
    }

    setServiceMode(active: boolean): Observable<HttpResponse<Object>> {
        const url = `${this.adminUrl}pumps/service`;
        const body = active ? 'true' : 'false';

        return this.http.post(url, body, {responseType: 'text', observe: 'response'});
    }

    getPumps(): Observable<Pump[]> {
        const url = `${this.adminUrl}pumps`;
        return this.http.get<Pump[]>(url);
    }

    setPump(pumpId: string, componentId: string): Observable<HttpResponse<Object>> {
        const url = `${this.adminUrl}pumps/${pumpId}`;
        const body = componentId;

        return this.http.put(url, body, {responseType: 'text', observe: 'response'});
    }

    activatePump(pumpId: string, activate: boolean): Observable<HttpResponse<Object>> {
        const url = `${this.adminUrl}pumps/${pumpId}/active`;
        const body = activate ? 'true' : 'false';

        return this.http.post(url, body, {responseType: 'text', observe: 'response'});
    }

    getStandardAmounts(): Observable<object> {
        const url = `${this.adminUrl}pumps/standardAmount`;
        return this.http.get(url);
    }

    resetComponent(pumpId: string, amount: string): Observable<HttpResponse<Object>> {
        const url = `${this.adminUrl}pumps/${pumpId}/amount`;
        let headers = new HttpHeaders({
            'Content-Type': 'text/plain'
        })
        return this.http.post(url, amount, {
            headers: headers,
            responseType: 'text', observe: 'response'
        });
    }

    setStandardAmount(pumpId: string, amount: string): Observable<HttpResponse<Object>> {
        const url = `${this.adminUrl}pumps/${pumpId}/standardAmount`;
        let headers = new HttpHeaders({
            'Content-Type': 'text/plain'
        })
        return this.http.post(url, amount, {
            headers: headers,
            responseType: 'text', observe: 'response'
        });
    }

    runProgram(cocktail: TdmCocktailProgram): Observable<HttpResponse<Object>> {
        const url = `${this.adminUrl}program`;
        return this.http.post(url, cocktail.getMachineProgram(), {responseType: 'text', observe: 'response'});
    }

    getStatisticsEnabled(): Observable<boolean> {
        const url = `${this.adminUrl}statistics/enabled`;
        return this.http.get<boolean>(url);
    }

    setStatisticsEnabled(value): Observable<HttpResponse<Object>> {
        const url = `${this.adminUrl}statistics/enabled`;
        return this.http.put(url, value, {responseType: 'text', observe: 'response'});
    }

}
