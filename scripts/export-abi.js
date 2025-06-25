// scripts/export-abi.js
const fs = require("fs");
const path = require("path");
const artifacts = require("hardhat").artifacts;

async function exportABI() {
  const artifact = await artifacts.readArtifact("LoyaltyRewardsToken");
  const abi = artifact.abi;
  const abiPath = path.join(__dirname, "../frontend/abi.json");
  fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));
  console.log("✅ ABI exported to frontend/abi.json");
}

exportABI();