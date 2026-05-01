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

export const useAuth = (redirectTo = '/') => {
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
        setState({
          user: authResult.user,
          isLoading: false,
          error: null,
        });
      } else {
        // User not found, redirect to specified route
        setState({
          user: null,
          isLoading: false,
          error: 'Authentication failed',
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
  }, [router, redirectTo]);

  const logout = () => {
    setState({
      user: null,
      isLoading: false,
      error: null,
    });
    router.push(redirectTo);
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
