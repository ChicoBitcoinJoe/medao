import { Component, OnInit } from '@angular/core';

import { Web3Service } from '../../services/web3/web3.service';
import { MedaoService } from '../../services/medao/medao.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    tokens =  ['eth', 'dai'];

    medao = {
        /* user input */
        name: "Joseph Reed",
        date: '1989-12-23',
        wage: 10.00,
        seed: 100.00,
        paymentToken: 'eth',
        /* calculated */
        birthTimestamp: null,
        tokenClaim: null,
        promise: null,
        tx: null,
    }

    constructor(
        public Web3: Web3Service,
        public MeDaoRegistry: MedaoService,
    ) { }

    ngOnInit() {

    }

    submit () {
        console.log(this.medao);
        if(!this.valid()) return;

        this.medao.birthTimestamp = new Date(this.medao.date).getTime()/1000;
        var tokenClaim = this.medao.seed / this.medao.wage;
        this.medao.tokenClaim = this.Web3.instance.utils.toWei(tokenClaim.toString(), 'ether');

        this.medao.promise = this.MeDaoRegistry.create(
            this.medao.name,
            this.medao.birthTimestamp,
            this.medao.tokenClaim,
            this.medao.seed,
            this.medao.paymentToken,
        );

    }

    valid () {
        if(!this.medao.name) return false;
        if(!this.medao.date) return false;
        if(!this.medao.wage && this.medao.wage > 0) return false;
        if(!this.medao.seed && this.medao.wage > 0) return false;
        if(this.Web3.account.balance) {
            var daiBalance = this.Web3.weiToDai(this.Web3.account.balance);
            if(this.medao.seed >= daiBalance) return false;
        }
        return true;
    }

    signIn () {
        this.Web3.signIn()
        .then(() => {

        })
    }

}
