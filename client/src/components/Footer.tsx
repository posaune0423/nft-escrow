import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
      <p className="text-xs text-muted-foreground">&copy; 2024 NFT Trade. All rights reserved.</p>
      <nav className="sm:ml-auto flex gap-4 sm:gap-6">
        <Link to="/trade" className="text-xs hover:underline underline-offset-4">
          Privacy
        </Link>
        <Link to="/trade" className="text-xs hover:underline underline-offset-4">
          Terms of Service
        </Link>
      </nav>
    </footer>
  );
};
