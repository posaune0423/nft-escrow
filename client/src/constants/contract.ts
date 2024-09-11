import { Network } from "alchemy-sdk";
import { Address } from "viem";

export const CONTRACT_ADDRESS: Partial<Record<Network, Address>> = {
  "eth-mainnet": "0x0",
  "polygon-amoy": "0x711D8F87886f251F49A2b8d3Ca09d2e443C538e3",
  "opt-mainnet": "0x0",
  "arb-mainnet": "0x0",
  "base-mainnet": "0x0",
};