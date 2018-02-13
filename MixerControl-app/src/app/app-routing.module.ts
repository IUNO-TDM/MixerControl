import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {OrderComponent} from './order/order.component';
import {AdminComponent} from './admin/admin.component';
import {RecipeOverviewComponent} from './recipe-overview/recipe-overview/recipe-overview.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/drinks',
    pathMatch: 'full'
  },
  {
    path: 'drinks',
    component: RecipeOverviewComponent
  },
  {
    path: 'orders/:id',
    component: OrderComponent
  }
  ,
  {
    path: 'admin',
    component: AdminComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}

export const routedComponents = [OrderComponent, AdminComponent];
