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
import { getApiErrorMessage, isJsonObject } from '@/lib/api-response';

// =========================================================
// Design tokens — standard palette
// =========================================================

const TOKENS = `
  [data-courses-scope] {
    --ink:        #1A2B4C;
    --ink-2:      #3D4A61;
    --ink-3:      #4B5646;
    --ink-4:      #6B7280;

    --surface:    #FFFFFF;
    --surface-2:  #F8F9FA;
    --surface-3:  #F3F4F6;

    --line:       #E5E7EB;
    --line-strong:#D1D5DB;

    --brand:      #1A2B4C;
    --brand-hover:#263D66;
    --brand-soft: #EEF1F5;

    --brass:      #C59B4C;
    --brass-hover:#B08A3F;
    --brass-soft: #FBF7EE;

    --ok:         #2F6B45;
    --ok-soft:    #ECF6F0;

    --warn:       #6E5520;
    --warn-soft:  #FBF5E5;

    --bad:        #8B3A24;
    --bad-soft:   #FBEDE8;

    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum' 1, 'cv05' 1;
  }
`;

const focusRing =
  'outline-none focus-visible:ring-2 focus-visible:ring-[var(--brass)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--surface)]';

const panel =
  'rounded-lg border border-[var(--line)] bg-[var(--surface)] shadow-[0_1px_2px_rgba(26,43,76,0.04)]';

const btnBase = `inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${focusRing}`;

const btnPrimary = `${btnBase} bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)]`;

const btnQuiet = `${btnBase} border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-2)] hover:border-[var(--brass)] hover:text-[var(--ink)]`;

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

function isSubmittedCourse(value: unknown): value is SubmittedCourse {
  return (
    isJsonObject(value) &&
    typeof value.id === 'string' &&
    typeof value.code === 'string' &&
    typeof value.courseUnit === 'string' &&
    typeof value.credits === 'number'
  );
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

  const [showReligionEdit, setShowReligionEdit] = useState(false);
  const [showTuitionEdit, setShowTuitionEdit] = useState(false);
  const [userTakesReligion, setUserTakesReligion] = useState(false);
  const [userTuitionAmount, setUserTuitionAmount] = useState('');
  const [userGeneralCourse, setUserGeneralCourse] = useState('');
  const [isUpdatingAcademicSettings, setIsUpdatingAcademicSettings] = useState(false);
  const [isUpdatingGeneralCourse, setIsUpdatingGeneralCourse] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [showGeneralCourseEdit, setShowGeneralCourseEdit] = useState(false);

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
        const response = await fetch('/api/student-courses');

        if (response.ok) {
          const settingsData: unknown = await response.json();

          if (
            isJsonObject(settingsData) &&
            Array.isArray(settingsData.courses) &&
            settingsData.courses.length > 0
          ) {
            const firstCourse: unknown = settingsData.courses[0];
            if (isJsonObject(firstCourse)) {
              if (typeof firstCourse.takesReligion === 'boolean') {
                setUserTakesReligion(firstCourse.takesReligion);
              }
              if (
                typeof firstCourse.tuition === 'number' ||
                typeof firstCourse.tuition === 'string' ||
                firstCourse.tuition === null
              ) {
                setUserTuitionAmount(
                  firstCourse.tuition !== null
                    ? firstCourse.tuition.toString()
                    : '',
                );
              }
            }
          }
        } else {
          console.error('Failed to fetch academic settings:', response.status);
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
    setIsUpdatingAcademicSettings(true);

    const optimisticTuition = userTuitionAmount.trim();
    const optimisticReligion = userTakesReligion;
    setShowReligionEdit(false);
    setShowTuitionEdit(false);

    try {
      const response = await fetch('/api/student-courses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          takesReligion: optimisticReligion,
          tuitionAmount: optimisticTuition,
        }),
      });

      if (response.ok) {
        setUserTakesReligion(optimisticReligion);
        setUserTuitionAmount(optimisticTuition);
      } else {
        setUserTakesReligion(optimisticReligion);
        setUserTuitionAmount(optimisticTuition);
        setShowReligionEdit(true);
        setShowTuitionEdit(optimisticTuition !== '');
      }
    } catch (error) {
      console.error('Error updating academic settings:', error);
      setUserTakesReligion(optimisticReligion);
      setUserTuitionAmount(optimisticTuition);
    } finally {
      setIsUpdatingAcademicSettings(false);
    }
  };

  const updateGeneralCourse = async () => {
    const trimmedCourse = userGeneralCourse.trim();
    if (!trimmedCourse) return;

    setIsUpdatingGeneralCourse(true);
    setSaveSuccess(false);
    setShowGeneralCourseEdit(false);

    try {
      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generalCourse: trimmedCourse }),
      });

      if (response.ok) {
        if (user && updateUser) {
          await updateUser({ generalCourse: trimmedCourse });
        }

        setUserGeneralCourse(trimmedCourse);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 1500);
      } else {
        const errorData: unknown = await response.json().catch(() => null);
        setShowGeneralCourseEdit(true);
        alert(getApiErrorMessage(errorData, 'Failed to update general course'));
      }
    } catch (error) {
      console.error('Error updating general course:', error);
      setShowGeneralCourseEdit(true);
      alert('Failed to update general course');
    } finally {
      setIsUpdatingGeneralCourse(false);
    }
  };

  const submittedCourses: SubmittedCourse[] =
    isJsonObject(data) &&
    Array.isArray(data.courses) &&
    data.courses.every(isSubmittedCourse)
      ? data.courses
      : [];
  const totalCredits =
    isJsonObject(data) && typeof data.totalCredits === 'number'
      ? data.totalCredits
      : 0;

  const addCourseToList = () => {
    if (!courseCode || !courseUnit || !credits) {
      alert('Please fill in all fields (course code, course unit name, and credits)');
      return;
    }

    const newCourse: Course = {
      code: courseCode.toUpperCase().trim(),
      courseUnit: courseUnit.trim(),
      credits,
    };

    setCoursesList((prev) => [...prev, newCourse]);
    setCourseCode('');
    setCourseUnit('');
    setCredits(3);
  };

  const removeCourseFromList = (index: number) => {
    setCoursesList((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCourseList = () => {
    setCoursesList([]);
    setCourseCode('');
    setCourseUnit('');
    setCredits(3);
  };

  const handleSubmit = async () => {
    if (coursesList.length === 0) {
      alert('Please add at least one course before submitting course units you are doing this block');
      return;
    }

    for (const course of coursesList) {
      if (!course.code || !course.courseUnit || !course.credits) {
        alert('All fields (course code, course unit name, and credits) are required for each course');
        return;
      }
    }

    setShowForm(false);
    clearCourseList();

    try {
      await submitMutation.mutateAsync({
        courses: coursesList,
        tuitionAmount: userTuitionAmount,
        takesReligion: userTakesReligion,
      });
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
      alert('All fields (course code, course unit name, and credits) are required.');
      return;
    }

    setShowEditForm(false);
    setEditingCourse(null);

    try {
      await updateMutation.mutateAsync({
        courseId: editingCourse.id,
        data: {
          code: editingCourse.code.trim().toUpperCase(),
          courseUnit: editingCourse.courseUnit.trim(),
          credits: editingCourse.credits,
        },
      });
    } catch (error) {
      console.error('Failed to update course:', error);
    }
  };

  const handleDelete = async (courseId: string) => {
    try {
      await deleteMutation.mutateAsync(courseId);
    } catch (error) {
      console.error('Failed to delete course:', error);
    }
  };

  const calculateTotalCredits = () => {
    return coursesList.reduce((sum, course) => sum + (course.credits || 0), 0);
  };

  const toggleGeneralCourseEdit = () => {
    if (!showGeneralCourseEdit) {
      setUserGeneralCourse(getCurrentGeneralCourse());
    }
    setShowGeneralCourseEdit((prev) => !prev);
  };

  // =========================================================
  // Loading
  // =========================================================

  if (isLoading) {
    return (
      <div data-courses-scope className="min-h-screen bg-[var(--surface-2)] text-[var(--ink)] antialiased">
        <style dangerouslySetInnerHTML={{ __html: TOKENS }} />
        <div className="mx-auto max-w-6xl px-3 py-5 sm:px-5">
          <div className="mb-4 space-y-2">
            <div className="h-5 w-32 animate-pulse rounded bg-[var(--surface-3)]" />
            <div className="h-3.5 w-56 animate-pulse rounded bg-[var(--surface-3)]" />
          </div>

          <div className="space-y-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-16 animate-pulse rounded-lg border border-[var(--line)] bg-[var(--surface)]"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // Error
  // =========================================================

  if (error) {
    return (
      <div data-courses-scope className="min-h-screen bg-[var(--surface-2)] text-[var(--ink)] antialiased">
        <style dangerouslySetInnerHTML={{ __html: TOKENS }} />
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-md rounded-lg border border-[var(--line)] bg-[var(--surface)] p-6 text-center shadow-sm">
            <AlertCircle className="mx-auto mb-2 h-7 w-7 text-[var(--bad)]" />
            <h2 className="text-[14px] font-semibold text-[var(--ink)]">
              Unable to load courses
            </h2>
            <p className="mt-1 text-[12.5px] text-[var(--ink-3)]">
              Please refresh the page and try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // Page
  // =========================================================

  return (
    <div
      data-courses-scope
      className="min-h-screen bg-[var(--surface-2)] text-[var(--ink)] antialiased"
    >
      <style dangerouslySetInnerHTML={{ __html: TOKENS }} />

      {/* Header */}
      <header className="border-b border-[var(--line)] bg-[var(--surface)]">
        <div className="mx-auto max-w-6xl px-3 sm:px-5">
          <div className="flex min-h-[64px] flex-col justify-center py-3 sm:min-h-[80px]">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => router.back()}
                className={`${btnQuiet} rounded-md px-2.5 py-1 text-[11px]`}
              >
                Back
              </button>
              <span aria-hidden="true" className="text-[var(--ink-4)]">/</span>
              <Link
                href="/dashboard/students"
                className="hidden text-[11px] font-medium text-[var(--ink-3)] transition-colors hover:text-[var(--ink)] sm:block"
              >
                Students
              </Link>
              <span aria-hidden="true" className="hidden text-[var(--ink-4)] sm:block">/</span>
              <Link
                href="/dashboard/cleaning"
                className="hidden text-[11px] font-medium text-[var(--ink-3)] transition-colors hover:text-[var(--ink)] sm:block"
              >
                Cleaning
              </Link>
            </nav>

            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--brand-soft)] text-[var(--brand)]">
                  <BookOpen className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--brass)]">
                    Academic record
                  </p>
                  <h1 className="text-[18px] font-bold tracking-tight text-[var(--ink)] sm:text-[20px]">
                    My Courses
                  </h1>
                  <p className="mt-0.5 truncate text-[12px] text-[var(--ink-3)]">
                    Manage your course units and academic information.
                  </p>
                </div>
              </div>

              <div className="shrink-0 rounded-md bg-[var(--brand)] px-3 py-1.5 text-right text-white">
                <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-white/70">
                  Credits
                </p>
                <p className="mt-0.5 text-[18px] font-bold tabular-nums">
                  {totalCredits}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl space-y-5 px-3 py-4 sm:px-5 sm:py-5">
        {/* Profile Completion */}
        {(!user?.profileImageUrl ||
          !user?.generalCourse ||
          !user?.phoneNumber) && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-[var(--line)] bg-[var(--brand-soft)] px-3.5 py-3"
          >
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11.5px] font-semibold text-[var(--brand)]">
                  Complete your profile
                </p>
                <p className="mt-0.5 text-[12px] leading-5 text-[var(--ink-2)]">
                  {!user?.profileImageUrl && 'Add a profile photo. '}
                  {!user?.generalCourse && 'Set your general degree course. '}
                  {!user?.phoneNumber && 'Add your phone number.'}
                </p>
              </div>
              <button
                onClick={() => router.push('/dashboard/profile')}
                className={`${btnPrimary} shrink-0`}
              >
                Complete Profile
              </button>
            </div>
          </motion.div>
        )}

        {/* Academic Information */}
        <section>
          <div className="mb-3">
            <h2 className="text-[14px] font-semibold tracking-tight text-[var(--ink)]">
              Academic Information
            </h2>
            <p className="mt-0.5 text-[12px] text-[var(--ink-3)]">
              Keep your programme and billing details current.
            </p>
          </div>

          <div className="divide-y divide-[var(--line)] rounded-lg border border-[var(--line)] bg-[var(--surface)] shadow-[0_1px_2px_rgba(26,43,76,0.04)]">
            {/* General Degree Course */}
            <div className="p-3.5 sm:p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-4)]">
                    General Degree Programme
                  </p>

                  {!showGeneralCourseEdit && (
                    <>
                      {hasGeneralCourse ? (
                        <div className="mt-1">
                          <p className="text-[13.5px] font-semibold text-[var(--ink)]">
                            {user?.generalCourse || userGeneralCourse}
                          </p>
                          <p className="mt-0.5 text-[11.5px] text-[var(--ink-4)]">
                            Your main academic degree programme
                          </p>
                        </div>
                      ) : (
                        <p className="mt-1 text-[12.5px] font-semibold text-[var(--bad)]">
                          Not set
                        </p>
                      )}
                    </>
                  )}
                </div>

                <button
                  onClick={toggleGeneralCourseEdit}
                  disabled={isUpdatingGeneralCourse}
                  className={btnQuiet}
                >
                  {showGeneralCourseEdit ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {showGeneralCourseEdit && (
                <div className="mt-3.5 border-t border-[var(--line)] pt-3.5">
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-2)]">
                    Degree Course
                  </label>
                  <input
                    type="text"
                    value={userGeneralCourse}
                    onChange={(e) => setUserGeneralCourse(e.target.value)}
                    placeholder="e.g. Software Engineering"
                    disabled={isUpdatingGeneralCourse}
                    className={`w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-[13px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-4)] focus:border-[var(--brass)] disabled:cursor-not-allowed disabled:bg-[var(--surface-2)] ${focusRing}`}
                  />
                  <div className="mt-2.5 flex flex-col gap-2 sm:flex-row">
                    <button
                      onClick={updateGeneralCourse}
                      disabled={isUpdatingGeneralCourse || !userGeneralCourse.trim()}
                      className={btnPrimary}
                    >
                      {isUpdatingGeneralCourse ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                    <button
                      onClick={() => setShowGeneralCourseEdit(false)}
                      disabled={isUpdatingGeneralCourse}
                      className={btnQuiet}
                    >
                      Cancel
                    </button>
                  </div>
                  {saveSuccess && (
                    <div className="mt-2 flex items-center gap-1.5 text-[12px] font-semibold text-[var(--ok)]">
                      <Check className="h-3.5 w-3.5" />
                      General degree course saved successfully.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Religion */}
            <div className="p-3.5 sm:p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-4)]">
                    Religion Status
                  </p>
                  {!showReligionEdit && (
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span
                        className={`text-[13px] font-semibold ${
                          userTakesReligion ? 'text-[var(--ok)]' : 'text-[var(--ink)]'
                        }`}
                      >
                        {userTakesReligion ? 'Yes' : 'No'}
                      </span>
                      <span className="text-[11.5px] text-[var(--ink-4)]">
                        Takes religion
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowReligionEdit((prev) => !prev)}
                  disabled={isUpdatingAcademicSettings}
                  className={btnQuiet}
                >
                  {showReligionEdit ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {showReligionEdit && (
                <div className="mt-3.5 border-t border-[var(--line)] pt-3.5">
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-2)]">
                    Do you take religion?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setUserTakesReligion(true)}
                      className={`rounded-md border px-3 py-2 text-[12.5px] font-semibold transition-colors ${
                        userTakesReligion
                          ? 'border-[var(--brass)] bg-[var(--brass-soft)] text-[var(--brass)]'
                          : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink-2)] hover:bg-[var(--surface-2)]'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setUserTakesReligion(false)}
                      className={`rounded-md border px-3 py-2 text-[12.5px] font-semibold transition-colors ${
                        !userTakesReligion
                          ? 'border-[var(--brass)] bg-[var(--brass-soft)] text-[var(--brass)]'
                          : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink-2)] hover:bg-[var(--surface-2)]'
                      }`}
                    >
                      No
                    </button>
                  </div>
                  <button
                    onClick={updateAcademicSettings}
                    disabled={isUpdatingAcademicSettings}
                    className={`${btnPrimary} mt-2.5 w-full sm:w-auto`}
                  >
                    {isUpdatingAcademicSettings ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
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
            <div className="p-3.5 sm:p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-4)]">
                    Tuition Amount
                  </p>
                  {!showTuitionEdit && (
                    <div className="mt-1">
                      {userTuitionAmount !== '' ? (
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-[15px] font-semibold text-[var(--ink)] tabular-nums">
                            $
                            {parseFloat(userTuitionAmount).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                          <span className="text-[11.5px] text-[var(--ink-4)]">USD</span>
                        </div>
                      ) : (
                        <p className="text-[12.5px] font-medium text-[var(--ink-4)]">Not set</p>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowTuitionEdit((prev) => !prev)}
                  disabled={isUpdatingAcademicSettings}
                  className={btnQuiet}
                >
                  {showTuitionEdit ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {showTuitionEdit && (
                <div className="mt-3.5 border-t border-[var(--line)] pt-3.5">
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-2)]">
                    Tuition Amount (USD)
                  </label>
                  <input
                    type="number"
                    value={userTuitionAmount}
                    onChange={(e) => setUserTuitionAmount(e.target.value)}
                    placeholder="Enter tuition amount"
                    min="0"
                    step="0.01"
                    className={`w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-[13px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-4)] focus:border-[var(--brass)] ${focusRing}`}
                  />
                  <button
                    onClick={updateAcademicSettings}
                    disabled={isUpdatingAcademicSettings}
                    className={`${btnPrimary} mt-2.5 w-full sm:w-auto`}
                  >
                    {isUpdatingAcademicSettings ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
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
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-[14px] font-semibold tracking-tight text-[var(--ink)]">
                Course Units
              </h2>
              <p className="mt-0.5 text-[12px] text-[var(--ink-3)]">
                Add and manage the course units you are currently taking.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-1.5 rounded-md border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1 text-[11px] font-medium text-[var(--ink-3)]">
              <span className="font-bold text-[var(--ink)]">{submittedCourses.length}</span>
              {submittedCourses.length === 1 ? 'course unit submitted' : 'course units submitted'}
            </div>
          </div>

          {/* Add Courses Button */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className={`${btnPrimary} mb-3 flex w-full items-center justify-center py-2 sm:w-auto`}
            >
              <Plus className="h-3.5 w-3.5" />
              Add Courses
            </button>
          )}

          {/* Course Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className={`${panel} mb-4`}
              >
                <div className="border-b border-[var(--line)] p-3.5 sm:p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-[13.5px] font-semibold tracking-tight text-[var(--ink)]">
                        Add Course Units
                      </h3>
                      <p className="mt-0.5 text-[11.5px] text-[var(--ink-4)]">
                        Enter each course unit and add it to your submission list.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowForm(false);
                        clearCourseList();
                      }}
                      className={`rounded-md border border-[var(--line)] bg-[var(--surface)] p-1.5 text-[var(--ink-3)] transition-colors hover:border-[var(--brass)] hover:text-[var(--ink)] ${focusRing}`}
                      aria-label="Close course form"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="p-3.5 sm:p-4">
                  {/* Important Notice */}
                  <div className="mb-4 rounded-md border-l-2 border-[var(--warn)] bg-[var(--warn-soft)] px-3 py-2">
                    <p className="text-[11.5px] leading-5 text-[var(--warn)]">
                      <strong>Important:</strong> This form is specifically for core course units.
                      Add one course unit at a time, then submit when you have entered all the course
                      units you are taking. Religion status is managed separately.
                    </p>
                  </div>

                  {/* Course Details */}
                  <div>
                    <h4 className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--ink)]">
                      Course Unit Details
                    </h4>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-2)]">
                          Course Code <span className="text-[var(--bad)]">*</span>
                        </label>
                        <input
                          type="text"
                          value={courseCode}
                          onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                          className={`w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-[13px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-4)] focus:border-[var(--brass)] ${focusRing}`}
                          placeholder="e.g. WDD230"
                          required
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-2)]">
                          Course Unit Name <span className="text-[var(--bad)]">*</span>
                        </label>
                        <input
                          type="text"
                          value={courseUnit}
                          onChange={(e) => {
                            const titleCase = e.target.value
                              .split(' ')
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
                              )
                              .join(' ');
                            setCourseUnit(titleCase);
                          }}
                          className={`w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-[13px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-4)] focus:border-[var(--brass)] ${focusRing}`}
                          placeholder="e.g. Introduction To CS"
                          required
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-2)]">
                          Credits <span className="text-[var(--bad)]">*</span>
                        </label>
                        <input
                          type="number"
                          value={credits}
                          onChange={(e) => setCredits(parseInt(e.target.value, 10) || 0)}
                          className={`w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-[13px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-4)] focus:border-[var(--brass)] ${focusRing}`}
                          placeholder="e.g. 3"
                          min="1"
                          required
                        />
                      </div>
                    </div>

                    <button onClick={addCourseToList} className={`${btnQuiet} mt-3 w-full`}>
                      <Plus className="h-3.5 w-3.5" />
                      Add to List
                    </button>
                  </div>

                  {/* Courses Waiting to Submit */}
                  {coursesList.length > 0 && (
                    <div className="mt-4 border-t border-[var(--line)] pt-4">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <h4 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--ink)]">
                          Course Units to Submit
                        </h4>
                        <span className="text-[11.5px] text-[var(--ink-4)]">
                          {coursesList.length} {coursesList.length === 1 ? 'course' : 'courses'}
                        </span>
                      </div>

                      <div className="divide-y divide-[var(--line)] overflow-hidden rounded-md border border-[var(--line)]">
                        {coursesList.map((course, index) => (
                          <div
                            key={`${course.code}-${index}`}
                            className="flex items-center justify-between gap-3 bg-[var(--surface)] px-3 py-2"
                          >
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[12.5px] font-semibold text-[var(--brand)]">
                                  {course.code}
                                </span>
                                <span className="text-[12.5px] text-[var(--ink)]">
                                  {course.courseUnit}
                                </span>
                              </div>
                              <p className="mt-0.5 text-[11px] text-[var(--ink-4)]">
                                {course.credits} {course.credits === 1 ? 'credit' : 'credits'}
                              </p>
                            </div>
                            <button
                              onClick={() => removeCourseFromList(index)}
                              className={`rounded-md border border-[var(--line)] bg-[var(--surface)] p-1.5 text-[var(--ink-3)] transition-colors hover:border-[var(--bad)] hover:bg-[var(--bad-soft)] hover:text-[var(--bad)] ${focusRing}`}
                              aria-label={`Remove ${course.code}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Submission Total */}
                  <div className="mt-4 flex items-center justify-between rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2">
                    <span className="text-[11.5px] font-medium text-[var(--ink-2)]">
                      Total Credits for This Submission
                    </span>
                    <span className="text-[15px] font-bold text-[var(--brand)] tabular-nums">
                      {calculateTotalCredits()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="mt-3.5 flex flex-col gap-2 sm:flex-row">
                    <button
                      onClick={handleSubmit}
                      disabled={submitMutation.isPending || coursesList.length === 0}
                      className={`${btnPrimary} flex-1`}
                    >
                      {submitMutation.isPending ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Submit All Courses
                        </>
                      )}
                    </button>
                    <button onClick={clearCourseList} className={btnQuiet}>
                      Clear
                    </button>
                    <button
                      onClick={() => {
                        setShowForm(false);
                        clearCourseList();
                      }}
                      className={btnQuiet}
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
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className={`${panel} mb-4`}
              >
                <div className="border-b border-[var(--line)] p-3.5 sm:p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-[13.5px] font-semibold tracking-tight text-[var(--ink)]">
                        Edit Course
                      </h3>
                      <p className="mt-0.5 text-[11.5px] text-[var(--ink-4)]">
                        Update the course information below.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowEditForm(false);
                        setEditingCourse(null);
                      }}
                      className={`rounded-md border border-[var(--line)] bg-[var(--surface)] p-1.5 text-[var(--ink-3)] transition-colors hover:border-[var(--brass)] hover:text-[var(--ink)] ${focusRing}`}
                      aria-label="Close edit form"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="p-3.5 sm:p-4">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-2)]">
                        Course Code <span className="text-[var(--bad)]">*</span>
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
                        className={`w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-[13px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-4)] focus:border-[var(--brass)] ${focusRing}`}
                        placeholder="e.g. WDD230"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-2)]">
                        Course Unit Name <span className="text-[var(--bad)]">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingCourse.courseUnit}
                        onChange={(e) => {
                          const titleCase = e.target.value
                            .split(' ')
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
                            )
                            .join(' ');
                          setEditingCourse({ ...editingCourse, courseUnit: titleCase });
                        }}
                        className={`w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-[13px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-4)] focus:border-[var(--brass)] ${focusRing}`}
                        placeholder="e.g. Introduction To CS"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-2)]">
                        Credits <span className="text-[var(--bad)]">*</span>
                      </label>
                      <input
                        type="number"
                        value={editingCourse.credits}
                        onChange={(e) =>
                          setEditingCourse({
                            ...editingCourse,
                            credits: parseInt(e.target.value, 10) || 0,
                          })
                        }
                        className={`w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-[13px] text-[var(--ink)] outline-none focus:border-[var(--brass)] ${focusRing}`}
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-3.5 flex flex-col gap-2 sm:flex-row">
                    <button
                      onClick={handleUpdate}
                      disabled={updateMutation.isPending}
                      className={`${btnPrimary} flex-1`}
                    >
                      {updateMutation.isPending ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Update Course
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowEditForm(false);
                        setEditingCourse(null);
                      }}
                      className={btnQuiet}
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
            <div className={`${panel} px-4 py-10 text-center`}>
              <BookOpen className="mx-auto mb-2 h-6 w-6 text-[var(--ink-4)]" />
              <h3 className="text-[13px] font-semibold text-[var(--ink)]">
                No courses submitted yet
              </h3>
              <p className="mx-auto mt-1 max-w-md text-[11.5px] text-[var(--ink-4)]">
                Add your course units above and submit them when you are finished.
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-2.5 flex items-end justify-between gap-3">
                <div>
                  <h3 className="text-[13px] font-semibold tracking-tight text-[var(--ink)]">
                    Submitted Courses
                  </h3>
                  <p className="mt-0.5 text-[11.5px] text-[var(--ink-4)]">
                    Your currently submitted course units.
                  </p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--ink-4)]">
                    Total Credits
                  </p>
                  <p className="text-[14px] font-bold text-[var(--brand)] tabular-nums">
                    {totalCredits}
                  </p>
                </div>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                {submittedCourses.map((course) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-3 transition-colors hover:border-[var(--brass)]/40 sm:p-3.5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-start gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--brand-soft)] text-[var(--brand)]">
                          <BookOpen className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="inline-flex rounded bg-[var(--brand-soft)] px-1.5 py-0.5 text-[10.5px] font-bold tracking-wide text-[var(--brand)]">
                            {course.code}
                          </span>
                          <h4 className="mt-1 break-words text-[13px] font-semibold leading-5 text-[var(--ink)]">
                            {course.courseUnit}
                          </h4>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                            <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 font-medium text-[var(--ink-2)]">
                              {course.credits} {course.credits === 1 ? 'credit' : 'credits'}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--ok-soft)] px-2 py-0.5 font-semibold text-[var(--ok)]">
                              <Check className="h-2.5 w-2.5" />
                              Submitted
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEdit(course)}
                          className={`${btnQuiet} flex-1 px-2.5 py-1 sm:flex-none`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(course.id)}
                          disabled={deleteMutation.isPending}
                          aria-label={`Delete ${course.courseUnit}`}
                          className={`${btnQuiet} flex-1 px-2.5 py-1 text-[var(--bad)] hover:border-[var(--bad)] hover:bg-[var(--bad-soft)] hover:text-[var(--bad)] disabled:opacity-50 sm:flex-none`}
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
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