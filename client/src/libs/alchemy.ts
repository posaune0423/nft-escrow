import { getNetworkFromChainId } from "@/utils";

export const getTokenMetadata = async (chainId: number, contractAddress: string) => {
  const network = getNetworkFromChainId(chainId);

  const url = `https://${network}.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  const body = JSON.stringify({
    id: 1,
    jsonrpc: "2.0",
    method: "alchemy_getTokenMetadata",
    params: [contractAddress],
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: body,
    });

    const { result } = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching FT metadata:", error);
    throw error;
  }
};
