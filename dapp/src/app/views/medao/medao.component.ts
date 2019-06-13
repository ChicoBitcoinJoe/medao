import { Component, OnInit, Inject } from '@angular/core';
import { Router, Event, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Web3Service } from '../../services/web3/web3.service';
import { UserService } from '../../services/user/user.service';
import { MedaoService } from '../../services/medao/medao.service';


@Component({
  selector: 'app-medao',
  templateUrl: './medao.component.html',
  styleUrls: ['./medao.component.scss']
})
export class MedaoComponent implements OnInit {

    subscription;
    medao;

    constructor(
        public dialog: MatDialog,
        private router: Router,
        public Web3: Web3Service,
        public User: UserService,
        public MeDaoRegistry: MedaoService,
    ) { }

    ngOnInit () {
        this.initialize();

        this.subscription = this.router.events.subscribe( (event: Event) => {

            if (event instanceof NavigationStart) {

            }

            if (event instanceof NavigationEnd) {
                this.initialize();
            }

            if (event instanceof NavigationError) {
                // Hide loading indicator

                // Present error to user
                console.log(event.error);
            }
        });
    }

    ngOnDestroy () {
        this.subscription.unsubscribe();
    }

    async initialize () {
        let routes = this.router.url.split('/');
        let medaoAddress = routes[2];
        let medao = await this.MeDaoRegistry.at(medaoAddress);
        this.medao = medao;
    }

}
