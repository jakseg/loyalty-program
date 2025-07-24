const hre = require("hardhat");
const { upgrades, ethers } = hre;
const fs = require("fs");

async function main() {
    console.log("LOYALTY REWARDS TOKEN DEPLOYMENT");
    console.log("===================================");
    
    const [deployer] = await ethers.getSigners();
    
    // Deploy the contract
    const LoyaltyRewardsToken = await ethers.getContractFactory("LoyaltyRewardsToken");
    const contract = await upgrades.deployProxy(
        LoyaltyRewardsToken,
        [deployer.address, deployer.address], // owner and merchant signer
        { initializer: "initialize", unsafeAllow: ["constructor"] }
    );
    
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    
    console.log("Contract deployed to:", contractAddress);
    console.log("Merchant signer set to:", deployer.address);
    
    // Save deployment information for your website to use
    const deploymentInfo = {
        contractAddress,
        network: hre.network.name,
        chainId: hre.network.config.chainId || 31337,
        merchantSigner: deployer.address,
        // NOTE: In production, NEVER expose the private key like this
        // Store it securely in your backend environment variables
        merchantPrivateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        abi: [
            "function redeemTicket(bytes32 actionId, bytes memory signature) external returns (uint256)",
            "function isTicketUsed(bytes32 actionId, address user) external view returns (bool)"
        ],
        timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync("deployment-info.json", JSON.stringify(deploymentInfo, null, 2));
    console.log("Deployment info saved to: deployment-info.json");
    
}

main().catch((error) => {
    console.error("Deployment error:", error);
    process.exit(1);
});