import { Trade } from "@/types";

import { Nft } from "alchemy-sdk";
import Image from "next/image";
import { ApproveStatus } from "./ApproveStatus";
import { Address } from "viem";

const tradeStatusMap: { [key: string]: string } = {
  NonExistent: "存在しない",
  Initiated: "承認待ち",
  Approved: "承認済み",
  Completed: "完了",
  Cancelled: "キャンセル済み",
};

interface TradeDetailProps {
  chainId: number;
  tradeId: string;
  trade: Trade;
  initiatorNft: Nft;
  counterPartyNft: Nft;
  escrowAddress: Address;
}

export const TradeDetail = ({
  chainId,
  tradeId,
  trade,
  initiatorNft,
  counterPartyNft,
  escrowAddress,
}: TradeDetailProps) => {
  return (
    <main className="flex flex-col min-h-[calc(100dvh-160px)] py-8 px-4 max-w-md mx-auto">
      <h1 className="flex items-end space-x-2">
        <span className="text-2xl font-bold">取引 </span>
        <span className="text-md font-bold truncate">#{tradeId}</span>
      </h1>
      {trade ? (
        <div className="mt-4">
          <div className="bg-gray-100 p-4 rounded-md mb-4">
            <p className="text-lg font-semibold">ステータス: {tradeStatusMap[trade.status]}</p>
          </div>
          <div className="flex justify-around mb-4 items-center">
            {initiatorNft && (
              <div className="flex flex-col items-center">
                <Image
                  src={initiatorNft.image?.cachedUrl ?? initiatorNft.image?.thumbnailUrl ?? ""}
                  alt={initiatorNft.name ?? ""}
                  width={128}
                  height={128}
                  className="object-cover rounded-lg shadow-md"
                />
                <p className="text-sm mt-2">{initiatorNft.name}</p>
              </div>
            )}
            <span className="text-xl font-bold">⇄</span>
            {counterPartyNft && (
              <div className="flex flex-col items-center">
                <Image
                  src={counterPartyNft.image?.cachedUrl ?? counterPartyNft.image?.thumbnailUrl ?? ""}
                  alt={counterPartyNft.name ?? ""}
                  width={128}
                  height={128}
                  className="object-cover rounded-lg shadow-md"
                />
                <p className="text-sm mt-2"> {counterPartyNft.name}</p>
              </div>
            )}
          </div>

          <ApproveStatus chainId={chainId} trade={trade} tradeId={tradeId} escrowAddress={escrowAddress} />
        </div>
      ) : (
        <p>取引の詳細を読み込み中...</p>
      )}
    </main>
  );
};
