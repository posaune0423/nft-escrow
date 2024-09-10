import { Link } from "react-router-dom";
import { APP_NAME } from "@/constants";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export const Header = () => {
  return (
    <header className="px-4 lg:px-6 flex items-center py-3 h-[70px]">
      <Link to="/" className="flex items-center justify-center">
        <h1 className="text-xl font-bold">{APP_NAME}</h1>
      </Link>
      <div className="ml-auto flex gap-4 sm:gap-6">
        <ConnectButton />
      </div>
    </header>
  );
};
