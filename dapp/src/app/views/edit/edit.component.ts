import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AppService } from '../../services/app/app.service';

export interface DialogData {
    Dai: any;
    medao: any;
}

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {

    email: string;
    link: string;
    image: string;
    title: string;
    about: string;
    contract: string;

    constructor(
        private router: Router,
        public App: AppService
    ) { }

    async ngOnInit() {
        await this.App.ready;
        if(!this.App.user) {
            this.router.navigate(['/home']);
            return;
        }

        this.email =  this.App.user.email;
        this.link =  this.App.user.link;
        this.image =  this.App.user.image;
        this.title =  this.App.user.title;
        this.about =  this.App.user.about;
        this.contract =  this.App.user.contract;
    }

}
