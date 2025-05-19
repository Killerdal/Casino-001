import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/use-wallet";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

// Card suits and ranks
const suits = ["♠", "♥", "♦", "♣"];
const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

// Card class
interface Card {
  suit: string;
  rank: string;
  value: number;
  hidden?: boolean;
}

// Create a deck of cards
const createDeck = (): Card[] => {
  const deck: Card[] = [];
  
  for (const suit of suits) {
    for (const rank of ranks) {
      let value = 0;
      
      if (rank === "A") {
        value = 11;
      } else if (["J", "Q", "K"].includes(rank)) {
        value = 10;
      } else {
        value = parseInt(rank);
      }
      
      deck.push({ suit, rank, value });
    }
  }
  
  return shuffleDeck(deck);
};

// Shuffle the deck
const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
};

// Calculate hand value
const calculateHandValue = (hand: Card[]): number => {
  let value = 0;
  let aces = 0;
  
  for (const card of hand) {
    if (card.hidden) continue;
    
    value += card.value;
    
    if (card.rank === "A") {
      aces++;
    }
  }
  
  // Adjust for aces
  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }
  
  return value;
};

// Determine if a hand is blackjack
const isBlackjack = (hand: Card[]): boolean => {
  return hand.length === 2 && calculateHandValue(hand) === 21;
};

// Game states
type GameState = "betting" | "playing" | "dealerTurn" | "gameOver";

export function Blackjack() {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<GameState>("betting");
  const [betAmount, setBetAmount] = useState(0.01);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<"win" | "lose" | "push" | null>(null);
  const [winAmount, setWinAmount] = useState(0);
  
  const { getBalance, refreshBalances } = useWallet();
  const { toast } = useToast();
  
  // Get user's BTC balance
  const btcBalance = getBalance("BTC") || 0;
  
  // Initialize or reset the game
  const initGame = () => {
    const newDeck = createDeck();
    setDeck(newDeck);
    setPlayerHand([]);
    setDealerHand([]);
    setGameState("betting");
    setResult(null);
    setWinAmount(0);
  };
  
  // Deal initial cards
  const dealCards = async () => {
    if (isLoading) return;
    if (betAmount > btcBalance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough BTC to place this bet",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Make the bet on the server
      await apiRequest("POST", "/api/games/bet", {
        amount: betAmount,
        currency: "BTC",
        gameType: "blackjack",
      });
      
      // Set up the game locally
      const newDeck = [...deck];
      
      // Deal two cards to player
      const playerCard1 = newDeck.pop()!;
      const playerCard2 = newDeck.pop()!;
      
      // Deal two cards to dealer (second one hidden)
      const dealerCard1 = newDeck.pop()!;
      const dealerCard2 = { ...newDeck.pop()!, hidden: true };
      
      const newPlayerHand = [playerCard1, playerCard2];
      const newDealerHand = [dealerCard1, dealerCard2];
      
      setDeck(newDeck);
      setPlayerHand(newPlayerHand);
      setDealerHand(newDealerHand);
      setGameState("playing");
      
      // Check for player blackjack
      if (isBlackjack(newPlayerHand)) {
        // Reveal dealer's hidden card
        newDealerHand[1].hidden = false;
        setDealerHand([...newDealerHand]);
        
        // Check if dealer also has blackjack
        if (isBlackjack(newDealerHand)) {
          // Push (tie)
          handleGameOver("push");
        } else {
          // Player wins with blackjack (pays 3:2)
          handleGameOver("win", betAmount * 1.5);
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error dealing cards:", error);
      toast({
        title: "Error",
        description: "Failed to place bet. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };
  
  // Player hits (takes another card)
  const hit = () => {
    if (gameState !== "playing") return;
    
    const newDeck = [...deck];
    const card = newDeck.pop()!;
    const newPlayerHand = [...playerHand, card];
    
    setDeck(newDeck);
    setPlayerHand(newPlayerHand);
    
    // Check if player busts
    if (calculateHandValue(newPlayerHand) > 21) {
      handleGameOver("lose");
    }
  };
  
  // Player stands (ends turn)
  const stand = () => {
    if (gameState !== "playing") return;
    
    // Reveal dealer's hidden card
    const newDealerHand = [...dealerHand];
    newDealerHand[1].hidden = false;
    
    setDealerHand(newDealerHand);
    setGameState("dealerTurn");
  };
  
  // Player doubles down
  const doubleDown = async () => {
    if (gameState !== "playing" || playerHand.length !== 2) return;
    if (betAmount * 2 > btcBalance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough BTC to double down",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Double the bet on the server
      await apiRequest("POST", "/api/games/bet", {
        amount: betAmount,
        currency: "BTC",
        gameType: "blackjack",
      });
      
      // Double the bet locally
      setBetAmount(betAmount * 2);
      
      // Deal one more card to player
      const newDeck = [...deck];
      const card = newDeck.pop()!;
      const newPlayerHand = [...playerHand, card];
      
      setDeck(newDeck);
      setPlayerHand(newPlayerHand);
      
      // Check if player busts
      if (calculateHandValue(newPlayerHand) > 21) {
        handleGameOver("lose");
      } else {
        // Player stands after doubling down
        stand();
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error doubling down:", error);
      toast({
        title: "Error",
        description: "Failed to double down. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };
  
  // Dealer's turn
  useEffect(() => {
    if (gameState === "dealerTurn") {
      const dealerPlay = setTimeout(() => {
        const newDeck = [...deck];
        let newDealerHand = [...dealerHand];
        
        // Dealer hits until 17 or higher
        while (calculateHandValue(newDealerHand) < 17) {
          const card = newDeck.pop()!;
          newDealerHand = [...newDealerHand, card];
        }
        
        setDeck(newDeck);
        setDealerHand(newDealerHand);
        
        // Determine winner
        const playerValue = calculateHandValue(playerHand);
        const dealerValue = calculateHandValue(newDealerHand);
        
        if (dealerValue > 21 || playerValue > dealerValue) {
          // Player wins
          handleGameOver("win", betAmount);
        } else if (dealerValue > playerValue) {
          // Dealer wins
          handleGameOver("lose");
        } else {
          // Push (tie)
          handleGameOver("push");
        }
      }, 1000);
      
      return () => clearTimeout(dealerPlay);
    }
  }, [gameState, dealerHand, deck, betAmount, playerHand]);
  
  // Handle game over
  const handleGameOver = (result: "win" | "lose" | "push", winningAmount: number = 0) => {
    setGameState("gameOver");
    setResult(result);
    
    if (result === "win") {
      setWinAmount(winningAmount);
      toast({
        title: "You won!",
        description: `You won ${winningAmount.toFixed(4)} BTC`,
      });
    } else if (result === "lose") {
      toast({
        title: "You lost",
        description: "Better luck next time!",
      });
    } else {
      toast({
        title: "Push",
        description: "It's a tie! Your bet has been returned.",
      });
    }
    
    refreshBalances();
  };
  
  // Initialize game on component mount
  useEffect(() => {
    initGame();
  }, []);
  
  return (
    <div className="bg-primary-light rounded-xl p-6 max-w-2xl mx-auto shadow-lg border border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-center">Crypto Blackjack</h2>
      
      {/* Game Table */}
      <div className="bg-green-900 rounded-lg p-6 mb-6">
        {/* Dealer's Hand */}
        <div className="mb-8">
          <div className="text-gray-300 mb-2">
            Dealer's Hand {gameState !== "betting" && !dealerHand[1]?.hidden && `(${calculateHandValue(dealerHand)})`}
          </div>
          <div className="flex space-x-2">
            {dealerHand.length > 0 ? (
              dealerHand.map((card, index) => (
                <div
                  key={index}
                  className={`w-16 h-24 md:w-20 md:h-28 rounded-md flex items-center justify-center font-bold text-xl ${
                    card.hidden 
                      ? "bg-gray-800 text-gray-800" 
                      : card.suit === "♥" || card.suit === "♦"
                        ? "bg-white text-red-600"
                        : "bg-white text-black"
                  }`}
                >
                  {card.hidden ? "?" : `${card.rank}${card.suit}`}
                </div>
              ))
            ) : (
              <div className="w-16 h-24 md:w-20 md:h-28 bg-gray-800 rounded-md"></div>
            )}
          </div>
        </div>
        
        {/* Player's Hand */}
        <div>
          <div className="text-gray-300 mb-2">
            Your Hand {gameState !== "betting" && `(${calculateHandValue(playerHand)})`}
          </div>
          <div className="flex space-x-2 flex-wrap">
            {playerHand.length > 0 ? (
              playerHand.map((card, index) => (
                <div
                  key={index}
                  className={`w-16 h-24 md:w-20 md:h-28 rounded-md flex items-center justify-center font-bold text-xl mb-2 ${
                    card.suit === "♥" || card.suit === "♦"
                      ? "bg-white text-red-600"
                      : "bg-white text-black"
                  }`}
                >
                  {`${card.rank}${card.suit}`}
                </div>
              ))
            ) : (
              <div className="w-16 h-24 md:w-20 md:h-28 bg-gray-800 rounded-md"></div>
            )}
          </div>
        </div>
      </div>
      
      {/* Win Display */}
      {result && (
        <div className={`mb-6 text-center p-4 rounded-lg border ${
          result === "win" 
            ? "bg-secondary bg-opacity-20 border-secondary"
            : result === "lose"
              ? "bg-destructive bg-opacity-20 border-destructive"
              : "bg-accent bg-opacity-20 border-accent"
        }`}>
          <h3 className="text-xl font-bold">
            {result === "win" 
              ? "You Won!" 
              : result === "lose" 
                ? "You Lost" 
                : "Push (Tie)"}
          </h3>
          {result === "win" && (
            <p className="text-3xl font-bold">{winAmount.toFixed(4)} BTC</p>
          )}
        </div>
      )}
      
      {/* Game Controls */}
      <div className="space-y-4">
        {gameState === "betting" ? (
          <>
            <div>
              <label className="block mb-2 font-medium text-sm">Bet Amount (BTC)</label>
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                className="w-full"
                min={0.001}
                max={0.1}
                step={0.001}
              />
            </div>
            
            <div className="flex justify-between text-sm">
              <span>Balance: {btcBalance.toFixed(4)} BTC</span>
            </div>
            
            <Button 
              className="w-full bg-secondary hover:bg-secondary-dark"
              onClick={dealCards}
              disabled={isLoading || btcBalance < betAmount}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Dealing...
                </>
              ) : (
                'Deal Cards'
              )}
            </Button>
          </>
        ) : gameState === "playing" ? (
          <div className="flex space-x-2">
            <Button 
              className="flex-1 bg-secondary hover:bg-secondary-dark"
              onClick={hit}
            >
              Hit
            </Button>
            <Button 
              className="flex-1 bg-primary-dark hover:bg-gray-700"
              onClick={stand}
            >
              Stand
            </Button>
            <Button 
              className="flex-1 bg-accent hover:bg-accent-dark"
              onClick={doubleDown}
              disabled={playerHand.length !== 2 || betAmount * 2 > btcBalance || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Double'
              )}
            </Button>
          </div>
        ) : (
          <Button 
            className="w-full bg-secondary hover:bg-secondary-dark"
            onClick={initGame}
          >
            New Game
          </Button>
        )}
      </div>
    </div>
  );
}

export default Blackjack;
