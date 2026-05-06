'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStatus } from '@/contexts/UserStatusContext';

interface GuardOptions {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
  redirectTo?: string;
}

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: GuardOptions = {}
) {
  return function AuthenticatedComponent(props: P) {
    const { user, isLoading, isAuthenticated, isAdmin, isSuperAdmin } = useUserStatus();
    const router = useRouter();

    const {
      requireAuth = true,
      requireAdmin = false,
      requireSuperAdmin = false,
      redirectTo = '/login'
    } = options;

    // Redirect logic in useEffect to avoid setState during render
    useEffect(() => {
      if (!isLoading) {
        if (requireAuth && !isAuthenticated) {
          router.push(redirectTo);
        } else if (requireAdmin && !isAdmin) {
          router.push('/unauthorized');
        } else if (requireSuperAdmin && !isSuperAdmin) {
          router.push('/unauthorized');
        }
      }
    }, [isLoading, isAuthenticated, isAdmin, isSuperAdmin, requireAuth, requireAdmin, requireSuperAdmin, redirectTo, router]);

    // Single loading state
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      );
    }

    // Don't render component if not authenticated/authorized
    if (requireAuth && !isAuthenticated) {
      return null;
    }

    if (requireAdmin && !isAdmin) {
      return null;
    }

    if (requireSuperAdmin && !isSuperAdmin) {
      return null;
    }

    return <Component {...props} />;
  };
}
