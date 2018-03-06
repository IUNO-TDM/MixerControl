import {Component, OnInit, ViewChild} from '@angular/core';
import {AdminService} from '../../services/admin.service';
import {ProductionSocketService} from '../../services/production-socket.service';
import {Subscription} from 'rxjs/Subscription';

import {Cocktail} from 'tdm-common'
import {CocktailComponent} from 'tdm-common'
import {ComponentService} from 'tdm-common'
import {BeakerComponent, DragAndDropService} from 'cocktail-configurator'

@Component({
    selector: 'app-admin-recipe',
    templateUrl: './admin-recipe.component.html',
    styleUrls: ['./admin-recipe.component.css'],
    providers: [AdminService, ProductionSocketService, DragAndDropService]
})
export class AdminRecipeComponent implements OnInit {
    @ViewChild(BeakerComponent) beaker: BeakerComponent;

    pcModeConnection: Subscription;
    pcMode: string;
    cocktail: Cocktail;
    components: CocktailComponent[] = [];


    constructor(private componentService: ComponentService,
                private adminService: AdminService,
                private productionSocketService: ProductionSocketService) {
        this.cocktail = new Cocktail();
        this.cocktail.amount = 100;
        componentService.setRecommendComponentIds([
            '198f1571-4846-4467-967a-00427ab0208d',
            '570a5df0-a044-4e22-b6e6-b10af872d75c'
        ])
    }

    ngOnInit() {
        this.pcModeConnection = this.productionSocketService.getUpdates('pumpControlMode')
            .subscribe(state => {
                this.pcMode = state;
            });
        this.productionSocketService.joinRoom('pumpControlMode');
        this.beaker.setEditMode(true);
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


}
