import { CategoryResponse } from "./category";

export interface ProductCodeValueRequest {
  colorId: number;
  sizeId: number;
  price: number;
  quantity: number;
}

export interface ProductResponse {
  id: number;
  name: string;
  description?: string;
  shortDescription?: string;
  longDescription?: string;
  status?: string;
  tags?: string;
  isTaxable?: boolean;
  allowBackorder?: boolean;
  discountType?: string;
  discountAmount?: number;
  weight?: number;
  countryId?: number;
  categories?: CategoryResponse[];
  productCodeValues?: ProductCodeValueRequest[]; 
  createdAt?: string; 
  updatedAt?: string; 
}

export interface ProductRequest {
  name: string;
  description?: string;
  shortDescription?: string;
  longDescription?: string;
  status: string;
  tags: string;
  isTaxable: boolean;
  allowBackorder: boolean;
  discountType?: string;
  discountAmount?: number;
  weight?: number;
  countryId: number;
  categoryIds: number[];
  productCodeValues: ProductCodeValueRequest[];
}