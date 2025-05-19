import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { WalletAddress } from "@/components/wallet/wallet-address";
import { DepositWithdrawForm } from "@/components/wallet/deposit-withdraw-form";
import QRCode from "react-qr-code";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bitcoin } from "lucide-react";

export function Deposit() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("deposit");
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Deposit & Withdraw</h1>
      <p className="text-gray-400 mb-6">Manage your cryptocurrency deposits and withdrawals on Bet.99</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="deposit" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="deposit">Deposit</TabsTrigger>
              <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            </TabsList>
            
            <TabsContent value="deposit">
              <div className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Deposit Cryptocurrency</CardTitle>
                    <CardDescription>
                      Send crypto to the address below to deposit funds to your Bet.99 account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <WalletAddress />
                  </CardContent>
                </Card>
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Deposit Instructions</h3>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Select your cryptocurrency from the dropdown menu</li>
                    <li>Send the exact amount you wish to deposit to the generated wallet address</li>
                    <li>Wait for blockchain confirmations (varies by cryptocurrency)</li>
                    <li>Your balance will be updated automatically once confirmed</li>
                  </ol>
                  
                  <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-900/30 rounded-md">
                    <p className="text-yellow-500 text-sm font-medium">Important Notes:</p>
                    <ul className="mt-2 space-y-1 text-sm text-gray-300">
                      <li>• Each wallet address is unique to your account</li>
                      <li>• Only send the selected cryptocurrency to its matching address</li>
                      <li>• Minimum deposit: 0.001 BTC / 0.01 ETH / 0.1 SOL / 10 USDT</li>
                      <li>• Deposits are typically credited after 3-6 confirmations</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="withdraw">
              <div className="mt-6">
                <DepositWithdrawForm />
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Deposit Status</CardTitle>
              <CardDescription>Track your recent transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div className="p-3 bg-gray-800 rounded-md border border-gray-700">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs text-gray-400">Transaction ID</span>
                        <p className="text-sm font-mono truncate">tx_8a72f9e3...</p>
                      </div>
                      <div className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-500 text-xs">
                        Pending
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between">
                      <span className="text-sm">0.05 ETH</span>
                      <span className="text-xs text-gray-400">2 mins ago</span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-800 rounded-md border border-gray-700">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs text-gray-400">Transaction ID</span>
                        <p className="text-sm font-mono truncate">tx_6b234a7b...</p>
                      </div>
                      <div className="px-2 py-1 rounded-full bg-green-500/20 text-green-500 text-xs">
                        Completed
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between">
                      <span className="text-sm">0.002 BTC</span>
                      <span className="text-xs text-gray-400">24 mins ago</span>
                    </div>
                  </div>
                  
                  <a 
                    href="/transactions" 
                    className="block w-full text-center mt-4 text-sm text-blue-400 hover:text-blue-300"
                  >
                    View all transactions
                  </a>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-400 mb-4">Sign in to view your transaction history</p>
                  <Button 
                    onClick={() => document.dispatchEvent(new Event('open-auth-modal'))}
                    variant="outline" 
                    className="w-full"
                  >
                    Sign In
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Supported Cryptocurrencies</CardTitle>
              <CardDescription>Deposit and withdraw using these currencies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center p-2 bg-gray-800 rounded-md">
                  <div className="w-8 h-8 flex items-center justify-center bg-yellow-600 rounded-full mr-3">
                    <Bitcoin className="h-5 w-5 text-yellow-200" />
                  </div>
                  <div>
                    <p className="font-medium">Bitcoin (BTC)</p>
                    <p className="text-xs text-gray-400">Min: 0.0005 BTC</p>
                  </div>
                </div>
                
                <div className="flex items-center p-2 bg-gray-800 rounded-md">
                  <div className="w-8 h-8 flex items-center justify-center bg-blue-600 rounded-full mr-3">
                    <svg className="h-5 w-5 text-blue-200" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Ethereum (ETH)</p>
                    <p className="text-xs text-gray-400">Min: 0.01 ETH</p>
                  </div>
                </div>
                
                <div className="flex items-center p-2 bg-gray-800 rounded-md">
                  <div className="w-8 h-8 flex items-center justify-center bg-purple-600 rounded-full mr-3">
                    <svg className="h-5 w-5 text-purple-200" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M4.603 15.443l2.41-1.393c.15-.086.332-.086.482 0l8.5 4.918c.15.086.15.258 0 .344l-2.41 1.393c-.15.086-.332.086-.482 0l-8.5-4.918c-.15-.086-.15-.258 0-.344zm0-6.428l2.41-1.393c.15-.086.332-.086.482 0l8.5 4.918c.15.086.15.258 0 .344l-2.41 1.393c-.15.086-.332.086-.482 0l-8.5-4.918c-.15-.086-.15-.258 0-.344zm11.392-5.035l-2.41 1.393c-.15.086-.332.086-.482 0l-8.5-4.918c-.15-.086-.15-.258 0-.344l2.41-1.393c.15-.086.332-.086.482 0l8.5 4.918c.15.086.15.258 0 .344z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Solana (SOL)</p>
                    <p className="text-xs text-gray-400">Min: 0.1 SOL</p>
                  </div>
                </div>
                
                <div className="flex items-center p-2 bg-gray-800 rounded-md">
                  <div className="w-8 h-8 flex items-center justify-center bg-green-600 rounded-full mr-3">
                    <span className="font-bold text-green-200">$</span>
                  </div>
                  <div>
                    <p className="font-medium">Tether (USDT)</p>
                    <p className="text-xs text-gray-400">Min: 10 USDT</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Deposit;