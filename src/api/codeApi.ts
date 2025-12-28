import { apiClient } from "@/lib/api";
import { CodeValueDto, CodeValueRequest } from "@/types/code";

export const codeApi = {
  getValuesByCodeId: async (codeId: number): Promise<CodeValueDto[]> => {
    return apiClient.get<CodeValueDto[]>(`/api/v1/codes/${codeId}/values`);
  },

  createValue: async (data: CodeValueRequest): Promise<CodeValueDto> => {
    return apiClient.post<CodeValueDto>("/api/v1/codes/values", data);
  },

  updateValue: async (id: number, data: CodeValueRequest): Promise<CodeValueDto> => {
    return apiClient.put<CodeValueDto>(`/api/v1/codes/values/${id}`, data);
  },

  deleteValue: async (id: number): Promise<void> => {
    return apiClient.delete<void>(`/api/v1/codes/values/${id}`);
  },
};

