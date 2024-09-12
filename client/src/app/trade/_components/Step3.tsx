import { InitiateTradeButton } from "@/components/InitiateTradeButton";
import { Button } from "@/components/ui/button";
import { Nft, OwnedNft } from "alchemy-sdk";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { Address } from "viem";
import { BackButton } from "./BackButton";
import { Dispatch, SetStateAction } from "react";

export const Step3 = ({
  selectedNfts,
  chainId,
  setStep,
  counterPartyAddress,
}: {
  selectedNfts: (OwnedNft | Nft)[];
  chainId: number;
  counterPartyAddress: Address;
  setStep: Dispatch<SetStateAction<number>>;
}) => {
  return (
    <div className="flex flex-col items-center justify-center px-4 space-y-8 w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold">選択したNFTの確認</h2>
      <div className="flex justify-around w-full">
        {selectedNfts.map((nft) => (
          <div key={`${nft.contract.address}-${nft.tokenId}`} className="flex flex-col items-center">
            <Image
              src={nft.image.cachedUrl ?? nft.image.thumbnailUrl ?? ""}
              alt={nft.name ?? "NFT Image"}
              width={128}
              height={128}
              className="w-32 h-32 object-cover rounded-lg shadow-md"
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between w-full space-x-4">
        <BackButton setStep={setStep} />
        <InitiateTradeButton
          chainId={chainId}
          selectedNfts={selectedNfts}
          counterPartyAddress={counterPartyAddress}
          setStep={setStep}
        />
      </div>
    </div>
  );
};
