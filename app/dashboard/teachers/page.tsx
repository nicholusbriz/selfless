'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import DashboardTabs from '@/components/shared/DashboardTabs';
import LoadingState, { StatsCardSkeleton, TabSkeleton } from '@/components/shared/LoadingState';
import ErrorState from '@/components/shared/ErrorState';
import TeacherStatsCards from '@/components/teacher/TeacherStatsCards';
import EnhancedTutorAssignments from '@/components/teacher/EnhancedTutorAssignments';
import TeacherCleaningManagement from '@/components/teacher/TeacherCleaningManagement';
import SharedGradesTab from '@/components/shared/SharedGradesTab';
import { Users, Award, TrendingUp, UserCheck, Sparkles } from 'lucide-react';
import { useSharedGradesStudents, useSharedAssignGrade } from '@/hooks/queries/shared-grades';
import { useTeacherAssignments, useAllTeachers } from '@/hooks/queries/teacher-assignments';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';

type Tab = 'overview' | 'students' | 'assignments' | 'cleaning';

const TABS = [
  { id: 'overview', label: 'Overview', icon: TrendingUp },
  { id: 'students', label: 'Grades', icon: Award },
  { id: 'assignments', label: 'My Students', icon: UserCheck },
  { id: 'cleaning', label: 'Cleaning', icon: Sparkles },
];

export default function TeachersPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [tabsContainer, setTabsContainer] = useState<HTMLElement | null>(null);

  // Move tabs to fixed header
  useEffect(() => {
    const container = document.getElementById('dashboard-tabs-container');
    if (container) {
      setTabsContainer(container);
    }
  }, []);

  const { data: assignmentsData, isLoading: assignmentsLoading, refetch: refetchAssignments } = useTeacherAssignments(undefined, undefined, true);
  const { data: teachersData } = useAllTeachers();

  const isLoading = assignmentsLoading;

  // Calculate stats from assignments
  const assignments = assignmentsData?.assignments || [];
  const assignedStudents = assignments.length;
  const verifiedStudents = assignments.filter((a: any) => a.status === 'verified').length;
  const notVerifiedStudents = assignments.filter((a: any) => a.status === 'not_verified').length;

  // Loading state with skeletons
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <StatsCardSkeleton key={i} />)}
            </div>
            <div className="bg-white/5 rounded-xl p-6">
              <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded h-6 w-48 mb-4"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded h-24"></div>
                <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded h-24"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Teacher Dashboard</h1>
              <p className="text-gray-400 text-sm sm:text-base">Welcome back, {user?.firstName}! Manage your students and grades.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <TeacherStatsCards
                totalStudents={0}
                totalCourses={0}
                pendingGrades={0}
                assignedStudents={assignedStudents}
                verifiedStudents={verifiedStudents}
                notVerifiedStudents={notVerifiedStudents}
              />
            </motion.div>

            <motion.div
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.button
                  onClick={() => setActiveTab('students')}
                  className="flex items-center gap-3 p-4 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 rounded-lg transition-colors"
                  whileHover={{ scale: 1.05, x: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Award className="w-5 h-5 text-violet-400" />
                  <span className="text-white font-medium">Assign Grades</span>
                </motion.button>
                <motion.button
                  onClick={() => setActiveTab('assignments')}
                  className="flex items-center gap-3 p-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition-colors"
                  whileHover={{ scale: 1.05, x: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <UserCheck className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-medium">View Assigned Students</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'students' && (
          <SharedGradesTab
            title="Manage Grades"
            description="Assign and manage grades for your students"
          />
        )}

        {activeTab === 'assignments' && (
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
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Tutor Assignments</h1>
              <p className="text-gray-400 text-sm sm:text-base">View all tutors and their assigned students</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <EnhancedTutorAssignments
                assignments={assignmentsData?.assignments || []}
                teachers={teachersData?.teachers || []}
                currentUserId={user?.id || ''}
                currentUserRole={user?.role?.name || ''}
              />
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'cleaning' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <TeacherCleaningManagement />
          </motion.div>
        )}
      </motion.div>
    </>
  );
}