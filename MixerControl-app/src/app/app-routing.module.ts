import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DrinkListComponent } from './drink/drink-list.component';
import { DrinkDetailComponent } from './drink/drink-detail.component';
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
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export const routedComponents = [DrinkListComponent,DrinkDetailComponent];
