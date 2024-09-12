import { getTokenMetadata } from "@/libs/alchemy";
import { getNetworkFromChainId } from "@/utils";
import { Alchemy } from "alchemy-sdk";

export async function GET(request: Request, { params }: { params: { chainId: string; contractAddress: string } }) {
  const { chainId, contractAddress } = params;

  if (!contractAddress) {
    return Response.json({ error: "Missing contractAddress" }, { status: 400 });
  }

  if (!process.env.ALCHEMY_API_KEY) {
    return Response.json({ error: "Missing ALCHEMY_API_KEY" }, { status: 400 });
  }

  const settings = {
    apiKey: process.env.ALCHEMY_API_KEY,
    network: getNetworkFromChainId(Number(chainId)),
  };

  const alchemy = new Alchemy(settings);
  console.log(alchemy);

  try {
    // SOMEHOW THIS IS NOT WORKING FOR NOW
    // const ftMetadata = await alchemy.core.getTokenMetadata("0x3c499c542cef5e3811e1192ce70d8cc03d5c3359");
    const ftMetadata = await getTokenMetadata(Number(chainId), contractAddress);
    return Response.json(ftMetadata);
  } catch (error) {
    console.error("Error fetching FT metadata:", error);
    return Response.json({ error: "Failed to fetch FT metadata" }, { status: 500 });
  }
}
