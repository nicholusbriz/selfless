'use client';

import {
  Activity,
  ArrowLeft,
  BarChart3,
  Building2,
  Calendar as CalendarIcon,
  ChevronDown,
  Filter,
  Globe,
  Home,
  RefreshCw,
  Search,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/hooks/useAuth';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  sessionId?: string;
  page?: string;
  method?: string;
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
    pagesVisited: number;
    lastVisitAt: string;
  }>;
  pageVisits: Array<{
    pagePath: string;
    count: number;
    lastVisitAt: string;
    createdAt: string;
  }>;
}

interface ActionStat {
  action: string;
  count: number;
}

interface TechCenterOption {
  id: string;
  name: string;
  code: string;
}

export default function ActivityLogsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  // ------------------------------------------------------------
  // Filters
  // ------------------------------------------------------------
  const [userId, setUserId] = useState('');
  const [techCenterId, setTechCenterId] = useState('');
  const [action, setAction] = useState('');

  // ------------------------------------------------------------
  // Pagination / UI
  // ------------------------------------------------------------
  const [showFilters, setShowFilters] = useState(false);

  // ------------------------------------------------------------
  // Redirect non-dev users
  // ------------------------------------------------------------
  useEffect(() => {
    if (!authLoading && user && user.role !== 'dev') {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  // ------------------------------------------------------------
  // Query key
  // ------------------------------------------------------------
  const queryKey = [
    'logs',
    userId,
    techCenterId,
    action,
  ];

  // ------------------------------------------------------------
  // Fetch logs
  // ------------------------------------------------------------
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();

      if (userId) params.append('userId', userId);
      if (techCenterId) params.append('techCenterId', techCenterId);
      if (action) params.append('action', action);
      params.append('all', 'true');

      const response = await fetch(
        `/api/admin/activity-logs?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }

      return response.json();
    },
    enabled: !authLoading && !!user && user.role === 'dev',
    staleTime: 30 * 1000,
    refetchInterval: 10 * 1000,
  });

  const logs: ActivityLog[] = data?.logs || [];
  const total = data?.total || 0;
  const actionStats: ActionStat[] = data?.actionStats ?? [];

  const systemActivityLogs = logs;

  // ------------------------------------------------------------
  // Fetch tech centers directly so filters include centers with no log rows
  // ------------------------------------------------------------
  const { data: techCenters = [] } = useQuery<TechCenterOption[]>({
    queryKey: ['dev-log-tech-centers'],
    queryFn: async () => {
      const response = await fetch('/api/admin/all-tech-centers');
      if (!response.ok) throw new Error('Failed to fetch tech centers');
      return response.json();
    },
    enabled: !authLoading && !!user && user.role === 'dev',
    staleTime: 5 * 60 * 1000,
  });

  // ------------------------------------------------------------
  // Fetch page visit statistics
  // ------------------------------------------------------------
  const {
    data: pageVisitStats,
    isLoading: isLoadingPageStats,
  } = useQuery({
    queryKey: ['page-visit-stats'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/page-visit-stats');

      if (!response.ok) {
        throw new Error('Failed to fetch page visit statistics');
      }

      return response.json() as Promise<PageVisitStats>;
    },
    enabled: !authLoading && !!user && user.role === 'dev',
    staleTime: 60 * 1000, // Cache for 1 minute
    refetchInterval: 60 * 1000, // Refresh every minute
  });

  // ------------------------------------------------------------
  // Derived statistics
  // ------------------------------------------------------------
  const pageVisits = logs.filter(
    (log) => log.action === 'page_visit'
  ).length;

  const techCenterCount = techCenters.length;

  const totalPageVisits = pageVisitStats?.totalVisits || 0;

  // ------------------------------------------------------------
  // Search
  // ------------------------------------------------------------
  const handleSearch = () => {
    refetch();
  };

  // ------------------------------------------------------------
  // Reset
  // ------------------------------------------------------------
  const handleReset = () => {
    setUserId('');
    setTechCenterId('');
    setAction('');

    setTimeout(() => {
      refetch();
    }, 0);
  };

  // ------------------------------------------------------------
  // Delete logs
  // ------------------------------------------------------------
  const handleDeleteLogs = async (
    deleteType: 'single' | 'action',
    logId?: string
  ) => {
    if (
      !confirm(
        'Are you sure you want to delete these logs? This action cannot be undone.'
      )
    ) {
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
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete logs');
      }

      const result = await response.json();

      alert(`Successfully deleted ${result.deletedCount} log(s)`);

      refetch();
    } catch (error) {
      console.error('Delete logs error:', error);
      alert('Failed to delete logs');
    }
  };

  // ------------------------------------------------------------
  // Action badge
  // ------------------------------------------------------------
  const getActionColor = (value: string) => {
    switch (value) {
      case 'login':
        return 'bg-[#55705B]/10 text-[#55705B] border-[#55705B]/20';

      case 'logout':
        return 'bg-[#B98A3E]/10 text-[#8A651F] border-[#B98A3E]/20';

      case 'register':
        return 'bg-blue-50 text-blue-700 border-blue-200';

      case 'create':
        return 'bg-violet-50 text-violet-700 border-violet-200';

      case 'update':
        return 'bg-amber-50 text-amber-700 border-amber-200';

      case 'delete':
        return 'bg-[#A4462F]/10 text-[#A4462F] border-[#A4462F]/20';

      case 'ai_chat_opened':
        return 'bg-pink-50 text-pink-700 border-pink-200';

      case 'page_visit':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';

      default:
        return 'bg-[#F7F6F2] text-[#6B7268] border-[#DADCD3]';
    }
  };

  // ------------------------------------------------------------
  // Format date
  // ------------------------------------------------------------
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ------------------------------------------------------------
  // Prepare chart data
  // ------------------------------------------------------------
  const chartData = useMemo(() => {
    if (!pageVisitStats?.pageVisits) return [];

    // Take top 10 most visited pages
    return pageVisitStats.pageVisits
      .slice(0, 10)
      .map((page) => ({
        name: page.pagePath,
        visits: page.count,
      }));
  }, [pageVisitStats]);

  // Custom colors for bars
  const getBarColor = (index: number) => {
    const colors = [
      '#12203B', // Dark blue
      '#B98A3E', // Gold
      '#55705B', // Green
      '#8A651F', // Brown
      '#A4462F', // Red
      '#6B7268', // Gray
      '#17734B', // Light green
      '#C59B4C', // Light gold
      '#4B564C', // Dark gray
      '#8A9088', // Light gray
    ];
    return colors[index % colors.length];
  };

  // ------------------------------------------------------------
  // Loading / unauthorized
  // ------------------------------------------------------------
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F1F1EC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 text-[#B98A3E] animate-spin" />
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

  return (
    <main className="min-h-screen bg-[#F1F1EC] text-[#12203B]">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">

        {/* ======================================================
            PAGE HEADER
        ====================================================== */}
        <header className="mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => router.back()}
                aria-label="Go back"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#DADCD3] bg-white text-[#4B564C] transition-colors hover:border-[#B98A3E] hover:text-[#12203B]"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <button
                onClick={() => router.push('/')}
                aria-label="Go home"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#DADCD3] bg-white text-[#4B564C] transition-colors hover:border-[#B98A3E] hover:text-[#12203B]"
              >
                <Home className="h-4 w-4" />
              </button>

              <div className="hidden h-7 w-px bg-[#DADCD3] sm:block" />

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-xl font-semibold tracking-[-0.02em] text-[#12203B] sm:text-2xl">
                    Activity Logs
                  </h1>

                  <span className="hidden rounded-full border border-[#DADCD3] bg-white px-2.5 py-1 text-[11px] font-medium text-[#6B7268] sm:inline-flex">
                    Developer
                  </span>
                </div>

                <p className="mt-1 text-sm text-[#6B7268]">
                  Monitor system activity, sessions, and audit events.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters((value) => !value)}
                className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3.5 text-sm font-medium transition-colors ${
                  showFilters
                    ? 'border-[#B98A3E] bg-[#B98A3E]/10 text-[#8A651F]'
                    : 'border-[#DADCD3] bg-white text-[#4B564C] hover:border-[#B98A3E] hover:text-[#12203B]'
                }`}
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    showFilters ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <button
                onClick={() => refetch()}
                aria-label="Refresh activity logs"
                title="Refresh"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#DADCD3] bg-white text-[#4B564C] transition-colors hover:border-[#B98A3E] hover:text-[#12203B]"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    isLoading ? 'animate-spin' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        </header>

        {/* ======================================================
            FILTERS
        ====================================================== */}
        {showFilters && (
          <section className="mb-6 rounded-xl border border-[#DADCD3] bg-white shadow-[0_1px_2px_rgba(18,32,59,0.04)]">
            <div className="flex items-center justify-between border-b border-[#DADCD3] px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-[#12203B]">
                  Filter activity
                </h2>
                <p className="mt-0.5 text-xs text-[#6B7268]">
                  Narrow the audit log using specific criteria.
                </p>
              </div>

              <button
                onClick={() => setShowFilters(false)}
                aria-label="Close filters"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B7268] hover:bg-[#F7F6F2] hover:text-[#12203B]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">

              {/* User ID */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6B7268]">
                  User ID
                </label>

                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Search user ID across all logs"
                  className="h-10 w-full rounded-lg border border-[#DADCD3] bg-white px-3 text-sm text-[#12203B] outline-none transition-colors placeholder:text-[#8A9088] focus:border-[#B98A3E] focus:ring-2 focus:ring-[#B98A3E]/10"
                />
              </div>

              {/* Tech Center */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6B7268]">
                  Tech Center
                </label>

                <select
                  value={techCenterId}
                  onChange={(e) => setTechCenterId(e.target.value)}
                  className="h-10 w-full rounded-lg border border-[#DADCD3] bg-white px-3 text-sm text-[#12203B] outline-none transition-colors focus:border-[#B98A3E] focus:ring-2 focus:ring-[#B98A3E]/10"
                >
                  <option value="">All Tech Centers</option>

                  {techCenters.map((techCenter) => (
                    <option key={techCenter.id} value={techCenter.id}>
                      {techCenter.name} ({techCenter.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Action */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6B7268]">
                  Action
                </label>

                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="h-10 w-full rounded-lg border border-[#DADCD3] bg-white px-3 text-sm text-[#12203B] outline-none transition-colors focus:border-[#B98A3E] focus:ring-2 focus:ring-[#B98A3E]/10"
                >
                  <option value="">All Actions</option>
                  {actionStats.map((actionStat) => (
                    <option key={actionStat.action} value={actionStat.action}>
                      {actionStat.action.replace(/_/g, ' ')} ({actionStat.count})
                    </option>
                  ))}
                </select>
              </div>

            </div>

            <div className="flex flex-col gap-3 border-t border-[#DADCD3] px-5 py-4 lg:flex-row lg:items-center">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSearch}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#12203B] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1B2E4F]"
                >
                  <Search className="h-4 w-4" />
                  Search
                </button>

                <button
                  onClick={handleReset}
                  className="h-10 rounded-lg border border-[#DADCD3] bg-white px-4 text-sm font-medium text-[#4B564C] transition-colors hover:bg-[#F7F6F2] hover:text-[#12203B]"
                >
                  Reset
                </button>
              </div>

              <div className="h-px flex-1 bg-[#DADCD3] lg:mx-2 lg:h-5 lg:w-px" />

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleDeleteLogs('action')}
                  disabled={!action}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#A4462F]/20 bg-[#A4462F]/5 px-3 text-xs font-semibold text-[#A4462F] transition-colors hover:bg-[#A4462F]/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete by action
                </button>

              </div>
            </div>
          </section>
        )}

        {/* ======================================================
            STATISTICS
        ====================================================== */}
        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">

          <div className="rounded-xl border border-[#DADCD3] bg-white px-4 py-4 shadow-[0_1px_2px_rgba(18,32,59,0.03)]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#B98A3E]/10">
                <Activity className="h-4 w-4 text-[#B98A3E]" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-[#6B7268]">
                  Total logs
                </p>
                <p className="mt-0.5 text-xl font-semibold text-[#12203B]">
                  {total.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#DADCD3] bg-white px-4 py-4 shadow-[0_1px_2px_rgba(18,32,59,0.03)]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                <Globe className="h-4 w-4 text-blue-600" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-[#6B7268]">
                  Page visits
                </p>
                <p className="mt-0.5 text-xl font-semibold text-[#12203B]">
                  {totalPageVisits.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#DADCD3] bg-white px-4 py-4 shadow-[0_1px_2px_rgba(18,32,59,0.03)]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#55705B]/10">
                <Building2 className="h-4 w-4 text-[#55705B]" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-[#6B7268]">
                  Tech centers
                </p>
                <p className="mt-0.5 text-xl font-semibold text-[#12203B]">
                  {techCenterCount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#DADCD3] bg-white px-4 py-4 shadow-[0_1px_2px_rgba(18,32,59,0.03)]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#55705B]/10">
                <User className="h-4 w-4 text-[#55705B]" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-[#6B7268]">
                  Users tracked
                </p>
                <p className="mt-0.5 text-xl font-semibold text-[#12203B]">
                  {pageVisitStats?.users.length.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6 overflow-hidden rounded-xl border border-[#DADCD3] bg-white shadow-[0_1px_2px_rgba(18,32,59,0.03)]">
          <div className="flex items-center justify-between gap-3 border-b border-[#DADCD3] px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-[#12203B]">Activity by action</h2>
              <p className="mt-0.5 text-xs text-[#6B7268]">
                Counts reflect the current user and tech-center filters.
              </p>
            </div>
            <span className="shrink-0 text-xs font-medium text-[#6B7268]">
              {actionStats.length} action types
            </span>
          </div>
          {actionStats.length ? (
            <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3 lg:grid-cols-5">
              {actionStats.map((actionStat) => (
                <div
                  key={actionStat.action}
                  className="flex min-w-0 items-center justify-between gap-2 rounded-lg border border-[#E6E7E1] bg-[#FBFBF9] px-3 py-2"
                >
                  <span className="truncate text-xs font-medium capitalize text-[#4B564C]">
                    {actionStat.action.replace(/_/g, ' ')}
                  </span>
                  <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-[#12203B]">
                    {actionStat.count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-5 py-6 text-sm text-[#6B7268]">No action counts for this scope.</p>
          )}
        </section>

        {/* ======================================================
            PAGE VISIT CHART
        ====================================================== */}
        <section className="mb-6 rounded-xl border border-[#DADCD3] bg-white shadow-[0_1px_2px_rgba(18,32,59,0.03)]">

          <div className="flex flex-col gap-2 border-b border-[#DADCD3] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-[#12203B]">
                  Page Visit Analytics
                </h2>

                <span className="rounded-full bg-[#B98A3E]/10 px-2 py-0.5 text-[10px] font-semibold text-[#8A651F]">
                  LIGHTWEIGHT
                </span>
              </div>

              <p className="mt-0.5 text-xs text-[#6B7268]">
                Real-time page visit counts (not stored as activity logs).
              </p>
            </div>

            <div className="text-xs text-[#6B7268]">
              <span className="font-semibold text-[#12203B]">
                {pageVisitStats?.totalVisits?.toLocaleString() || 0}
              </span>{' '}
              total visits
            </div>
          </div>

          {isLoadingPageStats ? (
            <div className="flex min-h-[300px] items-center justify-center p-5">
              <div className="flex flex-col items-center gap-3">
                <RefreshCw className="h-6 w-6 text-[#B98A3E] animate-spin" />
                <p className="text-sm text-[#6B7268]">
                  Loading page visit data...
                </p>
              </div>
            </div>
          ) : !chartData || chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#F7F6F2]">
                <BarChart3 className="h-5 w-5 text-[#8A9088]" />
              </div>

              <p className="text-sm font-medium text-[#4B564C]">
                No page visit data yet
              </p>

              <p className="mt-1 text-xs text-[#8A9088]">
                Page visits will be tracked automatically as users navigate the site.
              </p>
            </div>
          ) : (
            <div className="p-5">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E6E7E1" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#6B7268', fontSize: 11 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={0}
                    />
                    <YAxis
                      tick={{ fill: '#6B7268', fontSize: 11 }}
                      width={50}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#12203B',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                      cursor={{ fill: 'rgba(185, 138, 62, 0.1)' }}
                    />
                    <Bar dataKey="visits" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(index)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#6B7268]">
                <span className="font-medium text-[#12203B]">Top pages:</span>
                {chartData.slice(0, 5).map((page, index) => (
                  <span key={page.name} className="inline-flex items-center gap-1">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: getBarColor(index) }}
                    />
                    <span>{page.name}</span>
                    <span className="font-semibold text-[#12203B]">
                      ({page.visits})
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="mb-6 overflow-hidden rounded-xl border border-[#DADCD3] bg-white shadow-[0_1px_2px_rgba(18,32,59,0.03)]">
          <div className="border-b border-[#DADCD3] px-5 py-4">
            <h2 className="text-sm font-semibold text-[#12203B]">Page visits by user</h2>
            <p className="mt-0.5 text-xs text-[#6B7268]">
              Aggregate counters only; individual visit events are not stored here.
            </p>
          </div>

          {isLoadingPageStats ? (
            <div className="px-5 py-8 text-sm text-[#6B7268]">Loading user visit counts...</div>
          ) : !pageVisitStats?.users.length ? (
            <div className="px-5 py-8 text-sm text-[#6B7268]">No signed-in user visits recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="border-b border-[#DADCD3] bg-[#F7F6F2]/70">
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6B7268]">User</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6B7268]">Tech center</th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-[#6B7268]">Visits</th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-[#6B7268]">Pages</th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-[#6B7268]">Last visit</th>
                  </tr>
                </thead>
                <tbody>
                  {pageVisitStats.users.map((visitUser) => (
                    <tr key={visitUser.userId} className="border-b border-[#E8E9E4] last:border-b-0">
                      <td className="px-5 py-3">
                        <p className="text-sm font-medium text-[#12203B]">
                          {visitUser.firstName} {visitUser.lastName}
                        </p>
                        <p className="mt-0.5 text-xs text-[#6B7268]">{visitUser.email}</p>
                      </td>
                      <td className="px-5 py-3 text-sm text-[#4B564C]">
                        {visitUser.techCenterName || 'No tech center'}
                      </td>
                      <td className="px-5 py-3 text-right text-sm font-semibold tabular-nums text-[#12203B]">
                        {visitUser.totalVisits.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-right text-sm tabular-nums text-[#4B564C]">
                        {visitUser.pagesVisited.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-right text-xs text-[#6B7268]">
                        {formatDate(visitUser.lastVisitAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ======================================================
            LOGS
        ====================================================== */}
        <section className="overflow-hidden rounded-xl border border-[#DADCD3] bg-white shadow-[0_1px_2px_rgba(18,32,59,0.03)]">

          <div className="flex flex-col gap-2 border-b border-[#DADCD3] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#12203B]">
                System activity
              </h2>

              <p className="mt-0.5 text-xs text-[#6B7268]">
                Detailed audit events generated across the portal.
              </p>
            </div>

            <div className="text-xs text-[#8A9088]">
              Auto-refreshes every 10 seconds
            </div>
          </div>

          {isLoading ? (
            <div className="p-5">
              <div className="space-y-3">
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className="flex animate-pulse items-center gap-4 rounded-lg border border-[#DADCD3] p-4"
                  >
                    <div className="h-9 w-9 shrink-0 rounded-full bg-[#E6E7E1]" />

                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="h-3 w-1/4 rounded bg-[#E6E7E1]" />
                      <div className="h-2.5 w-1/3 rounded bg-[#E6E7E1]" />
                    </div>

                    <div className="hidden h-6 w-20 rounded-full bg-[#E6E7E1] sm:block" />

                    <div className="hidden h-3 w-24 rounded bg-[#E6E7E1] md:block" />

                    <div className="h-3 w-20 rounded bg-[#E6E7E1]" />
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#A4462F]/10">
                <Activity className="h-5 w-5 text-[#A4462F]" />
              </div>

              <p className="text-sm font-semibold text-[#12203B]">
                Failed to load activity logs
              </p>

              <p className="mt-1 text-xs text-[#6B7268]">
                Please refresh the page and try again.
              </p>

              <button
                onClick={() => refetch()}
                className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-[#12203B] px-4 text-xs font-semibold text-white hover:bg-[#1B2E4F]"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Try again
              </button>
            </div>
          ) : systemActivityLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#F7F6F2]">
                <CalendarIcon className="h-5 w-5 text-[#8A9088]" />
              </div>

              <p className="text-sm font-semibold text-[#12203B]">
                No activity found
              </p>

              <p className="mt-1 text-xs text-[#6B7268]">
                Try changing your filters or selecting a different date range.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                  <thead>
                    <tr className="border-b border-[#DADCD3] bg-[#F7F6F2]/70">
                      <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6B7268]">
                        User
                      </th>

                      <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6B7268]">
                        Action
                      </th>

                      <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6B7268]">
                        Page / Entity
                      </th>

                      <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6B7268]">
                        Tech Center
                      </th>

                      <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6B7268]">
                        IP Address
                      </th>

                      <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6B7268]">
                        Session
                      </th>

                      <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6B7268]">
                        Date
                      </th>

                      <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-[#6B7268]">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#E6E7E1]">
                    {systemActivityLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="group transition-colors hover:bg-[#F7F6F2]/70"
                      >
                        {/* User */}
                        <td className="px-5 py-4">
                          {log.user ? (
                            <div className="flex items-center gap-3">
                              {log.user.profileImageUrl ? (
                                <img
                                  src={log.user.profileImageUrl}
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

                                <p className="max-w-[190px] truncate text-xs text-[#6B7268]">
                                  {log.user.email}
                                </p>
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

                        {/* Action */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getActionColor(
                              log.action
                            )}`}
                          >
                            {log.action.replace(/_/g, ' ')}
                          </span>
                        </td>

                        {/* Page / Entity */}
                        <td className="px-5 py-4">
                          <div className="max-w-[180px]">
                            <p className="truncate text-sm font-medium capitalize text-[#12203B]">
                              {log.page || log.entityType || '-'}
                            </p>

                            {log.entityId && (
                              <p className="mt-0.5 truncate font-mono text-[10px] text-[#8A9088]">
                                {log.entityId}
                              </p>
                            )}

                            {log.method && (
                              <span className="mt-1 inline-flex rounded bg-[#F7F6F2] px-1.5 py-0.5 font-mono text-[10px] text-[#6B7268]">
                                {log.method}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Tech Center */}
                        <td className="px-5 py-4">
                          {log.techCenter ? (
                            <div>
                              <p className="max-w-[160px] truncate text-sm font-medium text-[#12203B]">
                                {log.techCenter.name}
                              </p>

                              <p className="mt-0.5 text-xs text-[#6B7268]">
                                {log.techCenter.code}
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-[#8A9088]">
                              —
                            </span>
                          )}
                        </td>

                        {/* IP */}
                        <td className="px-5 py-4">
                          <span className="font-mono text-xs text-[#6B7268]">
                            {log.ipAddress || '—'}
                          </span>
                        </td>

                        {/* Session */}
                        <td className="px-5 py-4">
                          <span className="rounded bg-[#F7F6F2] px-2 py-1 font-mono text-[10px] text-[#6B7268]">
                            {log.sessionId
                              ? log.sessionId.substring(0, 8)
                              : 'anonymous'}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4">
                          <span className="whitespace-nowrap text-xs text-[#6B7268]">
                            {formatDate(log.createdAt)}
                          </span>
                        </td>

                        {/* Delete */}
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() =>
                              handleDeleteLogs('single', log.id)
                            }
                            aria-label="Delete this log"
                            title="Delete this log"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-[#8A9088] opacity-70 transition-colors hover:border-[#A4462F]/20 hover:bg-[#A4462F]/5 hover:text-[#A4462F] group-hover:opacity-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </>
          )}
        </section>
      </div>
    </main>
  );
}

