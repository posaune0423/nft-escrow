"use client";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getNftsForOwner } from "@/libs/api";
import { useTradeStore } from "@/providers/tradeStoreProvider";
import { cn } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Address } from "viem";
import { useAccount, useChainId } from "wagmi";

export const Step1 = () => {
  const chainId = useChainId();
  const { address } = useAccount();
  const [search, setSearch] = useState("");
  const { data: nfts, isLoading } = useQuery({
    queryKey: ["nfts", chainId, address],
    queryFn: () => getNftsForOwner(chainId, address as Address),
  });

  const { selectedNfts, setSelectedNfts } = useTradeStore((state) => ({
    selectedNfts: state.selectedNfts,
    setSelectedNfts: state.setSelectedNfts,
  }));

  // 検索文字列が空の場合は全てのNFTを、そうでない場合は検索文字列を含むNFTをフィルタリング
  const filteredNfts = useMemo(() => {
    if (!search.trim()) return nfts;
    const searchLower = search.toLowerCase();
    return nfts?.filter((nft) => nft.name?.toLowerCase().includes(searchLower));
  }, [nfts, search]);

  return (
    <div className="flex flex-col items-center justify-center px-4 space-y-4">
      <h2 className="text-2xl font-bold">交換するNFTを選択してください</h2>
      <Input placeholder="NFTを検索" value={search} onChange={(e) => setSearch(e.target.value)} />
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full max-w-3xl">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="w-full aspect-square bg-gray-200 animate-pulse rounded-lg">
              <div className="w-full h-full flex items-center justify-center">
                <Skeleton className="w-full h-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredNfts?.length === 0 ? (
        <div className="flex flex-col items-center justify-center">
          <p className="text-lg text-muted-foreground">NFTが見つかりませんでした</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full max-w-3xl">
          {filteredNfts?.map((nft) => (
            <div
              key={`${nft.contract.address}-${nft.tokenId}`}
              className={cn(
                "flex justify-center cursor-pointer hover:opacity-80 transition-opacity rounded-lg",
                selectedNfts[0]?.contract.address === nft.contract.address &&
                  selectedNfts[0]?.tokenId === nft.tokenId &&
                  "border-2 border-primary"
              )}
              onClick={() => {
                selectedNfts[0] = nft;
                setSelectedNfts(selectedNfts);
              }}
            >
              <Image
                src={nft.image.cachedUrl ?? nft.image.thumbnailUrl ?? ""}
                alt={nft.name ?? "NFT Image"}
                width={128}
                height={128}
                className="w-full h-auto rounded-lg shadow-md"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
