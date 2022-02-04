const hre = require("hardhat");

async function main() {
  let tx;
  [owner] = await ethers.getSigners(); // List of HD wallets

  // Deploy Cake
  const Cake = await hre.ethers.getContractFactory("contracts/pancakeswap/MasterChef.sol:CakeToken");
  const cake = await Cake.deploy();
  await cake.deployed();

  // Deploy SyrupBar
  const SyrupBar = await hre.ethers.getContractFactory("contracts/pancakeswap/SyrupBar.sol:SyrupBar");
  const syrup = await SyrupBar.deploy(cake.address);
  await syrup.deployed();

  // // Fetching the current blockNumber
  const latestBlock = await ethers.provider.getBlockNumber()
  console.log("latestBlock", latestBlock);

  // Deploy MasterChef with 5 CAKE tokens as rewardPerBlock
  const MasterChef = await hre.ethers.getContractFactory("MasterChef");
  const chef = await MasterChef.deploy(cake.address, syrup.address, owner.address, parseUnits(5, 18), latestBlock);
  await chef.deployed();

  // Deploy AutoCompound or CakeVault
  const CakeVault = await hre.ethers.getContractFactory("CakeVault");
  const vault = await CakeVault.deploy(cake.address, syrup.address, chef.address, owner.address, owner.address);
  await vault.deployed();

  // Transfer Ownership of CAKE to MasterChef
  tx = await cake.transferOwnership(chef.address);
  await tx.wait()

  // Transfer Ownership of SyrupBar to MasterChef
  tx = await syrup.transferOwnership(chef.address);
  await tx.wait()

  console.log("CakeToken deployed to:", cake.address);
  console.log("SyrupBar deployed to:", syrup.address);
  console.log("MasterChef deployed to:", chef.address);
  console.log("CakeVault deployed to:", vault.address);
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


// Converts token units to smallest individual token unit, eg: 1 DAI = 10^18 units 
const parseUnits = (amount, units) => {
  return ethers.utils.parseUnits(amount.toString(), units);
}

// Converts token units from smallest individual unit to token unit, opposite of parseUnits
const formatUnits = (amount, units) => {
  return ethers.utils.formatUnits(amount.toString(), units);
}