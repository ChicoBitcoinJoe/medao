import { Component, OnInit } from '@angular/core';

import { Web3Service } from '../../services/web3/web3.service';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    constructor(
        public Web3: Web3Service,
        public User: UserService,
    ) { }

    ngOnInit() {

    }

}
