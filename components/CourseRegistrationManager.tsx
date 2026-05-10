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
    <div className="max-w-4xl mx-auto">
      <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg">
        {showHeader && (
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 bg-gradient-to-r ${mode === 'admin'
                ? 'from-purple-500 to-indigo-500'
                : 'from-blue-500 to-cyan-500'
                } rounded-xl flex items-center justify-center shadow-lg`}>
                <span className="text-xl text-white">
                  {mode === 'admin' ? '📊' : '📚'}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-slate-100">{title}</h2>
                <p className="text-slate-400 text-sm">{description}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Course Input Section */}
          <div className="bg-slate-700/50 rounded-xl p-5 border border-slate-600/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-blue-400 text-sm">➕</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-100">Add Course</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2">Course Name</label>
                <input
                  type="text"
                  placeholder="e.g., Math for the Real World"
                  value={currentCourse.name}
                  onChange={(e) => setCurrentCourse({ ...currentCourse, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-600/50 border border-slate-500/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">Credits</label>
                <input
                  type="number"
                  placeholder="1-10"
                  min="1"
                  max="10"
                  value={currentCourse.credits || ''}
                  onChange={(e) => setCurrentCourse({ ...currentCourse, credits: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 bg-slate-600/50 border border-slate-500/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={addCourse}
              disabled={!currentCourse.name.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <span>Add Course</span>
            </button>
          </div>

          {/* Course List Display */}
          {courses.length > 0 && (
            <div className="bg-slate-700/50 rounded-xl p-5 border border-slate-600/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-100">Added Courses ({courses.length})</h3>
                <span className="text-emerald-400 text-sm font-medium">
                  {courses.reduce((sum, course) => sum + course.credits, 0)} credits
                </span>
              </div>
              <div className="space-y-3">
                {courses.map((course: Course, index: number) => (
                  <div key={course.id || `course-${index}`} className="bg-slate-600/50 rounded-lg p-4 border border-slate-500/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-blue-400 text-xs font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="text-slate-100 font-medium">{course.name}</h4>
                        <p className="text-slate-400 text-sm">{course.credits} credit{course.credits !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCourse(course.id)}
                      className="w-8 h-8 bg-red-500/20 hover:bg-red-500/30 rounded-lg flex items-center justify-center text-red-400 transition-colors"
                    >
                      <span className="text-sm">×</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Religion Course Checkbox */}
          <div className="bg-slate-700/50 rounded-xl p-5 border border-slate-600/50">
            <label className="flex items-center gap-4 cursor-pointer">
              <input
                type="checkbox"
                checked={takesReligion}
                onChange={(e) => setTakesReligion(e.target.checked)}
                className="w-5 h-5 accent-purple-600 bg-slate-600/50 border-slate-500/50 rounded focus:ring-2 focus:ring-purple-500/50"
              />
              <div>
                <span className="text-slate-100 font-medium">Include Religion Course</span>
                <p className="text-slate-400 text-sm">Check if you&apos;re enrolled in any religion course this semester</p>
              </div>
            </label>
          </div>

          {/* Credits Summary */}
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl p-5 border border-blue-500/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-slate-400 text-sm">Total Courses</p>
                <p className="text-slate-100 text-2xl font-bold">{courses.length}</p>
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-sm">Total Credits</p>
                <p className="text-blue-400 text-2xl font-bold">{courses.reduce((sum, course) => sum + course.credits, 0)}</p>
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-sm">Religion Course</p>
                <p className="text-purple-400 text-2xl font-bold">{takesReligion ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`rounded-lg p-4 text-center ${messageType === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border border-red-500/30 text-red-300'
              }`}>
              <div className="flex items-center justify-center gap-2">
                <span>{messageType === 'success' ? '✓' : '⚠️'}</span>
                <span className="font-medium">{message}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={submitRegistration.isPending || courses.length === 0}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-blue-500/25"
            >
              {submitRegistration.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Registering...
                </span>
              ) : (
                'Register All Courses'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
