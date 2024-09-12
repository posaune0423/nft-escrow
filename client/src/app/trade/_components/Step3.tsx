"use client";

import Image from "next/image";
import { useTradeStore } from "@/providers/tradeStoreProvider";

export const Step3 = () => {
  const { selectedNfts, exchangeType, amount } = useTradeStore((state) => ({
    selectedNfts: state.selectedNfts,
    exchangeType: state.exchangeType,
    amount: state.amount,
  }));

  return (
    <div className="flex flex-col items-center justify-center px-4 space-y-8 w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold">選択したNFTの確認</h2>
      <div className="flex justify-around w-full items-center">
        <Image
          src={selectedNfts[0].image.cachedUrl ?? selectedNfts[0].image.thumbnailUrl ?? ""}
          alt={selectedNfts[0].name ?? "NFT Image"}
          width={128}
          height={128}
          className="w-32 h-32 object-cover rounded-lg shadow-md"
          key={`${selectedNfts[0].contract.address}-${selectedNfts[0].tokenId}`}
        />
        <span className="text-xl font-bold">⇄</span>
        {exchangeType === "NFT" ? (
          <Image
            src={selectedNfts[1].image.cachedUrl ?? selectedNfts[1].image.thumbnailUrl ?? ""}
            alt={selectedNfts[1].name ?? "NFT Image"}
            width={128}
            height={128}
            className="w-32 h-32 object-cover rounded-lg shadow-md"
            key={`${selectedNfts[1].contract.address}-${selectedNfts[1].tokenId}`}
          />
        ) : (
          <div className="flex items-center space-x-2 rounded-lg p-2">
            {!selectedNfts[1].image.cachedUrl && !selectedNfts[1].image.thumbnailUrl ? (
              <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-200">
                <span className="text-xl">💰</span>
              </div>
            ) : (
              <Image
                src={selectedNfts[1].image.cachedUrl ?? selectedNfts[1].image.thumbnailUrl ?? ""}
                alt={selectedNfts[1].name ?? "Token Image"}
                width={24}
                height={24}
                className="w-8 h-8 object-cover rounded-full shadow-md"
              />
            )}
            <p className="text-xs text-gray-500">
              {amount} {selectedNfts[1].name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
