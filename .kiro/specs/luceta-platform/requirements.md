# Requirements Document: Luceta Audio Platform

## Introduction

Luceta is a comprehensive AI-powered audio platform that serves game developers and music creators through three integrated systems: a subscription-based web platform with Dodo Payments, an NFT marketplace on Ethereum with IPFS storage, and a Godot game engine plugin for AI-generated sound effects. The platform reduces audio production costs by 90% while enabling creators to monetize their work through blockchain technology.

## Glossary

- **System**: The Luceta platform (web app, smart contracts, Godot plugin)
- **User**: Game developer or music creator using the platform
- **Subscriber**: User with active Dodo Payments subscription
- **Creator**: Music artist minting and selling NFTs
- **Buyer**: User purchasing NFTs from marketplace
- **NFT**: ERC-721 token representing music ownership
- **IPFS**: InterPlanetary File System for decentralized storage
- **Godot_Plugin**: Editor plugin for Godot game engine
- **AI_Agent**: ElevenLabs conversational AI for support
- **Smart_Contract**: Solidity contracts (SongNFT, NFTMarketplace)
- **Requestly**: API mocking tool for development/testing

## Requirements

### Requirement 1: User Authentication & Wallet Connection

**User Story:** As a user, I want to connect my Web3 wallet and authenticate, so that I can access platform features and manage my assets.

#### Acceptance Criteria

1. WHEN a user clicks "Connect Wallet", THE System SHALL display MetaMask connection prompt
2. WHEN wallet connection succeeds, THE System SHALL store wallet address in session
3. WHEN a user disconnects wallet, THE System SHALL clear session and return to unauthenticated state
4. THE System SHALL display connected wallet address in navigation bar
5. WHEN wallet is not connected, THE System SHALL restrict access to marketplace and minting features

### Requirement 2: Subscription Management via Dodo Payments

**User Story:** As a game developer, I want to subscribe to a pricing tier, so that I can access Godot plugin features and API limits.

#### Acceptance Criteria

1. WHEN a user selects a pricing tier (Starter/Pro/Enterprise), THE System SHALL create Dodo Payments checkout session
2. WHEN checkout session is created, THE System SHALL redirect user to Dodo Payments checkout URL
3. WHEN payment completes, THE System SHALL receive webhook notification from Dodo Payments
4. WHEN webhook is received, THE System SHALL update user subscription status in database
5. THE System SHALL support three tiers: Starter ($9/mo), Pro ($29/mo), Enterprise ($99/mo)
6. WHEN subscription expires, THE System SHALL restrict access to premium features
7. WHEN user cancels subscription, THE System SHALL process cancellation webhook and update status

### Requirement 3: NFT Minting with IPFS Upload

**User Story:** As a music creator, I want to upload my track and mint an NFT, so that I can sell my music on the marketplace.

#### Acceptance Criteria

1. WHEN a creator uploads audio file and cover image, THE System SHALL validate file formats (MP3/WAV for audio, PNG/JPG for image)
2. WHEN files are validated, THE System SHALL upload audio to IPFS via Pinata API
3. WHEN audio upload succeeds, THE System SHALL upload cover image to IPFS via Pinata API
4. WHEN both uploads succeed, THE System SHALL create metadata JSON with name, description, image URI, and animation_url
5. WHEN metadata is created, THE System SHALL upload metadata JSON to IPFS via Pinata API
6. WHEN all uploads complete, THE System SHALL return IPFS URIs (ipfs://...) to frontend
7. WHEN user confirms minting, THE System SHALL call SongNFT smart contract mint function with metadata URI
8. WHEN minting transaction succeeds, THE System SHALL emit success notification with token ID

### Requirement 4: NFT Marketplace Listing & Trading

**User Story:** As an NFT owner, I want to list my NFT for sale, so that buyers can purchase it at my specified price.

#### Acceptance Criteria

1. WHEN an owner lists NFT, THE System SHALL call NFTMarketplace contract listNFT function with token ID and price
2. WHEN listing succeeds, THE System SHALL transfer NFT to marketplace contract for escrow
3. WHEN a buyer purchases NFT, THE System SHALL call buyNFT function with payment in ETH
4. WHEN purchase succeeds, THE System SHALL transfer NFT to buyer and payment to seller
5. THE System SHALL deduct 2.5% marketplace fee from seller payment
6. WHEN owner cancels listing, THE System SHALL return NFT to owner and remove from marketplace
7. THE System SHALL display all active listings with audio preview, cover art, price, and seller address

### Requirement 5: NFT Metadata Fetching & Display

**User Story:** As a marketplace visitor, I want to see NFT details including audio preview, so that I can decide which NFTs to purchase.

#### Acceptance Criteria

1. WHEN marketplace loads, THE System SHALL fetch all listed NFTs from blockchain
2. WHEN NFT data is fetched, THE System SHALL retrieve metadata URI from SongNFT contract
3. WHEN metadata URI is retrieved, THE System SHALL fetch metadata JSON from IPFS gateway (ipfs.io)
4. WHEN metadata is fetched, THE System SHALL parse name, description, image, and animation_url
5. THE System SHALL handle double ipfs:// prefix in URIs correctly
6. WHEN image loads, THE System SHALL display cover art in NFT card
7. WHEN user clicks play button, THE System SHALL stream audio from IPFS gateway
8. THE System SHALL display loading states while fetching blockchain and IPFS data

### Requirement 6: Godot Plugin Code Analysis

**User Story:** As a game developer, I want the plugin to analyze my game code, so that it can suggest contextual sound effects.

#### Acceptance Criteria

1. WHEN user clicks "Analyze Code", THE Godot_Plugin SHALL scan all .gd script files in project
2. WHEN scanning scripts, THE Godot_Plugin SHALL detect function names, signal handlers, and state machines
3. WHEN scanning completes, THE Godot_Plugin SHALL scan all .tscn scene files for nodes and connections
4. WHEN all files are scanned, THE Godot_Plugin SHALL send code context to Groq AI LLM
5. THE Godot_Plugin SHALL cache analysis results to avoid redundant API calls
6. WHEN cache is valid, THE Godot_Plugin SHALL use cached results instead of re-analyzing

### Requirement 7: AI Sound Effect Generation

**User Story:** As a game developer, I want to generate sound effects from text descriptions, so that I can quickly add audio to my game.

#### Acceptance Criteria

1. WHEN user reviews sound suggestions, THE Godot_Plugin SHALL display editable name and description fields
2. WHEN user clicks "Generate Audio", THE Godot_Plugin SHALL call ElevenLabs sound generation API
3. WHEN API call succeeds, THE Godot_Plugin SHALL save MP3 file to res://luceta_generated/ directory
4. WHEN file is saved, THE Godot_Plugin SHALL verify file size and MP3 header validity
5. THE Godot_Plugin SHALL retry failed generations up to 3 times with 2-second delays
6. WHEN generation fails after retries, THE Godot_Plugin SHALL display error message to user
7. THE Godot_Plugin SHALL support custom sound additions with user-provided names and descriptions

### Requirement 8: Auto-Integration of Generated Sounds

**User Story:** As a game developer, I want generated sounds automatically integrated into my scripts, so that I don't have to manually wire audio code.

#### Acceptance Criteria

1. WHEN user clicks "Integrate", THE Godot_Plugin SHALL analyze sound names for target scripts (player, coin, killzone)
2. WHEN target script is found, THE Godot_Plugin SHALL backup original file before modification
3. WHEN backup succeeds, THE Godot_Plugin SHALL insert variable declaration after extends statement
4. WHEN variable is added, THE Godot_Plugin SHALL add ResourceLoader.exists check in _ready function
5. WHEN sound is loaded, THE Godot_Plugin SHALL insert _play_sfx call at appropriate code location
6. WHEN helper function is missing, THE Godot_Plugin SHALL add _play_sfx helper function to script
7. WHEN integration completes, THE Godot_Plugin SHALL display report of modified files and integrated sounds
8. WHEN user clicks "Revert All", THE Godot_Plugin SHALL restore all backed-up files and delete generated sounds

### Requirement 9: ElevenLabs AI Voice Agent

**User Story:** As a platform user, I want to interact with an AI support agent, so that I can get help with onboarding and technical issues.

#### Acceptance Criteria

1. WHEN user opens voice agent widget, THE AI_Agent SHALL establish WebRTC connection for voice chat
2. WHEN connection is established, THE AI_Agent SHALL display "Ready to chat" status
3. WHEN user speaks, THE AI_Agent SHALL transcribe speech and generate contextual responses
4. WHEN user clicks "Call Me", THE AI_Agent SHALL initiate outbound phone call via Twilio
5. THE AI_Agent SHALL handle questions about subscriptions, NFT minting, and Godot plugin usage
6. WHEN conversation ends, THE AI_Agent SHALL close WebRTC connection and cleanup resources

### Requirement 10: Requestly API Mocking for Development

**User Story:** As a developer, I want to mock external APIs during development, so that I can test without consuming API credits or gas fees.

#### Acceptance Criteria

1. WHEN Requestly rules are enabled, THE System SHALL intercept Dodo Payments checkout requests
2. WHEN checkout request is intercepted, THE System SHALL return mock checkout URL and session data
3. WHEN Requestly rules are enabled, THE System SHALL intercept ElevenLabs API calls
4. WHEN ElevenLabs request is intercepted, THE System SHALL return mock audio file or generation response
5. WHEN Requestly rules are enabled, THE System SHALL intercept IPFS upload requests
6. WHEN IPFS request is intercepted, THE System SHALL return mock IPFS CID
7. WHEN Requestly rules are enabled, THE System SHALL add delay simulation for testing loading states
8. THE System SHALL inject demo banner when Requestly mock mode is active

### Requirement 11: Smart Contract Deployment & Interaction

**User Story:** As a platform operator, I want to deploy smart contracts to Ethereum, so that NFT marketplace functionality is available on-chain.

#### Acceptance Criteria

1. WHEN deploying contracts, THE System SHALL deploy SongNFT ERC-721 contract to Sepolia testnet
2. WHEN SongNFT deploys, THE System SHALL deploy NFTMarketplace contract with SongNFT address
3. WHEN contracts are deployed, THE System SHALL save contract addresses to configuration
4. THE System SHALL use viem library for ABI encoding and contract interactions
5. WHEN user mints NFT, THE System SHALL estimate gas and let MetaMask handle gas limit
6. WHEN transaction fails, THE System SHALL display error message with transaction details
7. THE System SHALL support contract verification on Etherscan for transparency

### Requirement 12: Project Settings Configuration

**User Story:** As a Godot plugin user, I want to configure API keys in project settings, so that the plugin can access external services.

#### Acceptance Criteria

1. WHEN plugin is enabled, THE Godot_Plugin SHALL register luceta/groq_api_key project setting
2. WHEN plugin is enabled, THE Godot_Plugin SHALL register luceta/elevenlabs_api_key project setting
3. WHEN API keys are not in settings, THE Godot_Plugin SHALL check for GROQ_API_KEY.txt file
4. WHEN API keys are not in settings, THE Godot_Plugin SHALL check for ELEVEN_LABS_API_KEY.txt file
5. WHEN API keys are missing, THE Godot_Plugin SHALL display error message in dock
6. THE Godot_Plugin SHALL load API keys on initialization and store in memory

### Requirement 13: Error Handling & User Feedback

**User Story:** As a user, I want clear error messages when operations fail, so that I can understand what went wrong and how to fix it.

#### Acceptance Criteria

1. WHEN network request fails, THE System SHALL display user-friendly error message
2. WHEN wallet transaction fails, THE System SHALL display transaction error details
3. WHEN file upload fails, THE System SHALL display specific error (file too large, invalid format, etc.)
4. WHEN API rate limit is hit, THE System SHALL display rate limit message and retry suggestion
5. WHEN smart contract call fails, THE System SHALL parse revert reason and display to user
6. THE System SHALL log detailed errors to console for debugging
7. WHEN operation succeeds, THE System SHALL display success notification with relevant details

### Requirement 14: Caching & Performance Optimization

**User Story:** As a user, I want fast load times and responsive interactions, so that the platform feels smooth and professional.

#### Acceptance Criteria

1. WHEN Godot plugin analyzes code, THE Godot_Plugin SHALL cache results in .godot/luceta_cache/
2. WHEN cache is valid, THE Godot_Plugin SHALL skip re-analysis and use cached data
3. WHEN files are modified, THE Godot_Plugin SHALL invalidate cache based on file modification time
4. WHEN marketplace loads, THE System SHALL cache NFT metadata to reduce IPFS requests
5. THE System SHALL use Next.js image optimization for cover art display
6. THE System SHALL implement loading skeletons for async data fetching
7. WHEN audio streams, THE System SHALL use progressive loading for large files
