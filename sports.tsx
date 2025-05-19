import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SportsCard } from "@/components/sports/sports-card";
import { useAuth } from "@/hooks/use-auth";
import { useWallet } from "@/hooks/use-wallet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function Sports() {
  const { isAuthenticated } = useAuth();
  const { isWalletConnected, connectWallet } = useWallet();
  const { toast } = useToast();
  
  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been connected successfully",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="px-4 sm:px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Sports Betting</h1>
        
        {!isAuthenticated && (
          <Card className="mb-6 bg-primary-dark border-gray-700">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold mb-2">Sign In to Place Real Bets</h3>
              <p className="text-gray-300 mb-4">
                Create an account or sign in to place bets with cryptocurrency. 
                You can still browse available matches.
              </p>
            </CardContent>
          </Card>
        )}

        {isAuthenticated && !isWalletConnected && (
          <Card className="mb-6 bg-primary-dark border-gray-700">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold mb-2">Connect Your Wallet</h3>
              <p className="text-gray-300 mb-4">
                Connect your cryptocurrency wallet to deposit funds and place bets on sports matches.
              </p>
              <Button 
                className="wallet-connect-btn"
                onClick={handleConnectWallet}
              >
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        )}
        
        <SportsCard />
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-3">
            <Card className="bg-primary-light border-gray-700">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Sports Betting Rules</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">General Rules</h3>
                    <ul className="list-disc pl-6 space-y-2 text-gray-300">
                      <li>All bets are final once placed.</li>
                      <li>Odds are subject to change before a bet is placed.</li>
                      <li>The minimum bet amount is 0.001 ETH.</li>
                      <li>Maximum winnings per bet are limited to 100 ETH.</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Match Betting</h3>
                    <ul className="list-disc pl-6 space-y-2 text-gray-300">
                      <li>For match results, bets are settled based on the official result at the end of the specified period.</li>
                      <li>In the event of a match being abandoned, all bets will be void unless settlement is already determined.</li>
                      <li>For live betting, there may be a delay in bet placement to prevent abuse of changing conditions.</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Settlement</h3>
                    <ul className="list-disc pl-6 space-y-2 text-gray-300">
                      <li>Winnings are automatically credited to your account after the event is settled.</li>
                      <li>Settlements are typically processed within 30 minutes of the event ending.</li>
                      <li>In case of a dispute, our decision is final.</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sports;
