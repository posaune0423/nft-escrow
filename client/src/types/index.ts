export enum TokenType {
  ERC721,
  ERC20,
}

export interface Asset {
  tokenType: TokenType;
  contractAddress: string;
  tokenId: string;
  amount: string;
}

export interface Trade {
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
