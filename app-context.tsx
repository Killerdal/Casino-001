import React, { createContext, useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { connectWallet as connectWeb3Wallet, getCurrentAccount, subscribeToAccountChanges } from "@/lib/web3";

// User Types
interface User {
  id: number;
  username: string;
  email: string;
  walletAddress?: string;
}

// Balance Types
interface UserBalance {
  id: number;
  userId: number;
  currency: string;
  amount: number;
  updatedAt: string;
}

// App Context Types
interface AppContextType {
  // Auth State
  user: User | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  
  // Wallet State
  walletAddress: string | null;
  isWalletConnected: boolean;
  isConnecting: boolean;
  balances: UserBalance[];
  walletLoading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshBalances: () => Promise<void>;
  getBalance: (currency: string) => number | undefined;
}

// Create the context
export const AppContext = createContext<AppContextType | null>(null);

// Provider Props
interface AppProviderProps {
  children: React.ReactNode;
}

// App Provider Component
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const { toast } = useToast();
  
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  
  // Wallet state
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [balances, setBalances] = useState<UserBalance[]>([]);
  const [walletLoading, setWalletLoading] = useState<boolean>(false);
  
  // Check if user is already authenticated
  const checkAuth = useCallback(async () => {
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
      console.error("Auth check error:", error);
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);
  
  // Login user
  const login = async (username: string, password: string) => {
    setAuthLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        title: "Welcome back!",
        description: `You're now signed in as ${data.user.username}`,
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again",
        variant: "destructive",
      });
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };
  
  // Signup user
  const signup = async (username: string, email: string, password: string) => {
    setAuthLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        title: "Account created!",
        description: "Your account has been created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "Please try a different username or email",
        variant: "destructive",
      });
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };
  
  // Logout user
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      
      setUser(null);
      setIsAuthenticated(false);
      
      // Also disconnect wallet when user logs out
      disconnectWallet();
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };
  
  // Connect wallet
  const connectWallet = async () => {
    if (isConnecting || isWalletConnected) return;
    
    setIsConnecting(true);
    try {
      const address = await connectWeb3Wallet();
      
      if (address && isAuthenticated) {
        // Register wallet with backend
        const response = await fetch("/api/wallet/connect", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ walletAddress: address }),
          credentials: "include"
        });
        
        if (!response.ok) {
          throw new Error("Failed to register wallet with your account");
        }
      }
      
      setWalletAddress(address);
      setIsWalletConnected(!!address);
      
      // Fetch balances after connecting wallet
      if (address && isAuthenticated) {
        await refreshBalances();
      }
      
      toast({
        title: "Wallet connected",
        description: address ? `Connected to ${address.substring(0, 6)}...${address.substring(address.length - 4)}` : "Connected successfully",
      });
    } catch (error: any) {
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Disconnect wallet
  const disconnectWallet = () => {
    setWalletAddress(null);
    setIsWalletConnected(false);
    setBalances([]);
    
    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected",
    });
  };
  
  // Fetch user balances
  const refreshBalances = async () => {
    if (!isAuthenticated) return;
    
    setWalletLoading(true);
    try {
      const response = await fetch("/api/wallet/balances", {
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch balances");
      }
      
      const data = await response.json();
      setBalances(data);
    } catch (error) {
      console.error("Error fetching balances:", error);
    } finally {
      setWalletLoading(false);
    }
  };
  
  // Get specific currency balance
  const getBalance = (currency: string) => {
    const balance = balances.find(b => b.currency === currency);
    return balance ? balance.amount : undefined;
  };
  
  // Check auth on component mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  // Check for existing wallet connection
  useEffect(() => {
    async function checkWalletConnection() {
      try {
        const currentAccount = await getCurrentAccount();
        if (currentAccount && isAuthenticated) {
          setWalletAddress(currentAccount);
          setIsWalletConnected(true);
          await refreshBalances();
        }
      } catch (error) {
        console.error("Failed to check wallet connection:", error);
      }
    }

    if (isAuthenticated) {
      checkWalletConnection();
    }
  }, [isAuthenticated]);
  
  // Subscribe to account changes
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    if (isWalletConnected) {
      unsubscribe = subscribeToAccountChanges((accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          disconnectWallet();
        } else if (accounts[0] !== walletAddress) {
          // User switched accounts
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
  
  // Provide context value
  const contextValue: AppContextType = {
    // Auth
    user,
    isAuthenticated,
    authLoading,
    login,
    signup,
    logout,
    checkAuth,
    
    // Wallet
    walletAddress,
    isWalletConnected,
    isConnecting,
    balances,
    walletLoading,
    connectWallet,
    disconnectWallet,
    refreshBalances,
    getBalance,
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};