// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../src/FlexibleEscrow.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ReentrancyAttacker is IERC721Receiver {
    FlexibleEscrow public escrow;
    uint256 public attackCount;
    uint256 public tradeId;
    IERC20 public token;

    constructor(address _escrow, address _token) {
        escrow = FlexibleEscrow(_escrow);
        token = IERC20(_token);
    }

    function attack(uint256 _tradeId) external {
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
        if (attackCount == 1) {
            try escrow.approveTrade(tradeId) {
                // 攻撃が成功した場合（ここには到達しないはず）
            } catch {
                // 攻撃が失敗した場合（期待される結果）
            }
        }
        return this.onERC721Received.selector;
    }
}