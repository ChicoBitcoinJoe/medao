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

    daiAmount: number = 0;
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
    }

    async updateTimeValues () {
        if(!this.daiAmount)
            this.daiAmount = 0;

        let daiAmountInWei = web3.utils.toWei(this.daiAmount.toString(), 'ether');
        let tokenClaim = await this.identity.medao.methods.calculateTimeClaim(daiAmountInWei).call();
        let seconds = web3.utils.fromWei(tokenClaim.toString(), 'ether');
        let hours = Math.floor(seconds / 3600);
        seconds -= hours*3600;
        let minutes = Math.floor(seconds / 60);
        seconds -= minutes*60;
        seconds = Math.floor(seconds);
        this.seconds = seconds;
        this.minutes = minutes;
        this.hours = hours;
    }

    async updateDaiAmount () {
        let seconds = this.seconds + this.minutes * 60 + this.hours * 3600;
        let secondsInWei = web3.utils.toWei(seconds.toString(), 'ether');
        let daiAmountInWei = await this.identity.medao.methods.calculateDaiClaim(secondsInWei).call()
        this.daiAmount = web3.utils.fromWei(daiAmountInWei.toString(), 'ether');
    }

    validBuy () {
        if(!this.App.user) return false;
        if(this.daiAmount > this.App.user.balances.dai.value) return false;

        return true;
    }

    validSell () {
        if(!this.App.user) return false;

        let seconds = this.seconds + this.minutes * 60 + this.hours * 3600;
        if(seconds <= 0) return false;
        if(seconds > this.App.user.balances[this.identity.medao.address].seconds)
            return false;

        return true;
    }

    async buy () {
        let daiAmount = this.daiAmount.toString();
        let daiAmountInWei = web3.utils.toWei(daiAmount, 'ether');
        this.identity.medao.methods.convertDai(daiAmountInWei)
        .send({
            from: web3.account
        })
        .on('confirmation', (confirmations, txReceipt) => {
            if(confirmations == 1){
                console.log(txReceipt);
                this.App.user.setTimeBalance(this.identity);
                this.App.user.updateDaiBalance();
                this.identity.updateDao();
                this.hours = 0;
                this.minutes = 0;
                this.seconds = 0;
                this.daiAmount = 0;
            }
        })
    }

    async sell () {
        let seconds = this.seconds + this.minutes * 60 + this.hours * 3600;
        let secondsInWei = web3.utils.toWei(seconds.toString(), 'ether');
        this.identity.medao.methods.convertTime(secondsInWei)
        .send({
            from: web3.account
        })
        .on('confirmation', (confirmations, txReceipt) => {
            if(confirmations == 1){
                console.log(txReceipt);
                this.App.user.setTimeBalance(this.identity);
                this.App.user.updateDaiBalance();
                this.identity.updateDao();
                this.hours = 0;
                this.minutes = 0;
                this.seconds = 0;
                this.daiAmount = 0;
            }
        })
    }

    async enableDaiTrading() {
        this.approvalPending = true;

        let allowance = await this.MeDao.dai.methods.allowance(this.App.user.address, this.identity.medao.address).call();
        console.log(allowance)
        this.userAgreesToTerms = allowance.gt(0);
        if(this.userAgreesToTerms) return true;

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
