// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";

contract MockERC721 is ERC721 {
    uint256 private _tokenIdCounter;

    constructor() ERC721("MockERC721", "MCK") {}

    function mint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
    }

    function safeMint(address to, uint256 tokenId) public {
        _safeMint(to, tokenId);
    }
}
