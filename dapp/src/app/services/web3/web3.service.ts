import { Injectable } from '@angular/core';

declare let window: any;
declare let require: any;
const Web3 = require('web3');

@Injectable({
  providedIn: 'root'
})
export class Web3Service {

    public account: string = null;
    private watching: string = null;
    private interval: any = null;

    public ready: Promise<boolean>;

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
            let maxInHex = window.web3.utils.toTwosComplement('-1');
            window.web3.utils['maxUintValue'] = window.web3.utils.hexToNumberString(maxInHex).toString();
            window.web3['signIn'] = this.signIn;
        }
    }

    async initialize (supportedNetworks) {
        if(window.web3['ready']) return window.web3['ready'];

        window.web3['ready'] = new Promise(async (resolve, reject) => {
            let networkName = await window.web3.eth.net.getNetworkType();
            let networkId = await window.web3.eth.net.getId();
            if(!supportedNetworks.includes(networkId))
                reject(new Error("invalid network id"));

            window.web3['account'] = await this.getCurrentAccount();
            window.web3['network'] = {
                name: networkName,
                id: networkId
            };

            resolve(window.web3.network.valid);
        });

        return window.web3.ready;
    }

    signIn () {
        return new Promise<string>(async (resolve, reject) => {
            if(!window.ethereum){
                reject('ethereum object undefined');
                return;
            }

            try {
                let accounts = await window.ethereum.enable();
                if(accounts.length > 0) {
                    let account = window.web3.utils.toChecksumAddress(accounts[0]);
                    window.web3['account'] = account;
                    this.account = account;
                    if(this.interval)
                        this.watchForAccountChanges();

                    resolve(this.account);
                }
                else {
                    console.log('8');
                    console.log("Not signed in")
                    reject(new Error("User denied account access."));
                }
            }
            catch (err) {
                reject(err);
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
