import { Injectable } from '@angular/core';

import { Web3Service } from '../web3/web3.service';
import { MedaoService } from '../medao/medao.service';
import { ProfileService, Profile } from '../profile/profile.service';

declare let web3: any;

@Injectable({
  providedIn: 'root'
})
export class AppService {

    ready: Promise<boolean>;

    supportedNetworks = [42];
    dai: any;

    signedIn: boolean = false;
    signingIn: boolean = false;
    user: Profile;

    constructor(
        public Web3: Web3Service,
        public Profile: ProfileService,
        public MedaoService: MedaoService,
    ) {

    }

    initialize () {
        this.ready = this.Web3.initialize(this.supportedNetworks)
        .then(async () => {
            console.log("App attached to Ethereum Network: " + web3.network.name + " (id:" + web3.network.id + ")");
            this.Web3.watchForAccountChanges();
            this.MedaoService.initialize();
            return true;
        })
        .catch(err => {
            console.error(err);
            return false;
        })

        return this.ready;
    }

    signIn () {
        this.signingIn = true;

        return web3.signIn()
        .then(async currentAccount => {
            this.user = await this.Profile.get(currentAccount);
            this.Web3.watchForAccountChanges();
            this.signedIn = true;

            setInterval(() => {
                this.user.calculatePaycheck();
            }, 1000)

            return this.user;
        })
        .catch(err => {
            console.error(err);
            return err;
        })
        .finally(() => {
            this.signingIn = false;
            console.log("user", this.user);
        })
    }


}
