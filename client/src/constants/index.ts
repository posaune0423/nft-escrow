import { isPrd } from "@/utils";
import { polygonAmoy, polygon, mainnet, arbitrum, base, optimism, bsc, astar } from "wagmi/chains";

export const APP_NAME = "エスクロー";
export const APP_DESCRIPTION = "エスクローでは、NFTやトークンの個人間取引を安全かつ簡単に行うことができます。";

export const supportedChains = isPrd
  ? ([polygon, mainnet, base, arbitrum, optimism, bsc, astar] as const)
  : ([polygonAmoy] as const);
