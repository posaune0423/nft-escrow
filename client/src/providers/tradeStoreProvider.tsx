// src/providers/counter-store-provider.tsx
"use client";

import { type ReactNode, createContext, useRef, useContext } from "react";
import { useStore } from "zustand";

import { type TradeStore, createTradeStore } from "@/stores/tradeStore";

export type TradeStoreApi = ReturnType<typeof createTradeStore>;

export const TradeStoreContext = createContext<TradeStoreApi | undefined>(undefined);

export interface TradeStoreProviderProps {
  children: ReactNode;
}

export const TradeStoreProvider = ({ children }: TradeStoreProviderProps) => {
  const storeRef = useRef<TradeStoreApi>();
  if (!storeRef.current) {
    storeRef.current = createTradeStore();
  }

  return <TradeStoreContext.Provider value={storeRef.current}>{children}</TradeStoreContext.Provider>;
};

export const useTradeStore = <T,>(selector: (store: TradeStore) => T): T => {
  const tradeStoreContext = useContext(TradeStoreContext);

  if (!tradeStoreContext) {
    throw new Error(`useTradeStore must be used within TradeStoreProvider`);
  }

  return useStore(tradeStoreContext, selector);
};
