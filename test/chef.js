const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BN, time, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

describe("SUTEKU VAULT", function () {
    // Smart Contract Variables
    let chef, vault, suteku
    // Utilities
    let chefMari, chefOwner;
    // General Variables
    let tx, balance, poolLength, poolInfo

    // Function that does all the setting up the environment
    const setup = async () => {
        [owner, alice, bob, cindy, domino, erik, fred, george, julias, mike] = await ethers.getSigners();

        // Get account of Chef Mari
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: ["0xD0C53C9996CDDFc0A6B6804d04F3a0E6D4ad824e"],
        });
        // Increasing his BNB Balance
        await network.provider.send("hardhat_setBalance", [
            "0xD0C53C9996CDDFc0A6B6804d04F3a0E6D4ad824e",
            "0x56BC75E2D63100000",
        ]);
        chefMari = await ethers.getSigner("0xD0C53C9996CDDFc0A6B6804d04F3a0E6D4ad824e")

        // Get account of MasterChef owner
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: ["0xa3c4c08Ae954b98dA3C93842211cB50798DFfC37"],
        });
        // Increasing his BNB Balance
        await network.provider.send("hardhat_setBalance", [
            "0xa3c4c08Ae954b98dA3C93842211cB50798DFfC37",
            "0x56BC75E2D63100000",
        ]);
        chefOwner = await ethers.getSigner("0xa3c4c08Ae954b98dA3C93842211cB50798DFfC37")

    };

    before(async () => {
        // Setup the Binance smart chain fork environment
        await setup();

        // Get Suteku
        suteku = await ethers.getContractAt("contracts/sokuswap/MasterChef.sol:Suteku", "0x198800aF50914004A9E9D19cA18C0b24587a50cf");

        latestBlock = await time.latestBlock()

        // Get MasterChef
        const MasterChef = await ethers.getContractFactory("contracts/sokuswap/MasterChef.sol:MasterChef")
        chef = await MasterChef.connect(owner).deploy(suteku.address, parseUnits(1, 18), latestBlock.toString());
        await chef.deployed()

        tx = await chef.connect(owner).setFundSource("0x3af26aac08380fbd46c2b5b65256a52b1d6db6ea")
        await tx.wait()

        // Get MasterChef
        const ERC20Test = await ethers.getContractFactory("ERC20Test")

        test1 = await ERC20Test.connect(owner).deploy();
        await test1.deployed()

        test2 = await ERC20Test.connect(owner).deploy();
        await test2.deployed()

        console.log("MasterChef deployed to:", chef.address);
        console.log("ERC20Test1 deployed to:", test1.address);
        console.log("ERC20Test2 deployed to:", test2.address);
    });
    // it("Transfer some tokens", async function () {
    //     tx = await test1.connect(owner).mint(alice.address, parseUnits(1000, 18));
    //     await tx.wait()
    //     tx = await test2.connect(owner).mint(alice.address, parseUnits(1000, 18));
    //     await tx.wait()
    // })
    it("Updating MasterChef and staking again", async function () {
        
        // Creating a new pool for Suteku 
        tx = await chef.connect(owner).add(2000, test1.address, true)
        await tx.wait()
        // Creating a new pool for Suteku 
        tx = await chef.connect(owner).add(5000, test2.address, true)
        await tx.wait()

        poolInfo = await chef.poolInfo(0)
        // console.log("PoolInfo BEFORE", poolInfo);
        console.log("PoolInfo allocPoint BEFORE", poolInfo.allocPoint);
        

        // Reset Allocation Point of Suteku pool 
        tx = await chef.connect(owner).set(0, poolInfo.allocPoint, false)
        await tx.wait()

        poolLength = await chef.poolLength()
        console.log("poolLength", poolLength);
        
        poolInfo = await chef.poolInfo(0)
        // console.log("PoolInfo AFTER", poolInfo);
        console.log("PoolInfo allocPoint AFTER", poolInfo.allocPoint);

        // expect(poolInfo.lpToken).to.be.equal(suteku.address);
        // expect(poolInfo.allocPoint).to.be.equal("0");

        // Depositing again
        // tx = await chef.connect(chefMari).deposit(poolLength.toNumber() - 1, parseUnits(10, 18))
        // await tx.wait()
    });


});



// Lsit of Helper functions
const approveMAX = "115792089237316195423570985008687907853269984665640564039457584007913129639935"

// Converts token units to smallest individual token unit, eg: 1 DAI = 10^18 units 
const parseUnits = (amount, units) => {
    return ethers.utils.parseUnits(amount.toString(), units);
}

// Converts token units from smallest individual unit to token unit, opposite of parseUnits
const formatUnits = (amount, units) => {
    return ethers.utils.formatUnits(amount.toString(), units);
}