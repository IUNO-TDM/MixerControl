import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RecipeOverviewComponent} from './recipe-overview/recipe-overview.component';

import {
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatIconModule,
    MatSidenavModule,
    MatTooltipModule
} from '@angular/material';
import 'hammerjs';
import {FlexLayoutModule} from '@angular/flex-layout';
import {RecipeDetailComponent} from './recipe-detail/recipe-detail.component';
import {RecipeFilterPipe} from './recipe-overview/recipe-filter-pipe';
import {FormsModule} from '@angular/forms';
import {routing} from './recipe-overview.routing';
import {UICarouselModule} from 'ng-carousel-iuno';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatDialogModule,
        MatChipsModule,
        MatButtonModule,
        FlexLayoutModule,
        MatSidenavModule,
        MatButtonToggleModule,
        MatIconModule,
        MatTooltipModule,
        routing,
        UICarouselModule,
    ],
    declarations: [RecipeOverviewComponent, RecipeDetailComponent, RecipeFilterPipe],
    entryComponents: [RecipeDetailComponent],
})
export class RecipeOverviewModule {
}
