import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Sparkles, Plus, Minus } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

// Define symbols for the slot machine
const symbols = [
  { symbol: "🍒", name: "Cherry", multiplier: 2 },
  { symbol: "🍋", name: "Lemon", multiplier: 3 },
  { symbol: "🍊", name: "Orange", multiplier: 4 },
  { symbol: "🍇", name: "Grapes", multiplier: 5 },
  { symbol: "🍉", name: "Watermelon", multiplier: 5 },
  { symbol: "🔔", name: "Bell", multiplier: 8 },
  { symbol: "💎", name: "Diamond", multiplier: 10 },
  { symbol: "7️⃣", name: "Seven", multiplier: 15 },
  { symbol: "🎰", name: "Jackpot", multiplier: 20 },
];

// Create a full reel with random symbols
const createReel = () => {
  const fullReel = [];
  for (let i = 0; i < 100; i++) {
    const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
    fullReel.push(randomSymbol);
  }
  return fullReel;
};

const SlotMachine = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [betAmount, setBetAmount] = useState(0.001);
  const [result, setResult] = useState<Array<typeof symbols[0]>>([]);
  const [winAmount, setWinAmount] = useState(0);
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const { getBalance, refreshBalances } = useWallet();
  const { toast } = useToast();
  
  // Create three reels
  const reelsRef = useRef([createReel(), createReel(), createReel()]);
  
  // Get user's balance
  const btcBalance = getBalance("BTC") || 0;
  
  // Increase bet amount
  const increaseBet = () => {
    if (betAmount < btcBalance) {
      setBetAmount(prev => Math.min(parseFloat((prev + 0.001).toFixed(3)), 0.1));
    }
  };
  
  // Decrease bet amount
  const decreaseBet = () => {
    if (betAmount > 0.001) {
      setBetAmount(prev => parseFloat((prev - 0.001).toFixed(3)));
    }
  };
  
  // Check if the result is a win
  const checkWin = (resultSymbols: Array<typeof symbols[0]>) => {
    // All symbols are the same (jackpot)
    if (resultSymbols[0].symbol === resultSymbols[1].symbol && 
        resultSymbols[1].symbol === resultSymbols[2].symbol) {
      return resultSymbols[0].multiplier * 3;
    }
    
    // Two matching symbols
    if (resultSymbols[0].symbol === resultSymbols[1].symbol ||
        resultSymbols[1].symbol === resultSymbols[2].symbol ||
        resultSymbols[0].symbol === resultSymbols[2].symbol) {
      return resultSymbols[1].multiplier;
    }
    
    // No match
    return 0;
  };
  
  // Spin the slot machine
  const spin = async () => {
    if (isSpinning) return;
    
    if (betAmount > btcBalance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough BTC to place this bet",
        variant: "destructive",
      });
      return;
    }
    
    setIsSpinning(true);
    setResult([]);
    setWinAmount(0);
    setShowWinAnimation(false);
    
    try {
      // Make the actual bet on the server
      const response = await apiRequest("POST", "/api/games/bet", {
        amount: betAmount,
        currency: "BTC",
        gameType: "slots",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong with your bet");
      }
      
      // Generate random results for each reel (with delayed reveal for animation)
      setTimeout(() => {
        const newResult = reelsRef.current.map(reel => {
          const randomIndex = Math.floor(Math.random() * (reel.length - 10));
          return reel[randomIndex];
        });
        
        setResult(newResult);
        
        // Calculate winnings
        const multiplier = checkWin(newResult);
        const winnings = betAmount * multiplier;
        
        setTimeout(() => {
          setWinAmount(winnings);
          
          if (winnings > 0) {
            setShowWinAnimation(true);
            toast({
              title: "You won!",
              description: `You won ${winnings.toFixed(6)} BTC!`,

            });
          } else {
            toast({
              title: "Better luck next time",
              description: "Spin again for another chance!",
            });
          }
          
          // Refresh balances
          refreshBalances();
          queryClient.invalidateQueries({ queryKey: ["/api/wallet/balances"] });
          
          setIsSpinning(false);
        }, 800);
      }, 1500);
    } catch (error) {
      console.error("Error placing bet:", error);
      toast({
        title: "Bet Failed",
        description: error instanceof Error ? error.message : "Failed to place bet",
        variant: "destructive",
      });
      setIsSpinning(false);
    }
  };

  return (
    <div className="bg-primary-light rounded-xl p-6 max-w-xl mx-auto shadow-lg border border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Bet.99 Crypto Slots</h2>
      
      {/* Slot Machine Display */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6 relative overflow-hidden">
        {showWinAnimation && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-secondary opacity-20 animate-pulse"></div>
            <div className="relative z-10">
              <Sparkles className="w-12 h-12 text-yellow-400 animate-bounce" />
              <div className="mt-2 text-2xl font-bold text-yellow-400">
                +{winAmount.toFixed(6)} BTC
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-center gap-2">
          {result.length ? (
            // Show result
            result.map((item, index) => (
              <div 
                key={index}
                className="w-20 h-20 bg-gray-700 rounded-md flex items-center justify-center text-4xl relative overflow-hidden"
              >
                {item.symbol}
              </div>
            ))
          ) : (
            // Show empty slots or spinning animation
            Array(3).fill(0).map((_, index) => (
              <div 
                key={index}
                className="w-20 h-20 bg-gray-700 rounded-md flex items-center justify-center relative overflow-hidden"
              >
                {isSpinning ? (
                  <div className="absolute inset-0 slot-machine-reel flex flex-col">
                    {Array(10).fill(0).map((_, idx) => (
                      <div key={idx} className="h-20 flex items-center justify-center text-4xl">
                        {symbols[Math.floor(Math.random() * symbols.length)].symbol}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500 text-4xl">?</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Balance and Bet Controls */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-400">Balance</p>
          <p className="font-bold">{btcBalance.toFixed(6)} BTC</p>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-400">Bet Amount</p>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon"
              className="h-8 w-8"
              onClick={decreaseBet}
              disabled={betAmount <= 0.001 || isSpinning}
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <Input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              min={0.001}
              max={0.1}
              step={0.001}
              className="w-24 text-center"
              disabled={isSpinning}
            />
            
            <Button 
              variant="outline" 
              size="icon"
              className="h-8 w-8"
              onClick={increaseBet}
              disabled={betAmount >= 0.1 || betAmount >= btcBalance || isSpinning}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div>
          <p className="text-sm text-gray-400">Win</p>
          <p className="font-bold">{winAmount > 0 ? `+${winAmount.toFixed(6)} BTC` : '0.000000 BTC'}</p>
        </div>
      </div>
      
      {/* Spin Button */}
      <Button
        onClick={spin}
        disabled={isSpinning || betAmount > btcBalance}
        className="w-full h-12 text-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-all"
      >
        {isSpinning ? 'Spinning...' : 'SPIN'}
      </Button>
      
      {/* Game Info */}
      <div className="mt-6 bg-gray-800 rounded-lg p-4 text-sm">
        <h3 className="font-bold mb-2">Winning Combinations</h3>
        <ul className="space-y-1">
          <li>• Three matching symbols: 3x multiplier!</li>
          <li>• Two matching symbols: 1x multiplier!</li>
          <li>• Jackpot (3x 🎰): 60x your bet!</li>
        </ul>
      </div>
    </div>
  );
};

export default SlotMachine;