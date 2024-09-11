import { useAccount, useChainId } from "wagmi";
import { Alchemy, OwnedNft } from "alchemy-sdk";
import { useEffect, useMemo, useState } from "react";
import { getNetworkFromChainId } from "@/utils";
import { Button } from "@/components/ui/button";
import { Clipboard, Check } from "lucide-react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Layout } from "@/components/Layout";

const StepFlow = ({ currentStep }: { currentStep: number }) => {
  const steps = ["自分のNFT選択", "交換NFT選択", "確認", "取引リンク"];
  return (
    <div className="flex justify-between items-center w-full max-w-3xl mx-auto mb-8 px-4">
      {steps.map((step, index) => (
        <div key={index} className="flex flex-col items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              index + 1 <= currentStep ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            {index + 1}
          </div>
          <span className="text-xs mt-1">{step}</span>
        </div>
      ))}
    </div>
  );
};

const Step1 = ({
  nfts,
  selectMyNft,
  address,
}: {
  nfts: OwnedNft[];
  selectMyNft: (nft: OwnedNft) => void;
  address: string | undefined;
}) => {
  const { openConnectModal } = useConnectModal();
  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center px-4 space-y-4">
        <h2 className="text-2xl font-bold">ウォレットを接続してください</h2>
        <Button onClick={openConnectModal} className="w-full h-16 text-lg rounded-3xl">
          Walletを接続
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-4 space-y-4">
      <h2 className="text-2xl font-bold">自分のNFTを選択してください</h2>
      {nfts.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full max-w-3xl">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="w-full aspect-square bg-gray-200 animate-pulse rounded-lg">
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full max-w-3xl">
          {nfts.map((nft) => (
            <div
              key={nft.tokenId}
              className="flex justify-center cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => selectMyNft(nft)}
            >
              <img
                src={nft.image.cachedUrl ?? nft.image.thumbnailUrl}
                alt={nft.tokenId}
                className="w-full h-auto rounded-lg shadow-md"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Step2 = ({ nfts, selectTradeNft }: { nfts: OwnedNft[]; selectTradeNft: (nft: OwnedNft) => void }) => {
  return (
    <div className="flex flex-col items-center justify-center px-4 space-y-4">
      <h2 className="text-2xl font-bold">交換するNFTを選択してください</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full max-w-3xl">
        {nfts.map((nft) => (
          <div
            key={nft.tokenId}
            className="flex justify-center cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => selectTradeNft(nft)}
          >
            <img
              src={nft.image.cachedUrl ?? nft.image.thumbnailUrl}
              alt={nft.tokenId}
              className="w-full h-auto rounded-lg shadow-md"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const Step3 = ({ selectedNfts, setStep }: { selectedNfts: OwnedNft[]; setStep: (step: number) => void }) => {
  return (
    <div className="flex flex-col items-center justify-center px-4 space-y-8 w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold">選択したNFTの確認</h2>
      <div className="flex justify-around w-full">
        {selectedNfts.map((nft, index) => (
          <div key={nft.tokenId} className="flex flex-col items-center">
            <img
              src={nft.image.cachedUrl ?? nft.image.thumbnailUrl}
              alt={nft.tokenId}
              className="w-32 h-32 object-cover rounded-lg shadow-md"
            />
            <span className="mt-2 text-sm font-semibold">{index === 0 ? "自分のNFT" : "交換NFT"}</span>
          </div>
        ))}
      </div>
      <Button onClick={() => setStep(4)} className="w-full h-16 text-lg rounded-3xl">
        取引の作成
      </Button>
    </div>
  );
};

const Step4 = () => {
  const [copied, setCopied] = useState(false);
  const onCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center px-4 space-y-8 w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold">取引リンクをshare！</h2>
      <div
        onClick={onCopy}
        className="flex items-center space-x-2 bg-gray-100 p-3 rounded-md cursor-pointer hover:bg-gray-200 transition-colors"
      >
        {copied ? <Check size={20} className="text-green-500" /> : <Clipboard size={20} className="text-blue-500" />}
        <p className="text-blue-500 font-medium">https://escrow.example.com/trade/hogehoge</p>
      </div>
    </div>
  );
};

export const TradePage = () => {
  const [step, setStep] = useState<number>(1);
  const [nfts, setNfts] = useState<OwnedNft[]>([]);
  const [selectedNfts, setSelectedNfts] = useState<OwnedNft[]>([]);
  const chainId = useChainId();
  const { address } = useAccount();
  const alchemy = useMemo(
    () =>
      new Alchemy({
        apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
        network: getNetworkFromChainId(chainId),
      }),
    [chainId]
  );

  const selectMyNft = (nft: OwnedNft) => {
    setSelectedNfts((prev) => [...prev, nft]);
    setStep(2);
  };

  const selectTradeNft = (nft: OwnedNft) => {
    setSelectedNfts((prev) => [...prev, nft]);
    setStep(3);
  };

  useEffect(() => {
    if (!address) return;
    const fetchNfts = async () => {
      const { ownedNfts } = await alchemy.nft.getNftsForOwner(address);
      setNfts(ownedNfts);
    };
    fetchNfts();
  }, [alchemy, address]);

  return (
    <Layout>
      <main className="flex flex-col min-h-[calc(100dvh-160px)] py-8">
        <StepFlow currentStep={step} />
        {step === 1 && <Step1 nfts={nfts} selectMyNft={selectMyNft} address={address} />}
        {step === 2 && <Step2 nfts={nfts} selectTradeNft={selectTradeNft} />}
        {step === 3 && <Step3 selectedNfts={selectedNfts} setStep={setStep} />}
        {step === 4 && <Step4 />}
      </main>
    </Layout>
  );
};
