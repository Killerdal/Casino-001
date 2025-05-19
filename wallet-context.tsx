
import React, { createContext, useState, useEffect } from "react";
import { connectWallet as connectWeb3Wallet, getCurrentAccount, subscribeToAccountChanges, WalletType } from "@/lib/web3";
import { useToast } from "@/hooks/use-toast";
import { UserBalance } from "@/context/shared-state";

interface WalletContextProps {
  walletAddress: string | null;
  isWalletConnected: boolean;
  isConnecting: boolean;
  balances: UserBalance[];
  isLoading: boolean;
  connectWallet: (walletType?: WalletType) => Promise<void>;
  disconnectWallet: () => void;
  refreshBalances: (isUserAuthenticated?: boolean) => Promise<void>;
  getBalance: (currency: string) => number | undefined;
}

export const WalletContext = createContext<WalletContextProps | null>(null);

interface WalletProviderProps {
  children: React.ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [balances, setBalances] = useState<UserBalance[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const connectWallet = async (walletType?: WalletType) => {
    if (isConnecting || isWalletConnected) return;
    
    setIsConnecting(true);
    try {
      const address = await connectWeb3Wallet(walletType);
      
      if (address) {
        await fetch("/api/wallet/connect", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ walletAddress: address }),
          credentials: "include"
        });
      }
      
      setWalletAddress(address);
      setIsWalletConnected(!!address);
      
      toast({
        title: "Bet.99 Wallet Connected",
        description: `Connected to ${address?.substring(0, 6)}...${address?.substring(address.length - 4)}`,
      });
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setIsWalletConnected(false);
    setBalances([]);
    
    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  const refreshBalances = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/wallet/balances", {
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        setBalances(data.balances || []);
      } else {
        setBalances([]);
      }
    } catch (error) {
      console.error("Error fetching balances:", error);
      setBalances([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getBalance = (currency: string) => {
    const balance = balances.find(b => b.currency === currency);
    return balance?.amount;
  };

  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        const address = await getCurrentAccount();
        setWalletAddress(address);
        setIsWalletConnected(!!address);
        if (address) {
          await refreshBalances();
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    };
    
    checkWalletConnection();
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    if (isWalletConnected) {
      unsubscribe = subscribeToAccountChanges((accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== walletAddress) {
          setWalletAddress(accounts[0]);
          refreshBalances();
          
          toast({
            title: "Account changed",
            description: `Connected to ${accounts[0].substring(0, 6)}...${accounts[0].substring(accounts[0].length - 4)}`,
          });
        }
      });
    }
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isWalletConnected, walletAddress]);

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        isWalletConnected,
        isConnecting,
        balances,
        isLoading,
        connectWallet,
        disconnectWallet,
        refreshBalances,
        getBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
