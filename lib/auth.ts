'use client';

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
  tutorPermissions?: Record<string, boolean>;
  isRegistered: boolean;
  registrations?: Array<{
    id: string;
    formattedDate: string;
    createdAt?: string | Date;
    dayName?: string;
    cleaningDayDate?: string;
    userId?: string;
    registeredCount?: number;
    maxSlots?: number;
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

