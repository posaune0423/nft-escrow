// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../src/FlexibleEscrow.sol";
import "openzeppelin-contracts/contracts/token/ERC721/IERC721Receiver.sol";
import "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

contract ReentrancyAttacker is IERC721Receiver {
    FlexibleEscrow public escrow;
    uint256 public attackCount;
    bytes32 public tradeId; // uint256からbytes32に変更
    IERC20 public token;
    bool public attackSucceeded;

    constructor(address _escrow, address _token) {
        escrow = FlexibleEscrow(_escrow);
        token = IERC20(_token);
    }

    function attack(bytes32 _tradeId) external { // uint256からbytes32に変更
        tradeId = _tradeId;
        token.approve(address(escrow), type(uint256).max);
        escrow.approveTrade(tradeId);
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public override returns (bytes4) {
        attackCount++;
        try escrow.approveTrade(tradeId) {
            attackSucceeded = true;
        } catch {
            attackSucceeded = false;
        }
        return this.onERC721Received.selector;
    }
}
