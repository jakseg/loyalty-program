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
npm run node

# Terminal 2: Deploy contracts
npm run deploy:local
```

## Daily Development Workflow

1. **Pull latest changes:** `git pull`
2. **Start local blockchain:** `npm run node` (keep running)
3. **Make changes** to contracts or tests
4. **Compile:** `npm run compile`
5. **Test:** `npm run test`
6. **Deploy locally:** `npm run deploy:local`
7. **Commit changes:** `git add .` → `git commit -m "your message"` → `git push`

## Available Commands

```bash
npm run compile        # Compile smart contracts
npm run test          # Run all tests
npm run test:gas      # Run tests with gas reporting
npm run node          # Start local blockchain
npm run deploy:local  # Deploy to local blockchain
npm run console       # Open Hardhat console
npm run setup         # One-time setup (for new team members)
```

## Test Accounts (Same for Everyone)

When you run `npm run node`, you get these accounts with 10,000 ETH each:

- **Account 0** (Owner): `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- **Account 1** (Merchant): `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- **Account 2** (Customer): `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
- **Accounts 3-19**: Additional test accounts

## Project Structure

```
loyalty-program/
├── contracts/          # Solidity smart contracts
├── test/              # Test files
├── scripts/           # Deployment scripts
├── docs/              # Documentation
└── README.md          # This file
```

## Troubleshooting

**Node.js version warning?**
- Install Node.js v18 or v20 from nodejs.org

**`npm run setup` fails?**
- Run `npm install` manually
- Check if you're in the correct directory

**`npm run node` doesn't work?**
- Make sure port 8545 is free
- Restart your terminal

**Different contract addresses?**
- Everyone should get the same addresses due to deterministic setup
- If not, check your Node.js version

## Need Help?

1. Check that all prerequisites are installed
2. Run `npm run setup` again
3. Make sure you're using the same Node.js version as your teammates
4. Ask in team chat 😊

## Security Note

⚠️ **Never commit real private keys or mainnet configurations!**
This setup is for local development only.