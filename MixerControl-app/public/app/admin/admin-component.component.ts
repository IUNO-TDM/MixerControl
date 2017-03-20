/**
 * Created by goergch on 01.03.17.
 */

import {Component, OnInit, OnDestroy} from '@angular/core';
import * as models from '../models/models';
import {ComponentService} from '../services/component.service';
import {AdminService} from '../services/admin.service'
import {SocketService} from '../services/socketio.service'

import {Subscription} from "rxjs";

@Component({
    moduleId: module.id,
    selector: 'my-admin-component',
    templateUrl: 'admin-component.template.html',
    providers: [ComponentService, AdminService, SocketService]
})

export class AdminComponentComponent implements OnInit,OnDestroy {
    components: models.Component[];
    pumps: models.Pump[];
    amountWarningConnection: Subscription;
    warnings = {};

    selectedValue: Component[] = null;
    constructor(private componentService: ComponentService, private adminService: AdminService,
                private socketService: SocketService){}
    ngOnInit(): void{
        this.componentService.getComponents().then(components => this.components = components);
        this.adminService.getPumps().then(pumps => this.pumps = pumps);
        this.amountWarningConnection = this.socketService.get("/production","amountWarning","warning").subscribe(warning=>
            this.warnings[warning.pumpNr] = warning.amountLeft);
    }
    ngOnDestroy(): void{

    }
    onPumpChange($event:any, nr:string) {
        console.log(this.pumps);
        var pump: models.Pump = null;
        for(var i = 0; i< this.pumps.length;i++){
            if(this.pumps[i].nr == nr){
                pump = this.pumps[i];
            }
        }
        this.adminService.setPump(nr,pump.component.id);
        // I want to do something here for new selectedDevice, but what I
        // got here is always last selection, not the one I just select.
    }
}