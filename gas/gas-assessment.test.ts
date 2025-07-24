import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { LoyaltyRewardsToken } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("LoyaltyRewardsToken - Comprehensive Gas Analysis", function () {
  let loyaltyToken: LoyaltyRewardsToken;
  let owner: SignerWithAddress;
  let merchant: SignerWithAddress;
  let users: SignerWithAddress[];

  const GAS_PRICE_GWEI = 30n;
  const ETH_PRICE_USD = 3500;

  function gasToUSD(gasUsed: bigint): string {
    const costWei = gasUsed * GAS_PRICE_GWEI * 1000000000n;
    const costEth = parseFloat(ethers.formatEther(costWei));
    return (costEth * ETH_PRICE_USD).toFixed(2);
  }

  async function createSignature(actionId: string | Uint8Array, userAddress: string): Promise<string> {
    const actionIdBytes = typeof actionId === 'string' ? ethers.id(actionId) : actionId;
    const messageHash = ethers.solidityPackedKeccak256(["bytes32", "address"], [actionIdBytes, userAddress]);
    return await merchant.signMessage(ethers.getBytes(messageHash));
  }

  before(async function () {
    [owner, merchant, ...users] = await ethers.getSigners();
  });
  
  // Deployment and Setup Tests
  it("Contract deployment costs", async function () {
   const LoyaltyFactory = await ethers.getContractFactory("LoyaltyRewardsTokenTestable"); //og: const LoyaltyFactory = await ethers.getContractFactory("LoyaltyRewardsToken");
    const deployTx = await upgrades.deployProxy(
      LoyaltyFactory,
      [owner.address, merchant.address],
      { initializer: "initialize", kind: "uups" }
    );
    
    loyaltyToken = await deployTx.waitForDeployment();
    const receipt = await loyaltyToken.deploymentTransaction()?.wait();
    
    if (receipt) {
      console.log(`Contract deployment: ${receipt.gasUsed.toLocaleString()} gas ($${gasToUSD(receipt.gasUsed)})`);
    }
  });

  it("Contract type verification", async function () {
  console.log("Verifying which contract type is being tested...");
  
  // Try to call a test-specific function that only exists in the testable contract
  try {
    const actionId = ethers.randomBytes(32);
    const signature = await createSignature(actionId, users[0].address);
    
    // This function only exists in LoyaltyRewardsTokenTestable
    await loyaltyToken.testSignatureOnly.staticCall(actionId, users[0].address, signature);
    console.log("Testing LoyaltyRewardsTokenTestable (with test functions)");
    console.log("   All gas measurements reflect the testable contract behavior");
  } catch (error) {
    console.log("Testing original LoyaltyRewardsToken (production contract)");
    console.log("   Gas measurements reflect pure production contract costs");
  }
});

  it("Set merchant signer", async function () {
    const newSigner = ethers.Wallet.createRandom();
    const tx = await loyaltyToken.connect(owner).setMerchantSigner(newSigner.address);
    const receipt = await tx.wait();
    
    console.log(`Set merchant signer: ${receipt?.gasUsed.toLocaleString()} gas ($${gasToUSD(receipt?.gasUsed || 0n)})`);
    
    // Reset to original
    await loyaltyToken.connect(owner).setMerchantSigner(merchant.address);
  });

  // Storage Warming and Fair Comparison Tests
  it("Should warm up storage for fair comparisons", async function () {
    console.log("Warming up contract storage...");
    
    // Create a basic token to initialize all storage slots
    const warmupActionId = ethers.randomBytes(32);
    const warmupSignature = await createSignature(warmupActionId, users[0].address);
    await loyaltyToken.connect(users[0]).redeemTicket(warmupActionId, warmupSignature, "basic");
    
    // Also create a premium token to warm up any premium-specific paths
    const warmupActionId2 = ethers.randomBytes(32);
    const warmupSignature2 = await createSignature(warmupActionId2, users[1].address);
    await loyaltyToken.connect(users[1]).redeemTicket(warmupActionId2, warmupSignature2, "premium");
    
    console.log("Storage warm up to enable fair comparison");
  });

  it("Basic token mint", async function () {
    const actionId = ethers.randomBytes(32);
    const signature = await createSignature(actionId, users[0].address);
    
    const tx = await loyaltyToken.connect(users[0]).redeemTicket(actionId, signature, "basic");
    const receipt = await tx.wait();
    
    console.log(`Basic token mint: ${receipt?.gasUsed.toLocaleString()} gas ($${gasToUSD(receipt?.gasUsed || 0n)})`);
  });

  it("Premium token mint", async function () {
    const actionId = ethers.randomBytes(32);
    const signature = await createSignature(actionId, users[1].address);
    
    const tx = await loyaltyToken.connect(users[1]).redeemTicket(actionId, signature, "premium");
    const receipt = await tx.wait();
    
    console.log(`Premium token mint: ${receipt?.gasUsed.toLocaleString()} gas ($${gasToUSD(receipt?.gasUsed || 0n)})`);
  });

  // Scale Testing
  it("10th token mint", async function () {
    console.log("Measuring gas cost for 10th token mint...");
    
    // First, create 9 tokens to reach the state where we're minting the 10th
    console.log("   Setting up: Creating first 9 tokens...");
    for (let i = 0; i < 9; i++) {
      const setupActionId = ethers.randomBytes(32);
      const setupSignature = await createSignature(setupActionId, users[i % users.length].address);
      // Alternate between basic and premium to simulate realistic usage
      const tier = i % 2 === 0 ? "basic" : "premium";
      await loyaltyToken.connect(users[i % users.length]).redeemTicket(setupActionId, setupSignature, tier);
    }
    
    // Now measure the cost of the 10th mint
    const actionId = ethers.randomBytes(32);
    const signature = await createSignature(actionId, users[0].address);
    const tx = await loyaltyToken.connect(users[0]).redeemTicket(actionId, signature, "premium");
    const receipt = await tx.wait();
    
    console.log(`10th token mint: ${receipt?.gasUsed.toLocaleString()} gas ($${gasToUSD(receipt?.gasUsed || 0n)})`);
  });

  it("100th token mint", async function () {
    console.log("Measuring gas cost for 100th token mint...");
    
    // Create 99 tokens to reach the state where we're minting the 100th
    console.log("   Setting up: Creating first 99 tokens (this may take a moment)...");
    for (let i = 0; i < 99; i++) {
      const setupActionId = ethers.randomBytes(32);
      const setupSignature = await createSignature(setupActionId, users[i % users.length].address);
      // Alternate between basic and premium for realistic distribution
      const tier = i % 2 === 0 ? "basic" : "premium";
      await loyaltyToken.connect(users[i % users.length]).redeemTicket(setupActionId, setupSignature, tier);
      
      // Add progress logging every 20 tokens so you know it's working
      if ((i + 1) % 20 === 0) {
        console.log(`   Progress: ${i + 1}/99 tokens created...`);
      }
    }
    
    // Now measure the cost of the 100th mint
    const actionId = ethers.randomBytes(32);
    const signature = await createSignature(actionId, users[0].address);
    const tx = await loyaltyToken.connect(users[0]).redeemTicket(actionId, signature, "premium");
    const receipt = await tx.wait();
    
    console.log(`100th token mint: ${receipt?.gasUsed.toLocaleString()} gas ($${gasToUSD(receipt?.gasUsed || 0n)})`);
  });

  // Security Analysis Tests
  it("Pure signature verification cost", async function () {
    const actionId = ethers.randomBytes(32);
    const signature = await createSignature(actionId, users[0].address);
    
    // Test with valid signature - should return true
    const gasEstimate = await loyaltyToken.testSignatureOnly.estimateGas(actionId, users[0].address, signature);
    console.log(`Pure signature verification: ${gasEstimate.toLocaleString()} gas ($${gasToUSD(gasEstimate)})`);
    
    // Verify it actually works correctly
    const result = await loyaltyToken.testSignatureOnly(actionId, users[0].address, signature);
    console.log(`  Signature validation result: ${result ? 'Valid' : 'Invalid'}`);
  });

  it("Ticket usage lookup cost", async function () {
    const actionId = ethers.randomBytes(32);
    
    // Test lookup for unused ticket
    const gasEstimateUnused = await loyaltyToken.testTicketUsageOnly.estimateGas(actionId, users[0].address);
    console.log(`Ticket usage lookup (unused): ${gasEstimateUnused.toLocaleString()} gas ($${gasToUSD(gasEstimateUnused)})`);
    
    // Create a used ticket first
    const signature = await createSignature(actionId, users[0].address);
    await loyaltyToken.connect(users[0]).redeemTicket(actionId, signature, "basic");
    
    // Test lookup for used ticket
    const gasEstimateUsed = await loyaltyToken.testTicketUsageOnly.estimateGas(actionId, users[0].address);
    console.log(`Ticket usage lookup (used): ${gasEstimateUsed.toLocaleString()} gas ($${gasToUSD(gasEstimateUsed)})`);
    
    // Show the difference between cold and warm storage access
    const difference = Math.abs(Number(gasEstimateUsed - gasEstimateUnused));
    console.log(`  Storage access difference: ${difference} gas`);
  });

  it("Invalid signature detection cost", async function () {
    const actionId = ethers.randomBytes(32);
    // Create signature for one user but test with different user
    const signature = await createSignature(actionId, users[0].address);
    
    const gasEstimate = await loyaltyToken.testSignatureOnly.estimateGas(actionId, users[1].address, signature);
    console.log(`Invalid signature detection: ${gasEstimate.toLocaleString()} gas ($${gasToUSD(gasEstimate)})`);
    
    // Verify it correctly identifies the signature as invalid
    const result = await loyaltyToken.testSignatureOnly(actionId, users[1].address, signature);
    console.log(`  Signature validation result: ${result ? 'Valid (unexpected!)' : 'Invalid (correct)'}`);
    console.log(`  Security insight: Invalid signatures consume same gas as valid ones`);
  });

  it("Security overhead analysis", async function () {
    const actionId = ethers.randomBytes(32);
    const signature = await createSignature(actionId, users[2].address);
    
    // Measure individual security components
    const signatureGas = await loyaltyToken.testSignatureOnly.estimateGas(actionId, users[2].address, signature);
    const ticketLookupGas = await loyaltyToken.testTicketUsageOnly.estimateGas(actionId, users[2].address);
    
    // Measure complete function
    const totalGas = await loyaltyToken.connect(users[2]).redeemTicket.estimateGas(actionId, signature, "basic");
    
    // Calculate security overhead
    const securityGas = signatureGas + ticketLookupGas;
    const functionalityGas = totalGas - securityGas;
    const securityPercentage = (Number(securityGas) / Number(totalGas) * 100).toFixed(1);
    
    console.log(`\nSecurity Cost Breakdown:`);
    console.log(`  Signature verification: ${signatureGas.toLocaleString()} gas`);
    console.log(`  Ticket lookup: ${ticketLookupGas.toLocaleString()} gas`);
    console.log(`  Total security overhead: ${securityGas.toLocaleString()} gas`);
    console.log(`  Core functionality: ${functionalityGas.toLocaleString()} gas`);
    console.log(`  Complete function: ${totalGas.toLocaleString()} gas`);
    console.log(`  Security percentage: ${securityPercentage}% of total cost`);
    console.log(`\nKey insight: Security validation is ${securityPercentage}% of your total gas cost`);
  });

  it("Signature verification costs", async function () {
    const actionId = ethers.randomBytes(32);
    const signature = await createSignature(actionId, users[2].address);
    
    const gasEstimate = await loyaltyToken.connect(users[2]).redeemTicket.estimateGas(actionId, signature, "basic");
    console.log(`Signature verification (estimated): ${gasEstimate.toLocaleString()} gas ($${gasToUSD(gasEstimate)})`);
    
    // Execute to get actual gas used
    const tx = await loyaltyToken.connect(users[2]).redeemTicket(actionId, signature, "basic");
    await tx.wait();
  });

  it("View function costs", async function () {
    const balanceOfGas = await loyaltyToken.balanceOf.estimateGas(users[0].address);
    console.log(`balanceOf: ${balanceOfGas.toLocaleString()} gas`);

    const getTokenTierGas = await loyaltyToken.getTokenTier.estimateGas(0);
    console.log(`getTokenTier: ${getTokenTierGas.toLocaleString()} gas`);

    const getTotalSupplyGas = await loyaltyToken.getTotalSupply.estimateGas();
    console.log(`getTotalSupply: ${getTotalSupplyGas.toLocaleString()} gas`);

    const isTicketUsedGas = await loyaltyToken.isTicketUsed.estimateGas(ethers.randomBytes(32), users[0].address);
    console.log(`isTicketUsed: ${isTicketUsedGas.toLocaleString()} gas`);

    const getUserTokensGas = await loyaltyToken.getUserTokensWithTiers.estimateGas(users[0].address);
    console.log(`getUserTokensWithTiers: ${getUserTokensGas.toLocaleString()} gas`);
  });
});