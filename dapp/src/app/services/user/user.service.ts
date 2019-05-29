import { Injectable } from '@angular/core';

import { Web3Service } from '../../services/web3/web3.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

    constructor(
        public Web3: Web3Service,
    ) { }

    signIn () {
      this.Web3.signIn()
      .then(() => {
          /* ... */
      })
    }

}
