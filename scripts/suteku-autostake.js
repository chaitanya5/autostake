const hre = require("hardhat");

let tx;
async function main() {
  [owner] = await ethers.getSigners(); // List of HD wallets

  // Get MasterChef
  chef = await ethers.getContractAt("contracts/sokuswap/MasterChef.sol:MasterChef", "0x2A62a4F578011c5C978F8c111338CD7Be740CFEF");

  // Get Suteku
  suteku = await ethers.getContractAt("contracts/sokuswap/MasterChef.sol:Suteku", "0x198800aF50914004A9E9D19cA18C0b24587a50cf");

  // Fetch current new pool is same as suteku
  poolLength = await chef.poolLength()

  // Deploy AutoCompound or SutekuVault
  const SutekuVault = await hre.ethers.getContractFactory("SutekuVault");
  vault = await SutekuVault.connect(owner).deploy(suteku.address, chef.address, owner.address, owner.address, poolLength.toNumber());
  await vault.deployed();

  console.log("CakeVault deployed to:", vault.address);

}

// IMPORTANT: After this main function above, update the masterChef, this will only work with MasterChef Owner
const updateMasterChef = () => {
  let chefOwner = address("current MasterChef Owner")  
  // Reset Allocation Point of Suteku pool at 0 index
  tx = await chef.connect(chefOwner).set(0, 0, false)
  await tx.wait()

  // Creating a new pool for Suteku 
  tx = await chef.connect(chefOwner).add(1000, suteku.address, false)
  await tx.wait()
};


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