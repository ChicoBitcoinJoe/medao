import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Web3Service } from '../web3/web3.service';
import { MedaoService } from '../medao/medao.service';
import { ProfileService, Profile } from '../profile/profile.service';

declare let web3: any;
declare let require: any;

let ERC20Artifact = require('../../contracts/ERC20Token.json');
let Dai = {
    '1': "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359",
    '42': "0xc4375b7de8af5a38a93548eb8453a498222c4ff2"
}

@Injectable({
  providedIn: 'root'
})
export class AppService {

    ready: Promise<boolean>;
    supportedNetworks = ['kovan'];
    autoSignin: boolean = false;
    dai: any;

    user: Profile = null;


    //signedIn: boolean = false;
    signingIn: boolean = false;
    registering: boolean = false;
    //tx: any = null

    //watching = [];

    constructor(
        private router: Router,
        public Web3: Web3Service,
        public Profile: ProfileService,
        //public MedaoService: MedaoService,
    ) {
        this.ready = new Promise(async (resolve, reject) => {
            await this.Web3.ready;
            if(!this.supportedNetworks.includes(web3.network.name)) {
                console.error(new Error('current network not supported'));
                return;
            }

            console.log("App attached to Ethereum Network: " + web3.network.name + " (id:" + web3.network.id + ")");

            this.autoSignin = JSON.parse(localStorage.getItem('medao.autoSignin'));
            if(this.autoSignin) {
                console.log("automatically signing in")
                this.signIn();
            }

            this.dai = new web3.eth.Contract(ERC20Artifact.abi, Dai[web3.network.id]);
        })
    }

    signIn () {
        this.signingIn = true;

        return this.Web3.signIn()
        .then(async accountAddress => {
            console.log(accountAddress);
            this.Web3.watchForAccountChanges();
            this.user = await this.Profile.get(accountAddress);
            console.log(this.user)
            this.view(this.user);
        })
        .catch(err => {
            console.error(err);
            return err;
        })
        .finally(() => {
            this.signingIn = false;
            //console.log("user", this.user);
        })

/*
            this.user = await this.Profile.get(currentAccount);
            this.user.network.forEach(async medaoAddress => {
                this.user.setTimeBalance(await this.Profile.from(medaoAddress));
            })

            this.Web3.watchForAccountChanges();

            this.signedIn = true;

            return this.user;

*/
    }

    register () {
        console.log('App.register')
        let tx = this.user.register();
        tx.on('transactionHash', txHash => {
            console.log(txHash);
            this.registering = true;
        })
        .on('confirmation', async (confirmations, txReceipt) => {
            if(confirmations == 1){
                console.log(txReceipt);
                this.user.setupDao();
            }
        })
        .catch(err => {
            console.error(err);
        })
        .finally(() => {
            this.registering = false;
        })

        return tx;
    }

    view (profile) {
        if(profile.medao)
            this.router.navigateByUrl('/profile/' + profile.medao.address);
        else {
            this.router.navigate(['/register']);
        }
    }

    toggleAutoSignin () {
        localStorage.setItem('medao.autoSignin', JSON.stringify(this.autoSignin));
    }

}
