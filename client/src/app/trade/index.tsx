import { Layout } from "@/components/Layout";
import { useAccount, useChainId, useReadContract, useWriteContract, useWaitForTransactionReceipt} from "wagmi";
import { abi } from '@/constants/abi';
import { parseEther } from "viem";
import { Alchemy, OwnedNft } from "alchemy-sdk";
import { useEffect, useMemo, useState } from "react";
import { getNetworkFromChainId } from "@/utils";
import { Button } from "@/components/ui/button";
import { Clipboard, Check } from "lucide-react";

const contractAddress = '0x398591598e17aad0954e082e3e06f2fff634c9c6';


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
  const { address } = useAccount();
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const [isLoading, setIsLoading] = useState(false);

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const handleCreateTrade = async () => {
    if (!address) {
      console.error('ウォレットが接続されていません');
      return;
    }

    setIsLoading(true);
    try {
      await writeContract({
        address: contractAddress,
        abi: abi,
        functionName: 'initiateTrade',
        args: [
          `0x${selectedNfts[1].contract.address.slice(2)}` as `0x${string}`, // counte rparty's address
          {
            tokenType: 0, // 0: ERC721, 1: ERC20
            tokenAddress: `0x${selectedNfts[0].contract.address.slice(2)}` as `0x${string}`,
            tokenId: BigInt(selectedNfts[0].tokenId),
            amount: BigInt(1),
          },
          {
            tokenType: 0,
            tokenAddress: `0x${selectedNfts[1].contract.address.slice(2)}` as `0x${string}`,
            tokenId: BigInt(selectedNfts[1].tokenId),
            amount: BigInt(1),
          },
        ],
      });
    } catch (error) {
      console.error('取引作成エラー:', error);
      setIsLoading(false);
    }
  };

  if (isConfirmed) {
    setStep(4);
  }

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
        <Button 
          onClick={handleCreateTrade} 
          className="w-full h-10"
          disabled={isLoading || isPending || isConfirming}
        >
          {isLoading || isPending ? '処理中...' : isConfirming ? '確認中...' : '取引の作成'}
        </Button>
      </div>
      {error && <p className="text-red-500">エラー: {error.message}</p>}
    </main>
  );
};

const Step4 = () => {
  const [copied, setCopied] = useState(false);
  const { data: tradeCounter } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: 'tradeCounter',
  });

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
          <p className="bg-gray-100 p-2 rounded-md text-blue-500">
            {`https://trade.example.com/${tradeCounter}`}
          </p>
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
