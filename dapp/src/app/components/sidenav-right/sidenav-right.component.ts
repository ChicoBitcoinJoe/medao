import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidenav-right',
  templateUrl: './sidenav-right.component.html',
  styleUrls: ['./sidenav-right.component.scss']
})
export class SidenavRightComponent implements OnInit {

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

    constructor() { }

    ngOnInit() {
    }
    
}
