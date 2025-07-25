# Loyalty Program - Blockchain Project

A decentralized loyalty program using Ethereum smart contracts and NFT rewards.

## Quick Setup for Team Members

### Prerequisites
- **Node.js** (v18 or v20 recommended) - Download from [nodejs.org](https://nodejs.org)
- **Git** - Download from [git-scm.com](https://git-scm.com)
- **VS Code** (recommended) - Download from [code.visualstudio.com](https://code.visualstudio.com)
- **MetaMask Chrome Extension** - Download from (https://chromewebstore.google.com/detail/nkbihfbeogaeaoehlefnkodbefgpgknn?utm_source=item-share-cb)

### VS Code Extensions (Install these)
1. Open VS Code Extensions (Ctrl+Shift+X)
2. Install: **Solidity** (by Juan Blanco)
3. Install: **Hardhat for Visual Studio Code**

## Setup Instructions

### 1. Clone Repository
```bash
git clone https://github.com/jakseg/loyalty-program.git
cd loyalty-program
```

### 2. One-Command Setup
```bash
npm run setup
```
This installs all dependencies and creates your local configuration.

### 3. Test Everything Works
```bash
npm run compile
```

### 4. Login to MetaMask
1. Login to the MetaMask Chrome Extension
2. Restart the Browser

### 5. Start Development
```bash
# Terminal 1: Start local blockchain
npx hardhat node

# Terminal 2: Deploy contracts
npx hardhat run scripts/deploy.js --network localhost

# Terminal 3: Run Website
npx live-server .
Go to the Frontend Folder in Chrome Browser connected to MetaMask

# One Time MetaMask Setup
Add a local network with the following setting:
Name of the Network: Hardhat Local
RPC URL: Copy from your terminal where you startet the node (should be http://127.0.0.1:8545/)
Chain ID: 31337
Currency: ETH
Block Explorer URL: Leave blank
Click Save

Import Accounts to you MetaMask wallet
Copy the private keys from your terminal where the node is running
Paste them into you MetaMask wallet
Repeat this you account 0-3


# Terminal 4: Run Gas Assessment
npx hardhat test gas/gas-assessment.test.ts
```
