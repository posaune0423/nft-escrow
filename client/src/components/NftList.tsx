import { getNftsForOwner } from "@/libs/api";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useMemo } from "react";
import { Address } from "viem";

export const NftList = ({ chainId, address }: { chainId: number; address: Address }) => {
  const { data: nfts, isLoading } = useQuery({
    queryKey: ["nfts", chainId, address],
    queryFn: () => getNftsForOwner(chainId, address as Address),
  });
  const filteredNfts = useMemo(() => {
    return nfts?.filter((nft) => nft.image.cachedUrl || nft.image.thumbnailUrl);
  }, [nfts]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full max-w-3xl">
      {filteredNfts.map((nft) => (
        <div
          key={`${nft.contract.address}-${nft.tokenId}`}
          className="flex justify-center cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => selectMyNft(nft)}
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
  );
};
