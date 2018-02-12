import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatDialogModule} from '@angular/material';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatButtonModule} from '@angular/material/button';

// Flex-Layout
import {FlexLayoutModule} from '@angular/flex-layout';

import {JuiceProgramConfiguratorComponent} from './juice-program-configurator.component';
import {AddComponentDialogComponent} from './add-component-dialog/add-component-dialog.component';
import {PhaseDialogComponent} from './phase-dialog/phase-dialog.component';
import {TdmRecipe} from './models/tdmrecipe';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        MatDialogModule,
        MatButtonModule,
        MatListModule,
        MatInputModule,
    ],
    declarations: [
        JuiceProgramConfiguratorComponent,
        AddComponentDialogComponent,
        PhaseDialogComponent,
        // Recipe
    ],
    exports: [
        JuiceProgramConfiguratorComponent,
        AddComponentDialogComponent,
        PhaseDialogComponent,
        // Recipe
    ],
    entryComponents: [
        AddComponentDialogComponent,
        PhaseDialogComponent,
    ]
})
export class JuiceProgramConfiguratorModule {
}
