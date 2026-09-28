'use client';

import {
  Activity,
  ArrowLeft,
  Building2,
  Calendar as CalendarIcon,
  ChevronDown,
  Clock,
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

interface ActiveUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  lastActiveAt: string;
  currentSessionId?: string;
  techCenter?: {
    name: string;
    code: string;
  };
  role?: {
    name: string;
    displayName: string;
  };
}

const PAGE_SIZE = 50;

export default function ActivityLogsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  // ------------------------------------------------------------
  // Filters
  // ------------------------------------------------------------
  const [userId, setUserId] = useState('');
  const [techCenterId, setTechCenterId] = useState('');
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isAnonymous, setIsAnonymous] = useState('');

  // ------------------------------------------------------------
  // Pagination / UI
  // ------------------------------------------------------------
  const [page, setPage] = useState(1);
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
    entityType,
    startDate,
    endDate,
    isAnonymous,
    page,
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
      if (entityType) params.append('entityType', entityType);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (isAnonymous) params.append('isAnonymous', isAnonymous);

      params.append('limit', String(PAGE_SIZE));
      params.append('offset', String((page - 1) * PAGE_SIZE));

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
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // ------------------------------------------------------------
  // Extract tech centers from returned logs
  // ------------------------------------------------------------
  const uniqueTechCenters = useMemo(() => {
    const centers = new Map<string, ActivityLog['techCenter']>();

    logs.forEach((log) => {
      if (log.techCenter?.id) {
        centers.set(log.techCenter.id, log.techCenter);
      }
    });

    return Array.from(centers.values()).filter(Boolean);
  }, [logs]);

  // ------------------------------------------------------------
  // Fetch active sessions
  // ------------------------------------------------------------
  const {
    data: sessionsData,
    isLoading: isLoadingSessions,
  } = useQuery({
    queryKey: ['active-sessions'],
    queryFn: async () => {
      const response = await fetch('/api/admin/active-sessions');

      if (!response.ok) {
        throw new Error('Failed to fetch active sessions');
      }

      return response.json();
    },
    enabled: !authLoading && !!user && user.role === 'dev',
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

  const activeUsers: ActiveUser[] = sessionsData?.activeUsers || [];
  const activeUsersCount = sessionsData?.count || 0;

  // ------------------------------------------------------------
  // Derived statistics
  // ------------------------------------------------------------
  const pageVisits = logs.filter(
    (log) => log.action === 'page_visit'
  ).length;

  const techCenterCount = new Set(
    logs
      .map((log) => log.techCenter?.id)
      .filter(Boolean)
  ).size;

  // ------------------------------------------------------------
  // Search
  // ------------------------------------------------------------
  const handleSearch = () => {
    setPage(1);
    refetch();
  };

  // ------------------------------------------------------------
  // Reset
  // ------------------------------------------------------------
  const handleReset = () => {
    setUserId('');
    setTechCenterId('');
    setAction('');
    setEntityType('');
    setStartDate('');
    setEndDate('');
    setIsAnonymous('');
    setPage(1);

    setTimeout(() => {
      refetch();
    }, 0);
  };

  // ------------------------------------------------------------
  // Delete logs
  // ------------------------------------------------------------
  const handleDeleteLogs = async (
    deleteType: 'single' | 'action' | 'date-range',
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

      if (deleteType === 'date-range') {
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (action) params.append('action', action);
        if (techCenterId) {
          params.append('techCenterId', techCenterId);
        }
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
                  placeholder="Enter user ID"
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

                  {uniqueTechCenters.map((tc) => (
                    <option key={tc?.id} value={tc?.id}>
                      {tc?.name} ({tc?.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* User Type */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6B7268]">
                  User Type
                </label>

                <select
                  value={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.value)}
                  className="h-10 w-full rounded-lg border border-[#DADCD3] bg-white px-3 text-sm text-[#12203B] outline-none transition-colors focus:border-[#B98A3E] focus:ring-2 focus:ring-[#B98A3E]/10"
                >
                  <option value="">All Users</option>
                  <option value="false">Logged In Users</option>
                  <option value="true">Anonymous Visitors</option>
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
                  <option value="login">Login</option>
                  <option value="logout">Logout</option>
                  <option value="register">Register</option>
                  <option value="create">Create</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                  <option value="ai_chat_opened">AI Chat Opened</option>
                  <option value="page_visit">Page Visit</option>
                </select>
              </div>

              {/* Entity */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6B7268]">
                  Entity Type
                </label>

                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value)}
                  className="h-10 w-full rounded-lg border border-[#DADCD3] bg-white px-3 text-sm text-[#12203B] outline-none transition-colors focus:border-[#B98A3E] focus:ring-2 focus:ring-[#B98A3E]/10"
                >
                  <option value="">All Entities</option>
                  <option value="user">User</option>
                  <option value="tech_center">Tech Center</option>
                  <option value="course">Course</option>
                  <option value="grade">Grade</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="ai_assistant">AI Assistant</option>
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6B7268]">
                  Start Date
                </label>

                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-10 w-full rounded-lg border border-[#DADCD3] bg-white px-3 text-sm text-[#12203B] outline-none transition-colors focus:border-[#B98A3E] focus:ring-2 focus:ring-[#B98A3E]/10"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6B7268]">
                  End Date
                </label>

                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-10 w-full rounded-lg border border-[#DADCD3] bg-white px-3 text-sm text-[#12203B] outline-none transition-colors focus:border-[#B98A3E] focus:ring-2 focus:ring-[#B98A3E]/10"
                />
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

                <button
                  onClick={() => handleDeleteLogs('date-range')}
                  disabled={!startDate && !endDate}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#A4462F]/20 bg-[#A4462F]/5 px-3 text-xs font-semibold text-[#A4462F] transition-colors hover:bg-[#A4462F]/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete date range
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
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#55705B]/10">
                <Clock className="h-4 w-4 text-[#55705B]" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-[#6B7268]">
                  Active sessions
                </p>
                <p className="mt-0.5 text-xl font-semibold text-[#12203B]">
                  {activeUsersCount.toLocaleString()}
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
                  {pageVisits.toLocaleString()}
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
        </section>

        {/* ======================================================
            ACTIVE SESSIONS
        ====================================================== */}
        <section className="mb-6 rounded-xl border border-[#DADCD3] bg-white shadow-[0_1px_2px_rgba(18,32,59,0.03)]">

          <div className="flex flex-col gap-2 border-b border-[#DADCD3] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-[#12203B]">
                  Active sessions
                </h2>

                <span className="rounded-full bg-[#55705B]/10 px-2 py-0.5 text-[10px] font-semibold text-[#55705B]">
                  LIVE
                </span>
              </div>

              <p className="mt-0.5 text-xs text-[#6B7268]">
                Sessions active within the last 24 hours.
              </p>
            </div>

            <div className="text-xs text-[#6B7268]">
              <span className="font-semibold text-[#12203B]">
                {activeUsersCount}
              </span>{' '}
              active users
            </div>
          </div>

          {isLoadingSessions ? (
            <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-lg border border-[#DADCD3] p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#E6E7E1]" />

                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-2/3 rounded bg-[#E6E7E1]" />
                      <div className="h-2.5 w-1/2 rounded bg-[#E6E7E1]" />
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="h-2.5 w-3/4 rounded bg-[#E6E7E1]" />
                    <div className="h-2.5 w-2/3 rounded bg-[#E6E7E1]" />
                  </div>
                </div>
              ))}
            </div>
          ) : activeUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#F7F6F2]">
                <Clock className="h-5 w-5 text-[#8A9088]" />
              </div>

              <p className="text-sm font-medium text-[#4B564C]">
                No active sessions
              </p>

              <p className="mt-1 text-xs text-[#8A9088]">
                There are currently no active users to display.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
              {activeUsers.map((activeUser) => (
                <div
                  key={activeUser.id}
                  className="rounded-lg border border-[#DADCD3] bg-[#F7F6F2]/60 p-4 transition-colors hover:border-[#B98A3E]/40 hover:bg-white"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#DADCD3] bg-white">
                      <User className="h-4 w-4 text-[#6B7268]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#12203B]">
                            {activeUser.firstName}{' '}
                            {activeUser.lastName}
                          </p>

                          <p className="truncate text-xs text-[#6B7268]">
                            {activeUser.email}
                          </p>
                        </div>

                        <span
                          className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#55705B]"
                          title="Active"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 border-t border-[#DADCD3] pt-3">

                    <div className="flex items-center gap-2 text-xs text-[#6B7268]">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        Active {formatDate(activeUser.lastActiveAt)}
                      </span>
                    </div>

                    {activeUser.techCenter && (
                      <div className="flex items-center gap-2 text-xs text-[#6B7268]">
                        <Building2 className="h-3.5 w-3.5 shrink-0" />

                        <span className="truncate">
                          {activeUser.techCenter.name}{' '}
                          <span className="text-[#8A9088]">
                            ({activeUser.techCenter.code})
                          </span>
                        </span>
                      </div>
                    )}

                    {activeUser.role && (
                      <div className="flex items-center gap-2 text-xs text-[#6B7268]">
                        <User className="h-3.5 w-3.5 shrink-0" />
                        <span>{activeUser.role.displayName}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
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
          ) : logs.length === 0 ? (
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
                    {logs.map((log) => (
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

              {/* ==================================================
                  PAGINATION
              ================================================== */}
              <div className="flex flex-col gap-3 border-t border-[#DADCD3] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-[#6B7268]">
                  Showing{' '}
                  <span className="font-semibold text-[#12203B]">
                    {(page - 1) * PAGE_SIZE + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-semibold text-[#12203B]">
                    {Math.min(page * PAGE_SIZE, total)}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold text-[#12203B]">
                    {total}
                  </span>{' '}
                  logs
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setPage((current) => Math.max(1, current - 1))
                    }
                    disabled={page === 1}
                    className="h-9 rounded-lg border border-[#DADCD3] bg-white px-3.5 text-xs font-medium text-[#4B564C] transition-colors hover:bg-[#F7F6F2] hover:text-[#12203B] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <div className="flex h-9 items-center rounded-lg bg-[#F7F6F2] px-3 text-xs font-semibold text-[#12203B]">
                    Page {page} of {totalPages}
                  </div>

                  <button
                    onClick={() =>
                      setPage((current) =>
                        Math.min(totalPages, current + 1)
                      )
                    }
                    disabled={page >= totalPages}
                    className="h-9 rounded-lg border border-[#DADCD3] bg-white px-3.5 text-xs font-medium text-[#4B564C] transition-colors hover:bg-[#F7F6F2] hover:text-[#12203B] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

