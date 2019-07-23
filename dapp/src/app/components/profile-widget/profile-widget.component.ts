import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-profile-widget',
  templateUrl: './profile-widget.component.html',
  styleUrls: ['./profile-widget.component.scss']
})
export class ProfileWidgetComponent implements OnInit {

    @Input() App;

    constructor () { }

    ngOnInit () { }

}
