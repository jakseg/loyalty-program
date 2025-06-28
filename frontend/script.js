import { ethers } from "https://esm.sh/ethers@6.7.0";

let provider, signer, contract;
let contractAbi = [];
let contractAddress = null;
let contractReady = false;

// 🔁 Try to initialize contract when conditions are ready
function initializeContractIfReady() {
    if (signer && contractAbi.length > 0 && contractAddress && !contractReady) {
        contract = new ethers.Contract(contractAddress, contractAbi, signer);
        contractReady = true;
        console.log("✅ Contract initialized");
        console.log("✅ Contract Address:", contractAddress);
        
        // Safely check contract functions - some properties might not be available immediately
        try {
            if (contract.interface && contract.interface.functions) {
                const functionNames = Object.keys(contract.interface.functions);
                console.log("🧠 Contract functions:", functionNames);
            } else {
                console.log("🧠 Contract interface loading...");
            }
        } catch (error) {
            console.log("🧠 Contract functions will be available after connection");
        }
    }
}

// 🔄 Load ABI first, then try to load contract address
async function loadContractData() {
    try {
        // Load ABI
        const abiResponse = await fetch("abi.json");
        const abiData = await abiResponse.json();
        contractAbi = abiData.abi || abiData;
        console.log("✅ ABI loaded:", contractAbi.length, "functions");
        
        // Load contract address from deployment-info.json
        const deploymentResponse = await fetch("../deployment-info.json");
        const deploymentData = await deploymentResponse.json();
        contractAddress = deploymentData.contractAddress;
        console.log("✅ Contract address loaded from deployment-info:", contractAddress);
        
        initializeContractIfReady();
        
    } catch (error) {
        console.error("❌ Failed to load contract data:", error);
        document.getElementById("message").innerText = "❌ Failed to load contract data: " + error.message;
    }
}

// Load contract data when script starts
loadContractData();

// 🔌 Connect wallet
window.connectWallet = async function () {
    if (!window.ethereum) {
        alert("MetaMask is not installed.");
        return;
    }
    
    try {
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        const address = await signer.getAddress();
        document.getElementById("message").innerText = "🔗 Connected: " + address;
        initializeContractIfReady();
    } catch (error) {
        console.error("❌ Wallet connection failed:", error);
        document.getElementById("message").innerText = "❌ Failed to connect wallet: " + error.message;
    }
};

// 🎟️ Redeem ticket mit ticketTier Parameter
window.redeemReward = async function (ticketTier = "basic") {
    if (!contractReady) {
        console.warn("⏳ Contract not ready yet");
        document.getElementById("message").innerText = "⏳ Please connect wallet and wait for contract initialization.";
        return;
    }
    
    try {
        document.getElementById("message").innerText = `🔄 Processing ${ticketTier} reward...`;
        
        const userAddress = await signer.getAddress();
        
        // ✅ Erstelle eine einzigartige actionId mit ticketTier
        const timestamp = Date.now();
        const randomId = Math.floor(Math.random() * 10000);
        const uniqueActionString = `${ticketTier}-reward-${userAddress.slice(-6)}-${timestamp}-${randomId}`;
        
        // ✅ Verwende keccak256 Hash statt encodeBytes32String für lange Strings
        const actionId = ethers.keccak256(ethers.toUtf8Bytes(uniqueActionString));
        
        console.log("🎫 Creating unique ticket:", uniqueActionString);
        console.log("🎫 Ticket Tier:", ticketTier);
        console.log("🎫 Action ID (hash):", actionId);
        
        const messageHash = ethers.solidityPackedKeccak256(
            ["bytes32", "address"],
            [actionId, userAddress]
        );
        
        const merchantWallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
        const signature = await merchantWallet.signMessage(ethers.getBytes(messageHash));
        
        // Transaction senden
        console.log("📤 Sending transaction...");
        // In deiner redeemReward Funktion:
        const tx = await contract["redeemTicket(bytes32,bytes,string)"](actionId, signature, ticketTier);
        
        document.getElementById("message").innerText = "⏳ Transaction sent, waiting for confirmation...";
        const receipt = await tx.wait();
        
        // Contract Address holen
        const currentContractAddress = await contract.getAddress();
        
        // Token ID aus dem Event extrahieren
        let tokenId = "Unknown";
        try {
            // Suche nach dem TicketRedeemed Event
            for (const log of receipt.logs) {
                try {
                    const parsedLog = contract.interface.parseLog(log);
                    if (parsedLog.name === "TicketRedeemed") {
                        tokenId = parsedLog.args.tokenId.toString();
                        console.log("✅ Token ID from event:", tokenId);
                        break;
                    }
                } catch (e) {
                    // Ignore logs that can't be parsed
                    continue;
                }
            }
        } catch (eventError) {
            console.warn("⚠️ Could not extract token ID from events");
        }
        
        // Emoji für Ticket Tier
        const tierEmoji = ticketTier === "premium" ? "💎" : "🎫";
        const tierName = ticketTier === "premium" ? "Premium" : "Basic";
        
        // Erfolgreiche Nachricht mit allen Details anzeigen
        document.getElementById("message").innerHTML = `
            🎉 <strong>${tierEmoji} ${tierName} Reward redeemed successfully!</strong><br><br>
            <strong>📋 Contract Address:</strong><br>
            <code style="background: #f0f0f0; padding: 4px; border-radius: 4px; font-size: 12px;">${currentContractAddress}</code><br><br>
            <strong>🏷️ Token ID:</strong> <span style="font-size: 18px; color: #007bff;">${tokenId}</span><br><br>
            <strong>${tierEmoji} Tier:</strong> <span style="font-size: 16px; color: ${ticketTier === "premium" ? "#ffd700" : "#666"};">${tierName}</span><br><br>
            <strong>👤 Owner:</strong><br>
            <code style="background: #f0f0f0; padding: 4px; border-radius: 4px; font-size: 12px;">${userAddress}</code><br><br>
            <strong>🎫 Ticket ID:</strong><br>
            <code style="background: #f0f0f0; padding: 4px; border-radius: 4px; font-size: 11px;">${uniqueActionString}</code><br><br>
            <strong>📄 Transaction:</strong><br>
            <code style="background: #f0f0f0; padding: 4px; border-radius: 4px; font-size: 12px;">${tx.hash}</code><br><br>
            <em>📱 Copy the Contract Address and Token ID to import your ${tierName} NFT in MetaMask</em>
        `;
        
        console.log("✅ Transaction successful!");
        console.log("✅ Tx Hash:", tx.hash);
        console.log("✅ Contract Address:", currentContractAddress);
        console.log("✅ Token ID:", tokenId);
        console.log("✅ Ticket Tier:", ticketTier);
        console.log("✅ Unique Ticket:", uniqueActionString);
        console.log("✅ Action ID Hash:", actionId);
        console.log("✅ NFT Owner:", userAddress);
        
    } catch (err) {
        console.error("❌ Redeem failed:", err);
        
        let errorMessage = "❌ Error: ";
        if (err.code === "ACTION_REJECTED") {
            errorMessage += "Transaction was rejected by user.";
        } else if (err.message.includes("Ticket already used")) {
            errorMessage += "This ticket has already been used.";
        } else if (err.message.includes("Invalid signature")) {
            errorMessage += "Invalid signature. Please try again.";
        } else if (err.message.includes("bytes32 string")) {
            errorMessage += "Ticket ID too long. Please try again.";
        } else {
            errorMessage += err.message;
        }
        
        document.getElementById("message").innerText = errorMessage;
    }
};

// 🎫 Basic Reward Button Function
window.redeemBasicReward = function() {
    redeemReward("basic");
};

// 💎 Premium Reward Button Function  
window.redeemPremiumReward = function() {
    redeemReward("premium");
};