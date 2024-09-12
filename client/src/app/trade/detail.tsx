import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { Alchemy, Nft } from "alchemy-sdk";
import { extractError, getNetworkFromChainId, truncateAddress } from "@/utils";
import { useChainId, useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Link } from "react-router-dom";
import { escrowABI } from "@/constants/abi";
import { CONTRACT_ADDRESS } from "@/constants/contract";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { type Address, toHex } from "viem";

const mockTrade: Trade = {
  initiator: "0xaeaA81651c45b9AdBaB705Bd255a53594E92B1E1",
  counterParty: "0x46496F0feb7D9C561B2489758407c5edf8Fc0481",
  initiatorAsset: {
    tokenType: 1,
    tokenAddress: "0xec4362013838aef2df23ac0587e71ad81829aa7f",
    tokenId: 1,
    amount: 0,
  },
  counterPartyAsset: {
    tokenType: 2,
    tokenAddress: "0xec4362013838aef2df23ac0587e71ad81829aa7f",
    tokenId: 2,
    amount: 0,
  },
  initiatorApproved: true,
  counterPartyApproved: false,
  status: "Initiated",
};

interface Param extends Record<string, string | undefined> {
  tradeId?: string;
}

interface Trade {
  initiator: string;
  counterParty: string;
  initiatorAsset: {
    tokenType: number;
    tokenAddress: string;
    tokenId: number;
    amount: number;
  };
  counterPartyAsset: {
    tokenType: number;
    tokenAddress: string;
    tokenId: number;
    amount: number;
  };
  initiatorApproved: boolean;
  counterPartyApproved: boolean;
  status: string;
}

const tradeStatusMap: { [key: string]: string } = {
  NonExistent: "存在しない",
  Initiated: "承認待ち",
  Approved: "承認済み",
  Completed: "完了",
  Cancelled: "キャンセル済み",
};

export const TradeDetailPage = () => {
  const { tradeId } = useParams<Param>();
  const navigate = useNavigate();
  const { address } = useAccount();
  const [trade, setTrade] = useState<Trade | null>(null);
  const [initiatorNft, setInitiatorNft] = useState<Nft | null>(null);
  const [counterPartyNft, setCounterPartyNft] = useState<Nft | null>(null);
  const chainId = useChainId();
  const escrowAddress = useMemo(() => CONTRACT_ADDRESS[getNetworkFromChainId(chainId)]!, [chainId]);

  const {
    data: approveTradeHash,
    writeContract: writeApproveTrade,
    isPending: isApproveTradePending,
    error: approveTradeError,
  } = useWriteContract();
  const { data: approveTradeReceipt } = useWaitForTransactionReceipt({ hash: approveTradeHash });

  const {
    data: cancelTradeHash,
    writeContract: writeCancelTrade,
    isPending: isCancelTradePending,
    error: cancelTradeError,
  } = useWriteContract();
  const { data: cancelTradeReceipt } = useWaitForTransactionReceipt({ hash: cancelTradeHash });

  const handleApproveTrade = useCallback(() => {
    if (!tradeId) {
      return;
    }
    try {
      writeApproveTrade({
        abi: escrowABI,
        address: escrowAddress,
        functionName: "approveTrade",
        args: [toHex(tradeId) as Address],
      });
    } catch (error) {
      console.error("承認に失敗しました:", error);
    }
  }, [writeApproveTrade, escrowAddress, tradeId]);

  const handleCancelTrade = useCallback(() => {
    if (!tradeId) {
      return;
    }
    try {
      writeCancelTrade({
        abi: escrowABI,
        address: escrowAddress,
        functionName: "cancelTrade",
        args: [toHex(tradeId) as Address],
      });
    } catch (error) {
      console.error("取引のキャンセルに失敗しました:", error);
    }
  }, [writeCancelTrade, escrowAddress, tradeId]);

  const alchemy = useMemo(
    () =>
      new Alchemy({
        apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
        network: getNetworkFromChainId(chainId),
      }),
    [chainId]
  );

  useEffect(() => {
    if (approveTradeError) {
      console.error("承認に失敗しました:", approveTradeError);
      toast.error(extractError(approveTradeError));
    }
  }, [approveTradeError]);

  useEffect(() => {
    if (cancelTradeError) {
      console.error("取引のキャンセルに失敗しました:", cancelTradeError);
      toast.error(extractError(cancelTradeError));
    }
  }, [cancelTradeError]);

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setTrade(mockTrade);
    }, 1000);
  }, [tradeId]);

  useEffect(() => {
    if (trade) {
      const fetchNftMetadata = async () => {
        try {
          const initiatorNftMetadata = await alchemy.nft.getNftMetadata(
            trade.initiatorAsset.tokenAddress,
            trade.initiatorAsset.tokenId.toString()
          );
          setInitiatorNft(initiatorNftMetadata);

          const counterPartyNftMetadata = await alchemy.nft.getNftMetadata(
            trade.counterPartyAsset.tokenAddress,
            trade.counterPartyAsset.tokenId.toString()
          );
          setCounterPartyNft(counterPartyNftMetadata);
        } catch (error) {
          console.error("NFTメタデータの取得に失敗しました:", error);
        }
      };

      fetchNftMetadata();
    }
  }, [trade, alchemy]);

  useEffect(() => {
    if (trade && address) {
      if (address !== trade.initiator && address !== trade.counterParty) {
        navigate("/404");
      } else if (address === trade.counterParty) {
        // Swap roles if the logged-in user is the counterparty
        setTrade({
          ...trade,
          initiator: trade.counterParty,
          counterParty: trade.initiator,
          initiatorAsset: trade.counterPartyAsset,
          counterPartyAsset: trade.initiatorAsset,
          initiatorApproved: trade.counterPartyApproved,
          counterPartyApproved: trade.initiatorApproved,
        });
      }
    }
  }, [trade, address, navigate]);

  useEffect(() => {
    if (approveTradeReceipt) {
      toast.success("取引が承認されました");
    }
  }, [approveTradeReceipt]);

  useEffect(() => {
    if (cancelTradeReceipt) {
      toast.success("取引がキャンセルされました");
    }
  }, [cancelTradeReceipt]);

  const explorerLink = (address: string) => {
    const network = getNetworkFromChainId(chainId);
    return `https://${network}.etherscan.io/address/${address}`;
  };

  return (
    <Layout>
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
                  <img
                    src={initiatorNft.image.cachedUrl ?? initiatorNft.image.thumbnailUrl}
                    alt={initiatorNft.tokenId}
                    className="w-32 h-32 object-cover rounded-lg shadow-md"
                  />
                  <p className="text-sm mt-2">{initiatorNft.name}</p>
                </div>
              )}
              <span className="text-xl font-bold">⇄</span>
              {counterPartyNft && (
                <div className="flex flex-col items-center">
                  <img
                    src={counterPartyNft.image.cachedUrl ?? counterPartyNft.image.thumbnailUrl}
                    alt={counterPartyNft.tokenId}
                    className="w-32 h-32 object-cover rounded-lg shadow-md"
                  />
                  <p className="text-sm mt-2">{counterPartyNft.name}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-8">
              <div className="flex flex-col space-y-3">
                <p className="flex items-center space-x-2">
                  <strong>Initiator:</strong>{" "}
                  <Link to={explorerLink(trade.initiator)} className="text-blue-500">
                    {truncateAddress(trade.initiator, 10)}
                  </Link>
                </p>
                {address === trade.initiator ? (
                  trade.initiatorApproved ? (
                    <Button onClick={handleCancelTrade} disabled={isCancelTradePending} className="h-14">
                      キャンセル
                    </Button>
                  ) : (
                    <Button onClick={handleApproveTrade} disabled={isApproveTradePending} className="h-14">
                      承認
                    </Button>
                  )
                ) : null}
              </div>
              <div className="flex flex-col space-y-3">
                <p className="flex items-center space-x-2">
                  <strong>CounterParty:</strong>{" "}
                  <Link to={explorerLink(trade.counterParty)} className="text-blue-500">
                    {truncateAddress(trade.counterParty, 10)}
                  </Link>
                </p>
                {address === trade.counterParty ? (
                  trade.counterPartyApproved ? (
                    <Button onClick={handleCancelTrade} disabled={isCancelTradePending} className="h-14">
                      キャンセル
                    </Button>
                  ) : (
                    <Button onClick={handleApproveTrade} disabled={isApproveTradePending} className="h-14">
                      承認
                    </Button>
                  )
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <p>取引の詳細を読み込み中...</p>
        )}
      </main>
    </Layout>
  );
};
