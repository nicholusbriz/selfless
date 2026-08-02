'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, X, Check, BookOpen, AlertCircle, Loader2, Trash2, Edit2 } from 'lucide-react';
import { useCourses, useSubmitCourses, useUpdateCourse, useDeleteCourse } from '@/hooks/useCourses';
import { useAuth } from '@/lib/hooks/useAuth';

interface Course {
  id?: string;
  code: string;
  courseUnit: string;
  credits: number;
}

export default function MyCoursesPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [courseCode, setCourseCode] = useState('');
  const [courseUnit, setCourseUnit] = useState('');
  const [credits, setCredits] = useState(1);
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  
  // User academic settings
  const [showReligionEdit, setShowReligionEdit] = useState(false);
  const [showTuitionEdit, setShowTuitionEdit] = useState(false);
  const [userTakesReligion, setUserTakesReligion] = useState(false);
  const [userTuitionAmount, setUserTuitionAmount] = useState('');
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  // Use hooks
  const { data, isLoading, error } = useCourses();
  const submitMutation = useSubmitCourses();
  const updateMutation = useUpdateCourse();
  const deleteMutation = useDeleteCourse();

  // Fetch user academic settings
  useEffect(() => {
    const fetchAcademicSettings = async () => {
      try {
        const response = await fetch('/api/user/academic-settings');
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched academic settings:', data); // Debug log
          setUserTakesReligion(data.user?.takesReligion ?? false);
          setUserTuitionAmount(data.user?.tuitionAmount !== null && data.user?.tuitionAmount !== undefined 
            ? data.user.tuitionAmount.toString() 
            : '');
        } else {
          console.error('Failed to fetch academic settings:', response.status);
        }
      } catch (error) {
        console.error('Error fetching academic settings:', error);
      }
    };

    fetchAcademicSettings();
  }, []);

  const updateAcademicSettings = async () => {
    setIsUpdatingSettings(true);
    try {
      const response = await fetch('/api/user/academic-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          takesReligion: userTakesReligion,
          tuitionAmount: userTuitionAmount
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Update local state with the saved values from API response
        setUserTakesReligion(data.user?.takesReligion ?? false);
        setUserTuitionAmount(data.user?.tuitionAmount !== null && data.user?.tuitionAmount !== undefined 
          ? data.user.tuitionAmount.toString() 
          : '');
        setShowReligionEdit(false);
        setShowTuitionEdit(false);
      }
    } catch (error) {
      console.error('Error updating academic settings:', error);
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const submittedCourses = data?.courses || [];
  const totalCredits = data?.totalCredits || 0;

  const addCourseToList = () => {
    if (!courseCode || !courseUnit || !credits) {
      alert('Please fill in all fields (course code, course unit name, and credits)');
      return;
    }

    const newCourse: Course = {
      code: courseCode.toUpperCase().trim(),
      courseUnit: courseUnit.trim(),
      credits: credits
    };

    setCoursesList([...coursesList, newCourse]);
    
    // Clear form for next entry
    setCourseCode('');
    setCourseUnit('');
    setCredits(3);
  };

  const removeCourseFromList = (index: number) => {
    setCoursesList(coursesList.filter((_, i) => i !== index));
  };

  const clearCourseList = () => {
    setCoursesList([]);
    setCourseCode('');
    setCourseUnit('');
    setCredits(3);
  };

  const handleSubmit = async () => {
    if (coursesList.length === 0) {
      alert('Please add at least one course before submitting');
      return;
    }

    // Validate that all fields are filled
    for (const course of coursesList) {
      if (!course.code || !course.courseUnit || !course.credits) {
        alert('All fields (course code, course unit name, and credits) are required for each course');
        return;
      }
    }

    try {
      await submitMutation.mutateAsync({
        courses: coursesList,
        tuitionAmount: ''
      });
      setShowForm(false);
      clearCourseList();
    } catch (error) {
      console.error('Failed to submit courses:', error);
    }
  };

  const handleEdit = (course: any) => {
    setEditingCourse({
      id: course.id,
      code: course.code,
      courseUnit: course.courseUnit,
      credits: course.credits
    });
    setShowEditForm(true);
  };

  const handleUpdate = async () => {
    if (!editingCourse?.id) return;

    try {
      await updateMutation.mutateAsync({
        courseId: editingCourse.id,
        data: {
          code: editingCourse.code.trim(),
          courseUnit: editingCourse.courseUnit.trim(),
          credits: editingCourse.credits
        }
      });
      setShowEditForm(false);
      setEditingCourse(null);
    } catch (error) {
      console.error('Failed to update course:', error);
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    
    try {
      await deleteMutation.mutateAsync(courseId);
    } catch (error) {
      console.error('Failed to delete course:', error);
    }
  };

  const calculateTotalCredits = () => {
    return coursesList.reduce((sum, course) => sum + (course.credits || 0), 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 bg-[#0D1117]">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#150F20] border border-[#2A2438] rounded-xl p-6 h-24" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D1117]">
        <div className="text-center">
          <p className="text-[#FB7185]">Failed to load courses</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1117]">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 p-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-[#2A2438]/50 hover:bg-[#2A2438] text-[#A79C8C] hover:text-[#F5F0E8] transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => router.push('/dashboard/students')}
          className="p-2 rounded-lg bg-[#2A2438]/50 hover:bg-[#2A2438] text-[#A79C8C] hover:text-[#F5F0E8] transition-all duration-200"
        >
          <BookOpen className="w-5 h-5" />
        </button>
        
        <div className="h-8 w-px bg-[#2A2438]" />
        
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#E8A33D]/10 border border-[#E8A33D]/20">
            <BookOpen className="w-6 h-6 text-[#E8A33D]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#F5F0E8]" style={{ fontFamily: 'var(--font-display)' }}>
              My Courses
            </h1>
            <p className="text-sm text-[#A79C8C]">{totalCredits} total credits</p>
          </div>
        </div>
      </div>

      {/* User Academic Settings */}
      <div className="px-6 mb-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Religion Status */}
          <div className="bg-[#150F20] border border-[#2A2438] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-[#F5F0E8]">Religion Status</h3>
              <button
                onClick={() => setShowReligionEdit(!showReligionEdit)}
                className="p-1.5 rounded-lg bg-[#2A2438]/50 hover:bg-[#E8A33D]/20 text-[#A79C8C] hover:text-[#E8A33D] transition-all"
              >
                {showReligionEdit ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
              </button>
            </div>
            
            {showReligionEdit ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setUserTakesReligion(true)}
                    className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                      userTakesReligion 
                        ? 'bg-[#14B8A6]/20 border border-[#14B8A6]/30 text-[#14B8A6]' 
                        : 'bg-[#2A2438]/50 border border-[#2A2438] text-[#A79C8C]'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setUserTakesReligion(false)}
                    className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                      !userTakesReligion 
                        ? 'bg-[#FB7185]/20 border border-[#FB7185]/30 text-[#FB7185]' 
                        : 'bg-[#2A2438]/50 border border-[#2A2438] text-[#A79C8C]'
                    }`}
                  >
                    No
                  </button>
                </div>
                <button
                  onClick={updateAcademicSettings}
                  disabled={isUpdatingSettings}
                  className="w-full px-4 py-2 bg-[#E8A33D]/50 border border-[#E8A33D]/30 text-[#E8A33D] rounded-lg hover:bg-[#E8A33D] transition-all disabled:opacity-50"
                >
                  {isUpdatingSettings ? 'Saving...' : 'Save'}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  userTakesReligion 
                    ? 'bg-[#14B8A6]/20 border border-[#14B8A6]/30 text-[#14B8A6]' 
                    : 'bg-[#FB7185]/20 border border-[#FB7185]/30 text-[#FB7185]'
                }`}>
                  {userTakesReligion ? 'Yes' : 'No'}
                </span>
                <span className="text-sm text-[#A79C8C]">Takes religion</span>
              </div>
            )}
          </div>

          {/* Tuition Amount */}
          <div className="bg-[#150F20] border border-[#2A2438] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-[#F5F0E8]">Tuition Amount (USD)</h3>
              <button
                onClick={() => setShowTuitionEdit(!showTuitionEdit)}
                className="p-1.5 rounded-lg bg-[#2A2438]/50 hover:bg-[#E8A33D]/20 text-[#A79C8C] hover:text-[#E8A33D] transition-all"
              >
                {showTuitionEdit ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
              </button>
            </div>
            
            {showTuitionEdit ? (
              <div className="space-y-3">
                <input
                  type="number"
                  value={userTuitionAmount}
                  onChange={(e) => setUserTuitionAmount(e.target.value)}
                  placeholder="Enter tuition amount in USD (enter 0 if not demanded)"
                  className="w-full px-4 py-2 bg-[#0B0912]/60 border border-[#2A2438] rounded-lg text-[#F5F0E8] placeholder-[#6B6358] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-all"
                  min="0"
                  step="0.01"
                />
                <button
                  onClick={updateAcademicSettings}
                  disabled={isUpdatingSettings}
                  className="w-full px-4 py-2 bg-[#E8A33D]/50 border border-[#E8A33D]/30 text-[#E8A33D] rounded-lg hover:bg-[#E8A33D] transition-all disabled:opacity-50"
                >
                  {isUpdatingSettings ? 'Saving...' : 'Save'}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {userTuitionAmount !== '' && userTuitionAmount !== null ? (
                  <>
                    <span className="text-lg font-bold text-[#E8A33D]">
                      ${parseFloat(userTuitionAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-sm text-[#A79C8C]">USD</span>
                  </>
                ) : (
                  <span className="text-sm text-[#6B6358]">Not set</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-8">
        {/* Submit Button */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] text-[#0B0912] rounded-xl p-4 font-medium hover:shadow-lg hover:shadow-[#E8A33D]/30 transition-all flex items-center justify-center gap-2 mb-8"
        >
          <Plus className="w-5 h-5" />
          Submit Courses
        </button>

        {/* Course Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-[#150F20] border border-[#2A2438] rounded-xl p-6 mb-8"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-[#F5F0E8] mb-2">Submit Course Units</h3>
                <div className="bg-[#FB7185]/10 border border-[#FB7185]/30 rounded-lg p-3 flex items-start gap-3 mb-3">
                  <AlertCircle className="w-5 h-5 text-[#FB7185] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[#FB7185]">
                    <strong>Important:</strong> This form is specifically for core course units. Enter one course unit at a time, then submit when you have entered all the course units you are taking. Religion status is managed separately in your academic settings above.
                  </p>
                </div>
                <div className="bg-[#14B8A6]/10 border border-[#14B8A6]/30 rounded-lg p-3 flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#14B8A6] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[#14B8A6]">
                    <strong>Auto-formatting:</strong> Course codes are automatically converted to uppercase (e.g., "wdd230" → "WDD230") and course unit names are automatically formatted with each word capitalized (e.g., "introduction to cs" → "Introduction To CS").
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Single Course Entry Form */}
                <div className="bg-[#0B0912]/60 border border-[#2A2438] rounded-xl p-4 space-y-3">
                  <h4 className="text-sm font-medium text-[#F5F0E8]">Add Course Unit</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm text-[#A79C8C] mb-2">Course Code <span className="text-[#FB7185]">*</span></label>
                      <input
                        type="text"
                        value={courseCode}
                        onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                        className="w-full px-4 py-3 bg-[#0B0912]/60 border border-[#2A2438] rounded-xl text-[#F5F0E8] placeholder-[#6B6358] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-all"
                        placeholder="e.g., WDD230"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#A79C8C] mb-2">Course Unit Name <span className="text-[#FB7185]">*</span></label>
                      <input
                        type="text"
                        value={courseUnit}
                        onChange={(e) => {
                          const words = e.target.value.split(' ');
                          const titleCase = words.map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                          ).join(' ');
                          setCourseUnit(titleCase);
                        }}
                        className="w-full px-4 py-3 bg-[#0B0912]/60 border border-[#2A2438] rounded-xl text-[#F5F0E8] placeholder-[#6B6358] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-all"
                        placeholder="e.g., Introduction To CS"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#A79C8C] mb-2">Credits <span className="text-[#FB7185]">*</span></label>
                      <input
                        type="number"
                        value={credits}
                        onChange={(e) => setCredits(parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 bg-[#0B0912]/60 border border-[#2A2438] rounded-xl text-[#F5F0E8] placeholder-[#6B6358] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-all"
                        placeholder="e.g., 3"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <button
                    onClick={addCourseToList}
                    className="w-full px-4 py-3 bg-[#E8A33D]/50 border border-[#E8A33D]/30 text-[#E8A33D] rounded-xl hover:bg-[#E8A33D] transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add to List
                  </button>
                </div>

                {/* Course List */}
                {coursesList.length > 0 && (
                  <div className="bg-[#0B0912]/60 border border-[#2A2438] rounded-xl p-4 space-y-3">
                    <h4 className="text-sm font-medium text-[#F5F0E8] mb-3">Course Units to Submit ({coursesList.length})</h4>
                    {coursesList.map((course, index) => (
                      <div key={index} className="bg-[#1A1525] border border-[#2A2438] rounded-lg p-3 flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-1 bg-[#E8A33D]/20 border border-[#E8A33D]/30 rounded-full text-xs text-[#E8A33D]">
                              {course.code}
                            </span>
                            <span className="text-sm text-[#F5F0E8]">{course.courseUnit}</span>
                            <span className="text-sm text-[#A79C8C]">•</span>
                            <span className="text-sm text-[#E8A33D]">{course.credits} credits</span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeCourseFromList(index)}
                          className="p-1 rounded hover:bg-[#FB7185]/20 text-[#FB7185] transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between bg-[#E8A33D]/10 border border-[#E8A33D]/30 rounded-lg p-3">
                  <span className="text-sm text-[#F5F0E8]">Total Credits for this submission:</span>
                  <span className="text-lg font-bold text-[#E8A33D]">{calculateTotalCredits()}</span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSubmit}
                    disabled={submitMutation.isPending || coursesList.length === 0}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] text-[#0B0912] rounded-xl font-medium hover:shadow-lg hover:shadow-[#E8A33D]/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Submit All Courses'
                    )}
                  </button>
                  <button
                    onClick={clearCourseList}
                    className="px-4 py-3 bg-[#2A2438]/50 border border-[#2A2438] text-[#A79C8C] rounded-xl hover:bg-[#2A2438] transition-all"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-4 py-3 bg-[#2A2438]/50 border border-[#2A2438] text-[#A79C8C] rounded-xl hover:bg-[#2A2438] transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Form */}
        <AnimatePresence>
          {showEditForm && editingCourse && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-[#150F20] border border-[#2A2438] rounded-xl p-6 mb-8"
            >
              <h3 className="text-lg font-semibold text-[#F5F0E8] mb-4">Edit Course</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm text-[#A79C8C] mb-2">Course Code <span className="text-[#FB7185]">*</span></label>
                    <input
                      type="text"
                      value={editingCourse.code}
                      onChange={(e) => setEditingCourse({ ...editingCourse, code: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-3 bg-[#0B0912]/60 border border-[#2A2438] rounded-xl text-[#F5F0E8] placeholder-[#6B6358] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-all"
                      placeholder="e.g., WDD230"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#A79C8C] mb-2">Course Unit Name <span className="text-[#FB7185]">*</span></label>
                    <input
                      type="text"
                      value={editingCourse.courseUnit}
                      onChange={(e) => {
                        const words = e.target.value.split(' ');
                        const titleCase = words.map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                        ).join(' ');
                        setEditingCourse({ ...editingCourse, courseUnit: titleCase });
                      }}
                      className="w-full px-4 py-3 bg-[#0B0912]/60 border border-[#2A2438] rounded-xl text-[#F5F0E8] placeholder-[#6B6358] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-all"
                      placeholder="e.g., Introduction To CS"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#A79C8C] mb-2">Credits <span className="text-[#FB7185]">*</span></label>
                    <input
                      type="number"
                      value={editingCourse.credits}
                      onChange={(e) => setEditingCourse({ ...editingCourse, credits: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-[#0B0912]/60 border border-[#2A2438] rounded-xl text-[#F5F0E8] placeholder-[#6B6358] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-all"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleUpdate}
                    disabled={updateMutation.isPending}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] text-[#0B0912] rounded-xl font-medium hover:shadow-lg hover:shadow-[#E8A33D]/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Update Course'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingCourse(null);
                    }}
                    className="px-4 py-3 bg-[#2A2438]/50 border border-[#2A2438] text-[#A79C8C] rounded-xl hover:bg-[#2A2438] transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submitted Courses */}
        {submittedCourses.length === 0 ? (
          <div className="bg-[#150F20] border border-[#2A2438] rounded-xl p-8 text-center">
            <BookOpen className="w-12 h-12 text-[#A79C8C] mx-auto mb-3" />
            <p className="text-[#A79C8C]">No courses submitted yet</p>
            <p className="text-sm text-[#6B6358] mt-1">Click "Submit Courses" to add your course units</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#F5F0E8] mb-4">Your Submitted Courses</h3>
            {submittedCourses.map((course: any) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#150F20] border border-[#2A2438] rounded-xl p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-1 bg-[#E8A33D]/20 border border-[#E8A33D]/30 rounded-full text-xs text-[#E8A33D]">
                        {course.code}
                      </span>
                      <h4 className="text-lg font-semibold text-[#F5F0E8]">{course.courseUnit}</h4>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[#A79C8C]">
                      <span>{course.credits} credits</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 text-[#14B8A6] mr-4">
                      <Check className="w-5 h-5" />
                      <span className="text-sm font-medium">Submitted</span>
                    </div>
                    <button
                      onClick={() => handleEdit(course)}
                      className="p-2 rounded hover:bg-[#E8A33D]/20 text-[#E8A33D] transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      disabled={deleteMutation.isPending}
                      className="p-2 rounded hover:bg-[#FB7185]/20 text-[#FB7185] transition-colors disabled:opacity-50"
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}