'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isAuthenticated } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // ✅ Clear session flags on logout
    sessionStorage.removeItem('pending_login');
    sessionStorage.removeItem('login_timestamp');
    logout();
    router.push('/');
  };

  // Navigation items based on user role
  const getNavItems = () => {
    const role = user?.role?.name;
    
    // Base items - shown to ALL authenticated users
    const baseItems = [
      { 
        id: 'overview', 
        label: 'Overview', 
        path: '/dashboard/overview',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        )
      },
      { 
        id: 'profile', 
        label: 'Profile', 
        path: '/dashboard/profile',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )
      },
      { 
        id: 'settings', 
        label: 'Settings', 
        path: '/dashboard/settings',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )
      },
    ];

    // Student Dashboard - shown to ALL authenticated users
    const studentDashboardItem = {
      id: 'student-dashboard',
      label: 'Student Dashboard',
      path: '/dashboard/student',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    };

    // Role-specific items
    const roleSpecificItems = [];

    // Admin Panel - only for admin role
    if (role === 'admin') {
      roleSpecificItems.push({
        id: 'admin',
        label: 'Admin Panel',
        path: '/dashboard/admin',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        )
      });
    }

    // Teacher Dashboard - for teacher or admin role
    if (role === 'teacher' || role === 'admin') {
      roleSpecificItems.push({
        id: 'teacher-dashboard',
        label: 'Teacher Dashboard',
        path: '/dashboard/teachers',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        )
      });
    }

    // Combine all items: base + student dashboard + role-specific
    return [...baseItems, studentDashboardItem, ...roleSpecificItems];
  };

  const navItems = getNavItems();

  // Proxy handles authentication - if not authenticated, it will redirect
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop: Fixed, Mobile: Sliding */}
      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 w-64 bg-black/90 backdrop-blur-lg border-r border-white/10 transform transition-transform duration-300 ease-in-out flex-shrink-0 md:h-screen",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 flex-shrink-0">
            <Link href="/dashboard/overview" className="text-white font-bold text-lg sm:text-xl">
              Dashboard
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-2 rounded-lg text-gray-300 hover:bg-white/5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 sm:py-6 space-y-2 overflow-y-auto">
            <Link
              href="/"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                pathname === "/"
                  ? "bg-white/10 text-white"
                  : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg className="w-5 h-5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-sm sm:text-sm font-medium">Back to Home</span>
            </Link>
            
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  pathname === item.path
                    ? "bg-white/10 text-white"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.icon}
                <span className="text-sm sm:text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-white/10 flex-shrink-0">
            <div className="mb-4">
              <p className="text-white text-sm sm:text-sm font-medium">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-gray-400 text-xs sm:text-xs">{user?.email}</p>
              <p className="text-gray-500 text-xs sm:text-xs capitalize mt-1">Role: {user?.role?.name || 'N/A'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 sm:py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm sm:text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-black/80 backdrop-blur-lg flex-shrink-0">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg text-gray-300 hover:bg-white/5"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-white font-semibold text-lg">Dashboard</span>
          <div className="w-10" />
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}