import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-red-900/20 to-transparent pointer-events-none" />
      <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded bg-gradient-to-br from-primary to-yellow-600 flex items-center justify-center text-black font-bold shadow-lg shadow-primary/20">
            RHF
          </div>
          <span className="font-display font-bold text-2xl tracking-tight">
            RHF<span className="text-primary">888</span>
          </span>
        </div>
        <Button asChild variant="outline" className="border-primary/50 text-primary hover:bg-primary hover:text-black transition-all">
          <a href="/api/login">Login</a>
        </Button>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6 max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-sm font-medium text-gold mb-4">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Official Partner of PG Soft & Pragmatic Play
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight">
            Experience the <span className="text-gradient-gold">Golden Standard</span> of Gaming
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Join RHF 888 today for premium slots, instant withdrawals, and 24/7 VIP support. The most authentic gaming experience in Asia.
          </p>

          <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="h-14 px-8 text-lg font-bold bg-primary hover:bg-primary/90 text-black shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
              <a href="/api/login">Start Playing Now</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg border-white/10 hover:bg-white/5">
              <a href="#games">View Games</a>
            </Button>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 w-full">
          {[
            { title: "Instant Withdrawal", desc: "Get your winnings in minutes via local bank transfer.", icon: "⚡" },
            { title: "Fair Play Certified", desc: "Official API integration with guaranteed RTP rates.", icon: "🛡️" },
            { title: "24/7 Support", desc: "Our VIP team is always ready to assist you.", icon: "💎" },
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 transition-colors"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-white/10 py-12 text-center text-muted-foreground text-sm">
        <p>&copy; 2024 RHF 888. All rights reserved. 18+ Play Responsibly.</p>
      </footer>
    </div>
  );
}
