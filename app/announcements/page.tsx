'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Announcements from '@/components/Announcements';
import { isAdminEmail } from '@/config/admin';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  fullName: string;
  isTutor?: boolean;
  tutorPermissions?: {
    canViewAnnouncements: boolean;
    canPostAnnouncements: boolean;
    canManageUsers: boolean;
  };
}

export default function AnnouncementsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const router = useRouter();

  // Check if user has valid authentication from JWT token
  useEffect(() => {
    const checkUserAccess = async () => {
      try {
        // Verify user status via JWT token
        const response = await fetch('/api/user-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          // Invalid or missing token, redirect to home
          router.push('/');
          return;
        }

        const data = await response.json();

        if (!data.success || !data.user) {
          // User not found, redirect to home
          router.push('/');
          return;
        }

        // Check if user is admin or tutor with announcement permissions
        const isAdmin = isAdminEmail(data.user.email);
        const isTutor = data.user.isTutor;
        const canViewAnnouncements = isTutor && data.user.tutorPermissions?.canViewAnnouncements;

        if (!isAdmin && !canViewAnnouncements) {
          // User doesn't have permission to view announcements
          router.push('/dashboard');
          return;
        }

        setUser(data.user);
      } catch (error) {
        console.error(error);
        router.push('/');
      } finally {
        setCheckingStatus(false);
      }
    };

    checkUserAccess();
  }, [router]);

  if (!user || checkingStatus) {
    return (
      <>
        <div className="h-screen relative overflow-hidden">
          {/* Image Background */}
          <div className="absolute inset-0 w-full h-full">
            <Image
              src="/atbriz.jpg"
              alt="Background"
              fill
              className="object-cover"
              style={{
                filter: 'brightness(0.3) contrast(1.1) saturate(0.8) blur(0.8px)',
                objectFit: 'cover',
                objectPosition: 'center',
              }}
              priority
            />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-blue-800/10 to-purple-900/20"></div>
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 h-screen flex items-center justify-center">
            {/* Floating animated elements */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl"></div>
            <div className="absolute top-20 right-20 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-1/3 w-36 h-36 bg-indigo-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-1/4 w-28 h-28 bg-pink-400/20 rounded-full blur-3xl"></div>

            <div className="text-center relative z-10">
              {/* Loading animation */}
              <div className="mb-8">
                <div className="relative inline-flex items-center justify-center">
                  {/* Outer rotating ring */}
                  <div className="absolute inset-0 w-24 h-24 border-4 border-purple-500/30 rounded-full animate-spin"></div>

                  {/* Middle rotating ring */}
                  <div className="absolute inset-2 w-20 h-20 border-4 border-indigo-500/50 rounded-full animate-spin animation-reverse"></div>

                  {/* Inner ring */}
                  <div className="absolute inset-4 w-16 h-16 border-4 border-pink-500/70 rounded-full animate-spin animation-delay-1000"></div>

                  {/* Center logo */}
                  <div className="relative w-12 h-12 bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-600 rounded-full shadow-2xl shadow-purple-500/50 flex items-center justify-center animate-bounce-in">
                    <Image
                      src="/freedom.png"
                      alt="Freedom Logo"
                      width={32}
                      height={32}
                      className="w-8 h-8 object-contain animate-glow"
                    />
                  </div>
                </div>
              </div>

              {/* Loading text */}
              <div className="space-y-4">
                <div className="relative">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-indigo-300 to-pink-300 bg-clip-text text-transparent animate-gradient-shift">
                    Loading Announcements
                  </h1>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-300 via-indigo-300 to-pink-300 bg-clip-text text-transparent blur-xl animate-pulse"></div>
                </div>

                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce animation-delay-200"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce animation-delay-400"></div>
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce animation-delay-600"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce animation-delay-800"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce animation-delay-1000"></div>
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce animation-delay-1200"></div>
                </div>

                <p className="text-purple-200 text-lg font-medium animate-fade-in-up">
                  Preparing announcements for you...
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const isAdmin = isAdminEmail(user.email);
  const isTutor = user.isTutor;
  const canPostAnnouncements = isTutor && user.tutorPermissions?.canPostAnnouncements;

  return (
    <>
      <div className="h-screen relative overflow-hidden">
        {/* Image Background */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/atbriz.jpg"
            alt="Background"
            fill
            className="object-cover"
            style={{
              filter: 'brightness(0.3) contrast(1.1) saturate(0.8) blur(0.8px)',
              objectFit: 'cover',
              objectPosition: 'center',
            }}
            priority
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-blue-800/10 to-purple-900/20"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        </div>

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
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="inline-flex items-center text-purple-200 hover:text-white transition-colors mb-4"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Dashboard
                  </button>
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
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
