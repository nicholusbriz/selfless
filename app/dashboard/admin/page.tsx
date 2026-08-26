'use client';

import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Home,
  Users,
  Shield,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
  Building2,
  UserRound,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  country?: string;
  city?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  isActive: boolean;
  createdAt: string;
  profileImageUrl?: string;
  techCenter?: {
    id: string;
    name: string;
    code: string;
  };
}

interface TechCenterData {
  users: AdminUser[];
  techCenter: {
    id: string;
    name: string;
    code: string;
  };
}

const TOKENS = {
  brand: '#1a365d',
  brandHover: '#14294a',
  brandLight: '#2c5282',
  brandSoft: '#eef2f8',
  success: '#17734b',
  successSoft: '#edf7f2',
  warning: '#8a5a00',
  warningSoft: '#fff8e7',
  danger: '#a52121',
  dangerSoft: '#fdf0f0',
  border: '#dfe5ec',
  borderStrong: '#cbd5e1',
  surface: '#ffffff',
  surfaceMuted: '#f8fafc',
  page: '#f4f6f9',
  text: '#172033',
  textMuted: '#64748b',
  textSoft: '#94a3b8',
};

const focusRing =
  'focus:outline-none focus:ring-2 focus:ring-[#1a365d]/20 focus:ring-offset-2';

function getStatusStyles(admin: AdminUser) {
  if (admin.status === 'SUSPENDED') {
    return {
      label: 'Suspended',
      icon: XCircle,
      text: 'text-[#a52121]',
      bg: 'bg-[#fdf0f0]',
      border: 'border-[#f1c8c8]',
    };
  }

  if (admin.isActive && admin.status === 'ACTIVE') {
    return {
      label: 'Active',
      icon: CheckCircle,
      text: 'text-[#17734b]',
      bg: 'bg-[#edf7f2]',
      border: 'border-[#c8e7d8]',
    };
  }

  return {
    label: 'Inactive',
    icon: XCircle,
    text: 'text-[#64748b]',
    bg: 'bg-[#f1f5f9]',
    border: 'border-[#dbe2ea]',
  };
}

function formatJoinedDate(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return 'Unknown date';
  }

  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`.toUpperCase();
}

export default function AdminOverviewPage() {
  const router = useRouter();

  const {
    data: techCenterData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin-tech-center-admins'],
    queryFn: async () => {
      const response = await fetch(
        '/api/admin/tech-centers/users?role=admin'
      );

      if (!response.ok) {
        throw new Error('Failed to fetch admin users');
      }

      return response.json() as Promise<TechCenterData>;
    },
  });

  const adminUsers = techCenterData?.users ?? [];
  const techCenter = techCenterData?.techCenter ?? adminUsers[0]?.techCenter;

  const activeCount = adminUsers.filter(
    (admin) => admin.isActive && admin.status === 'ACTIVE'
  ).length;

  const inactiveCount = adminUsers.filter(
    (admin) => !admin.isActive || admin.status !== 'ACTIVE'
  ).length;

  return (
    <main
      className="min-h-screen bg-[#f4f6f9] text-[#172033]"
      style={
        {
          '--brand': TOKENS.brand,
          '--brand-hover': TOKENS.brandHover,
          '--border': TOKENS.border,
        } as React.CSSProperties
      }
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Page navigation */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#dfe5ec] bg-white text-[#64748b] shadow-sm transition-colors hover:border-[#cbd5e1] hover:bg-[#f8fafc] hover:text-[#1a365d] ${focusRing}`}
            aria-label="Go back"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>

          <div className="mx-1 hidden h-6 w-px bg-[#dfe5ec] sm:block" />

          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#94a3b8]">
              Administration
            </p>
            <h1 className="truncate text-xl font-bold tracking-tight text-[#172033] sm:text-2xl">
              Admin Overview
            </h1>
          </div>
        </div>

        {/* Main panel */}
        <section className="overflow-hidden rounded-xl border border-[#dfe5ec] bg-white shadow-sm">
          {/* Section header */}
          <div className="border-b border-[#dfe5ec] px-5 py-5 sm:px-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#eef2f8] text-[#1a365d]">
                  <Shield className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-[#172033] sm:text-xl">
                      {techCenter?.name ?? 'Tech Center Administrators'}
                    </h2>

                    {techCenter?.code && (
                      <span className="rounded-md border border-[#dfe5ec] bg-[#f8fafc] px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">
                        {techCenter.code}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 max-w-2xl text-sm leading-6 text-[#64748b]">
                    Administrators assigned to manage this technology center
                    and support its day-to-day operations.
                  </p>
                </div>
              </div>

              {!isLoading && !error && adminUsers.length > 0 && (
                <div className="flex shrink-0 items-center gap-2">
                  <div className="rounded-lg border border-[#dfe5ec] bg-[#f8fafc] px-3 py-2">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-[#94a3b8]">
                      Total
                    </p>
                    <p className="mt-0.5 text-lg font-bold text-[#172033]">
                      {adminUsers.length}
                    </p>
                  </div>

                  <div className="rounded-lg border border-[#c8e7d8] bg-[#edf7f2] px-3 py-2">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-[#17734b]">
                      Active
                    </p>
                    <p className="mt-0.5 text-lg font-bold text-[#17734b]">
                      {activeCount}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-5 sm:p-7">
            {isLoading ? (
              <div
                className="flex min-h-[280px] flex-col items-center justify-center rounded-lg border border-dashed border-[#dfe5ec] bg-[#f8fafc]"
                role="status"
                aria-live="polite"
              >
                <Loader2 className="h-7 w-7 animate-spin text-[#1a365d]" />
                <p className="mt-3 text-sm font-medium text-[#64748b]">
                  Loading administrators...
                </p>
              </div>
            ) : error ? (
              <div
                className="flex min-h-[280px] flex-col items-center justify-center rounded-lg border border-[#f1c8c8] bg-[#fdf0f0] px-6 text-center"
                role="alert"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#a52121] shadow-sm">
                  <XCircle className="h-5 w-5" />
                </div>

                <h3 className="mt-4 text-base font-semibold text-[#172033]">
                  Unable to load administrators
                </h3>

                <p className="mt-1 max-w-md text-sm text-[#64748b]">
                  {error instanceof Error
                    ? error.message
                    : 'Something went wrong while loading the administrator list.'}
                </p>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className={`mt-5 inline-flex items-center rounded-lg bg-[#1a365d] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#14294a] ${focusRing}`}
                >
                  Try again
                </button>
              </div>
            ) : adminUsers.length === 0 ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center rounded-lg border border-dashed border-[#dfe5ec] bg-[#f8fafc] px-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef2f8] text-[#64748b]">
                  <Users className="h-6 w-6" />
                </div>

                <h3 className="mt-4 text-base font-semibold text-[#172033]">
                  No administrators found
                </h3>

                <p className="mt-1 max-w-md text-sm leading-6 text-[#64748b]">
                  There are currently no administrator accounts assigned to
                  this technology center.
                </p>
              </div>
            ) : (
              <div>
                {/* List heading */}
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-[#172033]">
                      Administrator Accounts
                    </h3>
                    <p className="mt-0.5 text-xs text-[#94a3b8]">
                      Contact and account information for the current
                      administrators.
                    </p>
                  </div>

                  {inactiveCount > 0 && (
                    <span className="inline-flex w-fit items-center rounded-md bg-[#f1f5f9] px-2.5 py-1 text-xs font-medium text-[#64748b]">
                      {inactiveCount} inactive or suspended
                    </span>
                  )}
                </div>

                {/* Desktop table */}
                <div className="hidden overflow-hidden rounded-lg border border-[#dfe5ec] md:block">
                  <div className="grid grid-cols-[minmax(220px,1.4fr)_minmax(200px,1fr)_minmax(160px,0.8fr)_130px] border-b border-[#dfe5ec] bg-[#f8fafc] px-5 py-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748b]">
                      Administrator
                    </div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748b]">
                      Contact
                    </div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748b]">
                      Location
                    </div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748b]">
                      Status
                    </div>
                  </div>

                  <div className="divide-y divide-[#dfe5ec]">
                    {adminUsers.map((admin) => {
                      const status = getStatusStyles(admin);
                      const StatusIcon = status.icon;

                      return (
                        <div
                          key={admin.id}
                          className="grid grid-cols-[minmax(220px,1.4fr)_minmax(200px,1fr)_minmax(160px,0.8fr)_130px] items-center px-5 py-4 transition-colors hover:bg-[#fbfcfd]"
                        >
                          {/* Administrator */}
                          <div className="flex min-w-0 items-center gap-3">
                            {admin.profileImageUrl ? (
                              <Image
                                src={admin.profileImageUrl}
                                alt={`${admin.firstName} ${admin.lastName}`}
                                width={42}
                                height={42}
                                unoptimized
                                className="h-10.5 w-10.5 shrink-0 rounded-full border border-[#dfe5ec] object-cover"
                              />
                            ) : (
                              <div className="flex h-10.5 w-10.5 shrink-0 items-center justify-center rounded-full bg-[#eef2f8] text-sm font-bold text-[#1a365d]">
                                {getInitials(
                                  admin.firstName,
                                  admin.lastName
                                )}
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-[#172033]">
                                {admin.firstName} {admin.lastName}
                              </p>

                              <div className="mt-1 flex items-center gap-1.5 text-xs text-[#94a3b8]">
                                <Calendar className="h-3.5 w-3.5 shrink-0" />
                                <span>
                                  Joined {formatJoinedDate(admin.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Contact */}
                          <div className="min-w-0 space-y-1.5 pr-4">
                            <div className="flex min-w-0 items-center gap-2 text-sm text-[#475569]">
                              <Mail className="h-3.5 w-3.5 shrink-0 text-[#94a3b8]" />
                              <span className="truncate">{admin.email}</span>
                            </div>

                            {admin.phoneNumber ? (
                              <div className="flex items-center gap-2 text-xs text-[#64748b]">
                                <Phone className="h-3.5 w-3.5 shrink-0 text-[#94a3b8]" />
                                <span>{admin.phoneNumber}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-[#94a3b8]">
                                No phone number
                              </span>
                            )}
                          </div>

                          {/* Location */}
                          <div className="min-w-0 pr-4">
                            {admin.city || admin.country ? (
                              <div className="flex items-start gap-2 text-sm text-[#475569]">
                                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#94a3b8]" />
                                <span className="truncate">
                                  {admin.city && admin.country
                                    ? `${admin.city}, ${admin.country}`
                                    : admin.city || admin.country}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-[#94a3b8]">
                                Location not provided
                              </span>
                            )}
                          </div>

                          {/* Status */}
                          <div>
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-semibold ${status.bg} ${status.border} ${status.text}`}
                            >
                              <StatusIcon className="h-3.5 w-3.5" />
                              {status.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile cards */}
                <div className="space-y-3 md:hidden">
                  {adminUsers.map((admin) => {
                    const status = getStatusStyles(admin);
                    const StatusIcon = status.icon;

                    return (
                      <article
                        key={admin.id}
                        className="rounded-lg border border-[#dfe5ec] bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            {admin.profileImageUrl ? (
                              <Image
                                src={admin.profileImageUrl}
                                alt={`${admin.firstName} ${admin.lastName}`}
                                width={42}
                                height={42}
                                unoptimized
                                className="h-10.5 w-10.5 shrink-0 rounded-full border border-[#dfe5ec] object-cover"
                              />
                            ) : (
                              <div className="flex h-10.5 w-10.5 shrink-0 items-center justify-center rounded-full bg-[#eef2f8] text-sm font-bold text-[#1a365d]">
                                {getInitials(
                                  admin.firstName,
                                  admin.lastName
                                )}
                              </div>
                            )}

                            <div className="min-w-0">
                              <h3 className="truncate text-sm font-semibold text-[#172033]">
                                {admin.firstName} {admin.lastName}
                              </h3>

                              <p className="mt-0.5 truncate text-xs text-[#94a3b8]">
                                Administrator
                              </p>
                            </div>
                          </div>

                          <span
                            className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold ${status.bg} ${status.border} ${status.text}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </span>
                        </div>

                        <div className="mt-4 space-y-2 border-t border-[#eef1f5] pt-4">
                          <div className="flex items-start gap-2.5 text-sm text-[#475569]">
                            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#94a3b8]" />
                            <span className="min-w-0 break-all">
                              {admin.email}
                            </span>
                          </div>

                          {admin.phoneNumber && (
                            <div className="flex items-center gap-2.5 text-sm text-[#475569]">
                              <Phone className="h-4 w-4 shrink-0 text-[#94a3b8]" />
                              <span>{admin.phoneNumber}</span>
                            </div>
                          )}

                          {(admin.city || admin.country) && (
                            <div className="flex items-start gap-2.5 text-sm text-[#475569]">
                              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#94a3b8]" />
                              <span>
                                {admin.city && admin.country
                                  ? `${admin.city}, ${admin.country}`
                                  : admin.city || admin.country}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-2.5 text-xs text-[#94a3b8]">
                            <Calendar className="h-4 w-4 shrink-0" />
                            <span>
                              Joined {formatJoinedDate(admin.createdAt)}
                            </span>
                          </div>

                          {admin.techCenter && (
                            <div className="flex items-center gap-2.5 pt-1 text-xs text-[#64748b]">
                              <Building2 className="h-4 w-4 shrink-0 text-[#94a3b8]" />
                              <span>{admin.techCenter.name}</span>
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Footer information */}
        {!isLoading && !error && adminUsers.length > 0 && (
          <div className="mt-4 flex items-center gap-2 px-1 text-xs text-[#94a3b8]">
            <UserRound className="h-3.5 w-3.5" />
            <span>
              {adminUsers.length}{' '}
              {adminUsers.length === 1
                ? 'administrator account'
                : 'administrator accounts'}{' '}
              associated with this center.
            </span>
          </div>
        )}
      </div>
    </main>
  );
}