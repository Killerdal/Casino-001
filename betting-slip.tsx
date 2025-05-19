import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SportsBetSelection {
  matchId: string;
  selectionId: string;
  odds: number;
  matchDescription: string;
  selection: string;
}

interface BettingSlipProps {
  selection: SportsBetSelection | null;
  onClear: () => void;
}

export function BettingSlip({ selection, onClear }: BettingSlipProps) {
  const [stake, setStake] = useState(0.05);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getBalance, refreshBalances } = useWallet();
  const { toast } = useToast();
  
  // Get ETH balance
  const ethBalance = getBalance("ETH") || 0;
  
  // Calculate potential win
  const potentialWin = selection ? stake * selection.odds : 0;
  
  // Place bet
  const placeBet = async () => {
    if (!selection) return;
    
    if (stake <= 0) {
      toast({
        title: "Invalid stake",
        description: "Stake must be greater than 0",
        variant: "destructive",
      });
      return;
    }
    
    if (stake > ethBalance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough ETH to place this bet",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest("POST", "/api/sports/bet", {
        matchId: selection.matchId,
        selectionId: selection.selectionId,
        odds: selection.odds,
        stake,
        currency: "ETH",
      });
      
      const data = await response.json();
      
      toast({
        title: "Bet Placed Successfully",
        description: `${stake} ETH on ${selection.selection}`,
      });
      
      // Refresh balances and clear selection
      refreshBalances();
      onClear();
    } catch (error) {
      console.error("Error placing bet:", error);
      toast({
        title: "Error",
        description: "Failed to place bet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader className="p-4 border-b border-gray-700">
        <h3 className="font-bold">Betting Slip</h3>
      </CardHeader>
      
      <CardContent className="p-4">
        {selection ? (
          <div className="border border-gray-700 rounded-lg p-3 mb-3">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">{selection.matchDescription}</span>
              <button 
                className="text-gray-400 hover:text-white"
                onClick={onClear}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">Win</span>
              <span>{selection.selection}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Odds</span>
              <span>{selection.odds.toFixed(2)}</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400">
            Select a bet from the matches to add it to your betting slip
          </div>
        )}
        
        {selection && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Stake (ETH)</label>
              <div className="relative">
                <Input
                  type="number"
                  value={stake}
                  onChange={(e) => setStake(Number(e.target.value))}
                  className="w-full bg-primary-dark border border-gray-700 pr-10"
                  min={0.001}
                  step={0.001}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">Ξ</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between text-sm mb-2">
              <span>Potential Win:</span>
              <span className="font-accent font-medium">{potentialWin.toFixed(3)} ETH</span>
            </div>
            
            <Button 
              className="w-full bg-secondary hover:bg-secondary-dark"
              onClick={placeBet}
              disabled={isSubmitting || !selection || stake <= 0 || stake > ethBalance}
            >
              {isSubmitting ? "Placing Bet..." : "Place Bet"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default BettingSlip;
