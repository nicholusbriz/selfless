import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User } from '@/lib/auth';
import { isSuperAdminEmail } from '@/config/admin';

export interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  role: 'super-admin' | 'admin';
  permissions?: {
    canManageUsers: boolean;
    canManageCourses: boolean;
    canManageAnnouncements: boolean;
    canManageTutors: boolean;
    canManageAdmins: boolean;
    canDeleteData: boolean;
  };
  isActive: boolean;
}

interface UseAdminAuthResult {
  adminUser: AdminUser | null;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export const useAdminAuth = (user: User | null): UseAdminAuthResult => {
  const [error, setError] = useState<string | null>(null);

  const { data: adminUser, isLoading, error: queryError } = useQuery({
    queryKey: ['admin-auth', user?.id, user?.email],
    queryFn: async () => {
      if (!user || !user.email || !user.id) {
        throw new Error('User data required');
      }

      try {
        // First check if super admin (client-side check)
        if (isSuperAdminEmail(user.email)) {
          return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            role: 'super-admin' as const,
            isActive: true,
            permissions: {
              canManageUsers: true,
              canManageCourses: true,
              canManageAnnouncements: true,
              canManageTutors: true,
              canManageAdmins: true,
              canDeleteData: true
            }
          };
        }

        // Check if promoted admin via API
        const response = await fetch('/api/admins/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            userId: user.id
          }),
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Admin not found');
          }
          throw new Error('Failed to check admin status');
        }

        const data = await response.json();
        return data.admin;

      } catch (err) {
        throw err;
      }
    },
    enabled: !!user && !!user.email && !!user.id,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (queryError) {
      setTimeout(() => setError(queryError instanceof Error ? queryError.message : 'Authentication error'), 0);
    } else {
      setTimeout(() => setError(null), 0);
    }
  }, [queryError]);

  const isAdmin = !!adminUser;
  const isSuperAdmin = adminUser?.role === 'super-admin';

  return {
    adminUser,
    isLoading,
    error,
    isAdmin,
    isSuperAdmin
  };
};
