'use client';

import {
  Activity,
  ArrowLeft,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Globe,
  RefreshCw,
  Search,
  Trash2,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  keepPreviousData,
  useQuery,
} from '@tanstack/react-query';
import { useAuth } from '@/lib/hooks/useAuth';



// ============================================================
// TYPES
// ============================================================

interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  userAgent?: string;
  location?: string;
  page?: string;
  method?: string;

  details?: {
    targetUser?: string;
    action?: string;
  } | null;

  entityUser?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;

  createdAt: string;

  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl?: string;
  };

  techCenter?: {
    id: string;
    name: string;
    code: string;
  };
}

interface PageVisitStats {
  totalVisits: number;

  users: Array<{
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    techCenterName: string | null;
    totalVisits: number;

    pages: Array<{
      pagePath: string;
      visits: number;
      lastVisitAt: string;
    }>;

    pagesVisited: number;
    lastVisitAt: string;
  }>;

  pageVisits: Array<{
    pagePath: string;
    count: number;
    lastVisitAt: string;
    createdAt?: string;
  }>;

  window?: string;
  generatedAt?: string;
}

interface ActionStat {
  action: string;
  count: number;
}

// ============================================================
// CONSTANTS
// ============================================================

const PAGE_SIZE = 10;

const ACTION_BADGE_COLORS: Record<string, string> = {
  login:
    'bg-[#55705B]/10 text-[#55705B] border-[#55705B]/20',

  logout:
    'bg-[#B98A3E]/10 text-[#8A651F] border-[#B98A3E]/20',

  register:
    'bg-blue-50 text-blue-700 border-blue-200',

  create:
    'bg-violet-50 text-violet-700 border-violet-200',

  update:
    'bg-amber-50 text-amber-700 border-amber-200',

  delete:
    'bg-[#A4462F]/10 text-[#A4462F] border-[#A4462F]/20',

  ai_chat_opened:
    'bg-pink-50 text-pink-700 border-pink-200',

  page_visit:
    'bg-cyan-50 text-cyan-700 border-cyan-200',
};

const DEFAULT_BADGE_COLOR =
  'bg-[#F7F6F2] text-[#6B7268] border-[#DADCD3]';

// ============================================================
// HELPERS
// ============================================================

function getActionColor(action: string): string {
  return (
    ACTION_BADGE_COLORS[action] ??
    DEFAULT_BADGE_COLOR
  );
}

function isRoleChangeLog(log: ActivityLog): boolean {
  return (
    log.action === 'change_user_role' ||
    log.details?.action === 'change_role'
  );
}

function getDisplayAction(log: ActivityLog): string {
  return isRoleChangeLog(log)
    ? 'change_user_role'
    : log.action;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatAction(action: string): string {
  return action.replace(/_/g, ' ');
}

// ============================================================
// INLINE STAT
// ============================================================

function InlineStat({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: number;
  sublabel?: string;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-semibold tracking-tight text-[#12203B]">
        {value.toLocaleString()}
      </span>

      <span className="text-xs font-medium uppercase tracking-wide text-[#6B7268]">
        {label}
      </span>

      {sublabel && (
        <span className="text-[10px] text-[#8A9088]">
          {sublabel}
        </span>
      )}
    </div>
  );
}

// ============================================================
// PAGINATION — single source of truth
// ============================================================

function Pagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  isLoading,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}) {
  if (totalItems === 0) return null;

  const startItem =
    (currentPage - 1) * PAGE_SIZE + 1;

  const endItem = Math.min(
    currentPage * PAGE_SIZE,
    totalItems,
  );

  const pages: (number | 'ellipsis')[] = [];

  const maxVisiblePages = 5;

  let startPage = Math.max(
    1,
    currentPage - Math.floor(maxVisiblePages / 2),
  );

  let endPage = Math.min(
    totalPages,
    startPage + maxVisiblePages - 1,
  );

  if (
    endPage - startPage + 1 <
    maxVisiblePages
  ) {
    startPage = Math.max(
      1,
      endPage - maxVisiblePages + 1,
    );
  }

  if (startPage > 1) {
    pages.push(1);

    if (startPage > 2) {
      pages.push('ellipsis');
    }
  }

  for (
    let page = startPage;
    page <= endPage;
    page++
  ) {
    pages.push(page);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pages.push('ellipsis');
    }

    pages.push(totalPages);
  }

  return (
    <div className="flex flex-col gap-3 border-t border-[#DADCD3] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-[#6B7268]">
        Showing{' '}
        <span className="font-semibold text-[#12203B]">
          {startItem.toLocaleString()}
        </span>{' '}
        –{' '}
        <span className="font-semibold text-[#12203B]">
          {endItem.toLocaleString()}
        </span>{' '}
        of{' '}
        <span className="font-semibold text-[#12203B]">
          {totalItems.toLocaleString()}
        </span>{' '}
        logs
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() =>
            onPageChange(currentPage - 1)
          }
          disabled={
            currentPage <= 1 || isLoading
          }
          aria-label="Previous page"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#DADCD3] bg-white text-[#4B564C] transition-colors hover:border-[#B98A3E] hover:text-[#12203B] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((page, index) =>
          page === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="flex h-8 w-8 items-center justify-center text-xs text-[#8A9088]"
            >
              …
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() =>
                onPageChange(page)
              }
              disabled={isLoading}
              aria-current={
                page === currentPage
                  ? 'page'
                  : undefined
              }
              className={`flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-xs font-semibold transition-colors ${
                page === currentPage
                  ? 'border-[#12203B] bg-[#12203B] text-white'
                  : 'border-[#DADCD3] bg-white text-[#4B564C] hover:border-[#B98A3E] hover:text-[#12203B]'
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {page}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() =>
            onPageChange(currentPage + 1)
          }
          disabled={
            currentPage >= totalPages ||
            isLoading
          }
          aria-label="Next page"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#DADCD3] bg-white text-[#4B564C] transition-colors hover:border-[#B98A3E] hover:text-[#12203B] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================================
// PAGE
// ============================================================

export default function ActivityLogsPage() {
  const router = useRouter();

  const {
    user,
    isLoading: authLoading,
  } = useAuth();

  const [activeFilterTab, setActiveFilterTab] =
    useState('all');

  const [searchQuery, setSearchQuery] =
    useState('');

  const [action, setAction] =
    useState('');

  const [page, setPage] =
    useState(1);

  const [expandedPageUserId, setExpandedPageUserId] =
    useState<string | null>(null);

  // ============================================================
  // AUTH GUARD
  // ============================================================

  useEffect(() => {
    if (
      !authLoading &&
      user &&
      user.role !== 'dev'
    ) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const isDev =
    !authLoading &&
    !!user &&
    user.role === 'dev';

  // ============================================================
  // LOG QUERY
  // ============================================================

  const queryKey = useMemo(
    () =>
      [
        'activity-logs',
        searchQuery,
        action,
        page,
      ] as const,
    [searchQuery, action, page],
  );

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey,

    queryFn: async () => {
      const params = new URLSearchParams();

      // API contract: offset + limit
      const offset = (page - 1) * PAGE_SIZE;

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      if (action) {
        params.append('action', action);
      }

      params.append('limit', String(PAGE_SIZE));
      params.append('offset', String(offset));
      params.append('all', 'false');

      const response = await fetch(
        `/api/admin/activity-logs?${params.toString()}`,
        { cache: 'no-store' },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }

      return response.json();
    },

    enabled: isDev,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    placeholderData: keepPreviousData,
  });

  const logs: ActivityLog[] = data?.logs ?? [];
  const total: number = data?.total ?? 0;
  const actionStats: ActionStat[] =
    data?.actionStats ?? [];

  const totalPages = Math.max(
    1,
    Math.ceil(total / PAGE_SIZE),
  );

  // ============================================================
  // PAGE VISIT ANALYTICS
  // ============================================================

  const {
    data: pageVisitStats,
    isLoading: isLoadingPageStats,
  } = useQuery({
    queryKey: ['page-visit-stats'],

    queryFn: async () => {
      const response = await fetch(
        '/api/analytics/page-visit-stats',
        { cache: 'no-store' },
      );

      if (!response.ok) {
        throw new Error(
          'Failed to fetch page visit statistics',
        );
      }

      return response.json() as Promise<PageVisitStats>;
    },

    enabled: isDev,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

  const totalPageVisits =
    pageVisitStats?.totalVisits ?? 0;

  const trackedUsers =
    pageVisitStats?.users?.length ?? 0;

  // ============================================================
  // SEARCH
  // ============================================================

  const handleSearch = useCallback(() => {
    setPage(1);
    refetch();
  }, [refetch]);

  // ============================================================
  // RESET
  // ============================================================

  const handleReset = useCallback(() => {
    setSearchQuery('');
    setAction('');
    setActiveFilterTab('all');
    setPage(1);
  }, []);

  // ============================================================
  // PAGE CHANGE
  // ============================================================

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (
        newPage < 1 ||
        newPage > totalPages ||
        isFetching
      ) {
        return;
      }

      setPage(newPage);

      if (typeof window !== 'undefined') {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }
    },
    [totalPages, isFetching],
  );

  // ============================================================
  // RESET PAGINATION WHEN FILTER CHANGES
  // ============================================================

  useEffect(() => {
    setPage(1);
  }, [activeFilterTab, action]);

  // ============================================================
  // DELETE LOGS
  // ============================================================

  const handleDeleteLogs = useCallback(
    async (
      deleteType: 'single' | 'action',
      logId?: string,
    ) => {
      const confirmationMessage =
        deleteType === 'action' && action
          ? `Delete every "${formatAction(
              action,
            )}" log across all centers? This action cannot be undone.`
          : 'Are you sure you want to delete this log? This action cannot be undone.';

      if (!confirm(confirmationMessage)) {
        return;
      }

      try {
        const params = new URLSearchParams();

        if (deleteType === 'single' && logId) {
          params.append('logId', logId);
        }

        if (deleteType === 'action' && action) {
          params.append('action', action);
        }

        const response = await fetch(
          `/api/admin/activity-logs?${params.toString()}`,
          { method: 'DELETE' },
        );

        if (!response.ok) {
          throw new Error('Failed to delete logs');
        }

        const result = await response.json();

        alert(
          `Successfully deleted ${result.deletedCount} log(s)`,
        );

        await refetch();
      } catch (err) {
        console.error('Delete logs error:', err);
        alert('Failed to delete logs');
      }
    },
    [action, refetch],
  );

  // ============================================================
  // LOADING
  // ============================================================

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F1F1EC]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-[#B98A3E]" />

          <p className="text-sm text-[#6B7268]">
            Loading activity logs...
          </p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'dev') {
    return null;
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <main className="min-h-dvh bg-[#F1F1EC] text-[#12203B]">

      {/* HEADER */}

      <header className="border-b border-[#DADCD3] bg-[#F1F1EC]">

        <div className="mx-auto w-full max-w-[1600px] px-4 pt-2 sm:px-6 lg:px-8">

          {/* PAGE TITLE */}

          <div className="flex items-start justify-between gap-4">

            <div className="flex min-w-0 items-start gap-3">

              <button
                type="button"
                onClick={() => router.back()}
                aria-label="Go back"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#DADCD3] bg-white text-[#4B564C] transition-colors hover:border-[#B98A3E] hover:text-[#12203B]"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

            </div>

            <button
              type="button"
              onClick={() => refetch()}
              aria-label="Refresh activity logs"
              title="Refresh"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#DADCD3] bg-white text-[#4B564C] transition-colors hover:border-[#B98A3E] hover:text-[#12203B]"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  isFetching ? 'animate-spin' : ''
                }`}
              />
            </button>

          </div>

          {/* INLINE STATISTICS */}

          <section className="mt-2 flex flex-wrap items-baseline gap-x-10 gap-y-2 border-b border-[#DADCD3] pb-2">

            <InlineStat
              label="Total logs"
              value={total}
            />

            <InlineStat
              label="Page visits"
              value={totalPageVisits}
              sublabel="24h"
            />

            <InlineStat
              label="Active users"
              value={trackedUsers}
              sublabel="24h"
            />

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight text-[#12203B]">
                {page}
              </span>

              <span className="text-xs font-medium uppercase tracking-wide text-[#6B7268]">
                Page
              </span>

              <span className="text-[10px] text-[#8A9088]">
                of {totalPages}
              </span>
            </div>

          </section>

          {/* SEARCH */}

          <section className="py-1">

            <div className="flex flex-col gap-2 lg:flex-row lg:items-center">

              <div className="relative min-w-0 flex-1">

                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A9088]" />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  placeholder="Search users, actions, pages, events, IP addresses, or tech centers"
                  className="h-10 w-full rounded-lg border border-[#DADCD3] bg-white pl-10 pr-3 text-sm text-[#12203B] outline-none transition-colors placeholder:text-[#8A9088] focus:border-[#B98A3E] focus:ring-2 focus:ring-[#B98A3E]/10"
                />

              </div>

              <div className="flex shrink-0 gap-2">

                <button
                  type="button"
                  onClick={handleSearch}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#12203B] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#1B2E4F]"
                >
                  <Search className="h-3.5 w-3.5" />
                  Search
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="h-10 rounded-lg border border-[#DADCD3] bg-white px-4 text-xs font-medium text-[#4B564C] transition-colors hover:bg-[#F7F6F2] hover:text-[#12203B]"
                >
                  Reset
                </button>

              </div>

            </div>

          </section>

          {/* FILTER TABS */}

          <section className="border-b border-[#DADCD3]">

            <div
              role="tablist"
              aria-label="Activity log filters"
              className="flex gap-5 overflow-x-auto whitespace-nowrap"
              style={{ scrollbarWidth: 'thin' }}
            >

              <button
                type="button"
                role="tab"
                aria-selected={activeFilterTab === 'all'}
                onClick={() => {
                  setActiveFilterTab('all');
                  setAction('');
                }}
                className={`h-10 shrink-0 border-b-2 px-1 text-xs font-semibold transition-colors ${
                  activeFilterTab === 'all'
                    ? 'border-[#B98A3E] text-[#12203B]'
                    : 'border-transparent text-[#6B7268] hover:text-[#12203B]'
                }`}
              >
                All
                <span className="ml-1 font-mono text-[10px] text-[#8A9088]">
                  {total}
                </span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={
                  activeFilterTab === 'topPages'
                }
                onClick={() => {
                  setActiveFilterTab('topPages');
                  setAction('');
                  setPage(1);
                }}
                className={`h-10 shrink-0 border-b-2 px-1 text-xs font-semibold transition-colors ${
                  activeFilterTab === 'topPages'
                    ? 'border-[#B98A3E] text-[#12203B]'
                    : 'border-transparent text-[#6B7268] hover:text-[#12203B]'
                }`}
              >
                Top Pages
              </button>

              {actionStats.map((stat) => (
                <button
                  key={stat.action}
                  type="button"
                  role="tab"
                  aria-selected={
                    activeFilterTab === stat.action
                  }
                  onClick={() => {
                    setActiveFilterTab(stat.action);
                    setAction(stat.action);
                    setPage(1);
                  }}
                  className={`h-10 shrink-0 border-b-2 px-1 text-xs font-semibold capitalize transition-colors ${
                    activeFilterTab === stat.action
                      ? 'border-[#B98A3E] text-[#12203B]'
                      : 'border-transparent text-[#6B7268] hover:text-[#12203B]'
                  }`}
                >
                  {formatAction(stat.action)}

                  <span className="ml-1 font-mono text-[10px] text-[#8A9088]">
                    {stat.count}
                  </span>
                </button>
              ))}

            </div>

          </section>

          {/* CONTEXT */}

          {action && activeFilterTab === action && (
            <div className="flex justify-end py-1">
              <button
                type="button"
                onClick={() =>
                  handleDeleteLogs('action')
                }
                className="inline-flex h-8 items-center gap-1.5 self-start rounded-lg border border-[#A4462F]/20 bg-[#A4462F]/5 px-3 text-xs font-semibold text-[#A4462F] transition-colors hover:bg-[#A4462F]/10 sm:self-auto"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete {formatAction(action)}
              </button>
            </div>
          )}

        </div>

      </header>

      {/* SCROLLABLE CONTENT */}

      <div className="w-full">

        <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">

          {/* TOP PAGES */}

          {activeFilterTab === 'topPages' && (
            <section className="overflow-hidden border border-[#DADCD3] bg-white">

              <div className="border-b border-[#DADCD3] px-5 py-4">

                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <h2 className="text-sm font-semibold text-[#12203B]">
                      Page Activity
                    </h2>

                  </div>

                  <p className="text-xs text-[#6B7268]">
                    <span className="font-semibold text-[#12203B]">
                      {totalPageVisits.toLocaleString()}
                    </span>{' '}
                    total visits
                  </p>

                </div>

              </div>

              {isLoadingPageStats ? (
                <div className="space-y-3 p-5">

                  {[0, 1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="animate-pulse border-b border-[#E8E9E4] pb-4"
                    >
                      <div className="h-3 w-48 bg-[#E6E7E1]" />

                      <div className="mt-2 h-2.5 w-72 bg-[#EEF0EB]" />

                      <div className="mt-3 h-2.5 w-full bg-[#EEF0EB]" />
                    </div>
                  ))}

                </div>
              ) : !pageVisitStats?.users?.length ? (

                <div className="px-5 py-12 text-center">

                  <Globe className="mx-auto h-6 w-6 text-[#8A9088]" />

                  <p className="mt-3 text-sm font-semibold text-[#12203B]">
                    No page activity
                  </p>

                  <p className="mt-1 text-xs text-[#6B7268]">
                    No signed-in user page
                    activity was recorded during
                    the last 24 hours.
                  </p>

                </div>

              ) : (

                <div className="divide-y divide-[#E6E7E1]">

                  {pageVisitStats.users.map((visitUser) => {

                    const expanded =
                      expandedPageUserId ===
                      visitUser.userId;

                    return (
                      <article key={visitUser.userId}>

                        <button
                          type="button"
                          aria-expanded={expanded}
                          onClick={() =>
                            setExpandedPageUserId(
                              expanded
                                ? null
                                : visitUser.userId,
                            )
                          }
                          className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-[#F7F6F2]/60"
                        >

                          <div className="min-w-0">

                            <p className="truncate text-sm font-semibold text-[#12203B]">
                              {visitUser.firstName}{' '}
                              {visitUser.lastName}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-[#6B7268]">
                              {visitUser.email}
                            </p>

                            <p className="mt-1 text-[11px] text-[#8A9088]">
                              {visitUser.techCenterName ||
                                'No tech center'}
                            </p>

                          </div>

                          <div className="flex shrink-0 items-center gap-3">

                            <div className="text-right">

                              <p className="text-sm font-semibold tabular-nums text-[#12203B]">
                                {visitUser.totalVisits.toLocaleString()}
                              </p>

                              <p className="text-[10px] text-[#6B7268]">
                                visits ·{' '}
                                {visitUser.pagesVisited}{' '}
                                pages
                              </p>

                            </div>

                            <ChevronDown
                              className={`h-4 w-4 text-[#6B7268] transition-transform ${
                                expanded ? 'rotate-180' : ''
                              }`}
                            />

                          </div>

                        </button>

                        {expanded && (
                          <div className="border-t border-[#E8E9E4] bg-[#F7F6F2]/40 px-5 py-4">

                            <div className="space-y-3">

                              {visitUser.pages.map(
                                (visitedPage) => (
                                  <div
                                    key={visitedPage.pagePath}
                                    className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
                                  >

                                    <code className="break-all font-mono text-xs text-[#12203B]">
                                      {visitedPage.pagePath}
                                    </code>

                                    <span className="shrink-0 text-[10px] text-[#6B7268]">
                                      {visitedPage.visits}{' '}
                                      visit
                                      {visitedPage.visits === 1
                                        ? ''
                                        : 's'}{' '}
                                      · last{' '}
                                      {formatDate(
                                        visitedPage.lastVisitAt,
                                      )}
                                    </span>

                                  </div>
                                ),
                              )}

                            </div>

                          </div>
                        )}

                      </article>
                    );
                  })}

                </div>

              )}

            </section>
          )}

          {/* LOGS */}

          {activeFilterTab !== 'topPages' && (
            <section className="overflow-hidden border border-[#DADCD3] bg-white">

              <div className="flex flex-col gap-2 border-b border-[#DADCD3] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <h2 className="text-sm font-semibold text-[#12203B]">
                    System Activity
                  </h2>

                </div>

                <div className="text-xs text-[#8A9088]">
                  {total.toLocaleString()} total records
                  · {PAGE_SIZE} per page
                </div>

              </div>

              {/* LOADING */}

              {isLoading ? (

                <div className="space-y-3 p-5">

                  {Array.from({ length: 8 }).map(
                    (_, index) => (
                      <div
                        key={index}
                        className="flex animate-pulse items-center gap-4 border-b border-[#E6E7E1] py-4"
                      >

                        <div className="h-9 w-9 shrink-0 rounded-full bg-[#E6E7E1]" />

                        <div className="min-w-0 flex-1 space-y-2">

                          <div className="h-3 w-1/4 rounded bg-[#E6E7E1]" />

                          <div className="h-2.5 w-1/3 rounded bg-[#EEF0EB]" />

                        </div>

                        <div className="hidden h-6 w-20 rounded-full bg-[#E6E7E1] sm:block" />

                        <div className="hidden h-3 w-24 rounded bg-[#E6E7E1] md:block" />

                      </div>
                    ),
                  )}

                </div>

              ) : error ? (

                <div className="flex flex-col items-center justify-center px-5 py-14 text-center">

                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#A4462F]/10">

                    <Activity className="h-5 w-5 text-[#A4462F]" />

                  </div>

                  <p className="mt-3 text-sm font-semibold text-[#12203B]">
                    Failed to load activity logs
                  </p>

                  <p className="mt-1 text-xs text-[#6B7268]">
                    Refresh the page or try again.
                  </p>

                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-[#12203B] px-4 text-xs font-semibold text-white"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Try again
                  </button>

                </div>

              ) : logs.length === 0 ? (

                <div className="flex flex-col items-center justify-center px-5 py-14 text-center">

                  <CalendarIcon className="h-6 w-6 text-[#8A9088]" />

                  <p className="mt-3 text-sm font-semibold text-[#12203B]">
                    No activity found
                  </p>

                  <p className="mt-1 text-xs text-[#6B7268]">
                    Try another search or activity
                    filter.
                  </p>

                </div>

              ) : (

                <>

                  <div className="overflow-x-auto">

                    <table className="w-full min-w-[760px]">

                      <thead>

                        <tr className="border-b border-[#DADCD3] bg-[#F7F6F2]/70">

                          {[
                            'User',
                            'Action',
                            'Tech Center',
                            'Date',
                            '',
                          ].map((label) => (
                            <th
                              key={label}
                              className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-[#6B7268]"
                            >
                              {label}
                            </th>
                          ))}

                        </tr>

                      </thead>

                      <tbody className="divide-y divide-[#E6E7E1]">

                        {logs.map((log) => (
                          <tr
                            key={log.id}
                            className="group transition-colors hover:bg-[#F7F6F2]/60"
                          >

                            {/* USER */}

                            <td className="px-5 py-4">

                              {log.user ? (

                                <div className="flex items-center gap-3">

                                  {log.user.profileImageUrl ? (

                                    <img
                                      src={
                                        log.user
                                          .profileImageUrl
                                      }
                                      alt={`${log.user.firstName} ${log.user.lastName}`}
                                      className="h-9 w-9 shrink-0 rounded-full border border-[#DADCD3] object-cover"
                                    />

                                  ) : (

                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#DADCD3] bg-[#F7F6F2]">

                                      <User className="h-4 w-4 text-[#6B7268]" />

                                    </div>

                                  )}

                                  <div className="min-w-0">

                                    <p className="truncate text-sm font-semibold text-[#12203B]">

                                      {log.user.firstName}{' '}
                                      {log.user.lastName}

                                    </p>

                                    <p className="max-w-[210px] truncate text-xs text-[#6B7268]">
                                      {log.user.email}
                                    </p>

                                    {isRoleChangeLog(log) &&
                                      log.details?.targetUser && (
                                        <p className="max-w-[210px] truncate text-[11px] text-[#8A9088]">
                                          Updated: {log.details.targetUser}
                                        </p>
                                      )}

                                  </div>

                                </div>

                              ) : (

                                <div className="flex items-center gap-3">

                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#DADCD3] bg-[#F7F6F2]">

                                    <Globe className="h-4 w-4 text-[#8A9088]" />

                                  </div>

                                  <div>

                                    <p className="text-sm font-medium text-[#6B7268]">
                                      Anonymous visitor
                                    </p>

                                    <p className="text-xs text-[#8A9088]">
                                      Not logged in
                                    </p>

                                  </div>

                                </div>

                              )}

                            </td>

                            {/* ACTION */}

                            <td className="px-5 py-4">

                              <span
                                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${getActionColor(
                                  getDisplayAction(log),
                                )}`}
                              >
                                {formatAction(getDisplayAction(log))}
                              </span>

                            </td>

                            {/* TECH CENTER */}

                            <td className="px-5 py-4">

                              {log.techCenter ? (

                                <div>

                                  <p className="max-w-[160px] truncate text-sm font-medium text-[#12203B]">
                                    {log.techCenter.name}
                                  </p>

                                  <p className="mt-0.5 text-xs text-[#6B7268]">
                                    {log.techCenter.code}
                                  </p>

                                  {isRoleChangeLog(log) && (
                                    <p className="mt-0.5 text-[10px] text-[#8A9088]">
                                      Updated user
                                    </p>
                                  )}

                                </div>

                              ) : (

                                <span className="text-sm text-[#8A9088]">
                                  {isRoleChangeLog(log)
                                    ? 'No tech center'
                                    : '—'}
                                </span>

                              )}

                            </td>

                            {/* DATE */}

                            <td className="px-5 py-4">

                              <span className="whitespace-nowrap text-xs text-[#6B7268]">
                                {formatDate(log.createdAt)}
                              </span>

                            </td>

                            {/* DELETE */}

                            <td className="px-5 py-4 text-right">

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteLogs(
                                    'single',
                                    log.id,
                                  )
                                }
                                aria-label="Delete this log"
                                title="Delete this log"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#8A9088] transition-colors hover:bg-[#A4462F]/5 hover:text-[#A4462F]"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>

                            </td>

                          </tr>
                        ))}

                      </tbody>

                    </table>

                  </div>

                  {/* SINGLE PAGINATION — no duplicates */}

                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    totalItems={total}
                    onPageChange={handlePageChange}
                    isLoading={isFetching}
                  />

                </>

              )}

            </section>
          )}

        </div>

      </div>

    </main>
  );
}