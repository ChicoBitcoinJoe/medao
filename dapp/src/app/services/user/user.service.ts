import { Injectable } from '@angular/core';

import { Web3Service } from '../../services/web3/web3.service';
import { MedaoService } from '../../services/medao/medao.service';
import { ProfileService, Profile } from '../../services/profile/profile.service';

declare let web3: any;

@Injectable({
  providedIn: 'root'
})
export class UserService {

    address: string = null;
    signedIn: boolean = false;
    profile: Profile = null;

    watching = [];
    network = [];

    constructor(
        public Web3: Web3Service,
        public MeDao: MedaoService,
        public Profile: ProfileService,
    ) {

    }

    async signIn () {
        this.address = await this.Web3.signIn();
        this.Web3.watchForAccountChanges();
        this.profile = await this.Profile.get(this.address);

        this.profile.network.forEach(async medaoAddress => {
            let identity = await this.MeDao.getIdentity(medaoAddress);
            let profile = await this.Profile.get(identity);
            this.network.push(profile);
        })

        for(var i = 0; i < this.watching.length; i++){
            var token = this.watching[i].medao.token;
            this.profile.updateTokenBalance(token);
        }

        this.signedIn = true;

        console.log("Signed in as ", this.address);
    }

    async watch (identity) {
        var exists = false;
        for(var i = 0; i < this.watching.length; i++){
            if(this.watching[i].address == identity.address)
                exists = true;
        }

        if(!exists)
            this.watching.push(identity);

        console.log(this.watching)
    }

}
