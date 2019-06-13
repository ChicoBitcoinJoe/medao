import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Web3Service } from '../../services/web3/web3.service';
import { DaiService } from '../../services/dai/dai.service';
import { MedaoService } from '../../services/medao/medao.service';

declare let web3: any;

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
    balances = {
        ether: 0,
        dai: 0,
        weth: 0,
        time: 0
    };

    tokens = ['ether','dai','weth','time'];

    constructor(
        private router: Router,
        public Web3: Web3Service,
        public Dai: DaiService,
        public MeDao: MedaoService,
    ) {
    }

    async initialize () {
        let currentAccount = await this.Web3.getCurrentAccount();
        this.account = await this.Web3.getAccountDetails(currentAccount);

        if(this.account.signedIn)
            this.signIn();
        else
            console.log('not signed in');
    }

    signIn () {
        this.Web3.signIn()
        .then(async currentAccount => {
            this.Web3.watchForAccountChanges();
            this.account = await this.Web3.getAccountDetails(currentAccount);
            let medaoAddress = await this.MeDao.addressOf(this.account.address);
            this.medao = await this.MeDao.at(medaoAddress);
            console.log('watching user: ', this);

            let routes = this.router.url.split('/');
            let daiBalance = await this.Dai.getBalance(this.account.address);
            let wethBalance = await this.Dai.weth.methods.balanceOf(this.account.address).call();
            this.balances.dai = daiBalance.toString();
            this.balances.ether = this.account.balance;
            this.balances.weth = wethBalance.toString();
            if(routes[1] == 'medao' && routes[2]){
                let medao = <any>{};
                medao = await this.MeDao.at(routes[2]);
                let timeBalance = await this.medao.token.methods.balanceOf(this.account.address).call();
                this.balances.time = timeBalance.toString();
            }
        })
        .catch(err => {
            console.error(err);
        })
    }

    async setBalance (token) {
        try {
            let balanceInWei = await token.methods.balanceOf(this.account.address).call();
            let balance = web3.utils.fromWei(balanceInWei.toString(), 'ether');
            this.balances[token.address] = balance;


        }
        catch(err){
            console.error(err);
        }
    }

    follow (medao) {
        console.log("following " + medao.address);
    }

}
