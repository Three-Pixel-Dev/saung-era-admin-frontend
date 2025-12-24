import { CategoryResponse } from "./category";

export interface ProductResponse {
  id: number;
  name: string;
  price: number;
  quantity: number;
  description?: string;
  shortDescription?: string;
  weight?: number;
  discountAmount?: number;
  sku?: string;
  status?: string;
  tags?: string;
  isTaxable?: boolean;
  allowBackorder?: boolean;
  categories?: CategoryResponse[];
  countryId?: number;
}

export interface ProductRequest {
  name: string;
  description?: string;
  quantity: number;
  price: number;
  discountType?: string;
  discountAmount?: number;
  shortDescription?: string;
  longDescription?: string;
  weight?: number;
  countryId: number | null;
  
  categoryIds: number[];
  sku: string;
  tags: string;
  status: string;
  isTaxable: boolean;
  allowBackorder: boolean;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}