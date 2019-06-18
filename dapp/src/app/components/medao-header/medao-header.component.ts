import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-medao-header',
  templateUrl: './medao-header.component.html',
  styleUrls: ['./medao-header.component.scss']
})
export class MedaoHeaderComponent implements OnInit {

    @Input() User;
    @Input() medao;

    constructor() { }

    ngOnInit() {
    }

}
