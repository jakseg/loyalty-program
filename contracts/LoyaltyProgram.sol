// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract LoyaltyRewardsToken is Initializable, ERC721Upgradeable, OwnableUpgradeable, UUPSUpgradeable {
    uint256 private _nextTokenId;
    mapping(bytes32 => bool) usedTickets;
    address public merchantSigner;

    event TicketRedeemed(address indexed user, bytes32 ticketHash, uint256 tokenId);

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

    function redeemTicket(bytes32 actionId, bytes memory signature) public returns (uint256) {
        bytes32 messageHash = keccak256(abi.encodePacked(actionId, msg.sender));
        bytes32 ethSignedHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        address recovered = ECDSA.recover(ethSignedHash, signature);

        require(recovered == merchantSigner, "Invalid signature");
        require(!usedTickets[messageHash], "Ticket already used");

        usedTickets[messageHash] = true;

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        emit TicketRedeemed(msg.sender, messageHash, tokenId);
        return tokenId;
    }

    function isTicketUsed(bytes32 actionId, address user) public view returns (bool) {
        bytes32 hash = keccak256(abi.encodePacked(actionId, user));
        return usedTickets[hash];
    }

    /// Optional: Disable constructor-based initialization
    constructor() {
        _disableInitializers();
    }
}