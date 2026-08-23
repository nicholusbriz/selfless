'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Plus,
  X,
  Check,
  BookOpen,
  AlertCircle,
  Loader2,
  Trash2,
  User,
} from 'lucide-react';
import {
  useCourses,
  useSubmitCourses,
  useUpdateCourse,
  useDeleteCourse,
} from '@/hooks/useCourses';
import { useAuth } from '@/lib/hooks/useAuth';

interface Course {
  id?: string;
  code: string;
  courseUnit: string;
  credits: number;
}

interface SubmittedCourse {
  id: string;
  code: string;
  courseUnit: string;
  credits: number;
}

export default function MyCoursesPage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const [courseCode, setCourseCode] = useState('');
  const [courseUnit, setCourseUnit] = useState('');
  const [credits, setCredits] = useState(3);
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // User academic settings
  const [showReligionEdit, setShowReligionEdit] = useState(false);
  const [showTuitionEdit, setShowTuitionEdit] = useState(false);
  const [userTakesReligion, setUserTakesReligion] = useState(false);
  const [userTuitionAmount, setUserTuitionAmount] = useState('');
  const [userGeneralCourse, setUserGeneralCourse] = useState('');
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [showGeneralCourseEdit, setShowGeneralCourseEdit] = useState(false);

  const hasGeneralCourse =
    userGeneralCourse.trim() !== '' ||
    Boolean(user?.generalCourse?.trim());

  // Course hooks
  const { data, isLoading, error } = useCourses();
  const submitMutation = useSubmitCourses();
  const updateMutation = useUpdateCourse();
  const deleteMutation = useDeleteCourse();

  /*
   * Fetch academic settings.
   *
   * The previous implementation also called setUserGeneralCourse()
   * synchronously inside this effect whenever user?.generalCourse changed.
   * That triggered react-hooks/set-state-in-effect.
   *
   * General course is now initialized from user data and synchronized
   * only when the user opens the General Course editor.
   */
  useEffect(() => {
    const fetchAcademicSettings = async () => {
      try {
        const response = await fetch('/api/user/academic-settings');

        if (response.ok) {
          const settingsData = await response.json();

          setUserTakesReligion(
            settingsData.user?.takesReligion ?? false
          );

          setUserTuitionAmount(
            settingsData.user?.tuitionAmount !== null &&
              settingsData.user?.tuitionAmount !== undefined
              ? settingsData.user.tuitionAmount.toString()
              : ''
          );
        } else {
          console.error(
            'Failed to fetch academic settings:',
            response.status
          );
        }
      } catch (error) {
        console.error('Error fetching academic settings:', error);
      }
    };

    fetchAcademicSettings();
  }, []);

  /*
   * Keep local general-course input synchronized when user data
   * becomes available, without using a state-setting effect.
   *
   * The input is also reset to the saved value when the editor opens.
   */
  const getCurrentGeneralCourse = () =>
    user?.generalCourse?.trim() || userGeneralCourse.trim();

  const updateAcademicSettings = async () => {
    setIsUpdatingSettings(true);

    try {
      const response = await fetch('/api/user/academic-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          takesReligion: userTakesReligion,
          tuitionAmount: userTuitionAmount,
        }),
      });

      if (response.ok) {
        const settingsData = await response.json();

        setUserTakesReligion(
          settingsData.user?.takesReligion ?? false
        );

        setUserTuitionAmount(
          settingsData.user?.tuitionAmount !== null &&
            settingsData.user?.tuitionAmount !== undefined
            ? settingsData.user.tuitionAmount.toString()
            : ''
        );

        setShowReligionEdit(false);
        setShowTuitionEdit(false);
      }
    } catch (error) {
      console.error('Error updating academic settings:', error);
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const updateGeneralCourse = async () => {
    const trimmedCourse = userGeneralCourse.trim();

    if (!trimmedCourse) return;

    setIsUpdatingSettings(true);
    setSaveSuccess(false);

    try {
      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          generalCourse: trimmedCourse,
        }),
      });

      if (response.ok) {
        if (user && updateUser) {
          await updateUser({
            generalCourse: trimmedCourse,
          });
        }

        setUserGeneralCourse(trimmedCourse);
        setSaveSuccess(true);
        setShowGeneralCourseEdit(false);

        setTimeout(() => {
          setSaveSuccess(false);
        }, 1500);
      } else {
        const errorData = await response.json();
        alert(
          errorData.error || 'Failed to update general course'
        );
      }
    } catch (error) {
      console.error('Error updating general course:', error);
      alert('Failed to update general course');
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const submittedCourses: SubmittedCourse[] = data?.courses || [];
  const totalCredits = data?.totalCredits || 0;

  const addCourseToList = () => {
    if (!courseCode || !courseUnit || !credits) {
      alert(
        'Please fill in all fields (course code, course unit name, and credits)'
      );
      return;
    }

    const newCourse: Course = {
      code: courseCode.toUpperCase().trim(),
      courseUnit: courseUnit.trim(),
      credits,
    };

    setCoursesList((previousCourses) => [
      ...previousCourses,
      newCourse,
    ]);

    setCourseCode('');
    setCourseUnit('');
    setCredits(3);
  };

  const removeCourseFromList = (index: number) => {
    setCoursesList((previousCourses) =>
      previousCourses.filter((_, i) => i !== index)
    );
  };

  const clearCourseList = () => {
    setCoursesList([]);
    setCourseCode('');
    setCourseUnit('');
    setCredits(3);
  };

  const handleSubmit = async () => {
    if (coursesList.length === 0) {
      alert(
        'Please add at least one course before submitting course units you are doing this block'
      );
      return;
    }

    for (const course of coursesList) {
      if (!course.code || !course.courseUnit || !course.credits) {
        alert(
          'All fields (course code, course unit name, and credits) are required for each course'
        );
        return;
      }
    }

    try {
      await submitMutation.mutateAsync({
        courses: coursesList,
        tuitionAmount: '',
      });

      setShowForm(false);
      clearCourseList();
    } catch (error) {
      console.error('Failed to submit courses:', error);
    }
  };

  const handleEdit = (course: SubmittedCourse) => {
    setEditingCourse({
      id: course.id,
      code: course.code,
      courseUnit: course.courseUnit,
      credits: course.credits,
    });

    setShowEditForm(true);
  };

  const handleUpdate = async () => {
    if (!editingCourse?.id) return;

    if (
      !editingCourse.code.trim() ||
      !editingCourse.courseUnit.trim() ||
      !editingCourse.credits
    ) {
      alert(
        'All fields (course code, course unit name, and credits) are required.'
      );
      return;
    }

    try {
      await updateMutation.mutateAsync({
        courseId: editingCourse.id,
        data: {
          code: editingCourse.code.trim().toUpperCase(),
          courseUnit: editingCourse.courseUnit.trim(),
          credits: editingCourse.credits,
        },
      });

      setShowEditForm(false);
      setEditingCourse(null);
    } catch (error) {
      console.error('Failed to update course:', error);
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(courseId);
    } catch (error) {
      console.error('Failed to delete course:', error);
    }
  };

  const calculateTotalCredits = () => {
    return coursesList.reduce(
      (sum, course) => sum + (course.credits || 0),
      0
    );
  };

  /*
   * General Course editor.
   *
   * Instead of setting state inside useEffect, the input is populated
   * when the user explicitly opens the editor.
   */
  const toggleGeneralCourseEdit = () => {
    if (!showGeneralCourseEdit) {
      setUserGeneralCourse(getCurrentGeneralCourse());
    }

    setShowGeneralCourseEdit((previous) => !previous);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D1117] p-6">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-24 rounded-xl border border-[#2A2438] bg-[#150F20]"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0D1117]">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-[#FB7185]" />
          <p className="text-[#FB7185]">
            Failed to load courses
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#F5F0E8]">
      {/* Header */}
      <div className="border-b border-[#2A2438] bg-[#0D1117]">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-5 sm:px-6">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="rounded-lg border border-[#2A2438] bg-[#150F20] px-3 py-2 text-sm text-[#A79C8C] transition-colors hover:border-[#E8A33D]/40 hover:bg-[#1A1525] hover:text-[#E8A33D]"
          >
            Back
          </button>

          <Link
            href="/dashboard/students"
            className="rounded-lg border border-[#2A2438] bg-[#150F20] px-3 py-2 text-sm text-[#A79C8C] transition-colors hover:border-[#E8A33D]/40 hover:bg-[#1A1525] hover:text-[#E8A33D]"
          >
            Students
          </Link>

          <Link
            href="/dashboard/cleaning"
            className="rounded-lg border border-[#2A2438] bg-[#150F20] px-3 py-2 text-sm text-[#A79C8C] transition-colors hover:border-[#E8A33D]/40 hover:bg-[#1A1525] hover:text-[#E8A33D]"
          >
            Cleaning
          </Link>

          <div className="h-8 w-px bg-[#2A2438]" />

          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-[#E8A33D]/20 bg-[#E8A33D]/10 p-2.5">
              <BookOpen className="h-5 w-5 text-[#E8A33D]" />
            </div>

            <div>
              <h1
                className="text-xl font-bold text-[#F5F0E8] sm:text-2xl"
                style={{
                  fontFamily: 'var(--font-display)',
                }}
              >
                My Courses
              </h1>

              <p className="text-sm text-[#A79C8C]">
                {totalCredits} total credits
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Completion Banner */}
      {(!user?.profileImageUrl || !user?.generalCourse || !user?.phoneNumber) && (
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-4 rounded-xl border border-[#E8A33D]/30 bg-[#E8A33D]/5 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8A33D]/20">
                <User className="h-5 w-5 text-[#E8A33D]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#E8A33D]">
                  Complete Your Profile
                </p>
                <p className="text-xs text-[#A79C8C]">
                  {!user?.profileImageUrl && 'Add profile photo. '}
                  {!user?.generalCourse && 'Set your general course. '}
                  {!user?.phoneNumber && 'Add your phone number.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard/profile')}
              className="rounded-lg bg-[#E8A33D] px-4 py-2 text-sm font-semibold text-[#0B0912] transition-colors hover:bg-[#D9952F]"
            >
              Finish Setting Profile
            </button>
          </motion.div>
        </div>
      )}

      {/* Academic Settings */}
      <div className="px-4 py-6 sm:px-6">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
          {/* Religion Status */}
          <div className="rounded-xl border border-[#2A2438] bg-[#150F20] p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-[#F5F0E8]">
                  Religion Status
                </h3>

                <p className="mt-1 text-sm text-[#A79C8C]">
                  Academic religion requirement
                </p>
              </div>

              <button
                onClick={() =>
                  setShowReligionEdit((previous) => !previous)
                }
                disabled={isUpdatingSettings}
                className="rounded-lg border border-[#2A2438] bg-[#1A1525] px-3 py-1.5 text-sm font-medium text-[#A79C8C] transition-colors hover:border-[#E8A33D]/40 hover:bg-[#E8A33D]/10 hover:text-[#E8A33D] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {showReligionEdit ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {showReligionEdit ? (
              <div className="space-y-3">
                <div className="flex gap-3">
                  <button
                    onClick={() => setUserTakesReligion(true)}
                    className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                      userTakesReligion
                        ? 'border-[#14B8A6]/40 bg-[#14B8A6]/10 text-[#14B8A6]'
                        : 'border-[#2A2438] bg-[#1A1525] text-[#A79C8C] hover:border-[#14B8A6]/30'
                    }`}
                  >
                    Yes
                  </button>

                  <button
                    onClick={() => setUserTakesReligion(false)}
                    className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                      !userTakesReligion
                        ? 'border-[#FB7185]/40 bg-[#FB7185]/10 text-[#FB7185]'
                        : 'border-[#2A2438] bg-[#1A1525] text-[#A79C8C] hover:border-[#FB7185]/30'
                    }`}
                  >
                    No
                  </button>
                </div>

                <button
                  onClick={updateAcademicSettings}
                  disabled={isUpdatingSettings}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#E8A33D] px-4 py-2.5 text-sm font-semibold text-[#0B0912] transition-colors hover:bg-[#D9952F] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUpdatingSettings ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Save
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full border px-3 py-1 text-sm font-medium ${
                    userTakesReligion
                      ? 'border-[#14B8A6]/30 bg-[#14B8A6]/10 text-[#14B8A6]'
                      : 'border-[#FB7185]/30 bg-[#FB7185]/10 text-[#FB7185]'
                  }`}
                >
                  {userTakesReligion ? 'Yes' : 'No'}
                </span>

                <span className="text-sm text-[#A79C8C]">
                  Takes religion
                </span>
              </div>
            )}
          </div>

          {/* Tuition Amount */}
          <div className="rounded-xl border border-[#2A2438] bg-[#150F20] p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-[#F5F0E8]">
                  Tuition Amount
                </h3>

                <p className="mt-1 text-sm text-[#A79C8C]">
                  Amount in USD
                </p>
              </div>

              <button
                onClick={() =>
                  setShowTuitionEdit((previous) => !previous)
                }
                disabled={isUpdatingSettings}
                className="rounded-lg border border-[#2A2438] bg-[#1A1525] px-3 py-1.5 text-sm font-medium text-[#A79C8C] transition-colors hover:border-[#E8A33D]/40 hover:bg-[#E8A33D]/10 hover:text-[#E8A33D] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {showTuitionEdit ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {showTuitionEdit ? (
              <div className="space-y-3">
                <input
                  type="number"
                  value={userTuitionAmount}
                  onChange={(e) =>
                    setUserTuitionAmount(e.target.value)
                  }
                  placeholder="Enter tuition amount in USD"
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-[#2A2438] bg-[#0B0912] px-4 py-2.5 text-sm text-[#F5F0E8] placeholder-[#6B6358] outline-none transition-colors focus:border-[#E8A33D]/50 focus:ring-2 focus:ring-[#E8A33D]/10"
                />

                <button
                  onClick={updateAcademicSettings}
                  disabled={isUpdatingSettings}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#E8A33D] px-4 py-2.5 text-sm font-semibold text-[#0B0912] transition-colors hover:bg-[#D9952F] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUpdatingSettings ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Save
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-baseline gap-2">
                {userTuitionAmount !== '' ? (
                  <>
                    <span className="text-xl font-bold text-[#E8A33D]">
                      $
                      {parseFloat(userTuitionAmount).toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </span>

                    <span className="text-sm text-[#A79C8C]">
                      USD
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-[#6B6358]">
                    Not set
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 pb-10 sm:px-6">
        {/* General Course */}
        <div
          className={`mb-6 rounded-xl border bg-[#150F20] p-5 transition-colors ${
            isUpdatingSettings
              ? 'border-[#E8A33D]/40'
              : 'border-[#2A2438]'
          }`}
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg border border-[#E8A33D]/20 bg-[#E8A33D]/10 p-2">
                <BookOpen className="h-5 w-5 text-[#E8A33D]" />
              </div>

              <div>
                <h3 className="text-base font-semibold text-[#F5F0E8]">
                  General Degree Course
                </h3>

                <p className="mt-1 text-sm text-[#A79C8C]">
                  Your main academic programme
                </p>
              </div>
            </div>

            <button
              onClick={toggleGeneralCourseEdit}
              disabled={isUpdatingSettings}
              className="rounded-lg border border-[#2A2438] bg-[#1A1525] px-3 py-1.5 text-sm font-medium text-[#A79C8C] transition-colors hover:border-[#E8A33D]/40 hover:bg-[#E8A33D]/10 hover:text-[#E8A33D] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {showGeneralCourseEdit ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {/* Current General Course */}
          <div className="mb-4">
            {hasGeneralCourse ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-semibold text-[#14B8A6]">
                  {user?.generalCourse || userGeneralCourse}
                </span>

                <span className="text-sm text-[#A79C8C]">
                  Your General  Degree course
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-[#FB7185]">
                  Not set
                </span>

                <span className="text-sm text-[#6B6358]">
                  Click Edit to set your general  Degree course
                </span>
              </div>
            )}
          </div>

          {showGeneralCourseEdit && (
            <div className="space-y-3">
              <input
                type="text"
                value={userGeneralCourse}
                onChange={(e) =>
                  setUserGeneralCourse(e.target.value)
                }
                placeholder="e.g., Software Engineering"
                disabled={isUpdatingSettings}
                className="w-full rounded-lg border border-[#2A2438] bg-[#0B0912] px-4 py-3 text-sm text-[#F5F0E8] placeholder-[#6B6358] outline-none transition-colors focus:border-[#E8A33D]/50 focus:ring-2 focus:ring-[#E8A33D]/10 disabled:cursor-not-allowed disabled:opacity-50"
              />

              <button
                onClick={updateGeneralCourse}
                disabled={
                  isUpdatingSettings ||
                  !userGeneralCourse.trim()
                }
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#E8A33D] px-4 py-3 text-sm font-semibold text-[#0B0912] transition-colors hover:bg-[#D9952F] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUpdatingSettings ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Update General Degree Course
                  </>
                )}
              </button>

              {saveSuccess && (
                <div className="flex items-center gap-2 text-sm text-[#14B8A6]">
                  <Check className="h-4 w-4" />
                  General  Degree course saved successfully.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add Courses Button
            This is intentionally the ONLY button shown when
            the course form is closed. */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            disabled={isUpdatingSettings}
            className="mb-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#E8A33D] px-5 py-4 text-base font-semibold text-[#0B0912] transition-colors hover:bg-[#D9952F] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-5 w-5" />
            Add Courses
          </button>
        )}

        {/* Course Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{
                opacity: 0,
                y: -12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -12,
              }}
              className="mb-8 rounded-xl border border-[#2A2438] bg-[#150F20] p-5 sm:p-6"
            >
              <div className="mb-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#F5F0E8]">
                      Add Course Units
                    </h3>

                    <p className="mt-1 text-sm text-[#A79C8C]">
                      Add all the core course units you are taking.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setShowForm(false);
                      clearCourseList();
                    }}
                    className="rounded-lg border border-[#2A2438] bg-[#1A1525] p-2 text-[#A79C8C] transition-colors hover:border-[#FB7185]/40 hover:text-[#FB7185]"
                    aria-label="Close course form"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-4 flex items-start gap-3 rounded-lg border border-[#FB7185]/30 bg-[#FB7185]/10 p-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#FB7185]" />

                  <p className="text-sm leading-6 text-[#FB7185]">
                    <strong>Important:</strong> This form is
                    specifically for core course units. Add one
                    course unit at a time, then submit when you
                    have entered all the course units you are
                    taking. Religion status is managed separately
                    above.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Add Individual Course */}
                <div className="rounded-xl border border-[#2A2438] bg-[#0B0912] p-4 sm:p-5">
                  <h4 className="mb-4 text-sm font-semibold text-[#F5F0E8]">
                    Course Unit Details
                  </h4>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#A79C8C]">
                        Course Code{' '}
                        <span className="text-[#FB7185]">*</span>
                      </label>

                      <input
                        type="text"
                        value={courseCode}
                        onChange={(e) =>
                          setCourseCode(
                            e.target.value.toUpperCase()
                          )
                        }
                        className="w-full rounded-lg border border-[#2A2438] bg-[#150F20] px-4 py-3 text-sm text-[#F5F0E8] placeholder-[#6B6358] outline-none transition-colors focus:border-[#E8A33D]/50 focus:ring-2 focus:ring-[#E8A33D]/10"
                        placeholder="e.g. WDD230"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#A79C8C]">
                        Course Unit Name{' '}
                        <span className="text-[#FB7185]">*</span>
                      </label>

                      <input
                        type="text"
                        value={courseUnit}
                        onChange={(e) => {
                          const words =
                            e.target.value.split(' ');

                          const titleCase = words
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() +
                                word.slice(1).toLowerCase()
                            )
                            .join(' ');

                          setCourseUnit(titleCase);
                        }}
                        className="w-full rounded-lg border border-[#2A2438] bg-[#150F20] px-4 py-3 text-sm text-[#F5F0E8] placeholder-[#6B6358] outline-none transition-colors focus:border-[#E8A33D]/50 focus:ring-2 focus:ring-[#E8A33D]/10"
                        placeholder="e.g. Introduction To CS"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#A79C8C]">
                        Credits{' '}
                        <span className="text-[#FB7185]">*</span>
                      </label>

                      <input
                        type="number"
                        value={credits}
                        onChange={(e) =>
                          setCredits(
                            parseInt(e.target.value, 10) || 0
                          )
                        }
                        className="w-full rounded-lg border border-[#2A2438] bg-[#150F20] px-4 py-3 text-sm text-[#F5F0E8] placeholder-[#6B6358] outline-none transition-colors focus:border-[#E8A33D]/50 focus:ring-2 focus:ring-[#E8A33D]/10"
                        placeholder="e.g. 3"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <button
                    onClick={addCourseToList}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-[#E8A33D]/40 bg-[#E8A33D]/10 px-4 py-3 text-sm font-semibold text-[#E8A33D] transition-colors hover:bg-[#E8A33D] hover:text-[#0B0912]"
                  >
                    <Plus className="h-4 w-4" />
                    Add to List
                  </button>
                </div>

                {/* Course List */}
                {coursesList.length > 0 && (
                  <div className="rounded-xl border border-[#2A2438] bg-[#0B0912] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-[#F5F0E8]">
                        Course Units to Submit
                      </h4>

                      <span className="rounded-full bg-[#E8A33D]/10 px-2.5 py-1 text-xs font-medium text-[#E8A33D]">
                        {coursesList.length}{' '}
                        {coursesList.length === 1
                          ? 'course'
                          : 'courses'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {coursesList.map((course, index) => (
                        <div
                          key={`${course.code}-${index}`}
                          className="flex items-center justify-between gap-3 rounded-lg border border-[#2A2438] bg-[#150F20] p-3"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-md border border-[#E8A33D]/30 bg-[#E8A33D]/10 px-2 py-1 text-xs font-semibold text-[#E8A33D]">
                                {course.code}
                              </span>

                              <span className="text-sm font-medium text-[#F5F0E8]">
                                {course.courseUnit}
                              </span>
                            </div>

                            <p className="mt-1 text-xs text-[#A79C8C]">
                              {course.credits} credits
                            </p>
                          </div>

                          <button
                            onClick={() =>
                              removeCourseFromList(index)
                            }
                            className="rounded-lg p-2 text-[#FB7185] transition-colors hover:bg-[#FB7185]/10"
                            aria-label={`Remove ${course.code}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submission Total */}
                <div className="flex items-center justify-between rounded-lg border border-[#E8A33D]/30 bg-[#E8A33D]/10 p-4">
                  <span className="text-sm font-medium text-[#F5F0E8]">
                    Total Credits for This Submission
                  </span>

                  <span className="text-xl font-bold text-[#E8A33D]">
                    {calculateTotalCredits()}
                  </span>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={handleSubmit}
                    disabled={
                      submitMutation.isPending ||
                      coursesList.length === 0
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#E8A33D] px-4 py-3 text-sm font-semibold text-[#0B0912] transition-colors hover:bg-[#D9952F] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Submit All Courses
                      </>
                    )}
                  </button>

                  <button
                    onClick={clearCourseList}
                    className="rounded-lg border border-[#2A2438] bg-[#1A1525] px-5 py-3 text-sm font-medium text-[#A79C8C] transition-colors hover:bg-[#2A2438] hover:text-[#F5F0E8]"
                  >
                    Clear
                  </button>

                  <button
                    onClick={() => {
                      setShowForm(false);
                      clearCourseList();
                    }}
                    className="rounded-lg border border-[#2A2438] bg-[#1A1525] px-5 py-3 text-sm font-medium text-[#A79C8C] transition-colors hover:border-[#FB7185]/40 hover:text-[#FB7185]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Course Form */}
        <AnimatePresence>
          {showEditForm && editingCourse && (
            <motion.div
              initial={{
                opacity: 0,
                y: -12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -12,
              }}
              className="mb-8 rounded-xl border border-[#2A2438] bg-[#150F20] p-5 sm:p-6"
            >
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#F5F0E8]">
                    Edit Course
                  </h3>

                  <p className="mt-1 text-sm text-[#A79C8C]">
                    Update the course information below.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingCourse(null);
                  }}
                  className="rounded-lg border border-[#2A2438] bg-[#1A1525] p-2 text-[#A79C8C] transition-colors hover:border-[#FB7185]/40 hover:text-[#FB7185]"
                  aria-label="Close edit form"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#A79C8C]">
                    Course Code{' '}
                    <span className="text-[#FB7185]">*</span>
                  </label>

                  <input
                    type="text"
                    value={editingCourse.code}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full rounded-lg border border-[#2A2438] bg-[#0B0912] px-4 py-3 text-sm text-[#F5F0E8] outline-none transition-colors focus:border-[#E8A33D]/50 focus:ring-2 focus:ring-[#E8A33D]/10"
                    placeholder="e.g. WDD230"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#A79C8C]">
                    Course Unit Name{' '}
                    <span className="text-[#FB7185]">*</span>
                  </label>

                  <input
                    type="text"
                    value={editingCourse.courseUnit}
                    onChange={(e) => {
                      const words =
                        e.target.value.split(' ');

                      const titleCase = words
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() +
                            word.slice(1).toLowerCase()
                        )
                        .join(' ');

                      setEditingCourse({
                        ...editingCourse,
                        courseUnit: titleCase,
                      });
                    }}
                    className="w-full rounded-lg border border-[#2A2438] bg-[#0B0912] px-4 py-3 text-sm text-[#F5F0E8] outline-none transition-colors focus:border-[#E8A33D]/50 focus:ring-2 focus:ring-[#E8A33D]/10"
                    placeholder="e.g. Introduction To CS"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#A79C8C]">
                    Credits{' '}
                    <span className="text-[#FB7185]">*</span>
                  </label>

                  <input
                    type="number"
                    value={editingCourse.credits}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        credits:
                          parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full rounded-lg border border-[#2A2438] bg-[#0B0912] px-4 py-3 text-sm text-[#F5F0E8] outline-none transition-colors focus:border-[#E8A33D]/50 focus:ring-2 focus:ring-[#E8A33D]/10"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleUpdate}
                  disabled={updateMutation.isPending}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#E8A33D] px-4 py-3 text-sm font-semibold text-[#0B0912] transition-colors hover:bg-[#D9952F] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Update Course
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingCourse(null);
                  }}
                  className="rounded-lg border border-[#2A2438] bg-[#1A1525] px-5 py-3 text-sm font-medium text-[#A79C8C] transition-colors hover:bg-[#2A2438] hover:text-[#F5F0E8]"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submitted Courses */}
        {submittedCourses.length === 0 ? (
          <div className="rounded-xl border border-[#2A2438] bg-[#150F20] p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#2A2438] bg-[#1A1525]">
              <BookOpen className="h-7 w-7 text-[#A79C8C]" />
            </div>

            <h3 className="text-base font-semibold text-[#F5F0E8]">
              No courses submitted yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-[#6B6358]">
              Click &quot;Add Courses&quot; above to add your
              course units.
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-[#F5F0E8]">
                  Your Submitted Courses
                </h3>

                <p className="mt-1 text-sm text-[#A79C8C]">
                  {submittedCourses.length}{' '}
                  {submittedCourses.length === 1
                    ? 'course unit'
                    : 'course units'}{' '}
                  submitted
                </p>
              </div>

              <div className="rounded-lg border border-[#E8A33D]/20 bg-[#E8A33D]/10 px-3 py-2 text-right">
                <p className="text-xs text-[#A79C8C]">
                  Total Credits
                </p>

                <p className="text-lg font-bold text-[#E8A33D]">
                  {totalCredits}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {submittedCourses.map((course) => (
                <motion.div
                  key={course.id}
                  initial={{
                    opacity: 0,
                    y: 12,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="rounded-xl border border-[#2A2438] bg-[#150F20] p-4 transition-colors hover:border-[#3A3348]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md border border-[#E8A33D]/30 bg-[#E8A33D]/10 px-2.5 py-1 text-xs font-semibold text-[#E8A33D]">
                          {course.code}
                        </span>

                        <h4 className="text-base font-semibold text-[#F5F0E8]">
                          {course.courseUnit}
                        </h4>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                        <span className="text-[#A79C8C]">
                          {course.credits}{' '}
                          {course.credits === 1
                            ? 'credit'
                            : 'credits'}
                        </span>

                        <span className="h-1 w-1 rounded-full bg-[#6B6358]" />

                        <span className="flex items-center gap-1.5 font-medium text-[#14B8A6]">
                          <Check className="h-4 w-4" />
                          Submitted
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {/* Edit word instead of pencil icon */}
                      <button
                        onClick={() => handleEdit(course)}
                        className="rounded-lg border border-[#2A2438] bg-[#1A1525] px-3 py-2 text-sm font-medium text-[#E8A33D] transition-colors hover:border-[#E8A33D]/40 hover:bg-[#E8A33D]/10"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(course.id)}
                        disabled={deleteMutation.isPending}
                        className="rounded-lg border border-[#2A2438] bg-[#1A1525] p-2 text-[#FB7185] transition-colors hover:border-[#FB7185]/40 hover:bg-[#FB7185]/10 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={`Delete ${course.code}`}
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}