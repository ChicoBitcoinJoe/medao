import { Component, OnInit } from '@angular/core';

import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-network',
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.scss']
})
export class NetworkComponent implements OnInit {

    constructor(
        public User: UserService,
    ) { }

    ngOnInit() {

    }

}
