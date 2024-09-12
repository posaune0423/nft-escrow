import { TradeDetail } from "@/components/TradeDetail";
import { CONTRACT_ADDRESS } from "@/constants/contract";
import { Trade } from "@/types";
import { getNetworkFromChainId } from "@/utils";
import { Alchemy, Network } from "alchemy-sdk";
import { NextPage } from "next";
// import { escrowABI } from "@/constants/abi";
// import { createClient } from "@/libs/viem";
// import { Address, toHex } from "viem";

interface Params {
  chainId: number;
  id: string;
}

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

const TradeDetailPage: NextPage<{ params: Params }> = async ({ params }) => {
  const chainId = Number(params.chainId);
  const tradeId = params.id;

  const alchemy = new Alchemy({
    apiKey: process.env.ALCHEMY_API_KEY,
    network: getNetworkFromChainId(chainId),
  });

  const escrowAddress = CONTRACT_ADDRESS[getNetworkFromChainId(chainId) as Network];
  if (!escrowAddress) {
    return <div>Invalid chainId</div>;
  }

  // TODO: 取引の詳細を取得する
  // const trade = await createClient(chainId).readContract({
  //   abi: escrowABI,
  //   address: escrowAddress,
  //   functionName: "getTrade",
  //   args: [toHex(tradeId) as Address],
  // });

  const initiatorNftMetadata = await alchemy.nft.getNftMetadata(
    mockTrade.initiatorAsset.tokenAddress,
    mockTrade.initiatorAsset.tokenId.toString()
  );

  const counterPartyNftMetadata = await alchemy.nft.getNftMetadata(
    mockTrade.counterPartyAsset.tokenAddress,
    mockTrade.counterPartyAsset.tokenId.toString()
  );

  return (
    <TradeDetail
      escrowAddress={escrowAddress}
      chainId={chainId}
      tradeId={tradeId}
      trade={mockTrade}
      initiatorNft={initiatorNftMetadata}
      counterPartyNft={counterPartyNftMetadata}
    />
  );
};

export default TradeDetailPage;
