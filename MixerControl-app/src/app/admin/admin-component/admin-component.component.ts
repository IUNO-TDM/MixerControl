/**
 * Created by goergch on 01.03.17.
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import * as models from '../../models/models';
import {AdminService} from '../../services/admin.service';
import {Component as ModelComponent} from '../../models/Component';
import {AdminComponentDialogComponent} from '../admin-component-dialog/admin-component-dialog.component';
import {MatDialog, MatDialogRef, MatTableDataSource} from '@angular/material';
import {AdminAmountDialogComponent} from '../admin-amount-dialog/admin-amount-dialog.component';
import {ProductionSocketService} from '../../services/production-socket.service';
import {Subscription} from 'rxjs/Subscription';
import {DataSource} from '@angular/cdk/collections';

@Component({
    moduleId: module.id,
    selector: 'my-admin-component',
    templateUrl: 'admin-component.template.html',
    providers: [AdminService, ProductionSocketService]
})

export class AdminComponentComponent implements OnInit, OnDestroy {
    components: models.Component[];
    pumps: models.Pump[];
    amountWarningConnection: Subscription;
    standardAmounts = {};
    warnings = {};
    displayedColumns = ['id', 'component', 'amount', 'buttons'];
    dataSource = new MatTableDataSource(this.pumps)
    selectedValue: ModelComponent[] = null;


    componentDialogRef: MatDialogRef<AdminComponentDialogComponent> | null;
    componentDialogConfig = {
        disableClose: false,
        panelClass: 'custom-overlay-pane-class',
        hasBackdrop: true,
        backdropClass: '',
        width: '400px',
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

    amountDialogRef: MatDialogRef<AdminAmountDialogComponent> | null;
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


    constructor(private adminService: AdminService,
                private productionSocketService: ProductionSocketService,
                private dialog: MatDialog) {
    }

    ngOnInit(): void {
        this.loadContent();
        this.productionSocketService.joinRoom('amountWarning');
        this.productionSocketService.getUpdates('amountWarning').subscribe(warning => {
            // this.amountWarningConnection = this.socketService.get("/production", "amountWarning", "amountWarning").subscribe(warning => {
            this.warnings[warning.pumpNr] = warning;
        });

    }

    ngOnDestroy(): void {

    }

    loadContent() {
        this.adminService.getPumps().subscribe(pumps => {
            this.pumps = pumps
            this.dataSource = new MatTableDataSource(this.pumps)
        });
        this.adminService.getStandardAmounts().subscribe(amounts => this.standardAmounts = amounts);

    }

    ResetAmount(pump: models.Pump) {
        this.amountDialogConfig.data.pumpNr = pump.nr;
        this.amountDialogConfig.data.oldAmount = this.standardAmounts[pump.nr];
        this.amountDialogRef = this.dialog.open(AdminAmountDialogComponent, this.amountDialogConfig);

        this.amountDialogRef.afterClosed().subscribe((result: any) => {
            // this.lastAfterClosedResult = result;
            if (result) {
                console.log(result);
                if (result.reset) {
                    this.adminService.resetComponent(pump.nr, result.amount).subscribe(response => console.log(response));
                }
                this.adminService.setStandardAmount(pump.nr, result.amount).subscribe(() => this.loadContent());

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
            if (result) {
                this.adminService.setPump(pump.nr, result).subscribe(() => this.loadContent());
            }
            this.componentDialogRef = null;
        });
    }
}
