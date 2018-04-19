import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
    {
        path: '',
        redirectTo: '/drinks',
        pathMatch: 'full'
    },
    {
        path: 'drinks',
        loadChildren: './recipe-overview/recipe-overview.module#RecipeOverviewModule'
    },
    {
        path: 'orders/:id',
        loadChildren: './order/order.module#OrderModule'

    }
    ,
    {
        path: 'admin',
        loadChildren: './admin/admin.module#AdminModule'
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
