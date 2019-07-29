import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-user-widget',
  templateUrl: './user-widget.component.html',
  styleUrls: ['./user-widget.component.scss']
})
export class UserWidgetComponent implements OnInit {

    @Input() App;

    constructor () { }

    ngOnInit () { }

}
