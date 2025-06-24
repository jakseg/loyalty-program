const { ethers } = require("hardhat");

async function main() {
    const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    const deployer = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    
    console.log("🔍 NFT Diagnosis für Account #0");
    console.log("===============================");
    console.log("Contract:", contractAddress);
    console.log("Account:", deployer);
    console.log("Expected Token ID: 1");
    console.log();
    
    try {
        const [signer] = await ethers.getSigners();
        const LoyaltyRewardsToken = await ethers.getContractFactory("LoyaltyRewardsToken");
        const contract = LoyaltyRewardsToken.attach(contractAddress);
        
        // 1. Contract Info
        console.log("📋 Contract Info:");
        const name = await contract.name();
        const symbol = await contract.symbol();
        console.log(`  Name: ${name}`);
        console.log(`  Symbol: ${symbol}`);
        console.log();
        
        // 2. Account Balance
        console.log("💰 Account Balance:");
        const balance = await contract.balanceOf(deployer);
        console.log(`  NFT Balance: ${balance}`);
        console.log();
        
        // 3. Token Ownership Check
        console.log("🎯 Token ID 1 Ownership:");
        try {
            const owner = await contract.ownerOf(1);
            console.log(`  Owner of Token ID 1: ${owner}`);
            console.log(`  Expected Owner: ${deployer}`);
            console.log(`  ✅ Match: ${owner.toLowerCase() === deployer.toLowerCase()}`);
        } catch (error) {
            console.log(`  ❌ Error getting owner: ${error.message}`);
        }
        console.log();
        
        // 4. Token URI
        console.log("🌐 Token URI:");
        try {
            const tokenURI = await contract.tokenURI(1);
            console.log(`  Token URI: ${tokenURI || "Not set"}`);
        } catch (error) {
            console.log(`  Token URI Error: ${error.message}`);
        }
        console.log();
        
        // 5. Total Supply Check
        console.log("📊 Supply Info:");
        try {
            // Check if _nextTokenId is accessible
            const nextTokenId = await contract._nextTokenId();
            console.log(`  Next Token ID: ${nextTokenId}`);
            console.log(`  Total minted: ${nextTokenId - 1}`);
        } catch (error) {
            console.log(`  Next Token ID: Not accessible (${error.message})`);
            // Alternative: Check ownership of known tokens
            let totalFound = 0;
            for (let i = 1; i <= 10; i++) {
                try {
                    await contract.ownerOf(i);
                    totalFound++;
                } catch {
                    break;
                }
            }
            console.log(`  Tokens found: ${totalFound}`);
        }
        console.log();
        
        // 6. ERC721 Interface Check
        console.log("🔧 ERC721 Interface:");
        try {
            const supportsERC721 = await contract.supportsInterface("0x80ac58cd");
            console.log(`  Supports ERC721: ${supportsERC721}`);
        } catch (error) {
            console.log(`  Interface check failed: ${error.message}`);
        }
        console.log();
        
        console.log("📝 MetaMask Import Summary:");
        console.log("================================");
        console.log("✅ Use these EXACT values in MetaMask:");
        console.log(`   Contract Address: ${contractAddress}`);
        console.log(`   Token ID: 1`);
        console.log(`   Account: ${deployer}`);
        console.log(`   Network: Hardhat Local (Chain ID: 31337)`);
        console.log();
        
        if (balance > 0) {
            console.log("🎉 NFT exists and is owned by this account!");
            console.log("   If MetaMask still fails, try:");
            console.log("   1. Refresh MetaMask");
            console.log("   2. Switch networks and switch back");
            console.log("   3. Try different Token ID format (with/without leading zeros)");
        } else {
            console.log("❌ No NFTs found for this account!");
            console.log("   Something went wrong during minting.");
        }
        
    } catch (error) {
        console.error("❌ Script Error:", error.message);
        console.log();
        console.log("💡 Troubleshooting:");
        console.log("   1. Is hardhat node running? (npx hardhat node)");
        console.log("   2. Is the contract address correct?");
        console.log("   3. Did the deployment succeed?");
    }
}

main().catch(console.error);