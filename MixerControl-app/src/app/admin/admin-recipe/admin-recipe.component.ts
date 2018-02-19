import {Component, OnInit, ViewChild} from '@angular/core';
import {Component as TdmComponent} from '../../models/Component';
import {TdmProgram} from '../../juice-program-configurator/models/tdmprogram';
import {ComponentService} from '../../services/component.service';
import {AdminService} from '../../services/admin.service';
import {ProductionSocketService} from '../../services/production-socket.service';
import {JuiceProgramConfiguratorComponent} from '../../juice-program-configurator/juice-program-configurator.component';
import {Subscription} from 'rxjs/Subscription';
import {createErrorResponse} from "../../../../public/scripts/angular-in-memory-web-api";

@Component({
    selector: 'app-admin-recipe',
    templateUrl: './admin-recipe.component.html',
    styleUrls: ['./admin-recipe.component.css'],
    providers: [ComponentService, AdminService, ProductionSocketService]
})
export class AdminRecipeComponent implements OnInit {

    @ViewChild(JuiceProgramConfiguratorComponent) juiceProgramConfigurator: JuiceProgramConfiguratorComponent;

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

        this.componentService.getComponents(false).subscribe(components => this.components = components);

        this.pcModeConnection = this.productionSocketService.getUpdates('pumpControlMode')
            .subscribe(state => {
                this.pcMode = state;
            });
    }

    onProduce() {
        this.adminService.runProgram(this.program).subscribe(status => {});
    }

}
