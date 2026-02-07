import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";

// Pages
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Wallet from "@/pages/Wallet";
import Profile from "@/pages/Profile";
import AdminDashboard from "@/pages/admin/Dashboard";
import NotFound from "@/pages/not-found";
import { useUser } from "./hooks/use-user";

function ProtectedRoute({ component: Component, adminOnly = false }: { component: React.ComponentType, adminOnly?: boolean }) {
  const { user, isLoading } = useAuth();
  const { data: userProfile, isLoading: isProfileLoading } = useUser();

  if (isLoading || (adminOnly && isProfileLoading)) return <div className="min-h-screen bg-black flex items-center justify-center text-primary animate-pulse">Loading RHF 888...</div>;

  if (!user) return <Redirect to="/" />;
  
  if (adminOnly && !userProfile?.isAdmin) return <Redirect to="/" />;

  return (
    <>
      <Header />
      <Component />
      <BottomNav />
    </>
  );
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="min-h-screen bg-black" />;

  return (
    <Switch>
      {/* Public Route */}
      <Route path="/">
        {user ? <Redirect to="/home" /> : <Landing />}
      </Route>

      {/* Protected Routes */}
      <Route path="/home">
        <ProtectedRoute component={Home} />
      </Route>
      <Route path="/wallet">
        <ProtectedRoute component={Wallet} />
      </Route>
      <Route path="/profile">
        <ProtectedRoute component={Profile} />
      </Route>
      
      {/* Admin Route */}
      <Route path="/admin">
        <ProtectedRoute component={AdminDashboard} adminOnly />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
