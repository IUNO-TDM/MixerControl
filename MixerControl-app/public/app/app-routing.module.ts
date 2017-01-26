import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DrinkListComponent } from './drink/drink-list.component';
import { DrinkDetailComponent } from './drink/drink-detail.component';
import { OrderComponent } from './order/order.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/drinks',
    pathMatch: 'full'
  },
  {
    path: 'drinks',
    component: DrinkListComponent
  },
  {
    path: 'drinks/:id',
    component: DrinkDetailComponent
  },
  {
    path: 'orders/:id',
    component: OrderComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

export const routedComponents = [DrinkListComponent, DrinkDetailComponent, OrderComponent];
