"use client";

import { CONTRACTS } from "./contracts";
import { encodeFunctionData, parseEther as viemParseEther } from "viem";

// Check if window.ethereum exists
export const isMetaMaskInstalled = () => {
  return typeof window !== "undefined" && Boolean(window.ethereum);
};

// Connect wallet
export async function connectWallet(): Promise<string | null> {
  if (!isMetaMaskInstalled()) {
    alert("Please install MetaMask to use this feature");
    return null;
  }

  try {
    const accounts = await window.ethereum!.request({
      method: "eth_requestAccounts",
    });
    return accounts[0];
  } catch (error) {
    console.error("Failed to connect wallet:", error);
    return null;
  }
}

// Get current account
export async function getCurrentAccount(): Promise<string | null> {
  if (!isMetaMaskInstalled()) return null;

  try {
    const accounts = await window.ethereum!.request({
      method: "eth_accounts",
    });
    return accounts[0] || null;
  } catch {
    return null;
  }
}

// Switch to Sepolia network
export async function switchToSepolia(): Promise<boolean> {
  if (!isMetaMaskInstalled()) return false;

  try {
    await window.ethereum!.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${CONTRACTS.CHAIN_ID.toString(16)}` }],
    });
    return true;
  } catch (switchError: any) {
    if (switchError.code === 4902) {
      try {
        await window.ethereum!.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${CONTRACTS.CHAIN_ID.toString(16)}`,
              chainName: "Sepolia Testnet",
              nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
              rpcUrls: ["https://rpc.sepolia.org"],
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            },
          ],
        });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

// Format address for display
export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Parse ETH to Wei
export function parseEther(value: string): bigint {
  return viemParseEther(value);
}

// Format Wei to ETH
export function formatEther(wei: bigint): string {
  return (Number(wei) / 1e18).toFixed(4);
}

// ABI for encoding
const publicMintAbi = [
  {
    name: "publicMint",
    type: "function",
    inputs: [{ name: "uri", type: "string" }],
    outputs: [],
    stateMutability: "payable",
  },
] as const;

const mintPriceAbi = [
  {
    name: "mintPrice",
    type: "function",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

const approveAbi = [
  {
    name: "approve",
    type: "function",
    inputs: [
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

const listNFTAbi = [
  {
    name: "listNFT",
    type: "function",
    inputs: [
      { name: "nft", type: "address" },
      { name: "tokenId", type: "uint256" },
      { name: "price", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

const buyNFTAbi = [
  {
    name: "buyNFT",
    type: "function",
    inputs: [
      { name: "nft", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "payable",
  },
] as const;

// Mint NFT
export async function mintNFT(tokenURI: string): Promise<string | null> {
  if (!isMetaMaskInstalled()) return null;

  try {
    const accounts = await window.ethereum!.request({ method: "eth_accounts" });
    if (!accounts[0]) throw new Error("No account connected");

    // Validate tokenURI - should be IPFS URI
    if (!tokenURI.startsWith("ipfs://")) {
      throw new Error("Invalid token URI - must be IPFS URI");
    }

    console.log("Minting with URI:", tokenURI);

    // Get mint price (0.001 ETH)
    const mintPriceHex = "0x38D7EA4C68000"; // 0.001 ETH in hex

    // Encode publicMint call
    const data = encodeFunctionData({
      abi: publicMintAbi,
      functionName: "publicMint",
      args: [tokenURI],
    });

    console.log("Sending transaction...");
    console.log("To:", CONTRACTS.SONG_NFT);
    console.log("Value:", mintPriceHex);
    console.log("Data length:", data.length);

    const txHash = await window.ethereum!.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: accounts[0],
          to: CONTRACTS.SONG_NFT,
          value: mintPriceHex,
          data,
        },
      ],
    });

    return txHash;
  } catch (error: any) {
    console.error("Mint failed:", error);
    // Check for specific error types
    if (error.code === 4001) {
      throw new Error("Transaction rejected by user");
    }
    throw error;
  }
}

// List NFT for sale
export async function listNFT(
  tokenId: number,
  priceInEth: string
): Promise<string | null> {
  if (!isMetaMaskInstalled()) return null;

  try {
    const accounts = await window.ethereum!.request({ method: "eth_accounts" });
    if (!accounts[0]) throw new Error("No account connected");

    // First approve marketplace
    const approveData = encodeFunctionData({
      abi: approveAbi,
      functionName: "approve",
      args: [CONTRACTS.MARKETPLACE as `0x${string}`, BigInt(tokenId)],
    });

    await window.ethereum!.request({
      method: "eth_sendTransaction",
      params: [{ from: accounts[0], to: CONTRACTS.SONG_NFT, data: approveData }],
    });

    // Then list
    const priceWei = parseEther(priceInEth);
    const listData = encodeFunctionData({
      abi: listNFTAbi,
      functionName: "listNFT",
      args: [CONTRACTS.SONG_NFT as `0x${string}`, BigInt(tokenId), priceWei],
    });

    const txHash = await window.ethereum!.request({
      method: "eth_sendTransaction",
      params: [{ from: accounts[0], to: CONTRACTS.MARKETPLACE, data: listData }],
    });

    return txHash;
  } catch (error) {
    console.error("List failed:", error);
    throw error;
  }
}

// Buy NFT
export async function buyNFT(
  tokenId: number,
  priceWei: bigint
): Promise<string | null> {
  if (!isMetaMaskInstalled()) return null;

  try {
    const accounts = await window.ethereum!.request({ method: "eth_accounts" });
    if (!accounts[0]) throw new Error("No account connected");

    const data = encodeFunctionData({
      abi: buyNFTAbi,
      functionName: "buyNFT",
      args: [CONTRACTS.SONG_NFT as `0x${string}`, BigInt(tokenId)],
    });

    const txHash = await window.ethereum!.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: accounts[0],
          to: CONTRACTS.MARKETPLACE,
          value: `0x${priceWei.toString(16)}`,
          data,
        },
      ],
    });

    return txHash;
  } catch (error) {
    console.error("Buy failed:", error);
    throw error;
  }
}

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}
