import {Component, OnInit, ViewChild} from '@angular/core';
import {AdminService} from '../../services/admin.service';
import {ProductionSocketService} from '../../services/production-socket.service';
import {Subscription} from 'rxjs/Subscription';

import {TdmCocktailProgram, TdmCocktailComponent, TdmCocktailComponentService} from 'tdm-common'
import {BeakerComponent, ComponentListDialogComponent, DragAndDropService} from 'cocktail-configurator'
import {MatDialog} from '@angular/material';

@Component({
    selector: 'app-admin-recipe',
    templateUrl: './admin-recipe.component.html',
    styleUrls: ['./admin-recipe.component.css'],
    providers: [AdminService, ProductionSocketService, DragAndDropService, TdmCocktailComponentService]
})
export class AdminRecipeComponent implements OnInit {
    @ViewChild(BeakerComponent) beaker: BeakerComponent;

    pcModeConnection: Subscription;
    pcMode: string;
    cocktail: TdmCocktailProgram;
    components: TdmCocktailComponent[] = [];

    showRecommendedComponents = false
    showInstalledComponents = true
    showAvailableComponents = false

    constructor(private componentService: TdmCocktailComponentService,
                public dialog: MatDialog,
                private adminService: AdminService,
                private productionSocketService: ProductionSocketService) {
        this.cocktail = new TdmCocktailProgram();
        this.cocktail.amount = 100;
    }

    ngOnInit() {
        this.pcModeConnection = this.productionSocketService.getUpdates('pumpControlMode')
            .subscribe(state => {
                this.pcMode = state;
            });
        this.productionSocketService.joinRoom('pumpControlMode');
        // this.beaker.setEditMode(true);
    }

    ngOnDestroy(): void {
        if (this.pcModeConnection) {
            this.pcModeConnection.unsubscribe();
        }
    }

    onProduce() {
        this.adminService.runProgram(this.cocktail).subscribe(status => {
        });
    }

    onToggleEdit() {
        this.beaker.setEditMode(!this.beaker.editMode);
    }

    selectComponent(callback: (component: TdmCocktailComponent) => any) {
        let dialogRef = this.dialog.open(ComponentListDialogComponent, {
            width: '300px',
            data: {
                showRecommended: this.showRecommendedComponents,
                showInstalled: this.showInstalledComponents,
                showAvailable: this.showAvailableComponents,
            },
            autoFocus: false
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                callback(result)
            }
        });
    }

}
