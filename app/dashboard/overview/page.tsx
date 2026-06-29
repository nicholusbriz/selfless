'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import DashboardTabs from '@/components/shared/DashboardTabs';
import LoadingState, { TabSkeleton } from '@/components/shared/LoadingState';
import ErrorState from '@/components/shared/ErrorState';
import StudentDirectory from '@/components/overview/StudentDirectory';
import CleaningTab from '@/components/overview/CleaningTab';
import PoliciesTab from '@/components/overview/PoliciesTab';
import MessagingTab from '@/components/overview/MessagingTab';
import AnnouncementsTab from '@/components/overview/AnnouncementsTab';
import OverviewStatsCards from '@/components/overview/OverviewStatsCards';
import WelcomeBanner from '@/components/overview/WelcomeBanner';
import TutorSchedule from '@/components/overview/TutorSchedule';
import EnhancedStatistics from '@/components/overview/EnhancedStatistics';
import EnhancedTutorAssignments from '@/components/teacher/EnhancedTutorAssignments';
import RoleBasedQuickLinks from '@/components/overview/RoleBasedQuickLinks';
import { Users, BookOpen, Award, GraduationCap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import axios from '@/lib/axios';
import { createPortal } from 'react-dom';
import { useTeacherAssignments, useAllTeachers } from '@/hooks/queries/teacher-assignments';

type Tab = 'overview' | 'students' | 'cleaning' | 'messages' | 'policies' | 'announcements';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'students', label: 'Students & Courses' },
  { id: 'cleaning', label: 'Cleaning' },
  { id: 'messages', label: 'Messages' },
  { id: 'announcements', label: 'Announcements' },
  { id: 'policies', label: 'Policies' },
];

export default function OverviewPage() {
  const { user, fetchUser } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [tabsContainer, setTabsContainer] = useState<HTMLElement | null>(null);

  // Fetch fresh user data on mount to ensure profileImageUrl is current
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Set active tab from URL parameter on mount and URL changes
  useEffect(() => {
    const tabParam = searchParams.get('tab') as Tab;
    if (tabParam && TABS.some(tab => tab.id === tabParam)) {
      setActiveTab(tabParam);
    } else if (!tabParam) {
      setActiveTab('overview');
    }
  }, [searchParams]);

  // Handle tab change with URL update
  const handleTabChange = (tabId: string) => {
    const tab = tabId as Tab;
    setActiveTab(tab);
    const url = tab === 'overview' 
      ? '/dashboard/overview' 
      : `/dashboard/overview?tab=${tab}`;
    router.push(url);
  };

  // Move tabs to fixed header
  useEffect(() => {
    const container = document.getElementById('dashboard-tabs-container');
    if (container) {
      setTabsContainer(container);
    }
  }, []);

  // Fetch overview data using TanStack Query and axios
  const { data: overviewData, isLoading, error, refetch } = useQuery({
    queryKey: ['overview'],
    queryFn: async () => {
      const response = await axios.get('/api/overview');
      return response.data;
    },
    staleTime: 30 * 1000,
    // Removed refetchInterval - using WebSocket for real-time updates
    enabled: !!user,
  });

  // Fetch assignments and teachers data for EnhancedTutorAssignments
  const { data: assignmentsData } = useTeacherAssignments(undefined, undefined, true);
  const { data: teachersData } = useAllTeachers();

  // Extract students and statistics from the single data source
  const students = overviewData?.students || [];
  const statistics = overviewData?.statistics;
  
  // Calculate statistics from REAL data
  const totalStudents = students.length;
  const totalCourses = students.reduce((sum: number, student: any) => 
    sum + (student.enrolledCourses?.length || 0), 0
  );
  const totalCredits = students.reduce((sum: number, student: any) => 
    sum + (student.totalCredits || 0), 0
  );
  
  // ✅ Count students who take religion based on takesReligion field
  const religionStudents = students.filter((student: any) => 
    student.takesReligion === true
  ).length;

  const stats = useMemo(() => [
    {
      id: 'students',
      icon: Users,
      title: 'Total Students',
      value: totalStudents,
      subtitle: 'Enrolled',
      iconColor: 'text-purple-400',
      gradient: 'from-purple-600/20 to-indigo-600/20',
      trend: { value: 12, isPositive: true, period: 'month' },
      progress: totalStudents,
      capacity: 100
    },
    {
      id: 'courses',
      icon: BookOpen,
      title: 'Total Courses',
      value: totalCourses,
      subtitle: 'Enrollments',
      iconColor: 'text-blue-400',
      gradient: 'from-blue-600/20 to-cyan-600/20',
      trend: { value: 8, isPositive: true, period: 'month' },
      progress: totalCourses,
      capacity: 50
    },
    {
      id: 'credits',
      icon: Award,
      title: 'Total Credits',
      value: totalCredits,
      subtitle: 'Accumulated',
      iconColor: 'text-green-400',
      gradient: 'from-green-600/20 to-emerald-600/20',
      trend: { value: 15, isPositive: true, period: 'month' }
    },
    {
      id: 'religion',
      icon: GraduationCap,
      title: 'Religion Students',
      value: religionStudents,
      subtitle: 'Taking religion',
      iconColor: 'text-orange-400',
      gradient: 'from-orange-600/20 to-amber-600/20',
      trend: { value: 5, isPositive: false, period: 'month' }
    }
  ], [totalStudents, totalCourses, totalCredits, religionStudents]);

  // Get role-specific welcome message
  const getWelcomeMessage = () => {
    const role = user?.role?.name || 'User';
    switch (role) {
      case 'ADMIN':
        return 'Admin Dashboard - System-wide overview and management';
      case 'TEACHER':
        return 'Teacher Dashboard - Your assigned students and performance metrics';
      case 'STUDENT':
        return 'Student Dashboard - Your academic progress and center information';
      default:
        return 'Welcome back! Here\'s an overview of the tech center';
    }
  };

  // Safe function to get user display name
  const getUserDisplayName = () => {
    if (user?.firstName) {
      return user.firstName;
    }
    if (user?.email && typeof user.email === 'string') {
      const emailParts = user.email.split('@');
      return emailParts[0] || 'User';
    }
    return 'User';
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-0">
        <TabSkeleton />
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6">
            <div className="mb-8">
              <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded h-10 w-64 mb-2"></div>
              <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded h-5 w-96"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white/5 rounded-xl p-6 animate-pulse h-32"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) return <ErrorState message="Failed to load data" onRetry={() => refetch()} />;

  return (
    <>
      {/* Render tabs in fixed header using portal */}
      {tabsContainer && createPortal(
        <DashboardTabs 
          tabs={TABS} 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
        />,
        tabsContainer
      )}

      <motion.div 
        className="flex flex-col min-h-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {activeTab === 'overview' && (
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Welcome Banner */}
            <WelcomeBanner
              userName={getUserDisplayName()}
              userRole={user?.role?.name || 'User'}
              lastUpdated={new Date()}
              onRefresh={() => refetch()}
              onExport={() => console.log('Export clicked')}
              onAnnouncementsClick={() => handleTabChange('announcements')}
            />

            {/* Section Header: Quick Overview */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex items-center justify-between"
            >
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                📊 Quick Overview
              </h2>
              <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                View All
              </button>
            </motion.div>

            {/* Stats Cards */}
            <OverviewStatsCards stats={stats} />

            {/* Responsive Layout */}
            <div className="grid grid-cols-1 gap-4">
              {/* Enhanced Statistics with Charts */}
              {statistics && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <EnhancedStatistics statistics={statistics} />
                </motion.div>
              )}

              {/* Tutor Assignments - Shows all tutors and their students */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
              >
                <EnhancedTutorAssignments
                  assignments={assignmentsData?.assignments || []}
                  teachers={teachersData?.teachers || []}
                  currentUserId={user?.id || ''}
                  currentUserRole={user?.role?.name || ''}
                />
              </motion.div>
            </div>

            {/* Tutor Schedule */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <TutorSchedule />
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'students' && (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Students Directory</h1>
              <p className="text-gray-400 text-sm sm:text-base">View all students, their assignments, and connect with them</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <StudentDirectory 
                students={students}
                currentUserId={user?.id}
              />
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'cleaning' && (
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Cleaning</h1>
              <p className="text-gray-400 text-sm sm:text-base">Manage cleaning schedules and assignments</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <CleaningTab />
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'messages' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <MessagingTab />
          </motion.div>
        )}

        {activeTab === 'announcements' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <AnnouncementsTab />
          </motion.div>
        )}

        {activeTab === 'policies' && (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <PoliciesTab />
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </>
  );
}