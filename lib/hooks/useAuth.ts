// lib/hooks/useAuth.ts
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const user = session?.user || null;
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  const login = async (email: string, password: string) => {
    // First try the custom login endpoint which returns rich error data
    // (e.g. pendingUser info when requiresApproval is true)
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    // Account pending approval — return the data so the UI can show the
    // PendingApprovalMessage component with the user's details.
    if (response.status === 403 && data.requiresApproval) {
      return { requiresApproval: true, user: data.user, error: data.error };
    }

    // Other login failure
    if (!response.ok) {
      return { error: data.error || 'Login failed' };
    }

    // Credentials valid — now create the NextAuth session
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { error: result.error };
    }

    return result;
  };

  const logout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const updateUser = async (updates: any) => {
    const response = await fetch('/api/user/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    const data = await response.json();
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