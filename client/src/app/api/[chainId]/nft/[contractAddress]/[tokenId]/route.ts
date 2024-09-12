import { getNetworkFromChainId } from "@/utils";
import { Alchemy } from "alchemy-sdk";

export async function GET(
  request: Request,
  { params }: { params: { chainId: string; contractAddress: string; tokenId: string } }
) {
  const { chainId, contractAddress, tokenId } = params;

  console.log(contractAddress, tokenId);

  if (!contractAddress || !tokenId) {
    return Response.json({ error: "Missing contractAddress or tokenId" }, { status: 400 });
  }

  if (!process.env.ALCHEMY_API_KEY) {
    return Response.json({ error: "Missing ALCHEMY_API_KEY" }, { status: 400 });
  }

  const settings = {
    apiKey: process.env.ALCHEMY_API_KEY,
    network: getNetworkFromChainId(Number(chainId)),
  };

  const alchemy = new Alchemy(settings);

  try {
    const nftMetadata = await alchemy.nft.getNftMetadata(contractAddress, tokenId);
    return Response.json(nftMetadata);
  } catch (error) {
    console.error("Error fetching NFTs for owner:", error);
    return Response.json({ error: "Failed to fetch NFTs for owner" }, { status: 500 });
  }
}
