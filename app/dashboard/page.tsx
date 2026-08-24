'use client';

import {
  Trophy,
  Users,
  Calendar,
  Briefcase,
  Clock,
  BookOpen,
  ArrowRight,
  User,
  Camera,
  MapPin,
  Activity,
  ArrowLeftRight,
  CalendarPlus,
  Plus,
  Home,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useAuth } from '@/lib/hooks/useAuth';
import { useEffect, useState } from 'react';

/* ============================================================
   TYPES
============================================================ */

interface TechCenter {
  id: string;
  name: string;
  city?: string | null;
}

interface ActivityItem {
  id: string;
  action: string;
  createdAt: string | Date;
  details?: Record<string, string | number> | null;
  user?: {
    firstName: string;
    lastName: string;
    profileImageUrl?: string | null;
  } | null;
}

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  path: string;
  delay: number;
}

/* ============================================================
   QUICK ACTION CARD
============================================================ */

function QuickAction({
  icon,
  label,
  description,
  path,
  delay,
}: QuickActionProps) {
  const router = useRouter();

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => router.push(path)}
      className="
        group w-full min-w-0 rounded-xl border border-[#D9E2EC]
        bg-white p-5 text-left
        transition-all duration-200
        hover:border-[#3182CE]
        hover:shadow-md
      "
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className="
            flex h-10 w-10 shrink-0 items-center justify-center
            rounded-lg bg-[#EEF5FB] text-[#1A365D]
            transition-colors duration-200
            group-hover:bg-[#1A365D] group-hover:text-white
          "
        >
          {icon}
        </div>

        <ArrowRight
          className="
            h-4 w-4 shrink-0 text-[#94A8BD]
            transition-all duration-200
            group-hover:translate-x-1 group-hover:text-[#1A365D]
          "
        />
      </div>

      <div className="mt-4">
        <p className="text-sm font-bold text-[#0F2440]">{label}</p>

        <p className="mt-1 text-xs leading-relaxed text-[#64788A]">
          {description}
        </p>
      </div>
    </motion.button>
  );
}

/* ============================================================
   ROTATING WELCOME MESSAGES
============================================================ */

const welcomeMessages = [
  'Your learning journey continues here.',
  'Stay focused and keep making progress.',
  'Manage your academic activities from one place.',
  'Keep learning, participating and growing.',
];

/* ============================================================
   DASHBOARD PAGE
============================================================ */

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [techCenter, setTechCenter] = useState<TechCenter | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [welcomeIndex, setWelcomeIndex] = useState(0);

  /* ============================================================
     LOAD TECH CENTER + ACTIVITY
  ============================================================ */

  useEffect(() => {
    if (user?.techCenterId) {
      fetchTechCenter(user.techCenterId);
      fetchRecentActivity(user.techCenterId);
    }
  }, [user?.techCenterId]);

  /* ============================================================
     ROTATING WELCOME MESSAGE
  ============================================================ */

  useEffect(() => {
    const interval = window.setInterval(() => {
      setWelcomeIndex(
        (current) => (current + 1) % welcomeMessages.length,
      );
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  /* ============================================================
     API
  ============================================================ */

  const fetchTechCenter = async (techCenterId: string) => {
    try {
      const response = await fetch(`/api/tech-centers/${techCenterId}`);

      if (response.ok) {
        const data = await response.json();
        setTechCenter(data);
      }
    } catch (error) {
      console.error('Error fetching tech center:', error);
    }
  };

  const fetchRecentActivity = async (techCenterId: string) => {
    try {
      const response = await fetch(
        `/api/tech-centers/${techCenterId}/activity?limit=10`,
      );

      if (response.ok) {
        const data = await response.json();
        setRecentActivity(data);
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  /* ============================================================
     ACTIVITY HELPERS
  ============================================================ */

  const getActivityIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'course_submission':
        return <BookOpen className="h-4 w-4" />;

      case 'cleaning_registration':
        return <Calendar className="h-4 w-4" />;

      case 'cleaning_day_change':
        return <ArrowLeftRight className="h-4 w-4" />;

      case 'cleaning_week_created':
        return <CalendarPlus className="h-4 w-4" />;

      case 'cleaning_day_created':
        return <Plus className="h-4 w-4" />;

      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'course_submission':
        return 'bg-[#E8F6F3] text-[#087F6C]';

      case 'cleaning_registration':
        return 'bg-[#FFF5E6] text-[#A86500]';

      case 'cleaning_day_change':
        return 'bg-[#F1EDFF] text-[#6842C2]';

      case 'cleaning_week_created':
        return 'bg-[#FFF0E6] text-[#C85B00]';

      case 'cleaning_day_created':
        return 'bg-[#E7F7FA] text-[#087C95]';

      default:
        return 'bg-[#EEF5FB] text-[#1A365D]';
    }
  };

  const getActivityLabel = (action: string) => {
    switch (action.toLowerCase()) {
      case 'course_submission':
        return 'Course Submitted';

      case 'cleaning_registration':
        return 'Cleaning Day Registered';

      case 'cleaning_day_change':
        return 'Cleaning Day Changed';

      case 'cleaning_week_created':
        return 'Cleaning Week Created';

      case 'cleaning_day_created':
        return 'Cleaning Day Created';

      default:
        return action.replace(/_/g, ' ').toUpperCase();
    }
  };

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const diffInMs =
      now.getTime() - new Date(date).getTime();

    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;

    return `${diffInDays}d ago`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';

    return 'Good Evening';
  };

  /* ============================================================
     USER DATA
  ============================================================ */

  const greeting = getGreeting();

  const userName = user
    ? `${user.firstName} ${user.lastName}`
    : 'Guest';

  const avatarUrl = user?.profileImageUrl || null;

  /* ============================================================
     QUICK ACTIONS
  ============================================================ */

  const quickActions: QuickActionProps[] = [
    {
      icon: <BookOpen className="h-5 w-5" />,
      label: 'My Courses',
      description: 'Access your enrolled courses',
      path: '/dashboard/courses',
      delay: 0.05,
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: 'Students',
      description: 'View all students',
      path: '/dashboard/students',
      delay: 0.1,
    },
    {
      icon: <Briefcase className="h-5 w-5" />,
      label: 'Internships',
      description: 'Browse available internships',
      path: '/dashboard/internships',
      delay: 0.15,
    },
    {
      icon: <Clock className="h-5 w-5" />,
      label: 'Cleaning Rota',
      description: 'View your cleaning schedule',
      path: '/dashboard/cleaning',
      delay: 0.2,
    },
    {
      icon: <Trophy className="h-5 w-5" />,
      label: 'Football Team',
      description: 'Join the football team',
      path: '/dashboard/football-team',
      delay: 0.25,
    },
  ];

  /* ============================================================
     LOADING STATE
  ============================================================ */

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F6F8FB]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#D9E2EC] border-t-[#1A365D]" />

          <p className="text-sm font-medium text-[#64788A]">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  /* ============================================================
     PAGE
  ============================================================ */

  return (
    <div className="min-h-screen bg-[#F6F8FB]">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* ======================================================
            WELCOME HEADER
        ====================================================== */}

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="
            overflow-hidden rounded-2xl border border-[#D9E2EC]
            bg-white shadow-sm
          "
        >
          <div className="border-t-4 border-[#1A365D]">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

                {/* Avatar */}

                <div className="relative shrink-0">
                  <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-[#D9E2EC] bg-[#EEF5FB]">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt={userName}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#1A365D]">
                        <User className="h-9 w-9" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Welcome */}

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#64788A]">
                    {greeting}
                  </p>

                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#0F2440] sm:text-3xl">
                    Welcome back, {userName}
                  </h1>

                  {techCenter && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-[#64788A]">
                      <MapPin className="h-4 w-4 shrink-0 text-[#1A365D]" />

                      <span>
                        <span className="font-medium">
                          Tech Center:
                        </span>{' '}
                        <span className="font-semibold text-[#0F2440]">
                          {techCenter.name}
                        </span>

                        {techCenter.city && (
                          <span>, {techCenter.city}</span>
                        )}
                      </span>
                    </div>
                  )}

                  <div className="mt-3 h-5 overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={welcomeIndex}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3 }}
                        className="text-sm text-[#64788A]"
                      >
                        {welcomeMessages[welcomeIndex]}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Profile Button */}

                <button
                  onClick={() =>
                    router.push('/dashboard/profile')
                  }
                  className="
                    inline-flex shrink-0 items-center justify-center
                    gap-2 rounded-lg border border-[#C9D5E1]
                    bg-white px-4 py-2.5 text-sm font-semibold
                    text-[#1A365D]
                    transition-colors
                    hover:border-[#1A365D]
                    hover:bg-[#F4F7FA]
                  "
                >
                  <User className="h-4 w-4" />
                  My Profile
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ======================================================
            QUICK LINKS
        ====================================================== */}

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="mt-6"
        >
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#0F2440]">
                Quick Links
              </h2>

              <p className="mt-1 text-sm text-[#64788A]">
                Access the services available on your dashboard.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {quickActions.map((action) => (
              <QuickAction
                key={action.path}
                {...action}
              />
            ))}
          </div>
        </motion.section>

        {/* ======================================================
            RECENT ACTIVITY
        ====================================================== */}

        {techCenter && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="
              mt-6 overflow-hidden rounded-2xl
              border border-[#D9E2EC] bg-white shadow-sm
            "
          >
            <div className="flex items-center justify-between gap-3 border-b border-[#E7EDF3] px-6 py-4">
              <div>
                <h2 className="text-base font-bold text-[#0F2440]">
                  Recent Activity
                </h2>

                <p className="mt-0.5 text-xs text-[#64788A]">
                  Recent activity at {techCenter.name}
                </p>
              </div>

              <Activity className="h-5 w-5 text-[#64788A]" />
            </div>

            <div className="p-4 sm:p-5">
              {recentActivity.length > 0 ? (
                <ul className="divide-y divide-[#EDF1F5]">
                  {recentActivity.map((activity, index) => (
                    <motion.li
                      key={activity.id ?? index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        duration: 0.25,
                        delay: index * 0.03,
                      }}
                      className="
                        flex items-start gap-3 px-2 py-4
                        transition-colors hover:bg-[#F8FAFC]
                      "
                    >
                      <div
                        className={`
                          flex h-9 w-9 shrink-0 items-center
                          justify-center rounded-lg
                          ${getActivityColor(activity.action)}
                        `}
                      >
                        {getActivityIcon(activity.action)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <p className="text-sm font-semibold text-[#0F2440]">
                            {activity.user
                              ? `${activity.user.firstName} ${activity.user.lastName}`
                              : 'System'}
                          </p>

                          <span className="text-xs text-[#94A8BD]">
                            {formatTimeAgo(activity.createdAt)}
                          </span>
                        </div>

                        <p className="mt-0.5 text-sm text-[#64788A]">
                          {getActivityLabel(activity.action)}
                        </p>

                        {activity.details &&
                          Object.keys(activity.details).length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">

                              {activity.action ===
                                'course_submission' &&
                                activity.details.courseCount != null && (
                                  <span className="rounded-md bg-[#F3F6F9] px-2 py-1 text-[11px] font-medium text-[#526678]">
                                    {activity.details.courseCount}{' '}
                                    course
                                    {Number(
                                      activity.details.courseCount,
                                    ) > 1
                                      ? 's'
                                      : ''}
                                  </span>
                                )}

                              {activity.action ===
                                'course_submission' &&
                                activity.details.totalCredits != null && (
                                  <span className="rounded-md bg-[#F3F6F9] px-2 py-1 text-[11px] font-medium text-[#526678]">
                                    {activity.details.totalCredits}{' '}
                                    credits
                                  </span>
                                )}

                              {activity.action ===
                                'cleaning_registration' &&
                                activity.details.dayName && (
                                  <span className="rounded-md bg-[#F3F6F9] px-2 py-1 text-[11px] font-medium text-[#526678]">
                                    {activity.details.dayName}
                                  </span>
                                )}

                              {activity.action ===
                                'cleaning_registration' &&
                                activity.details.weekLabel && (
                                  <span className="rounded-md bg-[#F3F6F9] px-2 py-1 text-[11px] font-medium text-[#526678]">
                                    {activity.details.weekLabel}
                                  </span>
                                )}

                              {activity.action ===
                                'cleaning_day_change' &&
                                activity.details.oldDayName &&
                                activity.details.newDayName && (
                                  <span className="rounded-md bg-[#F3F6F9] px-2 py-1 text-[11px] font-medium text-[#526678]">
                                    {activity.details.oldDayName} →{' '}
                                    {activity.details.newDayName}
                                  </span>
                                )}

                              {activity.action ===
                                'cleaning_day_change' &&
                                activity.details.oldWeekLabel &&
                                activity.details.newWeekLabel && (
                                  <span className="rounded-md bg-[#F3F6F9] px-2 py-1 text-[11px] font-medium text-[#526678]">
                                    {activity.details.oldWeekLabel} →{' '}
                                    {activity.details.newWeekLabel}
                                  </span>
                                )}

                              {activity.action ===
                                'cleaning_week_created' &&
                                activity.details.weekLabel && (
                                  <span className="rounded-md bg-[#F3F6F9] px-2 py-1 text-[11px] font-medium text-[#526678]">
                                    {activity.details.weekLabel}
                                  </span>
                                )}

                              {activity.action ===
                                'cleaning_week_created' &&
                                activity.details.dayCount != null && (
                                  <span className="rounded-md bg-[#F3F6F9] px-2 py-1 text-[11px] font-medium text-[#526678]">
                                    {activity.details.dayCount} days
                                  </span>
                                )}

                              {activity.action ===
                                'cleaning_day_created' &&
                                activity.details.dayName && (
                                  <span className="rounded-md bg-[#F3F6F9] px-2 py-1 text-[11px] font-medium text-[#526678]">
                                    {activity.details.dayName}
                                  </span>
                                )}

                              {activity.action ===
                                'cleaning_day_created' &&
                                activity.details.weekLabel && (
                                  <span className="rounded-md bg-[#F3F6F9] px-2 py-1 text-[11px] font-medium text-[#526678]">
                                    {activity.details.weekLabel}
                                  </span>
                                )}
                            </div>
                          )}
                      </div>

                      {activity.user?.profileImageUrl && (
                        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-[#D9E2EC]">
                          <Image
                            src={activity.user.profileImageUrl}
                            alt={`${activity.user.firstName} ${activity.user.lastName}`}
                            fill
                            sizes="32px"
                            className="object-cover"
                          />
                        </div>
                      )}
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <div className="py-10 text-center">
                  <Activity className="mx-auto h-7 w-7 text-[#94A8BD]" />

                  <p className="mt-3 text-sm font-semibold text-[#0F2440]">
                    No recent activity
                  </p>

                  <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-[#64788A]">
                    Course submissions, cleaning activity and
                    other recent actions will appear here.
                  </p>
                </div>
              )}
            </div>
          </motion.section>
        )}

        {/* ======================================================
            TECH CENTER
        ====================================================== */}

        {techCenter && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="
              mt-6 rounded-2xl border border-[#D9E2EC]
              bg-[#1A365D] p-6 shadow-sm
            "
          >
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <Home className="h-5 w-5 text-white" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  Your Tech Center
                </p>

                <p className="mt-1 truncate text-lg font-bold text-white">
                  {techCenter.name}
                </p>

                {techCenter.city && (
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-white/70">
                    <MapPin className="h-3.5 w-3.5" />
                    {techCenter.city}
                  </p>
                )}
              </div>
            </div>
          </motion.section>
        )}

        {/* ======================================================
            FEATURED SERVICES
        ====================================================== */}

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">

          {/* FOOTBALL */}

          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="
              rounded-2xl border border-[#D9E2EC]
              bg-white p-6 shadow-sm
            "
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#EEF5FB] text-[#1A365D]">
                <Trophy className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#087F6C]">
                  Registration Open
                </p>

                <h3 className="mt-1 text-lg font-bold text-[#0F2440]">
                  Football Team
                </h3>

                <p className="mt-1 text-sm leading-relaxed text-[#64788A]">
                  Represent your tech center in the football
                  league.
                </p>

                <button
                  onClick={() =>
                    router.push('/dashboard/football-team')
                  }
                  className="
                    mt-4 inline-flex items-center gap-2
                    rounded-lg bg-[#1A365D] px-4 py-2.5
                    text-sm font-semibold text-white
                    transition-colors
                    hover:bg-[#153475]
                  "
                >
                  Join Team
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.section>

          {/* PROFILE */}

          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.25 }}
            className="
              rounded-2xl border border-[#D9E2EC]
              bg-white p-6 shadow-sm
            "
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#EEF5FB] text-[#1A365D]">
                <Camera className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#64788A]">
                  Account
                </p>

                <h3 className="mt-1 text-lg font-bold text-[#0F2440]">
                  Update Profile
                </h3>

                <p className="mt-1 text-sm leading-relaxed text-[#64788A]">
                  Update your profile photo and personal
                  information.
                </p>

                <button
                  onClick={() =>
                    router.push('/dashboard/profile')
                  }
                  className="
                    mt-4 inline-flex items-center gap-2
                    rounded-lg border border-[#C9D5E1]
                    bg-white px-4 py-2.5
                    text-sm font-semibold text-[#1A365D]
                    transition-colors
                    hover:border-[#1A365D]
                    hover:bg-[#F4F7FA]
                  "
                >
                  Update Profile
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.section>
        </div>

        {/* ======================================================
            ATBRIZ AI
        ====================================================== */}

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3 }}
          className="
            mt-6 rounded-2xl border border-[#D9E2EC]
            bg-white p-5 shadow-sm
          "
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#64788A]">
                Student Support
              </p>

              <h2 className="mt-1 text-base font-bold text-[#0F2440]">
                Atbriz AI
              </h2>

              <p className="mt-1 text-sm text-[#64788A]">
                Access the AI assistant for help and guidance.
              </p>
            </div>

            <button
              onClick={() =>
                router.push('/dashboard/atbriz-ai')
              }
              className="
                inline-flex items-center justify-center gap-2
                rounded-lg bg-[#1A365D] px-5 py-2.5
                text-sm font-semibold text-white
                transition-colors
                hover:bg-[#153475]
              "
            >
              Open Atbriz AI
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

