/**
 * Created by goergch on 01.03.17.
 */

import {Component, OnInit, OnDestroy} from '@angular/core';
import * as models from '../models/models';
import {ComponentService} from '../services/component.service';
import {AdminService} from '../services/admin.service'


@Component({
    moduleId: module.id,
    selector: 'my-admin-component',
    templateUrl: 'admin-component.template.html',
    providers: [ComponentService, AdminService]
})

export class AdminComponentComponent implements OnInit,OnDestroy {
    components: models.Component[];
    pumps: models.Pump[];
    selectedValue: Component[] = null;
    constructor(private componentService: ComponentService, private adminService: AdminService){}
    ngOnInit(): void{
        this.componentService.getComponents().then(components => this.components = components);
        this.adminService.getPumps().then(pumps => this.pumps = pumps);
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