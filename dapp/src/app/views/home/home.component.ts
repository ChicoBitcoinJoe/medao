import { Component, OnInit } from '@angular/core';

import { Web3Service } from '../../services/web3/web3.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    tokens =  ['eth', 'dai'];
    selectedToken = 'eth';

    constructor(
        public Web3: Web3Service,
    ) { }

    ngOnInit() {
    }

    continue () {
        console.log("form submitted");

    }

    signIn () {
        this.Web3.signIn()
        .then(() => {

        })
    }

}
