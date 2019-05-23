import { Pipe, PipeTransform } from '@angular/core';

import { Web3Service } from '../../services/web3/web3.service';

@Pipe({
  name: 'fromWei'
})
export class FromWeiPipe implements PipeTransform {

    constructor (
        private Web3: Web3Service,
    ) {
    }

	transform(value: any, args?: any): String {
        if(!value) return null;
		return this.Web3.instance.utils.fromWei(value, args);
	}

}
