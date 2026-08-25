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
  Play,
  Video,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useAuth } from '@/lib/hooks/useAuth';
import { useEffect, useState } from 'react';
import VideoPlayer from '@/components/VideoPlayer';

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
  badge?: string;
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
  badge,
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
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => router.push(path)}
      className="
        group relative w-full min-w-0 overflow-hidden
        rounded-2xl border border-[#D9E2EC]
        bg-white p-5 text-left
        shadow-[0_1px_2px_rgba(15,36,64,0.03)]
        transition-all duration-200
        hover:border-[#B8C9DA]
        hover:shadow-lg
      "
    >
      {/* Top accent */}

      <div
        className="
          absolute left-0 top-0 h-1 w-0
          bg-[#1A365D]
          transition-all duration-300
          group-hover:w-full
        "
      />

      <div className="flex items-start justify-between gap-4">
        {/* Icon */}

        <div
          className="
            flex h-11 w-11 shrink-0 items-center justify-center
            rounded-xl bg-[#EEF5FB]
            text-[#1A365D]
            ring-1 ring-inset ring-[#DCE8F2]
            transition-all duration-200
            group-hover:bg-[#1A365D]
            group-hover:text-white
            group-hover:ring-[#1A365D]
          "
        >
          {icon}
        </div>

        {/* Arrow */}

        <div
          className="
            flex h-8 w-8 shrink-0 items-center justify-center
            rounded-full bg-[#F6F8FB]
            transition-all duration-200
            group-hover:bg-[#EEF5FB]
          "
        >
          <ArrowRight
            className="
              h-4 w-4 text-[#94A8BD]
              transition-all duration-200
              group-hover:translate-x-0.5
              group-hover:text-[#1A365D]
            "
          />
        </div>
      </div>

      <div className="mt-5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-bold text-[#0F2440]">
            {label}
          </p>

          {badge && (
            <span
              className="
                rounded-full bg-[#E8F6F3]
                px-2 py-0.5 text-[10px]
                font-bold uppercase tracking-wide
                text-[#087F6C]
              "
            >
              {badge}
            </span>
          )}
        </div>

        <p className="mt-1.5 text-xs leading-relaxed text-[#64788A]">
          {description}
        </p>

        <div
          className="
            mt-4 flex items-center gap-1.5
            text-[11px] font-semibold
            text-[#1A365D]
            opacity-70 transition-opacity
            group-hover:opacity-100
          "
        >
          Open
          <ArrowRight className="h-3 w-3" />
        </div>
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

  const [techCenter, setTechCenter] =
    useState<TechCenter | null>(null);

  const [recentActivity, setRecentActivity] =
    useState<ActivityItem[]>([]);

  const [welcomeIndex, setWelcomeIndex] = useState(0);

  const [videos, setVideos] = useState<string[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);

  /* ============================================================
     LOAD TECH CENTER + ACTIVITY
  ============================================================ */

  useEffect(() => {
    if (user?.techCenterId) {
      fetchTechCenter(user.techCenterId);
      fetchRecentActivity(user.techCenterId);
    }
  }, [user?.techCenterId]);

  useEffect(() => {
    fetchVideos();
  }, []);

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
      const response = await fetch(
        `/api/tech-centers/${techCenterId}`,
      );

      if (response.ok) {
        const data = await response.json();
        setTechCenter(data);
      }
    } catch (error) {
      console.error(
        'Error fetching tech center:',
        error,
      );
    }
  };

  const fetchRecentActivity = async (
    techCenterId: string,
  ) => {
    try {
      const response = await fetch(
        `/api/tech-centers/${techCenterId}/activity?limit=10`,
      );

      if (response.ok) {
        const data = await response.json();
        setRecentActivity(data);
      }
    } catch (error) {
      console.error(
        'Error fetching recent activity:',
        error,
      );
    }
  };

  const fetchVideos = async () => {
    try {
      setIsLoadingVideos(true);
      const response = await fetch('/api/videos');

      if (response.ok) {
        const data = await response.json();
        setVideos(data.videos || []);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setIsLoadingVideos(false);
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
      description: 'Access and manage your enrolled courses.',
      path: '/dashboard/courses',
      delay: 0.05,
      badge: 'Academic',
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: 'Students',
      description: 'Connect with and view students in your center.',
      path: '/dashboard/students',
      delay: 0.1,
      badge: 'Community',
    },
    {
      icon: <Briefcase className="h-5 w-5" />,
      label: 'Internships',
      description: 'Discover available internship opportunities.',
      path: '/dashboard/internships',
      delay: 0.15,
      badge: 'Career',
    },
    {
      icon: <Clock className="h-5 w-5" />,
      label: 'Cleaning Rota',
      description: 'View your cleaning schedule and registration.',
      path: '/dashboard/cleaning',
      delay: 0.2,
      badge: 'Schedule',
    },
    {
      icon: <Trophy className="h-5 w-5" />,
      label: 'Football Team',
      description: 'View the team and join upcoming activities.',
      path: '/dashboard/football-team',
      delay: 0.25,
      badge: 'Sports',
    },
  ];

  /* ============================================================
     LOADING STATE
  ============================================================ */

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F6F8FB]">
        <div className="flex flex-col items-center gap-4">
          <div
            className="
              h-10 w-10 animate-spin rounded-full
              border-4 border-[#D9E2EC]
              border-t-[#1A365D]
            "
          />

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
                  <div
                    className="
                      relative h-20 w-20 overflow-hidden
                      rounded-xl border border-[#D9E2EC]
                      bg-[#EEF5FB]
                    "
                  >
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
                        initial={{
                          opacity: 0,
                          y: 8,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                          y: -8,
                        }}
                        transition={{
                          duration: 0.3,
                        }}
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
                    inline-flex shrink-0 items-center
                    justify-center gap-2 rounded-lg
                    border border-[#C9D5E1]
                    bg-white px-4 py-2.5
                    text-sm font-semibold text-[#1A365D]
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
          transition={{
            duration: 0.35,
            delay: 0.05,
          }}
          className="mt-7"
        >
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-[#1A365D]" />

                <h2 className="text-lg font-bold text-[#0F2440]">
                  Quick Links
                </h2>
              </div>

              <p className="mt-1.5 text-sm text-[#64788A]">
                Quickly access the services and activities you use most.
              </p>
            </div>

            <p className="text-xs font-medium text-[#94A8BD]">
              5 available services
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
            transition={{
              duration: 0.35,
              delay: 0.1,
            }}
            className="
              mt-7 overflow-hidden rounded-2xl
              border border-[#D9E2EC]
              bg-white shadow-sm
            "
          >
            <div
              className="
                flex items-center justify-between gap-3
                border-b border-[#E7EDF3]
                px-6 py-4
              "
            >
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
                  {recentActivity.map(
                    (activity, index) => (
                      <motion.li
                        key={
                          activity.id ?? index
                        }
                        initial={{
                          opacity: 0,
                        }}
                        animate={{
                          opacity: 1,
                        }}
                        transition={{
                          duration: 0.25,
                          delay: index * 0.03,
                        }}
                        className="
                          flex items-start gap-3
                          px-2 py-4
                          transition-colors
                          hover:bg-[#F8FAFC]
                        "
                      >
                        <div
                          className={`
                            flex h-9 w-9 shrink-0
                            items-center justify-center
                            rounded-lg
                            ${getActivityColor(
                              activity.action,
                            )}
                          `}
                        >
                          {getActivityIcon(
                            activity.action,
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <p className="text-sm font-semibold text-[#0F2440]">
                              {activity.user
                                ? `${activity.user.firstName} ${activity.user.lastName}`
                                : 'System'}
                            </p>

                            <span className="text-xs text-[#94A8BD]">
                              {formatTimeAgo(
                                activity.createdAt,
                              )}
                            </span>
                          </div>

                          <p className="mt-0.5 text-sm text-[#64788A]">
                            {getActivityLabel(
                              activity.action,
                            )}
                          </p>

                          {activity.details &&
                            Object.keys(
                              activity.details,
                            ).length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">

                                {activity.action ===
                                  'course_submission' &&
                                  activity.details
                                    .courseCount !=
                                    null && (
                                    <span className="rounded-md bg-[#F3F6F9] px-2 py-1 text-[11px] font-medium text-[#526678]">
                                      {
                                        activity
                                          .details
                                          .courseCount
                                      }{' '}
                                      course
                                      {Number(
                                        activity
                                          .details
                                          .courseCount,
                                      ) > 1
                                        ? 's'
                                        : ''}
                                    </span>
                                  )}

                                {activity.action ===
                                  'course_submission' &&
                                  activity.details
                                    .totalCredits !=
                                    null && (
                                    <span className="rounded-md bg-[#F3F6F9] px-2 py-1 text-[11px] font-medium text-[#526678]">
                                      {
                                        activity
                                          .details
                                          .totalCredits
                                      }{' '}
                                      credits
                                    </span>
                                  )}

                                {activity.action ===
                                  'cleaning_registration' &&
                                  activity.details
                                    .dayName && (
                                    <span className="rounded-md bg-[#F3F6F9] px-2 py-1 text-[11px] font-medium text-[#526678]">
                                      {
                                        activity
                                          .details
                                          .dayName
                                      }
                                    </span>
                                  )}

                                {activity.action ===
                                  'cleaning_registration' &&
                                  activity.details
                                    .weekLabel && (
                                    <span className="rounded-md bg-[#F3F6F9] px-2 py-1 text-[11px] font-medium text-[#526678]">
                                      {
                                        activity
                                          .details
                                          .weekLabel
                                      }
                                    </span>
                                  )}

                                {activity.action ===
                                  'cleaning_day_change' &&
                                  activity.details
                                    .oldDayName &&
                                  activity.details
                                    .newDayName && (
                                    <span className="rounded-md bg-[#F3F6F9] px-2 py-1 text-[11px] font-medium text-[#526678]">
                                      {
                                        activity
                                          .details
                                          .oldDayName
                                      }{' '}
                                      →{' '}
                                      {
                                        activity
                                          .details
                                          .newDayName
                                      }
                                    </span>
                                  )}

                                {activity.action ===
                                  'cleaning_day_change' &&
                                  activity.details
                                    .oldWeekLabel &&
                                  activity.details
                                    .newWeekLabel && (
                                    <span className="rounded-md bg-[#F3F6F9] px-2 py-1 text-[11px] font-medium text-[#526678]">
                                      {
                                        activity
                                          .details
                                          .oldWeekLabel
                                      }{' '}
                                      →{' '}
                                      {
                                        activity
                                          .details
                                          .newWeekLabel
                                      }
                                    </span>
                                  )}

                                {activity.action ===
                                  'cleaning_week_created' &&
                                  activity.details
                                    .weekLabel && (
                                    <span className="rounded-md bg-[#F3F6F9] px-2 py-1 text-[11px] font-medium text-[#526678]">
                                      {
                                        activity
                                          .details
                                          .weekLabel
                                      }
                                    </span>
                                  )}

                                {activity.action ===
                                  'cleaning_week_created' &&
                                  activity.details
                                    .dayCount !=
                                    null && (
                                    <span className="rounded-md bg-[#F3F6F9] px-2 py-1 text-[11px] font-medium text-[#526678]">
                                      {
                                        activity
                                          .details
                                          .dayCount
                                      }{' '}
                                      days
                                    </span>
                                  )}

                                {activity.action ===
                                  'cleaning_day_created' &&
                                  activity.details
                                    .dayName && (
                                    <span className="rounded-md bg-[#F3F6F9] px-2 py-1 text-[11px] font-medium text-[#526678]">
                                      {
                                        activity
                                          .details
                                          .dayName
                                      }
                                    </span>
                                  )}

                                {activity.action ===
                                  'cleaning_day_created' &&
                                  activity.details
                                    .weekLabel && (
                                    <span className="rounded-md bg-[#F3F6F9] px-2 py-1 text-[11px] font-medium text-[#526678]">
                                      {
                                        activity
                                          .details
                                          .weekLabel
                                      }
                                    </span>
                                  )}
                              </div>
                            )}
                        </div>

                        {activity.user
                          ?.profileImageUrl && (
                          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-[#D9E2EC]">
                            <Image
                              src={
                                activity.user
                                  .profileImageUrl
                              }
                              alt={`${activity.user.firstName} ${activity.user.lastName}`}
                              fill
                              sizes="32px"
                              className="object-cover"
                            />
                          </div>
                        )}
                      </motion.li>
                    ),
                  )}
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
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.35,
              delay: 0.15,
            }}
            className="
              mt-7 rounded-2xl
              border border-[#D9E2EC]
              bg-[#1A365D] p-6 shadow-sm
            "
          >
            <div className="flex items-center gap-4">
              <div
                className="
                  flex h-11 w-11 shrink-0
                  items-center justify-center
                  rounded-lg bg-white/10
                "
              >
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

        <div className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-2">

          {/* ====================================================
              VIDEO CARD
          ==================================================== */}

          <motion.section
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.35,
              delay: 0.2,
            }}
            className="
              overflow-hidden rounded-2xl
              border border-[#D9E2EC]
              bg-white shadow-sm
            "
          >
            {/* Video Header */}

            <div className="p-6 pb-5">
              <div className="flex items-start gap-4">
                <div
                  className="
                    flex h-11 w-11 shrink-0
                    items-center justify-center
                    rounded-xl bg-[#EEF5FB]
                    text-[#1A365D]
                  "
                >
                  <Video className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#087F6C]">
                      Media Center
                    </p>

                    <span
                      className="
                        inline-flex items-center gap-1
                        rounded-full bg-[#E8F6F3]
                        px-2 py-0.5 text-[10px]
                        font-bold uppercase tracking-wide
                        text-[#087F6C]
                      "
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#087F6C]" />
                      {videos.length > 0 ? 'Available' : 'Coming Soon'}
                    </span>
                  </div>

                  <h3 className="mt-1 text-lg font-bold text-[#0F2440]">
                    Video Hub
                  </h3>

                  <p className="mt-1 text-sm leading-relaxed text-[#64788A]">
                    Watch video content shared by your tech center admin.
                  </p>
                </div>
              </div>
            </div>

            {/* Video Display */}

            <div className="px-6">
              {videos.length > 0 ? (
                <VideoPlayer videos={videos} />
              ) : (
                <div
                  className="
                    group relative overflow-hidden
                    rounded-xl border border-[#D9E2EC]
                    bg-[#0B1728]
                    shadow-inner
                  "
                >
                  <div className="flex aspect-video w-full items-center justify-center">
                    <div className="text-center">
                      <Video className="mx-auto h-12 w-12 text-[#64788A]" />
                      <p className="mt-2 text-sm font-medium text-[#64788A]">
                        No videos available
                      </p>
                      <p className="mt-1 text-xs text-[#94A8BD]">
                        Videos will appear here when uploaded by admin
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Video Footer */}

            <div className="p-6 pt-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-medium text-[#64788A]">
                    {videos.length > 0
                      ? 'Watch the latest video content.'
                      : 'Video content will be available soon.'}
                  </p>
                </div>

                <button
                  onClick={() => router.push('/dashboard/football-team')}
                  className="
                    inline-flex shrink-0 items-center
                    justify-center gap-2 rounded-lg
                    bg-[#1A365D] px-4 py-2.5
                    text-sm font-semibold text-white
                    transition-colors
                    hover:bg-[#153475]
                  "
                >
                  <Trophy className="h-4 w-4" />
                  Football Team
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.section>

          {/* ====================================================
              PROFILE
          ==================================================== */}

          <motion.section
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.35,
              delay: 0.25,
            }}
            className="
              rounded-2xl border border-[#D9E2EC]
              bg-white p-6 shadow-sm
            "
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div
                className="
                  flex h-11 w-11 shrink-0
                  items-center justify-center
                  rounded-xl bg-[#EEF5FB]
                  text-[#1A365D]
                "
              >
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
                  Keep your profile information and photo
                  up to date.
                </p>

                <div className="mt-5 rounded-xl border border-[#E4EBF2] bg-[#F8FAFC] p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        flex h-9 w-9 items-center
                        justify-center rounded-lg
                        bg-white text-[#1A365D]
                        shadow-sm
                      "
                    >
                      <User className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-[#0F2440]">
                        Personal information
                      </p>

                      <p className="mt-0.5 text-[11px] text-[#64788A]">
                        Manage your account details.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    router.push('/dashboard/profile')
                  }
                  className="
                    mt-4 inline-flex items-center
                    gap-2 rounded-lg
                    border border-[#C9D5E1]
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
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.35,
            delay: 0.3,
          }}
          className="
            mt-7 rounded-2xl
            border border-[#D9E2EC]
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
                router.push('/dashboard/ai')
              }
              className="
                inline-flex items-center
                justify-center gap-2
                rounded-lg bg-[#1A365D]
                px-5 py-2.5
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