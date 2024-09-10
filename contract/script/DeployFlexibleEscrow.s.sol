// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/FlexibleEscrow.sol";

contract DeployFlexibleEscrow is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        FlexibleEscrow flexibleEscrow = new FlexibleEscrow();
        vm.stopBroadcast();
    }
}