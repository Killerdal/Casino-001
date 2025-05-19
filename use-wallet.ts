import { useContext } from "react";
import { WalletContext } from "@/context/wallet-context";

export const useWallet = () => {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }

  const { 
    walletAddress, 
    isWalletConnected, 
    isConnecting, 
    balances, 
    isLoading, 
    connectWallet, 
    disconnectWallet,
    refreshBalances,
    getBalance,
  } = context;

  return {
    walletAddress,
    isWalletConnected,
    isConnecting,
    balances,
    isLoading,
    connectWallet,
    disconnectWallet,
    refreshBalances,
    getBalance,
  };
};

export default useWallet;
