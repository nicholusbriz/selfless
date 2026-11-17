'use client';

import {
  ArrowLeft,
  Check,
  Loader2,
  AlertCircle,
  Bell,
  Trophy,
  Sparkles,
  Info,
  CheckCheck,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllAsRead,
} from '@/hooks/useNotifications';
import { motion } from 'framer-motion';
import { isRecord } from '../response-guards';

/* ─────────────────────────────────────────────────────────────────────────────
   Types + guards
   ───────────────────────────────────────────────────────────────────────────── */

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsPageData {
  notifications: Notification[];
  unreadCount: number;
}

function isNotification(value: unknown): value is Notification {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.message === 'string' &&
    typeof value.type === 'string' &&
    typeof value.isRead === 'boolean' &&
    typeof value.createdAt === 'string'
  );
}

function isNotificationsPageData(
  value: unknown,
): value is NotificationsPageData {
  return (
    isRecord(value) &&
    typeof value.unreadCount === 'number' &&
    Array.isArray(value.notifications) &&
    value.notifications.every(isNotification)
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────────────────────────── */

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return '';
  const diff = Date.now() - then;
  const seconds = Math.floor(diff / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function dayBucket(iso: string): 'Today' | 'Yesterday' | 'Earlier' {
  const then = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor(
    (now.setHours(0, 0, 0, 0) - new Date(then).setHours(0, 0, 0, 0)) /
      86400000,
  );
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return 'Earlier';
}

/** Colour + icon per notification type */
function typeMeta(type: string) {
  const t = type.toLowerCase();
  if (t.includes('football') || t.includes('sport') || t.includes('match')) {
    return {
      Icon: Trophy,
      ring: 'bg-amber-50 text-amber-600 ring-amber-100',
    };
  }
  if (t.includes('course') || t.includes('lesson') || t.includes('learn')) {
    return {
      Icon: Sparkles,
      ring: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    };
  }
  if (t.includes('system') || t.includes('admin') || t.includes('alert')) {
    return {
      Icon: Info,
      ring: 'bg-blue-50 text-blue-600 ring-blue-100',
    };
  }
  return {
    Icon: Bell,
    ring: 'bg-slate-100 text-slate-600 ring-slate-200',
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   Page
   ───────────────────────────────────────────────────────────────────────────── */

export default function NotificationsPage() {
  const router = useRouter();

  const notificationsQuery = useNotifications(false);
  const { isLoading, error } = notificationsQuery;
  const data = isNotificationsPageData(notificationsQuery.data)
    ? notificationsQuery.data
    : null;

  const markAsRead = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  const handleMarkAsRead = async (id: string) => {
    await markAsRead.mutateAsync(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsReadMutation.mutateAsync();
  };

  const handleNotificationClick = async (n: Notification) => {
    if (!n.isRead) await handleMarkAsRead(n.id);
  };

  /* Group notifications by day */
  const grouped = (() => {
    const groups: Record<string, Notification[]> = {
      Today: [],
      Yesterday: [],
      Earlier: [],
    };
    for (const n of data?.notifications ?? []) {
      groups[dayBucket(n.createdAt)].push(n);
    }
    return groups;
  })();

  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="mx-auto w-full max-w-3xl px-4 pt-12 pb-8 sm:px-6 lg:px-8">
        {/* ── Header ── */}
        <header className="mb-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#e2e8f0] bg-white text-[#64748b] transition hover:bg-[#f8fafc] hover:text-[#0f172a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a365d]/30"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="flex items-center gap-2 text-lg font-bold tracking-tight text-[#0f172a]">
              Notifications
              {unreadCount > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#1a365d] px-1.5 text-[10px] font-bold tabular-nums text-white">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-[11px] text-[#64748b]">
              {unreadCount > 0
                ? `${unreadCount} unread`
                : 'You\u2019re all caught up'}
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
              aria-busy={markAllAsReadMutation.isPending}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-3 text-xs font-semibold text-[#1a365d] transition hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a365d]/30"
            >
              {markAllAsReadMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCheck className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">
                {markAllAsReadMutation.isPending ? 'Marking…' : 'Mark all read'}
              </span>
              <span className="sm:hidden">
                {markAllAsReadMutation.isPending ? '…' : 'All'}
              </span>
            </button>
          )}
        </header>

        {/* ── Content ── */}
        <section>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-[#e2e8f0] bg-white p-3"
                >
                  <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-[#f1f5f9]" />
                  <div className="flex-1 space-y-2 pt-0.5">
                    <div className="h-3 w-2/3 animate-pulse rounded bg-[#f1f5f9]" />
                    <div className="h-3 w-full animate-pulse rounded bg-[#f1f5f9]" />
                    <div className="h-2.5 w-16 animate-pulse rounded bg-[#f1f5f9]" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-red-100 bg-white p-8 text-center"
            >
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <h2 className="mt-3 text-sm font-semibold text-[#0f172a]">
                Unable to load notifications
              </h2>
              <p className="mt-1 text-xs leading-5 text-[#64748b]">
                Something went wrong. Please try again.
              </p>
            </motion.div>
          ) : !data?.notifications.length ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-dashed border-[#cbd5e1] bg-white p-12 text-center"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f1f5f9] text-[#94a3b8]">
                <Bell className="h-5 w-5" />
              </div>
              <h2 className="mt-3 text-sm font-semibold text-[#0f172a]">
                No notifications yet
              </h2>
              <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-[#64748b]">
                Updates about matches, courses and dashboard activity will
                appear here.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {(['Today', 'Yesterday', 'Earlier'] as const).map((bucket) => {
                const list = grouped[bucket];
                if (list.length === 0) return null;

                return (
                  <div key={bucket}>
                    <h2 className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#94a3b8]">
                      {bucket}
                    </h2>

                    <div className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white">
                      {list.map((n, i) => {
                        const { Icon, ring } = typeMeta(n.type);
                        const isUnread = !n.isRead;

                        return (
                          <motion.div
                            key={n.id}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: i * 0.02 }}
                            className={cn(
                              'group relative flex items-start gap-3 px-3 py-3 transition sm:px-4 sm:py-3.5',
                              i !== list.length - 1 && 'border-b border-[#f1f5f9]',
                              isUnread ? 'bg-[#f8fbff]' : 'bg-white',
                              'hover:bg-[#f8fafc]',
                            )}
                          >
                            {/* Unread indicator bar */}
                            {isUnread && (
                              <span className="absolute left-0 top-0 h-full w-[2px] bg-[#1a365d]" />
                            )}

                            {/* Type icon */}
                            <div
                              className={cn(
                                'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1',
                                ring,
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </div>

                            {/* Body */}
                            <button
                              type="button"
                              onClick={() => handleNotificationClick(n)}
                              className="min-w-0 flex-1 text-left focus-visible:outline-none"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <h3
                                  className={cn(
                                    'text-sm leading-snug',
                                    isUnread
                                      ? 'font-semibold text-[#0f172a]'
                                      : 'font-medium text-[#334155]',
                                  )}
                                >
                                  {n.title}
                                </h3>
                                <span className="shrink-0 text-[10px] font-medium tabular-nums text-[#94a3b8]">
                                  {relativeTime(n.createdAt)}
                                </span>
                              </div>

                              <p
                                className={cn(
                                  'mt-0.5 line-clamp-2 text-xs leading-5',
                                  isUnread ? 'text-[#475569]' : 'text-[#64748b]',
                                )}
                              >
                                {n.message}
                              </p>

                              {isUnread && (
                                <span className="mt-1.5 inline-flex items-center rounded bg-[#1a365d]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#1a365d]">
                                  New
                                </span>
                              )}
                            </button>

                            {/* Per-row mark as read */}
                            {isUnread && (
                              <button
                                type="button"
                                onClick={() => handleMarkAsRead(n.id)}
                                aria-label="Mark as read"
                                title="Mark as read"
                                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#94a3b8] opacity-0 transition hover:bg-white hover:text-[#1a365d] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a365d]/30 group-hover:opacity-100"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}