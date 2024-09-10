// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
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

        escrow.initiateTrade(bob, aliceAsset, bobAsset);
        vm.stopPrank();

        assertEq(nft.ownerOf(1), address(escrow));
        assertEq(escrow.tradeCounter(), 1);
    }

    function testApproveTrade() public {
        testInitiateTrade();

        vm.startPrank(bob);
        token.approve(address(escrow), 100 ether);
        escrow.approveTrade(0);
        vm.stopPrank();

        // アサーション
        assertEq(nft.ownerOf(1), address(bob), "NFT should be transferred to Bob");
        assertEq(token.balanceOf(alice), 1099 ether, "Alice should receive 99 ether (minus 1% fee)");
        assertEq(token.balanceOf(address(escrow.owner())), 1_000_001 ether, "Owner should receive 1 ether as fee");
    }

    function testCancelTrade() public {
        testInitiateTrade();

        vm.prank(alice);
        escrow.cancelTrade(0);

        assertEq(nft.ownerOf(1), alice);
    }

    function testReentrancyProtection() public {
        // 攻撃者のコントラクトをデプロイ
        ReentrancyAttacker attacker = new ReentrancyAttacker(address(escrow), address(token));

        // 攻撃者に十分なトークンを付与
        token.mint(address(attacker), 1_000_000 ether);

        // アリスがNFTをエスクローに預ける
        vm.startPrank(alice);
        nft.approve(address(escrow), 1);
        FlexibleEscrow.Asset memory aliceAsset = FlexibleEscrow.Asset(FlexibleEscrow.TokenType.ERC721, address(nft), 1, 0);
        FlexibleEscrow.Asset memory attackerAsset = FlexibleEscrow.Asset(FlexibleEscrow.TokenType.ERC20, address(token), 0, 100 ether);
        escrow.initiateTrade(address(attacker), aliceAsset, attackerAsset);
        vm.stopPrank();

        // トレードの初期状態を確認
        (,,,, bool initialInitiatorApproved, bool initialCounterpartyApproved) = escrow.trades(0);
        assertEq(initialInitiatorApproved, true, "Initiator should be approved initially");
        assertEq(initialCounterpartyApproved, false, "Counterparty should not be approved initially");

        // 攻撃者がトレードを承認しようとする
        vm.prank(address(attacker));
        attacker.attack(0);

        // トレードの最終状態を確認
        (,,,, bool finalInitiatorApproved, bool finalCounterpartyApproved) = escrow.trades(0);
        assertEq(finalInitiatorApproved, false, "Initiator approval should be reset after trade completion");
        assertEq(finalCounterpartyApproved, false, "Counterparty approval should be reset after trade completion");

        // 攻撃が失敗したことを確認
        assertEq(attacker.attackSucceeded(), false, "Reentrancy attack should not succeed");

        // 攻撃回数を確認
        assertEq(attacker.attackCount(), 1, "Attack should be attempted once");

        // NFTの所有者を確認
        assertEq(nft.ownerOf(1), address(attacker), "NFT should be transferred to attacker");
    }

    function testFeeCollection() public {
        testInitiateTrade();

        assertEq(token.balanceOf(alice), 1000 ether, "Alice's initial balance incorrect");
        assertEq(token.balanceOf(bob), 1000 ether, "Bob's initial balance incorrect");
        assertEq(token.balanceOf(escrow.owner()), 1_000_000 ether, "Owner's initial balance incorrect");


        vm.startPrank(bob);
        token.approve(address(escrow), 100 ether);
        escrow.approveTrade(0);
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
}