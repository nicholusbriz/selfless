'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
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
  Clock,
  AlertCircle,
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

interface PendingUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  country?: string;
  city?: string;
  createdAt: string;
  profileImageUrl?: string;
  techCenter?: {
    id: string;
    name: string;
    code: string;
  };
  gender?: string;
}

interface TechCenterData {
  users: AdminUser[];
  techCenter: {
    id: string;
    name: string;
    code: string;
  };
}

const focusRing =
  'focus:outline-none focus:ring-2 focus:ring-[#12203B]/20 focus:ring-offset-2';

function getStatusStyles(admin: AdminUser) {
  if (admin.status === 'SUSPENDED') {
    return {
      label: 'Suspended',
      icon: XCircle,
      text: 'text-[#A52121]',
      bg: 'bg-[#FDF0F0]',
      border: 'border-[#E9C7C7]',
    };
  }

  if (admin.isActive && admin.status === 'ACTIVE') {
    return {
      label: 'Active',
      icon: CheckCircle,
      text: 'text-[#17734B]',
      bg: 'bg-[#EDF7F2]',
      border: 'border-[#C8E7D8]',
    };
  }

  return {
    label: 'Inactive',
    icon: XCircle,
    text: 'text-[#647065]',
    bg: 'bg-[#F1F3EF]',
    border: 'border-[#D9DDD5]',
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

function UserAvatar({
  firstName,
  lastName,
  imageUrl,
  size = 'normal',
}: {
  firstName: string;
  lastName: string;
  imageUrl?: string;
  size?: 'normal' | 'large';
}) {
  const sizeClass = size === 'large' ? 'h-11 w-11' : 'h-10 w-10';

  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={`${firstName} ${lastName}`}
        width={48}
        height={48}
        unoptimized
        className={`${sizeClass} shrink-0 rounded-full border border-[#DADCD3] object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-[#EEF2F8] text-sm font-bold text-[#12203B]`}
    >
      {getInitials(firstName, lastName)}
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  iconClassName,
  title,
  description,
  count,
}: {
  icon: typeof Clock;
  iconClassName: string;
  title: string;
  description: string;
  count?: number;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
      >
        <Icon className="h-[18px] w-[18px]" />
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base font-bold tracking-tight text-[#12203B] sm:text-lg">
            {title}
          </h2>

          {typeof count === 'number' && (
            <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-[#12203B] px-2 py-0.5 text-[11px] font-bold text-white">
              {count}
            </span>
          )}
        </div>

        <p className="mt-0.5 max-w-2xl text-sm leading-5 text-[#6B7268]">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function AdminOverviewPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  /*
   * ADMINISTRATORS
   */
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

  /*
   * PENDING REGISTRATIONS
   */
  const {
    data: pendingUsers,
    isLoading: isLoadingPending,
    error: pendingError,
  } = useQuery({
    queryKey: ['pending-approvals'],
    queryFn: async () => {
      const response = await fetch('/api/admin/pending-approvals');

      if (!response.ok) {
        throw new Error('Failed to fetch pending approvals');
      }

      return response.json() as Promise<PendingUser[]>;
    },
  });

  /*
   * APPROVE USER
   */
  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch('/api/admin/approve-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action: 'approve',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve user');
      }

      return response.json();
    },

    onMutate: async (userId: string) => {
      await queryClient.cancelQueries({
        queryKey: ['pending-approvals'],
      });

      const previousUsers = queryClient.getQueryData<PendingUser[]>([
        'pending-approvals',
      ]);

      queryClient.setQueryData<PendingUser[]>(
        ['pending-approvals'],
        (old = []) => old.filter((user) => user.id !== userId)
      );

      return { previousUsers };
    },

    onSuccess: () => {
      alert('Account verified successfully!');
    },

    onError: (error, variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(
          ['pending-approvals'],
          context.previousUsers
        );
      }

      alert(error.message);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['pending-approvals'],
      });

      queryClient.invalidateQueries({
        queryKey: ['admin-tech-center-admins'],
      });
    },
  });

  /*
   * REJECT USER
   */
  const rejectMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch('/api/admin/approve-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action: 'reject',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.error || 'Failed to reject user');
      }

      return response.json();
    },

    onMutate: async (userId: string) => {
      await queryClient.cancelQueries({
        queryKey: ['pending-approvals'],
      });

      const previousUsers = queryClient.getQueryData<PendingUser[]>([
        'pending-approvals',
      ]);

      queryClient.setQueryData<PendingUser[]>(
        ['pending-approvals'],
        (old = []) => old.filter((user) => user.id !== userId)
      );

      return { previousUsers };
    },

    onSuccess: () => {
      alert('User rejected and account deleted successfully!');
    },

    onError: (error, variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(
          ['pending-approvals'],
          context.previousUsers
        );
      }

      alert(error.message);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['pending-approvals'],
      });
    },
  });

  const handleApprove = (userId: string) => {
    approveMutation.mutate(userId);
  };

  const handleReject = (userId: string) => {
    if (
      confirm('Are you sure you want to reject this registration?')
    ) {
      rejectMutation.mutate(userId);
    }
  };

  const adminUsers = techCenterData?.users ?? [];

  const techCenter =
    techCenterData?.techCenter ?? adminUsers[0]?.techCenter;

  const activeCount = adminUsers.filter(
    (admin) => admin.isActive && admin.status === 'ACTIVE'
  ).length;

  const inactiveCount = adminUsers.filter(
    (admin) => !admin.isActive || admin.status !== 'ACTIVE'
  ).length;

  const pendingCount = pendingUsers?.length ?? 0;

  return (
    <main className="min-h-screen bg-[#F1F1EC] text-[#12203B]">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        {/* PAGE HEADER */}
        <header className="mb-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#DADCD3] bg-white text-[#6B7268] transition hover:border-[#C9CCC3] hover:bg-[#F7F6F2] hover:text-[#12203B] ${focusRing}`}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="h-6 w-px bg-[#DADCD3]" />

            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A9088]">
                Administration
              </p>

              <h1 className="mt-0.5 truncate text-xl font-bold tracking-tight text-[#12203B] sm:text-2xl">
                Admin Overview
              </h1>
            </div>
          </div>
        </header>

        {/* =========================================================
            PRIORITY AREA — PENDING REGISTRATIONS
           ========================================================= */}
        <section className="overflow-hidden rounded-xl border border-[#DADCD3] bg-white">
          {/* Header */}
          <div className="border-b border-[#DADCD3] px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <SectionTitle
                icon={Clock}
                iconClassName="bg-[#FFF8E7] text-[#8A5A00]"
                title="Pending Registrations"
                description="Review new registrations before granting dashboard access."
                count={!isLoadingPending ? pendingCount : undefined}
              />

              {pendingCount > 0 && (
                <div className="hidden shrink-0 items-center gap-2 sm:flex">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-[#FFF8E7] px-2.5 py-1.5 text-xs font-semibold text-[#8A5A00]">
                    <Clock className="h-3.5 w-3.5" />
                    Action required
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="px-4 py-4 sm:px-5">
            {/* Loading */}
            {isLoadingPending ? (
              <div className="space-y-3" role="status" aria-live="polite">
                {[1, 2].map((item) => (
                  <div
                    key={item}
                    className="flex animate-pulse items-center justify-between rounded-lg border border-[#DADCD3] px-4 py-3.5"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-40 rounded bg-[#E8E9E4]" />
                      <div className="h-3 w-28 rounded bg-[#EEF0EB]" />
                    </div>
                    <div className="flex gap-3">
                      <div className="h-3 w-14 rounded bg-[#EEF0EB]" />
                      <div className="h-3 w-12 rounded bg-[#EEF0EB]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : pendingError ? (
              <div
                className="flex min-h-[180px] flex-col items-center justify-center rounded-lg border border-[#E9C7C7] bg-[#FDF0F0] px-6 text-center"
                role="alert"
              >
                <AlertCircle className="h-6 w-6 text-[#A52121]" />

                <h3 className="mt-3 text-sm font-semibold text-[#12203B]">
                  Unable to load registrations
                </h3>

                <p className="mt-1 max-w-md text-xs leading-5 text-[#6B7268]">
                  {pendingError instanceof Error
                    ? pendingError.message
                    : 'Something went wrong while loading pending registrations.'}
                </p>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className={`mt-4 rounded-lg bg-[#12203B] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1B2D4F] ${focusRing}`}
                >
                  Try again
                </button>
              </div>
            ) : pendingCount === 0 ? (
              <div className="flex min-h-[160px] flex-col items-center justify-center rounded-lg border border-dashed border-[#DADCD3] bg-[#F7F6F2] px-6 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EDF7F2] text-[#17734B]">
                  <CheckCircle className="h-5 w-5" />
                </div>

                <h3 className="mt-3 text-sm font-semibold text-[#12203B]">
                  All registrations are processed
                </h3>

                <p className="mt-1 max-w-md text-xs leading-5 text-[#6B7268]">
                  New registrations requiring approval will appear here.
                </p>
              </div>
            ) : (
              /* ROW LIST — same layout on desktop and mobile */
              <div className="divide-y divide-[#E6E8E1]">
                {pendingUsers!.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 py-3.5 sm:gap-4 sm:py-4"
                  >
                    {/* Name + Tech Center + Registered date stacked */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-[#12203B] sm:text-sm">
                        {user.firstName} {user.lastName}
                      </p>

                      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#6B7268] sm:text-xs">
                        {user.techCenter ? (
                          <>
                            <Building2 className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
                            <span className="truncate">
                              {user.techCenter.name}
                            </span>
                          </>
                        ) : (
                          <span className="text-[#8A9088]">
                            No tech center
                          </span>
                        )}
                      </div>

                      <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[#8A9088] sm:text-[11px]">
                        <Calendar className="h-3 w-3 shrink-0" />
                        <span>
                          Registered {formatJoinedDate(user.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Text-only action buttons with underline */}
                    <button
                      type="button"
                      onClick={() => handleApprove(user.id)}
                      disabled={approveMutation.isPending}
                      className={`shrink-0 rounded px-1.5 py-1 text-[12px] font-semibold text-[#17734B] underline underline-offset-2 transition hover:bg-[#EDF7F2] hover:no-underline disabled:cursor-not-allowed disabled:opacity-50 sm:text-[13px] ${focusRing}`}
                    >
                      {approveMutation.isPending &&
                      approveMutation.variables === user.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        'Approve'
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReject(user.id)}
                      disabled={rejectMutation.isPending}
                      className={`shrink-0 rounded px-1.5 py-1 text-[12px] font-semibold text-[#A52121] underline underline-offset-2 transition hover:bg-[#FDF0F0] hover:no-underline disabled:cursor-not-allowed disabled:opacity-50 sm:text-[13px] ${focusRing}`}
                    >
                      {rejectMutation.isPending &&
                      rejectMutation.variables === user.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        'Reject'
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* =========================================================
            ADMINISTRATORS
           ========================================================= */}
        <section className="mt-8 overflow-hidden rounded-xl border border-[#DADCD3] bg-white">
          {/* Header */}
          <div className="border-b border-[#DADCD3] px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <SectionTitle
                icon={Shield}
                iconClassName="bg-[#EEF2F8] text-[#12203B]"
                title={
                  techCenter?.name
                    ? `${techCenter.name} Administrators`
                    : 'Administrators'
                }
                description="Manage administrator accounts assigned to this technology center."
              />

              {!isLoading && !error && (
                <div className="flex items-center gap-2">
                  <div className="rounded-md border border-[#DADCD3] bg-[#F7F6F2] px-3 py-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-[#8A9088]">
                      Total
                    </span>

                    <span className="ml-2 text-sm font-bold text-[#12203B]">
                      {adminUsers.length}
                    </span>
                  </div>

                  <div className="rounded-md border border-[#C8E7D8] bg-[#EDF7F2] px-3 py-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-[#17734B]">
                      Active
                    </span>

                    <span className="ml-2 text-sm font-bold text-[#17734B]">
                      {activeCount}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {techCenter?.code && (
              <div className="mt-3 flex items-center gap-2 text-[11px] text-[#8A9088]">
                <Building2 className="h-3.5 w-3.5" />

                <span>Technology center code:</span>

                <span className="font-semibold text-[#4B564C]">
                  {techCenter.code}
                </span>

                {inactiveCount > 0 && (
                  <>
                    <span className="mx-1 h-3 w-px bg-[#DADCD3]" />

                    <span>{inactiveCount} inactive or suspended</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="px-4 py-4 sm:px-5">
            {isLoading ? (
              <div className="space-y-2" role="status" aria-live="polite">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="flex animate-pulse items-center gap-3 rounded-lg border border-[#DADCD3] p-4"
                  >
                    <div className="h-10 w-10 rounded-full bg-[#E8E9E4]" />

                    <div className="flex-1">
                      <div className="h-3.5 w-40 rounded bg-[#E8E9E4]" />

                      <div className="mt-2 h-3 w-56 rounded bg-[#EEF0EB]" />
                    </div>

                    <div className="hidden h-7 w-16 rounded bg-[#EEF0EB] sm:block" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div
                className="flex min-h-[180px] flex-col items-center justify-center rounded-lg border border-[#E9C7C7] bg-[#FDF0F0] px-6 text-center"
                role="alert"
              >
                <XCircle className="h-6 w-6 text-[#A52121]" />

                <h3 className="mt-3 text-sm font-semibold text-[#12203B]">
                  Unable to load administrators
                </h3>

                <p className="mt-1 max-w-md text-xs leading-5 text-[#6B7268]">
                  {error instanceof Error
                    ? error.message
                    : 'Something went wrong while loading the administrator list.'}
                </p>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className={`mt-4 rounded-lg bg-[#12203B] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1B2D4F] ${focusRing}`}
                >
                  Try again
                </button>
              </div>
            ) : adminUsers.length === 0 ? (
              <div className="flex min-h-[160px] flex-col items-center justify-center rounded-lg border border-dashed border-[#DADCD3] bg-[#F7F6F2] px-6 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EEF2F8] text-[#6B7268]">
                  <Users className="h-5 w-5" />
                </div>

                <h3 className="mt-3 text-sm font-semibold text-[#12203B]">
                  No administrators assigned
                </h3>

                <p className="mt-1 max-w-md text-xs leading-5 text-[#6B7268]">
                  There are currently no administrator accounts assigned to
                  this technology center.
                </p>
              </div>
            ) : (
              <>
                {/* DESKTOP ADMIN TABLE */}
                <div className="hidden overflow-hidden rounded-lg border border-[#DADCD3] md:block">
                  <div className="grid grid-cols-[minmax(220px,1.35fr)_minmax(220px,1fr)_minmax(160px,.8fr)_120px] border-b border-[#DADCD3] bg-[#F7F6F2] px-4 py-3">
                    <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7268]">
                      Administrator
                    </div>

                    <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7268]">
                      Contact
                    </div>

                    <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7268]">
                      Location
                    </div>

                    <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7268]">
                      Status
                    </div>
                  </div>

                  <div className="divide-y divide-[#E6E8E1]">
                    {adminUsers.map((admin) => {
                      const status = getStatusStyles(admin);
                      const StatusIcon = status.icon;

                      return (
                        <div
                          key={admin.id}
                          className="grid grid-cols-[minmax(220px,1.35fr)_minmax(220px,1fr)_minmax(160px,.8fr)_120px] items-center px-4 py-4 transition-colors hover:bg-[#FBFBF8]"
                        >
                          {/* Administrator */}
                          <div className="flex min-w-0 items-center gap-3">
                            <UserAvatar
                              firstName={admin.firstName}
                              lastName={admin.lastName}
                              imageUrl={admin.profileImageUrl}
                            />

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-[#12203B]">
                                {admin.firstName} {admin.lastName}
                              </p>

                              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#8A9088]">
                                <Calendar className="h-3 w-3 shrink-0" />

                                <span>
                                  Joined {formatJoinedDate(admin.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Contact */}
                          <div className="min-w-0 space-y-1.5 pr-4">
                            <div className="flex min-w-0 items-center gap-2 text-xs text-[#4B564C]">
                              <Mail className="h-3.5 w-3.5 shrink-0 text-[#8A9088]" />

                              <span className="truncate">{admin.email}</span>
                            </div>

                            {admin.phoneNumber && (
                              <div className="flex items-center gap-2 text-[11px] text-[#6B7268]">
                                <Phone className="h-3.5 w-3.5 shrink-0 text-[#8A9088]" />

                                <span>{admin.phoneNumber}</span>
                              </div>
                            )}
                          </div>

                          {/* Location */}
                          <div className="min-w-0 pr-4">
                            {admin.city || admin.country ? (
                              <div className="flex items-start gap-2 text-xs text-[#4B564C]">
                                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#8A9088]" />

                                <span className="truncate">
                                  {admin.city && admin.country
                                    ? `${admin.city}, ${admin.country}`
                                    : admin.city || admin.country}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-[#8A9088]">
                                Not provided
                              </span>
                            )}
                          </div>

                          {/* Status */}
                          <div>
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${status.bg} ${status.border} ${status.text}`}
                            >
                              <StatusIcon className="h-3 w-3" />

                              {status.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* MOBILE ADMIN LIST */}
                <div className="space-y-2 md:hidden">
                  {adminUsers.map((admin) => {
                    const status = getStatusStyles(admin);
                    const StatusIcon = status.icon;

                    return (
                      <article
                        key={admin.id}
                        className="rounded-lg border border-[#DADCD3] bg-white p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <UserAvatar
                              firstName={admin.firstName}
                              lastName={admin.lastName}
                              imageUrl={admin.profileImageUrl}
                            />

                            <div className="min-w-0">
                              <h3 className="truncate text-sm font-semibold text-[#12203B]">
                                {admin.firstName} {admin.lastName}
                              </h3>

                              <p className="mt-0.5 text-[11px] text-[#8A9088]">
                                Administrator
                              </p>
                            </div>
                          </div>

                          <span
                            className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold ${status.bg} ${status.border} ${status.text}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </span>
                        </div>

                        <div className="mt-4 space-y-2 border-t border-[#EEF0EB] pt-3">
                          <div className="flex items-start gap-2 text-xs text-[#4B564C]">
                            <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#8A9088]" />

                            <span className="min-w-0 break-all">
                              {admin.email}
                            </span>
                          </div>

                          {admin.phoneNumber && (
                            <div className="flex items-center gap-2 text-xs text-[#4B564C]">
                              <Phone className="h-3.5 w-3.5 shrink-0 text-[#8A9088]" />

                              <span>{admin.phoneNumber}</span>
                            </div>
                          )}

                          {(admin.city || admin.country) && (
                            <div className="flex items-start gap-2 text-xs text-[#4B564C]">
                              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#8A9088]" />

                              <span>
                                {admin.city && admin.country
                                  ? `${admin.city}, ${admin.country}`
                                  : admin.city || admin.country}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-[11px] text-[#8A9088]">
                            <Calendar className="h-3.5 w-3.5 shrink-0" />

                            <span>
                              Joined {formatJoinedDate(admin.createdAt)}
                            </span>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}