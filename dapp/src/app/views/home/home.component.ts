import { Component, OnInit } from '@angular/core';

import { MedaoService } from '../../services/medao/medao.service';
import { UserService } from '../../services/user/user.service';

declare let web3: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    web3 = web3;
    ready: boolean = false;

    constructor(
        public User: UserService,
    ) { }

    async ngOnInit() {
        this.ready = await this.User.ready;
    }

}
