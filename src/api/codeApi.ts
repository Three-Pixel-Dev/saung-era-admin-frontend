// src/api/codeApi.ts
import { apiClient } from '@/lib/api';
import { Code, CodeValue } from '@/types/code';

const BASE_URL = '/api/v1/codes';

export const codeApi = {
  // Matches GET /api/v1/codes
  getAll: () => 
    apiClient.get<Code[]>(BASE_URL),

  // Matches GET /api/v1/codes/{codeId}/values
  getValuesByCodeId: (codeId: number) => 
    apiClient.get<CodeValue[]>(`${BASE_URL}/${codeId}/values`),
};