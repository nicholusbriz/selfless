import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/config/constants';

interface LoginCredentials {
  email: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

interface AuthResponse {
  success: boolean;
  user?: any;
  message?: string;
}

// Login hook
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await fetch(API_ENDPOINTS.SIGNIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data: AuthResponse = await response.json();
      return data;
    },
    onSuccess: () => {
      // Invalidate user-related queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['user-status'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// Register hook
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: RegisterData) => {
      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const data: AuthResponse = await response.json();
      return data;
    },
    onSuccess: () => {
      // Invalidate user-related queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['user-status'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// Signout hook
export const useSignout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(API_ENDPOINTS.SIGNOUT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Signout failed');
      }

      return response.json();
    },
    onSuccess: () => {
      // Clear all user-related queries
      queryClient.clear();
    },
  });
};

// User status hook
export const useUserStatus = () => {
  return useQuery({
    queryKey: ['user-status'],
    queryFn: async () => {
      const response = await fetch(API_ENDPOINTS.USER_STATUS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user status');
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};
