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

    ready: Promise<boolean>;

    methods: any;
    token: any;

    constructor (
        public address: string,
        public factory: any,
        public dai: any,
    ) {
        this.ready = new Promise (async (resolve, reject) => {
            this.methods = new web3.eth.Contract(MeDaoArtifact.abi, this.address).methods;
            let tokenAddress = await this.methods.timeToken().call();
            this.token = new web3.eth.Contract(MiniMeTokenArtifact.abi, tokenAddress);
            resolve(true);
        })
    }

    async getName () {
        return this.token.methods.name().call();
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

    register (name, birthTimestamp, tokenClaim, reserveAmount) {
        console.log(name);
        console.log(birthTimestamp);
        console.log(tokenClaim);
        console.log(reserveAmount);

        if(!name) return;
        if(!birthTimestamp) return;
        if(!tokenClaim) return;
        if(!reserveAmount) return;

        return this.factory.methods.create(
            name,
            birthTimestamp,
            tokenClaim,
            reserveAmount
        )
        .send({
            from: web3.account
        });
    }

    async at (address):Promise<MeDao> {
        let medao = new MeDao(address, this.factory, this.dai);
        await medao.ready;
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
