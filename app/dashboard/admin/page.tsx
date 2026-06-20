'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import DashboardTabs from '@/components/shared/DashboardTabs';
import LoadingState, { StatsCardSkeleton, TabSkeleton } from '@/components/shared/LoadingState';
import ErrorState from '@/components/shared/ErrorState';
import GradeFilterBar from '@/components/ui/GradeFilterBar';
import AdminStatsCards from '@/components/admin/AdminStatsCards';
import AdminStudentTable from '@/components/admin/AdminStudentTable';
import AdminTuitionList from '@/components/admin/AdminTuitionList';
import AdminAssignmentManager from '@/components/admin/AdminAssignmentManager';
import ApplicationsTab from '@/components/admin/ApplicationsTab';
import AdminCleaningManagement from '@/components/admin/AdminCleaningManagement';
import SharedGradesTab from '@/components/shared/SharedGradesTab';
import { Users, Award, DollarSign, UserPlus, TrendingUp, FileText, BarChart3, MessageSquare, Sparkles } from 'lucide-react';
import { useAdminStudents, useGPADistribution, useWeeklyProgress, useUpdateTuitionStatus, useUpdateUserRole, useRoles, useDeleteStudent } from '@/hooks/queries/admin';
import { useAssignments, useTeachers, useCreateBulkAssignments, useDeleteBulkAssignments, useUpdateAssignment } from '@/hooks/queries/assignments';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';

type Tab = 'overview' | 'students' | 'grades' | 'tuition' | 'assignments' | 'reports' | 'applications' | 'cleaning';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'grades', label: 'Grades', icon: Award },
  { id: 'tuition', label: 'Tuition', icon: DollarSign },
  { id: 'assignments', label: 'Assignments', icon: UserPlus },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'applications', label: 'Applications', icon: MessageSquare },
  { id: 'cleaning', label: 'Cleaning', icon: Sparkles },
];

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [filters, setFilters] = useState<any>({});
  const [gpaFilter, setGpaFilter] = useState<{ min: number; max: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabsContainer, setTabsContainer] = useState<HTMLElement | null>(null);

  // Move tabs to fixed header
  useEffect(() => {
    const container = document.getElementById('dashboard-tabs-container');
    if (container) {
      setTabsContainer(container);
    }
  }, []);

  // Data hooks
  const { data: studentsData, isLoading: studentsLoading, error: studentsError, refetch } = useAdminStudents();
  const { data: gpaDistData, isLoading: gpaLoading } = useGPADistribution();
  const { data: weeklyProgressData, isLoading: weeklyLoading } = useWeeklyProgress();
  const { data: rolesData } = useRoles();
  const { data: teachersData, isLoading: teachersLoading, refetch: refetchTeachers } = useTeachers();
  const { data: assignmentsData, isLoading: assignmentsLoading, refetch: refetchAssignments } = useAssignments();

  // Mutation hooks
  const updateTuitionMutation = useUpdateTuitionStatus();
  const updateRoleMutation = useUpdateUserRole();
  const deleteStudentMutation = useDeleteStudent();
  
  // Use the new bulk mutation hooks
  const createBulkAssignmentsMutation = useCreateBulkAssignments();
  const deleteBulkAssignmentsMutation = useDeleteBulkAssignments();
  const updateAssignmentMutation = useUpdateAssignment();

  // Process students data
  const students = useMemo(() => {
    if (!studentsData?.students) return [];
    return studentsData.students.map((student: any) => ({
      id: student.id,
      name: student.name,
      studentId: student.studentId,
      email: student.email,
      phoneNumber: student.phoneNumber,
      roleId: student.roleId,
      role: student.role,
      currentGPA: student.currentGPA,
      totalCredits: student.totalCredits,
      coursesCount: student.coursesCount,
      tuition: student.tuition,
      tuitionPaid: student.tuitionPaid,
      enrolledCourses: student.enrolledCourses || [],
      existingGrades: student.grades || []
    }));
  }, [studentsData]);

  const gpaDistribution = gpaDistData?.distribution;
  const weeklyProgress = weeklyProgressData?.weeklyProgress || [];

  // Filter students
  const filteredStudents = useMemo(() => {
    let filtered = [...students];
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter((s: any) =>
        s.name.toLowerCase().includes(search) ||
        s.studentId.toLowerCase().includes(search) ||
        s.email.toLowerCase().includes(search)
      );
    }
    if (gpaFilter) {
      filtered = filtered.filter((s: any) => s.currentGPA >= gpaFilter.min && s.currentGPA < gpaFilter.max);
    }
    return filtered;
  }, [students, filters, gpaFilter]);

  const handleGpaFilter = (min: number, max: number) => {
    if (min === 0 && max === 4.0) {
      setGpaFilter(null);
    } else {
      setGpaFilter({ min, max });
    }
  };

  const handleTuitionToggle = async (studentId: string, currentStatus: boolean) => {
    try {
      await updateTuitionMutation.mutateAsync({ studentId, tuitionPaid: !currentStatus });
      refetch();
    } catch (error) {
      console.error('Error updating tuition status:', error);
    }
  };

  const handleRoleChange = async (userId: string, roleId: string) => {
    try {
      await updateRoleMutation.mutateAsync({ userId, roleId });
      refetch();
      // Also refetch teachers in case role changed to/from teacher
      refetchTeachers();
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      try {
        await deleteStudentMutation.mutateAsync(studentId);
        refetch();
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  // Handle bulk assignment (multiple students) - using new bulk endpoint
  const handleCreateAssignments = async (teacherId: string, studentIds: string[]) => {
    if (!teacherId || studentIds.length === 0) return;
    
    try {
      const result = await createBulkAssignmentsMutation.mutateAsync({
        teacherId,
        studentIds,
        status: 'not_verified'
      });
      
      await refetchAssignments();
      await refetchTeachers();
      
      if (result.assignments?.length > 0) {
        console.log(`✅ Assigned ${result.assignments.length} student(s) successfully`);
      }
      if (result.errors?.length > 0) {
        console.warn('Some assignments failed:', result.errors);
        alert(`Assigned ${result.assignments.length} students. ${result.errors.length} failed.`);
      } else {
        alert(`✅ Successfully assigned ${result.assignments.length} student(s)!`);
      }
    } catch (error: any) {
      console.error('Error creating assignments:', error);
      alert(error.response?.data?.error || 'Failed to create assignments. Please try again.');
    }
  };

  // Handle bulk removal (multiple assignments) - using new bulk endpoint
  const handleDeleteAssignments = async (assignmentIds: string[]) => {
    if (assignmentIds.length === 0) return;
    
    if (!confirm(`Remove ${assignmentIds.length} assignment(s)? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const result = await deleteBulkAssignmentsMutation.mutateAsync(assignmentIds);
      await refetchAssignments();
      await refetchTeachers();
      
      if (result.results?.length > 0) {
        console.log(`✅ Removed ${result.results.length} assignment(s) successfully`);
      }
      if (result.errors?.length > 0) {
        console.warn('Some deletions failed:', result.errors);
        alert(`Removed ${result.results.length} assignments. ${result.errors.length} failed.`);
      } else {
        alert(`✅ Successfully removed ${result.results.length} assignment(s)!`);
      }
    } catch (error: any) {
      console.error('Error deleting assignments:', error);
      alert(error.response?.data?.error || 'Failed to delete assignments. Please try again.');
    }
  };

  const handleUpdateAssignmentStatus = async (assignmentId: string, status: string) => {
    try {
      await updateAssignmentMutation.mutateAsync({ id: assignmentId, data: { status } });
      await refetchAssignments();
    } catch (error) {
      console.error('Error updating assignment status:', error);
    }
  };

  const totalStudents = students.length;
  const totalTeachers = teachersData?.teachers?.length || 0;
  const totalAssignments = assignmentsData?.assignments?.length || 0;
  const totalRevenue = students.reduce((sum: number, s: any) => sum + (s.tuition || 0), 0);

  const isLoading = studentsLoading;
  const error = studentsError;

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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => <StatsCardSkeleton key={i} />)}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-xl p-6 animate-pulse h-64"></div>
              <div className="bg-white/5 rounded-xl p-6 animate-pulse h-64"></div>
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
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
              <p className="text-gray-400 text-sm sm:text-base">Overview of the school management system</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <AdminStatsCards
                totalStudents={totalStudents}
                totalTeachers={totalTeachers}
                totalAssignments={totalAssignments}
                totalRevenue={totalRevenue}
              />
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {/* GPA Distribution */}
              {gpaDistribution && (
                <motion.div 
                  className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
                  whileHover={{ scale: 1.02, borderColor: "rgba(168, 85, 247, 0.3)" }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">GPA Distribution</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Excellent (3.5+)</span>
                      <span className="text-green-400">{gpaDistribution.excellent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Good (3.0-3.5)</span>
                      <span className="text-blue-400">{gpaDistribution.good}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Satisfactory (2.5-3.0)</span>
                      <span className="text-yellow-400">{gpaDistribution.satisfactory}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Fair (2.0-2.5)</span>
                      <span className="text-orange-400">{gpaDistribution.fair}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Needs Improvement</span>
                      <span className="text-red-400">{gpaDistribution.needsImprovement}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Quick Stats */}
              <motion.div 
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
                whileHover={{ scale: 1.02, borderColor: "rgba(168, 85, 247, 0.3)" }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Quick Stats</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Average GPA</span>
                    <span className="text-white font-semibold">{(gpaDistribution?.averageGPA || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Courses Enrolled</span>
                    <span className="text-white font-semibold">
                      {students.reduce((sum: number, s: any) => sum + s.coursesCount, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Pending Payments</span>
                    <span className="text-white font-semibold">
                      {students.filter((s: any) => s.tuition && !s.tuitionPaid).length}
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'students' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4">
              <input
                type="text"
                placeholder="Search by name, email, or student ID..."
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <AdminStudentTable
              students={filteredStudents}
              onDelete={handleDeleteStudent}
              onRoleChange={handleRoleChange}
              roles={rolesData?.roles}
            />
          </motion.div>
        )}

        {activeTab === 'grades' && (
          <SharedGradesTab
            title="Manage Grades"
            description="Assign and manage grades for all students"
          />
        )}

        {activeTab === 'tuition' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <AdminTuitionList
              students={students}
              onTogglePayment={handleTuitionToggle}
            />
          </motion.div>
        )}

        {activeTab === 'assignments' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <AdminAssignmentManager
              assignments={assignmentsData?.assignments || []}
              teachers={teachersData?.teachers || []}
              students={students}
              onAssign={handleCreateAssignments}
              onRemove={handleDeleteAssignments}
            />
          </motion.div>
        )}

        {activeTab === 'reports' && (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
            >
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Weekly Grading Progress</h2>
              <div className="space-y-4">
                {weeklyProgress.map((week: any, index: number) => (
                  <motion.div 
                    key={week.week} 
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  >
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Week {week.week}</span>
                      <span className="text-white">{(week.percentage || 0).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-violet-600 to-indigo-600 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${week.percentage}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      />
                    </div>
                    <p className="text-gray-400 text-xs">{week.graded} / {week.total} courses graded</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'applications' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ApplicationsTab searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          </motion.div>
        )}

        {activeTab === 'cleaning' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <AdminCleaningManagement />
          </motion.div>
        )}
      </motion.div>
    </>
  );
}