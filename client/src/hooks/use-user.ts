import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

// Hook to get current user with profile data
export function useUser() {
  return useQuery({
    queryKey: [api.user.get.path],
    queryFn: async () => {
      const res = await fetch(api.user.get.path, { credentials: "include" });
      if (res.status === 401) return null; // Handle unauthorized gracefully
      if (!res.ok) throw new Error("Failed to fetch user");
      return await res.json();
    },
    staleTime: 1000 * 60, // 1 minute
  });
}

// Hook to update bank details
export function useUpdateBankDetails() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { bankName: string; bankAccountNumber: string; bankAccountName: string }) => {
      const res = await fetch(api.user.updateBank.path, {
        method: api.user.updateBank.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update bank details");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.user.get.path] });
    },
  });
}
