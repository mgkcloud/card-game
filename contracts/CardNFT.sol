// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title CardNFT
 * @dev ERC1155 contract for Feisty Card Game NFTs.
 * Cards represent unique game assets with dynamic attributes.
 * Uses Ownable for access control.
 */
contract CardNFT is ERC1155, Ownable {
    using Strings for uint256;

    // Base URI for card metadata stored off-chain (e.g., IPFS)
    string private _baseTokenURI;

    // Counter for assigning new card type IDs
    uint256 private _nextTokenId;

    // Mapping from token ID to its rarity tier (e.g., 0: Common, 1: Rare, etc.)
    mapping(uint256 => uint8) public cardRarity;

    // Mapping from token ID to its dynamic cultural attributes (placeholder)
    // In a full implementation, this might store a struct or hash of attributes
    mapping(uint256 => string) public cardAttributes; // Example: Store as JSON string

    // Event emitted when a new card type is created
    event NewCardTypeCreated(uint256 indexed tokenId, uint8 rarity, string initialAttributes);

    // Event emitted when card attributes are updated (e.g., by an oracle)
    event CardAttributesUpdated(uint256 indexed tokenId, string newAttributes);

    /**
     * @dev Constructor sets the initial owner and the base URI (optional).
     * The base URI is where the metadata for tokens will be fetched.
     * Example: "ipfs://<CID>/" - the token ID will be appended.
     */
    constructor(string memory initialBaseURI, address initialOwner) ERC1155(initialBaseURI) Ownable(initialOwner) {
        _baseTokenURI = initialBaseURI;
    }

    /**
     * @dev Sets the base URI for token metadata.
     * Only callable by the owner.
     */
    function setBaseURI(string memory newBaseURI) public onlyOwner {
        _baseTokenURI = newBaseURI;
        _setURI(newBaseURI); // Update the base URI in the parent ERC1155 contract
    }

    /**
     * @dev Returns the base URI used for token metadata.
     */
    function baseURI() public view returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev Overrides the default uri function to support potential per-token URIs if needed.
     * Currently returns baseURI concatenated with tokenId.
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        _requireMinted(tokenId);
        string memory currentBaseURI = baseURI();
        return bytes(currentBaseURI).length > 0
            ? string(abi.encodePacked(currentBaseURI, tokenId.toString(), ".json")) // Assumes metadata is JSON
            : "";
    }

    /**
     * @dev Creates a new type of card (token ID) with specified rarity and initial attributes.
     * Mints an initial supply to the owner or a designated address.
     * Only callable by the owner (or potentially a Minter role/contract).
     * Returns the ID of the newly created card type.
     */
    function createCardType(uint8 rarity, string memory initialAttributes, uint256 initialSupply, address mintTo) public onlyOwner returns (uint256) {
        uint256 newTokenId = _nextTokenId++;
        cardRarity[newTokenId] = rarity;
        cardAttributes[newTokenId] = initialAttributes;

        if (initialSupply > 0) {
            _mint(mintTo, newTokenId, initialSupply, ""); // Mint initial supply
        }

        emit NewCardTypeCreated(newTokenId, rarity, initialAttributes);
        return newTokenId;
    }

    /**
     * @dev Mints additional supply of an existing card type.
     * Only callable by the owner (or a designated Minter role/contract).
     * This would typically be called by the BoosterPack contract after a VRF result.
     */
    function mintCard(address to, uint256 tokenId, uint256 amount, bytes memory data) public onlyOwner { // TODO: Refine access control (e.g., Minter Role or specific contract)
        _requireMinted(tokenId); // Ensure the card type exists
        _mint(to, tokenId, amount, data);
    }

    /**
     * @dev Mints batch of cards.
     * Only callable by the owner (or a designated Minter role/contract).
     */
    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) public onlyOwner { // TODO: Refine access control
        _mintBatch(to, ids, amounts, data);
    }

    /**
     * @dev Updates the dynamic attributes of a specific card type.
     * Intended to be called by a trusted oracle (via Chainlink Functions).
     * Access control should be restricted to the oracle address.
     */
    function updateCardAttributes(uint256 tokenId, string memory newAttributes) public onlyOwner { // TODO: Restrict access to Oracle address
        _requireMinted(tokenId);
        cardAttributes[tokenId] = newAttributes;
        emit CardAttributesUpdated(tokenId, newAttributes);
    }

    /**
     * @dev Burns a specified amount of a card type from the caller's balance.
     */
    function burn(address account, uint256 id, uint256 amount) public {
        _burn(account, id, amount);
    }

    /**
     * @dev Burns a batch of card types from the caller's balance.
     */
    function burnBatch(address account, uint256[] memory ids, uint256[] memory amounts) public {
        _burnBatch(account, ids, amounts);
    }

    /**
     * @dev Returns the total number of card types created so far.
     * Useful for determining the range of possible card IDs.
     */
    function totalCardTypes() public view returns (uint256) {
        return _nextTokenId;
    }

    // --- Internal helper functions ---

    /**
     * @dev Hook that is called before any token transfer, including minting and burning.
     * Overrides the _update hook from ERC1155.
     */
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts
    ) internal virtual override {
        super._update(from, to, ids, amounts);
        // Add custom logic here if needed (e.g., for transfer restrictions)
    }

    /**
     * @dev Checks if a token ID has been minted (i.e., is less than _nextTokenId).
     */
    function _requireMinted(uint256 tokenId) internal view {
        require(tokenId < _nextTokenId, "CardNFT: Card type does not exist");
    }
}

