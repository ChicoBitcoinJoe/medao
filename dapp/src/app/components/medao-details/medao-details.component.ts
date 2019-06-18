import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-medao-details',
  templateUrl: './medao-details.component.html',
  styleUrls: ['./medao-details.component.scss']
})
export class MedaoDetailsComponent implements OnInit {

    @Input() User;
    @Input() medao;

    constructor() { }

    ngOnInit() {
    }

}
