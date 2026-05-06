'use client';

import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/config/constants';

/**
 * Type definitions for user status data
 * Matches the response format from /api/user-status
 */
interface UserStatusData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  fullName?: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  adminPermissions: Record<string, unknown> | null;
  adminRole: 'super-admin' | string | null;
  isTutor: boolean;
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

interface UserStatusContextType {
  user: UserStatusData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  // Convenience getters
  isAdmin: boolean;
  isTutor: boolean;
  isSuperAdmin: boolean;
  canPostAnnouncements: boolean;
  // Permission helpers
  canCreateAnnouncements: boolean;
  canDeleteAnnouncements: boolean;
  canViewAdminPanel: boolean;
  canManageGrades: boolean;
  isAuthenticated: boolean;
  hasPermissions: boolean;
}

/**
 * Context for managing user status across the application
 * Provides a single source of truth for all user-related data and permissions
 */
const UserStatusContext = createContext<UserStatusContextType | undefined>(undefined);

/**
 * Props for the UserStatusProvider component
 */
interface UserStatusProviderProps {
  children: ReactNode;
}

/**
 * Fetch user status from the API
 */
async function fetchUserStatus(): Promise<{ success: boolean; user: UserStatusData }> {
  const response = await fetch(API_ENDPOINTS.USER_STATUS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user status');
  }

  return response.json();
}

/**
 * UserStatusProvider Component
 * 
 * Provides user status data to all child components via React Context.
 * Uses React Query for caching and automatic refetching.
 * 
 * Features:
 * - Automatic caching with 5-minute stale time
 * - Error handling and loading states
 * - Permission helpers for easy access
 * - Automatic updates on auth changes
 */
export function UserStatusProvider({ children }: UserStatusProviderProps) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['user-status'],
    queryFn: fetchUserStatus,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled: true, // Always try to fetch user status
  });

  const user = data?.user || null;
  const errorMessage = error instanceof Error ? error.message : null;

  // Permission helpers
  const isAdmin = user?.isAdmin || false;
  const isTutor = user?.isTutor || false;
  const isSuperAdmin = user?.isSuperAdmin || false;
  const canPostAnnouncements = Boolean(user?.tutorPermissions?.canPostAnnouncements);

  const canCreateAnnouncements = isAdmin || (isTutor && canPostAnnouncements);
  const canDeleteAnnouncements = isAdmin || isTutor;
  const canViewAdminPanel = isAdmin;
  const canManageGrades = isAdmin || isTutor;

  const isAuthenticated = !!user;
  const hasPermissions = isAdmin || isTutor;

  // Clear user data on auth errors
  useEffect(() => {
    if (errorMessage && errorMessage.includes('Authentication')) {
      queryClient.clear();
    }
  }, [errorMessage, queryClient]);

  const contextValue: UserStatusContextType = {
    user,
    isLoading,
    error: errorMessage,
    refetch,
    // Convenience getters
    isAdmin,
    isTutor,
    isSuperAdmin,
    canPostAnnouncements,
    // Permission helpers
    canCreateAnnouncements,
    canDeleteAnnouncements,
    canViewAdminPanel,
    canManageGrades,
    isAuthenticated,
    hasPermissions,
  };

  return (
    <UserStatusContext.Provider value={contextValue}>
      {children}
    </UserStatusContext.Provider>
  );
}

/**
 * Hook to access user status context
 * 
 * Provides easy access to user data and permissions throughout the application.
 * Throws an error if used outside of UserStatusProvider.
 * 
 * @returns UserStatusContextType - User status data and helpers
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { isAdmin, isTutor, canCreateAnnouncements } = useUserStatus();
 *   
 *   if (canCreateAnnouncements) {
 *     return <CreateAnnouncementButton />;
 *   }
 *   
 *   return <ViewOnlyContent />;
 * }
 * ```
 */
export function useUserStatus(): UserStatusContextType {
  const context = useContext(UserStatusContext);

  if (context === undefined) {
    throw new Error('useUserStatus must be used within a UserStatusProvider');
  }

  return context;
}

/**
 * Hook to check if user has specific permissions
 * Convenience hook for common permission checks
 * 
 * @param permissions - Array of permissions to check
 * @returns boolean - Whether user has all specified permissions
 * 
 * @example
 * ```typescript
 * const canManageUsers = usePermissions(['canManageUsers']);
 * ```
 */
export function usePermissions(permissions: string[]): boolean {
  const { user } = useUserStatus();

  if (!user) return false;

  return permissions.every(permission => {
    // Check admin permissions
    if (user.adminPermissions?.[permission]) return true;

    // Check tutor permissions
    if (permission === 'canViewAnnouncements' && user.tutorPermissions?.canViewAnnouncements) return true;
    if (permission === 'canPostAnnouncements' && user.tutorPermissions?.canPostAnnouncements) return true;

    return false;
  });
}

/**
 * Hook to get user's role
 * Returns the user's primary role for UI decisions
 * 
 * @returns string | null - User's role (super-admin, admin, tutor, student)
 */
export function useUserRole(): string | null {
  const { isSuperAdmin, isAdmin, isTutor } = useUserStatus();

  if (isSuperAdmin) return 'super-admin';
  if (isAdmin) return 'admin';
  if (isTutor) return 'tutor';
  return 'student';
}
