require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("dotnenv")
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 module.exports = {
  // defaultNetwork: "hardhat",
  networks: {
    hardhat: {
    },
    testnet: {
      url: "https://rpc-mumbai.maticvigil.com/",
      chainId: 80001,
      // gasPrice: 20000000000,
      accounts: { mnemonic: process.env.MNEMONIC}
    },
    mainnet: {
      url: "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      chainId: 1,
      // accounts: ["*********************"]
    }
  },
  etherscan: {
    apiKey: "ETHERSCAN_API_KEY"
  },
  solidity: {
    compilers: [
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
    ]
  },
};
