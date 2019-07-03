import { Injectable } from '@angular/core';

declare let web3: any;
declare let require: any;
const Box = require('3box');

@Injectable({
  providedIn: 'root'
})
export class BoxService {

    ready: Promise<boolean>;
    instance: any;
    private: any;
    public: any;
    getProfile: any;

    constructor() { }

    initialize (account) {
        return new Promise(async (resolve, reject) => {
            this.instance = await Box.openBox(account, web3.givenProvider)
            this.instance.onSyncDone(async () => {
                this.private = this.instance.private;
                this.public = this.instance.public;
                this.getProfile = this.instance.getProfile;
                resolve(true)
            });
        });
    }

}
