import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type AdminProcessTransactionRequest, type AdminUpdateUserRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// Fetch all users (Admin)
export function useAdminUsers() {
  return useQuery({
    queryKey: [api.admin.users.list.path],
    queryFn: async () => {
      const res = await fetch(api.admin.users.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch users");
      return api.admin.users.list.responses[200].parse(await res.json());
    },
  });
}

// Update User (Admin - Freeze, WinRate, etc)
export function useAdminUpdateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: AdminUpdateUserRequest }) => {
      const validated = api.admin.users.update.input.parse(updates);
      const url = buildUrl(api.admin.users.update.path, { userId });
      
      const res = await fetch(url, {
        method: api.admin.users.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update user");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.users.list.path] });
      toast({ title: "User Updated", description: "Changes saved successfully." });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });
}

// Fetch transactions (Admin)
export function useAdminTransactions(status?: 'pending' | 'approved' | 'rejected') {
  return useQuery({
    queryKey: [api.admin.transactions.list.path, status],
    queryFn: async () => {
      // Build URL manually since query params aren't in path
      let url = api.admin.transactions.list.path;
      if (status) url += `?status=${status}`;
      
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return api.admin.transactions.list.responses[200].parse(await res.json());
    },
  });
}

// Process Transaction (Admin)
export function useProcessTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: AdminProcessTransactionRequest }) => {
      const validated = api.admin.transactions.process.input.parse(data);
      const url = buildUrl(api.admin.transactions.process.path, { id });
      
      const res = await fetch(url, {
        method: api.admin.transactions.process.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to process transaction");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.transactions.list.path] });
      toast({ title: "Transaction Processed", description: "Status updated successfully." });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });
}
