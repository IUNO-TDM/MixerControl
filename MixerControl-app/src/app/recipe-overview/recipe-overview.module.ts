import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RecipeOverviewComponent} from './recipe-overview/recipe-overview.component';

import {
  MatButtonModule, MatButtonToggleModule, MatCardModule, MatChipsModule, MatDialogModule,
  MatSidenavModule, MatIconModule, MatTooltipModule
} from '@angular/material';
import 'hammerjs';
import {FlexLayoutModule} from '@angular/flex-layout';
import {RecipeDetailComponent} from './recipe-detail/recipe-detail.component';
import {RecipeFilterPipe} from './recipe-overview/recipe-filter-pipe';
import {FormsModule} from '@angular/forms';
import {routing} from './recipe-overview.routing';
import {HttpClientModule} from '@angular/common/http';
import {UICarouselModule} from 'ui-carousel';
import {ComponentService} from 'tdm-common';

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
    HttpClientModule,

  ],
  declarations: [RecipeOverviewComponent, RecipeDetailComponent, RecipeFilterPipe],
  entryComponents: [RecipeDetailComponent],
  providers: [
    ComponentService,
    {provide: 'componentSourceUrl', useValue: '/api/components'}
  ]
})
export class RecipeOverviewModule {
}
