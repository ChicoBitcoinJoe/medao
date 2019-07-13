import { Component, OnInit, Input, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { DaiService } from '../../services/dai/dai.service';
import { Profile } from '../../services/profile/profile.service';
import { UserService } from '../../services/user/user.service';

declare let web3: any;

export interface DialogData {
    identity: any;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

    @Input() identity: Profile;
    @Input() forward: boolean;

    constructor(
        public dialog: MatDialog,
        public Dai: DaiService,
        public User: UserService,
    ) { }

    async ngOnInit() {
        if(!this.User.signedIn)
            this.User.watch(this.identity);
        else
            await this.User.profile.updateTokenBalance(this.identity.medao.token);
    }

    openQrcodeDialog () {
        const dialogRef = this.dialog.open(QrcodeDialog, {
            //width: '100vw',
            //height: '100vh',
            data: {
               identity: this.identity,
            }
        });

        dialogRef.afterClosed().subscribe(async result => {

        });
    }

    openTransferDialog () {
        const dialogRef = this.dialog.open(TransferDialog, {
            //width: '100vw',
            //height: '100vh',
            data: {
               identity: this.identity,
            }
        });

        dialogRef.afterClosed().subscribe(async result => {

        });
    }

}

@Component({
    selector: 'transfer-dialog',
    templateUrl: 'transfer.dialog.html',
})
export class TransferDialog {

    identity;
    medao;

    hours: number = 0;
    minutes: number = 0;
    seconds: number = 0;
    totalSeconds: number = 0;
    dollarValue: number = 0;

    maxHours: number = 0;
    maxMinutes: number = 0;
    maxSeconds: number = 0;

    sendAmount: number = 0;
    paymentSelection: string = null;
    toAddress: string = null;
    selectedToken: string = 'dai';
    tokens = ['dai','time','ether'];

    constructor(
        public dialogRef: MatDialogRef<TransferDialog>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        public User: UserService
    ) {
        this.identity = data.identity;
        this.medao = data.identity.medao;
    }

    async updateDollarValue () {
        let totalSeconds = this.seconds;
        totalSeconds += this.minutes * 60;
        totalSeconds += this.hours * 60 * 60;
        this.totalSeconds = totalSeconds;
        this.sendAmount = web3.utils.toWei(totalSeconds.toString(), 'ether');
        let dollarValueInWei = await this.identity.medao.instance.methods.calculateReserveClaim(this.sendAmount.toString()).call();
        this.dollarValue = web3.utils.fromWei(dollarValueInWei.toString(), 'ether');
        console.log(this.dollarValue)
    }

    transfer () {
        this.identity.medao.token.methods.transfer(this.toAddress, this.sendAmount)
        .send({
            from: web3.currentAccount
        })
        .on('transactionHash', txHash => {
            console.log(txHash);
        })
        .on('confirmation', (confirmations, txReceipt) => {
            if(confirmations == 1){
                console.log(txReceipt)
                this.User.profile.updateTokenBalance(this.identity.medao.token);
            }
        })
        .catch(err => {
            console.error(err);
        })
    }

    valid () {
        if(!this.totalSeconds) return false;
        if(this.totalSeconds <= 0) return false;
        if(!this.toAddress) return false;
        if(!web3.utils.isAddress(this.toAddress)) return false;
        return true;
    }

    /*
        async pay() {
            let address;
            if(this.paymentSelection == this.medao.name){
                address = this.medao.owner;
            }
            else if(this.paymentSelection == 'Dao'){
                address = this.medao.address;
            }
            else if(this.paymentSelection == 'Address'){
                address = this.toAddress;
            }

            let txPromise = null;
            if(this.selectedToken == 'ether'){
                let sendAmount = web3.utils.toWei(this.sendAmount.toString(), 'ether');
                if(address == this.medao.address){
                    // convert to dai then send to dao
                }
                else {
                    txPromise = web3.eth.sendTransaction({
                        from: this.User.address,
                        to: address,
                        value: sendAmount
                    });
                }
            }
            else if(this.selectedToken == 'dai'){
                let sendAmount = web3.utils.toWei(this.sendAmount.toString(), 'ether');
                txPromise = this.Dai.methods.transfer(
                    address,
                    sendAmount
                )
                .send({
                    from: this.User.address
                });
            }
            else if(this.selectedToken == 'time'){
                let sendAmount = web3.utils.toWei((this.sendAmount * 3600).toString(), 'ether');
                if(address == this.medao.address){
                    txPromise = this.medao.methods.burn(sendAmount)
                    .send({
                        from: this.User.address
                    });
                }
                else {
                    txPromise = this.medao.token.methods.transfer(
                        address,
                        sendAmount
                    )
                    .send({
                        from: this.User.address
                    });
                }
            }

            let tx = await txPromise;
            tx.on('transactionHash', txHash => {
                console.log(txHash);
            })
            .on('confirmation', (confirmations, txReceipt) => {
                if(confirmations == 1){
                    console.log(txReceipt);
                    this.medao.update();
                }
            })
            .catch(err => {
                console.error(err)
            });
        }
    */

}

@Component({
    selector: 'qrcode-dialog',
    templateUrl: 'qrcode.dialog.html',
})
export class QrcodeDialog {

    identity: any;
    address: string;

    constructor(
        public dialogRef: MatDialogRef<QrcodeDialog>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
    ) {
        this.identity = data.identity;
        this.address = data.identity.medao.address;
    }

}
