import {Injectable} from '@angular/core';
import {Pump} from '../models/Pump';
import {TdmProgram} from '../juice-program-configurator/models/tdmprogram';
import {Observable} from 'rxjs/Observable';
import {Balance} from '../models/Balance';
import {HttpClient, HttpResponse} from '@angular/common/http';


@Injectable()
export class AdminService {
    private adminUrl = 'api/admin/';  // URL to web api

    constructor(private http: HttpClient) {
    }


    getWalletBalance(): Observable<Balance> {
        const url = `${this.adminUrl}wallet/balance`;
        return this.http.get<Balance>(url);
    }


    resumeProduction(): Observable<number> {
        const url = `${this.adminUrl}production/resume`;

        return this.http.post(url, {}, {observe: 'response'}).map((response: HttpResponse<Object>) => response.status);
    }

    pauseProduction(): Observable<any> {
        const url = `${this.adminUrl}production/pause`;

        return this.http.post(url, {}, {observe: 'response'}).map((response: HttpResponse<Object>) => response.status);
    }

    startProcessing(): Observable<Number> {
        const url = `${this.adminUrl}production/startConfirm`;
        return this.http.post(url, {}, {observe: 'response'}).map((response: HttpResponse<Object>) => response.status);
    }

    setServiceMode(active: boolean): Observable<Number> {
        const url = `${this.adminUrl}pumps/service`;
        const body = active ? 'true' : 'false';

        return this.http.post(url, body, {observe: 'response'}).map((response: HttpResponse<Object>) => response.status);
    }

    getPumps(): Observable<Pump[]> {
        const url = `${this.adminUrl}pumps`;
        return this.http.get<Pump[]>(url);
    }

    setPump(pumpId: string, componentId: string): Observable<number> {
        const url = `${this.adminUrl}pumps/${pumpId}`;
        const body = componentId;

        return this.http.post(url, body, {observe: 'response'}).map((response: HttpResponse<Object>) => response.status);
    }

    activatePump(pumpId: string, activate: boolean): Observable<number> {
        const url = `${this.adminUrl}pumps/${pumpId}/active`;
        const body = activate ? 'true' : 'false';

        return this.http.post(url, body, {observe: 'response'}).map((response: HttpResponse<Object>) => response.status);
    }

    getStandardAmounts(): Observable<object> {
        const url = `${this.adminUrl}pumps/standardAmount`;
        return this.http.get(url);
    }

    resetComponent(pumpId: string, amount: string): Observable<number> {
        const url = `${this.adminUrl}pumps/${pumpId}/amount`;

        return this.http.post(url, amount, {observe: 'response'}).map((response: HttpResponse<Object>) => response.status);
    }

    setStandardAmount(pumpId: string, amount: string): Observable<number> {
        const url = `${this.adminUrl}pumps/${pumpId}/standardAmount`;

        return this.http.post(url, amount, {observe: 'response'}).map((response: HttpResponse<Object>) => response.status);
    }

    runProgram(program: TdmProgram): Observable<number> {
        const url = `${this.adminUrl}program`;
        return this.http.post<TdmProgram>(url, program.getJSON(), {observe: 'response'}).map((response: HttpResponse<Object>) => response.status);
    }

}
