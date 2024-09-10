import "./index.scss";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Trade } from "./app/trade";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/trade",
    element: <Trade />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
