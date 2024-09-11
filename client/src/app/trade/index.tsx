import { useAccount, useChainId, useWriteContract } from "wagmi";
import { Alchemy, type Nft, type OwnedNft } from "alchemy-sdk";
import { useCallback, useEffect, useMemo, useState } from "react";
import { extractError, getNetworkFromChainId } from "@/utils";
import { Button } from "@/components/ui/button";
import { Clipboard, Check } from "lucide-react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Layout } from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { abi } from "@/constants/abi";
import { CONTRACT_ADDRESS } from "@/constants/contract";
import { MOCK_NFT_ADDRESS } from "@/constants/mock";
import { TokenType } from "@/types";
import { type Address } from "viem";
import { toast } from "sonner";

const StepFlow = ({ currentStep }: { currentStep: number }) => {
  const steps = ["自分のNFTを選択", "交換条件の入力", "確認", "相手に共有"];
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
      <h2 className="text-2xl font-bold">交換するNFTを選択してください</h2>
      {nfts.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full max-w-3xl">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="w-full aspect-square bg-gray-200 animate-pulse rounded-lg">
              <div className="w-full h-full flex items-center justify-center">
                <Skeleton className="w-full h-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full max-w-3xl">
          {nfts.map((nft) => (
            <div
              key={`${nft.contract.address}-${nft.tokenId}`}
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

const Step2 = ({
  selectedNfts,
  setStep,
  counterPartyAddress,
  setCounterPartyAddress,
}: {
  selectedNfts: OwnedNft[];
  setStep: (step: number) => void;
  counterPartyAddress: Address;
  setCounterPartyAddress: (address: Address) => void;
}) => {
  const [exchangeType, setExchangeType] = useState<"NFT" | "FT">("NFT");
  const [contractAddress, setContractAddress] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [amount, setAmount] = useState("");
  const [previewNft, setPreviewNft] = useState<Nft | null>(null);
  const chainId = useChainId();

  const alchemy = useMemo(
    () =>
      new Alchemy({
        apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
        network: getNetworkFromChainId(chainId),
      }),
    [chainId]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    setStep(3);
  };

  const handleNftPreview = async () => {
    if (exchangeType === "NFT" && contractAddress && tokenId) {
      // Fetch NFT preview using Alchemy SDK or similar service
      // This is a placeholder and should be replaced with actual API call
      const metadata = await alchemy.nft.getNftMetadata(contractAddress, tokenId);
      setPreviewNft(metadata);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-4 space-y-4">
      <h2 className="text-2xl font-bold">交換条件を入力してください</h2>

      <img
        src={selectedNfts[0].image.cachedUrl ?? selectedNfts[0].image.thumbnailUrl}
        alt={selectedNfts[0].tokenId}
        className="w-32 h-32 object-cover rounded-lg shadow-md"
      />
      <p className="text-sm text-gray-500">交換に出すNFT: {selectedNfts[0].name}</p>

      <hr className="w-full border-gray-200 my-6" />

      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <RadioGroup defaultValue="NFT" onValueChange={(value) => setExchangeType(value as "NFT" | "FT")}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="NFT" id="nft" />
            <Label htmlFor="nft">NFT</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="FT" id="ft" />
            <Label htmlFor="ft">FT (ERC20)</Label>
          </div>
        </RadioGroup>

        <Input
          placeholder="Contract Address"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
        />

        {exchangeType === "NFT" ? (
          <Input placeholder="Token ID" value={tokenId} onChange={(e) => setTokenId(e.target.value)} />
        ) : (
          <Input placeholder="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
        )}

        {exchangeType === "NFT" && (
          <Button type="button" onClick={handleNftPreview}>
            NFTをプレビュー
          </Button>
        )}

        {previewNft && (
          <div className="flex flex-col items-center">
            <img
              src={previewNft.image.cachedUrl ?? previewNft.image.thumbnailUrl}
              alt={previewNft.tokenId}
              className="w-32 h-32 object-cover rounded-lg shadow-md"
            />
            <span>{previewNft.name}</span>
          </div>
        )}

        <Input
          placeholder="相手のウォレットアドレス"
          value={counterPartyAddress}
          onChange={(e) => setCounterPartyAddress(e.target.value as Address)}
        />

        <Button type="submit" className="w-full h-14">
          次へ
        </Button>
      </form>
    </div>
  );
};

const Step3 = ({
  selectedNfts,
  setStep,
  counterPartyAddress,
}: {
  selectedNfts: OwnedNft[];
  setStep: (step: number) => void;
  counterPartyAddress: Address;
}) => {
  const chainId = useChainId();
  const { data: hash, error, writeContract, isPending } = useWriteContract();
  // const { data: receipt, isPending } = useWaitForTransactionReceipt({ hash });

  const handleInitiateTrade = useCallback(() => {
    if (!chainId || !counterPartyAddress) return;
    console.log(chainId, counterPartyAddress);
    try {
      writeContract({
        chainId,
        address: CONTRACT_ADDRESS[getNetworkFromChainId(chainId)]!,
        abi,
        functionName: "initiateTrade",
        args: [
          counterPartyAddress,
          {
            tokenType: TokenType.ERC721, // 0 for ERC721, 1 for ERC20, etc.
            tokenAddress: MOCK_NFT_ADDRESS, // NFT contract address
            tokenId: BigInt(1),
            amount: BigInt(0), // 1 for NFTs
          },
          {
            tokenType: TokenType.ERC721, // Adjust based on what you're trading for
            tokenAddress: MOCK_NFT_ADDRESS, // Contract address of desired token
            tokenId: BigInt(1), // 0 if trading for ERC20, or specific tokenId for NFT
            amount: BigInt(0), // 0 for NFT, or amount for ERC20
          },
        ],
      });
    } catch (error) {
      console.error(error);
    }
  }, [writeContract, chainId, counterPartyAddress]);

  useEffect(() => {
    if (hash) {
      console.log(hash);
      setStep(4);
    }
  }, [hash, setStep]);

  useEffect(() => {
    if (error) {
      console.error(error);
      toast.error(extractError(error.message));
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center px-4 space-y-8 w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold">選択したNFTの確認</h2>
      <div className="flex justify-around w-full">
        {selectedNfts.map((nft, index) => (
          <div key={`${nft.contract.address}-${nft.tokenId}`} className="flex flex-col items-center">
            <img
              src={nft.image.cachedUrl ?? nft.image.thumbnailUrl}
              alt={nft.tokenId}
              className="w-32 h-32 object-cover rounded-lg shadow-md"
            />
            <span className="mt-2 text-sm font-semibold">{index === 0 ? "自分のNFT" : "交換NFT"}</span>
          </div>
        ))}
      </div>
      <Button onClick={handleInitiateTrade} className="w-full h-16 text-lg rounded-3xl" disabled={isPending}>
        {isPending ? "取引の作成中..." : "取引の作成"}
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
      <h2 className="text-2xl font-bold">取引リンクをシェア！</h2>
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
  const [step, setStep] = useState<number>(3);
  const [nfts, setNfts] = useState<OwnedNft[]>([]);
  const [selectedNfts, setSelectedNfts] = useState<OwnedNft[]>([]);
  const chainId = useChainId();
  const [counterPartyAddress, setCounterPartyAddress] = useState<Address>("0x64473e07c7A53a632DDE287CA2e6c3c1aC15Af29");

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
        {step === 2 && (
          <Step2
            selectedNfts={selectedNfts}
            setStep={setStep}
            setCounterPartyAddress={setCounterPartyAddress}
            counterPartyAddress={counterPartyAddress}
          />
        )}
        {step === 3 && (
          <Step3 selectedNfts={selectedNfts} setStep={setStep} counterPartyAddress={counterPartyAddress} />
        )}
        {step === 4 && <Step4 />}
      </main>
    </Layout>
  );
};
