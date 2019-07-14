import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Web3Service } from '../../services/web3/web3.service';
import { MedaoService } from '../../services/medao/medao.service';
import { DaiService } from '../../services/dai/dai.service';

declare let web3: any;
declare let require: any;
const Box = require('3box');

export class Profile {

    signedIn: boolean = false;

    name: string;
    email: string;
    link: string;
    image: string;
    title: string;
    about: string;
    contract: string;
    network = [];
    medao: any = null;
    balances = {
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
        public address: string,
        public data: any,
        public Dai: DaiService,
        public MeDao: MedaoService,
        private router: Router,
    ) { }

    async initialize () {
        this.signedIn = web3.currentAccount == this.address;
        this.network = await this.getNetwork();
        this.email = await this.data.public.get('email');
        this.link = await this.data.public.get('link');
        this.image = await this.data.public.get('image');
        this.title = await this.data.public.get('title');
        this.about = await this.data.public.get('about');
        this.contract = await this.data.public.get('contract');

        let medaoAddress = await this.data.public.get('address');
        if(!medaoAddress){
            medaoAddress = await this.MeDao.registry.methods.registry(this.address).call();
            if(medaoAddress != web3.utils.nullAddress)
                this.data.public.set('address', medaoAddress);
            else
                medaoAddress = null;
        }

        if(medaoAddress){
            this.medao = await this.MeDao.at(medaoAddress);
            this.name = this.medao.name;
            await this.updateTimeBalance();
        }

        await this.updateEtherBalance();
        await this.updateDaiBalance();

        return;
    }

    view () {
        this.router.navigateByUrl('/profile/' + this.medao.address);
    }

    async getNetwork () {
        let network = await this.data.public.get('network');
        if(!network){
            network = '[]';
            this.data.public.set('network', network);
        }

        return JSON.parse(network);
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

    async updateTokenBalance (token) {
        let timeBalanceInWei = await token.methods.balanceOf(this.address).call();
        this.balances[token.address] = {
            wei: 0,
            seconds: 0,
            h: 0,
            m: 0,
            s: 0,
        };

        this.balances[token.address].wei = timeBalanceInWei.toString();
        let seconds = web3.utils.fromWei(this.balances[token.address].wei, 'ether');
        this.balances[token.address].seconds = seconds.toString();
        let hours = Math.floor(seconds / 3600);
        seconds -= hours*3600;
        let minutes = Math.floor(seconds / 60);
        seconds -= minutes*60;
        this.balances[token.address].h = hours;
        this.balances[token.address].m = minutes;
        this.balances[token.address].s = seconds;
        return;
    }

    async updateTimeBalance () {
        let timeBalanceInWei = await this.medao.token.methods.balanceOf(this.address).call();
        this.balances.time.wei = timeBalanceInWei.toString();
        let seconds = web3.utils.fromWei(this.balances.time.wei, 'ether');
        this.balances.time.seconds = seconds.toString();
        let hours = Math.floor(seconds / 3600);
        seconds -= hours*3600;
        let minutes = Math.floor(seconds / 60);
        seconds -= minutes*60;
        this.balances.time.h = hours;
        this.balances.time.m = minutes;
        this.balances.time.s = seconds;
        this.balances[this.medao.token.address] = this.balances.time;
        return;
    }

    async updateEtherBalance () {
        let etherBalanceInWei = await web3.eth.getBalance(this.address);
        this.balances.ether = etherBalanceInWei.toString();
        return etherBalanceInWei;
    }

    async updateDaiBalance () {
        let daiBalanceInWei = await this.Dai.methods.balanceOf(this.address).call();
        this.balances.dai = daiBalanceInWei.toString();
        return daiBalanceInWei;
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

}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

    profiles = {};

    constructor(
        private router: Router,
        public Web3: Web3Service,
        public Dai: DaiService,
        public MeDao: MedaoService,
    ) { }

    async get (account) {
        if(!this.profiles[account]){
            let userData:any = await this.getBox(account);
            let medaoData = await userData.openSpace('medao');
            let profile = new Profile(account, medaoData, this.Dai, this.MeDao, this.router);
            await profile.initialize();
            this.profiles[account] = profile;
        }

        return this.profiles[account];
    }

    private getBox (account) {
        return new Promise(async (resolve, reject) => {
            let box = await Box.openBox(account, web3.givenProvider)
            box.onSyncDone(async () => {
                resolve(box);
            });
        });
    }

}
