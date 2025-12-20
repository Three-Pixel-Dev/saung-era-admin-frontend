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

