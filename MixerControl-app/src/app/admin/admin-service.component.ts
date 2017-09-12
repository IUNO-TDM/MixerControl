/**
 * Created by goergch on 02.03.17.
 */

import {Component, OnInit, OnDestroy} from '@angular/core';

import {SocketService} from "../services/socketio.service";
import {AdminService} from "../services/admin.service"
import {Subscription} from "rxjs";
import {Pump} from "../models/models";
@Component({
    moduleId: module.id,
    selector: 'my-admin-service',
    templateUrl: 'admin-service.template.html',
    providers: [SocketService, AdminService]
})

export class AdminServiceComponent implements OnInit,OnDestroy {
    pcServiceStateConnection: Subscription;
    pcModeConnection: Subscription;
    pqStateConnection: Subscription;
    pcServiceState: string;
    pqState: string;
    pcMode: string;
    pumps: Pump[];

    constructor(private socketService: SocketService, private adminService: AdminService) {
    };

    ngOnInit() {
      console.log("init service");
        this.pqStateConnection = this.socketService.get("/production","state","state")
            .subscribe(state => {
              this.pqState = state;
              console.log("pqState: " + state);
            });
        this.pcServiceStateConnection = this.socketService.get("/production","pumpControlService","pumpControlServiceState")
            .subscribe(state => {
              this.pcServiceState = state;
              console.log("pcServiceState: " + state);
            });
        this.pcModeConnection = this.socketService.get("/production","pumpControlMode","pumpControlMode")
            .subscribe(state => {
              this.pcMode = state;
              console.log("pcMode: " + state);
            });

        this.adminService.getPumps().then(pumps=> this.pumps = pumps);
    };

    ngOnDestroy(){
      console.log("destroy service");
        this.pcModeConnection.unsubscribe();
        this.pcServiceStateConnection.unsubscribe();
        this.pqStateConnection.unsubscribe();
    };

    ActivateService(){
        this.adminService.setServiceMode(true);
    }

    DeactivateService(){
        this.adminService.setServiceMode(false);
    }

    SetPump(nr: string, activate: boolean ){
        this.adminService.activatePump(nr,activate);
    }
    SetAllPumps(activate:boolean){
        for(var i=0; i< this.pumps.length;i++){
            this.adminService.activatePump(this.pumps[i].nr,activate);
        }
    }
}