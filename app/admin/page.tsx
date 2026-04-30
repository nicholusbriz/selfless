'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User } from '@/lib/auth';
import AdminDashboard from '@/components/AdminDashboard';
import { PageLoader, BackgroundImage, DashboardButton } from '@/components/ui';
import { useUsers, useCourseRegistrations, useCleaningDays, useDashboardStats, useRefetchControls } from '@/hooks/useApi';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';

// Types
interface Course {
  id: string;
  name: string;
  credits: number;
}

interface CourseRegistration {
  userId: string;
  courses: Course[];
  totalCredits: number;
  takesReligion: boolean;
  user?: User;
}

interface WeekData {
  id: string;
  formattedDate: string;
  registeredUsers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
  }>;
}

interface DBUser {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber?: string;
}

// Admin content configuration
const adminContent = {
  overview: {
    title: 'Dashboard Overview',
    description: 'Complete overview of system status, user statistics, and key metrics. Monitor all aspects of the Freedom City Tech Center management system.',
    stats: [
      { icon: '👥', value: '0', label: 'Total Users Registered' },
      { icon: '📅', value: '0', label: 'Students Registered for Days' },
      { icon: '📊', value: '0', label: 'Remaining Days Available' },
      { icon: '📚', value: '0', label: 'Credits' }
    ]
  }
};

// Navigation items
const navigationItems = [
  { id: 'overview', title: 'Overview', icon: '📊' },
  { id: 'users', title: 'Users', icon: '👥' },
  { id: 'courses', title: 'Courses', icon: '📚' },
  { id: 'registered-days', title: 'Registered Days', icon: '📅' },
  { id: 'announcements', title: 'Announcements', icon: '📢' },
  { id: 'tutors', title: 'Tutors', icon: '👨‍🏫' },
  { id: 'admins', title: 'Admins', icon: '👑' }
];

function Admin() {
  // Authentication hook - handles JWT validation and user state
  const { user, isLoading: authLoading } = useAuth('/dashboard');

  // Admin authentication hook - checks both super admin and promoted admins
  const { adminUser, isLoading: adminLoading, isAdmin, isSuperAdmin } = useAdminAuth(user);

  const [currentUser, setCurrentUser] = useState<{ adminId: string; adminEmail: string; adminName: string; isSuperAdmin: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [showDashboard, setShowDashboard] = useState<'overview' | 'users' | 'courses' | 'registered-days' | 'announcements' | 'tutors' | 'admins' | undefined>(undefined);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [copyFeedback, setCopyFeedback] = useState('');
  const [editingPhone, setEditingPhone] = useState<string | null>(null);
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneUpdateLoading, setPhoneUpdateLoading] = useState(false);
  const [clearingCourse, setClearingCourse] = useState<string | null>(null);

  // React Query hooks for data fetching
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: courseRegistrations = [], isLoading: coursesLoading } = useCourseRegistrations();
  const { data: cleaningDays = [], isLoading: daysLoading } = useCleaningDays();
  const dashboardStats = useDashboardStats();
  const statsLoading = usersLoading || coursesLoading || daysLoading;

  // Refetch controls
  const { refetchAll } = useRefetchControls();

  const router = useRouter();

  // Auto-navigate to management containers when users/courses/registered-days/announcements/tutors/admins sections are selected
  useEffect(() => {
    if (activeSection === 'users' || activeSection === 'courses' || activeSection === 'registered-days' || activeSection === 'announcements' || activeSection === 'tutors' || activeSection === 'admins') {
      setShowDashboard(activeSection as 'users' | 'courses' | 'registered-days' | 'announcements' | 'tutors' | 'admins');
    } else {
      setShowDashboard(undefined);
    }
  }, [activeSection]);

  // React Query handles dashboard statistics automatically

  // Admin validation - check if authenticated user is admin (super admin or promoted)
  useEffect(() => {
    if (user && !adminLoading) {
      if (!isAdmin) {
        router.push('/dashboard');
        return;
      }

      if (adminUser) {
        // Set current admin user
        setCurrentUser({
          adminId: adminUser.id,
          adminEmail: adminUser.email,
          adminName: adminUser.fullName || `${adminUser.firstName || ''} ${adminUser.lastName || ''}`.trim(),
          isSuperAdmin: isSuperAdmin
        });
      }
    }
  }, [user, adminUser, adminLoading, isAdmin, isSuperAdmin, router]);

  // Show loading if still loading or if no current user yet
  if (authLoading || adminLoading || !currentUser) {
    return (
      <PageLoader text={authLoading ? "Authenticating..." : adminLoading ? "Checking admin access..." : "Loading..."} color="purple" />
    );
  }

  return (
    <BackgroundImage className="h-screen">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
      <div className="relative z-10 container mx-auto px-4 py-8 h-full flex flex-col">
        <div className="overflow-y-auto flex-1">
          {/* Enhanced Header */}
          <div className="text-center mb-16 animate-fade-in-down">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-600 rounded-full mb-8 shadow-2xl shadow-purple-500/30 p-3 animate-bounce-in">
              <Image
                src="/freedom.png"
                alt="Freedom City Tech Center Logo"
                width={96}
                height={96}
                className="w-full h-full object-contain animate-glow"
              />
            </div>
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold bg-gradient-to-r from-purple-100 via-indigo-100 to-pink-100 bg-clip-text text-transparent mb-6 animate-slide-in-right leading-relaxed drop-shadow-2xl">
                FreedomCity Tech Center Admin Management Dashboard
              </h1>
            </div>
            <div className="max-w-2xl mx-auto">
              <p className="text-purple-100 text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium mb-4 animate-slide-in-left drop-shadow-lg">
                Freedom City Tech Center
              </p>
              <p className="text-gray-300 text-base sm:text-lg md:text-xl lg:text-2xl animate-slide-in-up drop-shadow-md">
                Manage student registrations from the forms
              </p>
            </div>
            <div className="flex items-center justify-center gap-4 text-white/80 text-sm animate-fade-in-up mt-8">
              <div className="glass-morphism px-6 py-3 rounded-full border border-purple-500/30 hover-lift">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                  Last updated: {lastUpdated?.toLocaleTimeString()}
                </span>
              </div>
              <button
                onClick={refetchAll}
                className="glass-morphism hover:glass-card px-8 py-3 rounded-full border border-purple-400/50 transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 animate-float"
              >
                <span className="flex items-center gap-2">
                  <span className="animate-spin-slow">🔄</span>
                  Refresh Data
                </span>
              </button>
            </div>
          </div>

          {/* Navigation and Content Container */}
          <div className="flex flex-col lg:flex-row gap-8 animate-fade-in-up">
            {/* Desktop Navigation */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="bg-black/30 rounded-2xl p-8 border border-white/20 sticky top-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-100 to-indigo-100 bg-clip-text text-transparent mb-6 text-center drop-shadow-lg">Admin Sections</h2>
                <nav className="space-y-3">
                  {navigationItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full text-left px-6 py-4 rounded-2xl transition-all duration-300 flex items-center space-x-4 transform hover:scale-105 ${activeSection === item.id
                        ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border-2 border-purple-400/50 shadow-xl shadow-purple-500/40 text-white'
                        : 'bg-white/10 border-2 border-white/30 text-gray-200 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-indigo-500/20 hover:border-purple-400/40'
                        }`}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <span className="font-semibold text-lg">{item.title}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="lg:hidden bg-black/30 rounded-2xl p-4 border border-white/20 sticky top-4 z-40">
              <div className="grid grid-cols-3 gap-3">
                {navigationItems.slice(0, 9).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`p-4 rounded-2xl transition-all duration-300 flex flex-col items-center space-y-2 transform hover:scale-105 ${activeSection === item.id
                      ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border-2 border-purple-400/50 shadow-xl shadow-purple-500/40 text-white'
                      : 'bg-white/10 border-2 border-white/30 text-gray-200 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-indigo-500/20 hover:border-purple-400/40'
                      }`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-xs font-semibold text-center">{item.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="bg-black/30 rounded-2xl p-8 lg:p-12 border border-white/20">
                <div className="mb-8">
                  <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-purple-100 to-indigo-100 bg-clip-text text-transparent mb-4 animate-slide-in-right drop-shadow-2xl">
                    {adminContent[activeSection as keyof typeof adminContent]?.title ||
                      activeSection === 'users' ? 'User Management' :
                      activeSection === 'courses' ? 'Course Management' :
                        activeSection === 'registered-days' ? 'Registered Days' :
                          activeSection === 'announcements' ? 'Announcements Management' :
                            activeSection === 'tutors' ? 'Tutor Management' :
                              activeSection === 'admins' ? 'Admin Management' :
                                'Dashboard'
                    }
                  </h1>
                  <div className="h-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 rounded-full w-32 animate-slide-in-left shadow-lg shadow-purple-500/50"></div>
                </div>

                <div className="prose prose-lg max-w-none">
                  {renderAdminContent(activeSection, adminContent[activeSection as keyof typeof adminContent] || {}, setShowDashboard, dashboardStats || {
                    totalUsers: 0,
                    registeredForDays: 0,
                    remainingDays: 0,
                    totalCapacity: 0,
                    usedCapacity: 0,
                    courseSubmissions: 0
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Show AdminDashboard if a section is selected */}
          {showDashboard && currentUser && (
            <div className="mb-12 animate-fade-in-up">
              <div className="mb-8">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-100 to-indigo-100 bg-clip-text text-transparent text-center mb-4 animate-slide-in-right drop-shadow-2xl">
                  {showDashboard === 'users' ? 'User Management' :
                    showDashboard === 'courses' ? 'Course Management' :
                      showDashboard === 'registered-days' ? 'Registered Days' :
                        showDashboard === 'announcements' ? 'Announcements Management' :
                          showDashboard === 'tutors' ? 'Tutor Management' :
                            showDashboard === 'admins' ? 'Admin Management' :
                              showDashboard === 'overview' ? 'Dashboard Overview' : 'Dashboard'}
                </h2>
                <div className="h-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 rounded-full w-48 mx-auto animate-slide-in-left shadow-lg shadow-purple-500/50"></div>
              </div>
              <div className="bg-black/30 rounded-2xl border border-white/20 p-8">
                <AdminDashboard
                  adminId={currentUser.adminId}
                  adminEmail={currentUser.adminEmail}
                  adminName={currentUser.adminName}
                  isSuperAdmin={currentUser.isSuperAdmin}
                  initialSection={showDashboard}
                  onStatsRefresh={refetchAll}
                />
              </div>
            </div>
          )}

          {/* Go to Dashboard Button */}
          <div className="mb-12 text-center animate-fade-in-up">
            <DashboardButton text="Go back to Dashboard" />
          </div>
        </div>
      </div>
    </BackgroundImage>
  );
}

export default Admin;

// Render admin content (policies-style)
const renderAdminContent = (sectionKey: string, section: { title: string; description: string }, setShowDashboard: (section: 'overview' | 'users' | 'courses' | undefined) => void, dashboardStats: { totalUsers: number; registeredForDays: number; remainingDays: number; totalCapacity: number; usedCapacity: number; courseSubmissions: number }) => {
  if (sectionKey === 'overview') {
    // Create dynamic stats based on real data
    const dynamicStats = [
      { icon: '👥', value: (dashboardStats?.totalUsers || 0).toString(), label: 'Total Users Registered' },
      { icon: '📅', value: (dashboardStats?.registeredForDays || 0).toString(), label: 'Students Registered for Days' },
      { icon: '📊', value: (dashboardStats?.remainingDays || 0).toString(), label: 'Remaining Days Available' },
      { icon: '📚', value: (dashboardStats?.courseSubmissions || 0).toString(), label: 'Credits' }
    ];

    return (
      <div className="space-y-12">
        <div className="bg-black/30 rounded-2xl p-10 border border-white/20">
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-100 to-indigo-100 bg-clip-text text-transparent mb-6 animate-slide-in-right drop-shadow-2xl">Dashboard Overview</h3>
          <p className="text-gray-100 text-lg sm:text-xl md:text-2xl leading-relaxed mb-8 animate-slide-in-left drop-shadow-lg">{section.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {dynamicStats.map((stat: { icon: string; value: string; label: string }, index: number) => (
              <div key={index} className="bg-white/10 rounded-2xl p-8 border border-white/20 hover-lift transition-all duration-300 transform hover:scale-105 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="text-4xl sm:text-5xl mb-4 animate-bounce-in">{stat.icon}</div>
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-100 to-indigo-100 bg-clip-text text-transparent mb-2 animate-slide-in-right drop-shadow-lg">{stat.value}</div>
                <div className="text-gray-200 text-sm sm:text-base md:text-lg font-medium animate-slide-in-up drop-shadow-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // For all other sections, AdminDashboard handles the display
  return null;
};











