import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useWallet } from "@/hooks/use-wallet";
import { Button } from "@/components/ui/button";
import { WalletSelector } from "@/components/wallet/wallet-selector";
import { Wallet, Loader2 } from "lucide-react";

export function WalletButton() {
  const { isAuthenticated } = useAuth();
  const { walletAddress, isWalletConnected, isConnecting, disconnectWallet } = useWallet();
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  
  if (!isAuthenticated) {
    return null;
  }
  
  // Handle wallet connection
  const handleConnectWallet = () => {
    setShowWalletSelector(true);
  };
  
  // Handle wallet disconnection
  const handleDisconnectWallet = () => {
    disconnectWallet();
  };
  
  // Format wallet address for display
  const formatWalletAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  return (
    <>
      {isWalletConnected && walletAddress ? (
        <Button 
          variant="outline" 
          className="flex items-center bg-primary-dark border-gray-700 hover:bg-primary-light"
          onClick={handleDisconnectWallet}
        >
          <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
          <span>{formatWalletAddress(walletAddress)}</span>
        </Button>
      ) : (
        <Button 
          variant="outline" 
          className="flex items-center bg-primary-dark border-gray-700 hover:bg-primary-light"
          onClick={handleConnectWallet}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <Wallet className="h-4 w-4 mr-2" />
              <span>Connect Wallet</span>
            </>
          )}
        </Button>
      )}
      
      <WalletSelector 
        isOpen={showWalletSelector} 
        onClose={() => setShowWalletSelector(false)} 
      />
    </>
  );
}