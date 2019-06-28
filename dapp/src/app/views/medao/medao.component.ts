import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Router, Event, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Web3Service } from '../../services/web3/web3.service';
import { UserService } from '../../services/user/user.service';
import { MedaoService } from '../../services/medao/medao.service';

declare let web3: any;

@Component({
  selector: 'app-medao',
  templateUrl: './medao.component.html',
  styleUrls: ['./medao.component.scss']
})
export class MedaoComponent implements OnInit, OnDestroy {

    subscription;
    medao;

    paymentsEnabled: boolean = false;
    approvalPending: boolean = false;
    sendAmount: number = 0;
    selectedToken: string = 'dai';
    tokens = ['dai','ether'];

    selectedOption: string = 'Details';
    options = ['Details','About','Contract']; // ['Activity','Posts']

    constructor(
        public dialog: MatDialog,
        private router: Router,
        public Web3: Web3Service,
        public User: UserService,
        public MeDao: MedaoService,
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
        let routes = this.router.url.split('/');
        let medaoAddress = routes[2];
        this.medao = await this.MeDao.at(medaoAddress);

        if(this.User.address){
            this.User.setBalance(this.medao.token);
            this.medao.token.methods.allowance(this.User.address, this.medao.address).call()
            .then(allowance => {
                this.paymentsEnabled = allowance.gt(0);
            })
        }
    }

    enableDaiTrading(): void {
        this.approvalPending = true;
        this.medao.token.methods.approve(this.medao.address, web3.utils.maxUintValue)
        .send({
            from: this.User.address
        })
        .on('transactionHash', txHash => {

        })
        .on('confirmation', (confirmations, txReceipt) => {
            this.medao.token.methods.allowance(this.User.address, this.medao.address).call()
            .then(allowance => {
                this.approvalPending = false;
                this.paymentsEnabled = allowance.gt(0);
            })
        })
        .catch(err => {
            console.error(err)
        });
    }



}
