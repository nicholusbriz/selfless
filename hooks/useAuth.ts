import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { checkUserAccess, User } from '@/lib/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const useAuth = (redirectTo = '/', requiredRole?: 'admin' | 'superadmin' | 'tutor') => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  const router = useRouter();

  const authenticate = useCallback(async () => {
    try {
      const authResult = await checkUserAccess();

      if (authResult.success && authResult.user) {
        // Check for required role if specified
        if (requiredRole) {
          switch (requiredRole) {
            case 'admin':
              if (!(authResult.user.isAdmin || authResult.user.isSuperAdmin)) {
                setState({
                  user: null,
                  isLoading: false,
                  error: 'Admin access required',
                });
                router.push(redirectTo);
                return;
              }
              break;
            case 'superadmin':
              if (!authResult.user.isSuperAdmin) {
                setState({
                  user: null,
                  isLoading: false,
                  error: 'Superadmin access required',
                });
                router.push(redirectTo);
                return;
              }
              break;
            case 'tutor':
              if (!authResult.user.isTutor) {
                setState({
                  user: null,
                  isLoading: false,
                  error: 'Tutor access required',
                });
                router.push(redirectTo);
                return;
              }
              break;
          }
        }

        setState({
          user: authResult.user,
          isLoading: false,
          error: null,
        });
      } else {
        setState({
          user: null,
          isLoading: false,
          error: 'Authentication error',
        });
        router.push(redirectTo);
      }
    } catch {
      setState({
        user: null,
        isLoading: false,
        error: 'Authentication error',
      });
      router.push(redirectTo);
    }
  }, [router, redirectTo, requiredRole]);

  const logout = async () => {
    try {
      // Call signout API to clear server-side token
      await fetch('/api/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear local state and redirect
      setState({
        user: null,
        isLoading: false,
        error: null,
      });
      router.push(redirectTo);
    }
  };

  const refreshUser = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    await authenticate();
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    authenticate();
  }, [authenticate]);

  return {
    ...state,
    logout,
    refreshUser,
  };
};

export type { AuthState, AuthActions };
