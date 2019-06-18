import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from "@angular/platform-browser";
import { Router, Event, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';

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
    supportedNetworks = [42];
    subscription: any;
    route: string = null;

    constructor (
        private matIconRegistry: MatIconRegistry,
        private domSanitizer: DomSanitizer,
        private router: Router,
        public Web3: Web3Service,
        public Dai: DaiService,
        public User: UserService,
        public Medao: MedaoService,
    ) {
        this.initialize()
        this.matIconRegistry.addSvgIcon("qrcode", this.domSanitizer.bypassSecurityTrustResourceUrl("./assets/qrcode.svg"));

        this.subscription = this.router.events.subscribe( (event: Event) => {

            if (event instanceof NavigationStart) {

            }

            if (event instanceof NavigationEnd) {
                this.route = this.router.url.split('/')[1];
            }

            if (event instanceof NavigationError) {
                console.log(event.error);
            }
        });
    }

    async initialize() {
        let initialized = await this.Web3.initialize(this.supportedNetworks);
        if(initialized){
            this.Dai.initialize();
            this.Medao.initialize();
            this.ready = await this.User.initialize();
        }
        else {
            console.error(new Error("network is not supported"));
        }
    }

}
