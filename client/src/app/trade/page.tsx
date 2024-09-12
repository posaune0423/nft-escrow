"use client";

import { useAccount, useChainId } from "wagmi";
import { type Nft, type OwnedNft } from "alchemy-sdk";
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import { getBaseUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { type Address } from "viem";
import { toast } from "sonner";
import { parseNftUrl } from "@/utils";
import { getNftMetadata, getNftsForOwner } from "@/libs/api";
import Image from "next/image";
import { NextPage } from "next";
import { StepFlow } from "@/components/StepFlow";
import { Step4 } from "./_components/Step4";
import { Step3 } from "./_components/Step3";
import { BackButton } from "./_components/BackButton";
import { Step1 } from "./_components/Step1";
import { useDebouncedCallback } from "use-debounce";

const Step2 = ({
  tokenId,
  chainId,
  exchangeType,
  selectedNfts,
  counterPartyAddress,
  nftUrl,
  contractAddress,
  amount,
  setSelectedNfts,
  setStep,
  setCounterPartyAddress,
  setExchangeType,
  setNftUrl,
  setContractAddress,
  setTokenId,
  setAmount,
}: {
  chainId: number;
  tokenId: string;
  exchangeType: "NFT" | "FT";
  nftUrl: string;
  amount: string;
  selectedNfts: (OwnedNft | Nft)[];
  contractAddress: string;
  counterPartyAddress: Address;
  setSelectedNfts: (nfts: (OwnedNft | Nft)[]) => void;
  setCounterPartyAddress: (address: Address) => void;
  setStep: Dispatch<SetStateAction<number>>;
  setExchangeType: (type: "NFT" | "FT") => void;
  setNftUrl: (url: string) => void;
  setContractAddress: (address: string) => void;
  setTokenId: (id: string) => void;
  setAmount: (amount: string) => void;
}) => {
  const [previewNft, setPreviewNft] = useState<Nft | null>(null);

  const setNftInfo = useDebouncedCallback((url: string) => {
    if (url.trim() === "") return;
    const parsed = parseNftUrl(url);
    if (parsed) {
      setContractAddress(parsed.contractAddress);
      setTokenId(parsed.tokenId);
      toast.success("NFT情報を自動入力しました");
    } else {
      toast.error("URLからNFT情報を抽出できませんでした");
    }
  }, 1000);

  const handleNftPreview = useCallback(async () => {
    if (exchangeType === "NFT" && contractAddress && tokenId) {
      try {
        const metadata = await getNftMetadata(chainId, contractAddress, tokenId);
        setPreviewNft(metadata);
      } catch (error) {
        console.error("Failed to fetch NFT metadata:", error);
        toast.error("NFTのメタデータの取得に失敗しました");
      }
    }
  }, [chainId, exchangeType, contractAddress, tokenId]);

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

  useEffect(() => {
    setNftInfo(nftUrl);
  }, [nftUrl, setNftInfo]);

  useEffect(() => {
    handleNftPreview();
  }, [handleNftPreview]);

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

      <Image
        src={
          (selectedNfts[0] as OwnedNft | Nft).image.cachedUrl ??
          (selectedNfts[0] as OwnedNft | Nft).image.thumbnailUrl ??
          ""
        }
        alt={(selectedNfts[0] as OwnedNft | Nft).name ?? "NFT Image"}
        className="w-32 h-32 object-cover rounded-lg shadow-md"
        width={128}
        height={128}
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
              URL(OpenSea, Rarible, Moor等)から自動入力
              <Input id="nftUrl" placeholder="NFT URL" value={nftUrl} onChange={(e) => setNftUrl(e.target.value)} />
            </Label>
            <Label htmlFor="contractAddress">
              Contract Address
              <Input
                id="contractAddress"
                placeholder="Contract Address"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
              />
            </Label>
            <Label htmlFor="tokenId">
              Token ID
              <Input id="tokenId" placeholder="Token ID" value={tokenId} onChange={(e) => setTokenId(e.target.value)} />
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
            <Image
              src={previewNft.image.cachedUrl ?? previewNft.image.thumbnailUrl ?? ""}
              alt={previewNft.name ?? "NFT Image"}
              width={128}
              height={128}
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
          <BackButton setStep={setStep} />
          <Button type="submit" className="w-2/3" disabled={!isFormValid()}>
            次へ
          </Button>
        </div>
      </form>
    </div>
  );
};

const TradePage: NextPage = () => {
  const [step, setStep] = useState<number>(1);
  const [nfts, setNfts] = useState<OwnedNft[]>([]);
  const [selectedNfts, setSelectedNfts] = useState<(OwnedNft | Nft)[]>([]);
  const [counterPartyAddress, setCounterPartyAddress] = useState<Address>("0x64473e07c7A53a632DDE287CA2e6c3c1aC15Af29");
  const [exchangeType, setExchangeType] = useState<"NFT" | "FT">("NFT");
  const [nftUrl, setNftUrl] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [amount, setAmount] = useState("");

  const chainId = useChainId();
  const { address } = useAccount();
  const { openConnectModal } = useConnectModal();

  const selectMyNft = (nft: OwnedNft) => {
    setSelectedNfts((prev) => [...prev, nft]);
    setStep(2);
  };

  useEffect(() => {
    if (!address) return;
    const fetchNfts = async () => {
      const nfts = await getNftsForOwner(chainId, address);
      setNfts(nfts);
    };
    fetchNfts();
  }, [address, chainId]);

  if (!address) {
    return (
      <main className="flex flex-col min-h-[calc(100dvh-180px)] py-8 max-w-md mx-auto">
        <div className="flex flex-col items-center justify-center px-4 space-y-4">
          <h2 className="text-2xl font-bold">ウォレットを接続してください</h2>
          <Button onClick={openConnectModal} className="w-full h-16 text-lg rounded-3xl">
            Walletを接続
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-[calc(100dvh-180px)] py-8 max-w-md mx-auto">
      <StepFlow currentStep={step} />
      {step === 1 && <Step1 nfts={nfts} selectMyNft={selectMyNft} />}
      {step === 2 && (
        <Step2
          chainId={chainId}
          selectedNfts={selectedNfts}
          exchangeType={exchangeType}
          counterPartyAddress={counterPartyAddress}
          nftUrl={nftUrl}
          contractAddress={contractAddress}
          amount={amount}
          tokenId={tokenId}
          setSelectedNfts={setSelectedNfts}
          setStep={setStep}
          setCounterPartyAddress={setCounterPartyAddress}
          setExchangeType={setExchangeType}
          setNftUrl={setNftUrl}
          setContractAddress={setContractAddress}
          setTokenId={setTokenId}
          setAmount={setAmount}
        />
      )}
      {step === 3 && (
        <Step3
          selectedNfts={selectedNfts}
          chainId={chainId}
          setStep={setStep}
          counterPartyAddress={counterPartyAddress}
        />
      )}
      {step === 4 && <Step4 link={`${getBaseUrl()}/trade/${chainId}/test`} />}
    </main>
  );
};

export default TradePage;
