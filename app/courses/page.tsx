'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminEmail } from '@/config/admin';
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
        const urlParams = new URLSearchParams(window.location.search);
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

  const addCourse = () => {
    // Validate current course has name and credits
    if (!currentCourse.name.trim() || !currentCourse.credits.trim()) {
      setMessage('Please fill in course name and credits before adding');
      setMessageType('error');
      return;
    }

    // Create a new course with unique ID
    const newCourse = {
      id: crypto.randomUUID(),
      name: currentCourse.name.trim(),
      credits: currentCourse.credits.trim()
    };

    // Add the course to the list
    setCourses([...courses, newCourse]);

    // Clear the input fields
    setCurrentCourse({ id: '', name: '', credits: '' });
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
      const urlParams = new URLSearchParams(window.location.search);
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
        const newRegisteredCourses: RegisteredCourse[] = data.data.courses.map((course: any) => ({
          id: course.id || crypto.randomUUID(),
          name: course.name,
          credits: course.credits
        }));

        setRegisteredCourses(newRegisteredCourses);
        setHasRegisteredCourses(true);
        setMessage(data.message || `Successfully registered ${courses.length} course(s) with ${calculateTotalCredits()} total credits!`);
        setMessageType('success');
      } else {
        setMessage(data.message || 'Failed to register courses');
        setMessageType('error');
      }
    } catch (error: any) {
      setMessage(error.message || 'Network error. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || checkingStatus || checkingRegistration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-6"></div>
          <p className="text-white text-xl font-medium animate-pulse">
            {checkingStatus ? 'Authenticating...' : 'Checking your courses...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute top-40 right-20 w-80 h-80 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float animation-delay-4000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-violet-500 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-slow"></div>
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='rgba(255,255,255,0.03)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)' /%3E%3C/svg%3E")`
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-full mb-4 shadow-lg shadow-purple-500/50 p-2 animate-bounce-in">
            <img
              src="/freedom.png"
              alt="Freedom City Tech Center Logo"
              className="w-full h-full object-contain animate-glow"
            />
          </div>
          <h1 className="text-4xl font-bold text-gradient-primary mb-2 animate-slide-in-right text-shadow-lg">
            Course Registration
          </h1>
          <p className="text-cyan-300 text-lg mb-2 animate-slide-in-left drop-shadow-lg">
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
                  Your Registered Courses
                </h2>
                <p className="text-green-300 text-lg mb-4">
                  You are currently enrolled in these courses
                </p>
              </div>

              <div className="bg-black/30 rounded-2xl p-6 border border-white/20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {registeredCourses.map((course) => (
                    <div key={course.id} className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-lg p-4 border border-green-400/30">
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
                    <div>
                      <p className="text-blue-300 text-sm font-medium">Total Courses</p>
                      <p className="text-white text-2xl font-bold">{registeredCourses.length}</p>
                    </div>
                    <div>
                      <p className="text-cyan-300 text-sm font-medium">Total Credits</p>
                      <p className="text-white text-2xl font-bold">
                        {registeredCourses.reduce((total, course) => total + course.credits, 0)}
                      </p>
                    </div>
                    <div>
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
                  Register Your Courses & Credits
                </h2>
                <p className="text-gray-300 text-lg mb-4">
                  Add all courses you are taking this semester
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Course Input Section */}
                <div className="bg-black/30 rounded-2xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-cyan-300 mb-4">Add Course</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Course Name"
                      value={currentCourse.name}
                      onChange={(e) => updateCourse('name', e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Credits"
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
                    Add Course
                  </button>
                </div>

                {/* Course List Display */}
                {courses.length > 0 && (
                  <div className="bg-black/30 rounded-2xl p-6 border border-white/20">
                    <h3 className="text-xl font-bold text-cyan-300 mb-4">Your Courses ({courses.length})</h3>
                    <div className="space-y-4">
                      {courses.map((course, index) => (
                        <div key={course.id} className="bg-white/10 rounded-lg p-4 border border-white/20">
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
                    <div>
                      <p className="text-blue-300 text-sm font-medium">Total Courses</p>
                      <p className="text-white text-2xl font-bold">{courses.length}</p>
                    </div>
                    <div>
                      <p className="text-cyan-300 text-sm font-medium">Total Credits</p>
                      <p className="text-white text-2xl font-bold">{calculateTotalCredits()}</p>
                    </div>
                    <div>
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

        {/* Action Buttons */}
        <div className="text-center mt-8 animate-fade-in animation-delay-700">
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                const urlParams = new URLSearchParams(window.location.search);
                router.push(`/dashboard?${urlParams.toString()}`);
              }}
              className="glass-morphism hover:glass-card text-cyan-300 py-3 px-6 rounded-full font-medium transition-all duration-300 transform hover:scale-105 border border-cyan-400/30 hover:shadow-glow"
            >
              🏠 Back to Dashboard
            </button>
            {user && isAdminEmail(user.email) && (
              <button
                onClick={() => {
                  const urlParams = new URLSearchParams(window.location.search);
                  router.push(`/admin?${urlParams.toString()}`);
                }}
                className="glass-morphism hover:glass-card text-purple-300 py-3 px-6 rounded-full font-medium transition-all duration-300 transform hover:scale-105 border border-purple-400/30 hover:shadow-glow"
              >
                ⚙️ Admin Panel
              </button>
            )}
            <button
              onClick={() => {
                router.push('/');
              }}
              className="glass-morphism hover:glass-card text-white py-3 px-6 rounded-full font-medium transition-all duration-300 transform hover:scale-105 border border-white/30 hover:shadow-glow"
            >
              🚪 Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
