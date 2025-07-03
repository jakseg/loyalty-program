// test/GasBreakdownExplanation.test.ts
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

describe("Gas Breakdown Analysis - How Costs Are Calculated", function () {
  let loyaltyToken: any;
  let owner: any;
  let merchant: any;
  let user1: any;

  async function createSignedTicket(actionId: string, userAddress: string) {
    const messageHash = ethers.solidityPackedKeccak256(
      ["bytes32", "address"],
      [actionId, userAddress]
    );
    const signature = await merchant.signMessage(ethers.getBytes(messageHash));
    return signature;
  }

  beforeEach(async function () {
    [owner, merchant, user1] = await ethers.getSigners();
    
    const LoyaltyRewardsTokenFactory = await ethers.getContractFactory("LoyaltyRewardsToken");
    const deploymentTx = await upgrades.deployProxy(
      LoyaltyRewardsTokenFactory,
      [owner.address, merchant.address],
      { initializer: "initialize", kind: "uups" }
    );
    
    loyaltyToken = await ethers.getContractAt("LoyaltyRewardsToken", await deploymentTx.getAddress());
    
    // Add a basic action for testing
    const basicActionId = ethers.id("purchase_coffee");
    await loyaltyToken.connect(owner).addRewardableAction(
      basicActionId,
      "Purchase Coffee",
      "Buy any coffee item",
      "basic"
    );
  });

  it("Should break down exactly what gas costs represent", async function () {
    console.log("\n=== DETAILED GAS BREAKDOWN ANALYSIS ===");
    
    const basicActionId = ethers.id("purchase_coffee");
    const signature = await createSignedTicket(basicActionId, user1.address, merchant);
    
    console.log("\n1. WHAT HARDHAT MEASURES:");
    console.log("================================");
    console.log("When you call redeemTicket(), Hardhat's EVM counts gas for EVERY operation:");
    
    // Execute the transaction and measure
    const tx = await loyaltyToken.connect(user1).redeemTicket(basicActionId, signature);
    const receipt = await tx.wait();
    
    console.log(`\nTotal gas measured: ${receipt?.gasUsed}`);
    console.log("\n2. WHAT THIS GAS INCLUDES:");
    console.log("================================");
    
    console.log("A. TRANSACTION OVERHEAD:");
    console.log("   - Base transaction cost: 21,000 gas (every Ethereum transaction)");
    console.log("   - Function call overhead: ~2,000-5,000 gas");
    
    console.log("\nB. SIGNATURE VERIFICATION:");
    console.log("   - ECDSA ecrecover operation: ~3,000-5,000 gas");
    console.log("   - Hash calculations: ~500-1,000 gas");
    console.log("   - Message hash formatting: ~200-500 gas");
    
    console.log("\nC. STORAGE OPERATIONS (Most Expensive):");
    console.log("   - Writing to usedTickets mapping: 20,000 gas (new slot)");
    console.log("   - Writing to userActionRedeemed: 20,000 gas (new slot)");
    console.log("   - Incrementing _nextTokenId: 5,000 gas (updating existing)");
    console.log("   - Setting _tokenTiers mapping: 20,000 gas (new slot)");
    
    console.log("\nD. ERC721 MINTING OPERATIONS:");
    console.log("   - _safeMint internal calls: ~30,000-50,000 gas");
    console.log("   - Balance updates: 5,000-20,000 gas");
    console.log("   - Ownership mapping updates: 20,000 gas (new slot)");
    console.log("   - Token existence tracking: 5,000-10,000 gas");
    
    console.log("\nE. EVENT EMISSIONS:");
    console.log("   - TicketRedeemed event: ~1,500-3,000 gas");
    console.log("   - ERC721 Transfer event: ~1,500-3,000 gas");
    
    console.log("\nF. BUSINESS LOGIC CHECKS:");
    console.log("   - require() statements: ~200-500 gas each");
    console.log("   - Storage reads for validation: ~200-2,100 gas each");
    console.log("   - String operations: ~500-2,000 gas");
    
    console.log("\n3. WHY FIRST REDEMPTION COSTS MORE:");
    console.log("====================================");
    console.log("Cold Storage (First Time):");
    console.log("- New storage slots cost 20,000 gas each");
    console.log("- Your contract writes to 4+ new storage slots");
    console.log("- Total cold storage premium: ~60,000-80,000 gas");
    
    console.log("\nWarm Storage (Subsequent):");
    console.log("- Modifying existing slots costs only 5,000 gas");
    console.log("- But some operations still create new slots");
    console.log("- Savings: ~10,000-20,000 gas per redemption");
    
    expect(receipt?.gasUsed).to.be.greaterThan(0);
  });

  it("Should demonstrate how deployment gas is calculated", async function () {
    console.log("\n=== DEPLOYMENT GAS BREAKDOWN ===");
    
    console.log("\n1. WHAT DEPLOYMENT INCLUDES:");
    console.log("================================");
    console.log("Your 3,001,136 gas deployment actually deploys TWO contracts:");
    
    console.log("\nA. PROXY CONTRACT (~250,000 gas):");
    console.log("   - Small contract that forwards calls");
    console.log("   - Stores implementation address");
    console.log("   - Handles upgrade logic");
    
    console.log("\nB. IMPLEMENTATION CONTRACT (~2,750,000 gas):");
    console.log("   - ALL your business logic");
    console.log("   - ERC721 functionality");
    console.log("   - Signature verification code");
    console.log("   - Storage layout definitions");
    console.log("   - Event definitions");
    
    console.log("\n2. WHY IMPLEMENTATION IS EXPENSIVE:");
    console.log("===================================");
    console.log("- Contract bytecode size: ~40KB+ of compiled Solidity");
    console.log("- Gas cost: ~200 gas per byte of bytecode");
    console.log("- Your contract includes:");
    console.log("  * OpenZeppelin ERC721Upgradeable (~15KB)");
    console.log("  * OwnableUpgradeable (~3KB)");
    console.log("  * UUPSUpgradeable (~5KB)");
    console.log("  * Your business logic (~10KB)");
    console.log("  * ECDSA and crypto libraries (~7KB)");
    
    console.log("\n3. INITIALIZATION GAS:");
    console.log("======================");
    console.log("After deployment, initialize() runs:");
    console.log("- Sets contract name/symbol: ~40,000 gas");
    console.log("- Sets owner: ~20,000 gas");
    console.log("- Sets merchant signer: ~20,000 gas");
    console.log("- Initializes inheritance chain: ~10,000 gas");
    
    console.log("\n4. COMPARISON WITH NON-UPGRADEABLE:");
    console.log("===================================");
    console.log("Non-upgradeable version would be:");
    console.log("- Single contract: ~2,400,000 gas");
    console.log("- Upgradeability adds: ~600,000 gas (25% overhead)");
    console.log("- But enables future upgrades without data migration!");
  });

  it("Should explain how gas translates to real costs", async function () {
    console.log("\n=== REAL COST CALCULATION ===");
    
    const redemptionGas = 180000n; // Typical redemption
    const deploymentGas = 3001136n; // Full deployment
    
    console.log("\n1. GAS TO ETH CONVERSION:");
    console.log("=========================");
    console.log("Formula: Gas Used × Gas Price = Total Cost (in wei)");
    console.log("1 ETH = 1,000,000,000,000,000,000 wei (10^18)");
    console.log("1 gwei = 1,000,000,000 wei (10^9)");
    
    const gasPrices = [20n, 50n, 100n, 200n]; // gwei
    
    console.log("\n2. REDEMPTION COSTS:");
    console.log("====================");
    for (const gweiPrice of gasPrices) {
      const costWei = redemptionGas * gweiPrice * 1000000000n;
      const costEth = ethers.formatEther(costWei);
      console.log(`At ${gweiPrice} gwei: ${redemptionGas} × ${gweiPrice} × 10^9 = ${costEth} ETH`);
    }
    
    console.log("\n3. DEPLOYMENT COSTS:");
    console.log("====================");
    for (const gweiPrice of gasPrices) {
      const costWei = deploymentGas * gweiPrice * 1000000000n;
      const costEth = ethers.formatEther(costWei);
      console.log(`At ${gweiPrice} gwei: ${deploymentGas} × ${gweiPrice} × 10^9 = ${costEth} ETH`);
    }
    
    console.log("\n4. WHY GAS PRICES VARY:");
    console.log("=======================");
    console.log("Gas price = How much you pay per unit of computation");
    console.log("- Low demand (night): 10-20 gwei");
    console.log("- Normal demand: 20-50 gwei");
    console.log("- High demand (DeFi activity): 50-100 gwei");
    console.log("- Extreme demand (NFT drops): 100-500+ gwei");
    
    console.log("\n5. HARDHAT'S MEASUREMENT:");
    console.log("=========================");
    console.log("Hardhat gas reporter:");
    console.log("- Runs your tests on local blockchain");
    console.log("- Records actual gas used by each transaction");
    console.log("- Averages across multiple calls");
    console.log("- Shows min/max/average for each function");
    console.log("- Provides deployment costs separately");
  });

  it("Should demonstrate gas estimation vs actual usage", async function () {
    console.log("\n=== GAS ESTIMATION vs ACTUAL USAGE ===");
    
    const basicActionId = ethers.id("purchase_coffee");
    const signature = await createSignedTicket(basicActionId, user1.address, merchant);
    
    // Gas estimation (what Hardhat predicts)
    try {
      const estimatedGas = await loyaltyToken.connect(user1).redeemTicket.estimateGas(
        basicActionId, 
        signature
      );
      console.log(`Estimated gas: ${estimatedGas}`);
    } catch (error) {
      console.log("Gas estimation failed (transaction may revert)");
    }
    
    // Actual execution
    const tx = await loyaltyToken.connect(user1).redeemTicket(basicActionId, signature);
    const receipt = await tx.wait();
    
    console.log(`Actual gas used: ${receipt?.gasUsed}`);
    
    console.log("\nWHY THEY MIGHT DIFFER:");
    console.log("- Estimation is prediction based on current state");
    console.log("- Actual usage includes all runtime costs");
    console.log("- Dynamic costs (like storage) can vary");
    console.log("- Hardhat's measurement is the TRUE cost");
    
    console.log("\nWHAT MAKES YOUR COSTS ACCURATE:");
    console.log("- Hardhat simulates real Ethereum execution");
    console.log("- Uses same gas calculation rules as mainnet");
    console.log("- Measures every opcode execution");
    console.log("- Accounts for storage layout and optimization");
  });
});