import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Router, Event, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';

import { ProfileService, Profile } from '../../services/profile/profile.service';
import { MedaoService } from '../../services/medao/medao.service';
import { AppService } from '../../services/app/app.service';

declare let web3: any;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {

    ready: boolean = false;

    identity: Profile;

    subscription;

    amount: number = 0;
    paymentToken: string = 'ether';
    hours: number = 0;
    minutes: number = 0;
    seconds: number = 0;

    userAgreesToTerms: boolean = false;
    approvalPending: boolean = false;
    sendAmount: number = 0;
    selectedToken: string = 'dai';
    tokens = ['dai','ether'];

    selectedOption: string = 'Details';
    options = ['Details','Contract']; // ['Activity','Posts']

    constructor(
        private router: Router,
        public App: AppService,
        public Profile: ProfileService,
        public MeDao: MedaoService,
    ) { }

    async ngOnInit () {
        await this.App.ready;

        this.initialize();

        this.subscription = this.router.events.subscribe( (event: Event) => {
            if (event instanceof NavigationStart) {

            }

            if (event instanceof NavigationEnd) {
                this.initialize();
            }

            if (event instanceof NavigationError) {
                console.log(event.error);
            }
        });
    }

    ngOnDestroy () {
        this.subscription.unsubscribe();
    }

    async initialize () {
        let medaoAddress = this.router.url.split('/')[2];
        let account = await this.MeDao.getIdentity(medaoAddress);
        this.identity = await this.Profile.get(account);
        console.log("identity", this.identity);
        this.ready = true;
/*
        let ready = await this.App.user.ready;
        if(ready){
            await this.App.user.updateTokenBalance(this.identity.medao.token);
            this.Dai.methods.allowance(this.App.user.address, this.identity.medao.address).call()
            .then(allowance => {
                this.userAgreesToTerms = allowance.gt(0);
            })
        }
*/
    }

    updateTimeValues () {
        console.log('updating time values');
    }

    updateDollarValue () {
        console.log('updating dollar value');
        /*
        let totalSeconds = this.seconds;
        totalSeconds += this.minutes * 60;
        totalSeconds += this.hours * 60 * 60;
        this.totalSeconds = totalSeconds;
        this.sendAmount = web3.utils.toWei(totalSeconds.toString(), 'ether');
        let dollarValueInWei = await this.identity.medao.instance.methods.calculateReserveClaim(this.sendAmount.toString()).call();
        this.dollarValue = web3.utils.fromWei(dollarValueInWei.toString(), 'ether');
        console.log(this.dollarValue)
        */
    }

    validBuy () {
        return true;
    }

    validSell () {
        return true;
    }

    async buy () {
        let amount = '0.01';
        let amountInWei = web3.utils.toWei(amount, 'ether');
        let expectedTimeInWei = await this.identity.medao.methods.calculateTokenClaim(amountInWei).call();
        let expectedTime = web3.utils.fromWei(expectedTimeInWei.toString(), 'ether');
        console.log(expectedTime);

        this.identity.medao.methods.deposit(amountInWei)
        .send({
            from: web3.account
        })
        .on('confirmation', (confirmations, txReceipt) => {
            if(confirmations == 1){
                console.log(txReceipt);
                this.App.user.updateTimeBalance(this.identity.medao.token);
                //this.App.user.updateDaiBalance();
                this.identity.medao.update();
            }
        })
    }

    async sell () {
        let amount = '0.01';
        let amountInWei = web3.utils.toWei(amount, 'ether');
        let expectedTimeInWei = await this.identity.medao.methods.calculateTokenClaim(amountInWei).call();
        let expectedTime = web3.utils.fromWei(expectedTimeInWei.toString(), 'ether');
        console.log(expectedTime);

        this.identity.medao.methods.withdraw(expectedTimeInWei)
        .send({
            from: web3.account
        })
        .on('confirmation', (confirmations, txReceipt) => {
            if(confirmations == 1){
                console.log(txReceipt);
                this.App.user.updateTimeBalance(this.identity.medao.token);
                //this.App.user.updateDaiBalance();
                this.identity.medao.update();
            }
        })
    }

    enableDaiTrading(): void {
        this.approvalPending = true;
        this.userAgreesToTerms = true;
        this.MeDao.dai.methods.approve(this.identity.medao.address, web3.utils.maxUintValue)
        .send({
            from: this.App.user.address
        })
        .on('transactionHash', txHash => {
            console.log(txHash);
        })
        .on('confirmation', (confirmations, txReceipt) => {
            this.MeDao.dai.methods.allowance(this.App.user.address, this.identity.medao.address).call()
            .then(allowance => {
                this.approvalPending = false;
                this.userAgreesToTerms = allowance.gt(0);
            })
        })
        .catch(err => {
            console.error(err);
            this.approvalPending = false;
            this.userAgreesToTerms = false;
        });
    }



}
