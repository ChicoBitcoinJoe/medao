import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Web3Service } from '../../services/web3/web3.service';
import { UserService } from '../../services/user/user.service';
import { MedaoService } from '../../services/medao/medao.service';

export interface DialogData {
  animal: string;
  name: string;
}

@Component({
  selector: 'app-medao',
  templateUrl: './medao.component.html',
  styleUrls: ['./medao.component.scss']
})
export class MedaoComponent implements OnInit {

    medao;

    constructor(
        public dialog: MatDialog,
        private router: Router,
        public Web3: Web3Service,
        public User: UserService,
        public MeDaoRegistry: MedaoService,
    ) { }

    ngOnInit() {
        let routes = this.router.url.split('/');
        let medaoAddress = routes[2];
        this.Web3.ready()
        .then(async () => {
            let medao = await this.MeDaoRegistry.at(medaoAddress);
            this.medao = medao;
            if(this.Web3.account.signedIn){
                this.User.setBalance(this.medao.token);
            }
        });
    }

    openSendDialog () {
        const dialogRef = this.dialog.open(SendDialog, {
            width: '250px',
            data: {name: 'Joe', animal: 'human'}
        });

        dialogRef.afterClosed().subscribe(async result => {
            /*
            console.log('The dialog was closed');
            let balance = await this.medao.token.methods.balanceOf(this.User.account.address).call();
            console.log('balance', balance.toString());
            this.medao.transfer('0xD5BeE8Ed51eC33ef328dd098321368DF56770A97', 1)
            .on('transactionHash', txHash => {
                console.log(txHash)

            })
            .on('confirmation', (confirmations, txReceipt) => {
                if(confirmations == 1)
                    console.log(txReceipt)
            })
            .catch(err => {
                console.error(err);
            })
            */
        });
    }

    openTradeDialog () {
        const dialogRef = this.dialog.open(TradeDialog, {
            width: '250px',
            data: {name: 'Joe', animal: 'human'}
        });

        dialogRef.afterClosed().subscribe(async result => {
            /*
            console.log('The dialog was closed');
            let balance = await this.medao.token.methods.balanceOf(this.User.account.address).call();
            console.log('balance', balance.toString());
            this.medao.transfer('0xD5BeE8Ed51eC33ef328dd098321368DF56770A97', 1)
            .on('transactionHash', txHash => {
                console.log(txHash)

            })
            .on('confirmation', (confirmations, txReceipt) => {
                if(confirmations == 1)
                    console.log(txReceipt)
            })
            .catch(err => {
                console.error(err);
            })
            */
        });
    }

    follow () {
        this.User.follow(this.medao);
    }
    
}

@Component({
  selector: 'send-dialog',
  templateUrl: 'send.dialog.html',
})
export class SendDialog {

    constructor(
        public dialogRef: MatDialogRef<SendDialog>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {}

    onNoClick(): void {
        this.dialogRef.close();
    }

}

@Component({
  selector: 'trade-dialog',
  templateUrl: 'trade.dialog.html',
})
export class TradeDialog {

    constructor(
        public dialogRef: MatDialogRef<TradeDialog>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {}

    onNoClick(): void {
        this.dialogRef.close();
    }

}
