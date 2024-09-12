import "./index.scss";
import "@rainbow-me/rainbowkit/styles.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { TopPage } from "./app";
import { TradePage } from "./app/trade";
import { TermsOfServicePage } from "./app/terms-of-service";
import { getDefaultConfig, RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { polygonAmoy } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { APP_NAME } from "./constants";
import { Toaster } from "./components/ui/sonner";
import { TradeDetailPage } from "./app/trade/detail";

const router = createBrowserRouter([
  {
    path: "/",
    element: <TopPage />,
  },
  {
    path: "/trade",
    element: <TradePage />,
  },
  {
    path: "/trade/:tradeId",
    element: <TradeDetailPage />,
  },
  {
    path: "/terms-of-service",
    element: <TermsOfServicePage />,
  },
]);

const config = getDefaultConfig({
  appName: APP_NAME,
  projectId: "YOUR_PROJECT_ID",
  // chains: [polygon, optimism, arbitrum, base, mainnet],
  chains: [polygonAmoy],
});

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
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
          <RouterProvider router={router} />
          <Toaster position="top-right" closeButton richColors />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>
);
