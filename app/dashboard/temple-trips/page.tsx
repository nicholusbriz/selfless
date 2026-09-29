'use client';

import {
  ArrowRight,
  CalendarDays,
  Info,
  Landmark,
  User,
} from 'lucide-react';

// ============================================================
// ANNOUNCEMENT DATA
// ============================================================

const trip = {
  coordinator: 'Kiwanuka Tonny',
  coordinatorRole: 'Temple Trip Coordinator',
  title: 'Nairobi Kenya Temple Trip',
  subtitle: 'December 2026',
  flag: '🇰🇪',
  dateRange: '15th – 18th December 2026',
  location: 'Nairobi Kenya Temple',
  intro:
    'We are pleased to announce that during the last week of the next block, we will be having another Temple Trip to the Nairobi Kenya Temple from 15th to 18th December 2026. This will be a wonderful opportunity for members to worship in the temple, strengthen their faith, and participate in sacred ordinances.',
  requirements: [
    'Be a member of The Church of Jesus Christ of Latter-day Saints.',
    'Have a valid Temple Recommend, approved by an authorized Church leader such as a Bishop, Branch President, Mission President, District President, or Stake President.',
    'Have attended Temple Preparation classes.',
    'Have a valid passport or National ID.',
    'Have a valid Yellow Fever vaccination certificate/card.',
    'Contribute UGX 100,000 toward the trip starting this week.',
    'Be an active student enrolled in the program.',
    'Priority will be given to those attending the temple for the first time.',
  ],
  closing:
    'Thank you, and we look forward to worshipping together in Nairobi.',
};

export default function TempleTripsPage() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#12203B]">
      <div className="mx-auto max-w-4xl px-5 py-10 md:px-8 md:py-14">
        {/* Header */}
        <div className="mb-14">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-[#7A8495]">
            Student Activities
          </p>

          <h1 className="text-2xl font-semibold tracking-tight text-[#12203B] md:text-3xl">
            Temple Trips
          </h1>

          <p className="mt-3 text-base leading-7 text-[#667085]">
            View upcoming temple trips and register for the trips you would
            like to attend.
          </p>
        </div>

        {/* ==================================================== */}
        {/* ANNOUNCEMENT                                         */}
        {/* ==================================================== */}

        {/* Posted by */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EEF2F7]">
            <User className="h-5 w-5 text-[#1A365D]" />
          </div>

          <div>
            <p className="text-sm font-semibold text-[#25344D]">
              {trip.coordinator}
            </p>

            <p className="text-xs text-[#7A8495]">
              {trip.coordinatorRole}
            </p>
          </div>
        </div>

        {/* Title block */}
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.1em] text-[#A67A34]">
            {trip.flag} Upcoming Trip
          </p>

          <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-[#12203B] md:text-3xl">
            {trip.title}
          </h2>

          <p className="mt-1 text-lg font-semibold text-[#A67A34]">
            {trip.subtitle}
          </p>

          <div className="mt-6 space-y-3 text-sm text-[#667085]">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-4 w-4 shrink-0 text-[#1A365D]" />
              <span>{trip.dateRange}</span>
            </div>

            <div className="flex items-center gap-3">
              <Landmark className="h-4 w-4 shrink-0 text-[#1A365D]" />
              <span>{trip.location}</span>
            </div>
          </div>
        </div>

        {/* Intro */}
        <div className="mb-12">
          <p className="text-base leading-7 text-[#667085]">
            {trip.intro}
          </p>
        </div>

        {/* Requirements */}
        <div className="mb-12">
          <h3 className="mb-6 text-sm font-semibold uppercase tracking-[0.1em] text-[#7A8495]">
            Requirements for Participation
          </h3>

          <p className="mb-6 text-base leading-7 text-[#667085]">
            To participate in the temple trip, you must:
          </p>

          <ol className="space-y-4">
            {trip.requirements.map((requirement, index) => (
              <li key={index} className="flex gap-4">
                <span className="mt-0.5 w-5 shrink-0 text-right text-sm font-semibold text-[#A67A34]">
                  {index + 1}.
                </span>

                <p className="text-base leading-7 text-[#667085]">
                  {requirement}
                </p>
              </li>
            ))}
          </ol>
        </div>

        {/* Closing */}
        <div className="mb-14">
          <p className="text-base leading-7 text-[#667085]">
            {trip.closing}
          </p>
        </div>

        {/* Registration notice */}
        <div className="mb-14 flex gap-4">
          <Info className="mt-1 h-5 w-5 shrink-0 text-[#7A8495]" />

          <p className="text-base leading-7 text-[#667085]">
            Registration will open soon. Once it is ready, you will be able to
            register yourself for the trip directly from this page.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6">
          <div>
            <p className="text-base font-semibold text-[#25344D]">
              Want to be notified when registration opens?
            </p>

            <p className="mt-1 text-sm text-[#7A8495]">
              Keep an eye on announcements for updates.
            </p>
          </div>

          <a
            href="/dashboard/announcements"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-[#12203B]"
          >
            View announcements
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </div>
  );
}