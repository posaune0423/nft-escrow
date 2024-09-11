import { Link } from "react-router-dom";
import { APP_NAME } from "@/constants";

import { Button } from "./ui/button";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export const Header = () => {
  const { openConnectModal } = useConnectModal();

  return (
    <header className="px-4 lg:px-6 flex items-center justify-between py-3 h-[90px]">
      <Link to="/" className="flex items-center justify-center">
        <h1 className="text-xl font-bold text-primary font-delaGothicOne">{APP_NAME}</h1>
      </Link>

      <Button onClick={openConnectModal} className="py-3">Walletを接続</Button>
    </header>
  );
};
