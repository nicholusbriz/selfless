'use client';

import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Award,
  BookOpen,
  GraduationCap,
  Loader2,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/hooks/useAuth';
import { resolveGradeFromScore } from '@/lib/gpa-calculator';

interface GradeScale {
  id: string;
  gradeLetter: string;
  minScore: number;
  maxScore: number;
  gradePoints: number;
}

interface CourseGrade {
  id: string;
  gradeLetter: string;
  gradePoints: number;
  score: number | null;
  notes: string | null;
  assignedAt: string;
}

interface StudentCourse {
  id: string;
  name: string;
  code: string;
  courseUnit: string;
  credits: number;
  status: string;
  grade: CourseGrade | null;
}

interface StudentRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl: string | null;
  generalCourse: string | null;
  courses: StudentCourse[];
  gpa: number;
  totalPoints: number;
  totalCredits: number;
  gradedCredits: number;
  gradedCourses: number;
}

export default function AssignGradesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAdmin, isTeacher, isSuperAdmin, isLoading: authLoading } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [draftScores, setDraftScores] = useState<Record<string, string>>({});
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canManage = isAdmin() || isTeacher() || isSuperAdmin();

  const { data: scaleData } = useQuery<{ scales: GradeScale[] }>({
    queryKey: ['grade-scale'],
    queryFn: async () => {
      const res = await fetch('/api/grades/scale');
      if (!res.ok) throw new Error('Failed to load grade scale');
      return res.json();
    },
    enabled: canManage,
  });

  const {
    data,
    isLoading,
    error: loadError,
  } = useQuery<{ students: StudentRow[] }>({
    queryKey: ['manage-grades', searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      const res = await fetch(`/api/grades?${params.toString()}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to load students');
      }
      return res.json();
    },
    enabled: canManage,
    staleTime: 15000,
  });

  const students = data?.students ?? [];
  const selected =
    students.find((s) => s.id === selectedStudentId) ?? students[0] ?? null;

  const scales = scaleData?.scales ?? [];

  const saveMutation = useMutation({
    mutationFn: async (payload: {
      studentCourseId: string;
      score: number;
      notes?: string;
    }) => {
      const res = await fetch('/api/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Failed to save grade');
      return body;
    },
    onSuccess: () => {
      setMessage('Grade saved');
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['manage-grades'] });
    },
    onError: (err: Error) => {
      setError(err.message);
      setMessage(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (gradeId: string) => {
      const res = await fetch(`/api/grades?id=${gradeId}`, { method: 'DELETE' });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Failed to delete grade');
      return body;
    },
    onSuccess: () => {
      setMessage('Grade removed');
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['manage-grades'] });
    },
    onError: (err: Error) => {
      setError(err.message);
      setMessage(null);
    },
  });

  const previewLetter = useMemo(() => {
    return (courseId: string, existingScore: number | null) => {
      const raw = draftScores[courseId];
      const score =
        raw !== undefined && raw !== ''
          ? Number(raw)
          : existingScore;
      if (score === null || score === undefined || Number.isNaN(score)) {
        return null;
      }
      return resolveGradeFromScore(score, scales);
    };
  }, [draftScores, scales]);

  const handleSave = (course: StudentCourse) => {
    const raw =
      draftScores[course.id] !== undefined
        ? draftScores[course.id]
        : course.grade?.score != null
          ? String(course.grade.score)
          : '';
    const score = Number(raw);
    if (Number.isNaN(score)) {
      setError('Enter a valid mark between 0 and 100');
      return;
    }
    saveMutation.mutate({
      studentCourseId: course.id,
      score,
      notes: draftNotes[course.id] ?? course.grade?.notes ?? undefined,
    });
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-[#667085]">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="rounded-2xl border border-[#DADDE3] bg-white p-8 text-center">
        <p className="text-sm text-[#667085]">
          Only tutors and admins can assign grades.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#12203B]">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DADDE3] bg-white text-[#526075] transition-colors hover:bg-[#F3F5F7]"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="h-6 w-px bg-[#DADDE3]" />
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#7A8495]">
            Academic Management
          </p>
          <h1 className="text-xl font-semibold tracking-tight">Assign Grades</h1>
        </div>
      </div>

      {(message || error || loadError) && (
        <div
          className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
            error || loadError
              ? 'border-[#F0D9D2] bg-[#FDF6F4] text-[#A4462F]'
              : 'border-[#D8E7DB] bg-[#F3F8F4] text-[#3F6B4A]'
          }`}
        >
          {error ||
            (loadError instanceof Error
              ? loadError.message
              : message)}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* Student list */}
        <aside className="overflow-hidden rounded-2xl border border-[#DADDE3] bg-white">
          <div className="border-b border-[#E8EAEE] p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9AA3B2]" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search students"
                className="w-full rounded-xl border border-[#DADDE3] bg-[#F8F9FB] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#1A365D]/40"
              />
            </div>
            <p className="mt-3 flex items-center gap-2 text-xs text-[#7A8495]">
              <Users className="h-3.5 w-3.5" />
              {students.length} student{students.length === 1 ? '' : 's'}
            </p>
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-[#7A8495]">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : students.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-[#7A8495]">
                No students found. Students need enrolled courses before you can
                grade them.
              </p>
            ) : (
              students.map((student) => {
                const active =
                  (selectedStudentId ?? students[0]?.id) === student.id;
                return (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => {
                      setSelectedStudentId(student.id);
                      setMessage(null);
                      setError(null);
                    }}
                    className={`flex w-full items-start gap-3 border-b border-[#F0F2F5] px-4 py-3 text-left transition-colors ${
                      active ? 'bg-[#F4F7FA]' : 'hover:bg-[#FAFBFC]'
                    }`}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEF3F8] text-xs font-semibold text-[#1A365D]">
                      {student.firstName[0]}
                      {student.lastName[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="truncate text-xs text-[#7A8495]">
                        GPA {student.gpa.toFixed(2)} · {student.gradedCourses}/
                        {student.courses.length} graded
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Detail panel */}
        <section className="rounded-2xl border border-[#DADDE3] bg-white">
          {!selected ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
              <GraduationCap className="mb-3 h-8 w-8 text-[#1A365D]" />
              <p className="text-sm text-[#667085]">
                Select a student to enter marks and update their GPA.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E8EAEE] px-5 py-5">
                <div>
                  <h2 className="text-lg font-semibold">
                    {selected.firstName} {selected.lastName}
                  </h2>
                  <p className="mt-1 text-sm text-[#7A8495]">
                    {selected.generalCourse || 'No program listed'} ·{' '}
                    {selected.email}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-[#E1E4E8] bg-[#FAFBFC] px-3 py-2 text-center">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-[#7A8495]">
                      GPA
                    </p>
                    <p className="text-lg font-semibold tabular-nums">
                      {selected.gpa.toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#E1E4E8] bg-[#FAFBFC] px-3 py-2 text-center">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-[#7A8495]">
                      Points
                    </p>
                    <p className="text-lg font-semibold tabular-nums">
                      {selected.totalPoints.toFixed(1)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#E1E4E8] bg-[#FAFBFC] px-3 py-2 text-center">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-[#7A8495]">
                      Credits
                    </p>
                    <p className="text-lg font-semibold tabular-nums">
                      {selected.gradedCredits}/{selected.totalCredits}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-b border-[#F0F2F5] px-5 py-3 text-xs text-[#7A8495]">
                GPA = total points ÷ total credits (quality points = grade points ×
                course credits). Enter a mark (0–100); letter and points come from
                the grade scale.
              </div>

              {selected.courses.length === 0 ? (
                <div className="px-5 py-12 text-center text-sm text-[#7A8495]">
                  This student has no enrolled courses yet.
                </div>
              ) : (
                <div className="divide-y divide-[#F0F2F5]">
                  {selected.courses.map((course) => {
                    const draft =
                      draftScores[course.id] ??
                      (course.grade?.score != null
                        ? String(course.grade.score)
                        : '');
                    const preview = previewLetter(
                      course.id,
                      course.grade?.score ?? null
                    );

                    return (
                      <div key={course.id} className="px-5 py-4">
                        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-[#1A365D]" />
                              <p className="text-sm font-semibold">
                                {course.code} · {course.name || course.courseUnit}
                              </p>
                            </div>
                            <p className="mt-1 text-xs text-[#7A8495]">
                              {course.credits} credit
                              {course.credits === 1 ? '' : 's'} · {course.status}
                              {course.grade
                                ? ` · current ${course.grade.gradeLetter} (${course.grade.gradePoints})`
                                : ' · not graded'}
                            </p>
                          </div>
                          {course.grade && (
                            <button
                              type="button"
                              onClick={() =>
                                deleteMutation.mutate(course.grade!.id)
                              }
                              disabled={deleteMutation.isPending}
                              className="inline-flex items-center gap-1 rounded-lg border border-[#E8D5CF] px-2.5 py-1.5 text-xs font-medium text-[#A4462F] hover:bg-[#FDF6F4]"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="grid gap-3 sm:grid-cols-[120px_1fr_auto]">
                          <div>
                            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[#7A8495]">
                              Mark
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              step={0.1}
                              value={draft}
                              onChange={(e) =>
                                setDraftScores((prev) => ({
                                  ...prev,
                                  [course.id]: e.target.value,
                                }))
                              }
                              placeholder="0–100"
                              className="w-full rounded-xl border border-[#DADDE3] bg-[#F8F9FB] px-3 py-2.5 text-sm outline-none focus:border-[#1A365D]/40"
                            />
                          </div>

                          <div>
                            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[#7A8495]">
                              Notes (optional)
                            </label>
                            <input
                              type="text"
                              value={
                                draftNotes[course.id] ??
                                course.grade?.notes ??
                                ''
                              }
                              onChange={(e) =>
                                setDraftNotes((prev) => ({
                                  ...prev,
                                  [course.id]: e.target.value,
                                }))
                              }
                              placeholder="Optional note"
                              className="w-full rounded-xl border border-[#DADDE3] bg-[#F8F9FB] px-3 py-2.5 text-sm outline-none focus:border-[#1A365D]/40"
                            />
                          </div>

                          <div className="flex items-end gap-2">
                            <div className="min-w-[88px] rounded-xl border border-[#E1E4E8] bg-[#FAFBFC] px-3 py-2 text-center">
                              <p className="text-[10px] uppercase text-[#7A8495]">
                                Letter
                              </p>
                              <p className="text-sm font-semibold tabular-nums">
                                {preview?.gradeLetter ?? '—'}
                              </p>
                              <p className="text-[10px] text-[#7A8495]">
                                {preview
                                  ? `${preview.gradePoints.toFixed(1)} pts`
                                  : ''}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSave(course)}
                              disabled={saveMutation.isPending}
                              className="inline-flex h-[42px] items-center gap-2 rounded-xl bg-[#1A365D] px-4 text-sm font-semibold text-white hover:bg-[#153475] disabled:opacity-50"
                            >
                              {saveMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Award className="h-4 w-4" />
                              )}
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {scales.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-[#DADDE3] bg-white px-5 py-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.08em] text-[#7A8495]">
            Grade scale
          </p>
          <div className="flex flex-wrap gap-2">
            {scales.map((s) => (
              <span
                key={s.id}
                className="rounded-lg border border-[#E1E4E8] bg-[#FAFBFC] px-2.5 py-1 text-xs text-[#526075]"
              >
                <span className="font-semibold text-[#12203B]">{s.gradeLetter}</span>{' '}
                {s.minScore}–{s.maxScore} · {s.gradePoints}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
