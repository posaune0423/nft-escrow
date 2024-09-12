"use client";

import { getDefaultConfig, RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { APP_NAME, supportedChains } from "@/constants";
import { Toaster } from "@/components/ui/sonner";
import { TradeStoreProvider } from "@/providers/tradeStoreProvider";

const config = getDefaultConfig({
  appName: APP_NAME,
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
  chains: supportedChains,
});

const queryClient = new QueryClient();
export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          appInfo={{
            appName: APP_NAME,
          }}
          theme={lightTheme({
            accentColor: "#E11D48",
            accentColorForeground: "#FAFAFA",
            borderRadius: "medium",
          })}
        >
          <TradeStoreProvider>{children}</TradeStoreProvider>
          <Toaster position="top-right" closeButton richColors />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
