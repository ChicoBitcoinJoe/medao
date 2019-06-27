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
        signedIn: false,
        address: null,
        balance: 0
    };

    signedIn: boolean = false;
    address: string = null;
    medao: any = {};
    balances = {
        ether: 0,
        dai: 0,
        weth: 0,
        time: 0
    };

    followers = [];
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

        return true;
    }

    signIn () {
        this.Web3.signIn()
        .then(async currentAccount => {
            this.Web3.watchForAccountChanges();
            this.account = await this.Web3.getAccountDetails(currentAccount);
            this.signedIn = this.account.signedIn;
            this.address = this.account.address;
            this.balances.ether = this.account.balance;

            let medaoAddress = await this.MeDao.addressOf(this.address);
            this.medao = await this.MeDao.at(medaoAddress);

            let daiBalance = await this.Dai.getBalance(this.address);
            let wethBalance = await this.Dai.weth.methods.balanceOf(this.address).call();
            this.balances.dai = daiBalance.toString();
            this.balances.weth = wethBalance.toString();

            let routes = this.router.url.split('/');
            if(routes[1] == 'medao' && routes[2]){
                let medao = <any>{
                    token: null
                };

                medao = await this.MeDao.at(routes[2]);
                let timeBalance = await medao.token.methods.balanceOf(this.address).call();
                this.balances.time = timeBalance.toString();
            }

            let followers = localStorage.getItem(this.address + ".followers");
            if(!followers){
                localStorage.setItem(this.address + ".followers", JSON.stringify([]));
                this.followers = [];
            }
            else {
                this.followers = JSON.parse(followers);
            }

            console.log('Logged in as User: ', this);
        })
        .catch(err => {
            console.error(err);
        })
    }

    async setBalance (token) {
        let balanceInWei = await token.methods.balanceOf(this.address).call();
        this.balances[token.address] = balanceInWei.toString();
    }

    follow (medaoAddress) {
        console.log("following " + medaoAddress);
        if(!this.isFollowing(medaoAddress)) {
            this.followers.push(medaoAddress);
            localStorage.setItem(this.address + ".followers", JSON.stringify(this.followers));
        }
    }

    unfollow (medaoAddress) {
        console.log("unfollowing " + medaoAddress);
        if(this.isFollowing(medaoAddress)) {
            let i = this.followers.indexOf(medaoAddress);
            this.followers.splice(i,1);
            localStorage.setItem(this.address + ".followers", JSON.stringify(this.followers));
        }
    }

    isFollowing (medaoAddress) {
        return this.followers.includes(medaoAddress);
    }

}
