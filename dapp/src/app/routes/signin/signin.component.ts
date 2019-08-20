import { Component, OnInit } from '@angular/core';

import { AppService } from '../../services/app/app.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {

    constructor(
        public App: AppService
    ) { }

    ngOnInit() {

    }

}
