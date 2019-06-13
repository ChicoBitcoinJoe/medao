import { Component, OnInit, Input } from '@angular/core';

declare let web3: any;

@Component({
  selector: 'app-left-nav',
  templateUrl: './left-nav.component.html',
  styleUrls: ['./left-nav.component.scss']
})
export class LeftNavComponent implements OnInit {

    @Input() Web3;
    @Input() User;
    web3 = web3;

    constructor() { }

    ngOnInit() {
    }

}
