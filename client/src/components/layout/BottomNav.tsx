import { Link, useLocation } from "wouter";
import { Home, Wallet, User, History, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/use-user";

export function BottomNav() {
  const [location] = useLocation();
  const { data: user } = useUser();

  const navItems = [
    { href: "/", icon: Home, label: "Lobby" },
    { href: "/wallet", icon: Wallet, label: "Wallet" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  if (user?.isAdmin) {
    navItems.push({ href: "/admin", icon: Shield, label: "Admin" });
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-white/10 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200",
              isActive ? "text-primary" : "text-muted-foreground hover:text-white"
            )}>
              <item.icon className={cn("w-6 h-6", isActive && "drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
