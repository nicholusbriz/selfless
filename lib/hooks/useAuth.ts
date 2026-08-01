// lib/hooks/useAuth.ts
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

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
    });
    if (result?.error) throw new Error(result.error);
    return result;
  };

  const logout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const updateUser = async (updates: any) => {
    const response = await axios.post('/api/user/update', updates);
    // Update the NextAuth session immediately with the new data
    await update();
    return response.data;
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