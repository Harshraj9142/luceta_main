// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SongNFT
 * @notice ERC721 NFT contract for audio/song assets with royalty support
 * @dev Implements ERC2981 for on-chain royalties
 */
contract SongNFT is ERC721, ERC721Enumerable, ERC721URIStorage, ERC2981, Ownable, ReentrancyGuard {
    
    uint256 public nextTokenId;
    uint256 public immutable MAX_SUPPLY;
    uint256 public mintPrice;
    string private baseTokenURI;
    
    // Mapping from token ID to creator address (for royalties)
    mapping(uint256 => address) public creators;
    
    // Default royalty percentage (in basis points, 500 = 5%)
    uint96 public defaultRoyaltyBps = 500;

    // Events
    event Minted(address indexed to, uint256 indexed tokenId, string tokenURI);
    event MintPriceUpdated(uint256 oldPrice, uint256 newPrice);
    event RoyaltyUpdated(uint256 indexed tokenId, address receiver, uint96 feeBps);
    event BaseURIUpdated(string newBaseURI);

    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseURI_,
        uint256 maxSupply_,
        uint256 mintPrice_
    ) ERC721(name_, symbol_) Ownable(msg.sender) {
        baseTokenURI = baseURI_;
        MAX_SUPPLY = maxSupply_;
        mintPrice = mintPrice_;
        
        // Set default royalty to contract owner
        _setDefaultRoyalty(msg.sender, defaultRoyaltyBps);
    }

    /**
     * @notice Mint a new Song NFT (owner only)
     * @param to Address to mint to
     * @param uri Token metadata URI
     */
    function mint(address to, string calldata uri) external onlyOwner {
        require(nextTokenId < MAX_SUPPLY, "Max supply reached");

        uint256 tokenId = nextTokenId;
        nextTokenId++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        creators[tokenId] = to;
        _setTokenRoyalty(tokenId, to, defaultRoyaltyBps);

        emit Minted(to, tokenId, uri);
    }

    /**
     * @notice Public mint function for users
     * @param uri Token metadata URI
     */
    function publicMint(string calldata uri) external payable nonReentrant {
        require(nextTokenId < MAX_SUPPLY, "Max supply reached");
        require(msg.value >= mintPrice, "Insufficient payment");

        uint256 tokenId = nextTokenId;
        nextTokenId++;
        
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        
        creators[tokenId] = msg.sender;
        _setTokenRoyalty(tokenId, msg.sender, defaultRoyaltyBps);

        // Refund excess payment
        if (msg.value > mintPrice) {
            (bool success, ) = msg.sender.call{value: msg.value - mintPrice}("");
            require(success, "Refund failed");
        }

        emit Minted(msg.sender, tokenId, uri);
    }

    /**
     * @notice Batch mint multiple NFTs (owner only)
     * @param to Address to mint to
     * @param uris Array of token URIs
     */
    function batchMint(address to, string[] calldata uris) external onlyOwner {
        require(nextTokenId + uris.length <= MAX_SUPPLY, "Would exceed max supply");
        
        for (uint256 i = 0; i < uris.length; i++) {
            uint256 tokenId = nextTokenId;
            nextTokenId++;
            
            _safeMint(to, tokenId);
            _setTokenURI(tokenId, uris[i]);
            
            creators[tokenId] = to;
            _setTokenRoyalty(tokenId, to, defaultRoyaltyBps);

            emit Minted(to, tokenId, uris[i]);
        }
    }

    /**
     * @notice Update royalty for a specific token (creator only)
     * @param tokenId Token ID
     * @param receiver New royalty receiver
     * @param feeBps New fee in basis points
     */
    function updateTokenRoyalty(
        uint256 tokenId,
        address receiver,
        uint96 feeBps
    ) external {
        require(creators[tokenId] == msg.sender, "Not creator");
        require(feeBps <= 1000, "Royalty too high"); // Max 10%
        
        _setTokenRoyalty(tokenId, receiver, feeBps);
        
        emit RoyaltyUpdated(tokenId, receiver, feeBps);
    }

    /**
     * @notice Set mint price (owner only)
     * @param newPrice New mint price in wei
     */
    function setMintPrice(uint256 newPrice) external onlyOwner {
        uint256 oldPrice = mintPrice;
        mintPrice = newPrice;
        emit MintPriceUpdated(oldPrice, newPrice);
    }

    /**
     * @notice Set default royalty percentage (owner only)
     * @param feeBps Fee in basis points (500 = 5%)
     */
    function setDefaultRoyalty(uint96 feeBps) external onlyOwner {
        require(feeBps <= 1000, "Royalty too high"); // Max 10%
        defaultRoyaltyBps = feeBps;
        _setDefaultRoyalty(owner(), feeBps);
    }

    /**
     * @notice Set base URI (owner only)
     * @param newBaseURI New base URI
     */
    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        baseTokenURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }

    /**
     * @notice Withdraw contract balance (owner only)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdraw failed");
    }

    /**
     * @notice Get creator of a token
     * @param tokenId Token ID
     * @return Creator address
     */
    function getCreator(uint256 tokenId) external view returns (address) {
        require(_ownerOf(tokenId) != address(0), "Token doesn't exist");
        return creators[tokenId];
    }

    /**
     * @notice Get total minted count
     * @return Number of tokens minted
     */
    function totalMinted() external view returns (uint256) {
        return nextTokenId;
    }

    /**
     * @notice Check if max supply reached
     * @return True if max supply reached
     */
    function isSoldOut() external view returns (bool) {
        return nextTokenId >= MAX_SUPPLY;
    }

    // ============ OVERRIDES ============

    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        override(ERC721, ERC721Enumerable, ERC721URIStorage, ERC2981) 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }
}
