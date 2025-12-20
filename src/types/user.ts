export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phoneNumber: string | null;
}

export interface UserResponse {
  content: User[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}
