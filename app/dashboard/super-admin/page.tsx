'use client';

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Shield,
  Users,
  School,
  Settings2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const sections = [
  {
    title: 'Tech Centers',
    description:
      'Manage technology centers, locations, and center-level information.',
    action: 'Open center management',
    href: '/dashboard/super-admin/centers',
    icon: School,
  },
  {
    title: 'Users',
    description:
      'Manage user accounts, roles, access, and account status across the platform.',
    action: 'Open user management',
    href: '/dashboard/super-admin/users',
    icon: Users,
  },
];

export default function SuperAdminOverviewPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#F7F8FA]">
      <div className="mx-auto max-w-[1500px] px-3 py-4 sm:px-5 lg:px-6 lg:py-5">
        {/* ---------------------------------------------------------------- */}
        {/* Header                                                            */}
        {/* ---------------------------------------------------------------- */}

        <header className="mb-6 flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => router.back()}
              aria-label="Go back"
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-[#E2E6EB] bg-white text-[#43516A] transition-colors hover:bg-[#F7F8FA] hover:text-[#12203B]"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="h-7 w-px bg-[#E2E6EB]" />

            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#EEF2F7] text-[#12203B]">
                <Shield className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h1
                  className="truncate text-xl font-semibold tracking-tight text-[#12203B] sm:text-2xl"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Super Admin
                </h1>

                <p className="truncate text-xs text-[#6F7B8D] sm:text-sm">
                  Platform administration and system oversight
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* ---------------------------------------------------------------- */}
        {/* Overview                                                         */}
        {/* ---------------------------------------------------------------- */}

        <section className="mb-7">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8A6E3A]">
              Overview
            </p>

            <h2 className="mt-1 text-lg font-semibold text-[#12203B]">
              Platform administration
            </h2>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-[#6F7B8D]">
              Access and manage the core resources that keep the platform
              running.
            </p>
          </div>

          {/* Quick overview cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* Tech Centers */}
            <button
              onClick={() =>
                router.push('/dashboard/super-admin/centers')
              }
              className="group flex items-center justify-between rounded-xl border border-[#E2E6EB] bg-white p-4 text-left transition-all duration-200 hover:border-[#D2D8E0] hover:shadow-sm"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#F8F3E8] text-[#8A6E3A]">
                  <School className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-[#6F7B8D]">
                    Resource
                  </p>

                  <h3 className="mt-0.5 text-sm font-semibold text-[#12203B]">
                    Tech Centers
                  </h3>
                </div>
              </div>

              <ArrowRight className="h-4 w-4 flex-shrink-0 text-[#8993A3] transition-transform group-hover:translate-x-0.5 group-hover:text-[#12203B]" />
            </button>

            {/* Users */}
            <button
              onClick={() =>
                router.push('/dashboard/super-admin/users')
              }
              className="group flex items-center justify-between rounded-xl border border-[#E2E6EB] bg-white p-4 text-left transition-all duration-200 hover:border-[#D2D8E0] hover:shadow-sm"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#EEF2F7] text-[#12203B]">
                  <Users className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-[#6F7B8D]">
                    Resource
                  </p>

                  <h3 className="mt-0.5 text-sm font-semibold text-[#12203B]">
                    Users
                  </h3>
                </div>
              </div>

              <ArrowRight className="h-4 w-4 flex-shrink-0 text-[#8993A3] transition-transform group-hover:translate-x-0.5 group-hover:text-[#12203B]" />
            </button>

            {/* System status */}
            <div className="flex items-center justify-between rounded-xl border border-[#E2E6EB] bg-white p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#EEF4EF] text-[#55705B]">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-[#6F7B8D]">
                    System
                  </p>

                  <h3 className="mt-0.5 text-sm font-semibold text-[#12203B]">
                    Operational
                  </h3>
                </div>
              </div>

              <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[#55705B]" />
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Administration                                                    */}
        {/* ---------------------------------------------------------------- */}

        <section className="mb-7">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8A6E3A]">
                Administration
              </p>

              <h2 className="mt-1 text-lg font-semibold text-[#12203B]">
                Manage platform resources
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {sections.map((section) => {
              const Icon = section.icon;

              return (
                <button
                  key={section.title}
                  onClick={() => router.push(section.href)}
                  className="group text-left"
                >
                  <div className="h-full rounded-xl border border-[#E2E6EB] bg-white p-5 transition-all duration-200 hover:border-[#D2D8E0] hover:shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-3.5">
                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#F7F8FA] text-[#12203B] transition-colors group-hover:bg-[#EEF2F7]">
                          <Icon className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-base font-semibold text-[#12203B]">
                            {section.title}
                          </h3>

                          <p className="mt-1.5 max-w-lg text-sm leading-5 text-[#6F7B8D]">
                            {section.description}
                          </p>
                        </div>
                      </div>

                      <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-[#8993A3] transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#12203B]" />
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-[#E2E6EB] pt-3.5">
                      <span className="text-xs font-medium text-[#43516A]">
                        {section.action}
                      </span>

                      <span className="text-xs text-[#8993A3]">
                        Manage
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* System information                                                */}
        {/* ---------------------------------------------------------------- */}

        <section>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8A6E3A]">
              System
            </p>

            <h2 className="mt-1 text-lg font-semibold text-[#12203B]">
              Platform status
            </h2>
          </div>

          <div className="rounded-xl border border-[#E2E6EB] bg-white">
            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EEF4EF] text-[#55705B]">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#55705B]" />

                    <p className="text-sm font-semibold text-[#12203B]">
                      All systems operational
                    </p>
                  </div>

                  <p className="mt-1 text-xs text-[#6F7B8D]">
                    Platform services are currently available.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 border-t border-[#E2E6EB] pt-3 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-[#8993A3]">
                    Access level
                  </p>

                  <p className="mt-0.5 text-sm font-medium text-[#12203B]">
                    Super Admin
                  </p>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-wide text-[#8993A3]">
                    Environment
                  </p>

                  <p className="mt-0.5 text-sm font-medium text-[#12203B]">
                    Production
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Future administration area                                        */}
        {/* ---------------------------------------------------------------- */}

        <section className="mt-7">
          <div className="rounded-xl border border-dashed border-[#D2D8E0] bg-white px-4 py-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#F7F8FA] text-[#6F7B8D]">
                <Settings2 className="h-4 w-4" />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#12203B]">
                  More administration tools
                </h3>

                <p className="mt-1 max-w-2xl text-xs leading-5 text-[#6F7B8D]">
                  As the platform grows, this area can include audit logs,
                  system configuration, permissions, announcements, and other
                  super-admin controls.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}