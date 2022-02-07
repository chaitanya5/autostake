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
    // Get MasterChef
    chef = await ethers.getContractAt("contracts/sokuswap/MasterChef.sol:MasterChef", "0x2A62a4F578011c5C978F8c111338CD7Be740CFEF");

    // Get Suteku
    suteku = await ethers.getContractAt("contracts/sokuswap/MasterChef.sol:Suteku", "0x198800aF50914004A9E9D19cA18C0b24587a50cf");

    // Fetch current new pool is same as suteku
    poolLength = await chef.poolLength()

    // Deploy AutoCompound or SutekuVault
    const SutekuVault = await hre.ethers.getContractFactory("SutekuVault");
    vault = await SutekuVault.connect(owner).deploy(suteku.address, chef.address, owner.address, owner.address, poolLength.toNumber() -1);
    await vault.deployed();

    await hre.tenderly.verify({
      name: "SutekuVault",
      address: vault.address,
    })

    console.log("MasterChef deployed to:", chef.address);
    console.log("SutekuVault deployed to:", vault.address);
  });

  it("Expects a revert in enterStaking for current state of MasterChef", async function () {
    // Fetch Suteku Balance
    balance = await suteku.balanceOf(chefMari.address)
    console.log("Chef Mari Balance", formatUnits(balance, 18));

    // Approve Suteku Tokens to MasterChef
    tx = await suteku.connect(chefMari).approve(chef.address, approveMAX)
    await tx.wait()

    // Stakes Suteku tokens
    await expectRevert(chef.connect(chefMari).enterStaking(parseUnits(100, 18)), 'Ownable: caller is not the owner');
  });

  it("Updating MasterChef and staking again", async function () {
    poolInfo = await chef.poolInfo(0)
    console.log("PoolInfo BEFORE", poolInfo);
    // expect(poolInfo.lpToken).to.be.equal(suteku.address);
    // expect(poolInfo.allocPoint).to.be.equal("0");
    
    // Reset Allocation Point of Suteku pool 
    tx = await chef.connect(chefOwner).set(0, poolInfo.allocPoint, false)
    await tx.wait()
    
    // Creating a new pool for Suteku 
    // tx = await chef.connect(chefOwner).add(1000, suteku.address, false)
    // await tx.wait()
    
    poolLength = await chef.poolLength()
    console.log("poolLength", poolLength);
    
    poolInfo = await chef.poolInfo(0)
    console.log("PoolInfo AFTER", poolInfo);

    // expect(poolInfo.lpToken).to.be.equal(suteku.address);
    // expect(poolInfo.allocPoint).to.be.equal("0");

    // Depositing again
    tx = await chef.connect(chefMari).deposit(poolLength.toNumber() - 1, parseUnits(10, 18))
    await tx.wait()
  });
  it("AutoPool Smart contract connection to MasterChef", async function () {
    // Approve Suteku Tokens to AutoCompound
    tx = await suteku.connect(chefMari).approve(vault.address, approveMAX)
    await tx.wait()

    // Creating a new pool for Suteku 
    tx = await vault.connect(chefMari).deposit(parseUnits(10, 18))
    await tx.wait();

    // await expectRevert(vault.connect(alice).harvest(), 'Ownable: caller is not the owner');
    tx = await vault.connect(owner).harvest()
    await tx.wait();

    tx = await vault.connect(chefMari).withdraw(parseUnits(10, 18))
    await tx.wait();

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