import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import SlotMachine from "@/components/casino/slot-machine";
import Blackjack from "@/components/casino/blackjack";
import Roulette from "@/components/casino/roulette";
import { useAuth } from "@/hooks/use-auth";
import { useWallet } from "@/hooks/use-wallet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function Casino() {
  const [activeGame, setActiveGame] = useState<string>("slots");
  const { isAuthenticated } = useAuth();
  const { isWalletConnected, connectWallet } = useWallet();
  const { toast } = useToast();
  
  // Get the hash from URL to set the active game
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (hash && ["slots", "blackjack", "roulette"].includes(hash)) {
      setActiveGame(hash);
    }
  }, []);

  // Update URL hash when active game changes
  useEffect(() => {
    window.location.hash = activeGame;
  }, [activeGame]);

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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Casino Games</h1>
        
        {!isAuthenticated && (
          <Card className="mb-6 bg-primary-dark border-gray-700">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold mb-2">Sign In to Play with Real Crypto</h3>
              <p className="text-gray-300 mb-4">
                Create an account or sign in to play casino games with cryptocurrency. 
                You can still try the games in demo mode.
              </p>
            </CardContent>
          </Card>
        )}

        {isAuthenticated && !isWalletConnected && (
          <Card className="mb-6 bg-primary-dark border-gray-700">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold mb-2">Connect Your Wallet</h3>
              <p className="text-gray-300 mb-4">
                Connect your cryptocurrency wallet to deposit funds and play with real crypto.
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
        
        <Tabs 
          value={activeGame} 
          onValueChange={setActiveGame}
          className="mb-6"
        >
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="slots">Slots</TabsTrigger>
            <TabsTrigger value="blackjack">Blackjack</TabsTrigger>
            <TabsTrigger value="roulette">Roulette</TabsTrigger>
          </TabsList>
          
          <TabsContent value="slots">
            <SlotMachine />
          </TabsContent>
          
          <TabsContent value="blackjack">
            <Blackjack />
          </TabsContent>
          
          <TabsContent value="roulette">
            <Roulette />
          </TabsContent>
        </Tabs>
        
        <div className="mt-8 bg-primary-dark rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4">Game Rules</h2>
          
          {activeGame === "slots" && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Slots Rules</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-300">
                <li>Spin the reels and match symbols to win.</li>
                <li>Three matching symbols award a payout based on the symbol's value.</li>
                <li>The Bitcoin symbol (₿) has the highest payout at 15x your bet.</li>
                <li>Two matching symbols will pay out 2x your bet.</li>
                <li>Minimum bet: 0.001 ETH. Maximum bet: 0.1 ETH.</li>
              </ul>
            </div>
          )}
          
          {activeGame === "blackjack" && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Blackjack Rules</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-300">
                <li>The goal is to beat the dealer by having a hand value closest to 21 without going over.</li>
                <li>Cards 2-10 are worth their face value, face cards are worth 10, and Aces can be worth 1 or 11.</li>
                <li>A "Blackjack" (an Ace and a 10-value card) pays 3:2.</li>
                <li>You can "Hit" to take another card, "Stand" to keep your current hand, or "Double Down" to double your bet and receive one more card.</li>
                <li>The dealer must hit until they have at least 17.</li>
              </ul>
            </div>
          )}
          
          {activeGame === "roulette" && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Roulette Rules</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-300">
                <li>Place bets on where the ball will land on the roulette wheel.</li>
                <li>Straight bet (single number): Pays 35:1</li>
                <li>Red/Black, Odd/Even, 1-18/19-36: Pays 1:1</li>
                <li>The numbers 1-36 are colored red and black; 0 is green.</li>
                <li>You can place multiple bets in a single spin.</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Casino;
