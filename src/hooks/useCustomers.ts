import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerApi } from "@/api/customerApi";
import { UserResponse } from "@/types/user";

// Query keys
export const customerKeys = {
  all: ["customers"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...customerKeys.lists(), filters] as const,
  details: () => [...customerKeys.all, "detail"] as const,
  detail: (id: number) => [...customerKeys.details(), id] as const,
};

// Get all customers (with pagination & search)
export function useCustomers(params: {
  page: number;
  size: number;
  keyword?: string;
}) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => customerApi.getAll(params),
  });
}

// Get customer by ID
export function useCustomer(id: number | null) {
  return useQuery({
    queryKey: customerKeys.detail(id!),
    queryFn: () => customerApi.getById(id!),
    enabled: !!id,
  });
}

// Block customer mutation
export function useBlockCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => customerApi.block(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}

// Unblock customer mutation
export function useUnblockCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => customerApi.unblock(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}
