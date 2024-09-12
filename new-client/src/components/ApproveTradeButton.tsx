"use client";

import { useCallback, useEffect } from "react";
import { Button } from "./ui/button";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { escrowABI } from "@/constants/abi";
import { Address, toHex } from "viem";
import { extractError } from "@/utils";
import { toast } from "sonner";

export const ApproveTradeButton = ({ tradeId, escrowAddress }: { tradeId: string; escrowAddress: Address }) => {
  const { data: hash, writeContract: approveTrade, isPending: isPending, error } = useWriteContract();

  const { data: receipt } = useWaitForTransactionReceipt({ hash });
  const handleApproveTrade = useCallback(() => {
    if (!tradeId) {
      return;
    }
    try {
      approveTrade({
        abi: escrowABI,
        address: escrowAddress,
        functionName: "approveTrade",
        args: [toHex(tradeId) as Address],
      });
    } catch (error) {
      console.error("取引のキャンセルに失敗しました:", error);
    }
  }, [approveTrade, escrowAddress, tradeId]);

  useEffect(() => {
    if (error) {
      console.error("取引のキャンセルに失敗しました:", error);
      toast.error(extractError(error));
    }
  }, [error]);

  useEffect(() => {
    if (receipt) {
      toast.success("取引がキャンセルされました");
    }
  }, [receipt]);

  return (
    <Button onClick={handleApproveTrade} disabled={isPending} className="h-14">
      承認
    </Button>
  );
};
