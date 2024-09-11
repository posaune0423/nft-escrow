export const abi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  {
    type: "function",
    name: "approveTrade",
    inputs: [{ name: "tradeId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "cancelTrade",
    inputs: [{ name: "_tradeId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "feePercentage",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTradeStatus",
    inputs: [{ name: "_tradeId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "uint8", internalType: "enum FlexibleEscrow.TradeStatus" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTradesByAddress",
    inputs: [{ name: "_user", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256[]", internalType: "uint256[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "initiateTrade",
    inputs: [
      { name: "_counterparty", type: "address", internalType: "address" },
      {
        name: "_initiatorAsset",
        type: "tuple",
        internalType: "struct FlexibleEscrow.Asset",
        components: [
          { name: "tokenType", type: "uint8", internalType: "enum FlexibleEscrow.TokenType" },
          { name: "tokenAddress", type: "address", internalType: "address" },
          { name: "tokenId", type: "uint256", internalType: "uint256" },
          { name: "amount", type: "uint256", internalType: "uint256" },
        ],
      },
      {
        name: "_counterpartyAsset",
        type: "tuple",
        internalType: "struct FlexibleEscrow.Asset",
        components: [
          { name: "tokenType", type: "uint8", internalType: "enum FlexibleEscrow.TokenType" },
          { name: "tokenAddress", type: "address", internalType: "address" },
          { name: "tokenId", type: "uint256", internalType: "uint256" },
          { name: "amount", type: "uint256", internalType: "uint256" },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "isNFTInEscrow",
    inputs: [
      { name: "", type: "address", internalType: "address" },
      { name: "", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "onERC721Received",
    inputs: [
      { name: "", type: "address", internalType: "address" },
      { name: "", type: "address", internalType: "address" },
      { name: "", type: "uint256", internalType: "uint256" },
      { name: "", type: "bytes", internalType: "bytes" },
    ],
    outputs: [{ name: "", type: "bytes4", internalType: "bytes4" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setFeePercentage",
    inputs: [{ name: "_newFeePercentage", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "tradeCounter",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tradeStatus",
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "uint8", internalType: "enum FlexibleEscrow.TradeStatus" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "trades",
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    outputs: [
      { name: "initiator", type: "address", internalType: "address" },
      { name: "counterparty", type: "address", internalType: "address" },
      {
        name: "initiatorAsset",
        type: "tuple",
        internalType: "struct FlexibleEscrow.Asset",
        components: [
          { name: "tokenType", type: "uint8", internalType: "enum FlexibleEscrow.TokenType" },
          { name: "tokenAddress", type: "address", internalType: "address" },
          { name: "tokenId", type: "uint256", internalType: "uint256" },
          { name: "amount", type: "uint256", internalType: "uint256" },
        ],
      },
      {
        name: "counterpartyAsset",
        type: "tuple",
        internalType: "struct FlexibleEscrow.Asset",
        components: [
          { name: "tokenType", type: "uint8", internalType: "enum FlexibleEscrow.TokenType" },
          { name: "tokenAddress", type: "address", internalType: "address" },
          { name: "tokenId", type: "uint256", internalType: "uint256" },
          { name: "amount", type: "uint256", internalType: "uint256" },
        ],
      },
      { name: "initiatorApproved", type: "bool", internalType: "bool" },
      { name: "counterpartyApproved", type: "bool", internalType: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "TradeApproved",
    inputs: [
      { name: "tradeId", type: "uint256", indexed: false, internalType: "uint256" },
      { name: "approver", type: "address", indexed: false, internalType: "address" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TradeCancelled",
    inputs: [{ name: "tradeId", type: "uint256", indexed: false, internalType: "uint256" }],
    anonymous: false,
  },
  {
    type: "event",
    name: "TradeCompleted",
    inputs: [{ name: "tradeId", type: "uint256", indexed: false, internalType: "uint256" }],
    anonymous: false,
  },
  {
    type: "event",
    name: "TradeInitiated",
    inputs: [
      { name: "tradeId", type: "uint256", indexed: false, internalType: "uint256" },
      { name: "initiator", type: "address", indexed: false, internalType: "address" },
      { name: "counterparty", type: "address", indexed: false, internalType: "address" },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "AddressEmptyCode",
    inputs: [{ name: "target", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "AddressInsufficientBalance",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
  },
  { type: "error", name: "FailedInnerCall", inputs: [] },
  { type: "error", name: "ReentrancyGuardReentrantCall", inputs: [] },
  {
    type: "error",
    name: "SafeERC20FailedOperation",
    inputs: [{ name: "token", type: "address", internalType: "address" }],
  },
] as const;
