'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { checkUserAccess, User } from '@/lib/auth';
import AdminDashboard from '@/components/AdminDashboard';
import { PageLoader, BackgroundImage, DashboardButton } from '@/components/ui';

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
          const authResult = await checkUserAccess();
          console.log('Admin Auth: User data from JWT', authResult);

          if (!authResult.success || !authResult.user) {
            console.log('Admin Auth: No user data, redirecting to home');
            router.push('/');
            return;
          }

          // Admin check - user must be admin (either super admin or promoted admin)
          if (!authResult.user.isAdmin) {
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
        const authResult = await checkUserAccess();

        if (authResult.success && authResult.user && authResult.user.isAdmin) {
          setCurrentUser({
            adminId: authResult.user.id,
            adminEmail: authResult.user.email,
            adminName: authResult.user.fullName || `${authResult.user.firstName} ${authResult.user.lastName}`.trim() || 'Admin',
            isSuperAdmin: authResult.user.isSuperAdmin || false
          });
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
      <PageLoader text={!currentUser ? "Authenticating..." : "Loading..."} color="purple" />
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
                onClick={refreshDashboardStats}
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
                  {renderAdminContent(activeSection, adminContent[activeSection as keyof typeof adminContent] || {}, setShowDashboard, dashboardStats)}
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
                  onStatsRefresh={refreshDashboardStats}
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
      { icon: '👥', value: dashboardStats.totalUsers.toString(), label: 'Total Users Registered' },
      { icon: '📅', value: dashboardStats.registeredForDays.toString(), label: 'Students Registered for Days' },
      { icon: '📊', value: dashboardStats.remainingDays.toString(), label: 'Remaining Days Available' },
      { icon: '📚', value: dashboardStats.courseSubmissions.toString(), label: 'Credits' }
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











