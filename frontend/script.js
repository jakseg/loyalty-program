let provider, signer, contract;
const contractAddress = "0xYourDeployedContractAddress"; // Replace this!

let contractAbi = [];

fetch("abi.json")
  .then((res) => res.json())
  .then((data) => {
    contractAbi = data;
  });

async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask is not installed");
    return;
  }

  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  const address = await signer.getAddress();
  document.getElementById("message").innerText = "Connected: " + address;

  // Initialize contract
  contract = new ethers.Contract(contractAddress, contractAbi, signer);
}

async function redeemReward() {
  const userAddress = await signer.getAddress();
  const actionId = ethers.utils.formatBytes32String("action1");

  // Simulated off-chain signature (for testing only!)
  const messageHash = ethers.utils.solidityKeccak256(["bytes32", "address"], [actionId, userAddress]);
  const fakePrivateKey = "0xYourMerchantPrivateKeyHere"; // For demo
  const merchantWallet = new ethers.Wallet(fakePrivateKey);
  const signature = await merchantWallet.signMessage(ethers.utils.arrayify(messageHash));

  try {
    const tx = await contract.redeem(actionId, signature);
    await tx.wait();
    document.getElementById("message").innerText = "🎉 Reward redeemed!";
  } catch (err) {
    console.error(err);
    document.getElementById("message").innerText = "Error: " + err.message;
  }
}









// const wallet = ethers.Wallet.createRandom();
// const privateKey = wallet.privateKey;
// const publicAddress = wallet.address; // Store in contract

// console.log("Merchant Address (public key to whitelist in contract):", publicAddress);





// const { ethers } = require("ethers");


// const provider = new ethers.providers.Web3Provider(window.ethereum);
// const wallet = ethers.Wallet.createRandom(); // Simulated merchant key

// const privateKey = wallet.privateKey;
// const publicAddress = wallet.address;

// console.log("Merchant signer address:", publicAddress);

// async function connectWallet() {
//   await provider.send("eth_requestAccounts", []);
//   const signer = provider.getSigner();
//   const address = await signer.getAddress();
//   document.getElementById("message").innerText = "Connected: " + address;
// }

// async function generateSignedTicket(actionId, userAddress) {
//   const messageHash = ethers.utils.solidityKeccak256(["bytes32", "address"], [actionId, userAddress]);
//   const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));
//   return { actionId, userAddress, signature };
// }


// async function redeemFromUI() {
//   const signer = provider.getSigner();
//   const userAddress = await signer.getAddress();
//   const actionId = ethers.utils.formatBytes32String("action1");

//   // Simulated merchant signing the ticket
//   const messageHash = ethers.utils.solidityKeccak256(["bytes32", "address"], [actionId, userAddress]);
//   const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));

//   const contract = new ethers.Contract(contractAddress, contractAbi, signer);
//   try {
//     const tx = await contract.redeemTicket(actionId, signature);
//     await tx.wait();
//     document.getElementById("message").innerText = "🎉 Reward Redeemed!";
//   } catch (error) {
//     console.error(error);
//     document.getElementById("message").innerText = "Error: " + error.message;
//   }
// }





// async function redeemFromUI() {
//   const signer = provider.getSigner();
//   const userAddress = await signer.getAddress();
//   const actionId = ethers.utils.formatBytes32String("action1"); // example action

//   const { signature } = await generateSignedTicket(actionId, userAddress);

//   const contract = new ethers.Contract(contractAddress, contractAbi, signer);
//   const tx = await contract.redeem(actionId, signature);
//   await tx.wait();

//   document.getElementById("message").innerText = "Reward Redeemed!";
// }





// let provider;
// let signer;
// let contract;

// const contractAddress = "0xYourContractAddressHere"; // will be replaced with our deployed contract address
// let contractAbi = [];

// // load the ABI (Application Binary Interfaces) from abi.json file (optional, or paste directly)
// fetch("abi.json")
//   .then(res => res.json())
//   .then(data => {
//     contractAbi = data;
//     init();
//   });

// function init() {
//   provider = new ethers.providers.Web3Provider(window.ethereum);
//   signer = provider.getSigner();
//   contract = new ethers.Contract(contractAddress, contractAbi, signer);
// }

// async function connectWallet() {
  
//   if (typeof window.ethereum !== "undefined") {
//     const provider = new ethers.providers.Web3Provider(window.ethereum);
//     await provider.send("eth_requestAccounts", []);
//     const signer = provider.getSigner();
//     const address = await signer.getAddress();
//     document.getElementById("message").innerText = "Connected to: " + address;
//   } else {
//     alert("MetaMask not detected.");
//   }
// }

// async function redeemReward() {
//   const actionId = "0x123..."; // Replace with actual actionId used off-chain
//   const signature = "0xabc..."; // Signature from merchant

//   try {
//     const tx = await contract.redeem(actionId, signature);
//     document.getElementById("message").innerText = "Transaction sent. Waiting for confirmation...";
//     await tx.wait();
//     document.getElementById("message").innerText = "Reward redeemed! 🎉";
//   } catch (error) {
//     console.error(error);
//     document.getElementById("message").innerText = "Error: " + error.message;
//   }
// }
