import { createStore } from "zustand/vanilla";
import { type Nft, type OwnedNft } from "alchemy-sdk";
import { type Address } from "viem";

interface TradeState {
  selectedNfts: (OwnedNft | Nft)[];
  counterPartyAddress: Address;
  exchangeType: "NFT" | "FT";
  contractAddress: string;
  tokenId: string;
  amount: string;
  tradeId: string;
}

interface TradeActions {
  setSelectedNfts: (nfts: (OwnedNft | Nft)[]) => void;
  setCounterPartyAddress: (address: Address) => void;
  setExchangeType: (type: "NFT" | "FT") => void;
  setContractAddress: (address: string) => void;
  setTokenId: (id: string) => void;
  setAmount: (amount: string) => void;
  setTradeId: (id: string) => void;
}

export type TradeStore = TradeState & TradeActions;

const defaultInitState: TradeState = {
  selectedNfts: [],
  counterPartyAddress: "0x64473e07c7A53a632DDE287CA2e6c3c1aC15Af29",
  exchangeType: "NFT",
  contractAddress: "",
  tokenId: "",
  amount: "",
  tradeId: "",
};

export const createTradeStore = (initState: TradeState = defaultInitState) => {
  return createStore<TradeStore>()((set) => ({
    ...initState,
    setSelectedNfts: (nfts) => set({ selectedNfts: nfts }),
    setCounterPartyAddress: (address) => set({ counterPartyAddress: address }),
    setExchangeType: (type) => set({ exchangeType: type }),
    setContractAddress: (address) => set({ contractAddress: address }),
    setTokenId: (id) => set({ tokenId: id }),
    setAmount: (amount) => set({ amount }),
    setTradeId: (id) => set({ tradeId: id }),
  }));
};
