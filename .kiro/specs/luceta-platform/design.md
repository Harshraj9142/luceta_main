# Design Document: Luceta Audio Platform

## Overview

Luceta is a multi-layered audio platform consisting of three integrated systems:

1. **Web Platform** (Next.js 15 + React 19) - Subscription management, NFT marketplace, AI voice agent
2. **Smart Contracts** (Solidity + Hardhat) - ERC-721 NFTs, marketplace escrow, royalty distribution
3. **Godot Plugin** (GDScript) - AI code analysis, sound generation, auto-integration

The platform uses a microservices-style architecture where each component communicates through well-defined APIs and blockchain interactions.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Next.js    │  │   React 19   │  │  Tailwind    │      │
│  │   App Router │  │  Components  │  │     CSS      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Layer                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   /checkout  │  │   /upload    │  │  /listings   │      │
│  │   /webhooks  │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
         │                  │                    │
         ▼                  ▼                    ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐
│     Dodo     │  │    Pinata    │  │   Ethereum Network   │
│   Payments   │  │     IPFS     │  │   (Sepolia Testnet)  │
└──────────────┘  └──────────────┘  └──────────────────────┘
                                              │
                                              ▼
                                    ┌──────────────────────┐
                                    │  Smart Contracts     │
                                    │  - SongNFT (ERC-721) │
                                    │  - NFTMarketplace    │
                                    └──────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Godot Plugin Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Code Analyzer│  │  LLM Analyzer│  │  ElevenLabs  │      │
│  │  (GDScript)  │  │   (Groq AI)  │  │  Generator   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Audio     │  │    Sound     │  │   Backup     │      │
│  │    Cache     │  │  Integrator  │  │   Manager    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Development Tools                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Requestly   │  │   Hardhat    │  │     viem     │      │
│  │  API Mocks   │  │   Testing    │  │  Blockchain  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Web Platform Components

#### PricingSection Component
```typescript
interface PricingTier {
  name: string;
  price: number;
  productId: string;
  features: string[];
}

interface CheckoutRequest {
  product_id: string;
  customer: {
    email: string;
    name: string;
  };
  plan_type: 'monthly' | 'yearly';
  quantity: number;
}

interface CheckoutResponse {
  success: boolean;
  checkout_url: string;
  session_id: string;
  product: {
    id: string;
    name: string;
    price: number;
  };
}
```

#### NFTMarketplace Component
```typescript
interface NFTListing {
  tokenId: bigint;
  seller: string;
  price: bigint;
  isActive: boolean;
}

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  animation_url: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

interface NFTCard {
  tokenId: bigint;
  metadata: NFTMetadata;
  listing: NFTListing;
  owner: string;
}
```

#### Web3Provider Component
```typescript
interface Web3State {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
}

interface Web3Actions {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchChain: (chainId: number) => Promise<void>;
}
```

### 2. API Endpoints

#### POST /api/checkout
- **Purpose**: Create Dodo Payments checkout session
- **Input**: CheckoutRequest
- **Output**: CheckoutResponse
- **Process**:
  1. Validate product_id exists in Dodo Payments
  2. Create checkout session with return URL
  3. Return checkout URL for redirect

#### POST /api/upload
- **Purpose**: Upload audio and metadata to IPFS
- **Input**: FormData (audio file, cover image, metadata)
- **Output**: { audioURI, imageURI, metadataURI }
- **Process**:
  1. Convert files to Blob format
  2. Upload audio to Pinata
  3. Upload cover image to Pinata
  4. Create metadata JSON with IPFS URIs
  5. Upload metadata JSON to Pinata
  6. Return all IPFS URIs

#### GET /api/listings
- **Purpose**: Fetch all NFT listings from blockchain
- **Input**: None
- **Output**: Array<NFTCard>
- **Process**:
  1. Connect to Sepolia RPC
  2. Call NFTMarketplace.getAllListings()
  3. For each listing, fetch tokenURI from SongNFT
  4. Fetch metadata from IPFS gateway
  5. Parse and return combined data

#### POST /api/webhooks/dodo
- **Purpose**: Handle Dodo Payments webhook events
- **Input**: Webhook payload + signature
- **Output**: { received: true }
- **Process**:
  1. Verify webhook signature
  2. Parse event type (payment.completed, subscription.created, etc.)
  3. Update database with subscription status
  4. Send confirmation email to user

### 3. Smart Contracts

#### SongNFT Contract (ERC-721)
```solidity
contract SongNFT is ERC721URIStorage {
    uint256 private _tokenIdCounter;
    
    function mint(address to, string memory tokenURI) 
        external 
        returns (uint256);
    
    function tokenURI(uint256 tokenId) 
        public 
        view 
        override 
        returns (string memory);
}
```

#### NFTMarketplace Contract
```solidity
struct Listing {
    uint256 tokenId;
    address seller;
    uint256 price;
    bool isActive;
}

contract NFTMarketplace {
    mapping(uint256 => Listing) public listings;
    uint256 public constant MARKETPLACE_FEE = 250; // 2.5%
    
    function listNFT(uint256 tokenId, uint256 price) external;
    function buyNFT(uint256 tokenId) external payable;
    function cancelListing(uint256 tokenId) external;
    function getAllListings() external view returns (Listing[] memory);
}
```

### 4. Godot Plugin Components

#### CodeAnalyzer (GDScript)
```gdscript
class_name CodeAnalyzer

signal analysis_complete(results: Dictionary)

func analyze_project(project_path: String) -> void:
    var results = {
        "events": [],
        "actions": [],
        "scenes": []
    }
    
    # Scan .gd files
    var gd_files = _find_files(project_path, "*.gd")
    for file in gd_files:
        results.events.append_array(_analyze_script(file))
    
    # Scan .tscn files
    var tscn_files = _find_files(project_path, "*.tscn")
    for file in tscn_files:
        results.scenes.append_array(_analyze_scene(file))
    
    analysis_complete.emit(results)
```

#### ElevenLabsGenerator (GDScript)
```gdscript
class_name ElevenLabsGenerator

signal audio_generated(sound_name: String, file_path: String)
signal generation_error(sound_name: String, error: String)

var api_key: String
var output_directory: String = "res://luceta_generated/"

func generate_sound_effect(sound_data: Dictionary, http_request: HTTPRequest):
    var url = "https://api.elevenlabs.io/v1/sound-generation"
    var headers = [
        "xi-api-key: " + api_key,
        "Content-Type: application/json"
    ]
    var body = {
        "text": sound_data.description,
        "duration_seconds": _estimate_duration(sound_data.description)
    }
    http_request.request(url, headers, HTTPClient.METHOD_POST, JSON.stringify(body))
```

#### SoundIntegrator (GDScript)
```gdscript
class_name SoundIntegrator

const SOUND_TARGETS = {
    "jump": {"scripts": ["player"], "pattern": "JUMP_VELOCITY"},
    "coin": {"scripts": ["coin"], "pattern": "_on_body_entered"},
    "death": {"scripts": ["killzone"], "pattern": "_on_body_entered"}
}

func integrate_sounds(sound_mappings: Array, project_path: String) -> Dictionary:
    var report = {
        "files_modified": [],
        "sounds_integrated": []
    }
    
    for mapping in sound_mappings:
        var target = _find_target_script(mapping.name)
        if target:
            _add_sound_to_script(target.file_path, mapping.name, mapping.path)
            report.sounds_integrated.append(mapping.name)
    
    return report
```

## Data Models

### Database Schema (Future Implementation)

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    dodo_subscription_id VARCHAR(255) UNIQUE,
    tier VARCHAR(50) NOT NULL, -- 'starter', 'pro', 'enterprise'
    status VARCHAR(50) NOT NULL, -- 'active', 'cancelled', 'expired'
    current_period_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- NFT Metadata Cache (for performance)
CREATE TABLE nft_metadata_cache (
    token_id BIGINT PRIMARY KEY,
    metadata_uri TEXT NOT NULL,
    metadata_json JSONB,
    last_fetched TIMESTAMP DEFAULT NOW()
);

-- Webhook Events Log
CREATE TABLE webhook_events (
    id UUID PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### IPFS Metadata Structure

```json
{
  "name": "Midnight Dreams",
  "description": "A lo-fi ambient track perfect for relaxation",
  "image": "ipfs://QmCoverImageCID",
  "animation_url": "ipfs://QmAudioFileCID",
  "attributes": [
    {
      "trait_type": "Artist",
      "value": "DJ Luceta"
    },
    {
      "trait_type": "Genre",
      "value": "Lo-Fi"
    },
    {
      "trait_type": "Duration",
      "value": "3:45"
    },
    {
      "trait_type": "BPM",
      "value": "85"
    }
  ]
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Wallet Connection State Consistency
*For any* user session, if wallet is connected then wallet address must be non-null and displayed in UI, and if wallet is disconnected then wallet address must be null and UI must show "Connect Wallet" button.
**Validates: Requirements 1.2, 1.3, 1.4**

### Property 2: Subscription Checkout Round Trip
*For any* valid pricing tier selection, creating a checkout session then receiving payment.completed webhook should result in user subscription status being "active" with correct tier.
**Validates: Requirements 2.1, 2.3, 2.4**

### Property 3: IPFS Upload Atomicity
*For any* NFT minting attempt, if audio upload succeeds but image upload fails, then no metadata should be created and no IPFS URIs should be returned to user.
**Validates: Requirements 3.2, 3.3, 3.4, 3.5**

### Property 4: NFT Marketplace Escrow Safety
*For any* NFT listing, the NFT must be held in marketplace contract escrow and seller cannot transfer it until listing is cancelled or purchase completes.
**Validates: Requirements 4.2, 4.6**

### Property 5: Marketplace Fee Calculation
*For any* NFT purchase, the seller payment must equal (purchase price - 2.5% fee) and marketplace contract balance must increase by exactly 2.5% of purchase price.
**Validates: Requirements 4.5**

### Property 6: IPFS URI Prefix Handling
*For any* metadata URI, whether it contains single or double "ipfs://" prefix, the system must correctly resolve to the same IPFS gateway URL.
**Validates: Requirements 5.5**

### Property 7: Code Analysis Caching
*For any* Godot project, if files have not been modified since last analysis, then cached results must be used and no LLM API call should be made.
**Validates: Requirements 6.5, 6.6, 14.1, 14.2**

### Property 8: Sound Generation Retry Idempotence
*For any* sound generation request, retrying up to 3 times with same parameters should produce equivalent audio file (same duration, similar waveform).
**Validates: Requirements 7.5**

### Property 9: Auto-Integration Reversibility
*For any* set of integrated sounds, clicking "Revert All" must restore all modified scripts to their exact original state and delete all generated audio files.
**Validates: Requirements 8.8**

### Property 10: Smart Contract Gas Estimation
*For any* blockchain transaction, if MetaMask estimates gas successfully, then transaction should not fail due to out-of-gas error.
**Validates: Requirements 11.5**

### Property 11: API Key Configuration Fallback
*For any* Godot plugin initialization, if API keys are not in project settings, then plugin must check for .txt files, and if neither exists, then error message must be displayed.
**Validates: Requirements 12.3, 12.4, 12.5**

### Property 12: Error Message Clarity
*For any* failed operation, the error message displayed to user must contain actionable information (what failed, why, and how to fix).
**Validates: Requirements 13.1, 13.2, 13.3, 13.4, 13.5**

### Property 13: Requestly Mock Consistency
*For any* API request when Requestly rules are enabled, the mock response must match the expected schema of the real API response.
**Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6**

### Property 14: NFT Metadata Cache Freshness
*For any* cached NFT metadata, if cache age exceeds 24 hours, then fresh metadata must be fetched from IPFS before displaying to user.
**Validates: Requirements 14.4**

## Error Handling

### Web Platform Error Handling

1. **Network Errors**
   - Retry failed requests up to 3 times with exponential backoff
   - Display toast notification with retry button
   - Log error details to console for debugging

2. **Wallet Errors**
   - User rejected transaction → Display "Transaction cancelled by user"
   - Insufficient funds → Display "Insufficient ETH balance for transaction + gas"
   - Wrong network → Prompt user to switch to Sepolia testnet
   - Wallet not installed → Display link to install MetaMask

3. **Smart Contract Errors**
   - Parse revert reason from error message
   - Display user-friendly version of revert reason
   - Provide transaction hash for Etherscan lookup

4. **IPFS Upload Errors**
   - File too large → Display max file size limit
   - Invalid format → Display supported formats
   - Pinata API error → Retry with exponential backoff

### Godot Plugin Error Handling

1. **API Key Errors**
   - Missing key → Display setup instructions in dock
   - Invalid key → Display "API key invalid, please check settings"
   - Rate limit → Display "Rate limit reached, please wait X seconds"

2. **File System Errors**
   - Cannot create directory → Display permission error
   - Cannot write file → Check disk space and permissions
   - File already exists → Prompt user to overwrite or rename

3. **Generation Errors**
   - Network timeout → Retry with longer timeout
   - Invalid response → Log response body and display generic error
   - Corrupted audio → Validate MP3 header before saving

## Testing Strategy

### Unit Testing

**Web Platform (Jest + React Testing Library)**
- Component rendering tests for all UI components
- API endpoint tests with mocked external services
- Smart contract interaction tests with Hardhat
- Utility function tests (IPFS URI parsing, fee calculation)

**Godot Plugin (GDScript Unit Tests)**
- Code analyzer pattern matching tests
- Sound integrator target detection tests
- Cache invalidation logic tests
- File system operation tests

### Property-Based Testing

**Web Platform (fast-check)**
- Property 1: Wallet state consistency across connect/disconnect cycles
- Property 2: Subscription status updates match webhook events
- Property 3: IPFS upload atomicity with random failure injection
- Property 5: Marketplace fee calculation with random prices
- Property 6: IPFS URI prefix handling with various formats

**Smart Contracts (Foundry)**
- Property 4: NFT escrow safety with fuzz testing
- Property 5: Fee calculation with random purchase amounts
- Property 10: Gas estimation accuracy across transaction types

**Godot Plugin (Property Tests via Python)**
- Property 7: Cache hit rate with file modification scenarios
- Property 8: Sound generation retry consistency
- Property 9: Integration reversibility with random sound sets

### Integration Testing

1. **End-to-End Subscription Flow**
   - User selects tier → Checkout → Payment → Webhook → Status update
   - Verify database state at each step
   - Test with Requestly mocks and real Dodo Payments

2. **End-to-End NFT Minting Flow**
   - Upload files → IPFS → Mint transaction → Marketplace listing
   - Verify blockchain state and IPFS content
   - Test with Sepolia testnet

3. **End-to-End Godot Plugin Flow**
   - Analyze code → Generate sounds → Integrate → Verify game runs
   - Test with sample Godot project
   - Verify generated audio plays correctly

### Manual Testing Checklist

- [ ] Connect wallet with MetaMask on Sepolia
- [ ] Subscribe to each pricing tier
- [ ] Upload and mint NFT with various file formats
- [ ] List NFT and purchase from different wallet
- [ ] Install Godot plugin and analyze sample project
- [ ] Generate sounds with various descriptions
- [ ] Integrate sounds and verify game audio works
- [ ] Test Requestly mocks for all APIs
- [ ] Test error scenarios (network failures, invalid inputs)
- [ ] Test on different browsers (Chrome, Firefox, Safari)

### Performance Testing

- Measure NFT marketplace load time with 100+ listings
- Measure IPFS fetch time for audio streaming
- Measure Godot plugin analysis time for large projects
- Measure smart contract gas costs for all operations
- Verify cache hit rates for repeated operations

### Security Testing

- Test smart contract reentrancy protection
- Test webhook signature verification
- Test IPFS content validation (no malicious files)
- Test wallet connection security (no private key exposure)
- Test API key storage security in Godot plugin
