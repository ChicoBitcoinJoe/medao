import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-right-nav',
  templateUrl: './right-nav.component.html',
  styleUrls: ['./right-nav.component.scss']
})
export class RightNavComponent implements OnInit {

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
