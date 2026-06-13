import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    fullName: string;
  };
  message?: string;
}

/**
 * Login mutation hook
 * 
 * Handles user authentication and automatically updates the user status context
 * across the entire application. Integrates with React Query for caching
 * and automatic UI updates.
 * 
 * Features:
 * - Automatic user status refresh on successful login
 * - Error handling with user-friendly messages
 * - Integration with global user status context
 * - Type-safe request/response handling
 * 
 * @returns Mutation object with login functionality
 * 
 * @example
 * ```typescript
 * const loginMutation = useLogin();
 * 
 * const handleLogin = async (email) => {
 *   try {
 *     await loginMutation.mutateAsync({ email });
 *     // User is now logged in and status is updated globally
 *   } catch (error) {
 *     console.error('Login failed:', error);
 *   }
 * };
 * ```
 */
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
      // Automatically update user status across entire application
      queryClient.invalidateQueries({ queryKey: ['user-status'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
  });
};

/**
 * Registration mutation hook
 * 
 * Handles user registration and automatically updates the user status context.
 * Creates new user accounts and establishes authenticated sessions.
 * 
 * Features:
 * - Automatic user status refresh on successful registration
 * - Form validation and error handling
 * - Integration with global user status context
 * - Secure password handling
 * 
 * @returns Mutation object with registration functionality
 * 
 * @example
 * ```typescript
 * const registerMutation = useRegister();
 * 
 * const handleRegister = async (userData) => {
 *   try {
 *     await registerMutation.mutateAsync(userData);
 *     // User is now registered and status is updated globally
 *   } catch (error) {
 *     console.error('Registration failed:', error);
 *   }
 * };
 * ```
 */
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
      // Immediately update user status across entire application
      queryClient.invalidateQueries({ queryKey: ['user-status'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['chat-users'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      console.error('Registration error:', error);
    },
  });
};

/**
 * Signout mutation hook
 * 
 * Handles user logout and clears all cached data.
 * Provides a clean logout experience with proper cleanup.
 * 
 * Features:
 * - Complete cache clearing on logout
 * - Server-side session termination
 * - Automatic UI updates across application
 * - Error handling for failed logout attempts
 * 
 * @returns Mutation object with logout functionality
 * 
 * @example
 * ```typescript
 * const signoutMutation = useSignout();
 * 
 * const handleLogout = async () => {
 *   try {
 *     await signoutMutation.mutateAsync();
 *     // User is now logged out and all caches are cleared
 *     window.location.href = '/login';
 *   } catch (error) {
 *     console.error('Logout failed:', error);
 *   }
 * };
 * ```
 */
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
      // Clear all cached data and reset application state
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Signout error:', error);
    },
  });
};
