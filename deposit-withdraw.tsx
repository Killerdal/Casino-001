import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useWallet } from "@/hooks/use-wallet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WalletAddress } from "./wallet-address";
import { DepositWithdrawForm } from "./deposit-withdraw-form";

export function DepositWithdraw() {
  const [activeTab, setActiveTab] = useState("deposit");
  const { user, isAuthenticated } = useAuth();
  const { walletAddress, isWalletConnected } = useWallet();

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <h3 className="text-xl font-bold mb-2">Authentication Required</h3>
        <p className="text-gray-300 mb-4">
          Please sign in to access the deposit and withdrawal features.
        </p>
      </div>
    );
  }

  if (!isWalletConnected || !walletAddress) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <h3 className="text-xl font-bold mb-2">Connect Your Wallet</h3>
        <p className="text-gray-300 mb-4">
          Please connect your wallet to access the deposit and withdrawal features.
        </p>
      </div>
    );
  }

  return (
    <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="deposit">Deposit</TabsTrigger>
        <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
      </TabsList>

      <TabsContent value="deposit">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Your Deposit Address</h3>
            <WalletAddress />
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Convert Crypto to Game Tokens</h3>
            <DepositWithdrawForm />
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="withdraw">
        <div className="mt-6">
          <DepositWithdrawForm />
        </div>
      </TabsContent>
    </Tabs>
  );
}