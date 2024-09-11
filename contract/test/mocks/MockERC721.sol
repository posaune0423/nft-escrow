// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";

contract MockERC721 is ERC721 {
    uint256 private _tokenIdCounter;
    string public baseURI;

    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) {}

    /**
     * @notice Updates the base URI for the NFT metadata.
     * @dev Can only be called by the contract owner. Used to set or update the URI where NFT metadata is stored.
     * @param baseURI_ The new base URI to set.
     */
    function setBaseURI(string calldata baseURI_) external {
        if (bytes(baseURI_).length == 0) {
            revert("invalid uri");
        }
        baseURI = baseURI_;
    }

    /**
     * @dev All token has same metadata
     * @param tokenId tokenId
     */
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        _requireOwned(tokenId);

        return baseURI;
    }

    function mint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
    }

    function safeMint(address to, uint256 tokenId) public {
        _safeMint(to, tokenId);
    }
}
