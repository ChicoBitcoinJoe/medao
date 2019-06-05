import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Web3Service } from '../../services/web3/web3.service';
import { MedaoService } from '../../services/medao/medao.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

    account = {
        address: null,
        signedIn: false,
        balance: 0
    };

    medao;
    balances = {};

    constructor(
        private router: Router,
        public Web3: Web3Service,
        public MeDao: MedaoService,
    ) { }

    signIn () {
        this.Web3.signIn()
        .then(async () => {
            this.account = this.Web3.account;
            let medaoAddress = await this.MeDao.addressOf(this.account.address);
            this.medao = await this.MeDao.at(medaoAddress);
            console.log('watching user: ', this);

            let routes = this.router.url.split('/');
            if(routes[1] == 'medao' && routes[2]){
              let currentRouteMeDao = <any>{};
              currentRouteMeDao = await this.MeDao.at(routes[2]);
              this.setBalance(currentRouteMeDao.token);
            }
        })
    }

    async setBalance (token) {
        let balanceInWei = await token.methods.balanceOf(this.account.address).call();
        let balance = this.Web3.instance.utils.fromWei(balanceInWei.toString(), 'ether');
        this.balances[token.address] = balance;
    }

}
