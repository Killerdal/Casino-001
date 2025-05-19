import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { BettingSlip } from "@/components/sports/betting-slip";

export interface SportsMatch {
  id: number;
  externalId: string;
  sportType: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  isLive: boolean;
  status: string;
  createdAt: string;
}

interface SportsBetSelection {
  matchId: string;
  selectionId: string;
  odds: number;
  matchDescription: string;
  selection: string;
}

export function SportsCard() {
  const [selectedSport, setSelectedSport] = useState<string>("All");
  const [matches, setMatches] = useState<SportsMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBet, setSelectedBet] = useState<SportsBetSelection | null>(null);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  // Fetch sports matches
  const fetchMatches = async (sportType?: string) => {
    setLoading(true);
    try {
      const url = sportType && sportType !== "All" 
        ? `/api/sports/matches?sport=${sportType}`
        : "/api/sports/matches";
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Failed to fetch matches");
      }
      
      const data = await response.json();
      setMatches(data.matches || []);
    } catch (error) {
      console.error("Error fetching matches:", error);
      toast({
        title: "Error",
        description: "Failed to load sports matches",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch matches on mount and when sport changes
  useEffect(() => {
    fetchMatches(selectedSport !== "All" ? selectedSport : undefined);
  }, []);
  
  const handleSportChange = (sport: string) => {
    setSelectedSport(sport);
    fetchMatches(sport !== "All" ? sport : undefined);
  };
  
  // Handle selection for betting
  const handleBetSelection = (match: SportsMatch, selectionType: string, odds: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to place bets",
        variant: "destructive",
      });
      return;
    }
    
    const selection: SportsBetSelection = {
      matchId: match.externalId,
      selectionId: `${selectionType}-${match.externalId}`,
      odds,
      matchDescription: `${match.homeTeam} vs ${match.awayTeam}`,
      selection: selectionType === "home" 
        ? match.homeTeam 
        : selectionType === "away" 
          ? match.awayTeam 
          : "Draw"
    };
    
    setSelectedBet(selection);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h3 className="font-bold">Upcoming Matches</h3>
            <Tabs defaultValue="All" onValueChange={handleSportChange}>
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="All">All</TabsTrigger>
                <TabsTrigger value="Soccer">Soccer</TabsTrigger>
                <TabsTrigger value="Basketball">Basketball</TabsTrigger>
                <TabsTrigger value="eSports">eSports</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin h-8 w-8 border-b-2 border-secondary rounded-full mx-auto"></div>
                <p className="mt-4">Loading matches...</p>
              </div>
            ) : matches.length === 0 ? (
              <div className="p-8 text-center">
                <p>No matches available for this sport</p>
              </div>
            ) : (
              <div>
                {matches.map((match) => (
                  <div key={match.id} className="p-4 border-b border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 text-sm">{match.sportType}</span>
                        {match.isLive && (
                          <Badge variant="secondary" className="bg-secondary-dark text-white">LIVE</Badge>
                        )}
                      </div>
                      <span className="text-gray-400 text-sm">{formatDate(match.startTime)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center text-lg font-bold">
                          {match.homeTeam.charAt(0)}
                        </div>
                        <span className="font-medium">{match.homeTeam}</span>
                      </div>
                      <div className="flex space-x-4">
                        <Button
                          variant="outline"
                          className="bg-primary-dark hover:bg-gray-700"
                          onClick={() => handleBetSelection(match, "home", 2.10)}
                        >
                          2.10
                        </Button>
                        <Button
                          variant="outline"
                          className="bg-primary-dark hover:bg-gray-700"
                          onClick={() => handleBetSelection(match, "draw", 3.25)}
                        >
                          3.25
                        </Button>
                        <Button
                          variant="outline"
                          className="bg-primary-dark hover:bg-gray-700"
                          onClick={() => handleBetSelection(match, "away", 3.60)}
                        >
                          3.60
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center text-lg font-bold">
                          {match.awayTeam.charAt(0)}
                        </div>
                        <span className="font-medium">{match.awayTeam}</span>
                      </div>
                      <Button variant="link" className="text-secondary hover:text-secondary-light text-sm font-medium" disabled>
                        +25 more
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div>
        <BettingSlip selection={selectedBet} onClear={() => setSelectedBet(null)} />
      </div>
    </div>
  );
}

export default SportsCard;
