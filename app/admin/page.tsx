'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { isAdminEmail } from '@/config/admin';
import AdminDashboard from '@/components/AdminDashboard';
import LoadingSpinner from '@/components/LoadingSpinner';

// Types
interface Course {
  id: string;
  name: string;
  credits: number;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
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
  console.log('Admin component: Starting render');

  const [currentUser, setCurrentUser] = useState<{ adminId: string; adminEmail: string; adminName: string; isSuperAdmin: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [showDashboard, setShowDashboard] = useState<'overview' | 'users' | 'courses' | 'registered-days' | 'announcements' | 'tutors' | 'admins' | undefined>(undefined);
  const [weeks, setWeeks] = useState<{ [key: number]: WeekData[] }>({});
  const [users, setUsers] = useState<User[]>([]);
  const [courseRegistrations, setCourseRegistrations] = useState<CourseRegistration[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [copyFeedback, setCopyFeedback] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [editingPhone, setEditingPhone] = useState<string | null>(null);
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneUpdateLoading, setPhoneUpdateLoading] = useState(false);
  const [clearingCourse, setClearingCourse] = useState<string | null>(null);

  // Dashboard statistics
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    registeredForDays: 0,
    remainingDays: 25, // 75 total - 50 capacity = 25 remaining
    totalCapacity: 75,
    usedCapacity: 50,
    courseSubmissions: 0
  });

  const router = useRouter();

  // Auto-navigate to management containers when users/courses/registered-days/announcements/tutors/admins sections are selected
  useEffect(() => {
    if (activeSection === 'users' || activeSection === 'courses' || activeSection === 'registered-days' || activeSection === 'announcements' || activeSection === 'tutors' || activeSection === 'admins') {
      setShowDashboard(activeSection as 'users' | 'courses' | 'registered-days' | 'announcements' | 'tutors' | 'admins');
    } else {
      setShowDashboard(undefined);
    }
  }, [activeSection]);

  // Refresh dashboard statistics function
  const refreshDashboardStats = useCallback(async () => {
    try {
      // Fetch users
      const usersResponse = await fetch('/api/users');
      const usersData = await usersResponse.json();

      // Fetch cleaning days data
      const cleaningResponse = await fetch('/api/cleaning-days');
      const cleaningData = await cleaningResponse.json();

      // Fetch course registrations
      const coursesResponse = await fetch('/api/all-course-registrations');
      const coursesData = await coursesResponse.json();

      let totalUsers = 0;
      let registeredForDays = 0;
      let remainingDays = 0;
      let courseSubmissions = 0;

      // Count total users
      if (usersData.success) {
        totalUsers = usersData.users?.length || 0;
      }

      // Count users registered for days and calculate remaining days based on capacity
      if (cleaningData.success && cleaningData.weeks) {
        const allRegisteredUsers = new Set();
        let totalRegistrations = 0;

        // cleaningData.weeks is an object where each key is a week number and value is an array of days
        (Object.values(cleaningData.weeks) as WeekData[][]).forEach((weekDays: WeekData[]) => {
          weekDays.forEach((day: WeekData) => {
            if (day.registeredUsers && day.registeredUsers.length > 0) {
              day.registeredUsers.forEach((user: { id: string }) => {
                allRegisteredUsers.add(user.id);
                totalRegistrations++;
              });
            }
          });
        });

        registeredForDays = allRegisteredUsers.size;

        // Calculate remaining days based on capacity (75 total - used registrations)
        const totalCapacity = 75;
        const usedCapacity = totalRegistrations;
        remainingDays = totalCapacity - usedCapacity;

        // Update the stats with correct capacity values
        setDashboardStats(prev => ({
          ...prev,
          totalCapacity,
          usedCapacity
        }));
      }

      // Count course submissions
      if (coursesData.success) {
        courseSubmissions = coursesData.registrations?.length || 0;
      }

      setDashboardStats(prev => ({
        ...prev,
        totalUsers,
        registeredForDays,
        remainingDays,
        courseSubmissions
      }));

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  }, []);

  // Fetch dashboard statistics on mount
  useEffect(() => {
    refreshDashboardStats();
  }, [refreshDashboardStats]);

  // Check if user is admin (JWT-based authentication)
  useEffect(() => {
    const checkAdminAuth = async () => {
      console.log('Admin useEffect: Starting JWT authentication check');

      if (typeof window !== 'undefined') {
        try {
          // Verify user status via JWT token
          const response = await fetch('/api/user-status', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            console.log('Admin Auth: Invalid token, redirecting to home');
            router.push('/');
            return;
          }

          const data = await response.json();
          console.log('Admin Auth: User data from JWT', data);

          if (!data.success || !data.user) {
            console.log('Admin Auth: No user data, redirecting to home');
            router.push('/');
            return;
          }

          // Admin check - user must be admin (either super admin or promoted admin)
          if (!data.user.isAdmin) {
            console.log('Admin Auth: Not admin, redirecting to dashboard');
            router.push('/dashboard');
            return;
          }

          console.log('Admin Auth: Authentication successful');
        } catch (error) {
          console.log('Admin Auth: Error, redirecting to home');
          router.push('/');
          return;
        }

        console.log('Admin Auth: User verified and set');
      }
    };

    checkAdminAuth();
  }, [router]);

  // Set current user after JWT authentication
  useEffect(() => {
    const setAdminUser = async () => {
      try {
        const response = await fetch('/api/user-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user && data.user.isAdmin) {
            setCurrentUser({
              adminId: data.user.id,
              adminEmail: data.user.email,
              adminName: data.user.fullName || `${data.user.firstName} ${data.user.lastName}`.trim() || 'Admin',
              isSuperAdmin: data.user.isSuperAdmin || false
            });
          }
        }
      } catch (error) {
        console.error('Error setting admin user:', error);
      }
    };

    setAdminUser();
  }, []);

  console.log('Admin Page: Render state', { isLoading, currentUser });

  // Show loading if still loading or if no current user yet
  if (isLoading || !currentUser) {
    console.log('Admin Page: Showing loading', { isLoading, hasCurrentUser: !!currentUser });
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">
          {!currentUser ? "Authenticating..." : "Loading..."}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
      <div className="relative z-10 backdrop-blur-sm bg-white/10 h-full flex flex-col">
        <div className="container mx-auto px-4 py-8 overflow-y-auto flex-1">
          {/* Enhanced Header */}
          <div className="text-center mb-8 animate-fade-in-down">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-full mb-4 animate-bounce-in shadow-lg shadow-purple-500/50 p-2">
              <Image
                src="/freedom.png"
                alt="Freedom City Tech Center Logo"
                width={80}
                height={80}
                className="w-full h-full object-contain animate-glow"
              />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-3 animate-shimmer">
              FreedomCity Tech Center Admin Management Dashboard
            </h1>
            <p className="text-purple-200 text-xl font-medium mb-2 animate-slide-in-left">
              Freedom City Tech Center
            </p>
            <p className="text-gray-300 text-lg mb-6 animate-slide-in-right">
              Manage student registrations from the forms
            </p>
            <div className="flex items-center justify-center gap-4 text-white/80 text-sm animate-fade-in-up">
              <div className="glass-morphism px-4 py-2 rounded-full border border-purple-500/30 hover-lift">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  Last updated: {lastUpdated?.toLocaleTimeString()}
                </span>
              </div>
              <button
                onClick={() => {/* Refresh functionality */ }}
                className="glass-morphism hover:glass-card px-6 py-2 rounded-full border border-purple-400/50 transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 animate-float"
              >
                <span className="flex items-center gap-2">
                  <span className="animate-spin-slow">🔄</span>
                  Refresh Data
                </span>
              </button>
            </div>
          </div>

          {/* Policies-Style Navigation */}
          <div className="flex flex-col lg:flex-row gap-6 animate-fade-in-up">
            {/* Desktop Navigation */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Sections</h2>
                <nav className="space-y-2">
                  {navigationItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${activeSection === item.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium">{item.title}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
              <div className="grid grid-cols-3 gap-2">
                {navigationItems.slice(0, 9).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`p-3 rounded-lg transition-all duration-200 flex flex-col items-center space-y-1 ${activeSection === item.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-xs font-medium text-center">{item.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 lg:p-8">
                <div className="mb-6">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
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
                  <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-20"></div>
                </div>

                <div className="prose prose-lg max-w-none">
                  {renderAdminContent(activeSection, adminContent[activeSection as keyof typeof adminContent] || {}, setShowDashboard, dashboardStats)}
                </div>
              </div>
            </div>
          </div>

          {/* Show AdminDashboard if a section is selected */}
          {showDashboard && currentUser && (
            <div className="mb-8 animate-fade-in-up">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white text-center">
                  {showDashboard === 'users' ? 'User Management' :
                    showDashboard === 'courses' ? 'Course Management' :
                      showDashboard === 'registered-days' ? 'Registered Days' :
                        showDashboard === 'announcements' ? 'Announcements Management' :
                          showDashboard === 'tutors' ? 'Tutor Management' :
                            showDashboard === 'admins' ? 'Admin Management' :
                              showDashboard === 'overview' ? 'Dashboard Overview' : 'Dashboard'}
                </h2>
              </div>
              <div className="glass-morphism rounded-2xl border border-purple-500/30 p-6">
                <AdminDashboard
                  adminId={currentUser.adminId}
                  adminEmail={currentUser.adminEmail}
                  adminName={currentUser.adminName}
                  isSuperAdmin={currentUser.isSuperAdmin}
                  initialSection={showDashboard}
                  onStatsRefresh={refreshDashboardStats}
                />
              </div>
            </div>
          )}

          {/* Go to Dashboard Button */}
          <div className="mb-8 text-center">
            <button
              onClick={() => {
                router.push('/dashboard');
              }}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-amber-500/25 flex items-center justify-center gap-3"
            >
              <span className="text-xl">🏠</span>
              <span className="text-lg">Go back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;

// Render admin content (policies-style)
const renderAdminContent = (sectionKey: string, section: { title: string; description: string }, setShowDashboard: (section: 'overview' | 'users' | 'courses' | undefined) => void, dashboardStats: { totalUsers: number; registeredForDays: number; remainingDays: number; totalCapacity: number; usedCapacity: number; courseSubmissions: number }) => {
  if (sectionKey === 'overview') {
    // Create dynamic stats based on real data
    const dynamicStats = [
      { icon: '👥', value: dashboardStats.totalUsers.toString(), label: 'Total Users Registered' },
      { icon: '📅', value: dashboardStats.registeredForDays.toString(), label: 'Students Registered for Days' },
      { icon: '📊', value: dashboardStats.remainingDays.toString(), label: 'Remaining Days Available' },
      { icon: '📚', value: dashboardStats.courseSubmissions.toString(), label: 'Credits' }
    ];

    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-xl font-semibold text-blue-900 mb-4">Dashboard Overview</h3>
          <p className="text-gray-700 leading-relaxed">{section.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {dynamicStats.map((stat: { icon: string; value: string; label: string }, index: number) => (
              <div key={index} className="text-center p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
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











