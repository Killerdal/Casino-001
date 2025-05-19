import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft, RefreshCw } from "lucide-react";

// Conversion rates from crypto to game tokens
const CONVERSION_RATES = {
  BTC: 20000,   // 1 BTC = 20,000 game tokens
  ETH: 1000,    // 1 ETH = 1,000 game tokens
  SOL: 50,      // 1 SOL = 50 game tokens 
  USDT: 1,      // 1 USDT = 1 game token
  LTC: 200      // 1 LTC = 200 game tokens
};

export function DepositWithdrawForm() {
  const { user, isAuthenticated } = useAuth();
  const { walletAddress, isWalletConnected, balances, refreshBalances } = useWallet();
  const { toast } = useToast();
  
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [depositCurrency, setDepositCurrency] = useState("BTC");
  const [withdrawCurrency, setWithdrawCurrency] = useState("BTC");
  const [isProcessingDeposit, setIsProcessingDeposit] = useState(false);
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState(false);
  
  // Game token balance
  const gameTokens = balances.find(b => b.currency === "GAMETOKEN")?.amount || 0;
  
  // Calculate token value based on conversion rate
  const calculateTokens = (amount: string, currency: string): number => {
    const numAmount = parseFloat(amount) || 0;
    const rate = CONVERSION_RATES[currency as keyof typeof CONVERSION_RATES] || 1;
    return numAmount * rate;
  };
  
  // Calculate crypto value based on tokens
  const calculateCrypto = (tokens: string, currency: string): number => {
    const numTokens = parseFloat(tokens) || 0;
    const rate = CONVERSION_RATES[currency as keyof typeof CONVERSION_RATES] || 1;
    return numTokens / rate;
  };
  
  // Handle deposit submission
  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to make a deposit",
        variant: "destructive",
      });
      return;
    }
    
    if (!walletAddress) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to make a deposit",
        variant: "destructive",
      });
      return;
    }
    
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessingDeposit(true);
    
    try {
      // Calculate tokens to receive
      const tokensToReceive = calculateTokens(depositAmount, depositCurrency);
      
      // Simulate transaction hash
      const txHash = `tx_${Date.now().toString(16)}_${Math.floor(Math.random() * 10000000).toString(16)}`;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you would call your backend here
      // await fetch("/api/wallet/deposit", { ... });
      
      // Simulate success
      toast({
        title: "Deposit Initiated",
        description: `Your deposit of ${depositAmount} ${depositCurrency} for ${tokensToReceive.toFixed(2)} Game Tokens has been initiated`,
      });
      
      // Reset form
      setDepositAmount("");
      
      // Refresh balances (in real app)
      // await refreshBalances();
      
    } catch (error: any) {
      toast({
        title: "Deposit Failed",
        description: error.message || "Failed to process your deposit",
        variant: "destructive",
      });
    } finally {
      setIsProcessingDeposit(false);
    }
  };
  
  // Handle withdrawal submission
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to make a withdrawal",
        variant: "destructive",
      });
      return;
    }
    
    if (!walletAddress) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to withdraw funds",
        variant: "destructive",
      });
      return;
    }
    
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      });
      return;
    }
    
    // Calculate tokens required
    const tokensRequired = parseFloat(withdrawAmount);
    
    if (tokensRequired > gameTokens) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough game tokens for this withdrawal",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessingWithdraw(true);
    
    try {
      // Calculate crypto to receive
      const cryptoToReceive = calculateCrypto(withdrawAmount, withdrawCurrency);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you would call your backend here
      // await fetch("/api/wallet/withdraw", { ... });
      
      // Simulate success
      toast({
        title: "Withdrawal Initiated",
        description: `Your withdrawal of ${withdrawAmount} Game Tokens for ${cryptoToReceive.toFixed(6)} ${withdrawCurrency} has been initiated`,
      });
      
      // Reset form
      setWithdrawAmount("");
      
      // Refresh balances (in real app)
      // await refreshBalances();
      
    } catch (error: any) {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to process your withdrawal",
        variant: "destructive",
      });
    } finally {
      setIsProcessingWithdraw(false);
    }
  };
  
  return (
    <Tabs defaultValue="deposit">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="deposit">Deposit</TabsTrigger>
        <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
      </TabsList>
      
      <TabsContent value="deposit">
        <Card>
          <CardHeader>
            <CardTitle>Deposit Game Tokens</CardTitle>
            <CardDescription>Convert cryptocurrency to game tokens for betting</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDeposit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deposit-amount">Amount</Label>
                  <Input
                    id="deposit-amount"
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    placeholder="0.0"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    disabled={isProcessingDeposit || !isAuthenticated}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="deposit-currency">Currency</Label>
                  <Select
                    value={depositCurrency}
                    onValueChange={setDepositCurrency}
                    disabled={isProcessingDeposit}
                  >
                    <SelectTrigger id="deposit-currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                      <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                      <SelectItem value="SOL">Solana (SOL)</SelectItem>
                      <SelectItem value="USDT">Tether (USDT)</SelectItem>
                      <SelectItem value="LTC">Litecoin (LTC)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {depositAmount && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-md mt-2">
                  <span className="text-sm">You'll receive:</span>
                  <div className="flex items-center">
                    <ArrowRightLeft className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">
                      {calculateTokens(depositAmount, depositCurrency).toFixed(2)} Game Tokens
                    </span>
                  </div>
                </div>
              )}
              
              <Button
                type="submit"
                className="w-full"
                disabled={isProcessingDeposit || !depositAmount || !isAuthenticated || !isWalletConnected}
              >
                {isProcessingDeposit ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Deposit Now"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col text-xs text-muted-foreground">
            <p>Minimum deposit: 0.001 BTC, 0.01 ETH, 0.1 SOL, 10 USDT, or 0.01 LTC</p>
          </CardFooter>
        </Card>
      </TabsContent>
      
      <TabsContent value="withdraw">
        <Card>
          <CardHeader>
            <CardTitle>Withdraw Game Tokens</CardTitle>
            <CardDescription>Convert your game tokens to cryptocurrency</CardDescription>
            {gameTokens > 0 && (
              <div className="mt-2 text-sm">
                <span className="font-medium">Current Balance:</span>{" "}
                <span className="font-bold text-primary">{gameTokens.toFixed(2)} Game Tokens</span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="withdraw-amount">Game Tokens</Label>
                  <Input
                    id="withdraw-amount"
                    type="number"
                    step="1"
                    min="1"
                    max={gameTokens.toString()}
                    placeholder="0"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    disabled={isProcessingWithdraw || !isAuthenticated || gameTokens <= 0}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="withdraw-currency">Receive as</Label>
                  <Select
                    value={withdrawCurrency}
                    onValueChange={setWithdrawCurrency}
                    disabled={isProcessingWithdraw}
                  >
                    <SelectTrigger id="withdraw-currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                      <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                      <SelectItem value="SOL">Solana (SOL)</SelectItem>
                      <SelectItem value="USDT">Tether (USDT)</SelectItem>
                      <SelectItem value="LTC">Litecoin (LTC)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {withdrawAmount && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-md mt-2">
                  <span className="text-sm">You'll receive:</span>
                  <div className="flex items-center">
                    <ArrowRightLeft className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">
                      {calculateCrypto(withdrawAmount, withdrawCurrency).toFixed(6)} {withdrawCurrency}
                    </span>
                  </div>
                </div>
              )}
              
              <Button
                type="submit"
                className="w-full"
                disabled={
                  isProcessingWithdraw || 
                  !withdrawAmount || 
                  !isAuthenticated || 
                  !isWalletConnected || 
                  parseFloat(withdrawAmount) > gameTokens
                }
              >
                {isProcessingWithdraw ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Withdraw Now"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col text-xs text-muted-foreground">
            <p>Minimum withdrawal: 10 Game Tokens</p>
            <p>Network fees will be deducted from the withdrawn amount</p>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}