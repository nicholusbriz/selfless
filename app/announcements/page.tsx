'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Announcements from '@/components/Announcements';
import { checkUserAccess, User } from '@/lib/auth';
import { PageLoader, DashboardButton } from '@/components/ui';

export default function AnnouncementsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const router = useRouter();

  // Check if user has valid authentication from JWT token
  useEffect(() => {
    const authenticateUser = async () => {
      try {
        const authResult = await checkUserAccess();

        if (!authResult.success || !authResult.user) {
          // Invalid authentication, redirect to home
          router.push('/');
          return;
        }

        // Check if user is admin or tutor with announcement permissions
        const isAdmin = authResult.user.isSuperAdmin;
        const isTutor = authResult.user.isTutor;
        const canViewAnnouncements = isTutor && authResult.user.tutorPermissions?.canViewAnnouncements;

        if (!isAdmin && !canViewAnnouncements) {
          // User doesn't have permission to view announcements
          router.push('/dashboard');
          return;
        }

        setUser(authResult.user);
      } catch (error) {

        router.push('/');
      } finally {
        setCheckingStatus(false);
      }
    };

    authenticateUser();
  }, [router]);

  if (!user || checkingStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <PageLoader text="Loading announcements..." color="white" />
      </div>
    );
  }

  const isAdmin = user.isSuperAdmin;
  const isTutor = user.isTutor;
  const canPostAnnouncements = isTutor && user.tutorPermissions?.canPostAnnouncements;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Modern Background Effects */}
      <div className="absolute inset-0">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse animation-delay-4000"></div>
        {/* Grid pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 min-h-screen flex flex-col">
        {/* Modern Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Image
                  src="/freedom.png"
                  alt="Freedom City Tech Center"
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Announcements</h1>
                <p className="text-sm text-violet-200">Freedom City Tech Center</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Permissions indicator */}
              <div className="flex gap-2">
                {isAdmin && (
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-sm border border-purple-500/30">
                    👑 Administrator
                  </span>
                )}
                {isTutor && (
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg text-sm border border-emerald-500/30">
                    👨‍🏫 Tutor
                  </span>
                )}
                {canPostAnnouncements && (
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm border border-blue-500/30">
                    ✍️ Can Post
                  </span>
                )}
              </div>
              <DashboardButton text="Back to Dashboard" variant="outline" fullWidth={false} icon="🔙" />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-4xl">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl p-8">
              {/* Hero Section */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 rounded-full mb-6 shadow-2xl shadow-violet-500/50 p-2">
                  <Image
                    src="/freedom.png"
                    alt="Freedom City Tech Center Logo"
                    width={80}
                    height={80}
                    className="w-full h-full object-contain"
                  />
                </div>

                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-300 via-white to-purple-300 bg-clip-text text-transparent mb-4">
                  ANNOUNCEMENTS
                </h1>

                <div className="inline-flex items-center justify-center bg-gradient-to-r from-violet-500/30 via-purple-500/20 to-indigo-500/30 backdrop-blur-md px-6 py-3 rounded-full border border-violet-400/40 mb-6">
                  <span className="text-violet-100 font-bold text-lg">
                    📢 Freedom City Tech Center Communications
                  </span>
                </div>
              </div>

              {/* Announcements Component */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <Announcements
                  showAnnouncementsList={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
