import { Injectable } from '@angular/core';

declare let require: any;
declare let web3: any;
let DaiEthPriceFeed = require('../../../contracts/DSValueInterface.json');
let ERC20 = require('../../../contracts/ERC20.json');

@Injectable({
  providedIn: 'root'
})
export class DaiService {

    private DaiAddress = {
        '1': "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359",
        '42': "0xc4375b7de8af5a38a93548eb8453a498222c4ff2"
    }
    private DaiEthPriceFeedAddress = {
        '1': "0x729D19f657BD0614b4985Cf1D82531c67569197B",
        '42': "0xa5aA4e07F5255E14F02B385b1f04b35cC50bdb66",
    };

    instance;
    address;
    feed;
    eth;

    constructor() {}

    async setup () {
        this.address = this.DaiAddress[web3.network.id];
        this.instance = new web3.eth.Contract(ERC20.abi, this.address);
        this.feed = new web3.eth.Contract(DaiEthPriceFeed.abi, this.DaiEthPriceFeedAddress[web3.network.id]);
        var priceInWei = await this.feed.methods.read().call();
        this.eth = web3.utils.fromWei(priceInWei, 'ether');
    }

    fromWei (weiValue) {
        return Number(web3.utils.fromWei(weiValue, 'ether')) * this.eth;
    }

    async getBalance (address, unit) {
        if(!unit) unit = 'ether';

        let balance = await this.instance.methods.balanceOf(address).call();
        return web3.utils.fromWei(balance.toString(), unit);
    }

}
