import Link from "next/link";
import { APP_NAME } from "@/constants";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export const Header = () => {
  return (
    <header className="px-4 lg:px-6 flex items-center justify-between py-3 h-[90px]">
      <Link href="/" className="flex items-center justify-center">
        <h1 className="text-xl font-bold text-primary font-delaGothicOne">{APP_NAME}</h1>
      </Link>

      <ConnectButton label="Walletを接続" />
    </header>
  );
};
