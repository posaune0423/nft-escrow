"use client";

import { type Nft, type OwnedNft } from "alchemy-sdk";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { type Address } from "viem";
import { toast } from "sonner";
import { parseNftUrl } from "@/utils";
import { getNftMetadata, getTokenMetadata } from "@/libs/api";
import Image from "next/image";
import { useDebouncedCallback } from "use-debounce";
import { useChainId } from "wagmi";
import { useTradeStore } from "@/providers/tradeStoreProvider";

export const Step2 = () => {
  const chainId = useChainId();
  const {
    contractAddress,
    tokenId,
    exchangeType,
    selectedNfts,
    amount,
    counterPartyAddress,
    setContractAddress,
    setTokenId,
    setExchangeType,
    setSelectedNfts,
    setAmount,
    setCounterPartyAddress,
  } = useTradeStore((state) => ({
    contractAddress: state.contractAddress,
    tokenId: state.tokenId,
    exchangeType: state.exchangeType,
    selectedNfts: state.selectedNfts,
    amount: state.amount,
    counterPartyAddress: state.counterPartyAddress,
    setExchangeType: state.setExchangeType,
    setSelectedNfts: state.setSelectedNfts,
    setAmount: state.setAmount,
    setContractAddress: state.setContractAddress,
    setTokenId: state.setTokenId,
    setCounterPartyAddress: state.setCounterPartyAddress,
  }));

  const myNft = useMemo(() => selectedNfts[0], [selectedNfts]);
  const [nftUrl, setNftUrl] = useState<string>("");

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

  const handleTokenPreview = useCallback(async () => {
    if (!contractAddress) return;
    if (exchangeType === "NFT") {
      if (!tokenId) return;
      try {
        const metadata = await getNftMetadata(chainId, contractAddress, tokenId);
        setSelectedNfts([myNft, metadata]);
      } catch (error) {
        console.error("Failed to fetch NFT metadata:", error);
        toast.error("NFTのメタデータの取得に失敗しました");
      }
    } else {
      // FTの場合は、ダミーのNFTオブジェクトを作成
      try {
        const ftMetadata = await getTokenMetadata(chainId, contractAddress);
        const ftObject = {
          contract: { address: contractAddress },
          tokenId: "0",
          name: ftMetadata.name,
          image: { cachedUrl: ftMetadata.logo, thumbnailUrl: ftMetadata.logo },
        } as Nft;
        setSelectedNfts([myNft, ftObject]);
      } catch (error) {
        console.error("Failed to fetch FT metadata:", error);
        toast.error("FTのメタデータの取得に失敗しました");
      }
    }
  }, [chainId, exchangeType, contractAddress, tokenId, myNft, setSelectedNfts]);

  useEffect(() => {
    setNftInfo(nftUrl);
  }, [nftUrl, setNftInfo]);

  useEffect(() => {
    handleTokenPreview();
  }, [handleTokenPreview]);

  return (
    <div className="flex flex-col items-center justify-center px-4 space-y-4">
      <h2 className="text-xl md:text-2xl font-bold">交換条件を入力してください</h2>

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

      <div className="w-full max-w-md space-y-6 flex flex-col">
        <RadioGroup defaultValue={exchangeType} onValueChange={(value) => setExchangeType(value as "NFT" | "FT")}>
          <div className="flex items-center space-x-2">
            <Label htmlFor="nft" className="flex items-center">
              <RadioGroupItem value="NFT" id="nft" />
              <span className="ml-2">NFT(ERC721)</span>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="ft" className="flex items-center">
              <RadioGroupItem value="FT" id="ft" />
              <span className="ml-2">FT (ERC20)</span>
            </Label>
          </div>
        </RadioGroup>

        {exchangeType === "NFT" ? (
          <>
            <Label htmlFor="nftUrl">
              <p className="mb-2">URL(OpenSea, Rarible, Moor等)から自動入力</p>
              <Input id="nftUrl" placeholder="NFT URL" value={nftUrl} onChange={(e) => setNftUrl(e.target.value)} />
            </Label>
            <Label htmlFor="contractAddress">
              <p className="mb-2">コントラクトアドレス</p>
              <Input
                id="contractAddress"
                placeholder="0x0..."
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
              />
            </Label>
            <Label htmlFor="tokenId">
              <p className="mb-2">トークンID</p>
              <Input id="tokenId" placeholder="トークンID" value={tokenId} onChange={(e) => setTokenId(e.target.value)} />
            </Label>
          </>
        ) : (
          <>
            <Label htmlFor="contractAddress">
              <p className="mb-2">コントラクトアドレス</p>
              <Input
                id="contractAddress"
                placeholder="0x0..."
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
              />
            </Label>
            <Label htmlFor="amount">
              <p className="mb-2">送金量</p>
              <Input
                id="amount"
                placeholder="200"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Label>
          </>
        )}

        {selectedNfts[1] ? (
          exchangeType === "NFT" ? (
            <div className="flex flex-col items-center">
              <Image
                src={selectedNfts[1].image.cachedUrl ?? selectedNfts[1].image.thumbnailUrl ?? ""}
                alt={selectedNfts[1].name ?? "Token Image"}
                width={128}
                height={128}
                className="w-32 h-32 object-cover rounded-lg shadow-md"
              />
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              {selectedNfts[1].image.cachedUrl || selectedNfts[1].image.thumbnailUrl ? (
                <Image
                  src={selectedNfts[1].image.cachedUrl ?? selectedNfts[1].image.thumbnailUrl ?? ""}
                  alt={selectedNfts[1].name ?? "Token Image"}
                  width={24}
                  height={24}
                  className="w-8 h-8 object-cover rounded-full shadow-md"
                />
              ) : (
                <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-200">
                  <span className="text-xl">💰</span>
                </div>
              )}
              <p className="text-sm text-gray-500">
                {amount} {selectedNfts[1].name}
              </p>
            </div>
          )
        ) : null}

        <Label htmlFor="counterPartyAddress">
          <p className="mb-2">相手のウォレットアドレス</p>
          <Input
            id="counterPartyAddress"
            placeholder="相手のウォレットアドレス"
            value={counterPartyAddress}
            onChange={(e) => setCounterPartyAddress(e.target.value as Address)}
          />
        </Label>
      </div>
    </div>
  );
};
