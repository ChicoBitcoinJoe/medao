import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';

import { Web3Service } from '../../services/web3/web3.service';
import { DaiService } from '../../services/dai/dai.service';
import { UserService } from '../../services/user/user.service';
import { MedaoService } from '../../services/medao/medao.service';

declare let web3: any;

@Component({
  selector: 'app-sign-up-form',
  templateUrl: './sign-up-form.component.html',
  styleUrls: ['./sign-up-form.component.scss']
})
export class SignUpFormComponent implements OnInit {

    tokens =  ['eth', 'dai', 'weth'];

    medao = {
        /* user input */
        name: null,
        date: null,
        maxDate: new Date(),
        wage: null,
        seed: null,
        paymentToken: 'eth',
        /* calculated */
        birthTimestamp: null,
        tokenClaim: null,
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
        public MeDaoRegistry: MedaoService,
    ) { }

    ngOnInit() {
    }

    submit () {
        console.log(this.medao);
        if(!this.valid()) return;

        this.medao.birthTimestamp = new Date(this.medao.date).getTime()/1000;
        var tokenClaim = this.medao.seed / this.medao.wage;
        this.medao.tokenClaim = web3.utils.toWei(tokenClaim.toString(), 'ether');

        this.medao.tx.promise = this.MeDaoRegistry.create(
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
                this.MeDaoRegistry.addressOf(this.User.account.address)
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
