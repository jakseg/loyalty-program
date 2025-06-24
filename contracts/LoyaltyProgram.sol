// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.27;

import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ERC721URIStorageUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract LoyaltyRewardsToken is Initializable, ERC721Upgradeable, OwnableUpgradeable {
    uint256 private _nextTokenId;

    mapping (bytes32=>bool) usedTickets;

    //enum RewardType { Basic, Premium }
    //struct RewardConfig {
    //    uint256 ticketCost;
    //}


    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) public initializer {
        __ERC721_init("LoyaltyRewardsToken", "LRT");
        __Ownable_init(initialOwner);
    }

    function safeMint(address to) public onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        return tokenId;
    }

    function redeemTicket(bytes32 ticketHash) public returns (uint256) {
        //ticket already used - prevent double spending
        require(!usedTickets[ticketHash], "Ticket already used");

        //mark as used
        usedTickets[ticketHash] = true;
        //mint the token
        uint256 tokenId = _nextTokenId++;
        //msg.sender defines who is redeeming the ticket
        _safeMint(msg.sender, tokenId);
        //Event for logging
        emit TicketRedeemed(msg.sender, ticketHash, tokenId);
        return tokenId;
        //
    }

    function isTicketUsed(bytes32 ticketHash) public view returns (bool) {
    return usedTickets[ticketHash];
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function verify(string memory message, bytes memory sig, address expectedSigner) public pure returns (bool) {
    bytes32 hash = keccak256(abi.encodePacked(message));
    bytes32 ethSignedHash = MessageHashUtils.toEthSignedMessageHash(hash);
    address recovered = ECDSA.recover(ethSignedHash, sig);
    return recovered == expectedSigner;
    }

    //Event for logging
    event TicketRedeemed(address indexed user, bytes32 ticketHash, uint256 tokenId);

}