import { getNetworkFromChainId } from "@/utils";
import { Alchemy } from "alchemy-sdk";

export async function GET(request: Request, { params }: { params: { chainId: string; ownerAddress: string } }) {
  const { chainId, ownerAddress } = params;

  console.log(chainId, ownerAddress);

  if (!chainId || !ownerAddress) {
    return Response.json({ error: "Missing chainId or ownerAddress" }, { status: 400 });
  }

  if (!process.env.ALCHEMY_API_KEY) {
    return Response.json({ error: "Missing ALCHEMY_API_KEY" }, { status: 400 });
  }

  const settings = {
    apiKey: process.env.ALCHEMY_API_KEY,
    network: getNetworkFromChainId(Number(chainId)),
  };

  const alchemy = new Alchemy(settings);

  console.log(settings);

  try {
    const { ownedNfts } = await alchemy.nft.getNftsForOwner(ownerAddress);
    return Response.json(ownedNfts);
  } catch (error) {
    console.error("Error fetching NFTs for owner:", error);
    return Response.json({ error: "Failed to fetch NFTs for owner" }, { status: 500 });
  }
}
