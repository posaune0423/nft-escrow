import { useChainId, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Button } from "./ui/button";
import { extractError } from "@/utils";
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CONTRACT_ADDRESS } from "@/constants/contract";
import { getNetworkFromChainId } from "@/utils";
import { Nft, OwnedNft } from "alchemy-sdk";
import { Address } from "viem";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { erc721ABI, escrowABI } from "@/constants/abi";
import { TokenType } from "@/types";
import { Check, Loader2, X } from "lucide-react";
import { useTradeStore } from "@/providers/tradeStoreProvider";

export const InitiateTradeButton = ({ setStep }: { setStep: Dispatch<SetStateAction<number>> }) => {
  const { selectedNfts, counterPartyAddress } = useTradeStore((state) => ({
    selectedNfts: state.selectedNfts,
    counterPartyAddress: state.counterPartyAddress,
  }));

  const chainId = useChainId();
  const escrowAddress = useMemo(() => CONTRACT_ADDRESS[getNetworkFromChainId(chainId)]!, [chainId]);
  const {
    data: approveHash,
    writeContract: writeApprove,
    isPending: isApprovePending,
    error: approveError,
  } = useWriteContract();
  const { data: approveReceipt } = useWaitForTransactionReceipt({ hash: approveHash });

  const {
    data: tradeHash,
    writeContract: writeTrade,
    isPending: isTradePending,
    error: tradeError,
  } = useWriteContract();
  const { data: tradeReceipt } = useWaitForTransactionReceipt({ hash: tradeHash });

  const { data: approvedAddress } = useReadContract({
    abi: erc721ABI,
    address: (selectedNfts[0] as OwnedNft | Nft).contract.address as Address,
    functionName: "getApproved",
    args: [BigInt((selectedNfts[0] as OwnedNft | Nft).tokenId || "0")],
  });

  const isApproved = useMemo(() => {
    return approvedAddress === escrowAddress;
  }, [approvedAddress, escrowAddress]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [approveStatus, setApproveStatus] = useState<"idle" | "pending" | "success" | "error">(
    isApproved ? "success" : "idle"
  );
  const [tradeStatus, setTradeStatus] = useState<"idle" | "pending" | "success" | "error">("idle");

  const handleApprove = useCallback(() => {
    if (!chainId || !selectedNfts[0]) return;
    try {
      setApproveStatus("pending");
      writeApprove({
        abi: erc721ABI,
        address: (selectedNfts[0] as OwnedNft | Nft).contract.address as Address,
        functionName: "approve",
        args: [escrowAddress, BigInt((selectedNfts[0] as OwnedNft | Nft).tokenId)],
      });
    } catch (error) {
      console.error(error);
      setApproveStatus("error");
      toast.error("NFTの承認に失敗しました");
    }
  }, [writeApprove, chainId, escrowAddress, selectedNfts]);

  const handleInitiateTrade = useCallback(() => {
    if (!chainId || !counterPartyAddress || !selectedNfts[0] || !selectedNfts[1]) {
      console.error(chainId, counterPartyAddress, selectedNfts[0], selectedNfts[1]);
      return;
    }

    const myAsset = {
      tokenType: TokenType.ERC721,
      tokenAddress: (selectedNfts[0] as OwnedNft | Nft).contract.address as Address,
      tokenId: BigInt((selectedNfts[0] as OwnedNft | Nft).tokenId),
      amount: BigInt(0),
    };
    const counterPartyAsset = {
      tokenType: TokenType.ERC721,
      tokenAddress: (selectedNfts[1] as OwnedNft | Nft).contract.address as Address,
      tokenId: BigInt((selectedNfts[1] as OwnedNft | Nft).tokenId),
      amount: BigInt(0),
    };
    console.log({ counterPartyAddress, myAsset, counterPartyAsset });
    try {
      console.log("initiateTrade");
      setTradeStatus("pending");
      writeTrade({
        chainId,
        address: escrowAddress,
        abi: escrowABI,
        functionName: "initiateTrade",
        args: [counterPartyAddress, myAsset, counterPartyAsset],
      });
    } catch (error) {
      console.error(error);
      setTradeStatus("error");
      toast.error(extractError(error));
    }
  }, [writeTrade, chainId, escrowAddress, counterPartyAddress, selectedNfts]);

  const handleCreateTrade = useCallback(() => {
    setIsDialogOpen(true);
    if (isApproved) {
      setApproveStatus("success");
      handleInitiateTrade();
    } else {
      handleApprove();
    }
  }, [isApproved, handleApprove, handleInitiateTrade]);

  useEffect(() => {
    if (approveReceipt) {
      setApproveStatus("success");
      toast.success("NFTの承認が完了しました");
      handleInitiateTrade();
    }
  }, [approveReceipt, handleInitiateTrade]);

  useEffect(() => {
    if (tradeReceipt) {
      setTradeStatus("success");
      toast.success("取引の作成が完了しました");
      setTimeout(() => {
        setIsDialogOpen(false);
        setStep(4);
      }, 2000);
    }
  }, [tradeReceipt, setStep]);

  useEffect(() => {
    if (approveError) {
      setApproveStatus("error");
      toast.error(extractError(approveError));
    }
  }, [approveError]);

  useEffect(() => {
    if (tradeError) {
      setTradeStatus("error");
      console.error(tradeError);
      toast.error(extractError(tradeError));
    }
  }, [tradeError]);

  return (
    <>
      <Button onClick={handleCreateTrade} className="w-full" disabled={isApprovePending || isTradePending}>
        取引の作成
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="!max-w-[90%] !mx-auto rounded-md">
          <DialogHeader>
            <DialogTitle>取引の作成</DialogTitle>
            <DialogDescription>NFTの承認と取引の作成を行っています。</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span>1. NFTの承認</span>
              <div className="w-6 h-6">
                {approveStatus === "pending" && <Loader2 className="animate-spin" />}
                {approveStatus === "success" && <Check className="text-green-500" />}
                {approveStatus === "error" && <X className="text-red-500" />}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span>2. 取引の作成</span>
              <div className="w-6 h-6">
                {tradeStatus === "pending" && approveStatus === "success" && <Loader2 className="animate-spin" />}
                {tradeStatus === "success" && <Check className="text-green-500" />}
                {tradeStatus === "error" && <X className="text-red-500" />}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
