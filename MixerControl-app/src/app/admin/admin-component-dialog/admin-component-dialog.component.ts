import {Component, Inject, OnInit} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {ComponentService} from 'tdm-common';
import {CocktailComponent} from "tdm-common/app/model/cocktail";

@Component({
    selector: 'component-dialog',
    templateUrl: './admin-component-dialog.template.html',
    styleUrls: ['./admin-component-dialog.component.css'],
    providers: [ComponentService]

})
export class AdminComponentDialogComponent implements OnInit {
    pumpNr = 1;
    oldComponent: CocktailComponent;
    components: CocktailComponent[];
    recommendedComponents: CocktailComponent[];
    visibleComponents: CocktailComponent[] = [];
    queryString = "";

    selectedValue: string;

    constructor(public dialogRef: MatDialogRef<AdminComponentDialogComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any,
                private componentService: ComponentService) {

        this.pumpNr = data.pumpNr;
        this.oldComponent = data.oldComponent;
        this.selectedValue = this.oldComponent.id;
    }

    ngOnInit() {

        this.componentService.setComponentSourceUrl('/api/components');
        this.componentService.setRecommendComponentIds(
            [
                "570a5df0-a044-4e22-b6e6-b10af872d75c", // Mineralwasser
                "198f1571-4846-4467-967a-00427ab0208d", // Apfelsaft
                "f6d361a9-5a6f-42ad-bff7-0913750809e4", // Orangensaft
                "fac1ee6f-185f-47fb-8c56-af57cd428aa8", // Mangosaft
                "0425393d-5b84-4815-8eda-1c27d35766cf", // Kirschsaft
                "4cfa2890-6abd-4e21-a7ab-17613ed9a5c9", // Bananensaft
                "14b72ce5-fec1-48ec-83ff-24b124f98dc8", // Maracuijasaft
                "bf2cfd66-5b6f-4655-8e7f-04090308f6db", // Ananassaft
            ]
        );
        this.componentService.components.subscribe(c => {
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
