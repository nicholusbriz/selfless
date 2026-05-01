'use client';

import React from 'react';
import { useAuth, User } from './auth';

/**
 * Higher-order function for page-level authentication
 * @param PageComponent - The page component to protect
 * @param options - Authentication options
 */
export const withAuth = <P extends object>(
  PageComponent: React.ComponentType<P>,
  options: {
    redirectTo?: string;
    requiredRole?: 'admin' | 'superadmin' | 'tutor';
  } = {}
) => {
  const AuthenticatedPage = (props: P) => {
    const { authenticate } = useAuth(options.redirectTo || '/', options.requiredRole);
    const [user, setUser] = React.useState<User | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      const checkAuth = async () => {
        const authenticatedUser = await authenticate();
        setUser(authenticatedUser);
        setLoading(false);
      };

      checkAuth();
    }, []);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
        </div>
      );
    }

    if (!user) {
      return null; // Will redirect automatically
    }

    return <PageComponent {...props} user={user} />;
  };

  return AuthenticatedPage;
};
