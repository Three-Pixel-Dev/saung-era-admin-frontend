import { apiClient } from "@/lib/api";
import { CategoryRequest, CategoryResponse } from "@/types/category";

export const categoryApi = {
  // Get all categories
  getAll: async (): Promise<CategoryResponse[]> => {
    return apiClient.get<CategoryResponse[]>("/api/admin/categories");
  },

  // Get category by ID
  getById: async (id: number): Promise<CategoryResponse> => {
    return apiClient.get<CategoryResponse>(`/api/admin/categories/${id}`);
  },

  // Create category
  create: async (data: CategoryRequest): Promise<CategoryResponse> => {
    return apiClient.post<CategoryResponse>("/api/admin/categories", data);
  },

  // Update category
  update: async (
    id: number,
    data: CategoryRequest
  ): Promise<CategoryResponse> => {
    return apiClient.put<CategoryResponse>(`/api/admin/categories/${id}`, data);
  },

  // Soft delete category
  delete: async (id: number): Promise<void> => {
    return apiClient.delete<void>(`/api/admin/categories/${id}`);
  },

  // Restore category
  restore: async (id: number): Promise<CategoryResponse> => {
    return apiClient.post<CategoryResponse>(
      `/api/admin/categories/${id}/restore`
    );
  },

  // Hard delete category
  hardDelete: async (id: number): Promise<void> => {
    return apiClient.delete<void>(`/api/admin/categories/${id}/hard`);
  },
};
