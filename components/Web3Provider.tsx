"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  connectWallet,
  getCurrentAccount,
  switchToSepolia,
  formatAddress,
  isMetaMaskInstalled,
} from "@/lib/web3";
import { CONTRACTS } from "@/lib/contracts";

type Web3ContextType = {
  account: string | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
};

const Web3Context = createContext<Web3ContextType>({
  account: null,
  isConnected: false,
  isCorrectNetwork: false,
  connect: async () => {},
  disconnect: () => {},
  switchNetwork: async () => {},
});

export const useWeb3 = () => useContext(Web3Context);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  useEffect(() => {
    // Check initial connection
    getCurrentAccount().then(setAccount);

    // Check network
    checkNetwork();

    // Listen for account changes
    if (isMetaMaskInstalled()) {
      window.ethereum!.on("accountsChanged", (accounts: string[]) => {
        setAccount(accounts[0] || null);
      });

      window.ethereum!.on("chainChanged", () => {
        checkNetwork();
      });
    }
  }, []);

  const checkNetwork = async () => {
    if (!isMetaMaskInstalled()) return;
    try {
      const chainId = await window.ethereum!.request({ method: "eth_chainId" });
      setIsCorrectNetwork(parseInt(chainId, 16) === CONTRACTS.CHAIN_ID);
    } catch {
      setIsCorrectNetwork(false);
    }
  };

  const connect = async () => {
    const addr = await connectWallet();
    if (addr) {
      setAccount(addr);
      await switchToSepolia();
      await checkNetwork();
    }
  };

  const disconnect = () => {
    setAccount(null);
  };

  const switchNetwork = async () => {
    await switchToSepolia();
    await checkNetwork();
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        isConnected: !!account,
        isCorrectNetwork,
        connect,
        disconnect,
        switchNetwork,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}
