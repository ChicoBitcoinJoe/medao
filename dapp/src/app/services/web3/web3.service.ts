import { Injectable } from '@angular/core';

declare let window: any;
declare let require: any;
const Web3 = require('web3');

@Injectable({
  providedIn: 'root'
})
export class Web3Service {

    private watching: string = null;
    private interval: any = null;

    constructor () {
        if (window.ethereum) { // Modern dapp browsers...
            window.web3 = new Web3(window.ethereum);
            window.web3['connected'] = window.web3 != undefined;
        }
        else if (window.web3) { // Legacy dapp browsers...
            console.warn("Your financial privacy is at risk! Disable automatic account exposure with whatever ethereum wallet provider you use.");
            window.web3 = new Web3(window.web3.currentProvider);
            window.web3['connected'] = window.web3 != undefined;
        }
        else {
            window.web3 = new Web3("https://kovan.infura.io/v3/e49b5318974f466db1c55cb1247f1312");
        }

        if(window.web3){
            window.web3.utils['nullAddress'] = '0x0000000000000000000000000000000000000000';
        }
    }

    async initialize (supportedNetworks) {
        window.web3['ready'] = new Promise(async (resolve, reject) => {
            let networkName = await window.web3.eth.net.getNetworkType();
            let networkId = await window.web3.eth.net.getId();
            console.log("Found Network: " + networkName + " (id:" + networkId + ")");
            window.web3['network'] = {
                name: networkName,
                id: networkId,
                valid: supportedNetworks.includes(networkId)
            };

            resolve(window.web3.network.valid);
        });

        return window.web3.ready;
    }

    async signIn () {
        try {
            let accounts = await window.ethereum.enable();
            if(accounts.length > 0)
                return accounts[0];
            else
                return null;
        } catch (error) {
            return Promise.reject(new Error("User denied account access."));
        }
    }

    async getCurrentAccount(){
		let accounts = await window.web3.eth.getAccounts();
        if(accounts.length > 0){
            return accounts[0];
        } else
            return null;
	}

    async getAccountDetails (address) {
        if(!address){
            return {
                signedIn: false,
                address: null,
                balance: 0,
                subcription: null
            };
        }

        let balance = await window.web3.eth.getBalance(address);
        let subscription = 'todo: watch balance';

        return {
            signedIn: true,
            address: address,
            balance: balance,
            subcription: subscription
        };
    }

    async watchForAccountChanges(){
        let currentAccount = await this.getCurrentAccount();
        this.watching = currentAccount;
        if(this.interval)
            clearInterval(this.interval);

        this.interval = setInterval(async () => {
            let currentAccount = await this.getCurrentAccount();
            // console.log(this.watching, currentAccount)
            if(this.watching && this.watching != currentAccount)
                location.reload();
        }, 250);

        return currentAccount;
    }

}
