import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CryptoAssets } from "@/components/wallet/crypto-assets";
import { Transactions } from "@/components/wallet/transactions";
import { useAuth } from "@/hooks/use-auth";
import { useWallet } from "@/hooks/use-wallet";

export function Home() {
  const { isAuthenticated } = useAuth();
  const { refreshBalances } = useWallet();

  useEffect(() => {
    if (isAuthenticated) {
      refreshBalances();
    }
  }, [isAuthenticated, refreshBalances]);

  // Featured games array
  const featuredGames = [
    {
      id: "slots",
      title: "Crypto Slots",
      description: "Spin the reels and match crypto symbols to win big!",
      minBet: "0.001 ETH",
      image: "https://images.unsplash.com/photo-1531512073830-ba890ca4eba2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
      badge: { text: "HOT", color: "bg-secondary" }
    },
    {
      id: "blackjack",
      title: "Crypto Blackjack",
      description: "Beat the dealer with your crypto cards!",
      minBet: "0.005 BTC",
      image: "https://pixabay.com/get/gfde37d2850e8b426e4e2587c98cb5b391d595a8a3429a93e18de0217c3bb6b2dc66049b6bfe485f6648e50c7216ec8a80b37b0f2b2327c0fce28d08c10cb0490_1280.jpg",
      badge: { text: "POPULAR", color: "bg-accent" }
    },
    {
      id: "roulette",
      title: "Crypto Roulette",
      description: "Place your bets and win up to 35x your stake!",
      minBet: "0.002 ETH",
      image: "https://pixabay.com/get/gbdd6b309fbcd538fe2edc0aa3de1df8d14d37ca7ffbe7755e51740c05b68511d9f84bfeecf2b2ca7c3cd472c8315bed840f5854bf5d361a49dad347e9a4b0b23_1280.jpg",
      badge: { text: "NEW", color: "bg-danger" }
    }
  ];

  return (
    <>
      {/* Banner Section */}
      <div className="relative">
        <div className="h-64 w-full bg-gradient-to-r from-primary to-secondary relative overflow-hidden">
          <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-[url('https://images.unsplash.com/photo-1606167668584-78701c57f13d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=500')] bg-cover bg-center"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-8 max-w-lg">
            <h2 className="text-3xl font-bold mb-2">Play with Crypto</h2>
            <p className="text-gray-300 mb-4">Experience the future of online gambling with Ethereum-based games and sports betting.</p>
            <Link href="/casino">
              <Button className="bg-secondary hover:bg-secondary-dark text-white font-bold shadow-lg transition-colors duration-200">
                Play Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Games Section */}
      <div className="px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Games</h2>
          <Link href="/casino">
            <a className="text-secondary hover:text-secondary-light font-medium flex items-center">
              <span>View All</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </a>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredGames.map((game) => (
            <div 
              key={game.id} 
              className="game-card bg-primary-light rounded-xl overflow-hidden shadow-lg border border-gray-700"
            >
              <div 
                className="h-40 bg-cover bg-center" 
                style={{ backgroundImage: `url('${game.image}')` }}
              ></div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold">{game.title}</h3>
                    <p className="text-sm text-gray-400">Min Bet: {game.minBet}</p>
                  </div>
                  <span className={`${game.badge.color} px-2 py-1 rounded text-xs font-semibold`}>
                    {game.badge.text}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-300">{game.description}</p>
                <div className="mt-4 flex space-x-2">
                  <Link href={`/casino#${game.id}`}>
                    <Button className="flex-1 bg-secondary hover:bg-secondary-dark text-white transition-colors duration-200">
                      Play
                    </Button>
                  </Link>
                  <Link href={`/casino#${game.id}`}>
                    <Button variant="outline" size="icon" className="bg-gray-700 hover:bg-gray-600 text-white transition-colors duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Sports Betting Section */}
      <div className="px-6 py-8 bg-primary-dark">
        <h2 className="text-2xl font-bold mb-6">Sports Betting</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-3">
            <div className="bg-primary-light rounded-xl p-8 text-center">
              <h3 className="text-xl font-bold mb-4">Explore Our Sports Book</h3>
              <p className="mb-6 text-gray-300 max-w-2xl mx-auto">
                Place bets on your favorite sports including soccer, basketball, and eSports events. 
                Enjoy competitive odds and win big with cryptocurrency!
              </p>
              <Link href="/sports">
                <Button size="lg" className="bg-secondary hover:bg-secondary-dark">
                  View Sports Book
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Crypto Wallet Section (only shown for authenticated users) */}
      {isAuthenticated && (
        <div className="px-6 py-8">
          <h2 className="text-2xl font-bold mb-6">Your Cryptocurrency Wallet</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <CryptoAssets />
            </div>
            
            <div>
              <Transactions limit={3} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Home;
