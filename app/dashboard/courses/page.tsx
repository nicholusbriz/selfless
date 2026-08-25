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
  const [editingCourse, setEditingCourse] =
    useState<Course | null>(null);

  const [showReligionEdit, setShowReligionEdit] = useState(false);
  const [showTuitionEdit, setShowTuitionEdit] = useState(false);
  const [userTakesReligion, setUserTakesReligion] = useState(false);
  const [userTuitionAmount, setUserTuitionAmount] = useState('');
  const [userGeneralCourse, setUserGeneralCourse] = useState('');
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [showGeneralCourseEdit, setShowGeneralCourseEdit] =
    useState(false);

  const hasGeneralCourse =
    userGeneralCourse.trim() !== '' ||
    Boolean(user?.generalCourse?.trim());

  const { data, isLoading, error } = useCourses();
  const submitMutation = useSubmitCourses();
  const updateMutation = useUpdateCourse();
  const deleteMutation = useDeleteCourse();

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

  const toggleGeneralCourseEdit = () => {
    if (!showGeneralCourseEdit) {
      setUserGeneralCourse(getCurrentGeneralCourse());
    }

    setShowGeneralCourseEdit((previous) => !previous);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 space-y-2">
            <div className="h-7 w-40 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-64 animate-pulse rounded bg-slate-200" />
          </div>

          <div className="space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-20 animate-pulse rounded-lg border border-slate-200 bg-white"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-lg border border-red-200 bg-white p-6 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-600" />

          <h2 className="text-base font-semibold text-slate-900">
            Unable to load courses
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Please refresh the page and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[72px] items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.back()}
                  className="text-sm font-medium text-slate-500 transition-colors hover:text-[#1A365D]"
                >
                  Back
                </button>

                <span className="text-slate-300">/</span>

                <Link
                  href="/dashboard/students"
                  className="hidden text-sm font-medium text-slate-500 transition-colors hover:text-[#1A365D] sm:block"
                >
                  Students
                </Link>

                <span className="hidden text-slate-300 sm:block">
                  /
                </span>

                <Link
                  href="/dashboard/cleaning"
                  className="hidden text-sm font-medium text-slate-500 transition-colors hover:text-[#1A365D] sm:block"
                >
                  Cleaning
                </Link>
              </div>

              <div className="mt-2">
                <h1 className="text-2xl font-bold tracking-tight text-[#172033]">
                  My Courses
                </h1>

                <p className="mt-0.5 text-sm text-slate-500">
                  Manage your current course units and academic
                  information
                </p>
              </div>
            </div>

            <div className="hidden shrink-0 text-right sm:block">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Total Credits
              </p>

              <p className="mt-0.5 text-2xl font-bold text-[#1A365D]">
                {totalCredits}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Profile Completion */}
        {(!user?.profileImageUrl ||
          !user?.generalCourse ||
          !user?.phoneNumber) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 border border-blue-200 bg-blue-50 px-4 py-4 sm:px-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#1A365D]">
                  Complete your profile
                </p>

                <p className="mt-1 text-sm leading-5 text-slate-600">
                  {!user?.profileImageUrl &&
                    'Add a profile photo. '}
                  {!user?.generalCourse &&
                    'Set your general degree course. '}
                  {!user?.phoneNumber &&
                    'Add your phone number.'}
                </p>
              </div>

              <button
                onClick={() =>
                  router.push('/dashboard/profile')
                }
                className="shrink-0 border border-[#1A365D] bg-[#1A365D] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#153E75]"
              >
                Complete Profile
              </button>
            </div>
          </motion.div>
        )}

        {/* Academic Information */}
        <section className="mb-8">
          <div className="mb-3">
            <h2 className="text-base font-semibold text-slate-900">
              Academic Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Keep your academic information up to date.
            </p>
          </div>

          <div className="divide-y divide-slate-200 border border-slate-200 bg-white shadow-sm">
            {/* General Degree Course */}
            <div className="p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">
                    General Degree Course
                  </p>

                  {!showGeneralCourseEdit && (
                    <>
                      {hasGeneralCourse ? (
                        <div className="mt-1">
                          <p className="text-base font-semibold text-slate-900">
                            {user?.generalCourse ||
                              userGeneralCourse}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            Your main academic programme
                          </p>
                        </div>
                      ) : (
                        <p className="mt-1 text-sm font-medium text-red-600">
                          Not set
                        </p>
                      )}
                    </>
                  )}
                </div>

                <button
                  onClick={toggleGeneralCourseEdit}
                  disabled={isUpdatingSettings}
                  className="self-start border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-[#1A365D] hover:text-[#1A365D] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {showGeneralCourseEdit ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {showGeneralCourseEdit && (
                <div className="mt-5 border-t border-slate-100 pt-5">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Degree Course
                  </label>

                  <input
                    type="text"
                    value={userGeneralCourse}
                    onChange={(e) =>
                      setUserGeneralCourse(e.target.value)
                    }
                    placeholder="e.g. Software Engineering"
                    disabled={isUpdatingSettings}
                    className="w-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:border-[#3182CE] focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />

                  <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={updateGeneralCourse}
                      disabled={
                        isUpdatingSettings ||
                        !userGeneralCourse.trim()
                      }
                      className="inline-flex items-center justify-center gap-2 bg-[#1A365D] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#153E75] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isUpdatingSettings ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>

                    <button
                      onClick={() =>
                        setShowGeneralCourseEdit(false)
                      }
                      disabled={isUpdatingSettings}
                      className="border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>

                  {saveSuccess && (
                    <div className="mt-3 flex items-center gap-2 text-sm font-medium text-green-700">
                      <Check className="h-4 w-4" />
                      General degree course saved successfully.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Religion */}
            <div className="p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Religion Status
                  </p>

                  {!showReligionEdit && (
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`text-sm font-semibold ${
                          userTakesReligion
                            ? 'text-green-700'
                            : 'text-slate-700'
                        }`}
                      >
                        {userTakesReligion ? 'Yes' : 'No'}
                      </span>

                      <span className="text-sm text-slate-400">
                        Takes religion
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() =>
                    setShowReligionEdit(
                      (previous) => !previous
                    )
                  }
                  disabled={isUpdatingSettings}
                  className="self-start border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-[#1A365D] hover:text-[#1A365D] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {showReligionEdit ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {showReligionEdit && (
                <div className="mt-5 border-t border-slate-100 pt-5">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Do you take religion?
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setUserTakesReligion(true)}
                      className={`border px-4 py-2.5 text-sm font-medium transition-colors ${
                        userTakesReligion
                          ? 'border-[#1A365D] bg-blue-50 text-[#1A365D]'
                          : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Yes
                    </button>

                    <button
                      onClick={() =>
                        setUserTakesReligion(false)
                      }
                      className={`border px-4 py-2.5 text-sm font-medium transition-colors ${
                        !userTakesReligion
                          ? 'border-[#1A365D] bg-blue-50 text-[#1A365D]'
                          : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      No
                    </button>
                  </div>

                  <button
                    onClick={updateAcademicSettings}
                    disabled={isUpdatingSettings}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 bg-[#1A365D] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#153E75] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    {isUpdatingSettings ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Tuition */}
            <div className="p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Tuition Amount
                  </p>

                  {!showTuitionEdit && (
                    <div className="mt-1">
                      {userTuitionAmount !== '' ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-semibold text-slate-900">
                            $
                            {parseFloat(
                              userTuitionAmount
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>

                          <span className="text-sm text-slate-500">
                            USD
                          </span>
                        </div>
                      ) : (
                        <p className="text-sm font-medium text-slate-400">
                          Not set
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() =>
                    setShowTuitionEdit(
                      (previous) => !previous
                    )
                  }
                  disabled={isUpdatingSettings}
                  className="self-start border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-[#1A365D] hover:text-[#1A365D] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {showTuitionEdit ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {showTuitionEdit && (
                <div className="mt-5 border-t border-slate-100 pt-5">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Tuition Amount (USD)
                  </label>

                  <input
                    type="number"
                    value={userTuitionAmount}
                    onChange={(e) =>
                      setUserTuitionAmount(e.target.value)
                    }
                    placeholder="Enter tuition amount"
                    min="0"
                    step="0.01"
                    className="w-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:border-[#3182CE] focus:ring-2 focus:ring-blue-100"
                  />

                  <button
                    onClick={updateAcademicSettings}
                    disabled={isUpdatingSettings}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 bg-[#1A365D] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#153E75] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    {isUpdatingSettings ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Course Section */}
        <section>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Course Units
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Add and manage the course units you are taking.
              </p>
            </div>

            <div className="text-sm text-slate-500 sm:text-right">
              <span className="font-semibold text-slate-900">
                {submittedCourses.length}
              </span>{' '}
              {submittedCourses.length === 1
                ? 'course unit'
                : 'course units'}{' '}
              submitted
            </div>
          </div>

          {/* Add Courses Button */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              disabled={isUpdatingSettings}
              className="mb-5 flex w-full items-center justify-center gap-2 border border-[#1A365D] bg-[#1A365D] px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#153E75] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add Courses
            </button>
          )}

          {/* Course Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -8,
                }}
                className="mb-6 border border-slate-200 bg-white shadow-sm"
              >
                <div className="border-b border-slate-200 p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        Add Course Units
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Enter each course unit and add it to your
                        submission list.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setShowForm(false);
                        clearCourseList();
                      }}
                      className="border border-slate-300 bg-white p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
                      aria-label="Close course form"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  {/* Important Notice */}
                  <div className="mb-6 border-l-4 border-amber-500 bg-amber-50 px-4 py-3">
                    <p className="text-sm leading-6 text-amber-800">
                      <strong>Important:</strong> This form is
                      specifically for core course units. Add one
                      course unit at a time, then submit when you
                      have entered all the course units you are
                      taking. Religion status is managed separately.
                    </p>
                  </div>

                  {/* Course Details */}
                  <div>
                    <h4 className="mb-4 text-sm font-semibold text-slate-900">
                      Course Unit Details
                    </h4>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Course Code{' '}
                          <span className="text-red-600">*</span>
                        </label>

                        <input
                          type="text"
                          value={courseCode}
                          onChange={(e) =>
                            setCourseCode(
                              e.target.value.toUpperCase()
                            )
                          }
                          className="w-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#3182CE] focus:ring-2 focus:ring-blue-100"
                          placeholder="e.g. WDD230"
                          required
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Course Unit Name{' '}
                          <span className="text-red-600">*</span>
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
                          className="w-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#3182CE] focus:ring-2 focus:ring-blue-100"
                          placeholder="e.g. Introduction To CS"
                          required
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Credits{' '}
                          <span className="text-red-600">*</span>
                        </label>

                        <input
                          type="number"
                          value={credits}
                          onChange={(e) =>
                            setCredits(
                              parseInt(e.target.value, 10) || 0
                            )
                          }
                          className="w-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#3182CE] focus:ring-2 focus:ring-blue-100"
                          placeholder="e.g. 3"
                          min="1"
                          required
                        />
                      </div>
                    </div>

                    <button
                      onClick={addCourseToList}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 border border-[#1A365D] bg-white px-4 py-3 text-sm font-semibold text-[#1A365D] transition-colors hover:bg-blue-50"
                    >
                      <Plus className="h-4 w-4" />
                      Add to List
                    </button>
                  </div>

                  {/* Courses Waiting to Submit */}
                  {coursesList.length > 0 && (
                    <div className="mt-6 border-t border-slate-200 pt-6">
                      <div className="mb-3 flex items-center justify-between gap-4">
                        <h4 className="text-sm font-semibold text-slate-900">
                          Course Units to Submit
                        </h4>

                        <span className="text-sm text-slate-500">
                          {coursesList.length}{' '}
                          {coursesList.length === 1
                            ? 'course'
                            : 'courses'}
                        </span>
                      </div>

                      <div className="divide-y divide-slate-200 border border-slate-200">
                        {coursesList.map((course, index) => (
                          <div
                            key={`${course.code}-${index}`}
                            className="flex items-center justify-between gap-4 bg-white px-4 py-3"
                          >
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-3">
                                <span className="font-mono text-sm font-semibold text-[#1A365D]">
                                  {course.code}
                                </span>

                                <span className="text-sm font-medium text-slate-900">
                                  {course.courseUnit}
                                </span>
                              </div>

                              <p className="mt-1 text-xs text-slate-500">
                                {course.credits}{' '}
                                {course.credits === 1
                                  ? 'credit'
                                  : 'credits'}
                              </p>
                            </div>

                            <button
                              onClick={() =>
                                removeCourseFromList(index)
                              }
                              className="shrink-0 border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
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
                  <div className="mt-6 flex items-center justify-between border border-slate-200 bg-slate-50 px-4 py-3">
                    <span className="text-sm font-medium text-slate-600">
                      Total Credits for This Submission
                    </span>

                    <span className="text-lg font-bold text-[#1A365D]">
                      {calculateTotalCredits()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={handleSubmit}
                      disabled={
                        submitMutation.isPending ||
                        coursesList.length === 0
                      }
                      className="flex flex-1 items-center justify-center gap-2 bg-[#1A365D] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#153E75] disabled:cursor-not-allowed disabled:opacity-50"
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
                      className="border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      Clear
                    </button>

                    <button
                      onClick={() => {
                        setShowForm(false);
                        clearCourseList();
                      }}
                      className="border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Edit Course */}
          <AnimatePresence>
            {showEditForm && editingCourse && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -8,
                }}
                className="mb-6 border border-slate-200 bg-white shadow-sm"
              >
                <div className="border-b border-slate-200 p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        Edit Course
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Update the course information below.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setShowEditForm(false);
                        setEditingCourse(null);
                      }}
                      className="border border-slate-300 bg-white p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
                      aria-label="Close edit form"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Course Code{' '}
                        <span className="text-red-600">*</span>
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
                        className="w-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#3182CE] focus:ring-2 focus:ring-blue-100"
                        placeholder="e.g. WDD230"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Course Unit Name{' '}
                        <span className="text-red-600">*</span>
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
                        className="w-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#3182CE] focus:ring-2 focus:ring-blue-100"
                        placeholder="e.g. Introduction To CS"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Credits{' '}
                        <span className="text-red-600">*</span>
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
                        className="w-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#3182CE] focus:ring-2 focus:ring-blue-100"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={handleUpdate}
                      disabled={updateMutation.isPending}
                      className="flex flex-1 items-center justify-center gap-2 bg-[#1A365D] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#153E75] disabled:cursor-not-allowed disabled:opacity-50"
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
                      className="border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
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
            <div className="border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
              <BookOpen className="mx-auto mb-4 h-8 w-8 text-slate-300" />

              <h3 className="text-base font-semibold text-slate-900">
                No courses submitted yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Add your course units above and submit them when
                you are finished.
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-3 flex items-end justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Submitted Courses
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Your currently submitted course units.
                  </p>
                </div>

                <div className="hidden text-right sm:block">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Total Credits
                  </p>

                  <p className="text-lg font-bold text-[#1A365D]">
                    {totalCredits}
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-200 border border-slate-200 bg-white shadow-sm">
                {submittedCourses.map((course) => (
                  <motion.div
                    key={course.id}
                    initial={{
                      opacity: 0,
                      y: 6,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className="p-4 transition-colors hover:bg-slate-50 sm:p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="font-mono text-sm font-semibold text-[#1A365D]">
                            {course.code}
                          </span>

                          <h4 className="text-base font-semibold text-slate-900">
                            {course.courseUnit}
                          </h4>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                          <span className="text-slate-500">
                            {course.credits}{' '}
                            {course.credits === 1
                              ? 'credit'
                              : 'credits'}
                          </span>

                          <span className="text-slate-300">
                            |
                          </span>

                          <span className="font-medium text-green-700">
                            Submitted
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          onClick={() => handleEdit(course)}
                          className="border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-[#1A365D] hover:text-[#1A365D]"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(course.id)
                          }
                          disabled={deleteMutation.isPending}
                          className="border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Delete'
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}