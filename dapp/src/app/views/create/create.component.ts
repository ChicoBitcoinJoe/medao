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
        let ready = await this.App.ready;
        if(ready){
            this.user = await this.App.user;
            if(!this.user){
                this.router.navigate(['/home']);
                return;
            }

            if(this.user.medao){
                this.user.view();
                return;
            }
            else {
                this.medao = this.user.medao;
                this.medao.name = "Joseph Brian Reed";
                this.medao.birth.date = new Date("12/23/1989");
                this.medao.wage.max = 0.01;
                this.medao.wage.current = 0;
                this.medao.funding.max = 0;
                this.medao.funding.current = 1;
                this.medao.funding.percent = 50;
                // this.medao.calculate();
                this.updateName();
                this.updateBirthDate();
                this.updateBalance();
            }
        }
        else {

        }
    }

    updateName () {
        this.user.name = this.medao.name;
    }

    updateBirthDate () {
        let now = new Date().getTime()/1000;
        let birthTimestamp = this.medao.birth.date.getTime()/1000;
        this.medao.birth.timestamp = birthTimestamp;
        this.medao.age = (now - birthTimestamp) / (60*60*24*365.25);

        this.updateFunding();
        this.updatePercent();
    }

    updateBalance () {
        if(!this.medao.funding.current || !this.medao.wage.max) return;

        let startingBalance = this.medao.funding.current / this.medao.wage.max;
        let seconds = startingBalance * 3600;
        this.user.balances.time.seconds = seconds;
        this.user.balances.time.wei = web3.utils.toWei(seconds.toString(), 'ether').toString();
        let hours = Math.floor(seconds / 3600);
        seconds -= hours * 3600;
        let minutes = Math.floor(seconds / 60);
        seconds -= minutes*60;
        this.user.balances.time.h = hours;
        this.user.balances.time.m = minutes;
        this.user.balances.time.s = seconds;

        this.updateFunding();
        this.updatePercent();
    }

    updatePercent () {
        this.currentFunding = this.medao.funding.max * this.medao.funding.percent / 100;
        this.medao.salary.current = this.medao.salary.max * this.medao.funding.percent / 100;
        this.medao.wage.current = this.medao.wage.max * this.medao.funding.percent / 100;
    }

    updateFunding () {
        this.medao.funding.max = this.medao.wage.max * 40 * 52 * this.medao.age;
        this.medao.salary.max = this.medao.funding.max / this.medao.age;
    }

    enableDaiAllowance () {
        let seedAmountInWei = web3.utils.toWei(this.medao.funding.current.toString(), 'ether');
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
        if(!this.medao.name) return false;
        if(!this.medao.birth.date) return false;
        if(this.medao.wage.max <= 0) return false;
        if(this.medao.funding.current <= 0) return false;

        var daiBalance = web3.utils.fromWei(this.user.balances.dai.toString(), 'ether');
        if(this.medao.funding.current > daiBalance) return false;

        return true;
    }

    async submit () {
        this.medao.funding.percent = this.medao.funding.current / this.medao.funding.max * 100;
        this.updatePercent();

        await this.user.register();
        this.router.navigate(['/deploy']);
    }

/*
    submit () {
        console.log(this.medao);
        if(!this.valid()) return;

        this.medao.birthTimestamp = new Date(this.medao.date).getTime()/1000;
        var tokenClaimInHours = this.medao.seed / this.medao.wage;
        var tokenClaimInSeconds = Math.floor(tokenClaimInHours * 3600);
        this.medao.tokenClaim = web3.utils.toWei(tokenClaimInSeconds.toString(), 'ether');

        if(this.paymentToken == 'ether'){
            this.medao.tx.promise = this.Medao.createWithEther(
                this.medao.name,
                this.medao.birthTimestamp,
                this.medao.tokenClaim,
                this.medao.maxPayAmount,
                this.medao.reserveAmount,
                this.user.address
            );
        }
        else if (this.paymentToken == 'dai'){
            this.medao.tx.promise = this.Medao.createWithDai(
                this.medao.name,
                this.medao.birthTimestamp,
                this.medao.tokenClaim,
                this.medao.reserveAmount,
                this.user.address
            );
        }

        this.medao.tx.promise
        .on('transactionHash', (txHash) => {
            this.medao.tx.hash = txHash;

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
                this.Medao.addressOf(this.user.address)
                .then(medaoAddress => {
                    let snackBarRef = this.snackbar.open('MeDao deployed!', 'view', {
                        duration: 10000,
                    });

                    this.user.signIn();
                    snackBarRef.onAction().subscribe(() => {
                        this.router.navigate(['/medao', medaoAddress]);
                    });
                })
            }
        })
        .catch(err => {
            console.error(err);
            this.medao.tx.promise = null;
        });
    }
*/

}
