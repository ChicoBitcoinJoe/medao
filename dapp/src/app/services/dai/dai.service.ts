import { Injectable } from '@angular/core';

declare let require: any;
declare let web3: any;
let FeedArtifact = require('../../../contracts/DSValueInterface.json');
let ExchangeArtifact = require('../../../contracts/DEX.json');
let WethArtifact = require('../../../contracts/WETH.json');
let ERC20Artifact = require('../../../contracts/ERC20.json');

let Exchange = {
    '1': "0x39755357759cE0d7f32dC8dC45414CCa409AE24e",
    '42': "0x4A6bC4e803c62081ffEbCc8d227B5a87a58f1F8F"
}

let Dai = {
    '1': "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359",
    '42': "0xc4375b7de8af5a38a93548eb8453a498222c4ff2"
}

let Feed = {
    '1': "0x729D19f657BD0614b4985Cf1D82531c67569197B",
    '42': "0xa5aA4e07F5255E14F02B385b1f04b35cC50bdb66",
}

let Weth = {
    '1': "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    '42': "0xd0A1E359811322d97991E03f863a0C30C2cF029C"
}

@Injectable({
  providedIn: 'root'
})
export class DaiService {

    address;
    instance;
    methods;
    exchange;
    feed;
    weth;
    price = {
        eth: 0
    };

    constructor() {}

    async initialize () {
        this.address = Dai[web3.network.id];
        this.instance = new web3.eth.Contract(ERC20Artifact.abi, this.address);
        this.methods = this.instance.methods;
        this.exchange = new web3.eth.Contract(ExchangeArtifact.abi, Exchange[web3.network.id]);
        this.feed = new web3.eth.Contract(FeedArtifact.abi, Feed[web3.network.id]);
        this.weth = new web3.eth.Contract(WethArtifact.abi, Weth[web3.network.id]);
        var priceInWei = await this.feed.methods.read().call();
        this.price.eth = web3.utils.fromWei(priceInWei, 'ether');
    }

    fromWei (weiValue) {
        return Number(web3.utils.fromWei(weiValue, 'ether')) * this.price.eth;
    }

    async getBalance (address, unit) {
        if(!unit) unit = 'ether';

        let balance = await this.instance.methods.balanceOf(address).call();
        return web3.utils.fromWei(balance.toString(), unit);
    }

}
