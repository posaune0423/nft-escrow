// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";
import "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import "openzeppelin-contracts/contracts/token/ERC721/IERC721Receiver.sol";
import "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

contract FlexibleEscrow is ReentrancyGuard, IERC721Receiver {
    using SafeERC20 for IERC20;

    address public owner;
    uint256 public feePercentage; // 1 = 1%

    enum TokenType {
        ERC20,
        ERC721
    }
    enum TradeStatus {
        NonExistent,
        Initiated,
        Approved,
        Completed,
        Cancelled
    }

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
    mapping(bytes32 => Trade) public trades;
    mapping(address => mapping(uint256 => bool)) public isNFTInEscrow;
    mapping(bytes32 => TradeStatus) public tradeStatus;

    mapping(address => bytes32[]) public userTrades;

    event TradeInitiated(
        bytes32 tradeId,
        address initiator,
        address counterparty
    );
    event TradeApproved(bytes32 tradeId, address approver);
    event TradeCompleted(bytes32 tradeId);
    event TradeCancelled(bytes32 tradeId);

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
    ) external returns (bytes32) {
        require(
            _transferToEscrow(msg.sender, _initiatorAsset),
            "Failed to transfer initiator asset"
        );

        bytes32 tradeId = keccak256(abi.encodePacked(msg.sender, _counterparty, block.timestamp));

        trades[tradeId] = Trade({
            initiator: msg.sender,
            counterparty: _counterparty,
            initiatorAsset: _initiatorAsset,
            counterpartyAsset: _counterpartyAsset,
            initiatorApproved: true,
            counterpartyApproved: false
        });

        userTrades[msg.sender].push(tradeId);
        userTrades[_counterparty].push(tradeId);

        emit TradeInitiated(tradeId, msg.sender, _counterparty);
        tradeStatus[tradeId] = TradeStatus.Initiated;
        return tradeId;
    }

    // Approve the trade by the initiator or counterparty
    function approveTrade(bytes32 tradeId) external nonReentrant {
        Trade storage trade = trades[tradeId];
        require(
            msg.sender == trade.counterparty,
            "Only counterparty can approve"
        );
        require(!trade.counterpartyApproved, "Already approved");
        require(
            tradeStatus[tradeId] == TradeStatus.Initiated,
            "Trade is not in the correct state"
        );

        require(
            _transferToEscrow(msg.sender, trade.counterpartyAsset),
            "Failed to transfer counterparty asset"
        );

        trade.counterpartyApproved = true;

        emit TradeApproved(tradeId, msg.sender);

        if (trade.initiatorApproved) {
            _executeTrade(tradeId);
        } else {
            tradeStatus[tradeId] = TradeStatus.Approved;
        }
    }

    function _executeTrade(bytes32 tradeId) internal {
        Trade storage trade = trades[tradeId];
        require(
            trade.initiatorApproved && trade.counterpartyApproved,
            "Trade not fully approved"
        );

        uint256 initiatorFee = calculateFee(trade.counterpartyAsset);
        uint256 counterpartyFee = calculateFee(trade.initiatorAsset);

        _transferFromEscrow(trade.initiator, trade.counterpartyAsset, initiatorFee);
        _transferFromEscrow(trade.counterparty, trade.initiatorAsset, counterpartyFee);

        emit TradeCompleted(tradeId);
        tradeStatus[tradeId] = TradeStatus.Completed;
    }

    function cancelTrade(bytes32 _tradeId) external nonReentrant {
        Trade storage trade = trades[_tradeId];
        require(trade.initiator != address(0), "Trade does not exist");
        require(
            msg.sender == trade.initiator || msg.sender == trade.counterparty,
            "Not authorized"
        );

        if (trade.initiatorApproved) {
            _transferFromEscrow(trade.initiator, trade.initiatorAsset, 0);
        }
        if (trade.counterpartyApproved) {
            _transferFromEscrow(trade.counterparty, trade.counterpartyAsset, 0);
        }

        emit TradeCancelled(_tradeId);
        tradeStatus[_tradeId] = TradeStatus.Cancelled;
    }

    function _transferToEscrow(
        address _from,
        Asset memory _asset
    ) internal returns (bool) {
        if (_asset.tokenType == TokenType.ERC721) {
            IERC721 nft = IERC721(_asset.tokenAddress);
            require(
                nft.ownerOf(_asset.tokenId) == _from,
                "You don't own the NFT"
            );
            require(
                !isNFTInEscrow[_asset.tokenAddress][_asset.tokenId],
                "NFT is already in escrow"
            );
            require(
                nft.getApproved(_asset.tokenId) == address(this) ||
                    nft.isApprovedForAll(_from, address(this)),
                "Contract is not approved to transfer this NFT"
            );
            nft.safeTransferFrom(_from, address(this), _asset.tokenId);
            isNFTInEscrow[_asset.tokenAddress][_asset.tokenId] = true;
        } else if (_asset.tokenType == TokenType.ERC20) {
            IERC20 ft = IERC20(_asset.tokenAddress);
            require(
                ft.balanceOf(_from) >= _asset.amount,
                "Insufficient FT balance"
            );
            ft.safeTransferFrom(_from, address(this), _asset.amount);
        } else {
            return false;
        }
        return true;
    }

    function _transferFromEscrow(
        address _to,
        Asset memory _asset,
        uint256 _fee
    ) internal {
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

    function getTrade(bytes32 _tradeId) external view returns (Trade memory) {
        return trades[_tradeId];
    }

    function getTradesByAddress(address _user) external view returns (bytes32[] memory) {
        return userTrades[_user];
    }

    function getTradeStatus(bytes32 _tradeId) external view returns (TradeStatus) {
        return tradeStatus[_tradeId];
    }
}
