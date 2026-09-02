'use client';

import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  GraduationCap,
  UsersRound,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AssignGradesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#12203B]">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DADDE3] bg-white text-[#526075] transition-colors hover:border-[#C8CDD5] hover:bg-[#F3F5F7] hover:text-[#12203B]"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="h-6 w-px bg-[#DADDE3]" />

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#7A8495]">
            Academic Management
          </p>

          <h1 className="text-xl font-semibold tracking-tight text-[#12203B]">
            Assign Grades
          </h1>
        </div>
      </div>

      {/* Main placeholder */}
      <div className="overflow-hidden rounded-2xl border border-[#DADDE3] bg-white">
        <div className="flex min-h-[520px] items-center justify-center px-5 py-12 md:px-8">
          <div className="w-full max-w-2xl text-center">
            {/* Icon */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#D9E0EA] bg-[#F4F7FA]">
              <GraduationCap className="h-8 w-8 text-[#1A365D]" />
            </div>

            {/* Status */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E5D8BC] bg-[#FBF7EE] px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#B98A3E]" />

              <span className="text-xs font-medium text-[#80652F]">
                Currently under development
              </span>
            </div>

            {/* Heading */}
            <h2 className="text-2xl font-semibold tracking-tight text-[#12203B] md:text-3xl">
              Grade management will be available here
            </h2>

            {/* Description */}
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#667085] md:text-base">
              You will be able to select your courses and students, enter their
              grades, and submit academic results directly from this page.
            </p>

            {/* Feature preview */}
            <div className="mx-auto mt-8 grid max-w-lg grid-cols-1 gap-3 text-left sm:grid-cols-2">
              <div className="rounded-xl border border-[#E1E4E8] bg-[#FAFBFC] p-4">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF3F8]">
                  <BookOpenCheck className="h-4 w-4 text-[#1A365D]" />
                </div>

                <p className="text-sm font-semibold text-[#25344D]">
                  Select courses
                </p>

                <p className="mt-1 text-xs leading-5 text-[#7A8495]">
                  Choose the course or academic class whose grades you need to
                  manage.
                </p>
              </div>

              <div className="rounded-xl border border-[#E1E4E8] bg-[#FAFBFC] p-4">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF3F8]">
                  <UsersRound className="h-4 w-4 text-[#1A365D]" />
                </div>

                <p className="text-sm font-semibold text-[#25344D]">
                  Enter student grades
                </p>

                <p className="mt-1 text-xs leading-5 text-[#7A8495]">
                  Record and manage grades for students enrolled in your
                  selected course.
                </p>
              </div>
            </div>

            {/* Future workflow */}
            <div className="mx-auto mt-8 flex max-w-xl flex-wrap items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-medium text-[#526075]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white border border-[#DADDE3]">
                  1
                </span>
                Select course
              </div>

              <ArrowRight className="h-3.5 w-3.5 text-[#A0A8B5]" />

              <div className="flex items-center gap-2 text-xs font-medium text-[#526075]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white border border-[#DADDE3]">
                  2
                </span>
                Enter grades
              </div>

              <ArrowRight className="h-3.5 w-3.5 text-[#A0A8B5]" />

              <div className="flex items-center gap-2 text-xs font-medium text-[#526075]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white border border-[#DADDE3]">
                  3
                </span>
                Submit results
              </div>
            </div>

            {/* Development notice */}
            <div className="mx-auto mt-6 max-w-xl rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] px-5 py-4">
              <div className="flex items-start gap-3 text-left">
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#7A8495]" />

                <p className="text-sm leading-6 text-[#667085]">
                  <span className="font-medium text-[#25344D]">
                    This section is being prepared.
                  </span>{' '}
                  Grade entry and submission tools will be available here once
                  the feature is ready.
                </p>
              </div>
            </div>

            {/* Future action */}
            <div className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-[#1A365D]">
              <CheckCircle2 className="h-4 w-4" />
              <span>Grade management coming soon</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}