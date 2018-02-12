import {Component, OnInit} from '@angular/core';
import {Component as TdmComponent} from '../../models/Component';
import {TdmProgram} from '../../juice-program-configurator/models/tdmprogram';
import {ComponentService} from "../../services/component.service";
import {AdminService} from "../../services/admin.service";

@Component({
    selector: 'app-admin-recipe',
    templateUrl: './admin-recipe.component.html',
    styleUrls: ['./admin-recipe.component.css'],
    providers: [ComponentService, AdminService]
})
export class AdminRecipeComponent implements OnInit {


    components: TdmComponent[];
    program = new TdmProgram();


    constructor(
        private componentService: ComponentService,
        private adminService: AdminService
        ) {}

    ngOnInit() {

        this.componentService.getComponents(false).then(components => this.components = components);


    }

    onProduce() {
        this.adminService.runProgram(this.program);
    }

}
