import { Injectable } from '@angular/core';

import { Web3Service } from '../../services/web3/web3.service';

declare let require: any;
let MeDaoRegistryArtifact = require('../../../contracts/MeDaoRegistry.json');
let WethToDaiConverterArtifact = require('../../../contracts/WethToDai.json');

@Injectable({
  providedIn: 'root'
})
export class MedaoService {

    registry;
    wethConverter;

    constructor(
        public Web3: Web3Service,
    ) {
        this.Web3.ready()
        .then(async () => {
            var registry = await MeDaoRegistryArtifact.networks[this.Web3.network.id].address;
            this.registry = new this.Web3.instance.eth.Contract(MeDaoRegistryArtifact.abi, registry);
            var wethConverter = await WethToDaiConverterArtifact.networks[this.Web3.network.id].address;
            this.wethConverter = new this.Web3.instance.eth.Contract(WethToDaiConverterArtifact.abi, wethConverter);
        })
    }

    create (
        name,
        birthTimestamp,
        tokenClaim,
        seedFunds,
        paymentToken,
    ) {
        if(paymentToken == 'eth') {
            var valueInEther = seedFunds / this.Web3.ethPriceInDai;
            var valueInWei = this.Web3.instance.utils.toWei(valueInEther.toString(), 'ether');

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
                0
            )
            .send({
                from: this.Web3.account.address,
                value: valueInWei
            });
        }
        else if(paymentToken == 'dai') {

        }
        else if(paymentToken == 'weth') {

        }
    }

}
