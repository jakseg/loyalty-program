const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("LOYALTY REWARDS TOKEN DEPLOYMENT");
    console.log("===================================");
    
    // Get multiple accounts
    const [deployer, user1, user2, user3] = await ethers.getSigners();
    
    console.log("\nDEPLOYMENT INFO:");
    console.log("-------------------");
    console.log("Deploying account:", deployer.address);
    console.log("Test users:", [user1.address, user2.address, user3.address]);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH");
    
    // Deploy contract
    const LoyaltyRewardsToken = await ethers.getContractFactory("LoyaltyRewardsToken");
    console.log("\nDeploying LoyaltyRewardsToken...");
    
    const contract = await upgrades.deployProxy(LoyaltyRewardsToken, [deployer.address]);
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    console.log("Contract deployed to:", contractAddress);
    
    // Create NFTs
    console.log("\nCREATING DEMO NFTs");
    console.log("=====================");
    
    const userTickets = [
        { user: deployer, ticket: "deployer-purchase-1", name: "Deployer" },
        { user: user1, ticket: "user1-shopping-reward", name: "User1" },
        { user: user2, ticket: "user2-event-attendance", name: "User2" },
        { user: user3, ticket: "user3-referral-bonus", name: "User3" }
    ];
    
    const mintedTokens = [];
    
    for (let i = 0; i < userTickets.length; i++) {
        const { user, ticket, name } = userTickets[i];
        const ticketHash = ethers.keccak256(ethers.toUtf8Bytes(ticket));
        
        console.log(`\nMinting NFT for ${name}:`);
        console.log(`   Address: ${user.address}`);
        console.log(`   Ticket: ${ticket}`);
        
        const contractAsUser = contract.connect(user);
        const tx = await contractAsUser.redeemTicket(ticketHash);
        const receipt = await tx.wait();
        
        // Token ID starts at 0 since _nextTokenId starts at 0
        const tokenId = i;
        
        mintedTokens.push({
            tokenId,
            owner: user.address,
            name,
            ticket,
            txHash: tx.hash
        });
        
        console.log(`   Token ID: ${tokenId}`);
        console.log(`   Tx Hash: ${tx.hash.slice(0, 10)}...`);
    }
    
    // Ownership verification
    console.log("\nOWNERSHIP VERIFICATION");
    console.log("=========================");
    
    for (const { user, name } of userTickets) {
        const balance = await contract.balanceOf(user.address);
        console.log(`${name} (${user.address}): ${balance} NFTs`);
    }
    
    // METAMASK SETUP GUIDE
    console.log("\n");
    console.log("METAMASK SETUP GUIDE");
    console.log("========================");
    
    console.log("\n1. NETWORK CONFIGURATION:");
    console.log("   Network Name: Hardhat Local");
    console.log("   RPC URL: http://127.0.0.1:8545");
    console.log("   Chain ID: 31337");
    console.log("   Currency Symbol: ETH");
    
    console.log("\n2. PRIVATE KEYS (for Account Import):");
    console.log("   Deployer: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
    console.log("   User1:    0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d");
    console.log("   User2:    0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a");
    console.log("   User3:    0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6");
    
    console.log("\n3. NFT IMPORT DATA:");
    console.log("   Contract Address: " + contractAddress);
    console.log("   Token Standard: ERC-721");
    console.log("");
    console.log("   Token Ownership:");
    
    for (const token of mintedTokens) {
        console.log(`   ${token.name}:`);
        console.log(`     Account: ${token.owner}`);
        console.log(`     Token ID: ${token.tokenId}`);
        console.log(`     Contract: ${contractAddress}`);
        console.log("");
    }

    console.log("\nDEPLOYMENT SUMMARY");
    console.log("==================");
    console.log("Contract Address:", contractAddress);
    console.log("Total NFTs created:", userTickets.length);
    console.log("Token IDs: 0 -", userTickets.length - 1);
    console.log("Network: Hardhat Local (Chain ID: 31337)");
    console.log("Status: SUCCESS - Ready for MetaMask testing!");
    
    // Save deployment info to file for future reference
    const deploymentInfo = {
        contractAddress,
        network: "hardhat",
        chainId: 31337,
        tokens: mintedTokens,
        timestamp: new Date().toISOString()
    };
    
    const fs = require('fs');
    fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("\nDeployment info saved to: deployment-info.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });