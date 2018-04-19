import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {OrderComponent} from './order.component';


const routes: Routes = [
    {path: '', component: OrderComponent}
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
