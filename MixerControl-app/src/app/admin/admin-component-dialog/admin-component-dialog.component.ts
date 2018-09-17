import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {TdmCocktailComponentService} from 'tdm-common';
import {TdmCocktailComponent} from "tdm-common";

@Component({
    selector: 'component-dialog',
    templateUrl: './admin-component-dialog.template.html',
    styleUrls: ['./admin-component-dialog.component.css'],
})
export class AdminComponentDialogComponent implements OnInit {
    pumpNr = 1;
    components: TdmCocktailComponent[];
    recommendedComponents: TdmCocktailComponent[];
    visibleComponents: TdmCocktailComponent[] = [];
    queryString = "";

    selectedValue: string;

    constructor(public dialogRef: MatDialogRef<AdminComponentDialogComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any,
                private componentService: TdmCocktailComponentService) {

        this.pumpNr = data.pumpNr;
        this.selectedValue = data.componentId;
    }

    ngOnInit() {
        this.componentService.availableComponents.subscribe(c => {
                this.components = c;
                this.updateVisibleComponents();
            }
        );
        this.componentService.recommendedComponents.subscribe(c => {
            this.recommendedComponents = c;
            this.recommendedComponents.sort(
                function (x: TdmCocktailComponent, y: TdmCocktailComponent) {
                    return x.name < y.name ? -1 : 1;
                }
            );
        });
    }

    updateVisibleComponents() {
        let visibles = this.components.filter(component => {
            return component.name.toUpperCase().indexOf(this.queryString.toUpperCase()) != -1;
        });

        visibles.sort(
            function (x: TdmCocktailComponent, y: TdmCocktailComponent) {
                return x.name < y.name ? -1 : 1;
            }
        );
        this.visibleComponents = visibles;
    }
}
