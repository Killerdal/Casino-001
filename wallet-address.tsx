import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Clipboard, QrCode, RefreshCw, Check } from "lucide-react";
import QRCode from "react-qr-code";

interface WalletAddressProps {
  onAddressGenerated?: (address: string, currency: string) => void;
}

export function WalletAddress({ onAddressGenerated }: WalletAddressProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState("BTC");
  const [copied, setCopied] = useState(false);
  
  const currencies = [
    { value: "BTC", label: "Bitcoin (BTC)" },
    { value: "ETH", label: "Ethereum (ETH)" },
    { value: "SOL", label: "Solana (SOL)" },
    { value: "USDT", label: "Tether (USDT)" },
    { value: "LTC", label: "Litecoin (LTC)" }
  ];

  // Generate a wallet address when the component mounts or currency changes
  useEffect(() => {
    if (isAuthenticated && selectedCurrency) {
      generateWalletAddress();
    }
  }, [selectedCurrency, isAuthenticated]);

  // Generate a wallet address
  const generateWalletAddress = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to generate a wallet address",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // In a real implementation, this would call your backend API
      // For now, we'll simulate a unique address generation
      const currencyPrefixes: Record<string, string> = {
        BTC: '1',     // Legacy Bitcoin address format
        ETH: '0x',    // Ethereum address format
        SOL: 'So1',   // Solana address format
        USDT: '0x',   // USDT on Ethereum usually uses the same format
        LTC: 'L',     // Litecoin address format
      };
      
      const prefix = currencyPrefixes[selectedCurrency] || '0x';
      
      // Generate a random string to simulate unique wallet address for this user and currency
      const randomPart = Array.from(
        { length: 30 }, 
        () => Math.floor(Math.random() * 16).toString(16)
      ).join("");
      
      // Add user ID to make it "unique" per user (in a real implementation)
      const userId = user?.id || Date.now();
      const uniqueId = userId.toString(16).padStart(8, '0');
      
      const address = `${prefix}${uniqueId}${randomPart}`;
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setWalletAddress(address);
      
      if (onAddressGenerated) {
        onAddressGenerated(address, selectedCurrency);
      }
      
      toast({
        title: "Wallet Address Generated",
        description: "Your unique deposit address has been created",
      });
    } catch (error: any) {
      console.error("Error generating wallet address:", error);
      toast({
        title: "Address Generation Failed",
        description: error.message || "Failed to generate wallet address",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy wallet address to clipboard
  const copyToClipboard = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
      
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currency">Select Cryptocurrency</Label>
        <Select 
          value={selectedCurrency} 
          onValueChange={setSelectedCurrency}
        >
          <SelectTrigger id="currency">
            <SelectValue placeholder="Select a cryptocurrency" />
          </SelectTrigger>
          <SelectContent>
            {currencies.map((currency) => (
              <SelectItem key={currency.value} value={currency.value}>
                {currency.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {walletAddress ? (
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
            <QRCode 
              value={walletAddress} 
              size={160}
              className="rounded-md mb-4" 
            />
            <div className="w-full p-3 bg-white dark:bg-gray-900 rounded border border-gray-300 dark:border-gray-700 font-mono text-sm text-center break-all">
              {walletAddress}
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center" 
              onClick={copyToClipboard}
            >
              {copied ? (
                <Check className="h-4 w-4 mr-2 text-green-500" />
              ) : (
                <Clipboard className="h-4 w-4 mr-2" />
              )}
              Copy Address
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center" 
              onClick={generateWalletAddress}
              disabled={isGenerating}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400 p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
            <p className="font-medium mb-1">Important:</p>
            <ul className="space-y-1 list-disc pl-4">
              <li>Send only {selectedCurrency} to this address</li>
              <li>This address is unique to your account</li>
              <li>Your deposit will be credited after {selectedCurrency === "BTC" ? "3" : 
                 selectedCurrency === "ETH" ? "12" : 
                 selectedCurrency === "SOL" ? "32" : "6"} network confirmations</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <Button
            onClick={generateWalletAddress}
            disabled={isGenerating || !isAuthenticated}
            className="mt-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <QrCode className="mr-2 h-4 w-4" />
                Generate Address
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}