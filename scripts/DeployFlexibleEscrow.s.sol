// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "../lib/forge-std/Script.sol";
import "../contract/src/FlexibleEscrow.sol";

contract DeployFlexibleEscrow is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startFork(vm.envString("SEPOLIA_RPC_URL"));

        FlexibleEscrow flexibleEscrow = new FlexibleEscrow();

        vm.stopBroadcast();

        console.log("FlexibleEscrow deployed to:", address(flexibleEscrow));
    }
}