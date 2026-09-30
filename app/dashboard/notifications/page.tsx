'use client';

import {
  ArrowLeft,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllAsRead,
} from '@/hooks/useNotifications';
import { motion } from 'framer-motion';

/* ============================================================
   TYPES
============================================================ */

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

/* ============================================================
   HELPERS
============================================================ */

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

/* ============================================================
   NOTIFICATION PAGE
============================================================ */

export default function NotificationsPage() {
  const router = useRouter();

  const { data, isLoading, error } = useNotifications(false);

  const markAsRead = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  /* ============================================================
     ACTIONS
  ============================================================ */

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead.mutateAsync(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsReadMutation.mutateAsync();
  };

  const handleNotificationClick = async (
    notification: Notification,
  ) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id);
    }
  };

  /* ============================================================
     PAGE
  ============================================================ */

  return (
    <div className="min-h-screen bg-[#F6F8FB]">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="
            overflow-hidden rounded-2xl
            border border-[#D9E2EC]
            bg-white shadow-sm
          "
        >
          <div className="border-t-4 border-[#1A365D]">
            <div className="p-5 sm:p-6">

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                {/* LEFT SIDE */}

                <div className="flex min-w-0 items-center gap-3 sm:gap-4">

                  {/* Back */}

                  <button
                    onClick={() => router.back()}
                    className="
                      flex h-10 w-10 shrink-0 items-center
                      justify-center rounded-lg
                      border border-[#D9E2EC]
                      bg-white text-[#64788A]
                      transition-all duration-200
                      hover:border-[#1A365D]
                      hover:bg-[#F4F7FA]
                      hover:text-[#1A365D]
                    "
                    aria-label="Go back"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>

                  <div className="hidden h-8 w-px bg-[#E7EDF3] sm:block" />

                  {/* TITLE */}

                  <div className="min-w-0">
                      <h1 className="truncate text-xl font-bold tracking-tight text-[#0F2440] sm:text-2xl">
                        Notifications
                      </h1>

                      {data?.unreadCount &&
                      data.unreadCount > 0 ? (
                        <p className="mt-0.5 text-sm text-[#64788A]">
                          {data.unreadCount}{' '}
                          {data.unreadCount === 1
                            ? 'unread notification'
                            : 'unread notifications'}
                        </p>
                      ) : (
                        <p className="mt-0.5 text-sm text-[#64788A]">
                          Stay up to date with your dashboard
                        </p>
                      )}
                  </div>
                </div>

                {/* MARK ALL */}

                {data?.unreadCount &&
                data.unreadCount > 0 ? (
                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={
                      markAllAsReadMutation.isPending
                    }
                    className="
                      inline-flex shrink-0
                      items-center justify-center
                      gap-2 rounded-lg
                      bg-[#1A365D] px-4 py-2.5
                      text-sm font-semibold text-white
                      shadow-sm transition-all duration-200
                      hover:bg-[#153475] hover:shadow
                      focus:outline-none focus-visible:ring-2
                      focus-visible:ring-[#3182CE] focus-visible:ring-offset-2
                      disabled:cursor-not-allowed disabled:opacity-60
                    "
                  >
                    {markAllAsReadMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}

                    {markAllAsReadMutation.isPending
                      ? 'Marking as read...'
                      : 'Mark all as read'}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </motion.section>

        {/* ======================================================
            NOTIFICATIONS
        ====================================================== */}

        <section className="mt-6">

          {/* LOADING */}

          {isLoading ? (
            <div className="space-y-3">

              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="
                    rounded-lg
                    border border-[#D9E2EC]
                    bg-white p-4
                    shadow-sm
                  "
                >
                  <div className="min-w-0">

                      <div className="
                        h-4 w-48
                        animate-pulse rounded
                        bg-[#EEF2F6]
                      " />

                      <div className="
                        mt-3 h-3 w-full
                        animate-pulse rounded
                        bg-[#F0F3F6]
                      " />

                      <div className="
                        mt-2 h-3 w-3/4
                        animate-pulse rounded
                        bg-[#F0F3F6]
                      " />

                      <div className="
                        mt-4 h-3 w-24
                        animate-pulse rounded
                        bg-[#F0F3F6]
                      " />
                  </div>
                </div>
              ))}
            </div>

          ) : error ? (

            /* ==================================================
               ERROR
            ================================================== */

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="
                rounded-2xl
                border border-[#F2C5C5]
                bg-white p-10
                text-center shadow-sm
              "
            >
              <div className="
                mx-auto flex h-12 w-12
                items-center justify-center
                rounded-xl bg-[#FFF1F1]
              ">
                <AlertCircle className="h-6 w-6 text-[#C53030]" />
              </div>

              <h2 className="mt-4 text-base font-bold text-[#0F2440]">
                Unable to load notifications
              </h2>

              <p className="mt-1 text-sm text-[#64788A]">
                Something went wrong while loading your
                notifications. Please try again.
              </p>
            </motion.div>

          ) : !data?.notifications ||
            data.notifications.length === 0 ? (

            /* ==================================================
               EMPTY STATE
            ================================================== */

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="
                rounded-2xl
                border border-[#D9E2EC]
                bg-white p-12
                text-center shadow-sm
              "
            >
              <h2 className="text-lg font-bold text-[#0F2440]">
                No notifications yet
              </h2>

              <p className="mt-1 text-sm text-[#64788A]">
                You&apos;re all caught up!
              </p>

              <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-[#94A8BD]">
                Notifications about football, cleaning,
                courses and other dashboard activities will
                appear here.
              </p>

            </motion.div>

          ) : (

            /* ==================================================
               NOTIFICATION LIST
            ================================================== */

            <div className="space-y-2.5">

              {data.notifications.map(
                (
                  notification: Notification,
                  index: number,
                ) => (
                  <motion.div
                    key={notification.id}
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.25,
                      delay: index * 0.04,
                    }}
                    onClick={() =>
                      handleNotificationClick(
                        notification,
                      )
                    }
                    className={cn(
                      `
                        group cursor-pointer
                        overflow-hidden rounded-lg
                        border bg-white
                        p-4 shadow-sm
                        transition-all duration-200
                      `,
                      !notification.isRead
                        ? `
                          border-[#BFD3E6]
                          bg-[#FBFDFF]
                          shadow-[0_2px_8px_rgba(26,54,93,0.06)]
                          hover:border-[#3182CE]
                          hover:shadow-md
                        `
                        : `
                          border-[#D9E2EC]
                          hover:border-[#C3D1DE]
                          hover:shadow-md
                        `,
                    )}
                  >
                    <div className="min-w-0">

                        {/* TITLE ROW */}

                        <div className="flex items-start justify-between gap-4">

                          <div className="min-w-0">
                            <h3
                              className={cn(
                                'text-sm leading-5',
                                !notification.isRead
                                  ? 'font-bold text-[#0F2440]'
                                  : 'font-semibold text-[#34495E]',
                              )}
                            >
                              {notification.title}
                            </h3>
                          </div>

                          {/* UNREAD DOT */}

                          {!notification.isRead && (
                            <span
                              className="
                                mt-1.5 h-2.5 w-2.5
                                shrink-0 rounded-full
                                bg-[#3182CE]
                                ring-4 ring-[#EAF3FA]
                              "
                              aria-label="Unread"
                            />
                          )}
                        </div>

                        {/* MESSAGE */}

                        <p
                          className={cn(
                            'mt-2 text-sm leading-relaxed',
                            !notification.isRead
                              ? 'text-[#526678]'
                              : 'text-[#718396]',
                          )}
                        >
                          {notification.message}
                        </p>

                        {/* FOOTER */}

                        <div className="mt-3 flex flex-wrap items-center gap-3">

                          <p
                            className="
                              text-xs font-medium
                              text-[#94A8BD]
                            "
                          >
                            {new Date(
                              notification.createdAt,
                            ).toLocaleString()}
                          </p>

                          {!notification.isRead && (
                            <span
                              className="
                                rounded-md
                                border border-[#D5E5F2]
                                bg-[#EEF5FB]
                                px-2 py-1
                                text-[10px]
                                font-bold uppercase
                                tracking-wide
                                text-[#1A365D]
                              "
                            >
                              New
                            </span>
                          )}
                        </div>
                      </div>
                  </motion.div>
                ),
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}