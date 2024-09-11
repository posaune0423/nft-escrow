import "./index.scss";
import "@rainbow-me/rainbowkit/styles.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { TopPage } from "./app";
import { TradePage } from "./app/trade";
import { getDefaultConfig, RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { polygonAmoy } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { APP_NAME } from "./constants";
import { Toaster } from "./components/ui/sonner";

const router = createBrowserRouter([
  {
    path: "/",
    element: <TopPage />,
  },
  {
    path: "/trade",
    element: <TradePage />,
  },
]);

const config = getDefaultConfig({
  appName: APP_NAME,
  projectId: "YOUR_PROJECT_ID",
  chains: [polygonAmoy],
  // chains: [mainnet, polygon, optimism, arbitrum, base],
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
