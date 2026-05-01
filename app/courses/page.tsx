'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/auth';
import { BackgroundImage, PageLoader, DashboardButton } from '@/components/ui';
import { useCourseRegistrations } from '@/hooks/useApi';
import { useAuth } from '@/hooks/useAuth';
import { Course, RegisteredCourse } from '@/hooks/useCourseForm';
import CourseManager from '@/components/CourseManager';

interface RawCourseRegistration {
  id: string;
  userId: string;
  user?: { fullName?: string; firstName?: string; lastName?: string };
  courses?: Array<{ name: string }>;
  totalCredits?: number;
  takesReligion?: boolean;
  registrationDate?: string;
  createdAt?: string;
  status?: string;
}

interface CourseRegistration {
  id: string;
  userId: string;
  userName: string;
  religion: string;
  courseName: string;
  credits: number;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function CoursesPage() {
  const [hasRegisteredCourses, setHasRegisteredCourses] = useState(false);
  const [registeredCourses, setRegisteredCourses] = useState<RegisteredCourse[]>([]);
  const [checkingRegistration, setCheckingRegistration] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Authentication hook - handles JWT validation and user state
  const { user, isLoading: authLoading } = useAuth('/');

  // Router for navigation
  const router = useRouter();

  // React Query for course registrations
  const { data: courseRegistrations = [], isLoading: courseRegistrationsLoading } = useCourseRegistrations();

  // Filter course registrations based on search term
  const filteredRegistrations = courseRegistrations.filter(registration =>
    registration.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    registration.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if user has already registered courses
  useEffect(() => {
    const checkRegisteredCourses = async () => {
      if (!user) return;

      try {
        const response = await fetch(`/api/courses?userId=${user.id}&email=${encodeURIComponent(user.email)}`);

        if (!response.ok) {
          throw new Error('Failed to check registered courses');
        }

        const data = await response.json();

        if (data.success && data.hasRegistration) {
          setHasRegisteredCourses(true);
          setRegisteredCourses(data.data.courses);
        }
      } catch (error) {

      } finally {
        setCheckingRegistration(false);
      }
    };

    if (user) {
      checkRegisteredCourses();
    }
  }, [user]);

  // React Query handles course registrations data fetching automatically

  if (user === null || authLoading || checkingRegistration) {
    return (
      <PageLoader text="Loading your courses..." color="purple" />
    );
  }

  return (
    <BackgroundImage className="h-screen">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
      <div className="relative z-10 container mx-auto px-4 py-8 h-full flex flex-col">
        <div className="overflow-y-auto flex-1">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in-down">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-full mb-4 shadow-lg shadow-emerald-500/50 p-2 animate-bounce-in">
              <img
                src="/freedom.png"
                alt="Freedom City Tech Center Logo"
                className="w-full h-full object-contain animate-glow"
              />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent mb-2 animate-slide-in-right">
              Course Registration
            </h1>
            <p className="text-emerald-200 text-lg mb-2 animate-slide-in-left">
              Freedom City Tech Center
            </p>
            <p className="text-gray-300 animate-slide-in-up">
              Register for courses and track your credits
            </p>
          </div>

          {/* Registered Courses Display */}
          {hasRegisteredCourses && (
            <div className="max-w-4xl mx-auto mb-8 animate-fade-in-up animation-delay-300">
              <div className="glass-card rounded-3xl p-8 border border-green-500/30 shadow-glow-lg hover-lift">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4 animate-bounce-in shadow-lg">
                    <span className="text-3xl text-white">✅</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gradient-primary mb-3 animate-slide-in-up text-shadow-lg">
                    Your Submitted Courses
                  </h2>
                  <p className="text-green-300 text-lg mb-4">
                    You have submitted these Courses and Credits
                  </p>
                </div>

                <div className="bg-black/30 rounded-2xl p-6 border border-white/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {registeredCourses.map((course, index) => (
                      <div key={course.id || `registered-${index}`} className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-lg p-4 border border-green-400/30">
                        <div className="mb-2">
                          <h4 className="text-white font-semibold">{course.name}</h4>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-green-300 text-sm">Credits:</span>
                          <span className="text-white font-bold text-lg">{course.credits}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-xl p-6 border border-blue-400/30">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div key="registered-total-courses">
                        <p className="text-blue-300 text-sm font-medium">Total Courses</p>
                        <p className="text-white text-2xl font-bold">{registeredCourses.length}</p>
                      </div>
                      <div key="registered-total-credits">
                        <p className="text-cyan-300 text-sm font-medium">Total Credits</p>
                        <p className="text-white text-2xl font-bold">
                          {registeredCourses.reduce((total, course) => total + course.credits, 0)}
                        </p>
                      </div>
                      <div key="registered-status">
                        <p className="text-purple-300 text-sm font-medium">Status</p>
                        <p className="text-green-400 text-2xl font-bold">✓ Registered</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Course Registration Form */}
          {!hasRegisteredCourses && (
            <CourseManager
              user={user}
              mode="student"
              onSubmitSuccess={() => {
                // Refresh registered courses after successful submission
                const checkRegisteredCourses = async () => {
                  if (!user) return;
                  try {
                    const response = await fetch(`/api/courses?userId=${user.id}&email=${encodeURIComponent(user.email)}`);
                    const data = await response.json();
                    if (data.success && data.hasRegistration) {
                      setHasRegisteredCourses(true);
                      setRegisteredCourses(data.data.courses);
                    }
                  } catch (error) {

                  }
                };
                checkRegisteredCourses();
              }}
            />
          )}

          {/* Student Course Credits Section - Visible to All Users */}
          {user && (
            <div className="mt-12 animate-fade-in-up animation-delay-600">
              <div className="bg-black/30 rounded-2xl p-8 border border-white/20">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-cyan-300 mb-4">Student Course and Credits</h3>
                  <p className="text-gray-300 text-sm mb-2">
                    All students who have registered for courses and their credit totals
                  </p>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by student name or course name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-3 pl-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                    />
                    <div className="absolute left-3 top-3.5 text-gray-400">
                      <span className="text-lg">🔍</span>
                    </div>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-2.5 px-3 py-1 bg-red-600/20 text-red-300 rounded-lg text-sm hover:bg-red-600/30 transition-colors duration-200"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  {searchTerm && (
                    <div className="mt-2 text-sm text-gray-300">
                      Found {filteredRegistrations.length} of {courseRegistrations.length} results
                    </div>
                  )}
                </div>

                {courseRegistrationsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-cyan-300">Loading course registrations...</p>
                  </div>
                ) : filteredRegistrations.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-600/20 rounded-full mb-4">
                      <span className="text-2xl">📚</span>
                    </div>
                    <p className="text-gray-400">
                      {searchTerm ? 'No results found for your search' : 'No students have registered for courses yet'}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden lg:block">
                      <table className="w-full text-white text-sm">
                        <thead>
                          <tr className="border-b border-white/20">
                            <th className="text-left py-3 px-4 font-medium text-cyan-300">Student Name</th>
                            <th className="text-left py-3 px-4 font-medium text-cyan-300">Courses</th>
                            <th className="text-center py-3 px-4 font-medium text-cyan-300">Credits</th>
                            <th className="text-center py-3 px-4 font-medium text-cyan-300">Religion Course</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRegistrations
                            .sort((a, b) => a.userName.localeCompare(b.userName))
                            .map((registration) => (
                              <tr
                                key={registration.id}
                                className="border-b border-white/10 hover:bg-white/5 transition-colors"
                              >
                                <td className="py-3 px-4">
                                  <div className="font-medium text-white">
                                    {registration.userName}
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="text-white text-sm">
                                    {registration.courseName}
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className="font-bold text-lg text-green-400">{registration.credits}</span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className={`font-bold text-sm ${registration.religion === 'Yes' ? 'text-green-400' : 'text-red-400'}`}>
                                    {registration.religion}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="lg:hidden space-y-4">
                      {filteredRegistrations
                        .sort((a, b) => a.userName.localeCompare(b.userName))
                        .map((registration) => (
                          <div key={registration.id} className="bg-white/10 rounded-lg p-4 border border-white/20">
                            <div className="mb-3">
                              <h4 className="font-semibold text-white text-base mb-1">
                                {registration.userName}
                              </h4>
                            </div>

                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-cyan-300 font-medium">Course:</span>
                                <div className="text-white mt-1">
                                  {registration.courseName}
                                </div>
                              </div>

                              <div className="flex justify-between items-center pt-2 border-t border-white/10">
                                <div className="flex items-center gap-4">
                                  <div>
                                    <span className="text-cyan-300 text-xs">Credits:</span>
                                    <span className="font-bold text-green-400 ml-1">{registration.credits}</span>
                                  </div>
                                  <div>
                                    <span className="text-cyan-300 text-xs">Religion:</span>
                                    <span className={`font-bold ml-1 ${registration.religion === 'Yes' ? 'text-green-400' : 'text-red-400'}`}>
                                      {registration.religion}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </>
                )}
              </div>

              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by student name or course name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 pl-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                  />
                  <div className="absolute left-3 top-3.5 text-gray-400">
                    <span className="text-lg">🔍</span>
                  </div>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-2.5 px-3 py-1 bg-red-600/20 text-red-300 rounded-lg text-sm hover:bg-red-600/30 transition-colors duration-200"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {searchTerm && (
                  <div className="mt-2 text-sm text-gray-300">
                    Found {filteredRegistrations.length} of {courseRegistrations.length} results
                  </div>
                )}
              </div>

              {courseRegistrationsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-cyan-300">Loading course registrations...</p>
                </div>
              ) : filteredRegistrations.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-600/20 rounded-full mb-4">
                    <span className="text-2xl">📚</span>
                  </div>
                  <p className="text-gray-400">
                    {searchTerm ? 'No results found for your search' : 'No students have registered for courses yet'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden lg:block">
                    <table className="w-full text-white text-sm">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left py-3 px-4 font-medium text-cyan-300">Student Name</th>
                          <th className="text-left py-3 px-4 font-medium text-cyan-300">Courses</th>
                          <th className="text-center py-3 px-4 font-medium text-cyan-300">Credits</th>
                          <th className="text-center py-3 px-4 font-medium text-cyan-300">Religion Course</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRegistrations
                          .sort((a, b) => a.userName.localeCompare(b.userName))
                          .map((registration) => (
                            <tr
                              key={registration.id}
                              className="border-b border-white/10 hover:bg-white/5 transition-colors"
                            >
                              <td className="py-3 px-4">
                                <div className="font-medium text-white">
                                  {registration.userName}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-white text-sm">
                                  {registration.courseName}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className="font-bold text-lg text-green-400">{registration.credits}</span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className={`font-bold text-sm ${registration.religion === 'Yes' ? 'text-green-400' : 'text-red-400'}`}>
                                  {registration.religion}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="lg:hidden space-y-4">
                    {filteredRegistrations
                      .sort((a, b) => a.userName.localeCompare(b.userName))
                      .map((registration) => (
                        <div key={registration.id} className="bg-white/10 rounded-lg p-4 border border-white/20">
                          <div className="mb-3">
                            <h4 className="font-semibold text-white text-base mb-1">
                              {registration.userName}
                            </h4>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-cyan-300 font-medium">Course:</span>
                              <div className="text-white mt-1">
                                {registration.courseName}
                              </div>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-white/10">
                              <div className="flex items-center gap-4">
                                <div>
                                  <span className="text-cyan-300 text-xs">Credits:</span>
                                  <span className="font-bold text-green-400 ml-1">{registration.credits}</span>
                                </div>
                                <div>
                                  <span className="text-cyan-300 text-xs">Religion:</span>
                                  <span className={`font-bold ml-1 ${registration.religion === 'Yes' ? 'text-green-400' : 'text-red-400'}`}>
                                    {registration.religion}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </>
              )}

              {/* Go to Dashboard Button */}
              <div className="text-center mt-8">
                <DashboardButton text="Back to Dashboard" />
              </div>
            </div>
          )}
        </div>
      </div>
    </BackgroundImage>
  );
}
