export type UserStatus = "ACTIVE" | "BLOCKED";

export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  phoneNumber?: string;
  status: UserStatus;
  createdAt: string;
  address?: string;
  kyc?: string;
  dateOfBirth?: string;
  points?: number;
  referralCode?: string;
  totalOrders?: number;
}

export interface UserResponse {
  content: User[];
  totalPages: number;
  totalElements: number;
}
