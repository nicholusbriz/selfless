'use client';

import { useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import DashboardTabs from '@/components/shared/DashboardTabs';
import LoadingState, { StatsCardSkeleton, StudentListItemSkeleton, TabSkeleton } from '@/components/shared/LoadingState';
import ErrorState from '@/components/shared/ErrorState';
import WeekSelector from '@/components/ui/WeekSelector';
import GradeFilterBar from '@/components/ui/GradeFilterBar';
import GradeAssignmentCard from '@/components/ui/GradeAssignmentCard';
import TeacherStatsCards from '@/components/teacher/TeacherStatsCards';
import TeacherAssignmentList from '@/components/teacher/TeacherAssignmentList';
import { Users, BookOpen, Award, TrendingUp, UserCheck } from 'lucide-react';
import { useTeacherStudents, useAssignGrade } from '@/hooks/queries/teacher';
import { useTeacherAssignments, useUpdateTeacherAssignmentStatus } from '@/hooks/queries/teacher-assignments';
import { motion } from 'framer-motion';

type Tab = 'overview' | 'students' | 'assignments';

const TABS = [
  { id: 'overview', label: 'Overview', icon: TrendingUp },
  { id: 'students', label: 'Students & Grades', icon: Users },
  { id: 'assignments', label: 'My Students', icon: UserCheck },
];

export default function TeachersPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [filters, setFilters] = useState<any>({});

  const { data: studentsData, isLoading: studentsLoading, error: studentsError, refetch } = useTeacherStudents();
  const assignGradeMutation = useAssignGrade();
  const { data: assignmentsData, isLoading: assignmentsLoading, refetch: refetchAssignments } = useTeacherAssignments();
  const updateAssignmentStatusMutation = useUpdateTeacherAssignmentStatus();

  const students = studentsData?.students || [];

  const filteredStudents = useMemo(() => {
    let filtered = [...students];
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter((s: any) =>
        s.name.toLowerCase().includes(search) || s.studentId.toLowerCase().includes(search)
      );
    }
    if (filters.status === 'graded') {
      filtered = filtered.filter((s: any) =>
        s.existingGrades.some((g: any) => g.week === selectedWeek)
      );
    } else if (filters.status === 'not-graded') {
      filtered = filtered.filter((s: any) =>
        !s.existingGrades.some((g: any) => g.week === selectedWeek)
      );
    }
    return filtered;
  }, [students, filters, selectedWeek]);

  const handleGradeAssign = async (studentId: string, courseId: string, gradeLetter: string) => {
    try {
      await assignGradeMutation.mutateAsync({ studentId, courseId, week: selectedWeek, gradeLetter });
      refetch();
    } catch (error) {
      console.error('Error assigning grade:', error);
    }
  };

  const handleFilterChange = (newFilters: any) => setFilters(newFilters);

  const handleUpdateAssignmentStatus = async (assignmentId: string, status: string) => {
    try {
      await updateAssignmentStatusMutation.mutateAsync({ id: assignmentId, data: { status } });
      refetchAssignments();
    } catch (error) {
      console.error('Error updating assignment status:', error);
    }
  };

  const totalStudents = students.length;
  const totalCourses = students.reduce((sum: number, s: any) => sum + s.enrolledCourses.length, 0);
  const pendingGrades = students.reduce((sum: number, s: any) => {
    return sum + s.enrolledCourses.filter((c: any) =>
      !s.existingGrades.some((g: any) => g.courseId === c.id && g.week === selectedWeek)
    ).length;
  }, 0);

  const isLoading = studentsLoading || assignmentsLoading;
  const error = studentsError;

  // Loading state with skeletons
  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <TabSkeleton />
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6">
            <div className="mb-8">
              <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded h-10 w-64 mb-2"></div>
              <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded h-5 w-96"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <StatsCardSkeleton key={i} />)}
            </div>
            <div className="bg-white/5 rounded-xl p-6">
              <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded h-6 w-48 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded h-24"></div>
                <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded h-24"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) return <ErrorState message="Failed to load data" onRetry={() => refetch()} />;

  return (
    <motion.div 
      className="flex flex-col h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <DashboardTabs tabs={TABS} activeTab={activeTab} onTabChange={(id) => setActiveTab(id as Tab)} />

      <div className="flex-1 overflow-y-auto">
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
              <h1 className="text-3xl font-bold text-white mb-2">Teacher Dashboard</h1>
              <p className="text-gray-400">Welcome back, {user?.firstName}! Manage your students and grades.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <TeacherStatsCards
                totalStudents={totalStudents}
                totalCourses={totalCourses}
                pendingGrades={pendingGrades}
              />
            </motion.div>

            <motion.div 
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <h1 className="text-3xl font-bold text-white mb-2">Students & Grades</h1>
              <p className="text-gray-400">View and assign grades for your students</p>
            </motion.div>

            <motion.div 
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <WeekSelector selectedWeek={selectedWeek} onWeekChange={setSelectedWeek} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <GradeFilterBar onFilterChange={handleFilterChange} showStatusFilter={true} showWeekFilter={false} />
            </motion.div>

            <motion.div 
              className="space-y-4 max-h-[600px] overflow-y-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {filteredStudents.length === 0 ? (
                <div className="text-center text-gray-400 py-8">No students found</div>
              ) : (
                filteredStudents.map((student, index) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.05 }}
                  >
                    <GradeAssignmentCard
                      student={student}
                      weekNumber={selectedWeek}
                      onGradeAssign={(courseId, gradeLetter) => handleGradeAssign(student.id, courseId, gradeLetter)}
                      isEditable={true}
                    />
                  </motion.div>
                ))
              )}
            </motion.div>
          </motion.div>
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
              <h1 className="text-3xl font-bold text-white mb-2">My Assigned Students</h1>
              <p className="text-gray-400">View and manage students assigned to you</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <TeacherAssignmentList
                assignments={assignmentsData?.assignments || []}
                onStatusChange={handleUpdateAssignmentStatus}
              />
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}