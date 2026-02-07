import { useGames } from "@/hooks/use-games";
import { GameCard } from "@/components/game/GameCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { usePlayGame } from "@/hooks/use-games";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function Home() {
  const { data: games, isLoading } = useGames();
  const { mutate: playGame } = usePlayGame();
  const [search, setSearch] = useState("");
  const [activeGameUrl, setActiveGameUrl] = useState<string | null>(null);

  const filteredGames = games?.filter(g => 
    g.title.toLowerCase().includes(search.toLowerCase()) && g.isActive
  );

  const handlePlay = (id: number) => {
    playGame(id, {
      onSuccess: (data) => setActiveGameUrl(data.url)
    });
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-7xl mx-auto min-h-screen">
      {/* Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-red-900 to-black border border-white/10 p-6 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
        <div className="relative z-10">
          <h2 className="text-3xl font-display font-bold text-white mb-2">
            Welcome to <span className="text-gold">RHF 888</span>
          </h2>
          <p className="text-white/80 max-w-md">
            The most authentic gaming experience. Play responsibly and win big with our premium selection of slots.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <Tabs defaultValue="all" className="w-full md:w-auto">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="all">All Games</TabsTrigger>
            <TabsTrigger value="pgsoft">PG Soft</TabsTrigger>
            <TabsTrigger value="pragmatic">Pragmatic</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search games..." 
            className="pl-9 bg-white/5 border-white/10 focus:border-primary/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          {['all', 'pgsoft', 'pragmatic'].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredGames
                  ?.filter(g => tab === 'all' || g.provider.toLowerCase().replace(/\s/g, '') === tab)
                  .map((game) => (
                    <GameCard key={game.id} game={game} onPlay={handlePlay} />
                  ))}
              </div>
              {filteredGames?.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                  No games found matching your search.
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Game Modal */}
      <Dialog open={!!activeGameUrl} onOpenChange={(open) => !open && setActiveGameUrl(null)}>
        <DialogContent className="max-w-[90vw] h-[90vh] p-0 bg-black border-none">
          {activeGameUrl && (
            <iframe 
              src={activeGameUrl} 
              className="w-full h-full rounded-lg" 
              allowFullScreen
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
