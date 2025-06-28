const hre = require("hardhat");
const { upgrades, ethers } = hre;

// ✅ Ethers v6 utility imports
const { encodeBytes32String, solidityPackedKeccak256, getBytes, Wallet } = ethers;

const fs = require("fs");

async function main() {
  console.log("LOYALTY REWARDS TOKEN DEPLOYMENT");
  console.log("===================================");

  const [deployer, user1, user2, user3] = await ethers.getSigners();

  const LoyaltyRewardsToken = await ethers.getContractFactory("LoyaltyRewardsToken");
  const contract = await upgrades.deployProxy(
    LoyaltyRewardsToken,
    [deployer.address, deployer.address],
    { initializer: "initialize", unsafeAllow: ["constructor"] }
  );

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log("Contract deployed to:", contractAddress);

  const userTickets = [
    { user: deployer, ticket: "deployer-purchase-1", name: "Deployer" },
    { user: user1, ticket: "user1-shopping-reward", name: "User1" },
    { user: user2, ticket: "user2-event-attendance", name: "User2" },
    { user: user3, ticket: "user3-referral-bonus", name: "User3" }
  ];

  const mintedTokens = [];

  for (let i = 0; i < userTickets.length; i++) {
    const { user, ticket, name } = userTickets[i];

    const actionId = encodeBytes32String(ticket); // 🔄 v6-compliant
    const messageHash = solidityPackedKeccak256(["bytes32", "address"], [actionId, user.address]);

    const merchantWallet = new Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
    const signature = await merchantWallet.signMessage(getBytes(messageHash)); // 🔄 also v6-compliant

    console.log(`\nMinting NFT for ${name}:`);
    console.log(`   Address: ${user.address}`);
    console.log(`   Ticket: ${ticket}`);

    const contractAsUser = contract.connect(user);
    const tx = await contractAsUser.redeemTicket(actionId, signature);
    await tx.wait();

    mintedTokens.push({
      tokenId: i,
      owner: user.address,
      name,
      ticket,
      txHash: tx.hash
    });
  }

  fs.writeFileSync("deployment-info.json", JSON.stringify({
    contractAddress,
    network: "hardhat",
    chainId: 31337,
    tokens: mintedTokens,
    timestamp: new Date().toISOString()
  }, null, 2));

  console.log("\n✅ Deployment info saved to: deployment-info.json");
}

main().catch((error) => {
  console.error("❌ Deployment error:", error);
  process.exit(1);
});