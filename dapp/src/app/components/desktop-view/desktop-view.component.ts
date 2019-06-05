import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MatSidenav } from '@angular/material';

import { Web3Service } from '../../services/web3/web3.service';
import { UserService } from '../../services/user/user.service';
import { MedaoService } from '../../services/medao/medao.service';

@Component({
  selector: 'app-desktop-view',
  templateUrl: './desktop-view.component.html',
  styleUrls: ['./desktop-view.component.scss']
})
export class DesktopViewComponent implements OnInit {

    @Input() medao;
/*
    @ViewChild('rightNav') rightNav: MatSidenav;
    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.configureSideNav();
    }
*/

    opened;
    mode;

    posts = [
        {
            author: 'Amber Reed',
            date: new Date(),
            body: 'I think you should learn a new skill in order to make your time worth more!',
        },
        {
            author: 'Amber Reed',
            date: new Date(),
            body: 'I think you should learn a new skill in order to make your time worth more!',
        },
        {
            author: 'Amber Reed',
            date: new Date(),
            body: 'I think you should learn a new skill in order to make your time worth more!',
        }
    ];

    constructor(
        private router: Router,
        public Web3: Web3Service,
        public User: UserService,
        public MeDaoRegistry: MedaoService,
    ) { }

    ngOnInit() {

    }

    configureSideNav() {
        let mobile = window.innerWidth <= 599;
        if (mobile) {
          this.mode = "over"
          this.opened = false
        } else {
          this.mode = 'side'
          this.opened = true
        }
    }

}
