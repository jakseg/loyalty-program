import { ethers } from "https://esm.sh/ethers@6.7.0";

let provider, signer, contract;
let contractAbi = [];
let contractReady = false;

const contractAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F";

// 🔁 Try to initialize contract when conditions are ready
function initializeContractIfReady() {
  debugger
  if (signer && contractAbi.length > 0 && !contractReady) {
    contract = new ethers.Contract(contractAddress, contractAbi, signer);
    contractReady = true;
    console.log("✅ Contract initialized");
    console.log("🧠 Contract functions:", Object.keys(contract.functions));
  }
}

// 🔄 Load ABI
fetch("abi.json")
  .then(res => res.json())
  .then(data => {
    contractAbi = data.abi;  // ✅ Fix: extract the array
    console.log("✅ ABI loaded:", contractAbi.length, "functions");
    initializeContractIfReady();
  })
  .catch(err => {
    console.error("❌ Failed to load ABI:", err);
    document.getElementById("message").innerText = "❌ Failed to load ABI.";
  });

// 🔌 Connect wallet
window.connectWallet = async function () {
  if (!window.ethereum) {
    alert("MetaMask is not installed.");
    return;
  }

  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();
  const address = await signer.getAddress();

  document.getElementById("message").innerText = "🔗 Connected: " + address;
  initializeContractIfReady();
};

// 🎟️ Redeem ticket
window.redeemReward = async function () {
  if (!contractReady) {
    console.warn("⏳ Contract not ready yet");
    document.getElementById("message").innerText = "⏳ Please connect wallet and wait for contract.";
    return;
  }

  try {
    const userAddress = await signer.getAddress();
    const actionId = ethers.encodeBytes32String("action1");

    const messageHash = ethers.solidityPackedKeccak256(
      ["bytes32", "address"],
      [actionId, userAddress]
    );

    const merchantWallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
    const signature = await merchantWallet.signMessage(ethers.getBytes(messageHash));

    const tx = await contract.redeemTicket(actionId, signature);
    await tx.wait();

    document.getElementById("message").innerText = "🎉 Reward redeemed!";
    console.log("✅ Tx Hash:", tx.hash);
  } catch (err) {
    console.error("❌ Redeem failed:", err);
    document.getElementById("message").innerText = "❌ Error: " + err.message;
  }
};