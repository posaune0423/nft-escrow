// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "../src/FlexibleEscrow.sol";
import "./mocks/MockERC721.sol";
import "./mocks/MockERC20.sol";
import "./mocks/ReentrancyAttacker.sol";

contract FlexibleEscrowTest is Test {
    FlexibleEscrow public escrow;
    MockERC721 public nft;
    MockERC20 public token;

    address public alice = address(1);
    address public bob = address(2);

    function setUp() public {
        escrow = new FlexibleEscrow();
        nft = new MockERC721("TestNFT", "TNFT");
        token = new MockERC20("TestToken", "TT", 18);

        // アリスとボブにトークンを配布
        nft.mint(alice, 1);
        token.mint(alice, 1000 ether);
        token.mint(bob, 1000 ether);
    }

    function testInitiateTrade() public {
        vm.startPrank(alice);
        nft.approve(address(escrow), 1);
        FlexibleEscrow.Asset memory aliceAsset = FlexibleEscrow.Asset(FlexibleEscrow.TokenType.ERC721, address(nft), 1, 0);
        FlexibleEscrow.Asset memory bobAsset = FlexibleEscrow.Asset(FlexibleEscrow.TokenType.ERC20, address(token), 0, 100 ether);

        bytes32 tradeId = escrow.initiateTrade(bob, aliceAsset, bobAsset);
        vm.stopPrank();

        assertEq(nft.ownerOf(1), address(escrow));
        assertEq(uint8(escrow.tradeStatus(tradeId)), uint8(FlexibleEscrow.TradeStatus.Initiated));
    }

    function testApproveTrade() public {
        bytes32 tradeId = _initiateTrade();

        vm.startPrank(bob);
        token.approve(address(escrow), 100 ether);
        escrow.approveTrade(tradeId);
        vm.stopPrank();

        // アサーション
        assertEq(nft.ownerOf(1), address(bob), "NFT should be transferred to Bob");
        assertEq(token.balanceOf(alice), 1099 ether, "Alice should receive 99 ether (minus 1% fee)");
        assertEq(token.balanceOf(address(escrow.owner())), 1_000_001 ether, "Owner should receive 1 ether as fee");
    }

    function testCancelTrade() public {
        bytes32 tradeId = _initiateTrade();

        vm.prank(alice);
        escrow.cancelTrade(tradeId);

        assertEq(nft.ownerOf(1), alice);
    }

    function testReentrancyProtection() public {
        // 攻撃者のコントラクトをデプロイ
        ReentrancyAttacker attacker = new ReentrancyAttacker(address(escrow), address(token));

        // 攻撃者に十分なトークンを付与
        token.mint(address(attacker), 1_000_000 ether);

        // アリスがトレードを開始し、攻撃者を相手方として設定
        vm.startPrank(alice);
        nft.approve(address(escrow), 1);
        FlexibleEscrow.Asset memory aliceAsset = FlexibleEscrow.Asset(FlexibleEscrow.TokenType.ERC721, address(nft), 1, 0);
        FlexibleEscrow.Asset memory attackerAsset = FlexibleEscrow.Asset(FlexibleEscrow.TokenType.ERC20, address(token), 0, 100 ether);
        bytes32 tradeId = escrow.initiateTrade(address(attacker), aliceAsset, attackerAsset);
        vm.stopPrank();

        // 攻撃者がトレードを承認しようとする
        vm.prank(address(attacker));
        attacker.attack(tradeId);

        // トレードの最終状態を確認
        (,,,, bool finalInitiatorApproved, bool finalCounterpartyApproved) = escrow.trades(tradeId);
        assertEq(finalInitiatorApproved, true, "Initiator approval should remain true");
        assertEq(finalCounterpartyApproved, true, "Counterparty approval should be true");

        // 攻撃が失敗したことを確認（リエントランシー攻撃が防止されたことを確認）
        assertEq(attacker.attackSucceeded(), false, "Reentrancy attack should not succeed");

        // 攻撃回数を確認
        assertEq(attacker.attackCount(), 1, "Attack should be attempted once");

        // NFTの所有者を確認
        assertEq(nft.ownerOf(1), address(attacker), "NFT should be transferred to the attacker");
    }

    function testFeeCollection() public {
        bytes32 tradeId = _initiateTrade();

        assertEq(token.balanceOf(alice), 1000 ether, "Alice's initial balance incorrect");
        assertEq(token.balanceOf(bob), 1000 ether, "Bob's initial balance incorrect");
        assertEq(token.balanceOf(escrow.owner()), 1_000_000 ether, "Owner's initial balance incorrect");

        vm.startPrank(bob);
        token.approve(address(escrow), 100 ether);
        escrow.approveTrade(tradeId);
        vm.stopPrank();

        assertEq(token.balanceOf(escrow.owner()), 1_000_001 ether); // 1% fee
        assertEq(token.balanceOf(alice), 1099 ether); // 1000 + 99 (100 - 1% fee)
    }

    function testSetFeePercentage() public {
        vm.prank(escrow.owner());
        escrow.setFeePercentage(2);
        assertEq(escrow.feePercentage(), 2);

        vm.expectRevert("Only owner can set fee");
        vm.prank(alice);
        escrow.setFeePercentage(3);

        vm.prank(escrow.owner());
        vm.expectRevert("Fee percentage too high");
        escrow.setFeePercentage(11);
    }

    function testGetTrade() public {
        bytes32 tradeId = _initiateTrade();

        FlexibleEscrow.Trade memory trade = escrow.getTrade(tradeId);
        assertEq(trade.initiator, alice);
        assertEq(trade.counterparty, bob);
        assertEq(uint8(trade.initiatorAsset.tokenType), uint8(FlexibleEscrow.TokenType.ERC721));
        assertEq(trade.initiatorAsset.tokenAddress, address(nft));
        assertEq(trade.initiatorAsset.tokenId, 1);
        assertEq(uint8(trade.counterpartyAsset.tokenType), uint8(FlexibleEscrow.TokenType.ERC20));
        assertEq(trade.counterpartyAsset.tokenAddress, address(token));
        assertEq(trade.counterpartyAsset.amount, 100 ether);
    }

    function testGetTradeStatus() public {
        bytes32 tradeId = _initiateTrade();
        assertEq(uint8(escrow.getTradeStatus(tradeId)), uint8(FlexibleEscrow.TradeStatus.Initiated));

        vm.startPrank(bob);
        token.approve(address(escrow), 100 ether);
        escrow.approveTrade(tradeId);
        vm.stopPrank();

        assertEq(uint8(escrow.getTradeStatus(tradeId)), uint8(FlexibleEscrow.TradeStatus.Completed));

        bytes32 nonExistentTradeId = keccak256(abi.encodePacked("non-existent"));
        assertEq(uint8(escrow.getTradeStatus(nonExistentTradeId)), uint8(FlexibleEscrow.TradeStatus.NonExistent));
    }

    function _initiateTrade() internal returns (bytes32) {
        vm.startPrank(alice);
        nft.approve(address(escrow), 1);
        FlexibleEscrow.Asset memory aliceAsset = FlexibleEscrow.Asset(FlexibleEscrow.TokenType.ERC721, address(nft), 1, 0);
        FlexibleEscrow.Asset memory bobAsset = FlexibleEscrow.Asset(FlexibleEscrow.TokenType.ERC20, address(token), 0, 100 ether);
        bytes32 tradeId = escrow.initiateTrade(bob, aliceAsset, bobAsset);
        vm.stopPrank();
        return tradeId;
    }
}