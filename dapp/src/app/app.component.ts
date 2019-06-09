import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from "@angular/platform-browser";

import { Web3Service } from './services/web3/web3.service';
import { UserService } from './services/user/user.service';
import { DaiService } from './services/dai/dai.service';

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
      ) {
          this.Web3.setAllowedNetworks(['kovan']);

          this.Web3.ready()
          .then(async () => {
              this.Dai.setup();
              if(this.Web3.account.signedIn){
                  this.User.signIn();
                  this.ready = true;
              }
              else {
                  // logged in = false
                  this.ready = true;
              }
          })
          .catch(err => {
              console.warn(err);
          });

          this.matIconRegistry.addSvgIcon("qrcode", this.domSanitizer.bypassSecurityTrustResourceUrl("./assets/qrcode.svg"));
      }

}
