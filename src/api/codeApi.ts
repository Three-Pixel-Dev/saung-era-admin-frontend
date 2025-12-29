import { apiClient } from '@/lib/api';
import { Code, CodeValueDto, CodeValueRequest } from '@/types/code';

const BASE_URL = '/api/v1/codes';

export const codeApi = {

  getAll: async (): Promise<Code[]> => {
    return apiClient.get<Code[]>(BASE_URL);
  },
  getValuesByCodeId: async (codeId: number): Promise<CodeValueDto[]> => {
    return apiClient.get<CodeValueDto[]>(`${BASE_URL}/${codeId}/values`);
  },
  createValue: async (data: CodeValueRequest): Promise<CodeValueDto> => {
    return apiClient.post<CodeValueDto>(`${BASE_URL}/values`, data);
  },
  updateValue: async (id: number, data: CodeValueRequest): Promise<CodeValueDto> => {
    return apiClient.put<CodeValueDto>(`${BASE_URL}/values/${id}`, data);
  },
  deleteValue: async (id: number): Promise<void> => {
    return apiClient.delete<void>(`${BASE_URL}/values/${id}`);
  },
};