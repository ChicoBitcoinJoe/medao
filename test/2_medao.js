const MeDao = artifacts.require("MeDao");

contract("MeDao", accounts => {

    it("should put 10000 MetaCoin in the first account", () => {
        MeDao.deployed()
        .then(instance => {

        });
    });

});
