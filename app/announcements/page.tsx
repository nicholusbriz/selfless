'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Announcements from '@/components/Announcements';
import { checkUserAccess, User } from '@/lib/auth';
import { BackgroundImage, PageLoader, DashboardButton } from '@/components/ui';

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
      <PageLoader text="Loading announcements..." color="purple" />
    );
  }

  const isAdmin = user.isSuperAdmin;
  const isTutor = user.isTutor;
  const canPostAnnouncements = isTutor && user.tutorPermissions?.canPostAnnouncements;

  return (
    <BackgroundImage className="h-screen relative overflow-hidden">
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-blue-800/10 to-purple-900/20"></div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>

      {/* Content */}
      <div className="relative z-10 h-screen flex items-center justify-center">
        {/* Floating animated elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-20 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-1/3 w-36 h-36 bg-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-1/4 w-28 h-28 bg-pink-400/20 rounded-full blur-3xl"></div>

        <div className="w-full max-w-4xl relative z-10 overflow-y-auto max-h-full px-4 py-2">
          <div className="p-4">
            <div className="text-center mb-6">
              {/* Back to Dashboard Button */}
              <div className="mb-4">
                <DashboardButton text="Back to Dashboard" variant="outline" fullWidth={false} icon="🔙" />
              </div>

              {/* Logo */}
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-700 rounded-full mb-4 shadow-2xl shadow-cyan-500/50 p-2 mx-auto" style={{ boxShadow: '0 0 40px rgba(6, 182, 212, 0.5), 0 0 80px rgba(59, 130, 246, 0.3)' }}>
                <Image
                  src="/freedom.png"
                  alt="Freedom City Tech Center Logo"
                  width={80}
                  height={80}
                  className="w-full h-full object-contain"
                  style={{ filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.8))' }}
                />
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-cyan-300 via-white to-purple-300 bg-clip-text text-transparent mb-3" style={{
                textShadow: '0 0 30px rgba(255, 255, 255, 0.5), 0 0 60px rgba(6, 182, 212, 0.3)',
                letterSpacing: '0.02em'
              }}>
                ANNOUNCEMENTS
              </h1>

              {/* Subtitle */}
              <p className="text-base md:text-lg font-light text-cyan-200 mb-4 uppercase tracking-widest" style={{
                textShadow: '0 0 20px rgba(6, 182, 212, 0.8), 0 0 40px rgba(6, 182, 212, 0.4)',
                letterSpacing: '0.15em'
              }}>
                {isAdmin ? 'Administrator' : isTutor ? 'Tutor' : 'User'}
              </p>

              {/* Description */}
              <div className="inline-flex items-center justify-center bg-gradient-to-r from-cyan-500/30 via-blue-500/20 to-purple-500/30 backdrop-blur-md px-6 py-3 rounded-full border border-cyan-400/40 mb-4" style={{
                boxShadow: '0 0 30px rgba(6, 182, 212, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)'
              }}>
                <span className="text-cyan-100 font-bold text-lg tracking-wide" style={{ textShadow: '0 0 15px rgba(6, 182, 212, 0.8)' }}>
                  📢 Freedom City Tech Center Communications
                </span>
              </div>

              {/* Permissions indicator */}
              <div className="flex justify-center gap-2 text-sm">
                {isAdmin && (
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full border border-purple-200">
                    👑 Administrator
                  </span>
                )}
                {isTutor && (
                  <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
                    👨‍🏫 Tutor
                  </span>
                )}
                {canPostAnnouncements && (
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full border border-blue-200">
                    ✍️ Can Post
                  </span>
                )}
              </div>
            </div>

            {/* Announcements Component */}
            <div className="glass-morphism rounded-2xl border border-purple-500/30 p-6">
              <Announcements
                isAdmin={isAdmin}
                adminId={user.id}
                adminEmail={user.email}
                adminName={user.fullName}
                isTutor={isTutor}
                tutorId={user.id}
                tutorEmail={user.email}
                tutorName={user.fullName}
                canPostAnnouncements={canPostAnnouncements || false}
                showAnnouncementsList={false}
              />
            </div>
          </div>
        </div>
      </div>
    </BackgroundImage>
  );
}
