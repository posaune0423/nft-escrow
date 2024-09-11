import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Network } from "alchemy-sdk";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getNetworkFromChainId(chainId: number): Network {
  switch (chainId) {
    case 1:
      return Network.ETH_MAINNET;
    case 11155111:
      return Network.ETH_SEPOLIA;
    case 10:
      return Network.OPT_MAINNET;
    case 11155420:
      return Network.OPT_SEPOLIA;
    case 42161:
      return Network.ARB_MAINNET;
    case 421614:
      return Network.ARB_SEPOLIA;
    case 137:
      return Network.MATIC_MAINNET;
    case 80002:
      return Network.MATIC_AMOY;
    case 592:
      return Network.ASTAR_MAINNET;
    case 1101:
      return Network.POLYGONZKEVM_MAINNET;
    case 8453:
      return Network.BASE_MAINNET;
    case 84532:
      return Network.BASE_SEPOLIA;
    case 324:
      return Network.ZKSYNC_MAINNET;
    case 300:
      return Network.ZKSYNC_SEPOLIA;
    case 59144:
      return Network.LINEA_MAINNET;
    case 59140:
      return Network.LINEA_SEPOLIA;
    case 250:
      return Network.FANTOM_MAINNET;
    case 4002:
      return Network.FANTOM_TESTNET;
    case 7000:
      return Network.ZETACHAIN_MAINNET;
    case 7001:
      return Network.ZETACHAIN_TESTNET;
    case 42170:
      return Network.ARBNOVA_MAINNET;
    case 81457:
      return Network.BLAST_MAINNET;
    case 168587773:
      return Network.BLAST_SEPOLIA;
    case 5000:
      return Network.MANTLE_MAINNET;
    case 5001:
      return Network.MANTLE_SEPOLIA;
    case 534352:
      return Network.SCROLL_MAINNET;
    case 534351:
      return Network.SCROLL_SEPOLIA;
    case 100:
      return Network.GNOSIS_MAINNET;
    case 10200:
      return Network.GNOSIS_CHIADO;
    case 56:
      return Network.BNB_MAINNET;
    case 97:
      return Network.BNB_TESTNET;
    case 43114:
      return Network.AVAX_MAINNET;
    case 43113:
      return Network.AVAX_FUJI;
    case 42220:
      return Network.CELO_MAINNET;
    case 44787:
      return Network.CELO_ALFAJORES;
    case 1088:
      return Network.METIS_MAINNET;
    case 204:
      return Network.OPBNB_MAINNET;
    case 5611:
      return Network.OPBNB_TESTNET;
    default:
      throw new Error(`Unsupported chainId: ${chainId}`);
  }
}

export const extractError = (errorText: string) => {
  const detailsMatch = errorText.match(/Details:\s*(.*?)(?:\n|$)/);
  return detailsMatch ? detailsMatch[1].trim() : null;
};
