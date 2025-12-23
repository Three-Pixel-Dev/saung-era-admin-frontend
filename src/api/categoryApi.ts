import { apiClient } from "@/lib/api";
import { CategoryRequest, CategoryResponse, PagedResponse, CategoryListParams } from "@/types/category";

export const categoryApi = {
  getAll: async (params?: CategoryListParams): Promise<PagedResponse<CategoryResponse>> => {
    return apiClient.get<PagedResponse<CategoryResponse>>("/api/admin/categories", params);
  },

  getById: async (id: number): Promise<CategoryResponse> => {
    return apiClient.get<CategoryResponse>(`/api/admin/categories/${id}`);
  },

  create: async (data: CategoryRequest): Promise<CategoryResponse> => {
    return apiClient.post<CategoryResponse>("/api/admin/categories", data);
  },

  update: async (
    id: number,
    data: CategoryRequest
  ): Promise<CategoryResponse> => {
    return apiClient.put<CategoryResponse>(`/api/admin/categories/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    return apiClient.delete<void>(`/api/admin/categories/${id}`);
  },

  restore: async (id: number): Promise<CategoryResponse> => {
    return apiClient.post<CategoryResponse>(
      `/api/admin/categories/${id}/restore`
    );
  },

  hardDelete: async (id: number): Promise<void> => {
    return apiClient.delete<void>(`/api/admin/categories/${id}/hard`);
  },
};
