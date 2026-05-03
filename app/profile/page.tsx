'use client';

import { useRouter } from 'next/navigation';
import { BackgroundImage, PageLoader } from '@/components/ui';
import { useAuthWithLogin } from '@/lib/auth';
import { useSignout } from '@/hooks/loginRegister';

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuthWithLogin('/login');
  const router = useRouter();

  // Use signout hook instead of manual fetch
  const signout = useSignout();

  if (!user || authLoading) {
    return <PageLoader text="Loading Profile" color="purple" />;
  }

  return (
    <BackgroundImage className="min-h-screen relative">
      {/* Glass overlay for better readability */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>

      {/* Modern Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-white/80 hover:text-white transition-colors"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-xl font-bold text-white">User Profile</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Profile Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-4 border-white/20"></div>
            </div>

            {/* Basic Info */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-3xl font-bold text-white mb-2">
                {user.fullName || `${user.firstName} ${user.lastName}`}
              </h2>
              <p className="text-white/80 mb-4">{user.email}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                {user.isAdmin && (
                  <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs rounded-full font-medium">
                    Admin
                  </span>
                )}
                {user.isTutor && (
                  <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs rounded-full font-medium">
                    Tutor
                  </span>
                )}
                <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs rounded-full font-medium">
                  Student
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 p-6 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">📞</span> Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-white/70 text-sm mb-1">Email Address</p>
              <p className="text-white font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm mb-1">Phone Number</p>
              <p className="text-white font-medium">
                {user.phoneNumber || 'Not provided'}
              </p>
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 p-6 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">📚</span> Academic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-white/70 text-sm mb-1">Full Name</p>
              <p className="text-white font-medium">{user.fullName || `${user.firstName} ${user.lastName}`}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm mb-1">Student ID</p>
              <p className="text-white font-medium">{user.id}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm mb-1">Member Since</p>
              <p className="text-white font-medium">Active Student</p>
            </div>
            <div>
              <p className="text-white/70 text-sm mb-1">Account Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-green-400 font-medium">Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Course Registration Summary */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 p-6 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">📖</span> Course Registration Summary
          </h3>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📚</span>
            </div>
            <p className="text-white/70 mb-4">Course registration data available</p>
            <button
              onClick={() => router.push('/courses')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
            >
              View Course Details
            </button>
          </div>
        </div>

        {/* Permissions & Roles */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 p-6 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">🔐</span> Permissions & Roles
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/20">
              <span className="text-white font-medium">Student Access</span>
              <div className="px-3 py-1 bg-green-500/20 rounded-full border border-green-400/30">
                <span className="text-green-400 text-xs font-medium">Active</span>
              </div>
            </div>
            {user.isTutor && (
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/20">
                <span className="text-white font-medium">Tutor Permissions</span>
                <div className="px-3 py-1 bg-emerald-500/20 rounded-full border border-emerald-400/30">
                  <span className="text-emerald-400 text-xs font-medium">Active</span>
                </div>
              </div>
            )}
            {user.isAdmin && (
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/20">
                <span className="text-white font-medium">Admin Access</span>
                <div className="px-3 py-1 bg-amber-500/20 rounded-full border border-amber-400/30">
                  <span className="text-amber-400 text-xs font-medium">Active</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sign Out Section */}
        <div className="mt-8 pt-8 border-t border-white/30">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-white/60 text-sm">
              <p>© 2026 Freedom City Tech Center. All rights reserved.</p>
              <p className="mt-1">Excellence in Technology Education</p>
            </div>
            <button
              onClick={async () => {
                try {
                  await signout.mutateAsync();
                  router.push('/');
                } catch (error) {
                  // Handle error silently or show message
                  router.push('/');
                }
              }}
              disabled={signout.isPending}
              className="bg-gradient-to-r from-red-600 to-rose-600 text-white font-medium py-3 px-6 rounded-lg hover:from-red-700 hover:to-rose-700 transition-all duration-200 transform hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-xl">🚪</span>
              {signout.isPending ? 'Signing Out...' : 'Sign Out'}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => router.push('/courses')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
          >
            Manage Courses
          </button>
          <button
            onClick={() => router.push('/form')}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
          >
            Register for Cleaning
          </button>
        </div>
      </main>
    </BackgroundImage>
  );
}
