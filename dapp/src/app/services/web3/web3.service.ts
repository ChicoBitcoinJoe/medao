import { Injectable } from '@angular/core';

declare let window: any;
declare let require: any;
const Web3 = require('web3');

let DaiPriceFeedArtifact = require('../../../contracts/DSValueInterface.json');

@Injectable({
  providedIn: 'root'
})
export class Web3Service {

    private DAI_PRICE_FEED = {
        '1': "0x729D19f657BD0614b4985Cf1D82531c67569197B",
        '42': "0xa5aA4e07F5255E14F02B385b1f04b35cC50bdb66",
    }

    instance: any;
    readyPromise: any;
    DaiPriceFeed: any;
    ethPriceInDai: any;

    network = {
        connected: false,
        name: 'no web3',
        id: null,
        allowed: [],
        valid: false,
    };

    account = {
        signedIn: false,
        address: null,
        balance: 0,
    }

    constructor () {
        if (window.ethereum) { // Modern dapp browsers...
            this.instance = new Web3(window.ethereum);
        }
        else if (window.web3) { // Legacy dapp browsers...
            console.warn("Your financial privacy is at risk! Disable automatic account exposure with whatever ethereum wallet provider you use")
            this.instance = new Web3(window.web3.currentProvider);
        }

        this.network.connected = this.instance != undefined;
    }

    ready () {
        if(!this.readyPromise){
            this.readyPromise = new Promise((resolve, reject) => {
                if(this.instance){
                    Promise.all([
                        this.instance.eth.net.getNetworkType(),
                        this.instance.eth.net.getId(),
                        this.getCurrentAccount()
                    ])
                    .then(promises => {
                        var networkName = promises[0];
                        var networkId = promises[1];
                        var currentAccount = promises[2];

                        this.network.name = networkName;
                        this.network.id = networkId;
                        this.network.valid = this.network.allowed.includes(networkName);
                        this.account.signedIn = currentAccount != null;
                        this.account.address = currentAccount;

                        this.watchForAccountChanges();
                        this.DaiPriceFeed = new this.instance.eth.Contract(DaiPriceFeedArtifact.abi, this.DAI_PRICE_FEED[this.network.id]);

                        if(!currentAccount){
                            this.DaiPriceFeed.methods.read().call()
                            .then(daiPriceInWei => {
                                this.ethPriceInDai = Number(this.instance.utils.fromWei(daiPriceInWei, 'ether'));
                                resolve(null)
                            });
                        }
                        else {
                            Promise.all([
                                this.DaiPriceFeed.methods.read().call(),
                                this.instance.eth.getBalance(currentAccount)
                            ])
                            .then(promises => {
                                var daiPriceInWei = promises[0];
                                var balance = promises[1];

                                this.ethPriceInDai = Number(this.instance.utils.fromWei(daiPriceInWei, 'ether'));
                                this.account.balance = balance;

                                resolve(this.account.address);
                            })
                        }


                    })
                    .catch(err => {
                        reject(err);
                    })
                }
                else {
                    reject(new Error('No web3 detected.'));
                }
            });
        }

        return this.readyPromise;
    }

    async signIn () {
        try {
            await window.ethereum.enable();
            this.account.signedIn = true;

            return this.watchForAccountChanges()
            .then(currentAccount => {
                this.instance.eth.getBalance(currentAccount)
                .then(balance => {
                    this.account.balance = balance;
                })
                return Promise.resolve(currentAccount);
            })
        } catch (error) {
            return Promise.reject(new Error("User denied account access."));
        }
    }

    async getCurrentAccount(){
		return this.instance.eth.getAccounts()
        .then(accounts => {
            if(accounts.length > 0){
                return accounts[0];
            } else {
                return null;
            }
        })
	}

    private watchForAccountChanges(){
        return this.getCurrentAccount()
        .then(currentAccount => {
            console.log("watching account: ", currentAccount);
            this.account.address = currentAccount;
            setInterval(() => {
                this.getCurrentAccount()
                .then(currentAccount => {
                    //console.log(currentAccount, this.account.address)
                    if(this.account.address && this.account.address != currentAccount)
                        location.reload();
                })
                .catch(err => {
                    console.error(err)
                })
            }, 250);
            return currentAccount;
        })
        .catch(err => {
            console.error(err);
        })
    }

    weiToDai (weiValue) {
        return Number(this.instance.utils.fromWei(weiValue,'ether')) * this.ethPriceInDai;
    }

    setAllowedNetworks (allowedNetworks) {
        this.network.allowed = allowedNetworks;
    }
}
