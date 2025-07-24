// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "./LoyaltyProgram.sol";


    // This contract extends the main LoyaltyRewardsToken with additional functions
    //designed specifically for gas analysis and testing purposes.
contract LoyaltyRewardsTokenTestable is LoyaltyRewardsToken {
    

    //Tests only the signature verification portion of the redemption process
    function testSignatureOnly(
        bytes32 actionId, 
        address user, 
        bytes memory signature
    ) public view returns (bool) {
        bytes32 messageHash = keccak256(abi.encodePacked(actionId, user));
        bytes32 ethSignedHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        address recovered = ECDSA.recover(ethSignedHash, signature);
        return recovered == merchantSigner;
    }
    

    // Tests only the ticket usage lookup portion of the security validation
    function testTicketUsageOnly(
        bytes32 actionId, 
        address user
    ) public view returns (bool) {
        bytes32 messageHash = keccak256(abi.encodePacked(actionId, user));
        return usedTickets[messageHash];
    }
    

    //Tests the tier validation logic in isolation
    function testTierValidationOnly(string memory tier) public pure returns (bool) {
        return (
            keccak256(abi.encodePacked(tier)) == keccak256(abi.encodePacked("basic")) ||
            keccak256(abi.encodePacked(tier)) == keccak256(abi.encodePacked("premium"))
        );
    }
    

    //Simulates the complete security validation without executing the mint
    function testCompleteSecurityValidation(
        bytes32 actionId,
        bytes memory signature, 
        string memory tier,
        address user
    ) public view returns (bool) {
        bytes32 messageHash = keccak256(abi.encodePacked(actionId, user));
        bytes32 ethSignedHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        address recovered = ECDSA.recover(ethSignedHash, signature);
        
        if (recovered != merchantSigner) {
            return false; // Invalid signature
        }
        
        if (usedTickets[messageHash]) {
            return false; // Ticket already used
        }
    
        bool validTier = (
            keccak256(abi.encodePacked(tier)) == keccak256(abi.encodePacked("basic")) ||
            keccak256(abi.encodePacked(tier)) == keccak256(abi.encodePacked("premium"))
        );
        
        if (!validTier) {
            return false; // Invalid tier
        }
        
        return true;
    }
    

    //Provides detailed gas cost breakdown for security operations
    function testSecurityBreakdown(
        bytes32 actionId,
        bytes memory signature,
        string memory tier,
        address user
    ) public view returns (uint256[4] memory results) {
        results[0] = testSignatureOnly(actionId, user, signature) ? 1 : 0;
        results[1] = testTicketUsageOnly(actionId, user) ? 1 : 0;
        results[2] = testTierValidationOnly(tier) ? 1 : 0;
        results[3] = testCompleteSecurityValidation(actionId, signature, tier, user) ? 1 : 0;
        
        return results;
    }
}