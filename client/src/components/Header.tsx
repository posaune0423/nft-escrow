import { MenuIcon, WalletIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Link } from "react-router-dom";
import { useState } from "react";

export const Header = () => {
  const [walletConnected, setWalletConnected] = useState(false);

  return (
    <header className="px-4 lg:px-6 h-14 flex items-center">
      <Link to="/" className="flex items-center justify-center">
        <h1 className="text-xl font-bold">NFT Trade</h1>
      </Link>
      <div className="ml-auto flex gap-4 sm:gap-6">
        <Button onClick={() => setWalletConnected(true)} className={walletConnected ? "hidden" : ""}>
          <WalletIcon className="h-4 w-4 mr-2" />
          Connect Wallet
        </Button>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className={walletConnected ? "" : "hidden"}>
              <MenuIcon className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="grid gap-2 py-6">
              <Link to="/trade" className="flex w-full items-center py-2 text-lg font-semibold">
                About
              </Link>
              <Collapsible className="grid gap-4">
                <CollapsibleTrigger className="flex w-full items-center text-lg font-semibold [&[data-state=open]>svg]:rotate-90">
                  Features <ChevronRightIcon className="ml-auto h-5 w-5 transition-all" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="-mx-6 grid gap-6 bg-muted p-6">
                    <Link to="/trade" className="group grid h-auto w-full justify-start gap-1">
                      <div className="text-sm font-medium leading-none group-hover:underline">Analytics</div>
                      <div className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Upgrade your reporting with advanced analytics.
                      </div>
                    </Link>
                    <Link to="/trade" className="group grid h-auto w-full justify-start gap-1">
                      <div className="text-sm font-medium leading-none group-hover:underline">Developer Tools</div>
                      <div className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Extend your application with our developer tools.
                      </div>
                    </Link>
                    <Link to="/trade" className="group grid h-auto w-full justify-start gap-1">
                      <div className="text-sm font-medium leading-none group-hover:underline">
                        Security &amp; Compliance
                      </div>
                      <div className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Keep your data secure with our security features.
                      </div>
                    </Link>
                    <Link to="/trade" className="group grid h-auto w-full justify-start gap-1">
                      <div className="text-sm font-medium leading-none group-hover:underline">Scalability</div>
                      <div className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Scale your application with our infrastructure.
                      </div>
                    </Link>
                  </div>
                </CollapsibleContent>
              </Collapsible>
              <Link to="/trade" className="flex w-full items-center py-2 text-lg font-semibold">
                Pricing
              </Link>
              <Collapsible className="grid gap-4">
                <CollapsibleTrigger className="flex w-full items-center text-lg font-semibold [&[data-state=open]>svg]:rotate-90">
                  Resources <ChevronRightIcon className="ml-auto h-5 w-5 transition-all" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="-mx-6 grid gap-6 bg-muted p-6">
                    <Link to="/trade" className="group grid h-auto w-full justify-start gap-1">
                      <div className="text-sm font-medium leading-none group-hover:underline">Blog Posts</div>
                      <div className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Read our latest blog posts.
                      </div>
                    </Link>
                    <Link to="/trade" className="group grid h-auto w-full justify-start gap-1">
                      <div className="text-sm font-medium leading-none group-hover:underline">Case Studies</div>
                      <div className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Read our customer case studies.
                      </div>
                    </Link>
                    <Link to="/trade" className="group grid h-auto w-full justify-start gap-1">
                      <div className="text-sm font-medium leading-none group-hover:underline">Documentation</div>
                      <div className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Learn how to use our product.
                      </div>
                    </Link>
                    <Link to="/trade" className="group grid h-auto w-full justify-start gap-1">
                      <div className="text-sm font-medium leading-none group-hover:underline">Help Center</div>
                      <div className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Get help with our product.
                      </div>
                    </Link>
                  </div>
                </CollapsibleContent>
              </Collapsible>
              <Link to="/trade" className="flex w-full items-center py-2 text-lg font-semibold">
                Contact
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};
