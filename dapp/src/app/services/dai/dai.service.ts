import { Injectable } from '@angular/core';

declare let require: any;
declare let web3: any;
let DaiEthPriceFeed = require('../../../contracts/DSValueInterface.json');
let DEXArtifact = require('../../../contracts/DEX.json');
let ERC20 = require('../../../contracts/ERC20.json');
let WETH = require('../../../contracts/WETH.json');

let DaiAddress = {
    '1': "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359",
    '42': "0xc4375b7de8af5a38a93548eb8453a498222c4ff2"
}

let WethAddress = {
    '1': "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    '42': "0xd0A1E359811322d97991E03f863a0C30C2cF029C"
}

let DaiEthPriceFeedAddress = {
    '1': "0x729D19f657BD0614b4985Cf1D82531c67569197B",
    '42': "0xa5aA4e07F5255E14F02B385b1f04b35cC50bdb66",
};

let DexAddress = {
    '1': "0x39755357759cE0d7f32dC8dC45414CCa409AE24e",
    '42': "0x4a6bc4e803c62081ffebcc8d227b5a87a58f1f8f",
};

@Injectable({
  providedIn: 'root'
})
export class DaiService {

    address;
    token;
    feed;
    eth;
    weth;
    exchange;

    constructor() {}

    async initialize () {
        this.address = DaiAddress[web3.network.id];
        this.token = new web3.eth.Contract(ERC20.abi, this.address);
        this.feed = new web3.eth.Contract(DaiEthPriceFeed.abi, DaiEthPriceFeedAddress[web3.network.id]);
        var priceInWei = await this.feed.methods.read().call();
        this.eth = web3.utils.fromWei(priceInWei, 'ether');
        this.weth = new web3.eth.Contract(WETH.abi, WethAddress[web3.network.id]);
        this.exchange = new web3.eth.Contract(DEXArtifact.abi, DexAddress[web3.network.id]);
    }

    fromWei (weiValue) {
        return Number(web3.utils.fromWei(weiValue, 'ether')) * this.eth;
    }

    async getBalance (address) {
        let balance = await this.token.methods.balanceOf(address).call();
        return balance;
    }

}
