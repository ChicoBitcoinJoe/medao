import { Component, OnInit, Input } from '@angular/core';

import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-signin-button',
  templateUrl: './signin-button.component.html',
  styleUrls: ['./signin-button.component.scss']
})
export class SigninButtonComponent implements OnInit {

    @Input() disabled;

    constructor(
        public User: UserService,
    ) { }

    ngOnInit() {}

    signIn () {
        this.User.signIn();
    }

}
