'use client';

import { useState, useMemo } from 'react';
import { User } from '@/lib/auth';
import { useCourseRegistrations, useSubmitCourseRegistration } from '@/hooks/courseHooks';

// Course interface
interface Course {
  id: string;
  name: string;
  credits: number;
}

interface CourseManagerProps {
  user: User | null;
  mode?: 'student' | 'admin';
  title?: string;
  description?: string;
  showHeader?: boolean;
  onSubmitSuccess?: () => void;
}

export default function CourseManager({
  user,
  mode = 'student',
  title = mode === 'admin' ? 'Course Management' : 'Register Your Courses',
  description = mode === 'admin'
    ? 'Manage course registrations'
    : 'Enter all course unit names you are taking this semester, then register for all units at once',
  showHeader = true,
  onSubmitSuccess
}: CourseManagerProps) {
  // Use existing API hooks
  const { data: existingRegistrations = [] } = useCourseRegistrations();
  const submitRegistration = useSubmitCourseRegistration();

  // Local state for form
  const [currentCourse, setCurrentCourse] = useState({ name: '', credits: 1 });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  // Find user's existing registration if any
  const userRegistration = existingRegistrations.find(reg => reg.userId === user?.id);

  // Initialize form with existing data using useMemo
  const initialCourses = useMemo(() => {
    if (userRegistration) {
      // Transform RegisteredCourse[] to Course[] with required id field
      return (userRegistration.courses || []).map((course, index) => ({
        id: course.id || `existing-${index}`,
        name: course.name,
        credits: course.credits
      }));
    }
    return [];
  }, [userRegistration]);

  const initialTakesReligion = useMemo(() => {
    return userRegistration?.takesReligion || false;
  }, [userRegistration]);

  // Initialize state with memoized values
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [takesReligion, setTakesReligion] = useState(initialTakesReligion);

  const addCourse = () => {
    if (currentCourse.name.trim()) {
      const newCourse: Course = {
        id: Date.now().toString(),
        name: currentCourse.name.trim(),
        credits: currentCourse.credits || 1
      };
      setCourses([...courses, newCourse]);
      setCurrentCourse({ name: '', credits: 0 });
    }
  };

  const removeCourse = (id: string) => {
    const updatedCourses = courses.filter(course => course.id !== id);
    setCourses(updatedCourses);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (courses.length === 0) {
      setMessage('Please add at least one course');
      setMessageType('error');
      return;
    }

    try {
      await submitRegistration.mutateAsync({
        courses: courses.map(course => ({ name: course.name, credits: course.credits })),
        takesReligion
      });

      setMessage('Course registration submitted successfully!');
      setMessageType('success');

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }

      // Reset form
      setCourses([]);
      setTakesReligion(false);
    } catch {
      setMessage('Failed to submit course registration');
      setMessageType('error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up animation-delay-300">
      <div className="glass-card rounded-3xl p-8 border border-white/20 shadow-glow-lg hover-lift">
        {showHeader && (
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${mode === 'admin'
              ? 'from-purple-500 to-indigo-500'
              : 'from-blue-500 to-cyan-500'
              } rounded-full mb-4 animate-bounce-in shadow-lg`}>
              <span className="text-3xl text-white">
                {mode === 'admin' ? '📊' : '📚'}
              </span>
            </div>
            <h2 className="text-3xl font-bold text-gradient-primary mb-3 animate-slide-in-up text-shadow-lg">
              {title}
            </h2>
            <p className="text-gray-300 text-lg mb-4">
              {description}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Input Section */}
          <div className="bg-black/30 rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-cyan-300 mb-4">Add Course Unit Name</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Enter course unit name (e.g., Math for the Real World)"
                value={currentCourse.name}
                onChange={(e) => setCurrentCourse({ ...currentCourse, name: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Credits"
                min="1"
                max="10"
                value={currentCourse.credits || ''}
                onChange={(e) => setCurrentCourse({ ...currentCourse, credits: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="button"
              onClick={addCourse}
              disabled={!currentCourse.name.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>➕</span>
              Add Course Name
            </button>
          </div>

          {/* Course List Display */}
          {courses.length > 0 && (
            <div className="bg-black/30 rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-cyan-300 mb-4">Your Courses ({courses.length})</h3>
              <div className="space-y-4">
                {courses.map((course: Course, index: number) => (
                  <div key={course.id || `course-${index}`} className="bg-white/10 rounded-lg p-4 border border-white/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="text-white font-semibold text-lg">{course.name}</h4>
                          <p className="text-gray-400 text-sm">{course.credits} credit{course.credits !== 1 ? 's' : ''}</p>
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
                <p className="text-white text-2xl font-bold">{courses.reduce((sum, course) => sum + course.credits, 0)}</p>
              </div>
              <div key="religion-course">
                <p className="text-purple-300 text-sm font-medium">Religion Course</p>
                <p className="text-white text-2xl font-bold">{takesReligion ? '✓ Yes' : '✗ No'}</p>
              </div>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`p-4 rounded-lg text-center ${messageType === 'success'
              ? 'bg-green-600/20 border border-green-400/30 text-green-300'
              : 'bg-red-600/20 border border-red-400/30 text-red-300'
              }`}>
              {message}
            </div>
          )}

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={submitRegistration.isPending}
              className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25"
            >
              {submitRegistration.isPending ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Registering Courses...
                </span>
              ) : (
                'Register Courses'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
