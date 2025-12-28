"use client";

import { motion } from "framer-motion";
import { Wallet, AlertCircle, LogOut } from "lucide-react";
import { useWeb3 } from "./Web3Provider";
import { formatAddress } from "@/lib/web3";

export function WalletButton() {
  const { account, isConnected, isCorrectNetwork, connect, disconnect, switchNetwork } = useWeb3();

  if (!isConnected) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={connect}
        className="flex items-center gap-2 px-4 py-2 bg-[#156d95] text-white rounded-xl font-medium hover:bg-[#156d95]/90 transition-colors"
      >
        <Wallet className="w-4 h-4" />
        Connect Wallet
      </motion.button>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={switchNetwork}
        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
      >
        <AlertCircle className="w-4 h-4" />
        Switch to Sepolia
      </motion.button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-xl font-medium">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        {formatAddress(account!)}
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={disconnect}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <LogOut className="w-4 h-4" />
      </motion.button>
    </div>
  );
}
