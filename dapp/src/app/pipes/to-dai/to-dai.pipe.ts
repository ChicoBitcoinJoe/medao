import { Pipe, PipeTransform } from '@angular/core';

import { DaiService } from '../../services/dai/dai.service';

@Pipe({
  name: 'toDai'
})
export class ToDaiPipe implements PipeTransform {

	constructor(
        public Dai: DaiService,
    ){}

	transform(value: any, args?: any): any {
		if(!value) return null;
		return this.Dai.fromWei(value)
	}

}
