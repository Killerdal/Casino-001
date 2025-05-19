import React, { createContext, useState, useEffect, useCallback } from "react";
import { connectWallet as connectWeb3Wallet, getCurrentAccount, subscribeToAccountChanges } from "@/lib/web3";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  email: string;
  walletAddress?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

interface UserBalance {
  id: number;
  userId: number;
  currency: string;
  amount: number;
  updatedAt: string;
}

interface WalletContextType {
  walletAddress: string | null;
  isWalletConnected: boolean;
  isConnecting: boolean;
  balances: UserBalance[];
  isLoading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshBalances: () => Promise<void>;
  getBalance: (currency: string) => number | undefined;
}

interface AppContextType {
  auth: AuthContextType;
  wallet: WalletContextType;
}

export const AppContext = createContext<AppContextType | null>(null);

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  
  // Wallet state
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [balances, setBalances] = useState<UserBalance[]>([]);
  const [walletLoading, setWalletLoading] = useState<boolean>(false);
  
  const { toast } = useToast();

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Check wallet connection
  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        const address = await getCurrentAccount();
        setWalletAddress(address);
        setIsWalletConnected(!!address);
        
        if (address && isAuthenticated) {
          await refreshBalances();
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    };
    
    checkWalletConnection();
  }, [isAuthenticated]);

  // Subscribe to account changes
  useEffect(() => {
    if (isWalletConnected) {
      const unsubscribe = subscribeToAccountChanges((accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== walletAddress) {
          setWalletAddress(accounts[0]);
          refreshBalances();
        }
      });
      
      return () => unsubscribe();
    }
  }, [isWalletConnected, walletAddress]);

  // Auth Methods
  const checkAuth = async () => {
    setAuthLoading(true);
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }
      
      const data = await response.json();
      setUser(data.user);
      setIsAuthenticated(true);
      
      toast({
        title: "Welcome to Bet.99",
        description: `Welcome back, ${data.user.username}!`,
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Signup failed");
      }
      
      const data = await response.json();
      setUser(data.user);
      setIsAuthenticated(true);
      
      toast({
        title: "Account Created",
        description: "Welcome to Bet.99 Casino!",
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message || "Could not create account",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      
      setUser(null);
      setIsAuthenticated(false);
      disconnectWallet();
      
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Logout Failed",
        description: "There was an error logging out",
        variant: "destructive",
      });
    }
  };

  // Wallet Methods
  const connectWallet = async () => {
    if (isConnecting || isWalletConnected) return;
    
    setIsConnecting(true);
    try {
      const address = await connectWeb3Wallet();
      
      if (address && isAuthenticated) {
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
        title: "Wallet Connected",
        description: `Connected to ${address?.substring(0, 6)}...${address?.substring(address.length - 4)}`,
      });
      
      if (address && isAuthenticated) {
        await refreshBalances();
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
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
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  const refreshBalances = async () => {
    if (!isAuthenticated) return;
    
    setWalletLoading(true);
    try {
      const response = await fetch("/api/wallet/balances", {
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        setBalances(data.balances || []);
      }
    } catch (error) {
      console.error("Error fetching balances:", error);
    } finally {
      setWalletLoading(false);
    }
  };

  const getBalance = (currency: string) => {
    const balance = balances.find(b => b.currency === currency);
    return balance?.amount;
  };

  const authContext: AuthContextType = {
    user,
    isAuthenticated,
    isLoading: authLoading,
    login,
    signup,
    logout,
    checkAuth
  };

  const walletContext: WalletContextType = {
    walletAddress,
    isWalletConnected,
    isConnecting,
    balances,
    isLoading: walletLoading,
    connectWallet,
    disconnectWallet,
    refreshBalances,
    getBalance
  };

  return (
    <AppContext.Provider
      value={{
        auth: authContext,
        wallet: walletContext
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error("useAuth must be used within an AppProvider");
  }
  return context.auth;
};

export const useWallet = () => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error("useWallet must be used within an AppProvider");
  }
  return context.wallet;
};