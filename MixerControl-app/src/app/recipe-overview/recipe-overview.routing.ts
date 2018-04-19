import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {RecipeOverviewComponent} from './recipe-overview/recipe-overview.component';

const routes: Routes = [
    {path: '', component: RecipeOverviewComponent}
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
