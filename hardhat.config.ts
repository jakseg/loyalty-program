import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";

// Lade environment variables
require('dotenv').config();
require('@openzeppelin/hardhat-upgrades');


const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  
  networks: {
    // Lokales Hardhat Netzwerk (Standard)
    hardhat: {
      chainId: 31337,
      accounts: {
        // Deterministische Mnemonic - alle im Team haben die gleichen Adressen
        mnemonic: "test test test test test test test test test test test junk",
        count: 20,
        accountsBalance: "10000000000000000000000" // 10000 ETH pro Account
      }
    },
    
    // Für lokales Deployment (wenn ihr hardhat node startet)
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    },
    
    // Für spätere Testnet-Deployments (erstmal auskommentiert)
    /*
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
    */
  },
  

  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    gasPrice: 20, // Add explicit gas price
    coinmarketcap: process.env.COINMARKETCAP_API_KEY, // Optional for USD conversion
    showMethodSig: true // Shows method signatures for clarity
  },


  
  // Für spätere Contract-Verification (erstmal auskommentiert)
  /*
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
  */
 
};

export default config;