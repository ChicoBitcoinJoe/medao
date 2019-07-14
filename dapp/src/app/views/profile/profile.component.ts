import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Router, Event, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Web3Service } from '../../services/web3/web3.service';
import { ProfileService, Profile } from '../../services/profile/profile.service';
import { MedaoService } from '../../services/medao/medao.service';
import { DaiService } from '../../services/dai/dai.service';
import { UserService } from '../../services/user/user.service';

declare let web3: any;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {

    user: Profile;
    identity: Profile;

    subscription;
    /*
    profile;
    medao;
    */

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
        public dialog: MatDialog,
        private router: Router,
        public Web3: Web3Service,
        public Profile: ProfileService,
        public User: UserService,
        public MeDao: MedaoService,
        public Dai: DaiService,
    ) { }

    ngOnInit () {
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
        let identity = await this.MeDao.getIdentity(medaoAddress);
        this.identity = await this.Profile.get(identity);

        console.log(this.identity);
        console.log(this.User);

        if(web3.currentAccount){
            await this.User.profile.updateTokenBalance(this.identity.medao.token);
            this.Dai.methods.allowance(this.User.address, this.identity.medao.address).call()
            .then(allowance => {
                this.userAgreesToTerms = allowance.gt(0);
            })
        }
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
            from: web3.currentAccount
        })
        .on('confirmation', (confirmations, txReceipt) => {
            if(confirmations == 1){
                console.log(txReceipt);
                this.User.profile.updateTokenBalance(this.identity.medao.token);
                this.User.profile.updateDaiBalance();
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
            from: web3.currentAccount
        })
        .on('confirmation', (confirmations, txReceipt) => {
            if(confirmations == 1){
                console.log(txReceipt);
                this.User.profile.updateTokenBalance(this.identity.medao.token);
                this.User.profile.updateDaiBalance();
                this.identity.medao.update();
            }
        })
    }

    enableDaiTrading(): void {
        this.approvalPending = true;
        this.userAgreesToTerms = true;
        this.Dai.methods.approve(this.identity.medao.address, web3.utils.maxUintValue)
        .send({
            from: this.User.address
        })
        .on('transactionHash', txHash => {
            console.log(txHash);
        })
        .on('confirmation', (confirmations, txReceipt) => {
            this.Dai.methods.allowance(this.User.address, this.identity.medao.address).call()
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
