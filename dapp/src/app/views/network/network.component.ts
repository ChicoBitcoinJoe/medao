import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AppService } from '../../services/app/app.service';
import { ProfileService } from '../../services/profile/profile.service';

@Component({
  selector: 'app-network',
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.scss']
})
export class NetworkComponent implements OnInit {

    ready:boolean = false;
    profiles = [];

    constructor(
        private router: Router,
        public App: AppService,
        public Profile: ProfileService,
    ) { }

    async ngOnInit() {
        await this.App.ready;
        if(!this.App.user){
            this.router.navigate(['/home']);
            return;
        }

        var promises = [];
        this.App.user.network.forEach(medaoAddress => {
            promises.push(this.Profile.from(medaoAddress));
        });
        this.profiles = await Promise.all(promises);
        this.ready = true;
    }

}
