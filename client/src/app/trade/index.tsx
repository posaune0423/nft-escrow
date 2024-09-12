import { useAccount, useChainId, useWaitForTransactionReceipt, useWriteContract, useReadContract } from "wagmi";
import { Alchemy, type Nft, type OwnedNft } from "alchemy-sdk";
import { useCallback, useEffect, useMemo, useState } from "react";
import { extractError, getNetworkFromChainId } from "@/utils";
import { Button } from "@/components/ui/button";
import { Clipboard, Check, ArrowLeft, Loader2, X } from "lucide-react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Layout } from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { escrowABI, erc721ABI } from "@/constants/abi";
import { CONTRACT_ADDRESS } from "@/constants/contract";
import { TokenType } from "@/types";
import { type Address } from "viem";
import { toast } from "sonner";
import { parseNftUrl } from "@/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  const [search, setSearch] = useState("");

  // 検索文字列が空の場合は全てのNFTを、そうでない場合は検索文字列を含むNFTをフィルタリング
  const filteredNfts = useMemo(() => {
    if (!search.trim()) return nfts;
    const searchLower = search.toLowerCase();
    return nfts.filter(
      (nft) => nft.name?.toLowerCase().includes(searchLower) || nft.description?.toLowerCase().includes(searchLower)
    );
  }, [nfts, search]);

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
      <Input placeholder="NFTを検索" value={search} onChange={(e) => setSearch(e.target.value)} />
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
          {filteredNfts.map((nft) => (
            <div
              key={`${nft.contract.address}-${nft.tokenId}`}
              className="flex justify-center cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => selectMyNft(nft)}
            >
              <img
                src={nft.image.cachedUrl ?? nft.image.thumbnailUrl}
                alt={nft.name}
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
  setSelectedNfts,
  setStep,
  counterPartyAddress,
  setCounterPartyAddress,
  exchangeType,
  setExchangeType,
  nftUrl,
  setNftUrl,
  contractAddress,
  setContractAddress,
  tokenId,
  setTokenId,
  amount,
  setAmount,
}: {
  selectedNfts: (OwnedNft | Nft)[];
  setSelectedNfts: (nfts: (OwnedNft | Nft)[]) => void;
  setStep: (step: number) => void;
  counterPartyAddress: Address;
  setCounterPartyAddress: (address: Address) => void;
  exchangeType: "NFT" | "FT";
  setExchangeType: (type: "NFT" | "FT") => void;
  nftUrl: string;
  setNftUrl: (url: string) => void;
  contractAddress: string;
  setContractAddress: (address: string) => void;
  tokenId: string;
  setTokenId: (id: string) => void;
  amount: string;
  setAmount: (amount: string) => void;
}) => {
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

  const handleNftUrlChange = useCallback((url: string) => {
    setNftUrl(url);
    if (url.trim() === "") return;
    const parsed = parseNftUrl(url);
    if (parsed) {
      setContractAddress(parsed.contractAddress);
      setTokenId(parsed.tokenId);
      toast.success("NFT情報を自動入力しました");
    } else {
      toast.error("URLからNFT情報を抽出できませんでした");
    }
  }, []);

  const handleNftPreview = useCallback(async () => {
    if (exchangeType === "NFT" && contractAddress && tokenId) {
      try {
        const metadata = await alchemy.nft.getNftMetadata(contractAddress, tokenId);
        setPreviewNft(metadata);
      } catch (error) {
        console.error("Failed to fetch NFT metadata:", error);
        toast.error("NFTのメタデータの取得に失敗しました");
      }
    }
  }, [alchemy, exchangeType, contractAddress, tokenId]);

  useEffect(() => {
    handleNftPreview();
  }, [handleNftPreview]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (exchangeType === "NFT" && previewNft) {
      setSelectedNfts([selectedNfts[0], previewNft]);
    } else if (exchangeType === "FT") {
      // FTの場合は、ダミーのNFTオブジェクトを作成
      const ftObject = {
        contract: { address: contractAddress },
        tokenId: "0",
        name: `FT (${amount})`,
        image: { cachedUrl: "", thumbnailUrl: "" },
      } as Nft;
      setSelectedNfts([selectedNfts[0], ftObject]);
    }
    setStep(3);
  };

  const isFormValid = () => {
    if (exchangeType === "NFT") {
      return contractAddress !== "" && tokenId !== "" && previewNft !== null;
    } else {
      return contractAddress !== "" && amount !== "" && parseFloat(amount) > 0;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-4 space-y-4">
      <h2 className="text-2xl font-bold">交換条件を入力してください</h2>

      <img
        src={
          (selectedNfts[0] as OwnedNft | Nft).image.cachedUrl ?? (selectedNfts[0] as OwnedNft | Nft).image.thumbnailUrl
        }
        alt={(selectedNfts[0] as OwnedNft | Nft).tokenId}
        className="w-32 h-32 object-cover rounded-lg shadow-md"
      />
      <p className="text-sm text-gray-500">交換に出すNFT: {(selectedNfts[0] as OwnedNft | Nft).name}</p>

      <hr className="w-full border-gray-200 my-6" />

      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 flex flex-col">
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

        {exchangeType === "NFT" ? (
          <>
            <Label htmlFor="nftUrl">
              Marketplace URL (OpenSea, Rarible, Moor等)
              <Input
                id="nftUrl"
                placeholder="NFT URL"
                value={nftUrl}
                onChange={(e) => handleNftUrlChange(e.target.value)}
              />
            </Label>
            <Label htmlFor="contractAddress">
              Contract Address
              <Input id="contractAddress" placeholder="Contract Address" value={contractAddress} readOnly />
            </Label>
            <Label htmlFor="tokenId">
              Token ID
              <Input id="tokenId" placeholder="Token ID" value={tokenId} readOnly />
            </Label>
          </>
        ) : (
          <>
            <Label htmlFor="contractAddress">
              Contract Address
              <Input
                id="contractAddress"
                placeholder="Contract Address"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
              />
            </Label>
            <Label htmlFor="amount">
              Amount
              <Input
                id="amount"
                placeholder="Amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Label>
          </>
        )}

        {previewNft && exchangeType === "NFT" && (
          <div className="flex flex-col items-center">
            <img
              src={previewNft.image.cachedUrl ?? previewNft.image.thumbnailUrl}
              alt={previewNft.tokenId}
              className="w-32 h-32 object-cover rounded-lg shadow-md"
            />
            <span>{previewNft.name}</span>
          </div>
        )}

        <Label htmlFor="counterPartyAddress">
          相手のウォレットアドレス
          <Input
            id="counterPartyAddress"
            placeholder="相手のウォレトアドレス"
            value={counterPartyAddress}
            onChange={(e) => setCounterPartyAddress(e.target.value as Address)}
          />
        </Label>

        <div className="flex justify-between w-full space-x-4">
          <Button type="button" onClick={() => setStep(1)} className="w-1/3">
            <ArrowLeft className="mr-2 h-4 w-4" /> 戻る
          </Button>
          <Button type="submit" className="w-2/3" disabled={!isFormValid()}>
            次へ
          </Button>
        </div>
      </form>
    </div>
  );
};

const Step3 = ({
  selectedNfts,
  setStep,
  counterPartyAddress,
}: {
  selectedNfts: (OwnedNft | Nft)[];
  setStep: (step: number) => void;
  counterPartyAddress: Address;
}) => {
  const chainId = useChainId();
  const escrowAddress = useMemo(() => CONTRACT_ADDRESS[getNetworkFromChainId(chainId)]!, [chainId]);

  const {
    data: approveHash,
    writeContract: writeApprove,
    isPending: isApprovePending,
    error: approveError,
  } = useWriteContract();
  const { data: approveReceipt } = useWaitForTransactionReceipt({ hash: approveHash });

  const {
    data: tradeHash,
    writeContract: writeTrade,
    isPending: isTradePending,
    error: tradeError,
  } = useWriteContract();
  const { data: tradeReceipt } = useWaitForTransactionReceipt({ hash: tradeHash });

  const { data: approvedAddress } = useReadContract({
    abi: erc721ABI,
    address: (selectedNfts[0] as OwnedNft | Nft).contract.address as Address,
    functionName: "getApproved",
    args: [BigInt((selectedNfts[0] as OwnedNft | Nft).tokenId || "0")],
  });

  const isApproved = useMemo(() => {
    return approvedAddress === escrowAddress;
  }, [approvedAddress, escrowAddress]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [approveStatus, setApproveStatus] = useState<"idle" | "pending" | "success" | "error">(
    isApproved ? "success" : "idle"
  );
  const [tradeStatus, setTradeStatus] = useState<"idle" | "pending" | "success" | "error">("idle");

  const handleApprove = useCallback(() => {
    if (!chainId || !selectedNfts[0]) return;
    try {
      setApproveStatus("pending");
      writeApprove({
        abi: erc721ABI,
        address: (selectedNfts[0] as OwnedNft | Nft).contract.address as Address,
        functionName: "approve",
        args: [escrowAddress, BigInt((selectedNfts[0] as OwnedNft | Nft).tokenId)],
      });
    } catch (error) {
      console.error(error);
      setApproveStatus("error");
      toast.error("NFTの承認に失敗しました");
    }
  }, [writeApprove, chainId, escrowAddress, selectedNfts]);

  const handleInitiateTrade = useCallback(() => {
    if (!chainId || !counterPartyAddress || !selectedNfts[0] || !selectedNfts[1]) {
      console.error(chainId, counterPartyAddress, selectedNfts[0], selectedNfts[1]);
      return;
    }

    const myAsset = {
      tokenType: TokenType.ERC721,
      tokenAddress: (selectedNfts[0] as OwnedNft | Nft).contract.address as Address,
      tokenId: BigInt((selectedNfts[0] as OwnedNft | Nft).tokenId),
      amount: BigInt(0),
    };
    const counterPartyAsset = {
      tokenType: TokenType.ERC721,
      tokenAddress: (selectedNfts[1] as OwnedNft | Nft).contract.address as Address,
      tokenId: BigInt((selectedNfts[1] as OwnedNft | Nft).tokenId),
      amount: BigInt(0),
    };
    console.log({ counterPartyAddress, myAsset, counterPartyAsset });
    try {
      console.log("initiateTrade");
      setTradeStatus("pending");
      writeTrade({
        chainId,
        address: escrowAddress,
        abi: escrowABI,
        functionName: "initiateTrade",
        args: [counterPartyAddress, myAsset, counterPartyAsset],
      });
    } catch (error) {
      console.error(error);
      setTradeStatus("error");
      toast.error(extractError(error));
    }
  }, [writeTrade, chainId, escrowAddress, counterPartyAddress, selectedNfts]);

  const handleCreateTrade = useCallback(() => {
    setIsDialogOpen(true);
    if (isApproved) {
      setApproveStatus("success");
      handleInitiateTrade();
    } else {
      handleApprove();
    }
  }, [isApproved, handleApprove, handleInitiateTrade]);

  useEffect(() => {
    if (approveReceipt) {
      setApproveStatus("success");
      toast.success("NFTの承認が完了しました");
      handleInitiateTrade();
    }
  }, [approveReceipt, handleInitiateTrade]);

  useEffect(() => {
    if (tradeReceipt) {
      setTradeStatus("success");
      toast.success("取引の作成が完了しました");
      setTimeout(() => {
        setIsDialogOpen(false);
        setStep(4);
      }, 2000);
    }
  }, [tradeReceipt, setStep]);

  useEffect(() => {
    if (approveError) {
      setApproveStatus("error");
      toast.error(extractError(approveError));
    }
  }, [approveError]);

  useEffect(() => {
    if (tradeError) {
      setTradeStatus("error");
      console.error(tradeError);
      toast.error(extractError(tradeError));
    }
  }, [tradeError]);

  return (
    <div className="flex flex-col items-center justify-center px-4 space-y-8 w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold">選択したNFTの確認</h2>
      <div className="flex justify-around w-full">
        {selectedNfts.map((nft) => (
          <div key={`${nft.contract.address}-${nft.tokenId}`} className="flex flex-col items-center">
            <img
              src={nft.image.cachedUrl ?? nft.image.thumbnailUrl}
              alt={nft.tokenId}
              className="w-32 h-32 object-cover rounded-lg shadow-md"
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between w-full space-x-4">
        <Button onClick={() => setStep(2)} className="w-1/3">
          <ArrowLeft className="mr-2 h-4 w-4" /> 戻る
        </Button>
        <Button onClick={handleCreateTrade} className="w-2/3" disabled={isApprovePending || isTradePending}>
          取引の作成
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="!max-w-[90%] !mx-auto rounded-md">
          <DialogHeader>
            <DialogTitle>取引の作成</DialogTitle>
            <DialogDescription>NFTの承認と取引の作成を行っています。</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span>1. NFTの承認</span>
              <div className="w-6 h-6">
                {approveStatus === "pending" && <Loader2 className="animate-spin" />}
                {approveStatus === "success" && <Check className="text-green-500" />}
                {approveStatus === "error" && <X className="text-red-500" />}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span>2. 取引の作成</span>
              <div className="w-6 h-6">
                {tradeStatus === "pending" && approveStatus === "success" && <Loader2 className="animate-spin" />}
                {tradeStatus === "success" && <Check className="text-green-500" />}
                {tradeStatus === "error" && <X className="text-red-500" />}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Step4 = ({ setStep }: { setStep: (step: number) => void }) => {
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
      <Button onClick={() => setStep(1)} className="w-full">
        <ArrowLeft className="mr-2 h-4 w-4" /> 新しい取引を開始
      </Button>
    </div>
  );
};

export const TradePage = () => {
  const [step, setStep] = useState<number>(1);
  const [nfts, setNfts] = useState<OwnedNft[]>([]);
  const [selectedNfts, setSelectedNfts] = useState<(OwnedNft | Nft)[]>([]);
  const chainId = useChainId();
  const [counterPartyAddress, setCounterPartyAddress] = useState<Address>("0x64473e07c7A53a632DDE287CA2e6c3c1aC15Af29");
  const [exchangeType, setExchangeType] = useState<"NFT" | "FT">("NFT");
  const [nftUrl, setNftUrl] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [amount, setAmount] = useState("");

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
      <main className="flex flex-col min-h-[calc(100dvh-160px)] py-8 max-w-md mx-auto">
        <StepFlow currentStep={step} />
        {step === 1 && <Step1 nfts={nfts} selectMyNft={selectMyNft} address={address} />}
        {step === 2 && (
          <Step2
            selectedNfts={selectedNfts}
            setSelectedNfts={setSelectedNfts}
            setStep={setStep}
            counterPartyAddress={counterPartyAddress}
            setCounterPartyAddress={setCounterPartyAddress}
            exchangeType={exchangeType}
            setExchangeType={setExchangeType}
            nftUrl={nftUrl}
            setNftUrl={setNftUrl}
            contractAddress={contractAddress}
            setContractAddress={setContractAddress}
            tokenId={tokenId}
            setTokenId={setTokenId}
            amount={amount}
            setAmount={setAmount}
          />
        )}
        {step === 3 && (
          <Step3 selectedNfts={selectedNfts} setStep={setStep} counterPartyAddress={counterPartyAddress} />
        )}
        {step === 4 && <Step4 setStep={setStep} />}
      </main>
    </Layout>
  );
};
