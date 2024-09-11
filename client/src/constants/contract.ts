import { Network } from "alchemy-sdk";
import { Address } from "viem";

export const CONTRACT_ADDRESS: Partial<Record<Network, Address>> = {
  "eth-mainnet": "0x0",
  "polygon-amoy": "0x398591598e17AAD0954E082e3e06F2fFF634C9C6",
  "opt-mainnet": "0x0",
  "arb-mainnet": "0x0",
  "base-mainnet": "0x0",
};
