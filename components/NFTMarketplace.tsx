"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Loader2,
  ExternalLink,
  Upload,
  Music,
  Image as ImageIcon,
  X,
  RefreshCw,
  Tag,
  Play,
} from "lucide-react";
import { useWeb3 } from "./Web3Provider";
import { WalletButton } from "./WalletButton";
import { mintNFT, buyNFT, listNFT } from "@/lib/web3";
import { CONTRACTS } from "@/lib/contracts";

type NFTItem = {
  tokenId: number;
  tokenURI: string;
  owner: string;
  creator: string;
  isListed: boolean;
  seller: string | null;
  price: string | null;
  priceEth: string | null;
  listedAt: number | null;
  metadata: {
    name: string;
    description: string;
    image: string;
    animation_url: string;
    attributes?: { trait_type: string; value: string }[];
  };
};

export function NFTMarketplace() {
  const { account, isConnected, isCorrectNetwork } = useWeb3();
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [listedNfts, setListedNfts] = useState<NFTItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMintModal, setShowMintModal] = useState(false);
  const [showListModal, setShowListModal] = useState<NFTItem | null>(null);
  const [isBuying, setIsBuying] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"listed" | "all" | "my">("listed");

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/listings");
      const data = await res.json();
      if (data.success) {
        setNfts(data.nfts);
        setListedNfts(data.listed);
      }
    } catch (error) {
      console.error("Failed to fetch listings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleBuy = async (nft: NFTItem) => {
    if (!isConnected || !isCorrectNetwork || !nft.price) return;

    setIsBuying(nft.tokenId);
    try {
      const txHash = await buyNFT(nft.tokenId, BigInt(nft.price));
      if (txHash) {
        alert(`Purchase successful! TX: ${txHash}`);
        fetchListings();
      }
    } catch (error: any) {
      alert(`Purchase failed: ${error.message}`);
    } finally {
      setIsBuying(null);
    }
  };

  const getDisplayNfts = () => {
    let display = nfts;
    if (activeTab === "listed") {
      display = listedNfts;
    } else if (activeTab === "my" && account) {
      display = nfts.filter(
        (n) => n.owner.toLowerCase() === account.toLowerCase()
      );
    }

    if (searchQuery) {
      display = display.filter(
        (nft) =>
          nft.metadata.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          nft.metadata.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return display;
  };

  const displayNfts = getDisplayNfts();
  const myNfts = account
    ? nfts.filter((n) => n.owner.toLowerCase() === account.toLowerCase())
    : [];

  return (
    <section className="w-full py-24 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-normal text-gray-900 mb-4">
            NFT Audio Marketplace
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Mint, buy, and sell unique audio NFTs on Sepolia testnet.
          </p>

          {/* Contract Links */}
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 mb-8">
            <a
              href={`https://sepolia.etherscan.io/address/${CONTRACTS.SONG_NFT}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-[#156d95]"
            >
              SongNFT <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={`https://sepolia.etherscan.io/address/${CONTRACTS.MARKETPLACE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-[#156d95]"
            >
              Marketplace <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Search & Actions */}
          <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search audio NFTs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#156d95]/20"
              />
            </div>

            <button
              onClick={fetchListings}
              className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>

            {isConnected && isCorrectNetwork && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMintModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-[#156d95] text-white rounded-xl font-medium"
              >
                <Plus className="w-5 h-5" />
                Mint NFT
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {[
            { id: "listed", label: "For Sale", count: listedNfts.length },
            { id: "all", label: "All NFTs", count: nfts.length },
            { id: "my", label: "My NFTs", count: myNfts.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-[#156d95] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <div className="text-center py-8 bg-gray-100 rounded-2xl mb-8">
            <p className="text-gray-600 mb-4">Connect wallet to buy or mint NFTs</p>
            <WalletButton />
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#156d95]" />
            <p className="text-gray-600">Loading NFTs from blockchain...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && displayNfts.length === 0 && (
          <div className="text-center py-16 bg-gray-50 rounded-2xl">
            <Music className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === "listed"
                ? "No NFTs for sale"
                : activeTab === "my"
                ? "You don't own any NFTs"
                : "No NFTs minted yet"}
            </h3>
            <p className="text-gray-600 mb-4">
              {activeTab === "my"
                ? "Mint your first audio NFT!"
                : "Be the first to mint an audio NFT!"}
            </p>
            {isConnected && (
              <button
                onClick={() => setShowMintModal(true)}
                className="px-6 py-2 bg-[#156d95] text-white rounded-lg"
              >
                Mint NFT
              </button>
            )}
          </div>
        )}

        {/* NFT Grid */}
        {!isLoading && displayNfts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayNfts.map((nft, index) => (
              <NFTCard
                key={nft.tokenId}
                nft={nft}
                index={index}
                account={account}
                isConnected={isConnected}
                isCorrectNetwork={isCorrectNetwork}
                isBuying={isBuying === nft.tokenId}
                onBuy={() => handleBuy(nft)}
                onList={() => setShowListModal(nft)}
              />
            ))}
          </div>
        )}

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { label: "Total NFTs", value: nfts.length.toString() },
            { label: "For Sale", value: listedNfts.length.toString() },
            {
              label: "Floor Price",
              value: listedNfts.length > 0
                ? `${Math.min(...listedNfts.map((n) => parseFloat(n.priceEth || "0"))).toFixed(4)} ETH`
                : "N/A",
            },
            { label: "Platform Fee", value: "2.5%" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center p-6 bg-white rounded-xl border border-gray-200"
            >
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Modals */}
      {showMintModal && <MintModal onClose={() => setShowMintModal(false)} onSuccess={fetchListings} />}
      {showListModal && (
        <ListModal
          nft={showListModal}
          onClose={() => setShowListModal(null)}
          onSuccess={fetchListings}
        />
      )}
    </section>
  );
}

function NFTCard({
  nft,
  index,
  account,
  isConnected,
  isCorrectNetwork,
  isBuying,
  onBuy,
  onList,
}: {
  nft: NFTItem;
  index: number;
  account: string | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  isBuying: boolean;
  onBuy: () => void;
  onList: () => void;
}) {
  const isOwner = account && nft.owner.toLowerCase() === account.toLowerCase();
  
  // Convert IPFS URIs to HTTP gateway URLs
  const convertIpfsUrl = (uri: string | undefined) => {
    if (!uri) return "";
    if (uri.startsWith("ipfs://ipfs://")) {
      return uri.replace("ipfs://ipfs://", "https://ipfs.io/ipfs/");
    }
    if (uri.startsWith("ipfs://")) {
      return uri.replace("ipfs://", "https://ipfs.io/ipfs/");
    }
    return uri;
  };
  
  const audioUrl = convertIpfsUrl(nft.metadata.animation_url);
  const imageUrl = convertIpfsUrl(nft.metadata.image);

  const getAttribute = (trait: string) => {
    return nft.metadata.attributes?.find((a) => a.trait_type === trait)?.value;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all"
    >
      {/* Image/Cover */}
      <div className="h-48 bg-gradient-to-br from-[#156d95]/20 to-[#1e7ba8]/20 flex items-center justify-center relative">
        {imageUrl && !imageUrl.includes("placeholder") ? (
          <img src={imageUrl} alt={nft.metadata.name} className="w-full h-full object-cover" />
        ) : (
          <div className="text-6xl">🎵</div>
        )}
        
        {/* Audio Player */}
        {audioUrl && (
          <div className="absolute bottom-2 left-2 right-2">
            <audio controls className="w-full h-8" style={{ height: "32px" }}>
              <source src={audioUrl} type="audio/mpeg" />
            </audio>
          </div>
        )}

        {/* Listed Badge */}
        {nft.isListed && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            For Sale
          </div>
        )}

        {/* Owner Badge */}
        {isOwner && (
          <div className="absolute top-2 left-2 bg-[#156d95] text-white text-xs px-2 py-1 rounded-full">
            Owned
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-medium text-[#156d95] bg-[#156d95]/10 px-2 py-1 rounded-full">
            {getAttribute("Genre") || "Audio"}
          </span>
          {nft.isListed && (
            <span className="text-lg font-semibold">{nft.priceEth} ETH</span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
          {nft.metadata.name}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {nft.metadata.description}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>Token #{nft.tokenId}</span>
          <span>by {getAttribute("Artist") || "Unknown"}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {isConnected && isCorrectNetwork && (
            <>
              {nft.isListed && !isOwner && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onBuy}
                  disabled={isBuying}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#156d95] text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {isBuying ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Buy Now"
                  )}
                </motion.button>
              )}

              {isOwner && !nft.isListed && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onList}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium"
                >
                  <Tag className="w-4 h-4" />
                  List for Sale
                </motion.button>
              )}

              {isOwner && nft.isListed && (
                <span className="flex-1 text-center py-2 text-sm text-gray-500">
                  Listed for {nft.priceEth} ETH
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function MintModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [uploadedURI, setUploadedURI] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!audioFile || !title) return;

    setIsUploading(true);
    setStatus("Uploading to IPFS...");

    try {
      const formData = new FormData();
      formData.append("audio", audioFile);
      formData.append("name", title);
      formData.append("description", description);
      formData.append("artist", artist);
      formData.append("genre", genre);
      if (coverFile) formData.append("cover", coverFile);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setUploadedURI(data.metadataURI);
      setStatus(`✓ Uploaded to IPFS`);
    } catch (error: any) {
      setStatus(`✗ ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleMint = async () => {
    if (!uploadedURI) return;

    setIsMinting(true);
    console.log("Minting with URI:", uploadedURI);
    setStatus(`Minting NFT with URI: ${uploadedURI.slice(0, 50)}...`);

    try {
      const txHash = await mintNFT(uploadedURI);
      if (txHash) {
        setStatus(`✓ Minted! TX: ${txHash.slice(0, 20)}...`);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      }
    } catch (error: any) {
      console.error("Mint error:", error);
      setStatus(`✗ ${error.message}`);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Mint Audio NFT</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Audio File *</label>
            <input ref={audioInputRef} type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} className="hidden" />
            <button onClick={() => audioInputRef.current?.click()} className="w-full p-4 border-2 border-dashed rounded-xl hover:border-[#156d95] flex items-center justify-center gap-2">
              <Music className="w-5 h-5 text-gray-400" />
              {audioFile ? <span className="text-[#156d95]">{audioFile.name}</span> : <span className="text-gray-500">Upload audio</span>}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Cover Image</label>
            <input ref={coverInputRef} type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} className="hidden" />
            <button onClick={() => coverInputRef.current?.click()} className="w-full p-4 border-2 border-dashed rounded-xl hover:border-[#156d95] flex items-center justify-center gap-2">
              <ImageIcon className="w-5 h-5 text-gray-400" />
              {coverFile ? <span className="text-[#156d95]">{coverFile.name}</span> : <span className="text-gray-500">Upload cover</span>}
            </button>
          </div>

          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title *" className="w-full px-4 py-2 border rounded-lg" />
          <input type="text" value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Artist" className="w-full px-4 py-2 border rounded-lg" />
          <select value={genre} onChange={(e) => setGenre(e.target.value)} className="w-full px-4 py-2 border rounded-lg">
            <option value="">Select genre</option>
            <option value="Electronic">Electronic</option>
            <option value="Lo-Fi">Lo-Fi</option>
            <option value="Ambient">Ambient</option>
            <option value="Game SFX">Game SFX</option>
            <option value="Orchestral">Orchestral</option>
          </select>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={2} className="w-full px-4 py-2 border rounded-lg" />

          {status && <div className="p-3 bg-gray-100 rounded-lg text-sm">{status}</div>}
          <p className="text-sm text-gray-500">Mint price: 0.001 ETH</p>
        </div>

        <div className="flex gap-3 mt-6">
          {!uploadedURI ? (
            <button onClick={handleUpload} disabled={!audioFile || !title || isUploading} className="flex-1 py-3 bg-[#156d95] text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2">
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {isUploading ? "Uploading..." : "Upload to IPFS"}
            </button>
          ) : (
            <button onClick={handleMint} disabled={isMinting} className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2">
              {isMinting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isMinting ? "Minting..." : "Mint NFT"}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function ListModal({ nft, onClose, onSuccess }: { nft: NFTItem; onClose: () => void; onSuccess: () => void }) {
  const [price, setPrice] = useState("0.01");
  const [isListing, setIsListing] = useState(false);
  const [status, setStatus] = useState("");

  const handleList = async () => {
    if (!price || parseFloat(price) <= 0) return;

    setIsListing(true);
    setStatus("Approving & listing...");

    try {
      const txHash = await listNFT(nft.tokenId, price);
      if (txHash) {
        setStatus(`✓ Listed! TX: ${txHash.slice(0, 20)}...`);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      }
    } catch (error: any) {
      setStatus(`✗ ${error.message}`);
    } finally {
      setIsListing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">List for Sale</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="font-medium">{nft.metadata.name}</p>
          <p className="text-sm text-gray-500">Token #{nft.tokenId}</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Price (ETH)</label>
          <input type="number" step="0.001" min="0.001" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
          <p className="text-xs text-gray-500 mt-1">Platform fee: 2.5%</p>
        </div>

        {status && <div className="p-3 bg-gray-100 rounded-lg text-sm mb-4">{status}</div>}

        <button onClick={handleList} disabled={isListing || !price} className="w-full py-3 bg-green-600 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2">
          {isListing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tag className="w-4 h-4" />}
          {isListing ? "Listing..." : "List for Sale"}
        </button>
      </motion.div>
    </div>
  );
}
