import { supportedChains } from "@/constants";
import { createPublicClient, http } from "viem";

export const createClient = (chainId: number) =>
  createPublicClient({
    chain: supportedChains.find((chain) => chain.id === chainId),
    transport: http(),
  });
