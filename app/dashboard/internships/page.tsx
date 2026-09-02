'use client';

import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Clock3,
  Search,
} from 'lucide-react';

export default function BrowseInternshipsPage() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#12203B]">
      {/* Header */}
      <div className="mb-6">
        <p className="mb-1 text-xs font-medium uppercase tracking-[0.08em] text-[#7A8495]">
          Career Opportunities
        </p>

        <h1 className="text-xl font-semibold tracking-tight text-[#12203B] md:text-2xl">
          Browse Internships
        </h1>

        <p className="mt-1 text-sm text-[#667085]">
          Explore internship opportunities available to students.
        </p>
      </div>

      {/* Main placeholder */}
      <div className="overflow-hidden rounded-2xl border border-[#DADDE3] bg-white">
        <div className="flex min-h-[500px] items-center justify-center px-5 py-12 md:px-8">
          <div className="w-full max-w-2xl text-center">
            {/* Icon */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#D9E0EA] bg-[#F4F7FA]">
              <BriefcaseBusiness className="h-8 w-8 text-[#1A365D]" />
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
              Internship opportunities will appear here
            </h2>

            {/* Description */}
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#667085] md:text-base">
              You will be able to browse available internship opportunities,
              explore organizations, and find placements that match your
              academic and career goals.
            </p>

            {/* Feature preview */}
            <div className="mx-auto mt-8 grid max-w-lg grid-cols-1 gap-3 text-left sm:grid-cols-2">
              <div className="rounded-xl border border-[#E1E4E8] bg-[#FAFBFC] p-4">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF3F8]">
                  <Search className="h-4 w-4 text-[#1A365D]" />
                </div>

                <p className="text-sm font-semibold text-[#25344D]">
                  Find opportunities
                </p>

                <p className="mt-1 text-xs leading-5 text-[#7A8495]">
                  Search and explore internship opportunities that interest
                  you.
                </p>
              </div>

              <div className="rounded-xl border border-[#E1E4E8] bg-[#FAFBFC] p-4">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#FBF5E9]">
                  <Building2 className="h-4 w-4 text-[#A67A34]" />
                </div>

                <p className="text-sm font-semibold text-[#25344D]">
                  Explore organizations
                </p>

                <p className="mt-1 text-xs leading-5 text-[#7A8495]">
                  Learn more about organizations offering internship
                  placements.
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
                  Internship listings and related opportunities will be added
                  here once the feature is ready.
                </p>
              </div>
            </div>

            {/* Future action indicator */}
            <div className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-[#1A365D]">
              <span>Internship listings coming soon</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}