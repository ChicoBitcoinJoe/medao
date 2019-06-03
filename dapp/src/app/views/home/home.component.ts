import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';

import { Web3Service } from '../../services/web3/web3.service';
import { UserService } from '../../services/user/user.service';
import { MedaoService } from '../../services/medao/medao.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    tokens =  ['eth', 'dai', 'weth'];

    medao = {
        /* user input */
        name: "Joseph Reed",
        date: new Date('12/23/1989'),
        maxDate: new Date(),
        wage: 10.00,
        seed: 1.00,
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
        this.medao.tokenClaim = this.Web3.instance.utils.toWei(tokenClaim.toString(), 'ether');

        this.medao.tx.promise = this.MeDaoRegistry.create(
            this.medao.name,
            this.medao.birthTimestamp,
            this.medao.tokenClaim,
            this.medao.seed,
            this.medao.paymentToken,
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
                this.MeDaoRegistry.addressOf(this.Web3.account.address)
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
        if(this.Web3.account.balance) {
            var daiBalance = this.Web3.weiToDai(this.Web3.account.balance);
            if(this.medao.seed >= daiBalance) return false;
        }
        return true;
    }

}
