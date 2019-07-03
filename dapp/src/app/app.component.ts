import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from "@angular/platform-browser";

import { Web3Service } from './services/web3/web3.service';
import { DaiService } from './services/dai/dai.service';
import { MedaoService } from './services/medao/medao.service';
import { UserService } from './services/user/user.service';

declare let web3: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

    ready: boolean = false;
    supportedNetworks = [42];
    subscription: any;
    route: string = null;

    constructor (
        private matIconRegistry: MatIconRegistry,
        private domSanitizer: DomSanitizer,
        public Web3: Web3Service,
        public Dai: DaiService,
        public Medao: MedaoService,
        public User: UserService,
    ) {
        this.Web3.initialize(this.supportedNetworks)
        .then(async initialized => {
            if(initialized){
                console.log(web3);
                await this.Dai.initialize();
                await this.Medao.initialize();
                if(web3.currentAccount){
                    console.log("Signed in to web3 as: ", web3.currentAccount);
                    await this.User.signIn();
                }

                this.ready = true;
                console.log('App ready');
            }
            else {
                console.error(new Error("network is not supported"));
            }
        })
        .catch(err => {
            console.error(err);
        })

        this.matIconRegistry.addSvgIcon("qrcode", this.domSanitizer.bypassSecurityTrustResourceUrl("./assets/qrcode.svg"));
    }

}
