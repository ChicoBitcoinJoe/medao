import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from "@angular/platform-browser";

import { Web3Service } from './services/web3/web3.service';
import { UserService } from './services/user/user.service';
import { DaiService } from './services/dai/dai.service';
import { MedaoService } from './services/medao/medao.service';

declare let web3: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

    ready: boolean = false;

    constructor (
        private matIconRegistry: MatIconRegistry,
        private domSanitizer: DomSanitizer,
        public Web3: Web3Service,
        public Dai: DaiService,
        public User: UserService,
        public Medao: MedaoService,
    ) {
        this.initialize()
        this.matIconRegistry.addSvgIcon("qrcode", this.domSanitizer.bypassSecurityTrustResourceUrl("./assets/qrcode.svg"));
    }

    async initialize() {
        let allowedNetworks = ['kovan'];
        let initialized = await this.Web3.initialize(allowedNetworks);
        if(initialized){
            this.Dai.initialize();
            this.Medao.initialize();
            this.User.initialize();
            this.ready = true;
        }
        else {

        }
    }

}
