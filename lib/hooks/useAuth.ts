// lib/hooks/useAuth.ts
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getApiErrorMessage, readJsonObject } from '@/lib/api-response';

export function useAuth() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const user = session?.user || null;
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  const login = async (email: string, password: string) => {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl: '/dashboard',
    });

    if (result?.error === 'ACCOUNT_PENDING_APPROVAL') {
      const response = await fetch('/api/auth/pending-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await readJsonObject(response).catch(
        (): Record<string, unknown> => ({}),
      );

      if (response.status === 403 && data.requiresApproval) {
        return {
          requiresApproval: true,
          user: data.user,
          error: getApiErrorMessage(data, 'Unable to check account approval status'),
        };
      }

      return { error: getApiErrorMessage(data, 'Unable to check account approval status') };
    }

    if (result?.error) {
      return { error: 'Invalid email or password' };
    }

    // Fetch user data to check for eduEmail
    if (result?.ok) {
      try {
        const userResponse = await fetch('/api/auth/me');
        if (userResponse.ok) {
          const userData = await readJsonObject(userResponse);
          return { user: userData };
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    }

    return result;
  };

  const logout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const updateUser = async (updates: object) => {
    const response = await fetch('/api/user/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    const data = await readJsonObject(response);
    // Update the NextAuth session immediately with the new data
    await update();
    return data;
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    isSuperAdmin: () => user?.role === 'super_admin',
    isAdmin: () => user?.role === 'admin',
    isTeacher: () => user?.role === 'teacher',
    isStudent: () => user?.role === 'student',
  };
}