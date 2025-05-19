import { useContext } from "react";
import { AppContext } from "@/context/app-context";

// Hook for using the entire app context
export const useAppContext = () => {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  
  return context;
};

// Auth-specific hook
export const useAuth = () => {
  const context = useAppContext();
  
  return {
    user: context.user,
    isAuthenticated: context.isAuthenticated,
    isLoading: context.authLoading,
    login: context.login,
    signup: context.signup,
    logout: context.logout,
    checkAuth: context.checkAuth,
  };
};

// Wallet-specific hook
export const useWallet = () => {
  const context = useAppContext();
  
  return {
    walletAddress: context.walletAddress,
    isWalletConnected: context.isWalletConnected,
    isConnecting: context.isConnecting,
    balances: context.balances,
    isLoading: context.walletLoading,
    connectWallet: context.connectWallet,
    disconnectWallet: context.disconnectWallet,
    refreshBalances: context.refreshBalances,
    getBalance: context.getBalance,
  };
};