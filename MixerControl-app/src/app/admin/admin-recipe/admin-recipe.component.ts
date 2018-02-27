import {Component, OnInit, ViewChild} from '@angular/core';
import {AdminService} from '../../services/admin.service';
import {ProductionSocketService} from '../../services/production-socket.service';
import {Subscription} from 'rxjs/Subscription';

import {Cocktail} from 'tdm-common'
import {CocktailComponent} from 'tdm-common'
import {ComponentService} from 'tdm-common'
import {DragAndDropService} from 'cocktail-configurator'

@Component({
    selector: 'app-admin-recipe',
    templateUrl: './admin-recipe.component.html',
    styleUrls: ['./admin-recipe.component.css'],
    providers: [AdminService, ProductionSocketService, DragAndDropService]
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
        this.cocktail = new Cocktail();
    }

    ngOnInit() {
        this.pcModeConnection = this.productionSocketService.getUpdates('pumpControlMode')
            .subscribe(state => {
                this.pcMode = state;
            });
    }

    onProduce() {
        this.adminService.runProgram(this.cocktail).subscribe(status => {});
    }

}
