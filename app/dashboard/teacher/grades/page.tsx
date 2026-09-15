'use client';

import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpenCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Search,
  Edit3,
  UsersRound,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: { name: string };
  techCenter: { id: string; name: string };
  submittedCourses?: StudentCourse[];
  profileImageUrl: string | null;
  gradeCounts?: Record<number, number>;
}

interface StudentCourse {
  id: string;
  name: string;
  code: string;
  courseUnit: string;
  credits: number;
}

interface Grade {
  id: string;
  studentId: string;
  gradeLetter: string;
  gradePoints: number;
  score: number | null;
  week: number;
  assignedAt: string;
  notes: string | null;
  studentCourse?: {
    id: string;
    name: string;
    code: string;
    courseUnit: string;
    credits: number;
  };
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface GradeScale {
  id: string;
  gradeLetter: string;
  minScore: number;
  maxScore: number;
  gradePoints: number;
  description: string | null;
}

/* -------------------------------------------------------------------------- */
/* API                                                                        */
/* -------------------------------------------------------------------------- */

const fetchStudents = async () => {
  const response = await fetch('/api/grades/students');

  if (!response.ok) {
    throw new Error('Failed to fetch students');
  }

  return response.json();
};

const fetchGradeScale = async () => {
  const response = await fetch('/api/grades/scale');

  if (!response.ok) {
    throw new Error('Failed to fetch grade scale');
  }

  return response.json();
};

const fetchAllGrades = async () => {
  const response = await fetch('/api/grades/all-grades');

  if (!response.ok) {
    throw new Error('Failed to fetch all grades');
  }

  return response.json();
};

const submitGrade = async (grade: {
  studentCourseId: string;
  studentId: string;
  week: number;
  gradeLetter: string;
  score: number | null;
  notes: string | null;
}) => {
  const response = await fetch('/api/grades/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grades: [grade],
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to submit grade');
  }

  return response.json();
};

/* -------------------------------------------------------------------------- */
/* Scroll helper                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Uses the browser's native scroll handling rather than trying to
 * manually identify the dashboard's scroll container.
 *
 * This is important on mobile because the dashboard layout can use
 * a different scrolling context from desktop.
 */
function scrollToSection(id: string) {
  const element = document.getElementById(id);

  if (!element) return;

  element.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

/* -------------------------------------------------------------------------- */
/* Skeletons                                                                  */
/* -------------------------------------------------------------------------- */

function Skeleton({
  className = '',
}: {
  className?: string;
}) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[#E9ECEF] ${className}`}
      aria-hidden="true"
    />
  );
}

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#12203B]">
      <div className="mb-6 flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-lg" />

        <div className="h-6 w-px bg-[#E3E6EA]" />

        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-6 w-40" />
        </div>
      </div>

      <div className="mb-6 flex flex-row gap-3">
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-10 flex-1 rounded-lg" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <StudentCardSkeleton key={index} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-24 rounded-xl"
          />
        ))}
      </div>
    </div>
  );
}

function StudentCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#DADDE3] bg-white">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <Skeleton className="h-11 w-11 shrink-0 rounded-full" />

          <div className="min-w-0 space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-48 max-w-full" />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Skeleton className="hidden h-8 w-16 sm:block" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function AssignGradesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedWeek, setSelectedWeek] = useState(1);

  const [expandedStudents, setExpandedStudents] =
    useState<Set<string>>(new Set());

  const [searchQuery, setSearchQuery] = useState('');

  const [editingGrades, setEditingGrades] =
    useState<Set<string>>(new Set());

  /* ------------------------------------------------------------------------ */
  /* Queries                                                                  */
  /* ------------------------------------------------------------------------ */

  const {
    data: studentsData,
    isLoading: studentsLoading,
    error: studentsError,
  } = useQuery({
    queryKey: ['grading-students'],
    queryFn: fetchStudents,
    retry: false,
  });

  const {
    data: scaleData,
    isLoading: scaleLoading,
  } = useQuery({
    queryKey: ['grade-scale'],
    queryFn: fetchGradeScale,
  });

  const {
    data: allGradesData,
    isLoading: allGradesLoading,
  } = useQuery({
    queryKey: ['all-grades'],
    queryFn: fetchAllGrades,
  });

  /* ------------------------------------------------------------------------ */
  /* Data                                                                     */
  /* ------------------------------------------------------------------------ */

  const students: User[] =
    studentsData?.studentsWithCourses || [];

  const studentsWithoutCourses: User[] =
    studentsData?.studentsWithoutCourses || [];

  const gradeScale: GradeScale[] =
    scaleData?.gradeScale || [];

  const allGrades: Grade[] =
    allGradesData?.grades || [];

  /* ------------------------------------------------------------------------ */
  /* Optimistic grade mutation                                                */
  /* ------------------------------------------------------------------------ */

  const submitGradeMutation = useMutation({
    mutationFn: submitGrade,

    onMutate: async (newGrade) => {
      await queryClient.cancelQueries({
        queryKey: ['all-grades'],
      });

      const previousGrades =
        queryClient.getQueryData<{ grades: Grade[] }>(
          ['all-grades']
        );

      const selectedGrade = gradeScale.find(
        (grade) =>
          grade.gradeLetter === newGrade.gradeLetter
      );

      queryClient.setQueryData<{ grades: Grade[] }>(
        ['all-grades'],
        (old) => {
          if (!old) {
            return old;
          }

          const existingIndex = old.grades.findIndex(
            (grade) =>
              grade.studentCourse?.id ===
                newGrade.studentCourseId &&
              grade.week === newGrade.week &&
              grade.studentId === newGrade.studentId
          );

          const optimisticGrade: Grade = {
            id:
              existingIndex >= 0
                ? old.grades[existingIndex].id
                : `optimistic-${newGrade.studentId}-${newGrade.studentCourseId}-${newGrade.week}`,

            studentId: newGrade.studentId,

            gradeLetter: newGrade.gradeLetter,

            gradePoints:
              selectedGrade?.gradePoints ?? 0,

            score: newGrade.score,

            week: newGrade.week,

            assignedAt: new Date().toISOString(),

            notes: newGrade.notes,

            studentCourse:
              existingIndex >= 0
                ? old.grades[existingIndex].studentCourse
                : {
                    id: newGrade.studentCourseId,
                    name: '',
                    code: '',
                    courseUnit: '',
                    credits: 0,
                  },

            teacher:
              existingIndex >= 0
                ? old.grades[existingIndex].teacher
                : undefined,
          };

          const updatedGrades = [...old.grades];

          if (existingIndex >= 0) {
            updatedGrades[existingIndex] = {
              ...updatedGrades[existingIndex],
              ...optimisticGrade,
            };
          } else {
            updatedGrades.push(optimisticGrade);
          }

          return {
            ...old,
            grades: updatedGrades,
          };
        }
      );

      /*
       * Optimistically update the student cache so completion
       * and grade-related UI can react immediately.
       */
      queryClient.setQueryData(
        ['grading-students'],
        (
          old:
            | {
                students: User[];
                studentsWithCourses?: User[];
                studentsWithoutCourses?: User[];
              }
            | undefined
        ) => {
          if (!old) return old;

          const updateStudents = (
            list: User[] | undefined
          ) => {
            if (!list) return list;

            return list.map((student) => {
              if (student.id !== newGrade.studentId) {
                return student;
              }

              const currentGradeCount =
                student.gradeCounts?.[newGrade.week] || 0;

              return {
                ...student,
                gradeCounts: {
                  ...student.gradeCounts,
                  [newGrade.week]:
                    currentGradeCount + 1,
                },
              };
            });
          };

          return {
            ...old,
            students: updateStudents(old.students) || [],
            studentsWithCourses: updateStudents(
              old.studentsWithCourses
            ),
            studentsWithoutCourses: updateStudents(
              old.studentsWithoutCourses
            ),
          };
        }
      );

      return {
        previousGrades,
      };
    },

    onError: (error, _variables, context) => {
      if (context?.previousGrades) {
        queryClient.setQueryData(
          ['all-grades'],
          context.previousGrades
        );
      }

      queryClient.invalidateQueries({
        queryKey: ['grading-students'],
      });

      console.error(
        'Error submitting grade:',
        error
      );
    },

    onSuccess: () => {
      /*
       * The optimistic grade is already visible.
       * The background refetch reconciles it with the
       * authoritative backend response.
       */
      queryClient.invalidateQueries({
        queryKey: ['all-grades'],
        refetchType: 'active',
      });
    },
  });

  /* ------------------------------------------------------------------------ */
  /* Grade organization                                                       */
  /* ------------------------------------------------------------------------ */

  const studentGrades = useMemo(() => {
    const result: Record<string, Grade[]> = {};

    if (!allGrades || !Array.isArray(allGrades)) {
      return result;
    }

    allGrades.forEach((grade) => {
      if (!result[grade.studentId]) {
        result[grade.studentId] = [];
      }

      result[grade.studentId].push(grade);
    });

    return result;
  }, [allGrades]);

  /* ------------------------------------------------------------------------ */
  /* Helpers                                                                  */
  /* ------------------------------------------------------------------------ */

  const toggleStudentExpansion = (
    studentId: string
  ) => {
    setExpandedStudents((previous) => {
      const next = new Set(previous);

      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }

      return next;
    });
  };

  const getGradeColor = (
    gradeLetter: string
  ) => {
    const grade = gradeLetter.toUpperCase();

    if (
      ['A', 'A+', 'A-'].includes(grade)
    ) {
      return 'bg-[#EEF7F0] text-[#356642] border-[#CFE5D4]';
    }

    if (
      ['B', 'B+', 'B-'].includes(grade)
    ) {
      return 'bg-[#EEF3F8] text-[#315B7D] border-[#D2E0EC]';
    }

    if (
      ['C', 'C+', 'C-'].includes(grade)
    ) {
      return 'bg-[#FBF6E9] text-[#896A2F] border-[#E9DDBB]';
    }

    if (
      ['D', 'D+', 'D-'].includes(grade)
    ) {
      return 'bg-[#FCF1E9] text-[#985B31] border-[#E9D1BD]';
    }

    return 'bg-[#FBEDEC] text-[#9B4439] border-[#E9CDCA]';
  };

  const getStudentCompletion = (
    studentId: string
  ) => {
    const student = students.find(
      (item) => item.id === studentId
    );

    const courses =
      student?.submittedCourses || [];

    const studentGradesList =
      studentGrades[studentId] || [];

    const gradedCourses =
      studentGradesList.filter(
        (grade) =>
          grade.week === selectedWeek
      ).length;

    return courses.length > 0
      ? Math.round(
          (gradedCourses / courses.length) * 100
        )
      : 0;
  };

  /* ------------------------------------------------------------------------ */
  /* Search                                                                   */
  /* ------------------------------------------------------------------------ */

  const filteredStudents = useMemo(() => {
    const search =
      searchQuery.trim().toLowerCase();

    if (!search) {
      return students;
    }

    return students.filter((student) => {
      const fullName =
        `${student.firstName} ${student.lastName}`.toLowerCase();

      const email =
        student.email.toLowerCase();

      const techCenter =
        student.techCenter?.name?.toLowerCase() ||
        '';

      return (
        fullName.includes(search) ||
        email.includes(search) ||
        techCenter.includes(search)
      );
    });
  }, [students, searchQuery]);

  const filteredStudentsWithoutCourses =
    useMemo(() => {
      const search =
        searchQuery.trim().toLowerCase();

      if (!search) {
        return studentsWithoutCourses;
      }

      return studentsWithoutCourses.filter(
        (student) => {
          const fullName =
            `${student.firstName} ${student.lastName}`.toLowerCase();

          const email =
            student.email.toLowerCase();

          const techCenter =
            student.techCenter?.name?.toLowerCase() ||
            '';

          return (
            fullName.includes(search) ||
            email.includes(search) ||
            techCenter.includes(search)
          );
        }
      );
    }, [studentsWithoutCourses, searchQuery]);

  /* ------------------------------------------------------------------------ */
  /* Grading                                                                  */
  /* ------------------------------------------------------------------------ */

  const handleGradeChange = async (
    studentId: string,
    courseId: string,
    gradeLetter: string
  ) => {
    if (!gradeLetter) {
      return;
    }

    const student = students.find(
      (item) => item.id === studentId
    );

    const course =
      student?.submittedCourses?.find(
        (item) => item.id === courseId
      );

    if (!course) {
      return;
    }

    const gradeKey =
      `${studentId}-${courseId}`;

    try {
      await submitGradeMutation.mutateAsync({
        studentCourseId: courseId,
        studentId,
        week: selectedWeek,
        gradeLetter,
        score: null,
        notes: null,
      });

      setEditingGrades((previous) => {
        const next = new Set(previous);

        next.delete(gradeKey);

        return next;
      });
    } catch (error) {
      console.error(
        'Failed to submit grade:',
        error
      );
    }
  };

  const toggleEditGrade = (
    studentId: string,
    courseId: string
  ) => {
    const key =
      `${studentId}-${courseId}`;

    setEditingGrades((previous) => {
      const next = new Set(previous);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  };

  /* ------------------------------------------------------------------------ */
  /* Statistics                                                               */
  /* ------------------------------------------------------------------------ */

  const weeks = [
    1, 2, 3, 4, 5, 6, 7,
  ];

  const totalCourses = students.reduce(
    (sum, student) =>
      sum +
      (student.submittedCourses?.length || 0),
    0
  );

  const totalStudents =
    students.length +
    studentsWithoutCourses.length;

  const totalGradesAssigned =
    allGrades.length;

  const gradesThisWeek =
    allGrades.filter(
      (grade) =>
        grade.week === selectedWeek
    ).length;

  const averageGradePoints =
    allGrades.length > 0
      ? (
          allGrades.reduce(
            (sum, grade) =>
              sum + grade.gradePoints,
            0
          ) / allGrades.length
        ).toFixed(2)
      : '0.00';

  const passingGrades =
    allGrades.filter(
      (grade) =>
        grade.gradePoints >= 2.0
    ).length;

  const passingRate =
    allGrades.length > 0
      ? Math.round(
          (passingGrades /
            allGrades.length) *
            100
        )
      : 0;

  const averageCompletion =
    students.length > 0
      ? Math.round(
          students.reduce(
            (sum, student) =>
              sum +
              getStudentCompletion(
                student.id
              ),
            0
          ) / students.length
        )
      : 0;

  const totalStudentsWithCourses =
    students.length;

  const totalStudentsWithoutCourses =
    studentsWithoutCourses.length;

  /* ------------------------------------------------------------------------ */
  /* Loading                                                                  */
  /* ------------------------------------------------------------------------ */

  if (
    studentsLoading ||
    scaleLoading ||
    allGradesLoading
  ) {
    return <PageSkeleton />;
  }

  /* ------------------------------------------------------------------------ */
  /* Error                                                                    */
  /* ------------------------------------------------------------------------ */

  if (studentsError) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] px-4 py-10 text-[#12203B]">
        <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-xl border border-[#DADDE3] bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF3F8]">
              <BookOpenCheck className="h-6 w-6 text-[#1A365D]" />
            </div>

            <h3 className="text-lg font-semibold">
              Access Restricted
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#6F7784]">
              Only teachers and admins can access
              the grading interface.
            </p>

            <button
              onClick={() =>
                router.push(
                  '/dashboard/grades'
                )
              }
              className="mt-5 inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium text-[#1A365D] transition-colors hover:bg-[#F1F4F7]"
            >
              View My Grades
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* UI                                                                       */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#12203B]">
      {/* Page Header */}
      <header className="mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#DADDE3] bg-white text-[#526075] transition hover:border-[#C9CDD4] hover:bg-[#F3F5F7] hover:text-[#12203B]"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="h-6 w-px bg-[#DADDE3]" />

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#7A8495]">
              Academic Management
            </p>

            <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-[#12203B] sm:text-2xl">
              Assign Grades
            </h1>
          </div>
        </div>
      </header>

      {/* Controls */}
      <section className="mb-5">
        <div className="flex flex-row gap-3">
          <div className="relative w-32 shrink-0">
            <label
              htmlFor="grading-week"
              className="sr-only"
            >
              Grading week
            </label>

            <select
              id="grading-week"
              value={selectedWeek}
              onChange={(event) =>
                setSelectedWeek(
                  parseInt(
                    event.target.value,
                    10
                  )
                )
              }
              className="h-10 w-full cursor-pointer appearance-none rounded-lg border border-[#DADDE3] bg-white px-3 pr-9 text-sm font-medium text-[#12203B] outline-none transition focus:border-[#1A365D] focus:ring-2 focus:ring-[#1A365D]/10"
            >
              {weeks.map((week) => (
                <option
                  key={week}
                  value={week}
                >
                  Week {week}
                </option>
              ))}
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A8495]" />
          </div>

          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A8495]" />

            <input
              type="search"
              placeholder="Search students, email or tech center..."
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(
                  event.target.value
                )
              }
              className="h-10 w-full rounded-lg border border-[#DADDE3] bg-white pl-9 pr-4 text-sm text-[#12203B] outline-none transition placeholder:text-[#8A919C] focus:border-[#1A365D] focus:ring-2 focus:ring-[#1A365D]/10"
            />
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {/* Total Students */}
        <div className="rounded-xl border border-[#DADDE3] bg-white p-4 shadow-[0_1px_2px_rgba(18,32,59,0.03)]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEF3F8]">
              <UsersRound className="h-4 w-4 text-[#1A365D]" />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide leading-tight text-[#8A919C]">
                Total Students
              </p>

              <p className="mt-0.5 text-lg font-semibold text-[#12203B]">
                {totalStudents}
              </p>
            </div>
          </div>
        </div>

        {/* With Courses */}
        <div className="rounded-xl border border-[#DADDE3] bg-white p-4 shadow-[0_1px_2px_rgba(18,32,59,0.03)]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEF7F0]">
              <CheckCircle2 className="h-4 w-4 text-[#4F7659]" />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide leading-tight text-[#8A919C]">
                With Courses
              </p>

              <p className="mt-0.5 text-lg font-semibold text-[#12203B]">
                {totalStudentsWithCourses}
              </p>
            </div>
          </div>
        </div>

        {/* Without Courses */}
        <div className="rounded-xl border border-[#DADDE3] bg-white p-4 shadow-[0_1px_2px_rgba(18,32,59,0.03)]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FBF5E9]">
              <BookOpenCheck className="h-4 w-4 text-[#A67A34]" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium uppercase tracking-wide leading-tight text-[#8A919C]">
                Without Courses
              </p>

              <p className="mt-0.5 text-lg font-semibold text-[#12203B]">
                {totalStudentsWithoutCourses}
              </p>
            </div>

            {totalStudentsWithoutCourses > 0 && (
              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    'students-without-courses'
                  )
                }
                className="flex shrink-0 items-center gap-1 text-xs font-medium text-[#1A365D] transition-colors hover:text-[#0A1F3D]"
                title="View students without courses"
                aria-label="View students without courses"
              >
                View
                <ChevronDown className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Total Courses */}
        <div className="rounded-xl border border-[#DADDE3] bg-white p-4 shadow-[0_1px_2px_rgba(18,32,59,0.03)]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEF3F8]">
              <BookOpenCheck className="h-4 w-4 text-[#1A365D]" />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide leading-tight text-[#8A919C]">
                Total Courses
              </p>

              <p className="mt-0.5 text-lg font-semibold text-[#12203B]">
                {totalCourses}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Small context line */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-[#7A8495]">
          {filteredStudents.length} student
          {filteredStudents.length !== 1
            ? 's'
            : ''}
          {searchQuery ? ' found' : ''} with
          courses
        </p>

        <p className="text-xs font-medium text-[#7A8495]">
          Week {selectedWeek}
        </p>
      </div>

      {/* Students with Courses */}
      <section className="space-y-3">
        {filteredStudents.length === 0 ? (
          <div className="rounded-xl border border-[#DADDE3] bg-white px-6 py-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#EEF3F8]">
              <UsersRound className="h-5 w-5 text-[#1A365D]" />
            </div>

            <h3 className="text-sm font-semibold text-[#12203B]">
              No students with courses found
            </h3>

            <p className="mt-1 text-sm text-[#7A8495]">
              Try adjusting your search criteria.
            </p>
          </div>
        ) : (
          filteredStudents.map((student) => {
            const isExpanded =
              expandedStudents.has(
                student.id
              );

            const courses =
              student.submittedCourses || [];

            const completion =
              getStudentCompletion(
                student.id
              );

            const studentGradesList =
              studentGrades[student.id] || [];

            const initials =
              `${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`.toUpperCase();

            return (
              <article
                key={student.id}
                className="overflow-hidden rounded-xl border border-[#DADDE3] bg-white shadow-[0_1px_2px_rgba(18,32,59,0.04)] transition-shadow hover:shadow-[0_4px_16px_rgba(18,32,59,0.06)]"
              >
                {/* Student summary */}
                <button
                  type="button"
                  onClick={() =>
                    toggleStudentExpansion(
                      student.id
                    )
                  }
                  className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition-colors hover:bg-[#FAFBFC] focus:outline-none focus-visible:bg-[#F6F8FA] sm:px-5"
                  aria-expanded={isExpanded}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {student.profileImageUrl ? (
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[#EEF1F4] ring-1 ring-[#DDE2E7]">
                        <Image
                          src={
                            student.profileImageUrl
                          }
                          alt={`${student.firstName} ${student.lastName}`}
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EEF3F8] text-sm font-semibold text-[#1A365D] ring-1 ring-[#DDE5EC]">
                        {initials}
                      </div>
                    )}

                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-semibold text-[#12203B] sm:text-[15px]">
                        {student.firstName}{' '}
                        {student.lastName}
                      </h2>

                      <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#7A8495]">
                        <span className="font-medium capitalize text-[#596372]">
                          {student.role.name}
                        </span>

                        <span className="text-[#C1C5CB]">
                          •
                        </span>

                        <span>
                          {courses.length}{' '}
                          course
                          {courses.length !== 1
                            ? 's'
                            : ''}
                        </span>

                        <span className="text-[#C1C5CB]">
                          •
                        </span>

                        <span className="font-medium text-[#596372]">
                          Week {selectedWeek}
                        </span>

                        {student.techCenter?.name && (
                          <>
                            <span className="hidden text-[#C1C5CB] sm:inline">
                              •
                            </span>

                            <span className="hidden truncate sm:inline">
                              {
                                student
                                  .techCenter
                                  .name
                              }
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    {/* Completion */}
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-xs font-semibold text-[#1A365D]">
                          {completion}%
                        </p>

                        <p className="text-[10px] text-[#8A919C]">
                          Complete
                        </p>
                      </div>

                      <div className="relative h-8 w-8">
                        <svg
                          className="h-8 w-8 -rotate-90"
                          viewBox="0 0 36 36"
                        >
                          <circle
                            cx="18"
                            cy="18"
                            r="15"
                            stroke="#E7E9EC"
                            strokeWidth="2.5"
                            fill="none"
                          />

                          <circle
                            cx="18"
                            cy="18"
                            r="15"
                            stroke="#1A365D"
                            strokeWidth="2.5"
                            fill="none"
                            strokeDasharray={`${completion * 0.942} 94.2`}
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    </div>

                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E0E3E7] bg-[#FAFBFC]">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-[#667080]" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-[#667080]" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded area */}
                {isExpanded && (
                  <div className="border-t border-[#E3E6EA] bg-[#FAFBFC]">
                    {courses.length === 0 ? (
                      <div className="px-6 py-10 text-center">
                        <BookOpenCheck className="mx-auto h-7 w-7 text-[#8A919C]" />

                        <p className="mt-2 text-sm font-medium text-[#596372]">
                          No courses enrolled
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-[#E8EAED]">
                        {courses.map((course) => {
                          const existingGrade =
                            studentGradesList.find(
                              (grade) =>
                                grade
                                  .studentCourse
                                  ?.id ===
                                  course.id &&
                                grade.week ===
                                  selectedWeek
                            );

                          const assignmentKey =
                            `${student.id}-${course.id}`;

                          const isSubmitting =
                            submitGradeMutation.isPending &&
                            submitGradeMutation
                              .variables
                              ?.studentId ===
                              student.id &&
                            submitGradeMutation
                              .variables
                              ?.studentCourseId ===
                              course.id;

                          const isGraded =
                            Boolean(
                              existingGrade
                            );

                          const isEditing =
                            editingGrades.has(
                              assignmentKey
                            );

                          return (
                            <div
                              key={course.id}
                              className="px-4 py-4 transition-colors hover:bg-white sm:px-5"
                            >
                              <div className="flex flex-row items-center justify-between gap-3">
                                {/* Course */}
                                <div className="min-w-0 flex-1">
                                  <div className="flex min-w-0 items-center gap-2">
                                    <h3 className="min-w-0 truncate text-sm font-semibold text-[#243044]">
                                      {course.courseUnit ||
                                        course.name}
                                    </h3>

                                    {isGraded &&
                                      !isEditing && (
                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#4F7659]" />
                                      )}
                                  </div>

                                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#7A8495]">
                                    <span className="font-medium text-[#657080]">
                                      {course.code}
                                    </span>

                                    <span className="text-[#C4C8CE]">
                                      •
                                    </span>

                                    <span>
                                      {
                                        course.credits
                                      }{' '}
                                      credit
                                      {course.credits !==
                                      1
                                        ? 's'
                                        : ''}
                                    </span>

                                    {existingGrade &&
                                      !isEditing && (
                                        <>
                                          {existingGrade.teacher && (
                                            <>
                                              <span className="text-[#C4C8CE]">
                                                •
                                              </span>

                                              <span>
                                                Grade Assigned by{' '}
                                                {
                                                  existingGrade
                                                    .teacher
                                                    .firstName
                                                }{' '}
                                                {
                                                  existingGrade
                                                    .teacher
                                                    .lastName
                                                }
                                              </span>
                                            </>
                                          )}
                                        </>
                                      )}
                                  </div>
                                </div>

                                {/* Grade control */}
                                <div className="flex shrink-0 items-center gap-2">
                                  {isGraded &&
                                  !isEditing &&
                                  existingGrade ? (
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`inline-flex min-w-12 items-center justify-center rounded-lg border px-3 py-1.5 text-sm font-bold ${getGradeColor(
                                          existingGrade.gradeLetter
                                        )}`}
                                      >
                                        {
                                          existingGrade.gradeLetter
                                        }
                                      </span>

                                      <span className="text-xs font-medium text-[#697382]">
                                        {
                                          existingGrade.gradePoints
                                        }{' '}
                                        pts
                                      </span>

                                      <button
                                        type="button"
                                        onClick={(
                                          event
                                        ) => {
                                          event.stopPropagation();

                                          toggleEditGrade(
                                            student.id,
                                            course.id
                                          );
                                        }}
                                        className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-[#7A8495] transition hover:bg-[#F0F2F4] hover:text-[#12203B]"
                                        title="Change grade"
                                        aria-label="Change grade"
                                      >
                                        <Edit3 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <div className="relative">
                                        <select
                                          value={
                                            existingGrade?.gradeLetter ||
                                            ''
                                          }
                                          onChange={(
                                            event
                                          ) =>
                                            handleGradeChange(
                                              student.id,
                                              course.id,
                                              event
                                                .target
                                                .value
                                            )
                                          }
                                          disabled={
                                            isSubmitting
                                          }
                                          className={`h-10 w-32 cursor-pointer appearance-none rounded-lg border bg-white px-3 pr-8 text-sm font-medium text-[#12203B] outline-none transition focus:border-[#1A365D] focus:ring-2 focus:ring-[#1A365D]/10 disabled:cursor-wait disabled:opacity-70 sm:w-40 ${
                                            isSubmitting
                                              ? 'border-[#B98A3E]/50'
                                              : 'border-[#DADDE3]'
                                          }`}
                                        >
                                          <option
                                            value=""
                                            disabled
                                          >
                                            Select Grade
                                          </option>

                                          {gradeScale.map(
                                            (
                                              grade
                                            ) => (
                                              <option
                                                key={
                                                  grade.id
                                                }
                                                value={
                                                  grade.gradeLetter
                                                }
                                              >
                                                {
                                                  grade.gradeLetter
                                                }{' '}
                                                -{' '}
                                                {
                                                  grade.gradePoints
                                                }{' '}
                                                pts
                                              </option>
                                            )
                                          )}
                                        </select>

                                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A8495]" />
                                      </div>

                                      {isSubmitting && (
                                        <span
                                          className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-[#B98A3E]"
                                          title="Saving grade"
                                          aria-label="Saving grade"
                                        />
                                      )}

                                      {isEditing && (
                                        <button
                                          type="button"
                                          onClick={(
                                            event
                                          ) => {
                                            event.stopPropagation();

                                            toggleEditGrade(
                                              student.id,
                                              course.id
                                            );
                                          }}
                                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#7A8495] transition hover:bg-[#F0F2F4] hover:text-[#12203B]"
                                          title="Cancel"
                                          aria-label="Cancel grade editing"
                                        >
                                          <X className="h-4 w-4" />
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })
        )}
      </section>

      {/* Students Without Courses */}
      {filteredStudentsWithoutCourses.length >
        0 && (
          <section
            id="students-without-courses"
            className="mt-6 scroll-mt-4 sm:scroll-mt-6"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-[#12203B]">
                Students Without Courses (
                {
                  filteredStudentsWithoutCourses.length
                }
                )
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredStudentsWithoutCourses.map(
                (student) => {
                  const initials =
                    `${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`.toUpperCase();

                  return (
                    <div
                      key={student.id}
                      className="flex items-center gap-3 rounded-xl border border-[#DADDE3] bg-white p-4 shadow-[0_1px_2px_rgba(18,32,59,0.04)]"
                    >
                      {student.profileImageUrl ? (
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#EEF1F4] ring-1 ring-[#DDE2E7]">
                          <Image
                            src={
                              student.profileImageUrl
                            }
                            alt={`${student.firstName} ${student.lastName}`}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF3F8] text-sm font-semibold text-[#1A365D] ring-1 ring-[#DDE5EC]">
                          {initials}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold text-[#12203B]">
                          {student.firstName}{' '}
                          {student.lastName}
                        </h3>

                        <p className="truncate text-xs text-[#7A8495]">
                          {student.email}
                        </p>
                      </div>

                      <div className="text-xs font-medium text-[#8A919C]">
                        No courses
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </section>
        )}
    </div>
  );
}