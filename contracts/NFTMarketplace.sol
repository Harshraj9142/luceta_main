// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title NFTMarketplace
 * @notice Decentralized marketplace for buying and selling Song NFTs
 * @dev Supports ERC2981 royalties and platform fees
 */
contract NFTMarketplace is Ownable, ReentrancyGuard {
    
    // ============ STRUCTS ============
    
    struct Listing {
        address seller;
        uint256 price;
        uint256 listedAt;
    }

    struct Offer {
        address buyer;
        uint256 amount;
        uint256 expiry;
    }

    // ============ STATE VARIABLES ============
    
    // Platform fee in basis points (250 = 2.5%)
    uint256 public platformFeeBps = 250;
    
    // Maximum platform fee (10%)
    uint256 public constant MAX_PLATFORM_FEE = 1000;
    
    // Fee recipient address
    address public feeRecipient;
    
    // Minimum listing price
    uint256 public minListingPrice = 0.001 ether;
    
    // nft address => tokenId => Listing
    mapping(address => mapping(uint256 => Listing)) public listings;
    
    // nft address => tokenId => Offer[]
    mapping(address => mapping(uint256 => Offer[])) public offers;
    
    // Total volume traded
    uint256 public totalVolume;
    
    // Total fees collected
    uint256 public totalFeesCollected;

    // ============ EVENTS ============

    event Listed(
        address indexed seller,
        address indexed nft,
        uint256 indexed tokenId,
        uint256 price,
        uint256 timestamp
    );

    event Sold(
        address indexed buyer,
        address indexed seller,
        address indexed nft,
        uint256 tokenId,
        uint256 price,
        uint256 platformFee,
        uint256 royaltyAmount
    );

    event Cancelled(
        address indexed seller,
        address indexed nft,
        uint256 indexed tokenId
    );

    event PriceUpdated(
        address indexed seller,
        address indexed nft,
        uint256 indexed tokenId,
        uint256 oldPrice,
        uint256 newPrice
    );

    event OfferMade(
        address indexed buyer,
        address indexed nft,
        uint256 indexed tokenId,
        uint256 amount,
        uint256 expiry
    );

    event OfferAccepted(
        address indexed seller,
        address indexed buyer,
        address indexed nft,
        uint256 tokenId,
        uint256 amount
    );

    event OfferCancelled(
        address indexed buyer,
        address indexed nft,
        uint256 indexed tokenId,
        uint256 offerIndex
    );

    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeRecipientUpdated(address oldRecipient, address newRecipient);
    event MinListingPriceUpdated(uint256 oldPrice, uint256 newPrice);

    // ============ CONSTRUCTOR ============

    constructor(address _feeRecipient) Ownable(msg.sender) {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
    }

    // ============ LISTING FUNCTIONS ============

    /**
     * @notice List an NFT for sale
     * @param nft NFT contract address
     * @param tokenId Token ID to list
     * @param price Listing price in wei
     */
    function listNFT(
        address nft,
        uint256 tokenId,
        uint256 price
    ) external nonReentrant {
        require(price >= minListingPrice, "Price below minimum");
        require(listings[nft][tokenId].price == 0, "Already listed");

        IERC721 token = IERC721(nft);

        require(token.ownerOf(tokenId) == msg.sender, "Not owner");
        require(
            token.getApproved(tokenId) == address(this) ||
            token.isApprovedForAll(msg.sender, address(this)),
            "Marketplace not approved"
        );

        listings[nft][tokenId] = Listing({
            seller: msg.sender,
            price: price,
            listedAt: block.timestamp
        });

        emit Listed(msg.sender, nft, tokenId, price, block.timestamp);
    }

    /**
     * @notice Update listing price
     * @param nft NFT contract address
     * @param tokenId Token ID
     * @param newPrice New price in wei
     */
    function updatePrice(
        address nft,
        uint256 tokenId,
        uint256 newPrice
    ) external nonReentrant {
        Listing storage listing = listings[nft][tokenId];
        
        require(listing.seller == msg.sender, "Not seller");
        require(newPrice >= minListingPrice, "Price below minimum");
        
        uint256 oldPrice = listing.price;
        listing.price = newPrice;
        
        emit PriceUpdated(msg.sender, nft, tokenId, oldPrice, newPrice);
    }

    /**
     * @notice Buy a listed NFT
     * @param nft NFT contract address
     * @param tokenId Token ID to buy
     */
    function buyNFT(
        address nft,
        uint256 tokenId
    ) external payable nonReentrant {
        Listing memory listing = listings[nft][tokenId];

        require(listing.price > 0, "Not listed");
        require(msg.value == listing.price, "Incorrect price");
        require(listing.seller != msg.sender, "Cannot buy own listing");

        // Remove listing first (CEI pattern)
        delete listings[nft][tokenId];

        // Calculate fees
        (uint256 platformFee, uint256 royaltyAmount, address royaltyReceiver) = 
            _calculateFees(nft, tokenId, listing.price);

        uint256 sellerProceeds = listing.price - platformFee - royaltyAmount;

        // Pay platform fee
        if (platformFee > 0) {
            (bool feeSuccess, ) = feeRecipient.call{value: platformFee}("");
            require(feeSuccess, "Platform fee transfer failed");
        }

        // Pay royalty
        if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
            (bool royaltySuccess, ) = royaltyReceiver.call{value: royaltyAmount}("");
            require(royaltySuccess, "Royalty transfer failed");
        }

        // Pay seller
        (bool sellerSuccess, ) = listing.seller.call{value: sellerProceeds}("");
        require(sellerSuccess, "Seller transfer failed");

        // Transfer NFT
        IERC721(nft).safeTransferFrom(listing.seller, msg.sender, tokenId);

        // Update stats
        totalVolume += listing.price;
        totalFeesCollected += platformFee;

        emit Sold(
            msg.sender,
            listing.seller,
            nft,
            tokenId,
            listing.price,
            platformFee,
            royaltyAmount
        );
    }

    /**
     * @notice Cancel an active listing
     * @param nft NFT contract address
     * @param tokenId Token ID
     */
    function cancelListing(
        address nft,
        uint256 tokenId
    ) external nonReentrant {
        Listing memory listing = listings[nft][tokenId];

        require(listing.seller == msg.sender, "Not seller");

        delete listings[nft][tokenId];

        emit Cancelled(msg.sender, nft, tokenId);
    }

    // ============ OFFER FUNCTIONS ============

    /**
     * @notice Make an offer on an NFT
     * @param nft NFT contract address
     * @param tokenId Token ID
     * @param expiry Offer expiry timestamp
     */
    function makeOffer(
        address nft,
        uint256 tokenId,
        uint256 expiry
    ) external payable nonReentrant {
        require(msg.value >= minListingPrice, "Offer too low");
        require(expiry > block.timestamp, "Invalid expiry");
        require(expiry <= block.timestamp + 30 days, "Expiry too far");

        IERC721 token = IERC721(nft);
        require(token.ownerOf(tokenId) != address(0), "Token doesn't exist");
        require(token.ownerOf(tokenId) != msg.sender, "Cannot offer on own NFT");

        offers[nft][tokenId].push(Offer({
            buyer: msg.sender,
            amount: msg.value,
            expiry: expiry
        }));

        emit OfferMade(msg.sender, nft, tokenId, msg.value, expiry);
    }

    /**
     * @notice Accept an offer
     * @param nft NFT contract address
     * @param tokenId Token ID
     * @param offerIndex Index of offer to accept
     */
    function acceptOffer(
        address nft,
        uint256 tokenId,
        uint256 offerIndex
    ) external nonReentrant {
        IERC721 token = IERC721(nft);
        require(token.ownerOf(tokenId) == msg.sender, "Not owner");
        
        Offer[] storage tokenOffers = offers[nft][tokenId];
        require(offerIndex < tokenOffers.length, "Invalid offer index");
        
        Offer memory offer = tokenOffers[offerIndex];
        require(offer.expiry > block.timestamp, "Offer expired");
        require(offer.amount > 0, "Offer cancelled");

        // Remove offer
        tokenOffers[offerIndex].amount = 0;

        // Remove listing if exists
        if (listings[nft][tokenId].price > 0) {
            delete listings[nft][tokenId];
        }

        // Calculate fees
        (uint256 platformFee, uint256 royaltyAmount, address royaltyReceiver) = 
            _calculateFees(nft, tokenId, offer.amount);

        uint256 sellerProceeds = offer.amount - platformFee - royaltyAmount;

        // Pay platform fee
        if (platformFee > 0) {
            (bool feeSuccess, ) = feeRecipient.call{value: platformFee}("");
            require(feeSuccess, "Platform fee transfer failed");
        }

        // Pay royalty
        if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
            (bool royaltySuccess, ) = royaltyReceiver.call{value: royaltyAmount}("");
            require(royaltySuccess, "Royalty transfer failed");
        }

        // Pay seller
        (bool sellerSuccess, ) = msg.sender.call{value: sellerProceeds}("");
        require(sellerSuccess, "Seller transfer failed");

        // Transfer NFT
        token.safeTransferFrom(msg.sender, offer.buyer, tokenId);

        // Update stats
        totalVolume += offer.amount;
        totalFeesCollected += platformFee;

        emit OfferAccepted(msg.sender, offer.buyer, nft, tokenId, offer.amount);
    }

    /**
     * @notice Cancel an offer and get refund
     * @param nft NFT contract address
     * @param tokenId Token ID
     * @param offerIndex Index of offer to cancel
     */
    function cancelOffer(
        address nft,
        uint256 tokenId,
        uint256 offerIndex
    ) external nonReentrant {
        Offer[] storage tokenOffers = offers[nft][tokenId];
        require(offerIndex < tokenOffers.length, "Invalid offer index");
        
        Offer memory offer = tokenOffers[offerIndex];
        require(offer.buyer == msg.sender, "Not offer maker");
        require(offer.amount > 0, "Already cancelled");

        // Mark as cancelled
        tokenOffers[offerIndex].amount = 0;

        // Refund
        (bool success, ) = msg.sender.call{value: offer.amount}("");
        require(success, "Refund failed");

        emit OfferCancelled(msg.sender, nft, tokenId, offerIndex);
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @notice Get listing details
     * @param nft NFT contract address
     * @param tokenId Token ID
     * @return seller Seller address
     * @return price Listing price
     * @return listedAt Listing timestamp
     */
    function getListing(address nft, uint256 tokenId) 
        external 
        view 
        returns (address seller, uint256 price, uint256 listedAt) 
    {
        Listing memory listing = listings[nft][tokenId];
        return (listing.seller, listing.price, listing.listedAt);
    }

    /**
     * @notice Get all offers for a token
     * @param nft NFT contract address
     * @param tokenId Token ID
     * @return Array of offers
     */
    function getOffers(address nft, uint256 tokenId) 
        external 
        view 
        returns (Offer[] memory) 
    {
        return offers[nft][tokenId];
    }

    /**
     * @notice Check if NFT is listed
     * @param nft NFT contract address
     * @param tokenId Token ID
     * @return True if listed
     */
    function isListed(address nft, uint256 tokenId) external view returns (bool) {
        return listings[nft][tokenId].price > 0;
    }

    /**
     * @notice Calculate fees for a sale
     * @param nft NFT contract address
     * @param tokenId Token ID
     * @param salePrice Sale price
     * @return platformFee Platform fee amount
     * @return royaltyAmount Royalty amount
     * @return royaltyReceiver Royalty receiver address
     */
    function calculateFees(address nft, uint256 tokenId, uint256 salePrice)
        external
        view
        returns (uint256 platformFee, uint256 royaltyAmount, address royaltyReceiver)
    {
        return _calculateFees(nft, tokenId, salePrice);
    }

    // ============ ADMIN FUNCTIONS ============

    /**
     * @notice Update platform fee
     * @param newFeeBps New fee in basis points
     */
    function setPlatformFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= MAX_PLATFORM_FEE, "Fee too high");
        
        uint256 oldFee = platformFeeBps;
        platformFeeBps = newFeeBps;
        
        emit PlatformFeeUpdated(oldFee, newFeeBps);
    }

    /**
     * @notice Update fee recipient
     * @param newRecipient New fee recipient address
     */
    function setFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid address");
        
        address oldRecipient = feeRecipient;
        feeRecipient = newRecipient;
        
        emit FeeRecipientUpdated(oldRecipient, newRecipient);
    }

    /**
     * @notice Update minimum listing price
     * @param newMinPrice New minimum price
     */
    function setMinListingPrice(uint256 newMinPrice) external onlyOwner {
        uint256 oldPrice = minListingPrice;
        minListingPrice = newMinPrice;
        
        emit MinListingPriceUpdated(oldPrice, newMinPrice);
    }

    // ============ INTERNAL FUNCTIONS ============

    /**
     * @dev Calculate platform fee and royalty
     */
    function _calculateFees(address nft, uint256 tokenId, uint256 salePrice)
        internal
        view
        returns (uint256 platformFee, uint256 royaltyAmount, address royaltyReceiver)
    {
        // Platform fee
        platformFee = (salePrice * platformFeeBps) / 10000;

        // Try to get royalty info (ERC2981)
        try IERC2981(nft).royaltyInfo(tokenId, salePrice) returns (
            address receiver,
            uint256 amount
        ) {
            royaltyReceiver = receiver;
            royaltyAmount = amount;
        } catch {
            // NFT doesn't support ERC2981
            royaltyReceiver = address(0);
            royaltyAmount = 0;
        }

        // Ensure fees don't exceed sale price
        require(platformFee + royaltyAmount < salePrice, "Fees exceed price");
    }
}
