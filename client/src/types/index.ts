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
