// lib/api/admin-tech-center-users.ts
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
    roles: Array<{ id: string; name: string; displayName: string }>;
    statuses: string[];
  };
  techCenter: {
    id: string;
    name: string;
    code: string;
  };
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  country?: string;
  city?: string;
}

export const adminTechCenterUsersApi = {
  // Get users in admin's tech center
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<UsersResponse> => {
    const response = await axiosInstance.get<UsersResponse>('/api/admin/tech-centers/users', { params });
    return response.data;
  },

  // Get single user
  getUser: async (userId: string): Promise<User> => {
    const response = await axiosInstance.get<User>(`/api/admin/tech-centers/users/${userId}`);
    return response.data;
  },

  // Update user
  updateUser: async (userId: string, data: UpdateUserData): Promise<{ message: string; user: User }> => {
    const response = await axiosInstance.patch<{ message: string; user: User }>(
      `/api/admin/tech-centers/users/${userId}`,
      data
    );
    return response.data;
  },

  // Update user role
  updateUserRole: async (userId: string, roleId: string): Promise<{ message: string; user: User }> => {
    const response = await axiosInstance.patch<{ message: string; user: User }>(
      `/api/admin/tech-centers/users/${userId}/role`,
      { roleId }
    );
    return response.data;
  },

  // Update user status
  updateUserStatus: async (userId: string, status: string): Promise<{ message: string; user: User }> => {
    const response = await axiosInstance.patch<{ message: string; user: User }>(
      `/api/admin/tech-centers/users/${userId}/status`,
      { status }
    );
    return response.data;
  },
};