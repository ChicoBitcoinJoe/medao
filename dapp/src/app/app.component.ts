import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

    constructor (
          private matIconRegistry: MatIconRegistry,
          private domSanitizer: DomSanitizer,
      ) {
          this.matIconRegistry.addSvgIcon("qrcode", this.domSanitizer.bypassSecurityTrustResourceUrl("./assets/qrcode.svg"));
      }

}
