'use client';

import { useRouter } from 'next/navigation';
import GradeManagement from '@/components/GradeManagement';
import { useUserStatus } from '@/contexts/UserStatusContext';
import { PageLoader, BackgroundImage } from '@/components/ui';

export default function GradesPage() {
  const router = useRouter();
  const { user, isLoading, error } = useUserStatus();

  // Show loading state
  if (isLoading) {
    return <PageLoader text="Loading Grade Management..." color="emerald" />;
  }

  // Show error state
  if (error || !user) {
    return (
      <BackgroundImage className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold text-white mb-4">Authentication Error</h1>
            <p className="text-gray-300 mb-6">
              {error || 'Unable to authenticate. Please log in again.'}
            </p>
            <button
              onClick={() => router.push('/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </BackgroundImage>
    );
  }

  // Check if user is tutor or admin (using the same logic as dashboard)
  if (!user.isTutor && !user.isAdmin) {
    return (
      <BackgroundImage className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-gray-300 mb-6">
              Only tutors and administrators can access the grade management system.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </BackgroundImage>
    );
  }

  return (
    <BackgroundImage className="h-screen">
      <GradeManagement tutorId={user.id} />
    </BackgroundImage>
  );
}
