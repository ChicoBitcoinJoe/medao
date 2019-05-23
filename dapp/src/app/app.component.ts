import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from "@angular/platform-browser";

import { Web3Service } from './services/web3/web3.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

    constructor (
          private matIconRegistry: MatIconRegistry,
          private domSanitizer: DomSanitizer,
          public Web3: Web3Service,
      ) {
          this.Web3.setAllowedNetworks(['kovan']);
          this.Web3.ready()
          .then(currentAccount => {
              console.log(this.Web3)
              if(currentAccount){
                  // logged in = true;
              }
              else {
                  // logged in = false
              }
          })
          .catch(err => {
              console.warn(err);
          });

          this.matIconRegistry.addSvgIcon("qrcode", this.domSanitizer.bypassSecurityTrustResourceUrl("./assets/qrcode.svg"));
      }

}
