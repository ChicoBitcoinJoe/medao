import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Web3Service } from '../../services/web3/web3.service';
import { DaiService } from '../../services/dai/dai.service';
import { MedaoService, MeDao } from '../../services/medao/medao.service';
import { ProfileService, Profile } from '../../services/profile/profile.service';

declare let web3: any;

@Injectable({
  providedIn: 'root'
})
export class UserService {

    ready: Promise<boolean>;

    address: string = null;
    signedIn: boolean = false;
    profile: Profile = null;
    medao: MeDao = null;
    name: string = null;
    hasDao: boolean = false;

    watching = [];
    network = [];

    constructor(
        private router: Router,
        public Web3: Web3Service,
        public Dai: DaiService,
        public MeDao: MedaoService,
        public Profile: ProfileService,
    ) {

    }

    async signIn () {
        this.ready = new Promise<boolean>(async (resolve, reject) => {
            this.address = await this.Web3.signIn();
            this.Web3.watchForAccountChanges();
            this.profile = await this.Profile.get(this.address);

            this.name = this.profile.name;
            this.medao = this.profile.medao;
            this.hasDao = this.profile.medao != null;

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
            resolve(true);
        })

        return this.ready;
    }

    createWizard (name) {
        console.log(name);
        if(this.hasDao) return;

        this.name = name;
        this.medao = new MeDao(this.Dai, null);
        this.medao.name = name;
        console.log(this)
        this.router.navigate(['/create']);
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
