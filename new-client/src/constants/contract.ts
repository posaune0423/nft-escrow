import { Network } from "alchemy-sdk";
import { Address } from "viem";

export const CONTRACT_ADDRESS: Partial<Record<Network, Address>> = {
  "eth-mainnet": "0x0",
  "polygon-amoy": "0x81780C437D01d5dDFED6b47531A5439184423b4D",
  "opt-mainnet": "0x0",
  "arb-mainnet": "0x0",
  "base-mainnet": "0x0",
};