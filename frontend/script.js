let provider, signer, contract;
const contractAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F"; // change when redeploying
let contractAbi = [];

// ✅ Fetch the ABI (must be valid JSON with no comments or trailing commas)
fetch("abi.json")
  .then((res) => res.json())
  .then((data) => {
    contractAbi = data;

    // ✅ Initialize contract only if signer is already available (after connectWallet)
    if (signer) {
      contract = new ethers.Contract(contractAddress, contractAbi, signer);
    }

    console.log("✅ ABI loaded. You can now connect your wallet.");
  })
  .catch((err) => {
    console.error("❌ Failed to load ABI:", err);
    document.getElementById("message").innerText = "❌ Failed to load ABI. Check console.";
  });

async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask is not installed.");
    return;
  }

  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();

  const address = await signer.getAddress();
  document.getElementById("message").innerText = "🔗 Connected: " + address;

  // ✅ If ABI is already loaded, initialize the contract
  if (contractAbi.length > 0) {
    contract = new ethers.Contract(contractAddress, contractAbi, signer);
  } else {
    console.warn("🕒 ABI not loaded yet. Contract will initialize once it is.");
  }
}

async function redeemReward() {
  try {
    debugger
    const userAddress = await signer.getAddress();
    const actionId = ethers.utils.formatBytes32String("action1");

    // 🧠 Create the same message hash that your smart contract will verify
    const messageHash = ethers.utils.solidityKeccak256(
      ["bytes32", "address"],
      [actionId, userAddress]
    );

    // ✍️ Simulated signing by merchant (deployer's private key)
    const merchantPrivateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    const merchantWallet = new ethers.Wallet(merchantPrivateKey);
    const signature = await merchantWallet.signMessage(ethers.utils.arrayify(messageHash));

    // 📤 Send the redeem transaction from the logged-in user
    const tx = await contract.redeemTicket(actionId, signature);
    await tx.wait();

    document.getElementById("message").innerText = "🎉 Reward redeemed!";
  } catch (err) {
    console.error("❌ Redeem failed:", err);
    document.getElementById("message").innerText = "❌ Error: " + err.message;
  }
}