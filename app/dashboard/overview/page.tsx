'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import DashboardTabs from '@/components/shared/DashboardTabs';
import LoadingState, { TabSkeleton } from '@/components/shared/LoadingState';
import ErrorState from '@/components/shared/ErrorState';
import StudentCoursesTab from '@/components/overview/StudentCoursesTab';
import CleaningTab from '@/components/overview/CleaningTab';
import OverviewStatsCards from '@/components/overview/OverviewStatsCards';
import TutorSchedule from '@/components/overview/TutorSchedule';
import { Users, BookOpen, Award, GraduationCap, TrendingUp, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import axios from '@/lib/axios';
import { createPortal } from 'react-dom';

type Tab = 'overview' | 'students' | 'cleaning';

const TABS = [
  { id: 'overview', label: 'Overview', icon: TrendingUp },
  { id: 'students', label: 'Students & Courses', icon: Users },
  { id: 'cleaning', label: 'Cleaning', icon: Sparkles },
];

export default function OverviewPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [tabsContainer, setTabsContainer] = useState<HTMLElement | null>(null);

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
    refetchInterval: 60 * 1000,
    enabled: !!user,
  });

  // Extract students from the single data source
  const students = overviewData?.students || [];
  
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

  const stats = [
    {
      id: 'students',
      icon: Users,
      title: 'Total Students',
      value: totalStudents,
      subtitle: 'Enrolled',
      iconColor: 'text-purple-400',
      gradient: 'from-purple-600/20 to-indigo-600/20'
    },
    {
      id: 'courses',
      icon: BookOpen,
      title: 'Total Courses',
      value: totalCourses,
      subtitle: 'Enrollments',
      iconColor: 'text-blue-400',
      gradient: 'from-blue-600/20 to-cyan-600/20'
    },
    {
      id: 'credits',
      icon: Award,
      title: 'Total Credits',
      value: totalCredits,
      subtitle: 'Accumulated',
      iconColor: 'text-green-400',
      gradient: 'from-green-600/20 to-emerald-600/20'
    },
    {
      id: 'religion',
      icon: GraduationCap,
      title: 'Religion Students',
      value: religionStudents,
      subtitle: 'Taking religion',
      iconColor: 'text-orange-400',
      gradient: 'from-orange-600/20 to-amber-600/20'
    }
  ];

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
        <DashboardTabs tabs={TABS} activeTab={activeTab} onTabChange={(id) => setActiveTab(id as Tab)} />,
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
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Overview Dashboard</h1>
              <p className="text-gray-400 text-sm sm:text-base">Welcome back, {user?.firstName}! Here's an overview of all students and courses.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <OverviewStatsCards stats={stats} />
            </motion.div>

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
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Students & Courses</h1>
              <p className="text-gray-400 text-sm sm:text-base">View all students and their enrolled courses with search functionality</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <StudentCoursesTab 
                searchTerm={searchTerm} 
                onSearchChange={setSearchTerm}
                students={students}
              />
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'cleaning' && (
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
      </motion.div>
    </>
  );
}