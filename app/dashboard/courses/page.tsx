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

// =========================================================
// Design tokens — matching the rest of the app
// =========================================================

const TOKENS = `
  [data-courses-scope] {
    --ink:        #12203B;
    --ink-2:      #3D4A61;
    --ink-3:      #6B7268;
    --ink-4:      #8A9088;

    --surface:    #FFFFFF;
    --surface-2:  #F7F6F2;
    --surface-3:  #EDECE6;

    --line:       #DADCD3;
    --line-strong:#C8CABF;

    --brand:      #12203B;
    --brand-hover:#1C2E4E;
    --brand-soft: #F0F0EB;

    --brass:      #B98A3E;
    --brass-hover:#A67A34;
    --brass-soft: #F8F3E8;

    --ok:         #55705B;
    --ok-soft:    #EEF3EE;

    --warn:       #8A6E3A;
    --warn-soft:  #F8F4EC;

    --bad:        #A4462F;
    --bad-soft:   #FBF0EC;

    --radius:     0px;

    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum' 1, 'cv05' 1;
  }
`;

const focusRing =
  'outline-none focus-visible:ring-1 focus-visible:ring-[var(--brass)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--surface)]';

const panel =
  'border border-[var(--line)] bg-[var(--surface)]';

const btnBase = `inline-flex items-center justify-center gap-2 px-3.5 py-2 text-[12px] font-mono font-semibold uppercase tracking-[0.08em] transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${focusRing}`;

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

  // =========================================================
  // Loading
  // =========================================================

  if (isLoading) {
    return (
      <div data-courses-scope className="min-h-screen bg-[var(--surface-2)] text-[var(--ink)] antialiased">
        <style dangerouslySetInnerHTML={{ __html: TOKENS }} />
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 space-y-2">
            <div className="h-7 w-40 animate-pulse bg-[var(--surface-3)]" />
            <div className="h-4 w-64 animate-pulse bg-[var(--surface-3)]" />
          </div>

          <div className="space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-20 animate-pulse border border-[var(--line)] bg-[var(--surface)]"
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
          <div className="w-full max-w-md border border-[var(--line)] bg-[var(--surface)] p-6 text-center">
            <AlertCircle className="mx-auto mb-3 h-8 w-8 text-[var(--bad)]" />

            <h2 className="text-base font-semibold text-[var(--ink)]">
              Unable to load courses
            </h2>

            <p className="mt-1 font-mono text-[13px] text-[var(--ink-3)]">
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
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[72px] flex-col justify-center py-4 sm:min-h-[80px]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className={`${btnQuiet} px-2.5`}
              >
                Back
              </button>

              <span className="text-[var(--ink-4)]">/</span>

              <Link
                href="/dashboard/students"
                className="hidden font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--ink-3)] transition-colors hover:text-[var(--ink)] sm:block"
              >
                Students
              </Link>

              <span className="hidden text-[var(--ink-4)] sm:block">
                /
              </span>

              <Link
                href="/dashboard/cleaning"
                className="hidden font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--ink-3)] transition-colors hover:text-[var(--ink)] sm:block"
              >
                Cleaning
              </Link>
            </div>

            <div className="mt-2 flex items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
                  My Courses
                </h1>

                <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--ink-3)]">
                  Manage your current course units and academic
                  information
                </p>
              </div>

              <div className="hidden shrink-0 text-right sm:block">
                <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--ink-4)]">
                  Total Credits
                </p>

                <p className="mt-0.5 font-mono text-2xl font-semibold tabular-nums text-[var(--brand)]">
                  {totalCredits}
                </p>
              </div>
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
            className="mb-6 border border-[var(--line)] bg-[var(--brand-soft)] px-4 py-4 sm:px-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--brand)]">
                  Complete your profile
                </p>

                <p className="mt-1 font-mono text-[12px] leading-5 text-[var(--ink-2)]">
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
                className={`${btnPrimary} shrink-0`}
              >
                Complete Profile
              </button>
            </div>
          </motion.div>
        )}

        {/* Academic Information */}
        <section className="mb-8">
          <div className="mb-3">
            <h2 className="text-base font-semibold tracking-tight text-[var(--ink)]">
              Academic Information
            </h2>

            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--ink-3)]">
              Keep your academic information up to date.
            </p>
          </div>

          <div className="divide-y divide-[var(--line)] border border-[var(--line)] bg-[var(--surface)]">
            {/* General Degree Course */}
            <div className="p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--ink-3)]">
                    General Degree Course
                  </p>

                  {!showGeneralCourseEdit && (
                    <>
                      {hasGeneralCourse ? (
                        <div className="mt-1">
                          <p className="font-mono text-[15px] font-semibold text-[var(--ink)]">
                            {user?.generalCourse ||
                              userGeneralCourse}
                          </p>

                          <p className="mt-1 font-mono text-[11px] text-[var(--ink-3)]">
                            Your main academic programme
                          </p>
                        </div>
                      ) : (
                        <p className="mt-1 font-mono text-[12px] font-semibold text-[var(--bad)]">
                          Not set
                        </p>
                      )}
                    </>
                  )}
                </div>

                <button
                  onClick={toggleGeneralCourseEdit}
                  disabled={isUpdatingSettings}
                  className={btnQuiet}
                >
                  {showGeneralCourseEdit ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {showGeneralCourseEdit && (
                <div className="mt-5 border-t border-[var(--line)] pt-5">
                  <label className="mb-2 block font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-2)]">
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
                    className={`w-full border border-[var(--line)] bg-[var(--surface)] px-4 py-3 font-mono text-[13px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-4)] focus:border-[var(--brass)] disabled:cursor-not-allowed disabled:bg-[var(--surface-2)] ${focusRing}`}
                  />

                  <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={updateGeneralCourse}
                      disabled={
                        isUpdatingSettings ||
                        !userGeneralCourse.trim()
                      }
                      className={btnPrimary}
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
                      className={btnQuiet}
                    >
                      Cancel
                    </button>
                  </div>

                  {saveSuccess && (
                    <div className="mt-3 flex items-center gap-2 font-mono text-[12px] font-semibold text-[var(--ok)]">
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
                  <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--ink-3)]">
                    Religion Status
                  </p>

                  {!showReligionEdit && (
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`font-mono text-[13px] font-semibold ${
                          userTakesReligion
                            ? 'text-[var(--ok)]'
                            : 'text-[var(--ink)]'
                        }`}
                      >
                        {userTakesReligion ? 'Yes' : 'No'}
                      </span>

                      <span className="font-mono text-[11px] text-[var(--ink-4)]">
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
                  className={btnQuiet}
                >
                  {showReligionEdit ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {showReligionEdit && (
                <div className="mt-5 border-t border-[var(--line)] pt-5">
                  <label className="mb-2 block font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-2)]">
                    Do you take religion?
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setUserTakesReligion(true)}
                      className={`border px-4 py-2.5 font-mono text-[12px] font-semibold uppercase tracking-[0.08em] transition-colors ${
                        userTakesReligion
                          ? 'border-[var(--brass)] bg-[var(--brass-soft)] text-[var(--brass)]'
                          : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink-2)] hover:bg-[var(--surface-2)]'
                      }`}
                    >
                      Yes
                    </button>

                    <button
                      onClick={() =>
                        setUserTakesReligion(false)
                      }
                      className={`border px-4 py-2.5 font-mono text-[12px] font-semibold uppercase tracking-[0.08em] transition-colors ${
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
                    disabled={isUpdatingSettings}
                    className={`${btnPrimary} mt-3 w-full sm:w-auto`}
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
                  <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--ink-3)]">
                    Tuition Amount
                  </p>

                  {!showTuitionEdit && (
                    <div className="mt-1">
                      {userTuitionAmount !== '' ? (
                        <div className="flex items-baseline gap-2">
                          <span className="font-mono text-lg font-semibold text-[var(--ink)] tabular-nums">
                            $
                            {parseFloat(
                              userTuitionAmount
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>

                          <span className="font-mono text-[11px] text-[var(--ink-3)]">
                            USD
                          </span>
                        </div>
                      ) : (
                        <p className="font-mono text-[12px] font-medium text-[var(--ink-4)]">
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
                  className={btnQuiet}
                >
                  {showTuitionEdit ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {showTuitionEdit && (
                <div className="mt-5 border-t border-[var(--line)] pt-5">
                  <label className="mb-2 block font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-2)]">
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
                    className={`w-full border border-[var(--line)] bg-[var(--surface)] px-4 py-3 font-mono text-[13px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-4)] focus:border-[var(--brass)] ${focusRing}`}
                  />

                  <button
                    onClick={updateAcademicSettings}
                    disabled={isUpdatingSettings}
                    className={`${btnPrimary} mt-3 w-full sm:w-auto`}
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
              <h2 className="text-base font-semibold tracking-tight text-[var(--ink)]">
                Course Units
              </h2>

              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--ink-3)]">
                Add and manage the course units you are taking.
              </p>
            </div>

            <div className="font-mono text-[12px] text-[var(--ink-3)] sm:text-right">
              <span className="font-semibold text-[var(--ink)]">
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
              className={`${btnPrimary} mb-5 flex w-full items-center justify-center`}
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
                className={`${panel} mb-6`}
              >
                <div className="border-b border-[var(--line)] p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight text-[var(--ink)]">
                        Add Course Units
                      </h3>

                      <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--ink-3)]">
                        Enter each course unit and add it to your
                        submission list.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setShowForm(false);
                        clearCourseList();
                      }}
                      className={`border border-[var(--line)] bg-[var(--surface)] p-2 text-[var(--ink-3)] transition-colors hover:border-[var(--brass)] hover:text-[var(--ink)] ${focusRing}`}
                      aria-label="Close course form"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  {/* Important Notice */}
                  <div className="mb-6 border-l-4 border-[var(--warn)] bg-[var(--warn-soft)] px-4 py-3">
                    <p className="font-mono text-[12px] leading-6 text-[var(--warn)]">
                      <strong>Important:</strong> This form is
                      specifically for core course units. Add one
                      course unit at a time, then submit when you
                      have entered all the course units you are
                      taking. Religion status is managed separately.
                    </p>
                  </div>

                  {/* Course Details */}
                  <div>
                    <h4 className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink)]">
                      Course Unit Details
                    </h4>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <label className="mb-2 block font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-2)]">
                          Course Code{' '}
                          <span className="text-[var(--bad)]">*</span>
                        </label>

                        <input
                          type="text"
                          value={courseCode}
                          onChange={(e) =>
                            setCourseCode(
                              e.target.value.toUpperCase()
                            )
                          }
                          className={`w-full border border-[var(--line)] bg-[var(--surface)] px-4 py-3 font-mono text-[13px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-4)] focus:border-[var(--brass)] ${focusRing}`}
                          placeholder="e.g. WDD230"
                          required
                        />
                      </div>

                      <div>
                        <label className="mb-2 block font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-2)]">
                          Course Unit Name{' '}
                          <span className="text-[var(--bad)]">*</span>
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
                          className={`w-full border border-[var(--line)] bg-[var(--surface)] px-4 py-3 font-mono text-[13px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-4)] focus:border-[var(--brass)] ${focusRing}`}
                          placeholder="e.g. Introduction To CS"
                          required
                        />
                      </div>

                      <div>
                        <label className="mb-2 block font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-2)]">
                          Credits{' '}
                          <span className="text-[var(--bad)]">*</span>
                        </label>

                        <input
                          type="number"
                          value={credits}
                          onChange={(e) =>
                            setCredits(
                              parseInt(e.target.value, 10) || 0
                            )
                          }
                          className={`w-full border border-[var(--line)] bg-[var(--surface)] px-4 py-3 font-mono text-[13px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-4)] focus:border-[var(--brass)] ${focusRing}`}
                          placeholder="e.g. 3"
                          min="1"
                          required
                        />
                      </div>
                    </div>

                    <button
                      onClick={addCourseToList}
                      className={`${btnQuiet} mt-4 w-full`}
                    >
                      <Plus className="h-4 w-4" />
                      Add to List
                    </button>
                  </div>

                  {/* Courses Waiting to Submit */}
                  {coursesList.length > 0 && (
                    <div className="mt-6 border-t border-[var(--line)] pt-6">
                      <div className="mb-3 flex items-center justify-between gap-4">
                        <h4 className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink)]">
                          Course Units to Submit
                        </h4>

                        <span className="font-mono text-[12px] text-[var(--ink-3)]">
                          {coursesList.length}{' '}
                          {coursesList.length === 1
                            ? 'course'
                            : 'courses'}
                        </span>
                      </div>

                      <div className="divide-y divide-[var(--line)] border border-[var(--line)]">
                        {coursesList.map((course, index) => (
                          <div
                            key={`${course.code}-${index}`}
                            className="flex items-center justify-between gap-4 bg-[var(--surface)] px-4 py-3"
                          >
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-3">
                                <span className="font-mono text-[13px] font-semibold text-[var(--brand)]">
                                  {course.code}
                                </span>

                                <span className="font-mono text-[13px] text-[var(--ink)]">
                                  {course.courseUnit}
                                </span>
                              </div>

                              <p className="mt-1 font-mono text-[11px] text-[var(--ink-3)]">
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
                              className={`border border-[var(--line)] bg-[var(--surface)] p-2 text-[var(--ink-3)] transition-colors hover:border-[var(--bad)] hover:bg-[var(--bad-soft)] hover:text-[var(--bad)] ${focusRing}`}
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
                  <div className="mt-6 flex items-center justify-between border border-[var(--line)] bg-[var(--surface-2)] px-4 py-3">
                    <span className="font-mono text-[12px] font-medium text-[var(--ink-2)]">
                      Total Credits for This Submission
                    </span>

                    <span className="font-mono text-lg font-bold text-[var(--brand)] tabular-nums">
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
                      className={`${btnPrimary} flex-1`}
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
                      className={btnQuiet}
                    >
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
                className={`${panel} mb-6`}
              >
                <div className="border-b border-[var(--line)] p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight text-[var(--ink)]">
                        Edit Course
                      </h3>

                      <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--ink-3)]">
                        Update the course information below.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setShowEditForm(false);
                        setEditingCourse(null);
                      }}
                      className={`border border-[var(--line)] bg-[var(--surface)] p-2 text-[var(--ink-3)] transition-colors hover:border-[var(--brass)] hover:text-[var(--ink)] ${focusRing}`}
                      aria-label="Close edit form"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <label className="mb-2 block font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-2)]">
                        Course Code{' '}
                        <span className="text-[var(--bad)]">*</span>
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
                        className={`w-full border border-[var(--line)] bg-[var(--surface)] px-4 py-3 font-mono text-[13px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-4)] focus:border-[var(--brass)] ${focusRing}`}
                        placeholder="e.g. WDD230"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-2)]">
                        Course Unit Name{' '}
                        <span className="text-[var(--bad)]">*</span>
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
                        className={`w-full border border-[var(--line)] bg-[var(--surface)] px-4 py-3 font-mono text-[13px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-4)] focus:border-[var(--brass)] ${focusRing}`}
                        placeholder="e.g. Introduction To CS"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-2)]">
                        Credits{' '}
                        <span className="text-[var(--bad)]">*</span>
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
                        className={`w-full border border-[var(--line)] bg-[var(--surface)] px-4 py-3 font-mono text-[13px] text-[var(--ink)] outline-none focus:border-[var(--brass)] ${focusRing}`}
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={handleUpdate}
                      disabled={updateMutation.isPending}
                      className={`${btnPrimary} flex-1`}
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
            <div className={`${panel} px-6 py-12 text-center`}>
              <BookOpen className="mx-auto mb-4 h-8 w-8 text-[var(--ink-4)]" />

              <h3 className="text-base font-semibold text-[var(--ink)]">
                No courses submitted yet
              </h3>

              <p className="mx-auto mt-2 max-w-md font-mono text-[13px] text-[var(--ink-3)]">
                Add your course units above and submit them when
                you are finished.
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-3 flex items-end justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold tracking-tight text-[var(--ink)]">
                    Submitted Courses
                  </h3>

                  <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--ink-3)]">
                    Your currently submitted course units.
                  </p>
                </div>

                <div className="hidden text-right sm:block">
                  <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--ink-4)]">
                    Total Credits
                  </p>

                  <p className="font-mono text-lg font-bold text-[var(--brand)] tabular-nums">
                    {totalCredits}
                  </p>
                </div>
              </div>

              <div className="divide-y divide-[var(--line)] border border-[var(--line)] bg-[var(--surface)]">
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
                    className="p-4 transition-colors hover:bg-[var(--surface-2)] sm:p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="font-mono text-[13px] font-semibold text-[var(--brand)]">
                            {course.code}
                          </span>

                          <h4 className="font-mono text-[13px] font-semibold text-[var(--ink)]">
                            {course.courseUnit}
                          </h4>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[12px]">
                          <span className="text-[var(--ink-3)]">
                            {course.credits}{' '}
                            {course.credits === 1
                              ? 'credit'
                              : 'credits'}
                          </span>

                          <span className="text-[var(--ink-4)]">
                            |
                          </span>

                          <span className="font-semibold text-[var(--ok)]">
                            Submitted
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          onClick={() => handleEdit(course)}
                          className={btnQuiet}
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(course.id)
                          }
                          disabled={deleteMutation.isPending}
                          className={`${btnQuiet} text-[var(--bad)] hover:border-[var(--bad)] hover:bg-[var(--bad-soft)] hover:text-[var(--bad)] disabled:opacity-50`}
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