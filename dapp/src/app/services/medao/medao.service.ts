import { Injectable } from '@angular/core';

declare let web3: any;
declare let require: any;

let MiniMeTokenArtifact = require('../../../contracts/MiniMeToken.json');
let MeDaoArtifact = require('../../../contracts/MeDao.json');
let MeDaoFactoryArtifact = require('../../../contracts/MeDaoFactory.json');
let ERC20Artifact = require('../../../contracts/ERC20.json');

let Dai = {
    '1': "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359",
    '42': "0xc4375b7de8af5a38a93548eb8453a498222c4ff2"
}

export class MeDao {

    address: string;
    instance: any;
    methods: any;
    token: any;
    owner: string;
    identity: string;
    name: string;
    title: string;
    age: number;

    paycheck = {
        date: null,
        timestamp: null
    }

    birth = {
        date: null,
        timestamp: null,
    }

    wage = {
        current: null,
        max: null,
    };

    salary = {
        current: null,
        max: null
    };

    supply = {
        current: null,
        max: null,
        inflation: null,
    };

    funding = {
        current: null,
        max: null,
        percent: null
    };

    public currency: any;

    constructor (
        public dai: any,
        public factory: any,
    ) { }

    deploy (tokenClaim) {
        if(this.address) return;

        console.log(this.factory);
        console.log(this.name);
        console.log(this.birth.timestamp);
        console.log(tokenClaim);
        console.log(web3.utils.toWei(this.funding.current.toString(), 'ether'));

        return this.factory.methods.create(
            this.name,
            this.birth.timestamp,
            tokenClaim,
            web3.utils.toWei(this.funding.current.toString(), 'ether')
        )
        .send({
            from: web3.account
        })
    }

    async setIdentity (account) {
        this.identity = account;
        let medaoAddress = await this.factory.methods.registry(account).call();
        if(medaoAddress == web3.utils.nullAddress) return;

        await this.set(medaoAddress);
    }

    async set (address) {
        this.address = address;
        this.instance = new web3.eth.Contract(MeDaoArtifact.abi, this.address);
        this.methods = this.instance.methods;
        let tokenAddress = await this.methods.timeToken().call();
        this.token = await new web3.eth.Contract(MiniMeTokenArtifact.abi, tokenAddress);
        this.name = await this.token.methods.name.call();
        this.birth.timestamp = (await this.methods.birthTimestamp().call()).toNumber();
        this.birth.date = new Date(this.birth.timestamp * 1000);

        return await this.update();
    }

    async update () {
        this.identity = await this.methods.identity().call();
        this.owner = await this.methods.owner().call();
        this.paycheck.timestamp = await this.methods.lastPayTimestamp().call();
        this.paycheck.date = new Date(this.paycheck.timestamp*1000);

        let maxSupplyInWei = await this.methods.maxTokenSupply().call();
        let maxSupplyInHours = web3.utils.fromWei(maxSupplyInWei.toString(),'ether') / 3600;
        let totalSupplyInWei = await this.token.methods.totalSupply().call();
        let totalSupplyInSeconds =  web3.utils.fromWei(totalSupplyInWei.toString(), 'ether');
        let totalSupplyInHours =  totalSupplyInSeconds / 3600;
        let daiBalanceInWei = await this.dai.methods.balanceOf(this.address).call();
        let daiBalance =  web3.utils.fromWei(daiBalanceInWei.toString(), 'ether');
        let hourlyWageInWei = await this.methods.calculateReserveClaim(web3.utils.toWei('3600','ether')).call();
        let hourlyWage = web3.utils.fromWei(hourlyWageInWei.toString(), 'ether') / 3600;
        let maxFunding = hourlyWage * maxSupplyInHours;
        let now = (new Date()).getTime() / 1000;
        let oneYear = 60*60*24*365.25;
        let timeElapsed = now - this.birth.timestamp;
        this.age = timeElapsed / oneYear;
        this.supply.inflation = 1 / this.age;
        this.funding.current = daiBalance;
        this.funding.percent = totalSupplyInHours / maxSupplyInHours;
        this.funding.max = daiBalance / this.funding.percent;
        this.salary.max = this.funding.current * this.supply.inflation;
        this.salary.current = this.salary.max * this.funding.percent;
        this.supply.max = maxSupplyInHours;
        this.supply.current = totalSupplyInHours;
        this.wage.max = hourlyWage;
        this.wage.current = hourlyWage * this.funding.percent;
    }

    collect () {

    }

    invest (reserveAmount) {

    }

    divest (tokenAmount) {

    }

    transfer(destinationAddress, amount, fromAddress) {
        return this.token.methods.transfer(destinationAddress, amount)
        .send({
            from: fromAddress
        })
        .on('transactionHash', txHash => {

        })
        .on('confirmation', (confirmations, txReciept) => {

        })
    }

}

@Injectable({
  providedIn: 'root'
})
export class MedaoService {

    ready;
    factory;
    dai;

    constructor () { }

    initialize () {
        let factory = MeDaoFactoryArtifact.networks[web3.network.id].address;
        this.factory = new web3.eth.Contract(MeDaoFactoryArtifact.abi, factory);
        this.dai = new web3.eth.Contract(ERC20Artifact.abi, Dai[web3.network.id]);
    }

/*
    register (name, birthTimestamp, tokenClaim, reserveAmount) {
        console.log(name);
        console.log(birthTimestamp);
        console.log(tokenClaim);
        console.log(reserveAmount);

        return this.registry.methods.create(
            name,
            birthTimestamp,
            tokenClaim,
            reserveAmount
        )
        .send({
            from: web3.account
        });
    }
*/

    new () {
        return new MeDao(this.dai, this.factory);
    }

    async at (medaoAddress):Promise<MeDao> {
        let medao = this.new();
        await medao.set(medaoAddress);
        return medao;
    }

    async of (account):Promise<MeDao> {
        let medaoAddress = await this.factory.methods.registry(account).call();
        if(medaoAddress == web3.utils.nullAddress) return null;
        return this.at(medaoAddress);
    }

    async getIdentity (medaoAddress) {
        let medao = new web3.eth.Contract(MeDaoArtifact.abi, medaoAddress);
        let identity = await medao.methods.identity().call();
        return identity;
    }

}
