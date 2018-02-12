import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RecipeOverviewComponent} from './recipe-overview/recipe-overview.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

import {
    MatButtonModule, MatButtonToggleModule, MatCardModule, MatChipsModule, MatDialogModule,
    MatSidenavModule, MatIconModule, MatTooltipModule
} from '@angular/material';
import 'hammerjs';
import {FlexLayoutModule} from '@angular/flex-layout';
import {RecipeDetailComponent} from './recipe-detail/recipe-detail.component';
import {RecipeFilterPipe} from './recipe-overview/recipe-filter-pipe';
import {FormsModule} from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        // BrowserAnimationsModule,
        NoopAnimationsModule,
        FormsModule,
        MatCardModule,
        MatDialogModule,
        MatChipsModule,
        MatButtonModule,
        FlexLayoutModule,
        MatSidenavModule,
        MatButtonToggleModule,
        MatIconModule,
        MatTooltipModule
    ],
    declarations: [RecipeOverviewComponent, RecipeDetailComponent, RecipeFilterPipe],
    exports: [RecipeOverviewComponent],
    entryComponents: [RecipeDetailComponent]
})
export class RecipeOverviewModule {
}
