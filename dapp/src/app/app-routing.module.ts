import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './views/home/home.component'
import { MedaoComponent } from './views/medao/medao.component'

const routes: Routes = [
    {
        path: 'home',
        component: HomeComponent
    },
    {
        path: 'medao/:address',
        component: MedaoComponent
    },
    {
        path: '**',
        redirectTo: '/home',
        pathMatch: 'full'
    }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
