import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// Fetch transaction history
export function useTransactions() {
  return useQuery({
    queryKey: [api.wallet.history.path],
    queryFn: async () => {
      const res = await fetch(api.wallet.history.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return api.wallet.history.responses[200].parse(await res.json());
    },
  });
}

// Create deposit
export function useDeposit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: { amount: number; proofImageUrl: string }) => {
      const validated = api.wallet.deposit.input.parse(data);
      const res = await fetch(api.wallet.deposit.path, {
        method: api.wallet.deposit.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create deposit");
      }
      return api.wallet.deposit.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.wallet.history.path] });
      toast({
        title: "Deposit Submitted",
        description: "Your deposit request is pending admin approval.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Deposit Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

// Create withdrawal
export function useWithdraw() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { amount: number; destinationAccount: string }) => {
      const validated = api.wallet.withdraw.input.parse(data);
      const res = await fetch(api.wallet.withdraw.path, {
        method: api.wallet.withdraw.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create withdrawal");
      }
      return api.wallet.withdraw.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.wallet.history.path] });
      queryClient.invalidateQueries({ queryKey: [api.user.get.path] }); // Update balance
      toast({
        title: "Withdrawal Submitted",
        description: "Your withdrawal request is processing.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}
