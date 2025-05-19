import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/use-wallet";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

// Roulette numbers and their colors
const rouletteNumbers = [
  { number: 0, color: "green" },
  { number: 32, color: "red" },
  { number: 15, color: "black" },
  { number: 19, color: "red" },
  { number: 4, color: "black" },
  { number: 21, color: "red" },
  { number: 2, color: "black" },
  { number: 25, color: "red" },
  { number: 17, color: "black" },
  { number: 34, color: "red" },
  { number: 6, color: "black" },
  { number: 27, color: "red" },
  { number: 13, color: "black" },
  { number: 36, color: "red" },
  { number: 11, color: "black" },
  { number: 30, color: "red" },
  { number: 8, color: "black" },
  { number: 23, color: "red" },
  { number: 10, color: "black" },
  { number: 5, color: "red" },
  { number: 24, color: "black" },
  { number: 16, color: "red" },
  { number: 33, color: "black" },
  { number: 1, color: "red" },
  { number: 20, color: "black" },
  { number: 14, color: "red" },
  { number: 31, color: "black" },
  { number: 9, color: "red" },
  { number: 22, color: "black" },
  { number: 18, color: "red" },
  { number: 29, color: "black" },
  { number: 7, color: "red" },
  { number: 28, color: "black" },
  { number: 12, color: "red" },
  { number: 35, color: "black" },
  { number: 3, color: "red" },
  { number: 26, color: "black" }
];

// Bet types
type BetType = "straight" | "red" | "black" | "odd" | "even" | "1to18" | "19to36";

interface Bet {
  type: BetType;
  amount: number;
  selection?: number;  // For straight bets
}

interface BetOption {
  type: BetType;
  label: string;
  payout: number;
  selector?: number;
}

// Define bet options and their payouts
const betOptions: BetOption[] = [
  { type: "straight", label: "Straight (Single Number)", payout: 35 },
  { type: "red", label: "Red", payout: 1 },
  { type: "black", label: "Black", payout: 1 },
  { type: "odd", label: "Odd", payout: 1 },
  { type: "even", label: "Even", payout: 1 },
  { type: "1to18", label: "1 to 18", payout: 1 },
  { type: "19to36", label: "19 to 36", payout: 1 }
];

export function Roulette() {
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<typeof rouletteNumbers[0] | null>(null);
  const [selectedBetType, setSelectedBetType] = useState<BetType>("red");
  const [betAmount, setBetAmount] = useState(0.002);
  const [selectedNumber, setSelectedNumber] = useState(0);
  const [placedBets, setPlacedBets] = useState<Bet[]>([]);
  const [totalBetAmount, setTotalBetAmount] = useState(0);
  const [winAmount, setWinAmount] = useState(0);
  
  const { getBalance, refreshBalances } = useWallet();
  const { toast } = useToast();
  
  // Get user's ETH balance
  const ethBalance = getBalance("ETH") || 0;
  
  // Update total bet amount when placed bets change
  useEffect(() => {
    const total = placedBets.reduce((sum, bet) => sum + bet.amount, 0);
    setTotalBetAmount(total);
  }, [placedBets]);
  
  // Add a bet
  const addBet = () => {
    if (betAmount <= 0) {
      toast({
        title: "Invalid bet amount",
        description: "Bet amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }
    
    if (totalBetAmount + betAmount > ethBalance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough ETH to place this bet",
        variant: "destructive",
      });
      return;
    }
    
    const newBet: Bet = {
      type: selectedBetType,
      amount: betAmount,
    };
    
    if (selectedBetType === "straight") {
      newBet.selection = selectedNumber;
    }
    
    setPlacedBets([...placedBets, newBet]);
    
    toast({
      title: "Bet placed",
      description: `${betAmount} ETH on ${getBetDescription(newBet)}`,
    });
  };
  
  // Get a description of a bet
  const getBetDescription = (bet: Bet): string => {
    if (bet.type === "straight") {
      return `Straight (${bet.selection})`;
    }
    
    const option = betOptions.find(o => o.type === bet.type);
    return option?.label || bet.type;
  };
  
  // Clear all bets
  const clearBets = () => {
    setPlacedBets([]);
  };
  
  // Spin the roulette wheel
  const spin = async () => {
    if (spinning || placedBets.length === 0) return;
    
    setSpinning(true);
    setWinAmount(0);
    
    try {
      // Make the bet on the server for the total amount
      // In a real implementation, would send all individual bets
      const response = await apiRequest("POST", "/api/games/bet", {
        amount: totalBetAmount,
        currency: "ETH",
        gameType: "roulette",
      });
      
      // Animate the roulette spinning
      const spinDuration = 3000;
      const spinStartTime = Date.now();
      
      // Random result
      const resultIndex = Math.floor(Math.random() * rouletteNumbers.length);
      const result = rouletteNumbers[resultIndex];
      
      // Animate spinning
      const animateSpin = () => {
        const elapsedTime = Date.now() - spinStartTime;
        
        if (elapsedTime < spinDuration) {
          // During animation, show random positions
          const randomIndex = Math.floor(Math.random() * rouletteNumbers.length);
          setSpinResult(rouletteNumbers[randomIndex]);
          
          requestAnimationFrame(animateSpin);
        } else {
          // Animation complete, show final result
          setSpinResult(result);
          calculateWinnings(result);
          setSpinning(false);
        }
      };
      
      animateSpin();
    } catch (error) {
      console.error("Error spinning:", error);
      toast({
        title: "Error",
        description: "Failed to place bet. Please try again.",
        variant: "destructive",
      });
      setSpinning(false);
    }
  };
  
  // Calculate winnings based on result
  const calculateWinnings = (result: typeof rouletteNumbers[0]) => {
    let totalWinnings = 0;
    
    placedBets.forEach((bet) => {
      let win = false;
      
      switch (bet.type) {
        case "straight":
          win = result.number === bet.selection;
          break;
        case "red":
          win = result.color === "red";
          break;
        case "black":
          win = result.color === "black";
          break;
        case "odd":
          win = result.number !== 0 && result.number % 2 === 1;
          break;
        case "even":
          win = result.number !== 0 && result.number % 2 === 0;
          break;
        case "1to18":
          win = result.number >= 1 && result.number <= 18;
          break;
        case "19to36":
          win = result.number >= 19 && result.number <= 36;
          break;
      }
      
      if (win) {
        const option = betOptions.find(o => o.type === bet.type);
        if (option) {
          totalWinnings += bet.amount * (option.payout + 1); // Add 1 to include the original bet
        }
      }
    });
    
    setWinAmount(totalWinnings);
    
    if (totalWinnings > 0) {
      toast({
        title: "You won!",
        description: `You won ${totalWinnings.toFixed(4)} ETH`,
      });
    } else {
      toast({
        title: "Better luck next time!",
        description: `The result was ${result.number} ${result.color}`,
      });
    }
    
    refreshBalances();
  };
  
  return (
    <div className="bg-primary-light rounded-xl p-6 max-w-2xl mx-auto shadow-lg border border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-center">Crypto Roulette</h2>
      
      {/* Roulette Wheel */}
      <div className="mb-6 flex flex-col items-center">
        <div className="w-48 h-48 roulette-wheel rounded-full flex items-center justify-center mb-4 relative overflow-hidden">
          {spinResult && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${
                  spinResult.color === "red" 
                    ? "bg-red-600 text-white" 
                    : spinResult.color === "black" 
                      ? "bg-black text-white" 
                      : "bg-green-600 text-white"
                }`}
              >
                {spinResult.number}
              </div>
            </div>
          )}
        </div>
        
        {/* Win Display */}
        {winAmount > 0 && !spinning && (
          <div className="mb-4 text-center bg-secondary bg-opacity-20 p-4 rounded-lg border border-secondary">
            <h3 className="text-xl font-bold text-secondary-foreground">You Won!</h3>
            <p className="text-3xl font-bold">{winAmount.toFixed(4)} ETH</p>
          </div>
        )}
      </div>
      
      {/* Betting Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-bold mb-3">Place Your Bets</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium">Bet Type</label>
              <select 
                className="w-full bg-gray-800 border border-gray-700 rounded p-2"
                value={selectedBetType}
                onChange={(e) => setSelectedBetType(e.target.value as BetType)}
              >
                {betOptions.map((option) => (
                  <option key={option.type} value={option.type}>
                    {option.label} ({option.payout}:1)
                  </option>
                ))}
              </select>
            </div>
            
            {selectedBetType === "straight" && (
              <div>
                <label className="block mb-2 text-sm font-medium">Select Number</label>
                <Input
                  type="number"
                  value={selectedNumber}
                  onChange={(e) => setSelectedNumber(Number(e.target.value))}
                  min={0}
                  max={36}
                  className="w-full"
                />
              </div>
            )}
            
            <div>
              <label className="block mb-2 text-sm font-medium">Bet Amount (ETH)</label>
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                min={0.001}
                step={0.001}
                className="w-full"
              />
            </div>
            
            <div className="flex space-x-2">
              <Button 
                className="flex-1"
                onClick={addBet}
                disabled={spinning || betAmount <= 0 || totalBetAmount + betAmount > ethBalance}
              >
                Add Bet
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={clearBets}
                disabled={spinning || placedBets.length === 0}
              >
                Clear Bets
              </Button>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-bold mb-3">Your Bets</h3>
          
          <div className="bg-gray-800 rounded-lg p-4 h-48 overflow-y-auto mb-4">
            {placedBets.length === 0 ? (
              <p className="text-gray-400 text-center mt-10">No bets placed yet</p>
            ) : (
              <ul className="space-y-2">
                {placedBets.map((bet, index) => (
                  <li key={index} className="text-sm flex justify-between items-center border-b border-gray-700 pb-2">
                    <span>{getBetDescription(bet)}</span>
                    <span className="font-medium">{bet.amount.toFixed(4)} ETH</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="flex justify-between mb-4">
            <span>Total Bet:</span>
            <span className="font-bold">{totalBetAmount.toFixed(4)} ETH</span>
          </div>
          
          <div className="flex justify-between mb-4">
            <span>Balance:</span>
            <span className="font-medium">{ethBalance.toFixed(4)} ETH</span>
          </div>
          
          <Button 
            className="w-full bg-secondary hover:bg-secondary-dark py-3"
            onClick={spin}
            disabled={spinning || placedBets.length === 0}
          >
            {spinning ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Spinning...
              </>
            ) : (
              'Spin Roulette'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Roulette;
