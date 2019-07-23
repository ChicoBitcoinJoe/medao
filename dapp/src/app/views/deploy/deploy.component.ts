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
            this.App.user.medao.paycheck.date = new Date();
            this.App.user.medao.paycheck.timestamp = this.App.user.medao.paycheck.date.getTime()/1000;
            this.App.user.medao.supply.current = this.App.user.balances.time.seconds / 3600;
            this.App.user.medao.supply.max = this.App.user.medao.age * 52 * 40;
            this.App.user.medao.supply.inflation = 1 / this.App.user.medao.age * 100;
            this.identity = this.App.user;

            if(!this.App.user.deployPromise) return;

            this.subscription = this.App.user.deployPromise.on('confirmation', async (confirmations, txReceipt) => {
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
