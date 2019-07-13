import { Component, OnInit, Input } from '@angular/core';

import { MedaoService } from '../../services/medao/medao.service';
import { UserService } from '../../services/user/user.service';

declare let web3: any;

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

    web3 = web3;
    @Input() User: UserService;

    constructor(
        public MeDao: MedaoService
    ) { }

    ngOnInit() {

    }

}
