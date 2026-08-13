// lib/api/admin-users.ts
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
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
    }
    const response = await fetch(`/api/admin/users?${queryParams.toString()}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch users');
    }
    return response.json();
  },

  // Get single user
  getUser: async (userId: string): Promise<User> => {
    const response = await fetch(`/api/admin/users/${userId}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch user');
    }
    return response.json();
  },

  // Update user
  updateUser: async (userId: string, data: UpdateUserData): Promise<{ message: string; user: User }> => {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update user');
    }
    return response.json();
  },

  // Update user role
  updateUserRole: async (userId: string, roleId: string): Promise<{ message: string; user: User }> => {
    const response = await fetch(`/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roleId }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update user role');
    }
    return response.json();
  },

  // Update user status
  updateUserStatus: async (userId: string, status: string): Promise<{ message: string; user: User }> => {
    const response = await fetch(`/api/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update user status');
    }
    return response.json();
  },

  // Delete user
  deleteUser: async (userId: string): Promise<{ message: string; deleted: any }> => {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete user');
    }
    return response.json();
  },
};