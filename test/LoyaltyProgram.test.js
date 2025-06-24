const { expect } = require("chai");
const { ethers } = require("hardhat");
const { upgrades } = require("@openzeppelin/hardhat-upgrades");

describe("LoyaltyRewardsToken", function () {
  // Contract instance and test accounts
  let loyaltyContract;
  let owner;
  let user1;
  let user2;

  // This function runs before each test to ensure a clean testing environment
  beforeEach(async function () {
    // Get test accounts from Hardhat's local blockchain
    [owner, user1, user2] = await ethers.getSigners();
    
    // Deploy the upgradeable contract using OpenZeppelin's proxy pattern
    const LoyaltyRewardsToken = await ethers.getContractFactory("LoyaltyRewardsToken");
    loyaltyContract = await upgrades.deployProxy(LoyaltyRewardsToken, [owner.address]);
    await loyaltyContract.deployed();
  });

  describe("Deployment and Initialization", function () {
    it("Should initialize the contract correctly", async function () {
      // Verify that the contract has the correct name and symbol
      expect(await loyaltyContract.name()).to.equal("LoyaltyRewardsToken");
      expect(await loyaltyContract.symbol()).to.equal("LRT");
      
      // Verify that the owner is set correctly
      expect(await loyaltyContract.owner()).to.equal(owner.address);
      
      // Verify that no tokens exist initially
      // This should throw an error since token 0 doesn't exist yet
      await expect(loyaltyContract.tokenURI(0)).to.be.revertedWith("Token does not exist");
    });
  });

  describe("Ticket Redemption", function () {
    it("Should successfully redeem a ticket and mint NFT", async function () {
      // Create a unique ticket hash (in reality, this would be generated from signed data)
      const ticketHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("successful-redemption"));
      
      // Before redemption, the ticket should be marked as unused
      expect(await loyaltyContract.isTicketUsed(ticketHash)).to.be.false;
      
      // Redeem the ticket
      const tx = await loyaltyContract.connect(owner).redeemTicket(ticketHash);
      const receipt = await tx.wait();
      
      // Verify that the correct event was emitted
      const event = receipt.events.find(e => e.event === 'TicketRedeemed');
      expect(event).to.not.be.undefined;
      expect(event.args.user).to.equal(owner.address);
      expect(event.args.ticketHash).to.equal(ticketHash);
      
      // Verify that the NFT was actually created and belongs to the owner
      const tokenId = event.args.tokenId;
      expect(await loyaltyContract.ownerOf(tokenId)).to.equal(owner.address);
      
      // Verify that the ticket is now marked as used
      expect(await loyaltyContract.isTicketUsed(ticketHash)).to.be.true;
    });

    it("Should return correct token URI for minted NFT", async function () {
      const ticketHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("uri-test"));
      
      // Mint an NFT by redeeming a ticket
      await loyaltyContract.connect(owner).redeemTicket(ticketHash);
      
      // The first token should have ID 0
      const tokenURI = await loyaltyContract.tokenURI(0);
      expect(tokenURI).to.equal("https://example.com/loyalty-nft-metadata.json");
    });
  });

  describe("Security and Edge Cases", function () {
    it("Should prevent double-spending of tickets", async function () {
      const ticketHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("double-spend-test"));
      
      // The first redemption should work
      await loyaltyContract.connect(owner).redeemTicket(ticketHash);
      
      // The second redemption should fail with the correct error message
      await expect(
        loyaltyContract.connect(owner).redeemTicket(ticketHash)
      ).to.be.revertedWith("Ticket already used");
    });

    it("Should only allow owner to redeem tickets", async function () {
      const ticketHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("unauthorized-test"));
      
      // A regular user should not be able to redeem tickets
      await expect(
        loyaltyContract.connect(user1).redeemTicket(ticketHash)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should correctly track ticket usage status", async function () {
      const ticketHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("status-tracking-test"));
      
      // Initially, the ticket should be unused
      expect(await loyaltyContract.isTicketUsed(ticketHash)).to.be.false;
      
      // After redemption, it should be marked as used
      await loyaltyContract.connect(owner).redeemTicket(ticketHash);
      expect(await loyaltyContract.isTicketUsed(ticketHash)).to.be.true;
    });
  });

  describe("Helper Functions", function () {
    it("Should correctly report ticket usage status", async function () {
      const usedTicketHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("used-ticket"));
      const unusedTicketHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("unused-ticket"));
      
      // Redeem one ticket
      await loyaltyContract.connect(owner).redeemTicket(usedTicketHash);
      
      // Check status of both tickets
      expect(await loyaltyContract.isTicketUsed(usedTicketHash)).to.be.true;
      expect(await loyaltyContract.isTicketUsed(unusedTicketHash)).to.be.false;
    });

    it("Should maintain correct token count after multiple redemptions", async function () {
      // Create multiple unique tickets
      const ticket1 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ticket-1"));
      const ticket2 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ticket-2"));
      const ticket3 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ticket-3"));
      
      // Redeem all tickets
      await loyaltyContract.connect(owner).redeemTicket(ticket1);
      await loyaltyContract.connect(owner).redeemTicket(ticket2);
      await loyaltyContract.connect(owner).redeemTicket(ticket3);
      
      // Verify that all tokens exist and belong to the owner
      expect(await loyaltyContract.ownerOf(0)).to.equal(owner.address);
      expect(await loyaltyContract.ownerOf(1)).to.equal(owner.address);
      expect(await loyaltyContract.ownerOf(2)).to.equal(owner.address);
      
      // Verify that a fourth token doesn't exist yet
      await expect(loyaltyContract.ownerOf(3)).to.be.revertedWith("ERC721: invalid token ID");
    });
  });
});