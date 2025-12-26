// src/api/productApi.ts

import { apiClient } from '@/lib/api';
import { ProductRequest, ProductResponse } from '@/types/product';

const BASE_URL = '/api/admin/products';

export const productApi = {
  
  getAll: (params?: Record<string, unknown>) => {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const url = queryString ? `${BASE_URL}?${queryString}` : BASE_URL;
    
    return apiClient.get<any>(url);
  },

  getById: (id: number) => 
    apiClient.get<ProductResponse>(`${BASE_URL}/${id}`),

  create: (data: ProductRequest) => 
    apiClient.post<ProductResponse>(BASE_URL, data),

  update: (id: number, data: ProductRequest) => 
    apiClient.put<ProductResponse>(`${BASE_URL}/${id}`, data),

  delete: (id: number) => 
    apiClient.delete<void>(`${BASE_URL}/${id}`),
};