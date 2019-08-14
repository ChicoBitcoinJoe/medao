import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './routes/home/home.component'
import { SigninComponent } from './routes/signin/signin.component'

const routes: Routes = [
    {
        path: 'home',
        component: HomeComponent
    },
    {
        path: 'signin',
        component: SigninComponent
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
