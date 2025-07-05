# Loyalty Program - Blockchain Project

A decentralized loyalty program using Ethereum smart contracts and NFT rewards.

## Quick Setup for Team Members

### Prerequisites
- **Node.js** (v18 or v20 recommended) - Download from [nodejs.org](https://nodejs.org)
- **Git** - Download from [git-scm.com](https://git-scm.com)
- **VS Code** (recommended) - Download from [code.visualstudio.com](https://code.visualstudio.com)

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
npm run test
```

### 4. Start Development
```bash
# Terminal 1: Start local blockchain
npx hardhat node

# Terminal 2: Deploy contracts
npx hardhat run scripts/deploy.js --network localhost

# Terminal 3: Run Website
npx live-server .

# Terminal 4: Run Gas Assessment
REPORT_GAS=true npx hardhat test test/gas-assessment.test.ts
```
