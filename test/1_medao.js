const MeDaoArtifact = artifacts.require("MeDao");
const MeDaoFactoryArtifact = artifacts.require("MeDaoFactory");

contract("MeDao", accounts => {

    var MeDaoFactory;
    var RegisterTx;

    it("deploy a medao", () => {
        return MeDaoFactoryArtifact.deployed()
        .then(async medaoFactory => {
            MeDaoFactory = medaoFactory;
            RegisterTx = await MeDaoFactory.register(
                "John Doe",
                web3.utils.toWei('10', 'ether')
            );
            console.log(RegisterTx);
        })
    });

});
