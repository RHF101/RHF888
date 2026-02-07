import { useUser } from "@/hooks/use-user";
import { Bell, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export function Header() {
  const { data: user } = useUser();
  const { logout } = useAuth();

  const formattedBalance = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(user?.balance || 0);

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-yellow-600 flex items-center justify-center text-black font-bold text-xs shadow-lg shadow-primary/20">
            RHF
          </div>
          <span className="font-display font-bold text-xl text-white tracking-tight">
            RHF<span className="text-primary">888</span>
          </span>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-xs text-muted-foreground">Main Wallet</span>
              <span className="text-sm font-bold text-primary font-mono">{formattedBalance}</span>
            </div>
            
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
              <Bell className="w-5 h-5" />
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => logout()}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
