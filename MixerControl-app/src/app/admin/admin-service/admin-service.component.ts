/**
 * Created by goergch on 02.03.17.
 */

import {Component, OnInit, OnDestroy} from '@angular/core';
import {AdminService} from '../../services/admin.service';
import {Pump} from '../../models/models';
import {ProductionSocketService} from '../../services/production-socket.service';
import {Subscription} from 'rxjs/Subscription';

@Component({
  moduleId: module.id,
  selector: 'my-admin-service',
  templateUrl: 'admin-service.template.html',
  providers: [ProductionSocketService, AdminService]
})

export class AdminServiceComponent implements OnInit, OnDestroy {
  pcServiceStateConnection: Subscription;
  pcModeConnection: Subscription;
  pqStateConnection: Subscription;
  pcServiceState: string;
  pqState: string;
  pcMode: string;
  pumps: Pump[];

  constructor(private productionSocketService: ProductionSocketService, private adminService: AdminService) {
  }

  ngOnInit() {
    console.log('init service');


    this.pqStateConnection = this.productionSocketService.getUpdates('state')
      .subscribe(state => {
        this.pqState = state;
        console.log('pqState: ' + state);
      });
    this.pcServiceStateConnection = this.productionSocketService.getUpdates('pumpControlService')
      .subscribe(state => {
        this.pcServiceState = state;
        console.log('pcServiceState: ' + state);
      });
    this.pcModeConnection = this.productionSocketService.getUpdates('pumpControlMode')
      .subscribe(state => {
        this.pcMode = state;
        console.log('pcMode: ' + state);
      });

    this.adminService.getPumps().subscribe(pumps => this.pumps = pumps);


    this.productionSocketService.joinRoom('state');
    this.productionSocketService.joinRoom('pumpControlService');
    this.productionSocketService.joinRoom('pumpControlMode');

  }

  ngOnDestroy() {
    console.log('destroy service');
    this.pcModeConnection.unsubscribe();
    this.pcServiceStateConnection.unsubscribe();
    this.pqStateConnection.unsubscribe();
  }

  ActivateService() {
    this.adminService.setServiceMode(true);
  }

  DeactivateService() {
    this.adminService.setServiceMode(false);
  }

  SetPump(nr: string, activate: boolean) {
    this.adminService.activatePump(nr, activate);
  }

  SetAllPumps(activate: boolean) {
    for (let i = 0; i < this.pumps.length; i++) {
      this.adminService.activatePump(this.pumps[i].nr, activate);
    }
  }
}
