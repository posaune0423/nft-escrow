import { getNetworkFromChainId } from "@/utils";
import { Alchemy, OwnedNft } from "alchemy-sdk";
import { useEffect, useMemo, useState } from "react";
import { useChainId } from "wagmi";

export const NftList = ({ address }: { address: string }) => {
  const [nfts, setNfts] = useState<OwnedNft[]>([]);
  const chainId = useChainId();
  const alchemy = useMemo(
    () =>
      new Alchemy({
        apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
        network: getNetworkFromChainId(chainId),
      }),
    [chainId]
  );

  useEffect(() => {
    if (!address) return;
    const fetchNfts = async () => {
      const { ownedNfts } = await alchemy.nft.getNftsForOwner(address);
      setNfts(ownedNfts);
    };
    fetchNfts();
  }, [alchemy, address]);

  return (
    <div className="grid grid-cols-2 gap-4 items-center justify-center h-full">
      {nfts.map((nft) => (
        <div key={nft.tokenId} className="flex justify-center">
          <img src={nft.image.cachedUrl ?? nft.image.thumbnailUrl} alt={nft.tokenId} className="max-w-full h-auto" />
        </div>
      ))}
    </div>
  );
};
