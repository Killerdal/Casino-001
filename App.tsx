
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Home } from "@/pages/home";
import { Casino } from "@/pages/casino";
import { Sports } from "@/pages/sports";
import { Profile } from "@/pages/profile";
import { Deposit } from "@/pages/deposit";
import AppLayout from "@/components/layout/app-layout";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AuthProvider } from "./context/auth-context";
import { WalletProvider } from "./context/wallet-context";

function Router() {
  const { checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/casino" component={Casino} />
        <Route path="/sports" component={Sports} />
        <Route path="/profile" component={Profile} />
        <Route path="/deposit" component={Deposit} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WalletProvider>
          <TooltipProvider>
            <Router />
            <Toaster />
          </TooltipProvider>
        </WalletProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
