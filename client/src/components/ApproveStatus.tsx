"use client";

import { explorerLink, truncateAddress } from "@/utils";
import Link from "next/link";
import { Trade } from "@/types";
import { CancelTradeButton } from "./CancelTradeButton";
import { Address } from "viem";
import { useAccount } from "wagmi";
import { ApproveTradeButton } from "./ApproveTradeButton";

interface ApproveStatusProps {
  chainId: number;
  trade: Trade;
  tradeId: string;
  escrowAddress: Address;
}

export const ApproveStatus = ({ chainId, trade, tradeId, escrowAddress }: ApproveStatusProps) => {
  const { address } = useAccount();

  return (
    <div className="flex flex-col space-y-8">
      <div className="flex flex-col space-y-3">
        <p className="flex items-center space-x-2">
          <strong>発行者:</strong>{" "}
          <Link href={explorerLink(trade.initiator, chainId)} className="text-blue-500">
            {truncateAddress(trade.initiator, 10)}
          </Link>
        </p>
        {address === trade.initiator ? (
          trade.initiatorApproved ? (
            <CancelTradeButton tradeId={tradeId} escrowAddress={escrowAddress} />
          ) : (
            <ApproveTradeButton tradeId={tradeId} escrowAddress={escrowAddress} />
          )
        ) : null}
      </div>
      <div className="flex flex-col space-y-3">
        <p className="flex items-center space-x-2">
          <strong>受信者:</strong>{" "}
          <Link href={explorerLink(trade.counterParty, chainId)} className="text-blue-500">
            {truncateAddress(trade.counterParty, 10)}
          </Link>
        </p>
        {address === trade.counterParty ? (
          trade.counterPartyApproved ? (
            <CancelTradeButton tradeId={tradeId} escrowAddress={escrowAddress} />
          ) : (
            <ApproveTradeButton tradeId={tradeId} escrowAddress={escrowAddress} />
          )
        ) : null}
      </div>
    </div>
  );
};
