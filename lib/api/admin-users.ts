// lib/api/admin-users.ts
import axiosInstance from '@/lib/axios';
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  country?: string;
  city?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  roleId?: string;
  profileImageUrl?: string;
  role?: {
    id: string;
    name: string;
    displayName: string;
    permissions?: string[];
  };
  techCenterId?: string;
  techCenter?: {
    id: string;
    name: string;
    code: string;
    country?: {
      id: string;
      name: string;
      code: string;
    };
  };
  _count?: {
    submittedCourses: number;
    announcements: number;
    activityLogs: number;
  };
}

export interface UsersResponse {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters: {
    techCenters: Array<{ id: string; name: string; code: string }>;
    countries: Array<{ id: string; name: string; code: string }>;
    roles: Array<{ id: string; name: string; displayName: string }>;
    statuses: string[];
  };
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  country?: string;
  city?: string;
  techCenterId?: string;
}

export const adminUsersApi = {
  // Get all users with filters
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    techCenterId?: string;
    country?: string;
    role?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<UsersResponse> => {
    const response = await axiosInstance.get<UsersResponse>('/api/admin/users', { params });
    return response.data;
  },

  // Get single user
  getUser: async (userId: string): Promise<User> => {
    const response = await axiosInstance.get<User>(`/api/admin/users/${userId}`);
    return response.data;
  },

  // Update user
  updateUser: async (userId: string, data: UpdateUserData): Promise<{ message: string; user: User }> => {
    const response = await axiosInstance.patch<{ message: string; user: User }>(
      `/api/admin/users/${userId}`,
      data
    );
    return response.data;
  },

  // Update user role
  updateUserRole: async (userId: string, roleId: string): Promise<{ message: string; user: User }> => {
    const response = await axiosInstance.patch<{ message: string; user: User }>(
      `/api/admin/users/${userId}/role`,
      { roleId }
    );
    return response.data;
  },

  // Update user status
  updateUserStatus: async (userId: string, status: string): Promise<{ message: string; user: User }> => {
    const response = await axiosInstance.patch<{ message: string; user: User }>(
      `/api/admin/users/${userId}/status`,
      { status }
    );
    return response.data;
  },

  // Delete user
  deleteUser: async (userId: string): Promise<{ message: string; deleted: any }> => {
    const response = await axiosInstance.delete<{ message: string; deleted: any }>(
      `/api/admin/users/${userId}`
    );
    return response.data;
  },
};