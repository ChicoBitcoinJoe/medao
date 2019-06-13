import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DaiService } from '../../services/dai/dai.service';

declare let web3: any;
declare let require: any;

let MiniMeTokenArtifact = require('../../../contracts/MiniMeToken.json');
let MeDaoArtifact = require('../../../contracts/MeDao.json');
let MeDaoRegistryArtifact = require('../../../contracts/MeDaoRegistry.json');
let WethToDaiConverterArtifact = require('../../../contracts/WethToDai.json');
let ERC20Artifact = require('../../../contracts/ERC20.json');


let Dex = {
    '1': "0x39755357759cE0d7f32dC8dC45414CCa409AE24e",
    '42': "0x4A6bC4e803c62081ffEbCc8d227B5a87a58f1F8F"
}

let Dai = {
    '1': "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359",
    '42': "0xc4375b7de8af5a38a93548eb8453a498222c4ff2"
}

let Weth = {
    '1': "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    '42': "0xd0A1E359811322d97991E03f863a0C30C2cF029C"
}

class MeDao {

    User: any;
    methods: any;
    token: any;

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
    wethConverter;
    dai;

    constructor(
        private router: Router,
        public Dai: DaiService,
    ) { }

    async initialize () {
        var registry = await MeDaoRegistryArtifact.networks[web3.network.id].address;
        this.registry = new web3.eth.Contract(MeDaoRegistryArtifact.abi, registry);
        var wethConverter = await WethToDaiConverterArtifact.networks[web3.network.id].address;
        this.wethConverter = new web3.eth.Contract(WethToDaiConverterArtifact.abi, wethConverter);
        this.dai = this.Dai.token;
    }

    create (
        name,
        birthTimestamp,
        tokenClaim,
        seedFunds,
        paymentToken,
        fromAddress
    ) {
        if(paymentToken == 'eth') {
            var valueInEther = (seedFunds / this.Dai.eth).toFixed(18);
            var valueInWei = web3.utils.toWei(valueInEther.toString(), 'ether');

            console.log(name);
            console.log(birthTimestamp);
            console.log(tokenClaim);
            console.log(seedFunds);
            console.log(paymentToken);
            console.log(valueInWei);

            console.log(this.registry.address);
            console.log(this.wethConverter.address);
            return this.registry.methods.create(
                name,
                birthTimestamp,
                tokenClaim,
                this.wethConverter.address,
                valueInWei,
                0
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
                let maxSupply = await medao.methods.maxTokenSupply().call();
                let birthTimestamp = await medao.methods.birthTimestamp().call();
                let birthDate = new Date(birthTimestamp*1000);
                let totalSupplyInWei = await token.methods.totalSupply().call();
                let totalSupply =  web3.utils.fromWei(totalSupplyInWei.toString(), 'ether');
                let daiBalanceInWei = await this.dai.methods.balanceOf(medaoAddress).call();
                let daiBalance =  web3.utils.fromWei(daiBalanceInWei.toString(), 'ether');
                let hourlyWage = daiBalance / totalSupply;
                let fundedPercent = Math.round(totalSupply / maxSupply);
                let owner = await medao.methods.owner().call();
                let lastPayTimestampInSeconds = await medao.methods.lastPayTimestamp().call();
                let lastPayTimestamp = new Date(lastPayTimestampInSeconds*1000);
                let tokenBalanceInWei = await token.methods.balanceOf(owner).call();
                let tokenBalance = web3.utils.fromWei(tokenBalanceInWei.toString(), 'ether');
                let timeElapsed = (new Date().getTime() - birthDate.getTime())/1000;
                let oneYear = 60*60*24*365.25;
                let age = Math.floor(timeElapsed/oneYear);
                let maxFunding = hourlyWage * maxSupply/3600;
                let currentSalary = hourlyWage * fundedPercent / 100 * 56 * 52;
                let maxSalary = hourlyWage * 56 * 52;

                medao['address'] = medaoAddress;
                medao['token'] = token;
                medao['name'] = name;
                medao['symbol'] = symbol;
                medao['age'] = age;
                medao['hourlyWage'] = hourlyWage;
                medao['currentSalary'] = currentSalary;
                medao['maxSalary'] = maxSalary;
                medao['balance'] = daiBalance;
                medao['totalSupply'] = totalSupply;
                medao['maxSupply'] = maxSupply;
                medao['birthDate'] = birthDate;
                medao['maxFunding'] = maxFunding;
                medao['fundedPercent'] = fundedPercent;
                medao['lastPaycheck'] = lastPayTimestamp;
                medao['owner'] = {
                    address: owner,
                    balance: tokenBalance
                };

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
