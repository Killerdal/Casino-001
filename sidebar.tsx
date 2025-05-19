import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useWallet } from "@/hooks/use-wallet";
import {
  Home,
  Zap,
  DollarSign,
  User,
  Clock,
  HelpCircle,
  Settings,
  LogIn,
  UserPlus,
  Wallet,
  Bitcoin,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const { balances } = useWallet();

  // Get primary balance (Bitcoin)
  const primaryBalance = balances.find(b => b.currency === 'BTC');

  return (
    <div className={cn("w-full md:w-64 bg-primary-dark flex-shrink-0 border-r border-gray-700 flex flex-col h-full", className)}>
      <div className="p-4 flex items-center justify-center md:justify-start">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
            <DollarSign className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Bet.99</span>
        </div>
      </div>

      <nav className="mt-6 flex-1">
        <div className="px-4 py-2 text-gray-400 text-xs font-medium uppercase tracking-wider">
          Main Menu
        </div>

        <NavItem href="/" icon={<Home className="h-5 w-5 mr-3" />} isActive={location === "/"}>
          Home
        </NavItem>

        <NavItem 
          href="/casino" 
          icon={<Zap className="h-5 w-5 mr-3" />} 
          isActive={location === "/casino"}
        >
          Casino
        </NavItem>

        <NavItem 
          href="/sports" 
          icon={<DollarSign className="h-5 w-5 mr-3" />} 
          isActive={location === "/sports"}
        >
          Sports
        </NavItem>

        {user ? (
          <>
            <div className="px-4 py-2 mt-6 text-gray-400 text-xs font-medium uppercase tracking-wider">
              Your Account
            </div>

            <NavItem 
              href="/profile" 
              icon={<User className="h-5 w-5 mr-3" />} 
              isActive={location === "/profile"}
            >
              Profile
            </NavItem>

            <NavItem 
              href="/deposit" 
              icon={<Wallet className="h-5 w-5 mr-3" />} 
              isActive={location === "/deposit"}
            >
              Deposit/Withdraw
            </NavItem>

            <NavItem 
              href="/transactions" 
              icon={<Clock className="h-5 w-5 mr-3" />} 
              isActive={location === "/transactions"}
            >
              Transactions
            </NavItem>

            <NavItem 
              href="/support" 
              icon={<HelpCircle className="h-5 w-5 mr-3" />} 
              isActive={location === "/support"}
            >
              Support
            </NavItem>
          </>
        ) : (
          <>
            <div className="px-4 py-2 mt-6 text-gray-400 text-xs font-medium uppercase tracking-wider">
              Join Bet.99
            </div>

            <div className="px-4 py-3">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center mb-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0"
                onClick={() => document.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { tab: 'login' } }))}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>

              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center bg-transparent border border-indigo-500 text-indigo-500 hover:bg-indigo-500 hover:text-white"
                onClick={() => document.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { tab: 'signup' } }))}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Sign Up
              </Button>
            </div>

            <div className="px-4 py-2 mt-4 text-gray-400 text-xs font-medium uppercase tracking-wider">
              Accepted Cryptocurrencies
            </div>

            <div className="px-4 py-3 flex flex-wrap gap-2 justify-center">
              <div className="p-2 bg-gray-800 rounded-full" title="Bitcoin (BTC)">
                <Bitcoin className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="p-2 bg-gray-800 rounded-full" title="Ethereum (ETH)">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
                </svg>
              </div>
              <div className="p-2 bg-gray-800 rounded-full" title="Solana (SOL)">
                <svg className="h-5 w-5 text-purple-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4.603 15.443l2.41-1.393c.15-.086.332-.086.482 0l8.5 4.918c.15.086.15.258 0 .344l-2.41 1.393c-.15.086-.332.086-.482 0l-8.5-4.918c-.15-.086-.15-.258 0-.344zm0-6.428l2.41-1.393c.15-.086.332-.086.482 0l8.5 4.918c.15.086.15.258 0 .344l-2.41 1.393c-.15.086-.332.086-.482 0l-8.5-4.918c-.15-.086-.15-.258 0-.344zm11.392-5.035l-2.41 1.393c-.15.086-.332.086-.482 0l-8.5-4.918c-.15-.086-.15-.258 0-.344l2.41-1.393c.15-.086.332.086.482 0l8.5 4.918c.15.086.15.258 0 .344z" />
                </svg>
              </div>
              <div className="p-2 bg-gray-800 rounded-full" title="USDT (Tether)">
                <svg className="h-5 w-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-.041 4.8h7.132v2.4h-2.4v3.6h-2.4v-3.6h-2.332V4.8zm.041 6c3.97 0 7.2 1.073 7.2 2.4s-3.23 2.4-7.2 2.4-7.2-1.073-7.2-2.4 3.23-2.4 7.2-2.4z"/>
                </svg>
              </div>
              <div className="p-2 bg-gray-800 rounded-full" title="Litecoin (LTC)">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0a12 12 0 1 0 12 12A12 12 0 0 0 12 0zm-.262 3.678h2.584a.343.343 0 0 1 .33.435l-2.03 6.918l1.905-.582l-.408 1.385l-1.924.56l-1.248 4.214h6.676a.343.343 0 0 1 .33.435l-.436 1.47a.343.343 0 0 1-.33.252H6.733l1.723-5.845l-1.905.582l.408-1.385l1.924-.56l2.69-9.142a.343.343 0 0 1 .33-.252z"/>
                </svg>
              </div>
            </div>
            <div className="px-4 py-3">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0"
                onClick={() => window.location.href = '/deposit'}
              >
                <Wallet className="h-4 w-4 mr-2" />
                Deposit Crypto
              </Button>
            </div>
          </>
        )}
      </nav>

      {user && primaryBalance && (
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-xs font-bold">₿</div>
              <div className="font-accent">
                <div className="text-xs text-gray-400">Balance</div>
                <div className="font-medium">{primaryBalance.amount.toFixed(4)} BTC</div>
              </div>
            </div>
            <button className="text-gray-400 hover:text-white">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  isActive: boolean;
  children: React.ReactNode;
}

function NavItem({ href, icon, isActive, children }: NavItemProps) {
  return (
    <Link href={href}>
      <div
        className={cn(
        "flex items-center px-4 py-3 transition-colors duration-200 cursor-pointer",
        isActive 
          ? "text-gray-100 bg-primary-light border-l-4 border-secondary" 
          : "text-gray-300 hover:bg-primary-light hover:text-gray-100 border-l-4 border-transparent"
      )}>
        {icon}
        <span>{children}</span>
      </div>
    </Link>
  );
}

export default Sidebar;