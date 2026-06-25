'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import DashboardTabs from '@/components/shared/DashboardTabs';
import LoadingState, { StatsCardSkeleton, TabSkeleton } from '@/components/shared/LoadingState';
import ErrorState from '@/components/shared/ErrorState';
import WeekSelector from '@/components/ui/WeekSelector';
import CourseForm from '@/components/ui/CourseForm';
import ReligionSelector from '@/components/ui/ReligionSelector';
import TuitionInput from '@/components/ui/TuitionInput';
import StudentStatsCards from '@/components/student/StudentStatsCards';
import StudentGPATimeline from '@/components/student/StudentGPATimeline';
import StudentCourseList from '@/components/student/StudentCourseList';
import StudentsAndGrades from '@/components/shared/StudentsAndGrades';
import StudentGradeLegend from '@/components/student/StudentGradeLegend';
import StudentCleaningForm from '@/components/student/StudentCleaningForm';
import { BookOpen, TrendingUp, Award, Sparkles, User } from 'lucide-react';
import { calculateGPA, calculateWeeklyGPAs } from '@/lib/gpa-calculator';
import { useStudentCourses, useStudentGrades, useSubmitCourses, useUpdateCourse, useDeleteCourse, useStudentProfile, useUpdateReligion, useUpdateTuition } from '@/hooks/queries/student';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';

type Tab = 'overview' | 'courses' | 'grades' | 'cleaning';

const TABS = [
  { id: 'overview', label: 'Overview', icon: TrendingUp },
  { id: 'courses', label: 'My Courses', icon: BookOpen },
  { id: 'grades', label: 'My Grades', icon: Award },
  { id: 'cleaning', label: 'Cleaning Form', icon: Sparkles },
];

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [takesReligion, setTakesReligion] = useState<boolean>(false);
  const [tuition, setTuition] = useState<number | null>(null);
  const [tuitionPaid, setTuitionPaid] = useState<boolean>(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [tabsContainer, setTabsContainer] = useState<HTMLElement | null>(null);

  // Move tabs to fixed header
  useEffect(() => {
    const container = document.getElementById('dashboard-tabs-container');
    if (container) {
      setTabsContainer(container);
    }
  }, []);

  const { data: coursesData, isLoading: coursesLoading, error: coursesError, refetch: refetchCourses } = useStudentCourses();
  const { data: gradesData, isLoading: gradesLoading, error: gradesError, refetch: refetchGrades } = useStudentGrades();
  const { data: profileData } = useStudentProfile();
  const submitCoursesMutation = useSubmitCourses();
  const updateCourseMutation = useUpdateCourse();
  const deleteCourseMutation = useDeleteCourse();
  const updateReligionMutation = useUpdateReligion();
  const updateTuitionMutation = useUpdateTuition();

  const courses = coursesData?.courses || [];
  const grades = gradesData?.grades || [];

  const currentGPA = calculateGPA(courses, grades);
  const weeklyGPAs = calculateWeeklyGPAs(courses, grades);
  const totalCredits = courses.reduce((sum: number, c: any) => sum + c.credits, 0);
  const totalGradedCourses = grades.filter((g: any) => g.gradeLetter && g.gradeLetter !== 'E' && g.gradeLetter !== 'F').length;
  const totalAssignments = courses.length * 7;
  const progressPercentage = totalAssignments > 0 ? Math.round((totalGradedCourses / totalAssignments) * 100) : 0;

  const loading = coursesLoading || gradesLoading;
  const error = coursesError || gradesError;

  useEffect(() => {
    if (user?.id) {
      refetchCourses();
      refetchGrades();
    }
  }, [user?.id, refetchCourses, refetchGrades]);

  useEffect(() => {
    if (profileData?.profile) {
      if (profileData.profile.takesReligion !== undefined) setTakesReligion(profileData.profile.takesReligion);
      if (profileData.profile.tuition !== undefined) setTuition(profileData.profile.tuition);
      if (profileData.profile.tuitionPaid !== undefined) setTuitionPaid(profileData.profile.tuitionPaid);
    }
  }, [profileData]);

  const handleReligionSave = async (takesReligion: boolean) => {
    setIsLoadingProfile(true);
    try {
      await updateReligionMutation.mutateAsync(takesReligion);
      setTakesReligion(takesReligion);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleTuitionSave = async (tuitionValue: number) => {
    setIsLoadingProfile(true);
    try {
      await updateTuitionMutation.mutateAsync(tuitionValue);
      setTuition(tuitionValue);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleCourseSubmit = async (courseData: any[]) => {
    await submitCoursesMutation.mutateAsync(courseData);
  };

  const handleDeleteCourse = async (courseId: string) => {
    await deleteCourseMutation.mutateAsync(courseId);
  };

  const handleUpdateCourse = async (courseId: string, data: Partial<any>) => {
    await updateCourseMutation.mutateAsync({ id: courseId, data });
  };

  const selectedWeekGrades = grades.filter((g: any) => g.week === selectedWeek);
  const selectedWeekGPA = weeklyGPAs.find(w => w.week === selectedWeek)?.gpa || 0;

  // Loading state with skeletons
  if (loading) {
    return (
      <div className="flex flex-col min-h-0">
        <TabSkeleton />
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6">
            <div className="mb-8">
              <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded h-10 w-64 mb-2"></div>
              <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded h-5 w-96"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-xl p-6 animate-pulse h-48"></div>
              <div className="bg-white/5 rounded-xl p-6 animate-pulse h-48"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => <StatsCardSkeleton key={i} />)}
            </div>
            <div className="bg-white/5 rounded-xl p-6 animate-pulse h-96"></div>
            <div className="bg-white/5 rounded-xl p-6 animate-pulse h-64"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) return <ErrorState message="Failed to load your data" onRetry={() => refetchCourses()} />;

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
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Student Dashboard</h1>
              <p className="text-gray-400 text-sm sm:text-base">Track your academic progress and stay on top of your grades</p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <ReligionSelector takesReligion={takesReligion} onSave={handleReligionSave} isLoading={isLoadingProfile} />
              <TuitionInput currentTuition={tuition} onSave={handleTuitionSave} isLoading={isLoadingProfile} tuitionPaid={tuitionPaid} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <StudentStatsCards
                stats={[
                  {
                    id: 'courses',
                    icon: BookOpen,
                    title: 'Courses',
                    value: courses.length,
                    subtitle: `${totalCredits} credits`,
                    iconColor: 'text-violet-400',
                    gradient: 'from-violet-600/20 to-indigo-600/20'
                  },
                  {
                    id: 'gpa',
                    icon: TrendingUp,
                    title: 'Current GPA',
                    value: currentGPA.toFixed(2),
                    subtitle: `${totalGradedCourses} graded`,
                    iconColor: 'text-green-400',
                    gradient: 'from-green-600/20 to-emerald-600/20'
                  },
                  {
                    id: 'progress',
                    icon: Award,
                    title: 'Progress',
                    value: `${progressPercentage}%`,
                    subtitle: `${totalGradedCourses}/${totalAssignments} assignments`,
                    iconColor: 'text-blue-400',
                    gradient: 'from-blue-600/20 to-cyan-600/20'
                  },
                  {
                    id: 'tutor',
                    icon: User,
                    title: 'Assigned Tutor',
                    value: profileData?.profile?.tutor
                      ? `${profileData.profile.tutor.firstName} ${profileData.profile.tutor.lastName}`
                      : 'Not assigned',
                    subtitle: profileData?.profile?.tutor
                      ? (profileData.profile.tutor.teacherId || 'Teacher ID ')
                      : 'No tutor assigned',
                    iconColor: profileData?.profile?.tutor ? 'text-purple-400' : 'text-gray-400',
                    gradient: profileData?.profile?.tutor ? 'from-purple-600/20 to-pink-600/20' : 'from-gray-600/20 to-gray-600/20'
                  }
                ]}
                columns={4}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <StudentGPATimeline weeklyGPAs={weeklyGPAs} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <StudentCourseList courses={courses} />
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'courses' && (
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
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">My Courses</h1>
              <p className="text-gray-400 text-sm sm:text-base">Add, edit, or remove your enrolled courses</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <CourseForm
                onSubmit={handleCourseSubmit}
                existingCourses={courses}
                isLoading={submitCoursesMutation.isPending || updateCourseMutation.isPending || deleteCourseMutation.isPending}
                onDeleteCourse={handleDeleteCourse}
                onUpdateCourse={handleUpdateCourse}
              />
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'grades' && (
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
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">My Grades</h1>
              <p className="text-gray-400 text-sm sm:text-base">View your grades by week</p>
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
              className="bg-gradient-to-r from-violet-600/20 to-indigo-600/20 backdrop-blur-lg border border-white/10 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-sm">Week {selectedWeek} GPA</p>
                  <p className={`text-4xl font-bold ${selectedWeekGPA > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                    {selectedWeekGPA > 0 ? selectedWeekGPA.toFixed(2) : 'Not graded'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Completed</p>
                  <p className="text-2xl font-bold text-white">{selectedWeekGrades.length} / {courses.length}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <StudentsAndGrades
                courses={courses}
                grades={grades}
                selectedWeek={selectedWeek}
                isLoading={gradesLoading}
                isEditable={false}
                mode="student"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <StudentGradeLegend />
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
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Cleaning Registration</h1>
              <p className="text-gray-400 text-sm sm:text-base">Register for your assigned cleaning day</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <StudentCleaningForm />
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </>
  );
}