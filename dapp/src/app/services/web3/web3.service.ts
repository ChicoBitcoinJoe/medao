import { Injectable } from '@angular/core';

declare let window: any;
declare let require: any;
const Web3 = require('web3');
declare let web3: any;

@Injectable({
  providedIn: 'root'
})
export class Web3Service {

    ready: Promise<boolean>;

    public account: string = null;
    private watching: string = null;
    private interval: any = null;

    constructor () {
        if (window.ethereum) { // Modern dapp browsers...
            window.web3 = new Web3(window.ethereum);
        }
        else if (window.web3) { // Legacy dapp browsers...
            console.warn("Your financial privacy is at risk! Disable automatic account exposure with whatever ethereum wallet provider you use.");
            window.web3 = new Web3(window.web3.currentProvider);
        }
        else {
            window.web3 = new Web3("https://kovan.infura.io/v3/e49b5318974f466db1c55cb1247f1312");
        }

        if(window.web3){
            window.web3.utils['nullAddress'] = '0x0000000000000000000000000000000000000000';
            let maxInHex = window.web3.utils.toTwosComplement('-1');
            window.web3.utils['maxUintValue'] = window.web3.utils.hexToNumberString(maxInHex).toString();
            window.web3['isSignedIn'] = false;
        }

        this.ready = new Promise(async (resolve, reject) => {
            web3['network'] = {
                valid: null,
                name: null,
                id: null,
            }

            web3.network.name = await window.web3.eth.net.getNetworkType();
            web3.network.id = await window.web3.eth.net.getId();
            resolve(true);
        });
    }

    signIn () {
        return new Promise<string>(async (resolve, reject) => {
            let accounts = [];
            if(window.ethereum){
                try {
                    accounts = await window.ethereum.enable();
                }
                catch (err) {
                    reject(err);
                }
                if(accounts.length == 0) {
                    console.log("Not signed in")
                    reject(new Error("User denied account access."));
                }
            }
            else if(window.web3){
                accounts = await window.web3.eth.getAccounts();
            }
            else {
                reject(new Error('unknown web3 configuration'));
            }

            if(accounts.length > 0) {
                let account = window.web3.utils.toChecksumAddress(accounts[0]);
                window.web3['account'] = account;
                window.web3['isSignedIn'] = true;
                resolve(account);
            }
        });
    }

    async getCurrentAccount(){
		let accounts = await window.web3.eth.getAccounts();
        if(accounts.length > 0){
            return window.web3.utils.toChecksumAddress(accounts[0]);
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
        let account = await this.getCurrentAccount();
        this.watching = account;
        //console.log('watching',account);
        if(this.interval)
            clearInterval(this.interval);

        this.interval = setInterval(async () => {
            let account = await this.getCurrentAccount();
            // console.log(this.watching, account)
            if(this.watching && this.watching != account)
                location.reload();
        }, 250);

        return account;
    }

}
