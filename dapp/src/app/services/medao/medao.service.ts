import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DaiService } from '../../services/dai/dai.service';

declare let web3: any;
declare let require: any;

let MiniMeTokenArtifact = require('../../../contracts/MiniMeToken.json');
let MeDaoArtifact = require('../../../contracts/MeDao.json');
let MeDaoRegistryArtifact = require('../../../contracts/MeDaoRegistry.json');
let ERC20Artifact = require('../../../contracts/ERC20.json');

export class MeDao {

    title: string = "Cofounder and CEO of Everchain";

    instance: any;
    methods: any;
    token: any;
    owner: string;
    name: string;
    age: number;
    birthDate: Date;
    lastPaycheck: Date;

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

    constructor (
        public Dai: DaiService,
        public address: string,
    ) {
        this.instance = new web3.eth.Contract(MeDaoArtifact.abi, address);
        this.methods = this.instance.methods;
        this.update();
    }

    async update () {
        let owner = await this.methods.owner().call();
        let identity = await this.methods.identity().call();
        let tokenAddress = await this.methods.timeToken().call();
        let token = await new web3.eth.Contract(MiniMeTokenArtifact.abi, tokenAddress);
        let controller = await token.methods.controller().call();
        let transfersEnabled = await token.methods.transfersEnabled().call();
        let name = await token.methods.name.call();
        let maxSupplyInWei = await this.methods.maxTokenSupply().call();
        let maxSupplyInHours = web3.utils.fromWei(maxSupplyInWei.toString(),'ether') / 3600;
        let birthTimestamp = await this.methods.birthTimestamp().call();
        let birthDate = new Date(birthTimestamp*1000);
        let totalSupplyInWei = await token.methods.totalSupply().call();
        let totalSupplyInSeconds =  web3.utils.fromWei(totalSupplyInWei.toString(), 'ether');
        let totalSupplyInHours =  totalSupplyInSeconds / 3600;
        let daiBalanceInWei = await this.Dai.getBalance(this.address);
        let daiBalance =  web3.utils.fromWei(daiBalanceInWei.toString(), 'ether');
        let fundedPercent = totalSupplyInHours / maxSupplyInHours * 100;
        let hourlyWage = daiBalance / totalSupplyInHours;
        let currentWage =  hourlyWage * fundedPercent;
        let lastPayTimestampInSeconds = await this.methods.lastPayTimestamp().call();
        let lastPayTimestamp = new Date(lastPayTimestampInSeconds*1000);
        let timeElapsed = (new Date().getTime() - birthDate.getTime())/1000;
        let oneYear = 60*60*24*365.25;
        let age = timeElapsed/oneYear;
        let maxFunding = hourlyWage * maxSupplyInHours;
        let maxSalary = hourlyWage * 40 * 52;
        let currentSalary = maxSalary * fundedPercent / 100;

        this.owner = owner;
        this.token = token;
        this.name = name;
        this.age = age;
        this.funding.current = daiBalance;
        this.funding.max = maxFunding;
        this.funding.percent = fundedPercent;
        this.wage.current = currentWage;
        this.wage.max = hourlyWage;
        this.birthDate = birthDate;
        this.lastPaycheck = lastPayTimestamp;
        this.salary.current = currentSalary;
        this.salary.max = maxSalary;
        this.supply.current = totalSupplyInHours;
        this.supply.max = maxSupplyInHours;
        this.supply.inflation = 1 / age;
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

    private ready: Promise<any>;

    registry;
    exchange;

    constructor(
        private router: Router,
        public Dai: DaiService,
    ) {}

    async initialize () {
        var registry = await MeDaoRegistryArtifact.networks[web3.network.id].address;
        this.registry = new web3.eth.Contract(MeDaoRegistryArtifact.abi, registry);
    }

    create (
        name,
        birthTimestamp,
        tokenClaim,
        paymentToken,
        maxPayAmount,
        minFillAmount,
        valueInWei,
        fromAddress
    ) {
        if(paymentToken == 'ether') {
            console.log(name);
            console.log(birthTimestamp);
            console.log(tokenClaim);
            console.log(this.Dai.exchange.address);
            console.log(this.Dai.weth.address);
            console.log(maxPayAmount);
            console.log(minFillAmount);
            console.log(valueInWei);

            return this.registry.methods.create(
                name,
                birthTimestamp,
                tokenClaim,
                this.Dai.exchange.address,
                this.Dai.weth.address,
                maxPayAmount,
                minFillAmount
            )
            .send({
                from: fromAddress,
                value: valueInWei
            });
        }
        else if(paymentToken == 'dai') {

        }
        else if(paymentToken == 'weth') {

        }
    }

    createWithEther (
        name,
        birthTimestamp,
        tokenClaim,
        maxPayAmount,
        reserveAmount,
        fromAddress
    ) {
        console.log(name);
        console.log(birthTimestamp);
        console.log(tokenClaim);
        console.log(maxPayAmount);
        console.log(reserveAmount);
        console.log(this.Dai.exchange.address);

        return this.registry.methods.create(
            name,
            birthTimestamp,
            tokenClaim,
            reserveAmount,
            this.Dai.exchange.address,
        )
        .send({
            from: fromAddress,
            value: maxPayAmount
        });
    }

    createWithDai (
        name,
        birthTimestamp,
        tokenClaim,
        reserveAmount,
        fromAddress
    ) {
        console.log(name);
        console.log(birthTimestamp);
        console.log(tokenClaim);
        console.log(reserveAmount);
        console.log(this.Dai.exchange.address);

        this.Dai.methods.approve(this.registry.address, reserveAmount).send({
            from: fromAddress,
        })
        .on('confirmation', (confirmations, txReceipt) => {
            this.registry.methods.create(
                name,
                birthTimestamp,
                tokenClaim,
                reserveAmount,
                this.Dai.exchange.address,
            )
            .send({
                from: fromAddress
            });
        })
    }

    async addressOf (account) {
        let medaoAddress = await this.registry.methods.registry(account).call();
        return medaoAddress;
    }

    at (medaoAddress) {
        return new Promise(async (resolve, reject) => {
            if(medaoAddress == web3.utils.nullAddress){
                resolve(null);
            }
            else {
                let medao = new MeDao(this.Dai, medaoAddress);
                await medao.update();
                resolve(medao);
            }
        });
    }

    async getIdentity (medaoAddress) {
        let medao = new web3.eth.Contract(MeDaoArtifact.abi, medaoAddress);
        let identity = await medao.methods.identity().call();
        return identity;
    }

    newMedao = {
        name: null
    };

    createWizard (name) {
        this.newMedao.name = name;
        this.router.navigate(['/create']);
    }

}
