import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useContext } from "react";
import { AuthContext } from "@/context/auth-context";
import { WalletContext } from "@/context/wallet-context";
import {
  Home,
  Zap,
  DollarSign,
  User,
  Clock,
  HelpCircle,
  Settings,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function SidebarWithContext({ className }: SidebarProps) {
  const [location] = useLocation();
  const authContext = useContext(AuthContext);
  const walletContext = useContext(WalletContext);
  
  const user = authContext?.user || null;
  const balances = walletContext?.balances || [];
  
  // Get primary balance (Bitcoin)
  const primaryBalance = balances.find(b => b.currency === 'BTC');

  return (
    <div className={cn("w-full md:w-64 bg-primary-dark flex-shrink-0 border-r border-gray-700 flex flex-col h-full", className)}>
      <div className="p-4 flex items-center justify-center md:justify-start">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <DollarSign className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold text-white">CryptoRoyale</span>
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
        
        {user && (
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
      <a className={cn(
        "flex items-center px-4 py-3 transition-colors duration-200",
        isActive 
          ? "text-gray-100 bg-primary-light border-l-4 border-secondary" 
          : "text-gray-300 hover:bg-primary-light hover:text-gray-100 border-l-4 border-transparent"
      )}>
        {icon}
        <span>{children}</span>
      </a>
    </Link>
  );
}

export default SidebarWithContext;