import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {ComponentService} from 'tdm-common';
import {CocktailComponent} from "tdm-common/app/model/cocktail";

@Component({
    selector: 'component-dialog',
    templateUrl: './admin-component-dialog.template.html',
    styleUrls: ['./admin-component-dialog.component.css'],
})
export class AdminComponentDialogComponent implements OnInit {
    pumpNr = 1;
    initialComponentId = '';
    components: CocktailComponent[];
    recommendedComponents: CocktailComponent[];
    visibleComponents: CocktailComponent[] = [];
    queryString = "";

    selectedValue: string;

    constructor(public dialogRef: MatDialogRef<AdminComponentDialogComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any,
                private componentService: ComponentService) {

        this.pumpNr = data.pumpNr;
        this.initialComponentId = data.componentId
        // this.oldComponent = data.oldComponent;
        this.selectedValue = this.initialComponentId;
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
                function (x: CocktailComponent, y: CocktailComponent) {
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
            function (x: CocktailComponent, y: CocktailComponent) {
                return x.name < y.name ? -1 : 1;
            }
        );
        this.visibleComponents = visibles;
    }
}
