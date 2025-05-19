import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpCircle, ArrowDownCircle, ShoppingCart, RefreshCw } from "lucide-react";

export interface TransactionsProps {
  className?: string;
  limit?: number;
}

type Transaction = {
  id: number;
  userId: number;
  type: string;
  amount: number;
  currency: string;
  gameType?: string;
  status: string;
  txHash?: string;
  createdAt: string;
};

export function Transactions({ className, limit }: TransactionsProps) {
  const { isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/transactions'],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (data?.transactions) {
      const txList = limit ? data.transactions.slice(0, limit) : data.transactions;
      setTransactions(txList);
    }
  }, [data, limit]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + 
             `, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    }
  };

  // Get transaction icon
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowUpCircle className="h-4 w-4 text-accent" />;
      case 'withdrawal':
        return <ArrowDownCircle className="h-4 w-4 text-danger" />;
      case 'bet':
        return <ShoppingCart className="h-4 w-4 text-danger" />;
      case 'win':
        return <ArrowUpCircle className="h-4 w-4 text-accent" />;
      default:
        return <RefreshCw className="h-4 w-4" />;
    }
  };

  // Shorten transaction hash
  const shortenTxHash = (hash?: string) => {
    if (!hash) return '';
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };

  return (
    <Card className={className}>
      <CardHeader className="p-4 border-b border-gray-700">
        <h3 className="font-bold">Recent Transactions</h3>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          // Loading skeleton
          Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div>
                      <Skeleton className="h-5 w-24 mb-1" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-5 w-20 mb-1" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            ))
        ) : error ? (
          <div className="p-8 text-center text-gray-400">
            <p>Failed to load transactions. Please try again later.</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p>No transactions found. Start playing to see your transaction history!</p>
          </div>
        ) : (
          transactions.map((tx, index) => {
            const isLastItem = index === transactions.length - 1;
            const isPositiveAmount = tx.type === 'deposit' || tx.type === 'win';
            
            return (
              <div 
                key={tx.id} 
                className={`p-4 ${!isLastItem ? 'border-b border-gray-700' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary flex items-center justify-center rounded-full">
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div>
                      <div className="font-medium">
                        {tx.gameType 
                          ? `Game: ${tx.gameType.charAt(0).toUpperCase() + tx.gameType.slice(1)}`
                          : tx.type.charAt(0).toUpperCase() + tx.type.slice(1)
                        }
                      </div>
                      <div className="text-xs text-gray-400">{formatDate(tx.createdAt)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${isPositiveAmount ? 'text-accent' : 'text-danger'}`}>
                      {isPositiveAmount ? '+' : ''}{tx.amount.toFixed(4)} {tx.currency}
                    </div>
                    {tx.txHash && (
                      <div className="text-xs text-gray-400 font-mono">{shortenTxHash(tx.txHash)}</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

export default Transactions;
