'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, fetchUser } = useAuthStore();

  useEffect(() => {
    // Fetch user data if authenticated but user data is missing
    if (isAuthenticated && !user) {
      fetchUser();
    }
    
    console.log('Dashboard - Auth state:', { isAuthenticated, user });
    // Redirect all users to overview
    router.push('/dashboard/overview');
  }, [router, isAuthenticated, user, fetchUser]);

  return (
    <ProtectedRoute>
      <div className="p-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
    </ProtectedRoute>
  );
}
