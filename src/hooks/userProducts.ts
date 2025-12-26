import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productApi } from '@/api/productApi';
import { ProductRequest } from '@/types/product';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
};

// Hook to fetch all products
export function useProducts(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: productKeys.list(params || {}),
    queryFn: () => productApi.getAll(params),
  });
}

// Hook to fetch single product (For Edit)
export function useProduct(id: number | null) {
  return useQuery({
    queryKey: productKeys.detail(id!),
    queryFn: () => productApi.getById(id!),
    enabled: !!id, 
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductRequest) => productApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductRequest }) => 
      productApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}