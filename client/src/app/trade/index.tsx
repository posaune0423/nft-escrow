import { Layout } from "@/components/Layout";
import { useAccount, useChainId } from "wagmi";
import { Alchemy, OwnedNft } from "alchemy-sdk";
import { useEffect, useMemo, useState } from "react";
import { getNetworkFromChainId } from "@/utils";
import { Button } from "@/components/ui/button";
import { Clipboard, Check } from "lucide-react";

const Step1 = ({ nfts, selectMyNft }: { nfts: OwnedNft[]; selectMyNft: (nft: OwnedNft) => void }) => {
  return (
    <main className="flex flex-col min-h-[100dvh]">
      <div className="flex flex-col items-center justify-center h-full px-4 space-y-4">
        <h1 className="text-3xl font-bold">自分のNFTを選択してください</h1>
        <div className="grid grid-cols-2 gap-4 items-center justify-center h-full">
          {nfts.map((nft) => (
            <div key={nft.tokenId} className="flex justify-center" onClick={() => selectMyNft(nft)}>
              <img
                src={nft.image.cachedUrl ?? nft.image.thumbnailUrl}
                alt={nft.tokenId}
                className="max-w-full h-auto"
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

const Step2 = ({ nfts, selectTradeNft }: { nfts: OwnedNft[]; selectTradeNft: (nft: OwnedNft) => void }) => {
  return (
    <main className="flex flex-col min-h-[100dvh]">
      <div className="flex flex-col items-center justify-center h-full px-4 space-y-4">
        <h1 className="text-3xl font-bold">交換するNFTを選択してください</h1>
        <div className="grid grid-cols-2 gap-4 items-center justify-center h-full">
          {nfts.map((nft) => (
            <div key={nft.tokenId} className="flex justify-center" onClick={() => selectTradeNft(nft)}>
              <img
                src={nft.image.cachedUrl ?? nft.image.thumbnailUrl}
                alt={nft.tokenId}
                className="max-w-full h-auto"
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

const Step3 = ({ selectedNfts, setStep }: { selectedNfts: OwnedNft[]; setStep: (step: number) => void }) => {
  return (
    <main className="flex flex-col min-h-[calc(100dvh-160px)] space-y-4">
      <div className="flex items-center justify-around px-4 h-28">
        {selectedNfts.map((nft) => (
          <div key={nft.tokenId} className="flex items-center justify-around h-full">
            <img
              src={nft.image.cachedUrl ?? nft.image.thumbnailUrl}
              alt={nft.tokenId}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center h-full px-4">
        <Button onClick={() => setStep(4)} className="w-full h-10">
          取引の作成
        </Button>
      </div>
    </main>
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
    <main className="flex flex-col min-h-[calc(100dvh-160px)]">
      <div className="flex flex-col items-center justify-center h-full px-4 space-y-4">
        <h1 className="text-3xl font-bold">取引リンクをshare！</h1>
        <div onClick={onCopy} className="flex items-center space-x-2">
          {copied ? <Check size={16} /> : <Clipboard size={16} />}
          <p className="bg-gray-100 p-2 rounded-md text-blue-500">https://trade.example.com</p>
        </div>
      </div>
    </main>
  );
};

export const Trade = () => {
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
      {step === 1 && <Step1 nfts={nfts} selectMyNft={selectMyNft} />}
      {step === 2 && <Step2 nfts={nfts} selectTradeNft={selectTradeNft} />}
      {step === 3 && <Step3 selectedNfts={selectedNfts} setStep={setStep} />}
      {step === 4 && <Step4 />}
    </Layout>
  );
};
