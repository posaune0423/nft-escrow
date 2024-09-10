// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {NFTEscrow} from "../src/NFTEscrow.sol";
import {MockERC721} from "./mocks/MockERC721.sol";

contract NFTEscrowTest is Test {
    NFTEscrow public escrow;
    MockERC721 public token1;
    MockERC721 public token2;
    address public user1;
    address public user2;

    function setUp() public {
        // Setup users
        user1 = address(0x1);
        user2 = address(0x2);

        // Deploy mock ERC721 tokens
        token1 = new MockERC721();
        token2 = new MockERC721();

        // Mint tokens to users
        token1.mint(user1, 1); // Mint tokenId 1 to user1
        token2.mint(user2, 2); // Mint tokenId 2 to user2

        // Deploy the escrow contract
        escrow = new NFTEscrow();
    }

    function test_InitiateTrade() public {
        // User1 initiates a trade
        vm.prank(user1);
        token1.approve(address(escrow), 1); // Approve escrow to transfer user1's token
        escrow.initiateTrade(user2, token1, 1, token2, 2);

        // Verify the trade was created
        (
            address initiator,
            address counterparty,
            ,
            ,
            ,
            ,
            bool initiatorApproved,
            bool counterpartyApproved
        ) = escrow.trades(0);
        assertEq(initiator, user1);
        assertEq(counterparty, user2);
        assertFalse(initiatorApproved);
        assertFalse(counterpartyApproved);
    }

    function test_ApproveAndCompleteTrade() public {
        // User1 initiates a trade
        vm.prank(user1);
        token1.approve(address(escrow), 1);
        escrow.initiateTrade(user2, token1, 1, token2, 2);

        // User2 approves the trade
        vm.prank(user2);
        token2.approve(address(escrow), 2);
        escrow.approveTrade(0);

        // User1 approves the trade
        vm.prank(user1);
        escrow.approveTrade(0);

        // Check the ownership of the tokens has been swapped
        assertEq(token1.ownerOf(1), user2);
        assertEq(token2.ownerOf(2), user1);
    }

    function test_CancelTrade() public {
        // User1 initiates a trade
        vm.prank(user1);
        token1.approve(address(escrow), 1);
        escrow.initiateTrade(user2, token1, 1, token2, 2);

        // User1 cancels the trade
        vm.prank(user1);
        escrow.cancelTrade(0);

        // Verify the trade was cancelled
        (address initiator, , , , , , , ) = escrow.trades(0);
        assertEq(initiator, address(0)); // Trade should be cleared
    }
}
