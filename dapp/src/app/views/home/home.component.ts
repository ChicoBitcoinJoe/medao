import { Component, OnInit } from '@angular/core';

import { MedaoService } from '../../services/medao/medao.service';
import { AppService } from '../../services/app/app.service';
import { Profile } from '../../services/profile/profile.service';

declare let web3: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    web3 = web3;

    user: Profile;

    constructor(
        public App: AppService,
    ) {
        //this.user = App.user;
    }

    async ngOnInit() {

    }

}
