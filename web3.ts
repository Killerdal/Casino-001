interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, callback: (...args: any[]) => void) => void;
  removeListener: (event: string, callback: (...args: any[]) => void) => void;
  selectedAddress: string | null;
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  isWalletConnect?: boolean;
  isTrust?: boolean;
}

interface PhantomProvider {
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  on: (event: string, callback: (...args: any[]) => void) => void;
  removeListener: (event: string, callback: (...args: any[]) => void) => void;
  isPhantom?: boolean;
  publicKey?: { toString: () => string };
}

export type WalletType = 'metamask' | 'coinbase' | 'walletconnect' | 'trust' | 'phantom';

// Get Ethereum provider (for ETH, BSC, Polygon, etc.)
export const getEthereumProvider = (): EthereumProvider | null => {
  // Check for various Ethereum providers
  if ((window as any).ethereum) {
    return (window as any).ethereum;
  }
  
  // Check for Coinbase Wallet
  if ((window as any).coinbaseWalletExtension) {
    return (window as any).coinbaseWalletExtension;
  }
  
  // Check for WalletConnect (may not be directly accessible this way)
  if ((window as any).walletConnectProvider) {
    return (window as any).walletConnectProvider;
  }
  
  // Check for Trust Wallet
  if ((window as any).trustWallet) {
    return (window as any).trustWallet;
  }
  
  return null;
};

// Get Phantom provider (for Solana)
export const getPhantomProvider = (): PhantomProvider | null => {
  if ((window as any).solana?.isPhantom) {
    return (window as any).solana;
  }
  return null;
};

// Generate unique deposit address
export const generateDepositAddress = async (userId: number, currency: string): Promise<string> => {
  try {
    // In a real implementation, call the backend API
    const response = await fetch('/api/wallet/generate-address', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, currency }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate address');
    }
    
    const data = await response.json();
    return data.address;
  } catch (error) {
    console.error('Error generating wallet address:', error);
    
    // Fallback to generate a simulated unique address format
    // This uses a combination of currency prefix, user ID and timestamp for uniqueness
    const currencyPrefixes: Record<string, string> = {
      BTC: '1',     // Legacy Bitcoin address format
      ETH: '0x',    // Ethereum address format
      SOL: 'So1',   // Solana address format
      USDT: '0x',   // USDT on Ethereum usually uses the same format
      LTC: 'L',     // Litecoin address format
    };
    
    const prefix = currencyPrefixes[currency] || '0x';
    const uniqueId = userId.toString(16).padStart(8, '0');
    const randomPart = Array.from(
      { length: 30 }, 
      () => Math.floor(Math.random() * 16).toString(16)
    ).join("");
    
    return `${prefix}${uniqueId}${randomPart}`;
  }
};

// Get wallet provider type
export const getWalletProviderType = (): WalletType | null => {
  // Check for Phantom (Solana) wallet first
  const phantom = getPhantomProvider();
  if (phantom?.isPhantom) return 'phantom';
  
  // Check Ethereum-based wallets
  const ethereum = getEthereumProvider();
  if (!ethereum) return null;
  
  if (ethereum.isMetaMask) return 'metamask';
  if (ethereum.isCoinbaseWallet) return 'coinbase';
  if (ethereum.isWalletConnect) return 'walletconnect';
  if (ethereum.isTrust) return 'trust';
  
  return null;
};

// Request account access with specified wallet type
export const connectWallet = async (walletType?: WalletType): Promise<string | null> => {
  try {
    // If no specific wallet type is provided, try to detect
    if (!walletType) {
      const detectedWalletType = getWalletProviderType();
      
      if (!detectedWalletType) {
        throw new Error("No wallet provider detected. Please install a supported wallet.");
      }
      
      walletType = detectedWalletType;
    }
    
    // Handle Phantom wallet (Solana)
    if (walletType === 'phantom') {
      const phantom = getPhantomProvider();
      
      if (!phantom) {
        window.open('https://phantom.app/', '_blank');
        throw new Error("Phantom wallet not installed. Please install Phantom to continue.");
      }
      
      // Connect to Phantom
      try {
        const response = await phantom.connect();
        return response.publicKey.toString();
      } catch (err) {
        throw new Error("Failed to connect to Phantom wallet. Please try again.");
      }
    }
    
    // Handle Ethereum-based wallets
    else {
      let provider: EthereumProvider | null = null;
      
      // Get the appropriate provider based on wallet type
      switch (walletType) {
        case 'metamask':
          if (!(window as any).ethereum?.isMetaMask) {
            window.open('https://metamask.io/download/', '_blank');
            throw new Error("MetaMask not installed. Please install MetaMask to continue.");
          }
          provider = (window as any).ethereum;
          break;
          
        case 'coinbase':
          if (!(window as any).ethereum?.isCoinbaseWallet && !(window as any).coinbaseWalletExtension) {
            window.open('https://www.coinbase.com/wallet/downloads', '_blank');
            throw new Error("Coinbase Wallet not installed. Please install Coinbase Wallet to continue.");
          }
          provider = (window as any).ethereum?.isCoinbaseWallet ? 
            (window as any).ethereum : 
            (window as any).coinbaseWalletExtension;
          break;
          
        case 'walletconnect':
          // WalletConnect typically needs to be initialized with a project ID
          // For this implementation, we'll assume the user has a compatible wallet
          provider = getEthereumProvider();
          if (!provider) {
            throw new Error("No compatible wallet found. Please install a WalletConnect compatible wallet.");
          }
          break;
          
        case 'trust':
          if (!(window as any).ethereum?.isTrust && !(window as any).trustWallet) {
            window.open('https://trustwallet.com/download', '_blank');
            throw new Error("Trust Wallet not installed. Please install Trust Wallet to continue.");
          }
          provider = (window as any).ethereum?.isTrust ? 
            (window as any).ethereum : 
            (window as any).trustWallet;
          break;
          
        default:
          provider = getEthereumProvider();
      }
      
      if (!provider) {
        throw new Error(`${walletType} wallet not found. Please install the wallet to continue.`);
      }
      
      // Request accounts
      const accounts = await provider.request({
        method: "eth_requestAccounts"
      });
      
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found. Please check your wallet and try again.");
      }
      
      return accounts[0];
    }
  } catch (error: any) {
    console.error("Error connecting wallet:", error);
    throw error;
  }
};

// Get the current connected account
export const getCurrentAccount = async (): Promise<string | null> => {
  try {
    const ethereum = getEthereumProvider();
    if (!ethereum) return null;

    const accounts = await ethereum.request({
      method: "eth_accounts",
    });

    return accounts[0] || null;
  } catch (error) {
    console.error("Error getting current account:", error);
    return null;
  }
};

// Check if MetaMask is installed
export const isMetaMaskInstalled = (): boolean => {
  const ethereum = getEthereumProvider();
  return ethereum?.isMetaMask || false;
};

// Get the ETH balance
export const getEthBalance = async (address: string): Promise<string> => {
  try {
    const ethereum = getEthereumProvider();
    if (!ethereum) throw new Error("No Ethereum provider found");

    const balance = await ethereum.request({
      method: "eth_getBalance",
      params: [address, "latest"],
    });

    // Convert from wei to ether (1 ether = 10^18 wei)
    const etherValue = parseInt(balance, 16) / Math.pow(10, 18);
    return etherValue.toFixed(6);
  } catch (error) {
    console.error("Error getting ETH balance:", error);
    throw error;
  }
};

// Send ETH transaction
export const sendTransaction = async (
  to: string,
  value: string
): Promise<string> => {
  try {
    const ethereum = getEthereumProvider();
    if (!ethereum) throw new Error("No Ethereum provider found");

    const from = ethereum.selectedAddress;
    if (!from) throw new Error("No account selected");

    // Convert ether to wei
    const weiValue = (parseFloat(value) * Math.pow(10, 18)).toString(16);

    const txHash = await ethereum.request({
      method: "eth_sendTransaction",
      params: [
        {
          from,
          to,
          value: "0x" + weiValue,
        },
      ],
    });

    return txHash;
  } catch (error) {
    console.error("Error sending transaction:", error);
    throw error;
  }
};

// Subscribe to account changes
export const subscribeToAccountChanges = (
  callback: (accounts: string[]) => void
): (() => void) => {
  const ethereum = getEthereumProvider();
  if (!ethereum) {
    console.error("No Ethereum provider found");
    return () => {};
  }

  const accountsChanged = (accounts: string[]) => {
    callback(accounts);
  };

  ethereum.on("accountsChanged", accountsChanged);

  // Return a function to remove the listener
  return () => {
    ethereum.removeListener("accountsChanged", accountsChanged);
  };
};

// Subscribe to chain changes
export const subscribeToChainChanges = (
  callback: (chainId: string) => void
): (() => void) => {
  const ethereum = getEthereumProvider();
  if (!ethereum) {
    console.error("No Ethereum provider found");
    return () => {};
  }

  const chainChanged = (chainId: string) => {
    callback(chainId);
  };

  ethereum.on("chainChanged", chainChanged);

  // Return a function to remove the listener
  return () => {
    ethereum.removeListener("chainChanged", chainChanged);
  };
};
