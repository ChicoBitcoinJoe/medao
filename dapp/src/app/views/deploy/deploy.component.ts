import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { AppService } from '../../services/app/app.service';
import { MedaoService } from '../../services/medao/medao.service';
import { Profile } from '../../services/profile/profile.service';

declare let web3: any;

@Component({
  selector: 'app-deploy',
  templateUrl: './deploy.component.html',
  styleUrls: ['./deploy.component.scss']
})
export class DeployComponent implements OnInit, OnDestroy {

    identity: Profile;

    subscription: any;

    constructor (
        private router: Router,
        public Medao: MedaoService,
        public App: AppService,
    ) { }

    async ngOnInit () {
        await this.App.ready;

        if(this.App.user.medao.address){
            this.router.navigate(['/profile', this.App.user.medao.address]);
        }
        else if (this.subscription) {
            // do nothing
        }
        else {
            this.App.user.paycheck.date = new Date();
            this.App.user.paycheck.timestamp = this.App.user.paycheck.date.getTime()/1000;
            this.App.user.supply.current.value = this.App.user.balances.time.seconds / 3600;
            this.App.user.supply.max.value = this.App.user.age * 52 * 40;
            this.App.user.supply.inflation = 1 / this.App.user.age * 100;
            this.identity = this.App.user;

            if(!this.App.registering) return;

            this.subscription = this.App.tx.on('confirmation', async (confirmations, txReceipt) => {
                if(confirmations == 1){
                    console.log(txReceipt)
                    await this.App.user.update();
                    this.router.navigate(['/profile', this.App.user.medao.address]);
                }
            })

        }
    }

    ngOnDestroy () {
        if(this.subscription)
            this.subscription.unsubscribe();
    }

}
