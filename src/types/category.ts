export interface CategoryRequest {
  name: string;
  description?: string;
  parentId?: number | null;
}

export interface CategoryResponse {
  id: number;
  name: string;
  description?: string;
  parentId?: number | null;
  parentCategory?: CategoryResponse | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  createdBy?: UserResponse;
  updatedBy?: UserResponse;
  deletedBy?: UserResponse;
}

export interface UserResponse {
  id: number;
  name: string;
  username: string;
  email: string;
  phoneNumber?: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
}

export interface CategoryListParams {
  keyword?: string;
  page?: number;
  size?: number;
  status?: string;
}

