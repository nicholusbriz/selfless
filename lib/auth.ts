import { useRouter } from 'next/navigation';
import React from 'react';

// User interface for authentication response
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  fullName?: string;
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
    const response = await fetch('/api/user-status', {
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
  } catch (error) {
    
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
 * Simple authentication check for API routes
 * @param request - Next.js request object
 * @returns { user: User | null, isSuperAdmin: boolean, isAdmin: boolean }
 */
export const verifyApiAuth = async (request: Request) => {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return { user: null, isSuperAdmin: false, isAdmin: false };

  const cookies = cookieHeader.split(';').reduce((acc: { [key: string]: string }, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});

  const token = cookies['auth-token'];
  if (!token) return { user: null, isSuperAdmin: false, isAdmin: false };

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/user-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth-token=${token}`
      }
    });

    const data: AuthResponse = await response.json();

    if (!data.success || !data.user) {
      return { user: null, isSuperAdmin: false, isAdmin: false };
    }

    return {
      user: data.user,
      isSuperAdmin: data.user.isSuperAdmin,
      isAdmin: data.user.isAdmin
    };
  } catch (error) {
    
    return { user: null, isSuperAdmin: false, isAdmin: false };
  }
};
