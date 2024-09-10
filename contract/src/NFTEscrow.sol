// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";

contract NFTEscrow {
    address public owner;

    struct Trade {
        address initiator;
        address counterparty;
        IERC721 token1;
        uint256 tokenId1;
        IERC721 token2;
        uint256 tokenId2;
        bool initiatorApproved;
        bool counterpartyApproved;
    }

    // Trade information storage
    mapping(uint256 => Trade) public trades;
    uint256 public tradeCounter;

    event TradeInitiated(
        uint256 tradeId,
        address initiator,
        address counterparty
    );
    event TradeApproved(uint256 tradeId, address approver);
    event TradeCompleted(uint256 tradeId);
    event TradeCancelled(uint256 tradeId);

    constructor() {
        owner = msg.sender;
    }

    // Function to initiate a trade
    function initiateTrade(
        address _counterparty,
        IERC721 _token1,
        uint256 _tokenId1,
        IERC721 _token2,
        uint256 _tokenId2
    ) external {
        require(
            _token1.ownerOf(_tokenId1) == msg.sender,
            "You don't own token1"
        );

        trades[tradeCounter] = Trade({
            initiator: msg.sender,
            counterparty: _counterparty,
            token1: _token1,
            tokenId1: _tokenId1,
            token2: _token2,
            tokenId2: _tokenId2,
            initiatorApproved: false,
            counterpartyApproved: false
        });

        emit TradeInitiated(tradeCounter, msg.sender, _counterparty);
        tradeCounter++;
    }

    // Approve the trade by the initiator or counterparty
    function approveTrade(uint256 _tradeId) external {
        Trade storage trade = trades[_tradeId];
        require(trade.initiator != address(0), "Trade does not exist");
        require(
            msg.sender == trade.initiator || msg.sender == trade.counterparty,
            "Not authorized"
        );

        if (msg.sender == trade.initiator) {
            trade.initiatorApproved = true;
        } else if (msg.sender == trade.counterparty) {
            trade.counterpartyApproved = true;
        }

        emit TradeApproved(_tradeId, msg.sender);

        if (trade.initiatorApproved && trade.counterpartyApproved) {
            completeTrade(_tradeId);
        }
    }

    // Internal function to complete the trade
    function completeTrade(uint256 _tradeId) internal {
        Trade storage trade = trades[_tradeId];

        // Transfer the NFTs between both parties
        trade.token1.safeTransferFrom(
            trade.initiator,
            trade.counterparty,
            trade.tokenId1
        );
        trade.token2.safeTransferFrom(
            trade.counterparty,
            trade.initiator,
            trade.tokenId2
        );

        emit TradeCompleted(_tradeId);

        // Clear the trade data
        delete trades[_tradeId];
    }

    // Cancel the trade
    function cancelTrade(uint256 _tradeId) external {
        Trade storage trade = trades[_tradeId];
        require(trade.initiator != address(0), "Trade does not exist");
        require(
            msg.sender == trade.initiator || msg.sender == trade.counterparty,
            "Not authorized"
        );

        emit TradeCancelled(_tradeId);

        // Clear the trade data
        delete trades[_tradeId];
    }
}
