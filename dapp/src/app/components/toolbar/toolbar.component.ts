import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Web3Service } from '../../services/web3/web3.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

    constructor(
        private router: Router,
        public Web3: Web3Service,
    ) { }

    ngOnInit() {
    }

}
