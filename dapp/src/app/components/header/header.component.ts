import { Component, OnInit, Input, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { UserService } from '../../services/user/user.service';
import { DaiService } from '../../services/dai/dai.service';

declare let web3: any;

export interface DialogData {
    Dai: any;
    medao: any;
    user: any;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

    @Input() medao;
    @Input() view;
    @Input() diameter;


    constructor(
        public dialog: MatDialog,
        public User: UserService,
        public Dai: DaiService,
    ) { }

    ngOnInit() {
    }

    openTransferDialog () {
      const dialogRef = this.dialog.open(TransferDialog, {
          // width: '250px',
          data: {
              medao: this.medao,
              user: this.User,
              Dai: this.Dai,
          }
      });

      dialogRef.afterClosed().subscribe(async result => {

      });
    }

    openTradeDialog () {
      const dialogRef = this.dialog.open(TradeDialog, {
          // width: '250px',
          data: {name: 'Joe', animal: 'human'}
      });

      dialogRef.afterClosed().subscribe(async result => {

      });
    }

    openEditDialog () {
      const dialogRef = this.dialog.open(EditDialog, {
          // width: '250px',
          data: {

          }
      });

      dialogRef.afterClosed().subscribe(async result => {

      });
    }

}

@Component({
    selector: 'edit-dialog',
    templateUrl: 'edit.dialog.html',
})
export class EditDialog {

    constructor(
        public dialogRef: MatDialogRef<EditDialog>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {

    }

}

@Component({
    selector: 'transfer-dialog',
    templateUrl: 'transfer.dialog.html',
})
export class TransferDialog {

    paymentSelection: string = null;
    sendAmount: number = 0;
    selectedToken: string = 'dai';
    tokens = ['dai','time','ether'];
    customAddress: string = null;

    Dai;
    medao;
    user;

    constructor(
        public dialogRef: MatDialogRef<TransferDialog>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {
        this.Dai = data.Dai;
        this.medao = data.medao;
        this.user = data.user;
    }

    async pay() {
        let address;
        if(this.paymentSelection == this.medao.name){
            address = this.medao.owner;
        }
        else if(this.paymentSelection == 'Dao'){
            address = this.medao.address;
        }
        else if(this.paymentSelection == 'Address'){
            address = this.customAddress;
        }

        let txPromise = null;
        if(this.selectedToken == 'ether'){
            let sendAmount = web3.utils.toWei(this.sendAmount.toString(), 'ether');
            if(address == this.medao.address){
                // convert to dai then send to dao
            }
            else {
                txPromise = web3.eth.sendTransaction({
                    from: this.user.address,
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
                from: this.user.address
            });
        }
        else if(this.selectedToken == 'time'){
            let sendAmount = web3.utils.toWei((this.sendAmount * 3600).toString(), 'ether');
            if(address == this.medao.address){
                txPromise = this.medao.methods.burn(sendAmount)
                .send({
                    from: this.user.address
                });
            }
            else {
                txPromise = this.medao.token.methods.transfer(
                    address,
                    sendAmount
                )
                .send({
                    from: this.user.address
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

    valid () {
        if(!this.sendAmount) return false;
        if(this.sendAmount <= 0) return false;
        if(this.paymentSelection == 'Address'){
            if(!this.customAddress) return false;
            if(!web3.utils.isAddress(this.customAddress)) return false;
        }

        return true;
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
