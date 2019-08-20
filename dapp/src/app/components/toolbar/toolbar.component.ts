import { Component, OnInit } from '@angular/core';

import { AppService } from '../../services/app/app.service';

declare let web3: any;

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

    web3 = web3;

    constructor (
        public App: AppService,
    ) {

    }

    ngOnInit() {

    }

}
