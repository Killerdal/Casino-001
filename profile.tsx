import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useWallet } from "@/hooks/use-wallet";
import { CryptoAssets } from "@/components/wallet/crypto-assets";
import { Transactions } from "@/components/wallet/transactions";
import { WalletSelector } from "@/components/wallet/wallet-selector";
import { DepositWithdraw } from "@/components/wallet/deposit-withdraw";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, Wallet } from "lucide-react";

export function Profile() {
  const { user, isAuthenticated } = useAuth();
  const { walletAddress, connectWallet, isWalletConnected, refreshBalances } = useWallet();
  const { toast } = useToast();

  // Refresh balances on component mount
  useEffect(() => {
    if (isAuthenticated) {
      refreshBalances();
    }
  }, [isAuthenticated, refreshBalances]);

  // Get transaction history
  const { data: transactionsData, isLoading, error } = useQuery({
    queryKey: ['/api/transactions'],
    enabled: isAuthenticated,
  });

  // Handle wallet connection
  const handleConnectWallet = () => {
    try {
      connectWallet();
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };

  // Handle refresh balances
  const handleRefreshBalances = () => {
    try {
      refreshBalances();
      toast({
        title: "Balances Updated",
        description: "Your balances have been refreshed",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to refresh balances",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="px-4 sm:px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Account Profile</h1>
        {user && (
          <p className="text-gray-400 mb-6">Welcome back, {user.username}</p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-1 bg-primary-light border-gray-700">
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center text-3xl font-bold mb-4">
                  {user?.username.charAt(0).toUpperCase() || "U"}
                </div>
                <h2 className="text-xl font-bold mb-1">{user?.username}</h2>
                <p className="text-gray-400 mb-4">{user?.email}</p>

                {!isWalletConnected ? (
                  <Button 
                    className="wallet-connect-btn flex items-center w-full justify-center"
                    onClick={handleConnectWallet}
                  >
                    <Wallet className="mr-2 h-5 w-5" />
                    Connect Wallet
                  </Button>
                ) : (
                  <div className="w-full">
                    <p className="text-sm text-gray-400 mb-2">Connected Wallet:</p>
                    <div className="font-mono text-sm bg-primary-dark p-3 rounded-md break-all border border-gray-700">
                      {walletAddress}
                    </div>
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4 text-gray-400"
                  onClick={handleRefreshBalances}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Balances
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 bg-primary-light border-gray-700">
            <Tabs defaultValue="deposit">
              <TabsList className="w-full grid grid-cols-3 mb-4 p-1">
                <TabsTrigger value="deposit">Deposit & Withdraw</TabsTrigger>
                <TabsTrigger value="wallets">Wallet Options</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="deposit" className="p-6">
                <DepositWithdraw />
              </TabsContent>

              <TabsContent value="wallets" className="p-6">
                <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Connect to Bet.99</h3>
                <p className="text-gray-300 mb-6">Choose your preferred wallet to connect to Bet.99 cryptocurrency casino.</p>
                <WalletSelector />
              </TabsContent>

              <TabsContent value="settings" className="p-6">
                <h3 className="text-xl font-bold mb-4">Account Settings</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <Card className="border border-gray-700">
                      <CardHeader>
                        <CardTitle>Notifications</CardTitle>
                        <CardDescription>Configure how you receive alerts and updates</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Email Notifications</p>
                            <p className="text-sm text-gray-400">Receive updates about promotions</p>
                          </div>
                          <div className="h-6 w-11 bg-gray-700 rounded-full p-1 cursor-pointer">
                            <div className="h-4 w-4 rounded-full bg-gray-400 transform translate-x-0"></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Deposit Alerts</p>
                            <p className="text-sm text-gray-400">Get notified about deposits</p>
                          </div>
                          <div className="h-6 w-11 bg-gray-700 rounded-full p-1 cursor-pointer">
                            <div className="h-4 w-4 rounded-full bg-gray-400 transform translate-x-5"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-gray-700">
                      <CardHeader>
                        <CardTitle>Security</CardTitle>
                        <CardDescription>Manage your account security</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Button variant="outline" className="w-full">Change Password</Button>
                        <Button variant="outline" className="w-full">Enable Two-Factor Authentication</Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CryptoAssets />
          </div>
          <div className="lg:col-span-1">
            <Transactions />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
