import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Web3Service } from '../../services/web3/web3.service';
import { BoxService } from '../../services/box/box.service';
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
    medao: any = null;

    balances = {
        ether: 0,
        dai: 0,
        weth: 0,
        time: 0
    };

    box;
    following = [];
    tokens = ['ether','dai','weth','time'];

    constructor(
        private router: Router,
        public Web3: Web3Service,
        public Box: BoxService,
        public Dai: DaiService,
        public MeDao: MedaoService,
    ) {
    }

    signIn () {
        return new Promise((resolve, reject) => {
            this.Web3.signIn()
            .then(async account => {
                console.log("Signing in to 3box")
                await this.Box.initialize(account);

                this.Web3.watchForAccountChanges();
                this.account = await this.Web3.getAccountDetails(account);
                this.signedIn = this.account.signedIn;
                this.address = this.account.address;
                this.balances.ether = this.account.balance;

                let medaoAddress = await this.MeDao.addressOf(this.address);
                if(medaoAddress != web3.utils.nullAddress){
                    this.medao = await this.MeDao.at(medaoAddress);
                    this.setBalance(this.medao.token);

                    let daiBalance = await this.Dai.getBalance(this.address);
                    let wethBalance = await this.Dai.weth.methods.balanceOf(this.address).call();
                    this.balances.dai = daiBalance.toString();
                    this.balances.weth = wethBalance.toString();
                }

                // I'm not happy about using routes in the User Service
                // Will look for better way of doing this in future
                let routes = this.router.url.split('/');
                if(routes[1] == 'medao' && routes[2]){
                    let medao: any = {
                        token: null
                    };

                    medao = await this.MeDao.at(routes[2]);
                    let timeBalance = await medao.token.methods.balanceOf(this.address).call();
                    this.balances.time = timeBalance.toString();
                }

                let following = await this.Box.private.get(this.address + ".following");
                if(!following){
                    this.Box.private.set(this.address + ".following", JSON.stringify([]));
                    this.following = [];
                }
                else {
                    this.following = JSON.parse(following);
                }

                console.log('Logged in as User: ', this);
                resolve(true);
            })
            .catch(err => {
                console.error(err);
            });
        });
    }

    async setBalance (token) {
        let balanceInWei = await token.methods.balanceOf(this.address).call();
        this.balances[token.address] = balanceInWei.toString();
    }

    follow (medaoAddress) {
        console.log("following " + medaoAddress);
        if(!this.isFollowing(medaoAddress)) {
            this.following.push(medaoAddress);
            console.log(this.following)
            this.Box.private.set(this.address + ".following", JSON.stringify(this.following));
        }
    }

    unfollow (medaoAddress) {
        console.log("unfollowing " + medaoAddress);
        if(this.isFollowing(medaoAddress)) {
            let i = this.following.indexOf(medaoAddress);
            this.following.splice(i,1);
            this.Box.private.set(this.address + ".following", JSON.stringify(this.following));
        }
    }

    isFollowing (medaoAddress) {
        return this.following.includes(medaoAddress);
    }

    private async unpack3box(account){
        let profile = await this.Box.getProfile(account);
        console.log(profile);
        return profile;
    }
}
