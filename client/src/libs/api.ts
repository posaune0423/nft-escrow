import { Nft, OwnedNft, TokenMetadataResponse } from "alchemy-sdk";

const API_BASE_URL = "/api";

export const getNftsForOwner = async (chainId: number, ownerAddress: string): Promise<OwnedNft[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${chainId}/nft/owner/${ownerAddress}`);
    return response.json();
  } catch (error) {
    console.error("Error fetching NFTs for owner:", error);
    throw error;
  }
};

export const getNftMetadata = async (chainId: number, contractAddress: string, tokenId: string): Promise<Nft> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${chainId}/nft/${contractAddress}/${tokenId}`);
    return response.json();
  } catch (error) {
    console.error("Error fetching NFT metadata:", error);
    throw error;
  }
};

export const getTokenMetadata = async (chainId: number, contractAddress: string): Promise<TokenMetadataResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${chainId}/ft/${contractAddress}`);
    return response.json();
  } catch (error) {
    console.error("Error fetching FT metadata:", error);
    throw error;
  }
};
