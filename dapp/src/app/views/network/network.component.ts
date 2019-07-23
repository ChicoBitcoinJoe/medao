import { Component, OnInit } from '@angular/core';

import { AppService } from '../../services/app/app.service';

@Component({
  selector: 'app-network',
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.scss']
})
export class NetworkComponent implements OnInit {

    constructor(
        public App: AppService,
    ) { }

    ngOnInit() {

    }

}
