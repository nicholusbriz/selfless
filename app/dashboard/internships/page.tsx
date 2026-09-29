'use client';

import {
  ArrowRight,
  Bell,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Compass,
  Send,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';

const features = [
  {
    icon: Compass,
    title: 'Browse verified listings',
    description:
      'Explore internships from organizations that partner with Selfless CE.',
  },
  {
    icon: Bookmark,
    title: 'Save your favourites',
    description:
      'Bookmark internships you like and come back to them whenever you want.',
  },
  {
    icon: Send,
    title: 'Follow up on applications',
    description:
      'Track the internships you have applied to and follow up on your preferred ones.',
  },
  {
    icon: Bell,
    title: 'Get notified',
    description:
      'Receive alerts when new internships match your interests and goals.',
  },
];

const timeline = [
  {
    icon: CheckCircle2,
    label: 'Now',
    title: 'Feature in development',
    description: 'We are building the internship hub.',
    active: true,
  },
  {
    icon: Building2,
    label: 'Next',
    title: 'Organizations onboarded',
    description: 'Partner organizations are being verified.',
    active: false,
  },
  {
    icon: BriefcaseBusiness,
    label: 'Soon',
    title: 'Internships go live',
    description: 'Listings will appear here automatically.',
    active: false,
  },
];

export default function BrowseInternshipsPage() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#12203B]">
      <div className="mx-auto max-w-4xl px-5 py-10 md:px-8 md:py-14">
        {/* Header */}
        <div className="mb-14">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-[#7A8495]">
            Career Opportunities
          </p>

          <h1 className="text-2xl font-semibold tracking-tight text-[#12203B] md:text-3xl">
            Browse Internships
          </h1>

          <p className="mt-3 text-base leading-7 text-[#667085]">
            Explore internship opportunities available to students.
          </p>
        </div>

        {/* Intro */}
        <div className="mb-14">
          <h2 className="text-2xl font-semibold leading-snug tracking-tight text-[#12203B] md:text-3xl">
            Internships will appear here.
          </h2>

          <p className="mt-4 text-base leading-7 text-[#667085]">
            Once the feature launches, you&apos;ll be able to browse verified
            listings, save your favourites, and follow up on your preferred
            internships — all in one place.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[#7A8495]">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span>Matched to your goals</span>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Verified organizations</span>
            </div>

            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Track your applications</span>
            </div>
          </div>
        </div>

        {/* What you'll be able to do */}
        <div className="mb-14">
          <h3 className="mb-6 text-sm font-semibold uppercase tracking-[0.1em] text-[#7A8495]">
            What you&apos;ll be able to do
          </h3>

          <div className="space-y-6">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div key={feature.title} className="flex gap-4">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#1A365D]" />

                  <div>
                    <p className="text-base font-semibold text-[#25344D]">
                      {feature.title}
                    </p>

                    <p className="mt-1 text-sm leading-6 text-[#7A8495]">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-14">
          <h3 className="mb-6 text-sm font-semibold uppercase tracking-[0.1em] text-[#7A8495]">
            What happens next
          </h3>

          <div className="space-y-6">
            {timeline.map((step) => {
              const Icon = step.icon;

              return (
                <div key={step.title} className="flex gap-4">
                  <Icon
                    className={`mt-0.5 h-5 w-5 shrink-0 ${
                      step.active ? 'text-[#B98A3E]' : 'text-[#9AA4B2]'
                    }`}
                  />

                  <div>
                    <p
                      className={`text-xs font-semibold uppercase tracking-wider ${
                        step.active ? 'text-[#A67A34]' : 'text-[#9AA4B2]'
                      }`}
                    >
                      {step.label}
                    </p>

                    <p className="mt-1 text-base font-semibold text-[#25344D]">
                      {step.title}
                    </p>

                    <p className="mt-0.5 text-sm leading-6 text-[#7A8495]">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Closing note */}
        <div className="mb-14">
          <p className="text-base leading-7 text-[#667085]">
            Nothing to do yet. Internship listings will be added here
            automatically as soon as the feature is ready. You&apos;ll be
            notified.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6">
          <div>
            <p className="text-base font-semibold text-[#25344D]">
              Want to be ready when internships go live?
            </p>

            <p className="mt-1 text-sm text-[#7A8495]">
              Keep your profile and CV up to date in the meantime.
            </p>
          </div>

          <a
            href="/dashboard/profile"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-[#12203B]"
          >
            Update your profile
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </div>
  );
}