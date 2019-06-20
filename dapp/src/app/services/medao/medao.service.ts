import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DaiService } from '../../services/dai/dai.service';

declare let web3: any;
declare let require: any;

let MiniMeTokenArtifact = require('../../../contracts/MiniMeToken.json');
let MeDaoArtifact = require('../../../contracts/MeDao.json');
let MeDaoRegistryArtifact = require('../../../contracts/MeDaoRegistry.json');
let ERC20Artifact = require('../../../contracts/ERC20.json');

class MeDao {

    User: any;
    methods: any;
    token: any;
    title: string = "Cofounder and CEO of Everchain";

    transfer (address, tokenAmount) {
        return this.token.methods.transfer(address, tokenAmount).send({
            from: this.User.account.address
        })
    }

    invest (reserveAmount) {

    }

    divest (tokenAmount) {

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
    ) { }

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
                let medaoInstance = await new web3.eth.Contract(MeDaoArtifact.abi, medaoAddress);
                let medao = new MeDao();
                medao.methods = medaoInstance.methods;
                let tokenAddress = await medao.methods.timeToken().call();
                let token = await new web3.eth.Contract(MiniMeTokenArtifact.abi, tokenAddress);
                let controller = await token.methods.controller().call();
                let transfersEnabled = await token.methods.transfersEnabled().call();
                let name = await token.methods.name.call();
                let symbol = await token.methods.symbol.call();
                let maxSupplyInWei = await medao.methods.maxTokenSupply().call();
                let maxSupply = web3.utils.fromWei(maxSupplyInWei.toString(),'ether');
                let birthTimestamp = await medao.methods.birthTimestamp().call();
                let birthDate = new Date(birthTimestamp*1000);
                let totalSupplyInWei = await token.methods.totalSupply().call();
                let totalSupplyInSeconds =  web3.utils.fromWei(totalSupplyInWei.toString(), 'ether');
                let totalSupplyInHours =  totalSupplyInSeconds / 3600;
                let daiBalanceInWei = await this.Dai.getBalance(medaoAddress);
                let daiBalance =  web3.utils.fromWei(daiBalanceInWei.toString(), 'ether');
                let hourlyWage = daiBalance / totalSupplyInHours;
                let fundedPercent = Math.round(totalSupplyInHours / maxSupply);
                let owner = await medao.methods.owner().call();
                let lastPayTimestampInSeconds = await medao.methods.lastPayTimestamp().call();
                let lastPayTimestamp = new Date(lastPayTimestampInSeconds*1000);
                let timeElapsed = (new Date().getTime() - birthDate.getTime())/1000;
                let oneYear = 60*60*24*365.25;
                let age = Math.floor(timeElapsed/oneYear);
                let maxFunding = hourlyWage * maxSupply/3600;
                let currentSalary = hourlyWage * fundedPercent / 100 * 56 * 52;
                let maxSalary = hourlyWage * 40 * 52;

                medao['address'] = medaoAddress;
                medao.token = token;
                medao['name'] = name;
                medao['symbol'] = symbol;
                medao['age'] = age;
                medao['hourlyWage'] = hourlyWage;
                medao['currentSalary'] = currentSalary;
                medao['maxSalary'] = maxSalary;
                medao['balance'] = daiBalance;
                medao['totalSupply'] = totalSupplyInHours;
                medao['maxSupply'] = maxSupply;
                medao['birthDate'] = birthDate;
                medao['maxFunding'] = maxFunding;
                medao['fundedPercent'] = fundedPercent;
                medao['lastPaycheck'] = lastPayTimestamp;
                medao['owner'] = owner;

                resolve(medao);
            }
        });
    }


    newMedao = {
        name: null
    };

    createWizard (name) {
        this.newMedao.name = name;
        this.router.navigate(['/create']);
    }

}
