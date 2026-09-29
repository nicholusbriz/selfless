// app/dashboard/super-admin/page.tsx
'use client';

import {
  ArrowLeft,
  Building2,
  Shield,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2,
  Filter,
  Calendar,
  UserCheck,
  TrendingUp,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

// ============================================================
// TYPES
// ============================================================

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
}

interface ApprovalStats {
  totalApprovals: number;
  totalApprovers: number;
  stats: Array<{
    approver: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: {
        name: string;
        displayName: string;
      } | null;
      techCenter: {
        id: string;
        name: string;
        code: string;
      } | null;
    };
    approvalCount: number;
    lastApprovalAt: string | null;
    approvedUsers: Array<{
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      verifiedAt: string | null;
      techCenter: {
        id: string;
        name: string;
        code: string;
      } | null;
    }>;
  }>;
}

// ============================================================
// HELPERS
// ============================================================

const focusRing =
  'focus:outline-none focus:ring-2 focus:ring-[#12203B]/20 focus:ring-offset-2';

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

// ============================================================
// PAGE
// ============================================================

export default function SuperAdminOverviewPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedCenterId, setSelectedCenterId] = useState<string>('all');

  // ----------------------------------------------------------
  // FETCH PENDING APPROVALS (across all centers)
  // ----------------------------------------------------------
  const {
    data: pendingUsers,
    isLoading: isLoadingPending,
    error: pendingError,
  } = useQuery({
    queryKey: ['super-admin-pending-approvals'],
    queryFn: async () => {
      const response = await fetch('/api/admin/pending-approvals');

      if (!response.ok) {
        throw new Error('Failed to fetch pending approvals');
      }

      return response.json() as Promise<PendingUser[]>;
    },
  });

  // ----------------------------------------------------------
  // FETCH APPROVAL STATISTICS
  // ----------------------------------------------------------
  const {
    data: approvalStats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useQuery({
    queryKey: ['super-admin-approval-stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/approval-stats');

      if (!response.ok) {
        throw new Error('Failed to fetch approval statistics');
      }

      return response.json() as Promise<ApprovalStats>;
    },
  });

  // ----------------------------------------------------------
  // DERIVE TECH CENTERS FROM PENDING REGISTRATIONS ONLY
  // ----------------------------------------------------------
  const allCenters = useMemo(() => {
    const map = new Map<string, { id: string; name: string; code: string }>();

    (pendingUsers ?? []).forEach((user) => {
      if (user.techCenter) {
        map.set(user.techCenter.id, user.techCenter);
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [pendingUsers]);

  // ----------------------------------------------------------
  // FILTERED LIST
  // ----------------------------------------------------------
  const filteredPendingUsers = useMemo(() => {
    if (!pendingUsers) return [];

    if (selectedCenterId === 'all') return pendingUsers;

    return pendingUsers.filter(
      (user) => user.techCenter?.id === selectedCenterId
    );
  }, [pendingUsers, selectedCenterId]);

  const pendingCount = pendingUsers?.length ?? 0;
  const filteredCount = filteredPendingUsers.length;

  // ----------------------------------------------------------
  // APPROVE MUTATION
  // ----------------------------------------------------------
  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch('/api/admin/approve-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'approve' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve user');
      }

      return response.json();
    },

    onMutate: async (userId: string) => {
      await queryClient.cancelQueries({
        queryKey: ['super-admin-pending-approvals'],
      });

      const previousUsers = queryClient.getQueryData<PendingUser[]>([
        'super-admin-pending-approvals',
      ]);

      queryClient.setQueryData<PendingUser[]>(
        ['super-admin-pending-approvals'],
        (old = []) => old.filter((user) => user.id !== userId)
      );

      return { previousUsers };
    },

    onSuccess: () => {
      alert('Account verified successfully!');
    },

    onError: (error, _vars, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(
          ['super-admin-pending-approvals'],
          context.previousUsers
        );
      }

      alert(error.message);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['super-admin-pending-approvals'],
      });
    },
  });

  // ----------------------------------------------------------
  // REJECT MUTATION
  // ----------------------------------------------------------
  const rejectMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch('/api/admin/approve-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'reject' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject user');
      }

      return response.json();
    },

    onMutate: async (userId: string) => {
      await queryClient.cancelQueries({
        queryKey: ['super-admin-pending-approvals'],
      });

      const previousUsers = queryClient.getQueryData<PendingUser[]>([
        'super-admin-pending-approvals',
      ]);

      queryClient.setQueryData<PendingUser[]>(
        ['super-admin-pending-approvals'],
        (old = []) => old.filter((user) => user.id !== userId)
      );

      return { previousUsers };
    },

    onSuccess: () => {
      alert('User rejected and account deleted successfully!');
    },

    onError: (error, _vars, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(
          ['super-admin-pending-approvals'],
          context.previousUsers
        );
      }

      alert(error.message);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['super-admin-pending-approvals'],
      });
    },
  });

  const handleApprove = (userId: string) => {
    approveMutation.mutate(userId);
  };

  const handleReject = (userId: string) => {
    if (confirm('Are you sure you want to reject this registration?')) {
      rejectMutation.mutate(userId);
    }
  };

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
                  Review and manage new registrations
                </p>
              </div>
            </div>
          </div>

          {pendingCount > 0 && (
            <div className="hidden shrink-0 items-center gap-2 rounded-lg border border-[#F0E1C4] bg-[#FBF6EB] px-3 py-2 sm:flex">
              <Clock className="h-3.5 w-3.5 text-[#8A6E3A]" />
              <span className="text-xs font-semibold text-[#8A6E3A]">
                {pendingCount} pending
              </span>
            </div>
          )}
        </header>

        {/* ---------------------------------------------------------------- */}
        {/* PENDING APPROVALS                                                 */}
        {/* ---------------------------------------------------------------- */}

        <section className="overflow-hidden rounded-xl border border-[#E2E6EB] bg-white shadow-sm">
          {/* Header */}
          <div className="border-b border-[#E2E6EB] bg-[#FBFCFD] px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#FBF6EB] text-[#8A6E3A]">
                  <Clock className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold tracking-tight text-[#12203B]">
                      Pending Approvals
                    </h2>

                    {!isLoadingPending && (
                      <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-[#C59B4C] px-2 py-0.5 text-[11px] font-bold text-white">
                        {pendingCount}
                      </span>
                    )}
                  </div>

                  <p className="mt-0.5 max-w-2xl text-sm leading-5 text-[#6F7B8D]">
                    Review new registrations across all technology centers
                    before granting dashboard access.
                  </p>
                </div>
              </div>

              {/* Center filter */}
              {!isLoadingPending && allCenters.length > 0 && (
                <div className="flex shrink-0 items-center gap-2">
                  <Filter className="h-3.5 w-3.5 text-[#8993A3]" />

                  <select
                    value={selectedCenterId}
                    onChange={(e) => setSelectedCenterId(e.target.value)}
                    className={`h-9 rounded-lg border border-[#E2E6EB] bg-white px-3 text-xs font-medium text-[#12203B] transition-colors hover:border-[#D2D8E0] ${focusRing}`}
                  >
                    <option value="all">
                      All Centers ({pendingCount})
                    </option>

                    {allCenters.map((center) => {
                      const count = (pendingUsers ?? []).filter(
                        (u) => u.techCenter?.id === center.id
                      ).length;

                      return (
                        <option key={center.id} value={center.id}>
                          {center.name} ({count})
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="px-4 py-4 sm:px-5">
            {/* Loading */}
            {isLoadingPending ? (
              <div className="space-y-3" role="status" aria-live="polite">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="flex animate-pulse items-center justify-between rounded-lg border border-[#E2E6EB] p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="space-y-2">
                        <div className="h-3.5 w-32 rounded bg-[#E8EBF0]" />
                        <div className="h-3 w-24 rounded bg-[#EEF1F5]" />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-3 w-14 rounded bg-[#EEF1F5]" />
                      <div className="h-3 w-12 rounded bg-[#EEF1F5]" />
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

                <p className="mt-1 max-w-md text-xs leading-5 text-[#6F7B8D]">
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
              <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-[#E2E6EB] bg-[#F7F8FA] px-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF4EF] text-[#55705B]">
                  <CheckCircle className="h-6 w-6" />
                </div>

                <h3 className="mt-4 text-base font-semibold text-[#12203B]">
                  All caught up
                </h3>

                <p className="mt-1 max-w-md text-sm leading-5 text-[#6F7B8D]">
                  There are no pending registrations waiting for approval.
                  New sign-ups will appear here automatically.
                </p>
              </div>
            ) : filteredCount === 0 ? (
              <div className="flex min-h-[180px] flex-col items-center justify-center rounded-lg border border-dashed border-[#E2E6EB] bg-[#F7F8FA] px-6 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EEF2F7] text-[#6F7B8D]">
                  <Building2 className="h-5 w-5" />
                </div>

                <h3 className="mt-3 text-sm font-semibold text-[#12203B]">
                  No pending approvals for this center
                </h3>

                <p className="mt-1 max-w-md text-xs leading-5 text-[#6F7B8D]">
                  Try switching to a different tech center or viewing all
                  centers.
                </p>

                <button
                  type="button"
                  onClick={() => setSelectedCenterId('all')}
                  className={`mt-4 rounded-lg border border-[#E2E6EB] bg-white px-4 py-2 text-xs font-semibold text-[#12203B] transition hover:bg-[#F7F8FA] ${focusRing}`}
                >
                  Show all centers
                </button>
              </div>
            ) : (
              /* ROW LIST — same layout on desktop and mobile */
              <div className="divide-y divide-[#EEF1F5]">
                {filteredPendingUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 py-3.5 sm:gap-4 sm:py-4"
                  >
                    {/* Name + Tech Center + Registered date stacked */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-[#12203B] sm:text-sm">
                        {user.firstName} {user.lastName}
                      </p>

                      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#6F7B8D] sm:text-xs">
                        {user.techCenter ? (
                          <>
                            <Building2 className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
                            <span className="truncate">
                              {user.techCenter.name}
                            </span>
                          </>
                        ) : (
                          <span className="italic text-[#8993A3]">
                            No tech center
                          </span>
                        )}
                      </div>

                      <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[#8993A3] sm:text-[11px]">
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

        {/* ---------------------------------------------------------------- */}
        {/* APPROVAL STATISTICS                                              */}
        {/* ---------------------------------------------------------------- */}

        <section className="mt-6 overflow-hidden rounded-xl border border-[#E2E6EB] bg-white shadow-sm">
          {/* Header */}
          <div className="border-b border-[#E2E6EB] bg-[#FBFCFD] px-4 py-4 sm:px-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#EDF7F2] text-[#17734B]">
                <UserCheck className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold tracking-tight text-[#12203B]">
                    Approval Statistics
                  </h2>

                  {!isLoadingStats && approvalStats && (
                    <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-[#17734B] px-2 py-0.5 text-[11px] font-bold text-white">
                      {approvalStats.totalApprovals}
                    </span>
                  )}
                </div>

                <p className="mt-0.5 max-w-2xl text-sm leading-5 text-[#6F7B8D]">
                  Track who has approved new registrations and how many accounts
                  they have verified.
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 py-4 sm:px-5">
            {/* Loading */}
            {isLoadingStats ? (
              <div className="space-y-3" role="status" aria-live="polite">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="flex animate-pulse items-center justify-between rounded-lg border border-[#E2E6EB] p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="space-y-2">
                        <div className="h-3.5 w-32 rounded bg-[#E8EBF0]" />
                        <div className="h-3 w-24 rounded bg-[#EEF1F5]" />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-3 w-14 rounded bg-[#EEF1F5]" />
                      <div className="h-3 w-12 rounded bg-[#EEF1F5]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : statsError ? (
              <div
                className="flex min-h-[180px] flex-col items-center justify-center rounded-lg border border-[#E9C7C7] bg-[#FDF0F0] px-6 text-center"
                role="alert"
              >
                <AlertCircle className="h-6 w-6 text-[#A52121]" />

                <h3 className="mt-3 text-sm font-semibold text-[#12203B]">
                  Unable to load approval statistics
                </h3>

                <p className="mt-1 max-w-md text-xs leading-5 text-[#6F7B8D]">
                  {statsError instanceof Error
                    ? statsError.message
                    : 'Something went wrong while loading approval statistics.'}
                </p>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className={`mt-4 rounded-lg bg-[#12203B] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1B2D4F] ${focusRing}`}
                >
                  Try again
                </button>
              </div>
            ) : !approvalStats || approvalStats.stats.length === 0 ? (
              <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-[#E2E6EB] bg-[#F7F8FA] px-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF2F7] text-[#6F7B8D]">
                  <UserCheck className="h-6 w-6" />
                </div>

                <h3 className="mt-4 text-base font-semibold text-[#12203B]">
                  No approval data yet
                </h3>

                <p className="mt-1 max-w-md text-sm leading-5 text-[#6F7B8D]">
                  Approvals will be tracked here once administrators start
                  approving new registrations.
                </p>
              </div>
            ) : (
              /* STATS LIST */
              <div className="divide-y divide-[#EEF1F5]">
                {approvalStats.stats.map((stat) => (
                  <div
                    key={stat.approver.id}
                    className="flex items-center gap-3 py-3.5 sm:gap-4 sm:py-4"
                  >
                    {/* Approver Info */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-[#12203B] sm:text-sm">
                        {stat.approver.firstName} {stat.approver.lastName}
                      </p>

                      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#6F7B8D] sm:text-xs">
                        <span className="truncate">{stat.approver.email}</span>
                        {stat.approver.role && (
                          <>
                            <span className="text-[#8993A3]">•</span>
                            <span className="truncate">
                              {stat.approver.role.displayName}
                            </span>
                          </>
                        )}
                      </div>

                      {stat.approver.techCenter && (
                        <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[#8993A3] sm:text-[11px]">
                          <Building2 className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
                          <span className="truncate">
                            {stat.approver.techCenter.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Approval Count */}
                    <div className="flex shrink-0 items-center gap-2">
                      <div className="flex items-center gap-1.5 rounded-lg bg-[#EDF7F2] px-2.5 py-1.5">
                        <TrendingUp className="h-3.5 w-3.5 text-[#17734B]" />
                        <span className="text-xs font-bold text-[#17734B]">
                          {stat.approvalCount}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}