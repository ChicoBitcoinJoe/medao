import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';

import { Web3Service } from '../../services/web3/web3.service';
import { DaiService } from '../../services/dai/dai.service';
import { UserService } from '../../services/user/user.service';
import { MedaoService } from '../../services/medao/medao.service';

declare let web3: any;

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {

    tokens =  ['ether', 'dai', 'weth'];

    medao = {
        /* user input */
        name: null,
        date: null,
        maxDate: new Date(),
        wage: null,
        seed: null,
        paymentToken: 'ether',
        /* calculated */
        birthTimestamp: null,
        tokenClaim: null,
        maxFunding: null,
        expectedWage: null,
        expectedSalary: null,
        percentFunded: 50,
        maxSalary: null,
        requiredFunding: null,
        tx: {
            promise: null,
            hash: null,
        },
    }

    constructor(
        private router: Router,
        private snackbar: MatSnackBar,
        public Web3: Web3Service,
        public Dai: DaiService,
        public User: UserService,
        public Medao: MedaoService,
    ) { }

    ngOnInit() {
        this.medao.name = this.Medao.newMedao.name;
    }

    updateView () {
        let now = new Date().getTime()/1000;
        let birthTimestamp = new Date(this.medao.date).getTime()/1000;
        let age = (now - birthTimestamp) / (60*60*24*365.25);
        this.medao.maxFunding = this.medao.wage * 8*365.25 * age;
        this.medao.requiredFunding = this.medao.maxFunding * this.medao.percentFunded / 100;
        this.medao.maxSalary = this.medao.wage * 8*365.25;
        this.medao.expectedSalary = this.medao.maxSalary * this.medao.percentFunded / 100;
        this.medao.expectedWage = this.medao.wage * this.medao.percentFunded / 100;
    }

    submit () {
        console.log(this.medao);
        if(!this.valid()) return;

        this.medao.birthTimestamp = new Date(this.medao.date).getTime()/1000;
        var tokenClaim = this.medao.seed / this.medao.wage;
        this.medao.tokenClaim = web3.utils.toWei(tokenClaim.toString(), 'ether');

        this.medao.tx.promise = this.Medao.create(
            this.medao.name,
            this.medao.birthTimestamp,
            this.medao.tokenClaim,
            this.medao.seed,
            this.medao.paymentToken,
            this.User.account.address
        );

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
                this.Medao.addressOf(this.User.account.address)
                .then(medaoAddress => {
                    let snackBarRef = this.snackbar.open('MeDao deployed!', 'view', {
                        duration: 10000,
                    });

                    this.User.signIn();
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

    valid () {
        if(!this.medao.name) return false;
        if(!this.medao.date) return false;
        if(!this.medao.wage && this.medao.wage > 0) return false;
        if(!this.medao.seed && this.medao.wage > 0) return false;
        if(this.User.account.balance) {
            var daiBalance = this.Dai.fromWei(this.User.account.balance);
            if(this.medao.seed >= daiBalance) return false;
        }
        return true;
    }

}
