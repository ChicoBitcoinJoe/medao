import { Component, OnInit, Input, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Web3Service } from '../../services/web3/web3.service';
import { UserService } from '../../services/user/user.service';
import { MedaoService } from '../../services/medao/medao.service';

export interface DialogData {
    medao: any;
    dai: any;
}

@Component({
  selector: 'app-medao-highlight',
  templateUrl: './medao-highlight.component.html',
  styleUrls: ['./medao-highlight.component.scss']
})
export class MedaoHighlightComponent implements OnInit {

    @Input() medao;
    @Input() User;

    constructor(
        public dialog: MatDialog,
        private router: Router,
        public Web3: Web3Service,
        public MeDaoRegistry: MedaoService,
    ) { }

    ngOnInit () {

    }

    openSendDialog () {
      const dialogRef = this.dialog.open(SendDialog, {
          // width: '250px',
          data: {medao: this.medao}
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
          // width: '250px',
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

    sendAmount: number = 0;
    selectedToken: string = 'dai';
    tokens = ['dai','time'];
    selectedDestination = "Joseph Brian Reed";

    dai;
    medao;

    constructor(
        public dialogRef: MatDialogRef<SendDialog>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {
        this.dai = data.dai;
        this.medao = data.medao;
        this.selectedDestination = this.medao.name;
    }

    initiateSend(): void {
        if(this.selectedToken == 'dai'){
            console.log(this.selectedToken);
        }
        else if(this.selectedToken == 'time'){
            console.log(this.selectedToken);
        }
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
