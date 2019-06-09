import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-info-bubbles',
  templateUrl: './info-bubbles.component.html',
  styleUrls: ['./info-bubbles.component.scss']
})
export class InfoBubblesComponent implements OnInit {

    @Input() medao;
    @Input() User;

    constructor() { }

    ngOnInit() {
    }

}
