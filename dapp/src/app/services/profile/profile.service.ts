import { Injectable } from '@angular/core';

import { MedaoService, MeDao } from '../../services/medao/medao.service';

declare let web3: any;
declare let require: any;
let MeDaoArtifact = require('../../../contracts/MeDao.json');
let ERC20Artifact = require('../../../contracts/ERC20.json');
const Box = require('3box');

export class Profile {

    ready: Promise<boolean>;

    medao: MeDao = null;
    name: string = null;
    age: number = null;
    email: string = null;
    link: string = null;
    image: string = null;
    title: string = null;
    about: string = null;
    contract: string = null;
    network = [];

    balances = {
        ether: 0,
        dai: {
            wei: '0',
            value: 0.00
        },
        time: {
            value: null,
            wei: 0,
            seconds: 0,
            h: 0,
            m: 0,
            s: 0,
        }
    };

    paycheck = {
        date: null,
        timestamp: null,
        collecting: false,
        seconds: 0,
        value: 0,
    }

    birth = {
        date: null,
        timestamp: null,
    }

    wage = {
        current: {
            wei: '0',
            value: 0.00,
        },
        max: {
            wei: '0',
            value: 0.00,
        },
    };

    salary = {
        current: {
            wei: '0',
            value: 0.00,
        },
        max: {
            wei: '0',
            value: 0.00,
        },
    };

    supply = {
        current: {
            wei: '0',
            value: 0.00,
        },
        max: {
            wei: '0',
            value: 0.00,
        },
        inflation: 0,
    };

    funding = {
        current: {
            wei: '0',
            value: 0.00,
        },
        max: {
            wei: '0',
            value: 0.00,
        },
        percent: 0
    };

    subscriptions = {};

    constructor (
        public address: string,
        public MeDao: MedaoService,
        public storage: {
            public: any,
            private: any,
        },
    ) {
        this.ready = new Promise(async (resolve,reject) => {
            this.email = await this.storage.public.get('email');
            this.link = await this.storage.public.get('link');
            this.image = await this.storage.public.get('image');
            this.title = await this.storage.public.get('title');
            this.about = await this.storage.public.get('about');
            this.contract = await this.storage.public.get('contract');
            this.network = await this.getNetwork();

            this.watch(this.MeDao.dai, this.address, (event) => {
                this.updateDaiBalance();
            });

            await this.setupDao();
            await this.update();

            resolve();
        })
    }

    async setupDao () {
        if(this.medao) return;

        this.medao = await this.MeDao.of(this.address);
        if(this.medao){
            this.name = await this.medao.getName();
            this.birth.timestamp = await this.medao.methods.birthTimestamp().call();
            this.birth.date = new Date(this.birth.timestamp*1000);

            this.watch(this.medao.dai, this.medao.address, (event) => {
                this.calculateFunding();
            });

            this.watch(this.medao.token, this.address, (event) => {
                this.updateTimeBalance();
            });

            setInterval(() => {
                this.calculatePaycheck();
            }, 1000)

            await this.updateDao();
        }

        return this.medao;
    }

    async update () {
        await this.updateDaiBalance();
    }

    async updateDao () {
        if(!this.medao) {
            await this.setupDao();
            if(!this.medao) return;
        }

        await this.updateTimeBalance();
        await this.calculateAge();
        await this.calculateSupply();
        await this.calculateFunding();
        await this.calculateSalary();
        await this.calculateWage();
        await this.calculatePaycheck();
    }

    register () {
        if(this.medao) return;
        if(!this.name) return;
        if(!this.birth.timestamp) return;
        if(!this.balances.time.wei) return;
        if(!this.funding.current.wei) return;

        return this.MeDao.register(
            this.name,
            this.birth.timestamp,
            this.balances.time.wei,
            this.funding.current.wei
        );
    }

    async getNetwork () {
        let publicNetwork = await this.storage.public.get('network');
        let network = null;
        if(!publicNetwork){
            network = [];
            this.storage.public.set('network', JSON.stringify(network));
        } else {
            network = JSON.parse(publicNetwork);
        }

        return network;
    }

    follow (profile:Profile) {
        console.log("following " + profile.medao.address);
        if(!this.isFollowing(profile)) {
            this.network.push(profile.medao.address);
            this.storage.public.set("network", JSON.stringify(this.network));
            console.log(this.network)
        }
    }

    unfollow (profile:Profile) {
        console.log("unfollowing " + profile.medao.address);
        if(this.isFollowing(profile)) {
            let i = this.network.indexOf(profile.medao.address);
            this.network.splice(i,1);
            this.storage.public.set("network", JSON.stringify(this.network));
            console.log(this.network)
        }
    }

    isFollowing (profile:Profile) {
        return this.network.includes(profile.medao.address);
    }

    updateEmail (email) {
        if(this.validEmail(email)){
            this.email = email;
            this.storage.public.set('email', email);
            console.log("Updated email: ", email);
        }

        return this.email;
    }

    updateProfileLink (link) {
        this.link = link;
        this.storage.public.set('link', link);
        console.log("Updated profile link: ", link);

        return this.link;
    }

    updateImage (image) {
        this.image = image;
        this.storage.public.set('image', image);
        console.log("Updated profile image: ", image);

        return this.image;
    }

    updateTitle (title) {
        this.title = title;
        this.storage.public.set('title', title);
        console.log("Updated title: ", title);

        return this.title;
    }

    updateAbout (about) {
        this.about = about;
        this.storage.public.set('about', about);
        console.log("Updated about: ", about);

        return this.about;
    }

    updateContract (contract) {
        this.contract = contract;
        this.storage.public.set('contract', contract);
        console.log("Updated contract: ", contract);

        return this.contract;
    }

    validEmail(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    async balanceOf (profile) {
        return await this.getTimeBalance(this.medao.token, profile.address);
    }

    async setTimeBalance (profile:Profile) {
        this.balances.time[profile.medao.address] = await profile.balanceOf(this);
    }

    private async getTimeBalance (token, address) {
        if(!this.medao) {
            return {
                wei: 0,
                value: 0,
                seconds: 0,
                h: 0,
                m: 0,
                s: 0.
            }
        }

        let balanceInWei = await token.methods.balanceOf(address).call();
        let value = await this.medao.methods.calculateReserveClaim(balanceInWei).call();
        value = web3.utils.fromWei(value.toString(), 'ether');
        let balanceInSeconds = web3.utils.fromWei(balanceInWei.toString(), 'ether').toString();
        let seconds = balanceInSeconds;
        let hours = Math.floor(seconds / 3600);
        seconds -= hours*3600;
        let minutes = Math.floor(seconds / 60);
        seconds -= minutes*60;
        return {
            wei: balanceInWei,
            value: value,
            seconds: balanceInSeconds,
            h: hours,
            m: minutes,
            s: seconds
        }
    }

    async updateDaiBalance () {
        let balance = await this.MeDao.dai.methods.balanceOf(this.address).call();
        this.balances.dai.wei = balance;
        this.balances.dai.value = web3.utils.fromWei(balance.toString(), 'ether');
    }

    async updateTimeBalance () {
        this.balances.time = await this.balanceOf(this);
        this.balances[this.medao.address] = this.balances.time;
    }

    watch (token, address, callback) {
        token.events.Transfer({
            fromBlock: 'latest',
            filter: {to: [address]},
        })
        .on('data', callback);

        token.events.Transfer({
            fromBlock: 'latest',
            filter: {from: [address]},
        })
        .on('data', callback);
    }

    async calculateAge () {
        let now = new Date().getTime()/1000;
        let oneYearInSeconds = 60*60*24*365.25;
        this.age = (now - this.birth.timestamp) / oneYearInSeconds;
    }

    async calculateSupply () {
        if(!this.medao) return;

        this.supply.current.wei = await this.medao.token.methods.totalSupply().call()
        this.supply.current.value = web3.utils.fromWei(this.supply.current.wei.toString(), 'ether') / 3600;
        this.supply.max.wei = await this.medao.methods.maxTokenSupply().call()
        this.supply.max.value = web3.utils.fromWei(this.supply.max.wei.toString(), 'ether') / 3600;
        this.supply.inflation = 1 / this.age;
    }

    async calculateFunding () {
        if(!this.medao) return;

        this.funding.current.wei = await this.MeDao.dai.methods.balanceOf(this.medao.address).call();
        this.funding.current.value = web3.utils.fromWei(this.funding.current.wei.toString(), 'ether');
        this.funding.max.wei = await this.medao.methods.calculateReserveClaim(this.supply.max.wei).call();
        this.funding.max.value = web3.utils.fromWei(this.funding.max.wei.toString(), 'ether');
        this.funding.percent = this.funding.current.value / this.funding.max.value;
    }

    async calculateSalary () {
        if(!this.medao) return;

        this.salary.max.value = this.funding.max.value * this.supply.inflation;
        this.salary.max.wei = web3.utils.toWei(this.salary.max.value.toString(), 'ether');
        this.salary.current.value = this.funding.max.value * this.supply.inflation * this.funding.percent;
        this.salary.current.wei = web3.utils.toWei(this.salary.current.value.toString(), 'ether');
    }

    async calculateWage () {
        if(!this.medao) return;

        let oneHour = web3.utils.toWei('3600', 'ether');
        this.wage.max.wei = await this.medao.methods.calculateReserveClaim(oneHour.toString()).call();
        this.wage.max.value = web3.utils.fromWei(this.wage.max.wei.toString(), 'ether');
        this.wage.current.value = +((this.wage.max.value * this.funding.percent).toFixed(18));
        this.wage.current.wei = web3.utils.toWei(this.wage.current.value.toString(), 'ether');
    }

    async calculatePaycheck () {
        if(!this.medao) return;

        let now = new Date().getTime()/1000;
        this.paycheck.timestamp = await this.medao.methods.lastPayTimestamp().call();
        this.paycheck.date = new Date(this.paycheck.timestamp * 1000);
        let elapsedSeconds = Math.floor((now - this.paycheck.timestamp) * this.funding.percent);
        let workTimeInWei = await this.medao.methods.calculateWorkTime(elapsedSeconds).call();
        let seconds = web3.utils.fromWei(workTimeInWei.toString(), 'ether');
        this.paycheck.seconds = seconds;
        this.paycheck.value = seconds / 3600 * this.wage.current.value;
    }

    collectPaycheck () {
        this.paycheck.collecting = true;
        this.medao.methods.pay().send({
            from: web3.account
        })
        .on('confirmation', async (confirmations, txReceipt) => {
            if(confirmations == 1){
                await this.updateDao();
            }
        })
        .catch(err => {
            console.error(err);
        })
        .finally(() => {
            this.paycheck.collecting = false;
        })
    }

}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

    profiles = {};

    constructor(
        public MeDao: MedaoService
    ) { }

    async get (account) {
        if(!this.profiles[account])
            this.profiles[account] = await this.profile(account);

        return this.profiles[account];
    }

    private profile (account) {
        return new Promise (async (resolve, reject) => {
            let box = await Box.openBox(account, web3.givenProvider);
            box.onSyncDone(async () => {
                let storage = await box.openSpace('medao');
                let profile = new Profile(account, this.MeDao, storage);
                await profile.ready;
                resolve(profile);
            });
        });
    }

}
