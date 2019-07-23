import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './views/home/home.component'
import { CreateComponent } from './views/create/create.component'
import { DeployComponent } from './views/deploy/deploy.component'
import { NetworkComponent } from './views/network/network.component'
import { EditComponent } from './views/edit/edit.component'
import { ProfileComponent } from './views/profile/profile.component'

const routes: Routes = [
    {
        path: 'home',
        component: HomeComponent
    },
    {
        path: 'register',
        component: CreateComponent
    },
    {
        path: 'network',
        component: NetworkComponent
    },
    {
        path: 'edit',
        component: EditComponent
    },
    {
        path: 'deploy',
        component: DeployComponent
    },
    {
        path: 'profile/:address',
        component: ProfileComponent
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
