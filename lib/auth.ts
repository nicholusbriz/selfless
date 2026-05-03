'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/config/constants';

// User interface for authentication response
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  fullName?: string;
  createdAt?: string | Date;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isTutor?: boolean;
  tutorPermissions?: {
    canViewAnnouncements: boolean;
    canPostAnnouncements: boolean;
  };
  isRegistered: boolean;
  registrations?: Array<{
    id: string;
    formattedDate: string;
    createdAt?: string | Date;
  }>;
}

// Authentication response interface
export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
}

/**
 * Centralized authentication check function
 * Can be used across all pages to eliminate duplicate authentication code
 */
export const checkUserAccess = async (): Promise<AuthResponse> => {
  try {
    const response = await fetch(API_ENDPOINTS.USER_STATUS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // No body needed - user-status gets user info from JWT token in cookies
    });

    const data: AuthResponse = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Authentication failed'
      };
    }

    return data;
  } catch {

    return {
      success: false,
      message: 'Network error during authentication'
    };
  }
};

/**
 * Hook for handling authentication with automatic redirect
 * @param redirectTo - Where to redirect if authentication fails (default: '/')
 * @param requiredRole - Optional role check ('admin' | 'superadmin' | 'tutor')
 */
export const useAuth = (redirectTo: string = '/', requiredRole?: 'admin' | 'superadmin' | 'tutor') => {
  const router = useRouter();

  const authenticate = async (): Promise<User | null> => {
    const authResult = await checkUserAccess();

    if (!authResult.success || !authResult.user) {
      router.push(redirectTo);
      return null;
    }

    // Check for required role if specified
    if (requiredRole) {
      switch (requiredRole) {
        case 'admin':
          if (!authResult.user.isAdmin) {
            router.push(redirectTo);
            return null;
          }
          break;
        case 'superadmin':
          if (!authResult.user.isSuperAdmin) {
            router.push(redirectTo);
            return null;
          }
          break;
        case 'tutor':
          if (!authResult.user.isTutor) {
            router.push(redirectTo);
            return null;
          }
          break;
      }
    }

    return authResult.user;
  };

  return { authenticate };
};


/**
 * Hook for handling authentication with login redirect for unauthenticated users
 * @param redirectTo - Where to redirect if authentication fails (default: '/login')
 * @param requiredRole - Optional role check ('admin' | 'superadmin' | 'tutor')
 */
export const useAuthWithLogin = (redirectTo: string = '/login', requiredRole?: 'admin' | 'superadmin' | 'tutor') => {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authenticate = async () => {
      try {
        const authResult = await checkUserAccess();

        if (!authResult.success || !authResult.user) {
          router.push(redirectTo);
          return;
        }

        // Check for required role if specified
        if (requiredRole) {
          switch (requiredRole) {
            case 'admin':
              if (!authResult.user.isAdmin) {
                router.push(redirectTo);
                return;
              }
              break;
            case 'superadmin':
              if (!authResult.user.isSuperAdmin) {
                router.push(redirectTo);
                return;
              }
              break;
            case 'tutor':
              if (!authResult.user.isTutor) {
                router.push(redirectTo);
                return;
              }
              break;
          }
        }

        setUser(authResult.user);
      } catch {
        router.push(redirectTo);
      } finally {
        setIsLoading(false);
      }
    };

    authenticate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { user, isLoading };
};
