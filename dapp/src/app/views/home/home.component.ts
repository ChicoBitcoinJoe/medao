import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Web3Service } from '../../services/web3/web3.service';
import { UserService } from '../../services/user/user.service';
import { MedaoService } from '../../services/medao/medao.service';

declare let web3: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    web3 = web3;

    redirect = {
        router: this.router,
        User: this.User,
        go: function goto(){
            this.router.navigateByUrl('/medao/' + this.User.medao.address);
        }
    }

    constructor(
        private router: Router,
        public Web3: Web3Service,
        public User: UserService,
        public Medao: MedaoService,
    ) { }

    ngOnInit() {

    }



}
