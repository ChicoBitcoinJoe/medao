import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Web3Service } from '../../services/web3/web3.service';
import { MedaoService, MeDao } from '../../services/medao/medao.service';

declare let web3: any;
declare let require: any;
const Box = require('3box');

export class Profile {

    ready: Promise<Profile>;
    dai: any = null;
    medao: MeDao = null;

    address: string;

    deployPromise: any;
    deploying: boolean = false;
    collectingPaycheck: boolean = false;

    data: any = null;
    space: any = null;

    name: string = null;
    email: string = null;
    link: string = null;
    image: string = null;
    title: string = null;
    about: string = null;
    contract: string = null;
    network = [];
    watching = {};

    balances = {
        paycheck: 0,
        ether: 0,
        dai: 0,
        time: {
            wei: 0,
            seconds: 0,
            h: 0,
            m: 0,
            s: 0,
        }
    };

    constructor (
        private Web3: Web3Service,
        private Box: any,
        private router: Router,
        public MeDao: MedaoService,
    ) {
        this.dai = this.MeDao.dai;
    }

    async initialize (address) {
        this.address = address;
        this.medao = await this.MeDao.of(this.address);
        this.data = await this.Box.openBox(this.address, web3.givenProvider);
        this.space = await this.data.openSpace('medao');
        this.update();
        this.data.onSyncDone(async () => {
            this.network = await this.getNetwork();
            this.update();
        });
    }

    async update () {
        this.email = await this.data.public.get('email');
        this.link = await this.data.public.get('link');
        this.image = await this.data.public.get('image');
        this.title = await this.data.public.get('title');
        this.about = await this.data.public.get('about');
        this.contract = await this.data.public.get('contract');
        this.updateDaiBalance();
        this.watch(this.MeDao.dai, (event) => {
            this.updateDaiBalance();
        });

        if(this.medao){
            this.name = this.medao.name;
            this.medao.update();
            this.updateTimeBalance(this.medao.token);
            this.watch(this.medao.token, (event) => {
                this.updateTimeBalance(this.medao.token);
            });
            this.balances.time = await this.getBalance(this.address)
            this.calculatePaycheck();
        }
    }

    register () {
        this.deployPromise = this.medao.deploy(this.balances.time.wei);
        this.deployPromise.on('transactionHash', txHash => {
            this.deploying = true;
            this.view();
        })
        .on('confirmation', async (confirmations, txReceipt) => {
            if(confirmations == 1){
                console.log(txReceipt);
                await this.initialize(web3.account);
                this.update();
            }
        })
        .catch(err => {
            console.error(err);
        })
        .finally(() => {
            this.deploying = false;
        });

        return this.deployPromise;
    }

    view () {
        if(this.medao)
            this.router.navigateByUrl('/profile/' + this.medao.address);
        else {
            if(!this.deploying)
                this.router.navigate(['/register']);
            else
                this.router.navigate(['/deploy']);
        }
    }

    async getNetwork () {
        let network = await this.data.public.get('network');
        if(!network){
            network = [];
            this.data.onSyncDone(async () => {
                this.data.public.set('network', network);
            });
        }

        return network;
    }

    follow (medaoAddress) {
        console.log("following " + medaoAddress);
        if(!this.isFollowing(medaoAddress)) {
            this.network.push(medaoAddress);
            this.data.public.set("network", JSON.stringify(this.network));
        }
    }

    unfollow (medaoAddress) {
        console.log("unfollowing " + medaoAddress);
        if(this.isFollowing(medaoAddress)) {
            let i = this.network.indexOf(medaoAddress);
            this.network.splice(i,1);
            this.data.public.set("network", JSON.stringify(this.network));
        }
    }

    isFollowing (medaoAddress) {
        return this.network.includes(medaoAddress);
    }

    updateEmail (email) {
        if(this.validEmail(email)){
            this.email = email;
            this.data.public.set('email', email);
            console.log("Updated email: ", email);
        }

        return this.email;
    }

    updateProfileLink (link) {
        this.link = link;
        this.data.public.set('link', link);
        console.log("Updated profile link: ", link);

        return this.link;
    }

    updateImage (image) {
        this.image = image;
        this.data.public.set('image', image);
        console.log("Updated profile image: ", image);

        return this.image;
    }

    updateTitle (title) {
        this.title = title;
        this.data.public.set('title', title);
        console.log("Updated title: ", title);

        return this.title;
    }

    updateAbout (about) {
        this.about = about;
        this.data.public.set('about', about);
        console.log("Updated about: ", about);

        return this.about;
    }

    updateContract (contract) {
        this.contract = contract;
        this.data.public.set('contract', contract);
        console.log("Updated contract: ", contract);

        return this.contract;
    }

    validEmail(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    async updateDaiBalance () {
        let balance = await this.MeDao.dai.methods.balanceOf(this.address).call();
        this.balances.dai = balance.toString();
    }

    async updateTimeBalance (token) {
        let timeObject = await this.getTimeBalance(this.address, token);
        this.balances[token.address] = timeObject;
    }

    async getBalance (address) {
        return await this.getTimeBalance(address, this.medao.token);
    }

    private async getTimeBalance (address, token) {
        if(!this.medao) {
            return {
                wei: '0',
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

    watch (token, callback) {
        if(this.watching[token.address]) return;

        this.watching[token.address] = {
            to: token.events.Transfer({
                fromBlock: 'latest',
                filter: {to: [this.address]},
            }),
            from: token.events.Transfer({
                fromBlock: 'latest',
                filter: {from: [this.address]},
            }),
        };

        this.watching[token.address].to.on('data', callback);
        this.watching[token.address].from.on('data', callback);
    }

    async calculatePaycheck () {
        if(!this.medao) return '0';

        let now = new Date().getTime()/1000;
        let elapsedSeconds = Math.floor((now - this.medao.paycheck.timestamp) * this.medao.funding.percent);
        let workTimeInWei = await this.medao.methods.calculateWorkTime(elapsedSeconds).call();
        let seconds = web3.utils.fromWei(workTimeInWei.toString(), 'ether');
        this.balances.paycheck = seconds;
    }

    collectPaycheck () {
        this.collectingPaycheck = true;
        this.medao.methods.pay().send({
            from: web3.account
        })
        .on('confirmation', async (confirmations, txReceipt) => {
            if(confirmations == 1){
                await this.update();
            }
        })
        .catch(err => {
            console.error(err);
        })
        .finally(() => {
            this.collectingPaycheck = false;
        })
    }
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

    profiles = {};

    constructor(
        private router: Router,
        public Web3: Web3Service,
        public MedaoService: MedaoService
    ) { }

    new () {
        return new Profile(this.Web3, Box, this.router, this.MedaoService);
    }

    async get (account) {
        if(!this.profiles[account]){
            let profile = this.new();
            await profile.initialize(account);
            this.profiles[account] = profile;
        } else {
            await this.profiles[account].update();
        }

        return this.profiles[account];
    }

}
