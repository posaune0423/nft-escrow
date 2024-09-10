// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";
import "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

import "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";



contract FlexibleEscrow is ReentrancyGuard, IERC721Receiver{
    using SafeERC20 for IERC20;

    address public owner;
    uint256 public feePercentage; // 1 = 1%

    enum TokenType { ERC721, ERC20 }

    constructor() {
        owner = msg.sender;
        feePercentage = 1; // デフォルトで1%の手数料
    }

    struct Asset {
        TokenType tokenType;
        address tokenAddress;
        uint256 tokenId;
        uint256 amount;
    }

    struct Trade {
        address initiator;
        address counterparty;
        Asset initiatorAsset;
        Asset counterpartyAsset;
        bool initiatorApproved;
        bool counterpartyApproved;
    }

    // Trade information storage
    mapping(uint256 => Trade) public trades;
    mapping(address => mapping(uint256 => bool)) public isNFTInEscrow;

    uint256 public tradeCounter;

    event TradeInitiated(
        uint256 tradeId,
        address initiator,
        address counterparty
    );
    event TradeApproved(uint256 tradeId, address approver);
    event TradeCompleted(uint256 tradeId);
    event TradeCancelled(uint256 tradeId);

    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    // Function to initiate a trade
    function initiateTrade(
        address _counterparty,
        Asset memory _initiatorAsset,
        Asset memory _counterpartyAsset
    ) external {
        require(_transferToEscrow(msg.sender, _initiatorAsset), "Failed to transfer initiator asset");

        trades[tradeCounter] = Trade({
            initiator: msg.sender,
            counterparty: _counterparty,
            initiatorAsset: _initiatorAsset,
            counterpartyAsset: _counterpartyAsset,
            initiatorApproved: true,
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
            msg.sender == trade.counterparty,
            "Only counterparty can approve"
        );
        require(_transferToEscrow(msg.sender, trade.counterpartyAsset), "Failed to transfer counterparty asset");

        trade.counterpartyApproved = true;
        emit TradeApproved(_tradeId, msg.sender);
        completeTrade(_tradeId);
    }

    // Internal function to complete the trade
    function completeTrade(uint256 _tradeId) internal nonReentrant {
        Trade storage trade = trades[_tradeId];

        uint256 initiatorFee = calculateFee(trade.counterpartyAsset);
        uint256 counterpartyFee = calculateFee(trade.initiatorAsset);

        _transferFromEscrow(trade.counterparty, trade.initiatorAsset, counterpartyFee);
        _transferFromEscrow(trade.initiator, trade.counterpartyAsset, initiatorFee);

        emit TradeCompleted(_tradeId);
        delete trades[_tradeId];
    }

    // Cancel the trade
    function cancelTrade(uint256 _tradeId) external {
        Trade storage trade = trades[_tradeId];
        require(trade.initiator != address(0), "Trade does not exist");
        require(msg.sender == trade.initiator || msg.sender == trade.counterparty, "Not authorized");

        if (trade.initiatorApproved) {
            _transferFromEscrow(trade.initiator, trade.initiatorAsset, 0);
        }
        if (trade.counterpartyApproved) {
            _transferFromEscrow(trade.counterparty, trade.counterpartyAsset, 0);
        }

        emit TradeCancelled(_tradeId);
        delete trades[_tradeId];
    }

    function _transferToEscrow(address _from, Asset memory _asset) internal returns (bool) {
        if (_asset.tokenType == TokenType.ERC721) {
            IERC721 nft = IERC721(_asset.tokenAddress);
            require(nft.ownerOf(_asset.tokenId) == _from, "You don't own the NFT");
            require(!isNFTInEscrow[_asset.tokenAddress][_asset.tokenId], "NFT is already in escrow");
            nft.safeTransferFrom(_from, address(this), _asset.tokenId);
            isNFTInEscrow[_asset.tokenAddress][_asset.tokenId] = true;
        } else if (_asset.tokenType == TokenType.ERC20) {
            IERC20 ft = IERC20(_asset.tokenAddress);
            require(ft.balanceOf(_from) >= _asset.amount, "Insufficient FT balance");
            ft.safeTransferFrom(_from, address(this), _asset.amount);
        } else {
            return false;
        }
        return true;
    }

    function _transferFromEscrow(address _to, Asset memory _asset, uint256 _fee) internal {
        if (_asset.tokenType == TokenType.ERC721) {
            IERC721 nft = IERC721(_asset.tokenAddress);
            nft.safeTransferFrom(address(this), _to, _asset.tokenId);
            isNFTInEscrow[_asset.tokenAddress][_asset.tokenId] = false;
        } else if (_asset.tokenType == TokenType.ERC20) {
            IERC20 ft = IERC20(_asset.tokenAddress);
            uint256 amountAfterFee = _asset.amount - _fee;
            ft.safeTransfer(_to, amountAfterFee);
            if (_fee > 0) {
                ft.safeTransfer(owner, _fee);
            }
        }
    }

    function calculateFee(Asset memory _asset) internal view returns (uint256) {
        if (_asset.tokenType == TokenType.ERC20) {
            return (_asset.amount * feePercentage) / 100;
        }
        return 0; // NFTの場合は手数料なし
    }

    function setFeePercentage(uint256 _newFeePercentage) external {
        require(msg.sender == owner, "Only owner can set fee");
        require(_newFeePercentage <= 10, "Fee percentage too high"); // max 10%
        feePercentage = _newFeePercentage;
    }
}
