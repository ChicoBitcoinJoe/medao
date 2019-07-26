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
    submitting: boolean = false;

    constructor(
        private router: Router,
        public Web3: Web3Service,
        public App: AppService,
        public MeDao: MedaoService,
    ) { }

    async ngOnInit() {
        if(!this.App.user){
            this.router.navigate(['/home']);
            return;
        }

        this.App.user.funding.percent = 50;
        this.App.user.wage.current.value = 0;
        this.App.user.funding.max.value = 0;
    }

    updateBirthDate () {
        let now = new Date().getTime()/1000;
        let birthTimestamp = this.App.user.birth.date.getTime()/1000;
        this.App.user.birth.timestamp = birthTimestamp;
        this.App.user.age = (now - birthTimestamp) / (60*60*24*365.25);

        this.updateDetails();
    }

    updateDetails () {
        if(!this.App.user.funding.current.value || !this.App.user.wage.max.value) return;

        this.App.user.funding.max.value = this.App.user.wage.max.value * 40 * 52 * this.App.user.age;
        this.App.user.salary.max.value = this.App.user.funding.max.value / this.App.user.age;
        this.App.user.funding.current.wei = web3.utils.toWei(this.App.user.funding.current.value.toString(), 'ether');
        let startingBalance = this.App.user.funding.current.value / this.App.user.wage.max.value;
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
        this.App.user.balances.time.value = this.App.user.funding.current.value;

        this.updatePercent();
    }

    updatePercent () {
        this.currentFunding = this.App.user.funding.max.value * this.App.user.funding.percent / 100;
        this.App.user.salary.current.value = this.App.user.salary.max.value * this.App.user.funding.percent / 100;
        this.App.user.wage.current.value = this.App.user.wage.max.value * this.App.user.funding.percent / 100;
    }

    enableDaiAllowance () {
        let seedAmountInWei = web3.utils.toWei(this.App.user.funding.current.value.toString(), 'ether');
        this.MeDao.dai.methods.approve(this.MeDao.factory.address, seedAmountInWei)
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
        if(this.App.user.funding.current.value <= 0) return false;
        if(this.App.user.funding.current.value > this.App.user.balances.dai.value) return false;

        return true;
    }

    async submit () {
        this.submitting = true;
        this.App.user.funding.percent = this.App.user.funding.current.value / this.App.user.funding.max.value * 100;
        this.updatePercent();
        this.App.register()
        .catch(err => {
            console.error(err);
        })
        .finally(() => {
            this.submitting = false;
        });
    }

}
