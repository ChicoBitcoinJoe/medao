import { Component, OnInit, Input } from '@angular/core';

declare let web3: any;

@Component({
  selector: 'app-sidenav-left',
  templateUrl: './sidenav-left.component.html',
  styleUrls: ['./sidenav-left.component.scss']
})
export class SidenavLeftComponent implements OnInit {

    @Input() Web3;
    @Input() User;
    web3 = web3;

    constructor() { }

    ngOnInit() {
    }

}
