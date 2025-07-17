// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract LoyaltyRewardsToken is Initializable, ERC721Upgradeable, OwnableUpgradeable, UUPSUpgradeable {
    uint256 private _nextTokenId;
    mapping(bytes32 => bool) usedTickets;
    address public merchantSigner;
    
    // ✅ NEW: Define rewardable actions (optional feature)
    struct RewardAction {
        string name;
        string description;
        bool isActive;
        string tier; // "basic" or "premium"
    }
    
    mapping(bytes32 => RewardAction) public rewardableActions;
    
    // ✅ NEW: Track user redemptions per action (for exclusive rewards)
    mapping(bytes32 => mapping(address => bool)) public userActionRedeemed;
    
    // ✅ Mapping to store token tiers
    mapping(uint256 => string) private _tokenTiers;
    
    // ✅ Events
    event TicketRedeemed(address indexed user, bytes32 ticketHash, uint256 tokenId, string tier);
    event RewardActionAdded(bytes32 indexed actionId, string name, string tier);
    event RewardActionUpdated(bytes32 indexed actionId, bool isActive);

    function initialize(address initialOwner, address signer) public initializer {
        __ERC721_init("LoyaltyRewardsToken", "LRT");
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
        merchantSigner = signer;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function setMerchantSigner(address _signer) external onlyOwner {
        merchantSigner = _signer;
    }

    // ✅ Add rewardable actions (optional feature for managed rewards)
    function addRewardableAction(
        bytes32 actionId, 
        string memory name, 
        string memory description, 
        string memory tier
    ) external onlyOwner {
        require(
            keccak256(abi.encodePacked(tier)) == keccak256(abi.encodePacked("basic")) ||
            keccak256(abi.encodePacked(tier)) == keccak256(abi.encodePacked("premium")),
            "Invalid tier: must be 'basic' or 'premium'"
        );
        
        rewardableActions[actionId] = RewardAction(name, description, true, tier);
        emit RewardActionAdded(actionId, name, tier);
    }

    // ✅ Update action status
    function updateRewardActionStatus(bytes32 actionId, bool isActive) external onlyOwner {
        require(bytes(rewardableActions[actionId].name).length > 0, "Action does not exist");
        rewardableActions[actionId].isActive = isActive;
        emit RewardActionUpdated(actionId, isActive);
    }

    // ✅ MAIN FUNCTION: Enhanced redeemTicket function with tier support (for your frontend)
    function redeemTicket(bytes32 actionId, bytes memory signature, string memory tier) public returns (uint256) {
        bytes32 messageHash = keccak256(abi.encodePacked(actionId, msg.sender));
        bytes32 ethSignedHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        address recovered = ECDSA.recover(ethSignedHash, signature);
        
        require(recovered == merchantSigner, "Invalid signature");
        require(!usedTickets[messageHash], "Ticket already used");
        
        // ✅ Validate tier input
        require(
            keccak256(abi.encodePacked(tier)) == keccak256(abi.encodePacked("basic")) ||
            keccak256(abi.encodePacked(tier)) == keccak256(abi.encodePacked("premium")),
            "Invalid tier: must be 'basic' or 'premium'"
        );
        
        usedTickets[messageHash] = true;
        uint256 tokenId = _nextTokenId++;
        
        // ✅ Store tier for this token
        _tokenTiers[tokenId] = tier;
        
        _safeMint(msg.sender, tokenId);
        
        // ✅ Emit event with tier information
        emit TicketRedeemed(msg.sender, messageHash, tokenId, tier);
        
        return tokenId;
    }




    // Block all transfers after minting
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        
        // Allow minting (from == address(0))
        if (from == address(0)) {
            return super._update(to, tokenId, auth);
        }
        
        // Block all transfers
        revert("NFTs are non-transferable");
    }

    // ✅ View functions for actions
    function getRewardableAction(bytes32 actionId) public view returns (RewardAction memory) {
        return rewardableActions[actionId];
    }

    // ✅ Function to get the tier of a specific token
    function getTokenTier(uint256 tokenId) public view returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _tokenTiers[tokenId];
    }

    // ✅ Function to get all tokens of a user with their tiers
    function getUserTokensWithTiers(address user) public view returns (uint256[] memory tokenIds, string[] memory tiers) {
        uint256 balance = balanceOf(user);
        uint256[] memory userTokens = new uint256[](balance);
        string[] memory userTiers = new string[](balance);
        uint256 index = 0;
        
        // Search through all tokens to find those owned by the user
        for (uint256 i = 0; i < _nextTokenId; i++) {
            if (_ownerOf(i) == user) {
                userTokens[index] = i;
                userTiers[index] = _tokenTiers[i];
                index++;
            }
        }
        
        return (userTokens, userTiers);
    }

    // ✅ Statistics functions
    function getTotalSupply() public view returns (uint256) {
        return _nextTokenId;
    }

    function getBasicTokenCount() public view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < _nextTokenId; i++) {
            if (keccak256(abi.encodePacked(_tokenTiers[i])) == keccak256(abi.encodePacked("basic"))) {
                count++;
            }
        }
        return count;
    }

    function getPremiumTokenCount() public view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < _nextTokenId; i++) {
            if (keccak256(abi.encodePacked(_tokenTiers[i])) == keccak256(abi.encodePacked("premium"))) {
                count++;
            }
        }
        return count;
    }

    function isTicketUsed(bytes32 actionId, address user) public view returns (bool) {
        bytes32 hash = keccak256(abi.encodePacked(actionId, user));
        return usedTickets[hash];
    }

    // ✅ Enhanced tokenURI with tier-based metadata
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");

        string memory tier = _tokenTiers[tokenId];

        // Choose image URL source based on tier
        if (keccak256(abi.encodePacked(tier)) == keccak256(abi.encodePacked("premium"))) {
            return string(
                abi.encodePacked(
                    "https://picsum.photos/seed/premium",
                    toString(tokenId),
                    "/600/600"
                )
            );
        } else {
            return string(
                abi.encodePacked(
                    "https://picsum.photos/seed/basic",
                    toString(tokenId),
                    "/600/600"
                )
            );
        }
    }

    // ✅ Helper function to convert uint to string
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
}