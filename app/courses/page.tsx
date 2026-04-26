'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';

interface Course {
  id: string;
  name: string;
  credits: string;
}

interface RegisteredCourse {
  id: string;
  name: string;
  credits: number;
}

interface CourseRegistration {
  id: string;
  userId: string;
  user: User;
  courses: { id: string; name: string; credits: number }[];
  totalCredits: number;
  takesReligion: boolean;
  submittedAt: string;
}

export default function CoursesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [currentCourse, setCurrentCourse] = useState<Course>({ id: '', name: '', credits: '' });
  const [courses, setCourses] = useState<Course[]>([]);
  const [takesReligion, setTakesReligion] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [hasRegisteredCourses, setHasRegisteredCourses] = useState(false);
  const [registeredCourses, setRegisteredCourses] = useState<RegisteredCourse[]>([]);
  const [checkingRegistration, setCheckingRegistration] = useState(true);
  const [courseRegistrations, setCourseRegistrations] = useState<CourseRegistration[]>([]);
  const [courseRegistrationsLoading, setCourseRegistrationsLoading] = useState(true);
  const router = useRouter();

  // Check if user has valid authentication from URL params
  useEffect(() => {
    const checkUserAccess = async () => {
      // Get user data from URL params (passed from login)
      const urlParams = new URLSearchParams(window.location.search);
      const userId = urlParams.get('userId');
      const email = urlParams.get('email');

      if (!userId || !email) {
        // No auth params, redirect to home
        router.push('/');
        return;
      }

      try {
        // Verify user exists in database
        const response = await fetch('/api/user-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, email }),
        });

        if (!response.ok) {
          // User not found, redirect to home
          router.push('/');
          return;
        }

        const data = await response.json();

        if (data.success && data.user) {
          setUser(data.user);
        } else {
          // User not found, redirect to home
          router.push('/');
        }
      } catch {
        router.push('/');
      } finally {
        setCheckingStatus(false);
      }
    };

    checkUserAccess();
  }, [router]);

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
        console.error('Error checking registered courses:', error);
      } finally {
        setCheckingRegistration(false);
      }
    };

    if (user) {
      checkRegisteredCourses();
    }
  }, [user]);

  // Fetch all course registrations for the Student Course Credits section
  useEffect(() => {
    const fetchCourseRegistrations = async () => {
      if (!user) {
        setCourseRegistrationsLoading(false);
        return;
      }

      try {
        // Fetch from the correct endpoint for all course registrations
        const response = await fetch('/api/all-course-registrations');
        const data = await response.json();

        if (data.success) {
          setCourseRegistrations(data.registrations || []);
        }
      } catch (error) {
        console.error('Error fetching course registrations:', error);
      } finally {
        setCourseRegistrationsLoading(false);
      }
    };

    fetchCourseRegistrations();
  }, [user]);

  // Refresh course registrations function
  const refreshCourseRegistrations = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/all-course-registrations');
      const data = await response.json();

      if (data.success) {
        setCourseRegistrations(data.registrations || []);
      }
    } catch (error) {
      console.error('Error refreshing course registrations:', error);
    }
  };

  const addCourse = () => {
    // Validate input
    if (!currentCourse.name.trim() || !currentCourse.credits.trim()) {
      setMessage('Please fill in both course name and credits');
      setMessageType('error');
      return;
    }

    // Check for duplicate course names
    if (courses.some(course => course.name.toLowerCase().trim() === currentCourse.name.toLowerCase().trim())) {
      setMessage('A course with this name already exists');
      setMessageType('error');
      return;
    }

    // Create new course object with unique ID
    const newCourse: Course = {
      id: crypto.randomUUID(), // Generate unique ID for the key
      name: currentCourse.name.trim(),
      credits: currentCourse.credits.trim()
    };

    // Add the course to the list
    setCourses([...courses, newCourse]);

    // Clear the input fields
    setCurrentCourse({ id: '', name: '', credits: '' });
    setMessage('');
    setMessageType('');
  };

  const removeCourse = (id: string) => {
    // Remove the course from the courses array
    setCourses(courses.filter(course => course.id !== id));

    // Remove the course from the single course card
    if (currentCourse.id === id) {
      // Clear the current course
      setCurrentCourse({ id: '', name: '', credits: '' });
    }
  };

  const updateCourse = (field: 'name' | 'credits', value: string) => {
    setCurrentCourse({ ...currentCourse, [field]: value });
  };

  const calculateTotalCredits = () => {
    return courses.reduce((total, course) => total + (parseInt(course.credits) || 0), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate user is logged in
    if (!user || !user.id) {
      setMessage('User session expired. Please log in again.');
      setMessageType('error');
      // Redirect to home
      setTimeout(() => {
        router.push('/');
      }, 2000);
      return;
    }

    // Validate at least one course is added
    if (courses.length === 0) {
      setMessage('Please add at least one course before submitting');
      setMessageType('error');
      return;
    }

    // Validate credits are numbers
    const invalidCredits = courses.find(course => isNaN(parseInt(course.credits)));
    if (invalidCredits) {
      setMessage('Please enter valid numbers for all credits');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          courses: courses.map(course => ({
            name: course.name.trim(),
            credits: parseInt(course.credits) || 0
          })),
          takesReligion: takesReligion
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save courses');
      }

      const data = await response.json();

      if (data.success) {
        // Convert to registered format for display
        const newRegisteredCourses: RegisteredCourse[] = data.data.courses.map((course: { id?: string; name: string; credits: number | string }) => ({
          id: course.id || crypto.randomUUID(),
          name: course.name,
          credits: course.credits
        }));

        setRegisteredCourses(newRegisteredCourses);
        setHasRegisteredCourses(true);
        setMessage(data.message || `Successfully registered ${courses.length} course(s) with ${calculateTotalCredits()} total credits!`);
        setMessageType('success');

        // Refresh the course registrations list to show the new registration immediately
        await refreshCourseRegistrations();
      } else {
        setMessage(data.message || 'Failed to register courses');
        setMessageType('error');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Network error. Please try again.';
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || checkingStatus || checkingRegistration) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-400 border-t-white mx-auto mb-6"></div>
          <p className="text-emerald-200 text-xl font-medium animate-pulse">
            {checkingStatus ? 'Authenticating...' : 'Checking your courses...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
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
            <div className="max-w-4xl mx-auto animate-fade-in-up animation-delay-300">
              <div className="glass-card rounded-3xl p-8 border border-white/20 shadow-glow-lg hover-lift">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mb-4 animate-bounce-in shadow-lg">
                    <span className="text-3xl text-white">📚</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gradient-primary mb-3 animate-slide-in-up text-shadow-lg">
                    Register Your Courses & Credits you doing this Semester
                  </h2>
                  <p className="text-gray-300 text-lg mb-4">
                    Enter all course unit names you are taking this semester, then register for all units at once
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Course Input Section */}
                  <div className="bg-black/30 rounded-2xl p-6 border border-white/20">
                    <h3 className="text-xl font-bold text-cyan-300 mb-4">Add Course Unit Name</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input
                        type="text"
                        placeholder="Enter course unit name (e.g., Math for the Real World)"
                        value={currentCourse.name}
                        onChange={(e) => updateCourse('name', e.target.value)}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        placeholder="Credits for this course unit"
                        value={currentCourse.credits}
                        onChange={(e) => updateCourse('credits', e.target.value)}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addCourse}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                    >
                      <span>➕</span>
                      Add Course Unit Name
                    </button>
                  </div>

                  {/* Course List Display */}
                  {courses.length > 0 && (
                    <div className="bg-black/30 rounded-2xl p-6 border border-white/20">
                      <h3 className="text-xl font-bold text-cyan-300 mb-4">Your Courses ({courses.length})</h3>
                      <div className="space-y-4">
                        {courses.map((course, index) => (
                          <div key={course.id || `course-${index}`} className="bg-white/10 rounded-lg p-4 border border-white/20">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                  {index + 1}
                                </div>
                                <div>
                                  <h4 className="text-white font-semibold text-lg">{course.name}</h4>
                                  <p className="text-cyan-300 text-sm">({course.credits} credits)</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeCourse(course.id)}
                                className="flex-shrink-0 w-8 h-8 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white transition-all duration-300 transform hover:scale-110"
                              >
                                ❌
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Religion Course Checkbox */}
                  <div className="bg-black/30 rounded-2xl p-6 border border-white/20">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={takesReligion}
                        onChange={(e) => setTakesReligion(e.target.checked)}
                        className="w-5 h-5 accent-blue-600 bg-white/20 border-white/30 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent"
                      />
                      <div>
                        <span className="text-white font-medium text-lg">I am taking a Religion course</span>
                        <p className="text-gray-400 text-sm">Check this box if you are enrolled in any religion course this semester</p>
                      </div>
                    </label>
                  </div>

                  {/* Credits Summary */}
                  <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-2xl p-6 border border-blue-400/30">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div key="total-courses">
                        <p className="text-blue-300 text-sm font-medium">Total Courses</p>
                        <p className="text-white text-2xl font-bold">{courses.length}</p>
                      </div>
                      <div key="total-credits">
                        <p className="text-cyan-300 text-sm font-medium">Total Credits</p>
                        <p className="text-white text-2xl font-bold">{calculateTotalCredits()}</p>
                      </div>
                      <div key="religion-course">
                        <p className="text-purple-300 text-sm font-medium">Religion Course</p>
                        <p className="text-white text-2xl font-bold">{takesReligion ? '✓ Yes' : '✗ No'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Message Display */}
                  {
                    message && (
                      <div className={`p-4 rounded-lg text-center ${messageType === 'success'
                        ? 'bg-green-600/20 border border-green-400/30 text-green-300'
                        : 'bg-red-600/20 border border-red-400/30 text-red-300'
                        }`}>
                        {message}
                      </div>
                    )
                  }

                  {/* Submit Button */}
                  <div className="text-center">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25"
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                          Registering Courses...
                        </span>
                      ) : (
                        'Register Courses & Credits'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
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
                  <p className="text-blue-300 text-sm font-medium animate-pulse block sm:hidden">
                    💡 Scroll right to view total credits for each student →
                  </p>
                </div>

                {courseRegistrationsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-cyan-300">Loading course registrations...</p>
                  </div>
                ) : courseRegistrations.filter(reg => reg.courses && reg.courses.length > 0).length === 0 ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-600/20 rounded-full mb-4">
                      <span className="text-2xl">📚</span>
                    </div>
                    <p className="text-gray-400">No students have registered for courses yet</p>
                  </div>
                ) : (
                  <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[600px] text-white text-sm sm:text-base">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-medium text-cyan-300 text-xs sm:text-sm whitespace-nowrap">Student Name</th>
                          <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-medium text-cyan-300 text-xs sm:text-sm whitespace-nowrap">Courses</th>
                          <th className="text-center py-2 px-2 sm:py-3 sm:px-4 font-medium text-cyan-300 text-xs sm:text-sm whitespace-nowrap">Credits</th>
                          <th className="text-center py-2 px-2 sm:py-3 sm:px-4 font-medium text-cyan-300 text-xs sm:text-sm whitespace-nowrap">Religion Course</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courseRegistrations
                          .filter(reg => reg.courses && reg.courses.length > 0 && reg.user)
                          .sort((a, b) => {
                            const nameA = `${a.user.firstName} ${a.user.lastName}`.toLowerCase();
                            const nameB = `${b.user.firstName} ${b.user.lastName}`.toLowerCase();
                            return nameA.localeCompare(nameB);
                          })
                          .map((registration) => (
                            <tr
                              key={registration.id}
                              className="border-b border-white/10 hover:bg-white/5 transition-colors"
                            >
                              <td className="py-2 px-2 sm:py-3 sm:px-4">
                                <div className="font-medium text-white text-sm sm:text-base max-w-[150px] break-words">
                                  {registration.user ? `${registration.user.firstName} ${registration.user.lastName}` : 'Unknown User'}
                                </div>
                              </td>
                              <td className="py-2 px-2 sm:py-3 sm:px-4">
                                <div className="text-white text-xs sm:text-sm max-w-[200px] break-words">
                                  {registration.courses.map((course: { name: string; credits: number | string }, courseIndex: number) => (
                                    <div key={courseIndex} className="mb-1">
                                      {course.name} ({course.credits} credits)
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td className="py-2 px-2 sm:py-3 sm:px-4 text-center">
                                <span className="font-bold text-sm sm:text-lg text-green-400">{registration.totalCredits}</span>
                              </td>
                              <td className="py-2 px-2 sm:py-3 sm:px-4 text-center">
                                <span className={`font-bold text-xs sm:text-sm ${registration.takesReligion ? 'text-green-400' : 'text-red-400'}`}>
                                  {registration.takesReligion ? 'YES' : 'NO'}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons - Bottom of Page */}
          <div className="text-center mt-8 space-y-4">
            <button
              onClick={() => {
                const urlParams = new URLSearchParams(window.location.search);
                router.push(`/dashboard?${urlParams.toString()}`);
              }}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-3"
            >
              <span className="text-xl">🏠</span>
              <span className="text-lg">Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
