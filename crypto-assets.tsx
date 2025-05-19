import { useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/use-wallet";
import { Skeleton } from "@/components/ui/skeleton";

export interface CryptoAssetProps {
  className?: string;
}

export function CryptoAssets({ className }: CryptoAssetProps) {
  const { balances, isLoading, refreshBalances } = useWallet();

  useEffect(() => {
    refreshBalances();
  }, [refreshBalances]);

  // Crypto icons mapping
  const cryptoIcons: Record<string, JSX.Element> = {
    BTC: (
      <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">₿</div>
    ),
    ETH: (
      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">Ξ</div>
    ),
    LTC: (
      <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold">Ł</div>
    ),
  };

  // Exchange rates for displaying USD value
  const exchangeRates = {
    BTC: 50000,
    ETH: 2500,
    LTC: 180,
  };

  return (
    <Card className={className}>
      <CardHeader className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h3 className="font-bold">Your Assets</h3>
        <Button variant="link" className="text-secondary hover:text-secondary-light font-medium text-sm">
          Deposit
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          // Loading skeleton
          Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="p-4 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div>
                    <Skeleton className="h-5 w-20 mb-1" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-5 w-24 mb-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))
        ) : balances.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p>No assets found. Connect your wallet or make a deposit.</p>
          </div>
        ) : (
          balances.map((balance, index) => {
            const isLastItem = index === balances.length - 1;
            const usdValue = (balance.amount * (exchangeRates[balance.currency as keyof typeof exchangeRates] || 0)).toFixed(2);
            
            return (
              <div 
                key={balance.id} 
                className={`p-4 flex items-center justify-between ${!isLastItem ? 'border-b border-gray-700' : ''}`}
              >
                <div className="flex items-center space-x-3">
                  {cryptoIcons[balance.currency] || (
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                      {balance.currency.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="font-medium">
                      {balance.currency === "BTC" 
                        ? "Bitcoin" 
                        : balance.currency === "ETH" 
                          ? "Ethereum" 
                          : balance.currency === "LTC" 
                            ? "Litecoin" 
                            : balance.currency}
                    </div>
                    <div className="text-sm text-gray-400">{balance.currency}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-accent font-medium">{balance.amount.toFixed(4)} {balance.currency}</div>
                  <div className="text-sm text-gray-400">${usdValue}</div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

export default CryptoAssets;
