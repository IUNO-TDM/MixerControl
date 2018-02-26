import {Component, OnInit, ViewChild} from '@angular/core';
import {AdminService} from '../../services/admin.service';
import {ProductionSocketService} from '../../services/production-socket.service';
import {Subscription} from 'rxjs/Subscription';

import {Cocktail} from 'cocktail-configurator'
import {CocktailComponent} from 'cocktail-configurator'
import {CocktailLayer} from 'cocktail-configurator'
import {ComponentService} from 'cocktail-configurator'
import {ComponentListComponent} from 'cocktail-configurator'

@Component({
    selector: 'app-admin-recipe',
    templateUrl: './admin-recipe.component.html',
    styleUrls: ['./admin-recipe.component.css'],
    providers: [AdminService, ProductionSocketService]
})
export class AdminRecipeComponent implements OnInit {

    pcModeConnection: Subscription;
    pcMode: string;
    cocktail: Cocktail;
    components: CocktailComponent[] = [];


    constructor(
        private componentService: ComponentService,
        private adminService: AdminService,
        private productionSocketService: ProductionSocketService
        ) {
        // this.cocktail = new Cocktail();
        // componentService.setComponents([
        //         new CocktailComponent("1", "Apfelsaft", "#7d7"),
        //         new CocktailComponent("2", "Bananensaft", "#dd7"),
        //         new CocktailComponent("3", "Kirschsaft", "#d77"),
        //         new CocktailComponent("4", "Maracujasaft", "#da7"),
        //         new CocktailComponent("5", "Ananassaft", "#dc9"),
        //         new CocktailComponent("6", "Reserved 1", "#ddf"),
        //         new CocktailComponent("7", "Reserved 2", "#ddf"),
        //         new CocktailComponent("8", "Reserved 3", "#ddf"),
        //     ]
        // )
        // componentService.components.subscribe(components => {
        //     this.components = components;
        //     let layer1 = new CocktailLayer();
        //     layer1.components.push(this.components[0]);
        //     this.cocktail.layers.push(layer1);
        //
        //     let layer2 = new CocktailLayer();
        //     layer2.components.push(this.components[2]);
        //     this.cocktail.layers.push(layer2);
        //
        //     let layer3 = new CocktailLayer();
        //     layer3.components.push(this.components[0]);
        //     layer3.components.push(this.components[1]);
        //     layer3.components.push(this.components[0]);
        //     this.cocktail.layers.push(layer3);
        // })
    }

    ngOnInit() {
        this.pcModeConnection = this.productionSocketService.getUpdates('pumpControlMode')
            .subscribe(state => {
                this.pcMode = state;
            });
    }

    onProduce() {
        // this.adminService.runProgram(this.program).subscribe(status => {});
    }

}
