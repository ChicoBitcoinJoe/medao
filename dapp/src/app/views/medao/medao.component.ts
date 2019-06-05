import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Web3Service } from '../../services/web3/web3.service';
import { UserService } from '../../services/user/user.service';
import { MedaoService } from '../../services/medao/medao.service';

@Component({
  selector: 'app-medao',
  templateUrl: './medao.component.html',
  styleUrls: ['./medao.component.scss']
})
export class MedaoComponent implements OnInit {

    medao;

    constructor(
        private router: Router,
        public Web3: Web3Service,
        public User: UserService,
        public MeDaoRegistry: MedaoService,
    ) { }

    ngOnInit() {
        let routes = this.router.url.split('/');
        let medaoAddress = routes[2];
        this.Web3.ready()
        .then(async () => {
            let medao = await this.MeDaoRegistry.at(medaoAddress);
            this.medao = medao;
            if(this.Web3.account.signedIn){
                this.User.setBalance(this.medao.token);
            }
        });

    }

}
