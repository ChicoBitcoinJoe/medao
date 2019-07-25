import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
//import { MatSnackBar } from '@angular/material';

import { Web3Service } from '../../services/web3/web3.service';
import { MedaoService, MeDao } from '../../services/medao/medao.service';
import { Profile } from '../../services/profile/profile.service';
import { AppService } from '../../services/app/app.service';

declare let web3: any;

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {

    web3 = web3;
    user: Profile;
    medao: MeDao;

    toggleDaiAllowance: boolean = false;
    allowSubmit: boolean = false;
    maxDate: Date = new Date();
    currentFunding: number = 0;

    constructor(
        private router: Router,
        public Web3: Web3Service,
        public App: AppService,
        public MedaoService: MedaoService,
    ) { }

    async ngOnInit() {
        if(!this.App.user){
            this.router.navigate(['/home']);
            return;
        }

        this.App.user.name = "Joseph Brian Reed";
        this.App.user.birth.date = new Date("12/23/1989");
        this.App.user.wage.max.value = 0.01;
        this.App.user.balances.time.value = 1;
        this.App.user.funding.percent = 50;

        this.App.user.wage.current.value = 0;
        this.App.user.funding.max.value = 0;

        this.updateBirthDate();
    }

    updateBirthDate () {
        let now = new Date().getTime()/1000;
        let birthTimestamp = this.App.user.birth.date.getTime()/1000;
        this.App.user.birth.timestamp = birthTimestamp;
        this.App.user.age = (now - birthTimestamp) / (60*60*24*365.25);

        this.updateDetails();
    }

    updateDetails () {
        if(!this.App.user.balances.time.value || !this.App.user.wage.max.value) return;

        this.App.user.funding.max.value = this.App.user.wage.max.value * 40 * 52 * this.App.user.age;
        this.App.user.salary.max.value = this.App.user.funding.max.value / this.App.user.age;

        let startingBalance = this.App.user.balances.time.value / this.App.user.wage.max.value;
        let seconds = startingBalance * 3600;
        this.App.user.balances.time.seconds = seconds;
        this.App.user.balances.time.wei = web3.utils.toWei(seconds.toString(), 'ether').toString();
        let hours = Math.floor(seconds / 3600);
        seconds -= hours * 3600;
        let minutes = Math.floor(seconds / 60);
        seconds -= minutes*60;
        this.App.user.balances.time.h = hours;
        this.App.user.balances.time.m = minutes;
        this.App.user.balances.time.s = seconds;

        this.updatePercent();
    }

    updatePercent () {
        this.currentFunding = this.App.user.funding.max.value * this.App.user.funding.percent / 100;
        this.App.user.salary.current.value = this.App.user.salary.max.value * this.App.user.funding.percent / 100;
        this.App.user.wage.current.value = this.App.user.wage.max.value * this.App.user.funding.percent / 100;
    }

    enableDaiAllowance () {
        let seedAmountInWei = web3.utils.toWei(this.App.user.balances.time.value.toString(), 'ether');
        this.MedaoService.dai.methods.approve(this.MedaoService.factory.address, seedAmountInWei)
        .send({
            from: web3.account
        })
        .on('transactionHash', txHash => {
            this.allowSubmit = true;
        })
        .catch(err => {
            console.error(err);
            this.allowSubmit = false;
            this.toggleDaiAllowance = false;
        })
    }

    valid () {
        if(!this.App.user.name) return false;
        if(!this.App.user.birth.date) return false;
        if(this.App.user.wage.max.value <= 0) return false;
        if(this.App.user.balances.time.value <= 0) return false;
        if(this.App.user.balances.time.value > this.App.user.balances.dai.value) return false;

        return true;
    }

    async submit () {
        this.App.user.funding.percent = this.App.user.balances.time.value / this.App.user.funding.max.value * 100;
        this.updatePercent();

        await this.App.user.register();
        this.router.navigate(['/deploy']);
    }

/*
    submit () {
        console.log(this.App.user);
        if(!this.valid()) return;

        this.App.user.birthTimestamp = new Date(this.App.user.date).getTime()/1000;
        var tokenClaimInHours = this.App.user.seed / this.App.user.wage;
        var tokenClaimInSeconds = Math.floor(tokenClaimInHours * 3600);
        this.App.user.tokenClaim = web3.utils.toWei(tokenClaimInSeconds.toString(), 'ether');

        if(this.paymentToken == 'ether'){
            this.App.user.tx.promise = this.Medao.createWithEther(
                this.App.user.name,
                this.App.user.birthTimestamp,
                this.App.user.tokenClaim,
                this.App.user.maxPayAmount,
                this.App.user.reserveAmount,
                this.App.user.address
            );
        }
        else if (this.paymentToken == 'dai'){
            this.App.user.tx.promise = this.Medao.createWithDai(
                this.App.user.name,
                this.App.user.birthTimestamp,
                this.App.user.tokenClaim,
                this.App.user.reserveAmount,
                this.App.user.address
            );
        }

        this.App.user.tx.promise
        .on('transactionHash', (txHash) => {
            this.App.user.tx.hash = txHash;

            let snackBarRef = this.snackbar.open('Deploying MeDao. Be patient!', 'details', {
                duration: 10000,
            });

            snackBarRef.onAction().subscribe(() => {
                var url = 'https://kovan.etherscan.io/tx/' + txHash;
                window.open(url, "_blank");
            });
        })
        .on('confirmation', (confirmation, txReceipt) => {
            if(confirmation == 1) {
                console.log(confirmation)
                console.log(txReceipt)
                this.Medao.addressOf(this.App.user.address)
                .then(medaoAddress => {
                    let snackBarRef = this.snackbar.open('MeDao deployed!', 'view', {
                        duration: 10000,
                    });

                    this.App.user.signIn();
                    snackBarRef.onAction().subscribe(() => {
                        this.router.navigate(['/medao', medaoAddress]);
                    });
                })
            }
        })
        .catch(err => {
            console.error(err);
            this.App.user.tx.promise = null;
        });
    }
*/

}
