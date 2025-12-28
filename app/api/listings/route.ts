import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

const SONG_NFT = "0xf867653ed2f1379dFF986b972F52159e85649dF2";
const MARKETPLACE = "0x1e8982e197a88a23Fa60189aAa7B753bb1C37e59";

const client = createPublicClient({
  chain: sepolia,
  transport: http("https://eth-sepolia.g.alchemy.com/v2/TTv-2_LhIs8KWHfpliz5L"),
});

const songNFTAbi = [
  {
    name: "totalMinted",
    type: "function",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    name: "tokenURI",
    type: "function",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "string" }],
    stateMutability: "view",
  },
  {
    name: "ownerOf",
    type: "function",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },
  {
    name: "getCreator",
    type: "function",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },
] as const;

const marketplaceAbi = [
  {
    name: "getListing",
    type: "function",
    inputs: [
      { name: "nft", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [
      { name: "seller", type: "address" },
      { name: "price", type: "uint256" },
      { name: "listedAt", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    name: "isListed",
    type: "function",
    inputs: [
      { name: "nft", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
    stateMutability: "view",
  },
] as const;

async function fetchMetadata(uri: string) {
  try {
    console.log("Fetching metadata from:", uri);
    
    let url = uri;
    
    // Handle double ipfs:// prefix
    if (uri.startsWith("ipfs://ipfs://")) {
      url = uri.replace("ipfs://ipfs://", "https://ipfs.io/ipfs/");
    }
    // Handle ipfs:// with base64 data (malformed)
    else if (uri.startsWith("ipfs://data:application/json;base64,")) {
      const base64 = uri.replace("ipfs://data:application/json;base64,", "");
      return JSON.parse(Buffer.from(base64, "base64").toString());
    }
    // Handle normal base64 data URI
    else if (uri.startsWith("data:application/json;base64,")) {
      const base64 = uri.replace("data:application/json;base64,", "");
      return JSON.parse(Buffer.from(base64, "base64").toString());
    }
    // Handle normal IPFS URI
    else if (uri.startsWith("ipfs://")) {
      url = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
    }

    console.log("Fetching from URL:", url);
    
    const res = await fetch(url, { 
      next: { revalidate: 60 },
      headers: { 'Accept': 'application/json' }
    });
    
    if (!res.ok) {
      console.error("Fetch failed:", res.status, res.statusText);
      return null;
    }
    
    const data = await res.json();
    console.log("Metadata fetched:", data.name);
    return data;
  } catch (e) {
    console.error("Metadata fetch error:", e);
    return null;
  }
}

export async function GET() {
  try {
    // Get total minted
    const totalMinted = await client.readContract({
      address: SONG_NFT as `0x${string}`,
      abi: songNFTAbi,
      functionName: "totalMinted",
    });

    const nfts = [];
    const total = Number(totalMinted);

    // Fetch all NFTs
    for (let i = 0; i < total; i++) {
      try {
        // Get token data
        const [tokenURI, owner, creator] = await Promise.all([
          client.readContract({
            address: SONG_NFT as `0x${string}`,
            abi: songNFTAbi,
            functionName: "tokenURI",
            args: [BigInt(i)],
          }),
          client.readContract({
            address: SONG_NFT as `0x${string}`,
            abi: songNFTAbi,
            functionName: "ownerOf",
            args: [BigInt(i)],
          }),
          client.readContract({
            address: SONG_NFT as `0x${string}`,
            abi: songNFTAbi,
            functionName: "getCreator",
            args: [BigInt(i)],
          }),
        ]);

        // Check if listed
        const [seller, price, listedAt] = await client.readContract({
          address: MARKETPLACE as `0x${string}`,
          abi: marketplaceAbi,
          functionName: "getListing",
          args: [SONG_NFT as `0x${string}`, BigInt(i)],
        });

        const isListed = price > 0n;

        // Fetch metadata
        const metadata = await fetchMetadata(tokenURI);

        nfts.push({
          tokenId: i,
          tokenURI,
          owner,
          creator,
          isListed,
          seller: isListed ? seller : null,
          price: isListed ? price.toString() : null,
          priceEth: isListed ? (Number(price) / 1e18).toFixed(4) : null,
          listedAt: isListed ? Number(listedAt) : null,
          metadata: metadata || {
            name: `Song NFT #${i}`,
            description: "Audio NFT",
            image: "",
            animation_url: "",
          },
        });
      } catch (e) {
        console.error(`Error fetching token ${i}:`, e);
      }
    }

    return NextResponse.json({
      success: true,
      total,
      nfts,
      listed: nfts.filter((n) => n.isListed),
    });
  } catch (error) {
    console.error("Listings error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch listings" },
      { status: 500 }
    );
  }
}
