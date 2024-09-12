import { Button } from "@/components/ui/button";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export const WalletConnectScreen = () => {
  const { openConnectModal } = useConnectModal();
  return (
    <main className="flex flex-col justify-between min-h-[calc(100dvh-180px)] py-8 max-w-md mx-auto px-4">
      <h2 className="text-2xl font-bold">ウォレットを接続してください</h2>

      <Button onClick={openConnectModal} className="w-full h-14 md:h-16 text-lg rounded-3xl">
        Walletを接続
      </Button>
    </main>
  );
};
