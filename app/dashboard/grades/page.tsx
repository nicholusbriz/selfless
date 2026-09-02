'use client';

import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Clock3,
  GraduationCap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MyGradesPage() {
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
            Academic
          </p>
          <h1 className="text-xl font-semibold tracking-tight text-[#12203B]">
            My Grades
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
              Your grades will appear here
            </h2>

            {/* Description */}
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#667085] md:text-base">
              This page will allow you to view your academic grades and track
              your performance across your courses in one place.
            </p>

            {/* Feature preview */}
            <div className="mx-auto mt-8 grid max-w-lg grid-cols-1 gap-3 text-left sm:grid-cols-2">
              <div className="rounded-xl border border-[#E1E4E8] bg-[#FAFBFC] p-4">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF3F8]">
                  <BarChart3 className="h-4 w-4 text-[#1A365D]" />
                </div>

                <p className="text-sm font-semibold text-[#25344D]">
                  Academic performance
                </p>

                <p className="mt-1 text-xs leading-5 text-[#7A8495]">
                  Review your grades and monitor your progress.
                </p>
              </div>

              <div className="rounded-xl border border-[#E1E4E8] bg-[#FAFBFC] p-4">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#FBF5E9]">
                  <Clock3 className="h-4 w-4 text-[#A67A34]" />
                </div>

                <p className="text-sm font-semibold text-[#25344D]">
                  Course results
                </p>

                <p className="mt-1 text-xs leading-5 text-[#7A8495]">
                  Access your results as they become available.
                </p>
              </div>
            </div>

            {/* Development notice */}
            <div className="mx-auto mt-8 max-w-xl rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] px-5 py-4">
              <p className="text-sm leading-6 text-[#667085]">
                <span className="font-medium text-[#25344D]">
                  We&apos;re working on it.
                </span>{' '}
                Your grades section is currently being developed and will be
                available here once it is ready.
              </p>
            </div>

            {/* Back action */}
            <button
              onClick={() => router.back()}
              className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-[#1A365D] transition-colors hover:text-[#153475]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}