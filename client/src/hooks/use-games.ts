import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// Fetch all games
export function useGames() {
  return useQuery({
    queryKey: [api.games.list.path],
    queryFn: async () => {
      const res = await fetch(api.games.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch games");
      return api.games.list.responses[200].parse(await res.json());
    },
  });
}

// Play game (get launch URL)
export function usePlayGame() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (gameId: number) => {
      const url = buildUrl(api.games.play.path, { id: gameId });
      const res = await fetch(url, { 
        method: api.games.play.method,
        credentials: "include" 
      });
      
      if (!res.ok) {
        if (res.status === 403) throw new Error("Insufficient balance or account frozen.");
        throw new Error("Failed to launch game");
      }
      return api.games.play.responses[200].parse(await res.json());
    },
    onError: (error) => {
      toast({
        title: "Cannot Play",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}
