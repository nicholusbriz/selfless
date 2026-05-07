'use client';

import { useRouter } from 'next/navigation';
import StudentGradesView from '@/components/StudentGradesView';
import { useUserStatus } from '@/contexts/UserStatusContext';

export default function MyGradesPage() {
  const router = useRouter();
  const { user, isLoading, error } = useUserStatus();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🔄</div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
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
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="mb-4 flex items-center gap-2 text-blue-300 hover:text-blue-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">My Grades</h1>
          <p className="text-gray-300">View your academic performance and course grades</p>
        </div>

        {/* Student Grades View */}
        <StudentGradesView studentId={user.id} theme="student" />
      </div>
    </div>
  );
}
