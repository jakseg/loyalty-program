let provider;
let signer;
let contract;

const contractAddress = "0xYourContractAddressHere"; // will be replaced with our deployed contract address
let contractAbi = [];

// load the ABI (Application Binary Interfaces) from abi.json file (optional, or paste directly)
fetch("abi.json")
  .then(res => res.json())
  .then(data => {
    contractAbi = data;
    init();
  });

function init() {
  provider = new ethers.providers.Web3Provider(window.ethereum);
  signer = provider.getSigner();
  contract = new ethers.Contract(contractAddress, contractAbi, signer);
}

async function connectWallet() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    document.getElementById("message").innerText = "Connected to: " + address;
  } else {
    alert("MetaMask not detected.");
  }
}

async function redeemReward() {
  const actionId = "0x123..."; // Replace with actual actionId used off-chain
  const signature = "0xabc..."; // Signature from merchant

  try {
    const tx = await contract.redeem(actionId, signature);
    document.getElementById("message").innerText = "Transaction sent. Waiting for confirmation...";
    await tx.wait();
    document.getElementById("message").innerText = "Reward redeemed! 🎉";
  } catch (error) {
    console.error(error);
    document.getElementById("message").innerText = "Error: " + error.message;
  }
}
