import { Component, OnInit } from '@angular/core';

import { UserService } from '../../services/user/user.service';

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
        public User: UserService
    ) { }

    ngOnInit() {
        this.email =  this.User.profile.email;
        this.link =  this.User.profile.link;
        this.image =  this.User.profile.image;
        this.title =  this.User.profile.title;
        this.about =  this.User.profile.about;
        this.contract =  this.User.profile.contract;
    }

}
