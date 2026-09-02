'use client';

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Landmark,
} from 'lucide-react';

export default function TempleTripsPage() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#12203B]">
      {/* Header */}
      <div className="mb-6">
        <p className="mb-1 text-xs font-medium uppercase tracking-[0.08em] text-[#7A8495]">
          Student Activities
        </p>

        <h1 className="text-xl font-semibold tracking-tight text-[#12203B] md:text-2xl">
          Temple Trips
        </h1>

        <p className="mt-1 text-sm text-[#667085]">
          View upcoming temple trips and register for the trips you would like
          to attend.
        </p>
      </div>

      {/* Main placeholder */}
      <div className="overflow-hidden rounded-2xl border border-[#DADDE3] bg-white">
        <div className="flex min-h-[500px] items-center justify-center px-5 py-12 md:px-8">
          <div className="w-full max-w-2xl text-center">
            {/* Icon */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#D9E0EA] bg-[#F4F7FA]">
              <Landmark className="h-8 w-8 text-[#1A365D]" />
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
              Temple trips will be available here
            </h2>

            {/* Description */}
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#667085] md:text-base">
              You will be able to view upcoming temple trip schedules, see the
              available details, and register yourself for the trips you would
              like to attend.
            </p>

            {/* Feature preview */}
            <div className="mx-auto mt-8 grid max-w-lg grid-cols-1 gap-3 text-left sm:grid-cols-2">
              <div className="rounded-xl border border-[#E1E4E8] bg-[#FAFBFC] p-4">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF3F8]">
                  <CalendarDays className="h-4 w-4 text-[#1A365D]" />
                </div>

                <p className="text-sm font-semibold text-[#25344D]">
                  View trip schedules
                </p>

                <p className="mt-1 text-xs leading-5 text-[#7A8495]">
                  See upcoming trips, dates, times, and other important details.
                </p>
              </div>

              <div className="rounded-xl border border-[#E1E4E8] bg-[#FAFBFC] p-4">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF3F8]">
                  <CheckCircle2 className="h-4 w-4 text-[#55705B]" />
                </div>

                <p className="text-sm font-semibold text-[#25344D]">
                  Register yourself
                </p>

                <p className="mt-1 text-xs leading-5 text-[#7A8495]">
                  Register for an upcoming temple trip directly from this page.
                </p>
              </div>
            </div>

            {/* Development notice */}
            <div className="mx-auto mt-8 max-w-xl rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] px-5 py-4">
              <div className="flex items-start gap-3 text-left">
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#7A8495]" />

                <p className="text-sm leading-6 text-[#667085]">
                  <span className="font-medium text-[#25344D]">
                    This section is being prepared.
                  </span>{' '}
                  Temple trip schedules and registration will be available here
                  once the feature is ready.
                </p>
              </div>
            </div>

            {/* Future action */}
            <div className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-[#1A365D]">
              <span>Trip registration coming soon</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}