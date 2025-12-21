import { apiClient } from "@/lib/api";
import { User, UserResponse } from "@/types/user";

export const customerApi = {
  // Get all users with manual query string construction
  getAll: async (params: {
    page: number;
    size: number;
    keyword?: string;
    status?: string;
  }): Promise<UserResponse> => {
    const searchParams = new URLSearchParams();
    searchParams.append("page", params.page.toString());
    searchParams.append("size", params.size.toString());

    if (params.status) {
      searchParams.append("status", params.status);
    }

    if (params.keyword) {
      searchParams.append("keyword", params.keyword);
    }

    return apiClient.get<UserResponse>(
      `/api/admin/users?${searchParams.toString()}`
    );
  },

  // Get user by ID
  getById: async (id: number): Promise<User> => {
    return apiClient.get<User>(`/api/admin/users/${id}`);
  },

  // Block user
  block: async (id: number): Promise<void> => {
    return apiClient.delete<void>(`/api/admin/users/${id}/block`);
  },

  // Unblock user
  unblock: async (id: number): Promise<void> => {
    return apiClient.post<void>(`/api/admin/users/${id}/unblock`);
  },
};
