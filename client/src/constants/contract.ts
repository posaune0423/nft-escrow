import { Network } from "alchemy-sdk";
import { Address } from "viem";

export const CONTRACT_ADDRESS: Partial<Record<Network, Address>> = {
  "eth-mainnet": "0x0",
  "polygon-amoy": "0x920A56FD50E35914F677dE1A427C6897D0f2D315",
  "opt-mainnet": "0x0",
  "arb-mainnet": "0x0",
  "base-mainnet": "0x0",
};