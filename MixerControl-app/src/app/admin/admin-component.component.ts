/**
 * Created by goergch on 01.03.17.
 */

import {Component, OnInit, OnDestroy} from '@angular/core';
import * as models from '../models/models';
import {ComponentService} from '../services/component.service';
import {AdminService} from '../services/admin.service'
import {SocketService} from '../services/socketio.service'
import {Component as ModelComponent} from '../models/Component'
import {Subscription} from "rxjs";
import {AdminComponentDialogComponent} from "./admin-component-dialog.component";
import {MdDialog, MdDialogRef} from "@angular/material";
import {AdminAmountDialogComponent} from "./admin-amount-dialog.component";

@Component({
  moduleId: module.id,
  selector: 'my-admin-component',
  templateUrl: 'admin-component.template.html',
  providers: [ComponentService, AdminService, SocketService]
})

export class AdminComponentComponent implements OnInit, OnDestroy {
  components: models.Component[];
  pumps: models.Pump[];
  amountWarningConnection: Subscription;
  standardAmounts = {};
  warnings = {};

  selectedValue: ModelComponent[] = null;


  componentDialogRef: MdDialogRef<AdminComponentDialogComponent> | null;
  componentDialogConfig = {
    disableClose: false,
    panelClass: 'custom-overlay-pane-class',
    hasBackdrop: true,
    backdropClass: '',
    width: '',
    height: '',
    position: {
      top: '',
      bottom: '',
      left: '',
      right: ''
    },
    data: {
      pumpNr: '',
      oldComponent: new ModelComponent
    }
  };

  amountDialogRef: MdDialogRef<AdminAmountDialogComponent> | null;
  amountDialogConfig = {
    disableClose: false,
    panelClass: 'custom-overlay-pane-class',
    hasBackdrop: true,
    backdropClass: '',
    width: '',
    height: '',
    position: {
      top: '',
      bottom: '',
      left: '',
      right: ''
    },
    data: {
      pumpNr: '',
      oldAmount: ''
    }
  };


  constructor(private componentService: ComponentService, private adminService: AdminService,
              private socketService: SocketService,
              private dialog: MdDialog) {
  }

  ngOnInit(): void {
    this.loadContent();
    this.amountWarningConnection = this.socketService.get("/production", "amountWarning", "amountWarning").subscribe(warning => {
      this.warnings[warning.pumpNr] = warning;
    });

  }

  ngOnDestroy(): void {

  }

  loadContent(){
    this.componentService.getComponents().then(components => this.components = components);
    this.adminService.getPumps().then(pumps => this.pumps = pumps);
    this.adminService.getStandardAmounts().then(amounts => this.standardAmounts = amounts);

  }

  ResetAmount(pump: models.Pump) {
    this.amountDialogConfig.data.pumpNr = pump.nr;
    this.amountDialogConfig.data.oldAmount = this.standardAmounts[pump.nr];
    this.amountDialogRef = this.dialog.open(AdminAmountDialogComponent, this.amountDialogConfig);

    this.amountDialogRef.afterClosed().subscribe((result: any) => {
      // this.lastAfterClosedResult = result;
      if(result){
        console.log(result);
        if(result.reset){
          this.adminService.resetComponent(pump.nr, result.amount).then(response => console.log(response));
        }
        this.adminService.setStandardAmount(pump.nr, result.amount).then(() => this.loadContent());

      }
      this.amountDialogRef = null;
    });
    //
  }

  ChangeComponent(pump: models.Pump) {
    this.componentDialogConfig.data.pumpNr = pump.nr;
    this.componentDialogConfig.data.oldComponent = pump.component;
    this.componentDialogRef = this.dialog.open(AdminComponentDialogComponent, this.componentDialogConfig);

    this.componentDialogRef.afterClosed().subscribe((result: string) => {
      // this.lastAfterClosedResult = result;
      if(result){
        this.adminService.setPump(pump.nr,result).then(() => this.loadContent());
      }
      this.componentDialogRef = null;
    });
  }
}
