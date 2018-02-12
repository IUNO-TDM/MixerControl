import {Component, OnInit} from '@angular/core';
import {Component as TdmComponent} from '../../models/Component';
import {TdmProgram} from '../../juice-program-configurator/models/tdmprogram';
import {ComponentService} from "../../services/component.service";
import {AdminService} from "../../services/admin.service";
import {Subscription} from "rxjs/Rx";
import {ProductionSocketService} from "../../services/production-socket.service";

@Component({
    selector: 'app-admin-recipe',
    templateUrl: './admin-recipe.component.html',
    styleUrls: ['./admin-recipe.component.css'],
    providers: [ComponentService, AdminService, ProductionSocketService]
})
export class AdminRecipeComponent implements OnInit {

    pcModeConnection: Subscription;
    components: TdmComponent[];
    program = new TdmProgram();
    pcMode: string;

    constructor(
        private componentService: ComponentService,
        private adminService: AdminService,
        private productionSocketService: ProductionSocketService
        ) {}

    ngOnInit() {

        this.componentService.getComponents(false).then(components => this.components = components);

        this.pcModeConnection = this.productionSocketService.getUpdates('pumpControlMode')
            .subscribe(state => {
                this.pcMode = state;
            });
    }

    onProduce() {
        this.adminService.runProgram(this.program);
    }

}
