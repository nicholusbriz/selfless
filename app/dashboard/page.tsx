'use client';

import {
  Trophy,
  Users,
  Calendar,
  Briefcase,
  Clock,
  BookOpen,
  School,
  ArrowRight,
  Sparkles,
  User,
  Camera,
  LayoutDashboard,
  Home,
  MapPin,
  BookText,
  Trash2,
  Activity,
  ArrowLeftRight,
  CalendarPlus,
  Plus,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/hooks/useAuth';
import { useEffect, useState } from 'react';

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  path: string;
  delay: number;
}

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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay,
        ease: 'easeOut',
      }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => router.push(path)}
      className="
        group
        relative
        w-full
        min-w-0
        overflow-hidden
        rounded-xl
        border
        border-[#1A3050]
        bg-[#0D1E35]
        p-4
        text-left
        transition-all
        duration-300
        hover:border-[#E8A33D]/40
        hover:shadow-lg
        hover:shadow-[#E8A33D]/10
      "
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-[#E8A33D]/10
            text-[#E8A33D]
            transition-colors
            duration-300
            group-hover:bg-[#E8A33D]/15
          "
        >
          {icon}
        </div>

        <ArrowRight
          className="
            mt-1
            h-4
            w-4
            shrink-0
            text-[#66758A]
            transition-all
            duration-300
            group-hover:translate-x-1
            group-hover:text-[#E8A33D]
          "
        />
      </div>

      <div className="mt-4 min-w-0">
        <h3 className="text-sm font-bold text-white sm:text-base">
          {label}
        </h3>

        <p className="mt-1 text-xs leading-5 text-[#8A8278] sm:text-sm">
          {description}
        </p>
      </div>

      <div
        className="
          absolute
          bottom-0
          left-0
          h-[2px]
          w-0
          bg-[#E8A33D]
          transition-all
          duration-300
          group-hover:w-full
        "
      />
    </motion.button>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [techCenter, setTechCenter] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    // Fetch tech center data if user has a techCenterId
    if (user?.techCenterId) {
      fetchTechCenter(user.techCenterId);
      fetchRecentActivity(user.techCenterId);
    }
  }, [user?.techCenterId]);

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
      const response = await fetch(`/api/tech-centers/${techCenterId}/activity?limit=10`);
      if (response.ok) {
        const data = await response.json();
        setRecentActivity(data);
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const getActivityIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'course_submission':
        return <BookText className="h-4 w-4" />;
      case 'cleaning_registration':
        return <Trash2 className="h-4 w-4" />;
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
        return 'text-[#14B8A6] bg-[#14B8A6]/10';
      case 'cleaning_registration':
        return 'text-[#E8A33D] bg-[#E8A33D]/10';
      case 'cleaning_day_change':
        return 'text-[#8B5CF6] bg-[#8B5CF6]/10';
      case 'cleaning_week_created':
        return 'text-[#F97316] bg-[#F97316]/10';
      case 'cleaning_day_created':
        return 'text-[#06B6D4] bg-[#06B6D4]/10';
      default:
        return 'text-[#3B82F6] bg-[#3B82F6]/10';
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

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - new Date(date).getTime();
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

  const greeting = getGreeting();
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Guest';
  const avatarUrl = user?.profileImageUrl || null;

  const quickActions: QuickActionProps[] = [
    {
      icon: <BookOpen className="h-5 w-5" />,
      label: 'My Courses',
      description: 'Access your enrolled courses',
      path: '/dashboard/courses',
      delay: 0.1,
    },
    {
      icon: <School className="h-5 w-5" />,
      label: 'Tech Centers',
      description: 'Browse all tech centers',
      path: '/dashboard/students',
      delay: 0.15,
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: 'Students',
      description: 'View all students',
      path: '/dashboard/students',
      delay: 0.2,
    },
    {
      icon: <Briefcase className="h-5 w-5" />,
      label: 'Internships',
      description: 'Browse internships',
      path: '/dashboard/internships',
      delay: 0.25,
    },
    {
      icon: <Clock className="h-5 w-5" />,
      label: 'Cleaning Rota',
      description: 'View your cleaning schedule',
      path: '/dashboard/cleaning',
      delay: 0.3,
    },
  ];

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#0A1628]">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">

        {/* ============================================
            DASHBOARD HEADER
        ============================================ */}
        <motion.section
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="
            relative
            overflow-hidden
            rounded-2xl
            border
            border-[#1A3050]
            bg-[#0D1E35]
            p-5
            sm:p-6
            lg:p-7
          "
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#E8A33D]/5 via-transparent to-[#14B8A6]/5" />
          
          {/* Small animated accent */}
          <motion.div
            className="
              absolute
              right-0
              top-0
              h-32
              w-32
              rounded-full
              bg-[#E8A33D]/10
              blur-3xl
            "
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          <motion.div
            className="
              absolute
              left-0
              bottom-0
              h-24
              w-24
              rounded-full
              bg-[#14B8A6]/10
              blur-3xl
            "
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          />

          <div className="relative z-10">
            {/* Welcome section with avatar */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
              {/* Avatar */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative shrink-0"
              >
                <div className="relative h-16 w-16 sm:h-20 sm:w-20">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={`${userName}'s avatar`}
                      fill
                      className="rounded-full border-2 border-[#E8A33D] object-cover shadow-lg shadow-[#E8A33D]/20"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-[#E8A33D] bg-[#E8A33D]/10 text-[#E8A33D] shadow-lg shadow-[#E8A33D]/20">
                      <User className="h-8 w-8 sm:h-10 sm:w-10" />
                    </div>
                  )}
                  
                  {/* Online status indicator */}
                  <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-[#0D1E35] bg-[#14B8A6]" />
                </div>
              </motion.div>

              {/* Welcome message */}
              <div className="min-w-0 flex-1">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#E8A33D]">
                    {greeting}
                  </p>

                  <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                    Welcome back, <span className="text-[#E8A33D]">{userName}</span>
                  </h1>

                  {techCenter && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="mt-2 flex items-center gap-2 text-sm text-[#8A8278]"
                    >
                      <MapPin className="h-4 w-4 text-[#14B8A6]" />
                      <span>
                        <span className="text-[#C4BDB5]">Tech Center:</span>{' '}
                        <span className="font-medium text-white">{techCenter.name}</span>
                        {techCenter.city && (
                          <span className="text-[#8A8278]">, {techCenter.city}</span>
                        )}
                      </span>
                    </motion.div>
                  )}

                  <p className="mt-2 text-sm text-[#8A8278]">
                    You're home! Ready to manage your activities, courses and student resources.
                  </p>
                </motion.div>
              </div>

              {/* Home icon decoration */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.5 
                }}
                className="
                  hidden
                  sm:flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#14B8A6]/10
                  text-[#14B8A6]
                "
              >
                <Home className="h-6 w-6" />
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* ============================================
            QUICK LINKS
        ============================================ */}
        <section className="mt-7 sm:mt-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-4 flex items-center gap-2"
          >
            <div className="h-5 w-1 rounded-full bg-[#E8A33D]" />

            <h2 className="text-lg font-bold text-white">
              Quick Links
            </h2>
          </motion.div>

          <div
            className="
              grid
              grid-cols-2
              gap-3
              sm:gap-4
              md:grid-cols-3
              lg:grid-cols-5
            "
          >
            {quickActions.map((action) => (
              <QuickAction
                key={action.label}
                {...action}
              />
            ))}
          </div>
        </section>

        {/* ============================================
            RECENT ACTIVITY
        ============================================ */}
        {techCenter && (
          <section className="mt-7 sm:mt-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="mb-4 flex items-center gap-2"
            >
              <div className="h-5 w-1 rounded-full bg-[#14B8A6]" />

              <h2 className="text-lg font-bold text-white">
                Course & Cleaning Activity
              </h2>

              <span className="ml-2 text-xs text-[#8A8278]">
                at {techCenter.name}
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="
                relative
                overflow-hidden
                rounded-2xl
                border
                border-[#1A3050]
                bg-[#0D1E35]
                p-5
                sm:p-6
              "
            >
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6]/5 via-transparent to-[#E8A33D]/5" />

              <div className="relative z-10">
                {recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + (index * 0.05) }}
                    className="
                      flex
                      items-start
                      gap-3
                      rounded-xl
                      border
                      border-[#1A3050]
                      bg-[#112240]/50
                      p-3
                      transition-all
                      duration-200
                      hover:border-[#14B8A6]/30
                      hover:bg-[#112240]
                    "
                  >
                    {/* Activity icon */}
                    <div
                      className={`
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        ${getActivityColor(activity.action)}
                      `}
                    >
                      {getActivityIcon(activity.action)}
                    </div>

                    {/* Activity details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white">
                          {activity.user ? (
                            `${activity.user.firstName} ${activity.user.lastName}`
                          ) : (
                            'System'
                          )}
                        </p>

                        <span className="text-xs text-[#8A8278]">
                          {formatTimeAgo(activity.createdAt)}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-[#C4BDB5]">
                        {getActivityLabel(activity.action)}
                      </p>

                      {activity.details && Object.keys(activity.details).length > 0 && (
                        <div className="mt-1 text-xs text-[#8A8278]">
                          {activity.action === 'course_submission' && activity.details.courseCount && (
                            <span className="mr-2">
                              {activity.details.courseCount} course{activity.details.courseCount > 1 ? 's' : ''}
                            </span>
                          )}
                          {activity.action === 'course_submission' && activity.details.totalCredits && (
                            <span className="mr-2">
                              {activity.details.totalCredits} credits
                            </span>
                          )}
                          {activity.action === 'cleaning_registration' && activity.details.dayName && (
                            <span className="mr-2">
                              {activity.details.dayName}
                            </span>
                          )}
                          {activity.action === 'cleaning_registration' && activity.details.weekLabel && (
                            <span className="mr-2">
                              {activity.details.weekLabel}
                            </span>
                          )}
                          {activity.action === 'cleaning_day_change' && activity.details.oldDayName && activity.details.newDayName && (
                            <span className="mr-2">
                              {activity.details.oldDayName} → {activity.details.newDayName}
                            </span>
                          )}
                          {activity.action === 'cleaning_day_change' && activity.details.oldWeekLabel && activity.details.newWeekLabel && (
                            <span className="mr-2">
                              {activity.details.oldWeekLabel} → {activity.details.newWeekLabel}
                            </span>
                          )}
                          {activity.action === 'cleaning_week_created' && activity.details.weekLabel && (
                            <span className="mr-2">
                              {activity.details.weekLabel}
                            </span>
                          )}
                          {activity.action === 'cleaning_week_created' && activity.details.dayCount && (
                            <span className="mr-2">
                              {activity.details.dayCount} days
                            </span>
                          )}
                          {activity.action === 'cleaning_day_created' && activity.details.dayName && (
                            <span className="mr-2">
                              {activity.details.dayName}
                            </span>
                          )}
                          {activity.action === 'cleaning_day_created' && activity.details.weekLabel && (
                            <span className="mr-2">
                              {activity.details.weekLabel}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* User avatar if available */}
                    {activity.user?.profileImageUrl && (
                      <div className="relative h-8 w-8 shrink-0">
                        <Image
                          src={activity.user.profileImageUrl}
                          alt={`${activity.user.firstName}'s avatar`}
                          fill
                          className="rounded-full border border-[#1A3050] object-cover"
                        />
                      </div>
                    )}
                  </motion.div>
                ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1A3050]">
                      <Activity className="h-8 w-8 text-[#8A8278]" />
                    </div>
                    <p className="mt-4 text-sm font-medium text-white">
                      No course submissions or cleaning activity yet
                    </p>
                    <p className="mt-2 text-xs text-[#8A8278]">
                      Activity will appear when courses are submitted, cleaning weeks/days are created, or users register for cleaning days
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </section>
        )}

        {/* ============================================
            PROMOTIONAL CARDS
        ============================================ */}
        <section className="mt-7 grid gap-4 lg:grid-cols-2">

          {/* FOOTBALL TEAM */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="
              group
              relative
              overflow-hidden
              rounded-2xl
              border
              border-[#E8A33D]/20
              bg-[#0D1E35]
              p-5
              sm:p-6
            "
          >
            <div className="relative z-10">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="
                    flex
                    h-14
                    w-14
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#E8A33D]
                    text-[#0A1628]
                  "
                >
                  <Trophy className="h-7 w-7" />
                </motion.div>

                <div className="min-w-0 flex-1">
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#E8A33D]/20 bg-[#E8A33D]/10 px-2.5 py-1">
                    <Sparkles className="h-3 w-3 text-[#E8A33D]" />

                    <span className="text-[10px] font-semibold text-[#E8A33D] sm:text-xs">
                      Registration Open
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white">
                    Football Team
                  </h3>

                  <p className="mt-1 text-sm leading-5 text-[#8A8278]">
                    Represent your tech center in the football league.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 rounded-lg border border-[#1A3050] bg-[#112240] px-2.5 py-1.5">
                      <Users className="h-3.5 w-3.5 text-[#E8A33D]" />

                      <span className="text-xs text-[#C4BDB5]">
                        Team Spirit
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 rounded-lg border border-[#1A3050] bg-[#112240] px-2.5 py-1.5">
                      <Calendar className="h-3.5 w-3.5 text-[#E8A33D]" />

                      <span className="text-xs text-[#C4BDB5]">
                        Weekly Matches
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    router.push('/dashboard/football-team')
                  }
                  className="
                    flex
                    shrink-0
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    bg-[#E8A33D]
                    px-4
                    py-2.5
                    text-sm
                    font-bold
                    text-[#0A1628]
                    transition-all
                    duration-200
                    hover:bg-[#F0B45A]
                    hover:shadow-lg
                    hover:shadow-[#E8A33D]/20
                  "
                >
                  Join
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* PROFILE */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="
              group
              relative
              overflow-hidden
              rounded-2xl
              border
              border-[#14B8A6]/20
              bg-[#0D1E35]
              p-5
              sm:p-6
            "
          >
            <div className="relative z-10">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{
                    duration: 4.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="
                    flex
                    h-14
                    w-14
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#14B8A6]
                    text-white
                  "
                >
                  <User className="h-7 w-7" />
                </motion.div>

                <div className="min-w-0 flex-1">
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#14B8A6]/20 bg-[#14B8A6]/10 px-2.5 py-1">
                    <Camera className="h-3 w-3 text-[#14B8A6]" />

                    <span className="text-[10px] font-semibold text-[#14B8A6] sm:text-xs">
                      New Feature
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white">
                    Update Profile
                  </h3>

                  <p className="mt-1 text-sm leading-5 text-[#8A8278]">
                    Add your profile photo and update your details.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 rounded-lg border border-[#1A3050] bg-[#112240] px-2.5 py-1.5">
                      <Camera className="h-3.5 w-3.5 text-[#14B8A6]" />

                      <span className="text-xs text-[#C4BDB5]">
                        Profile Photo
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 rounded-lg border border-[#1A3050] bg-[#112240] px-2.5 py-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-[#14B8A6]" />

                      <span className="text-xs text-[#C4BDB5]">
                        Stand Out
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    router.push('/dashboard/profile')
                  }
                  className="
                    flex
                    shrink-0
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    bg-[#14B8A6]
                    px-4
                    py-2.5
                    text-sm
                    font-bold
                    text-white
                    transition-all
                    duration-200
                    hover:bg-[#0D9488]
                    hover:shadow-lg
                    hover:shadow-[#14B8A6]/20
                  "
                >
                  Update
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </section>
      </div>

      {/* ============================================
          ATBRIZ AI BUTTON
      ============================================ */}
      <Link
        href="/dashboard/ai"
        className="
          fixed
          bottom-4
          right-4
          z-40
          flex
          items-center
          gap-2.5
          rounded-xl
          border
          border-[#E8A33D]/60
          bg-[#0D1E35]
          px-3
          py-2.5
          text-white
          shadow-xl
          shadow-black/20
          transition-all
          duration-300
          hover:scale-[1.03]
          hover:border-[#14B8A6]
        "
      >
        <div className="relative shrink-0">
          <Image
            src="/atbriz.png"
            alt="Atbriz AI"
            width={32}
            height={32}
            className="
              h-8
              w-8
              rounded-lg
              border
              border-[#E8A33D]/30
              object-cover
            "
          />

          <span
            className="
              absolute
              -right-0.5
              -top-0.5
              h-2.5
              w-2.5
              rounded-full
              border-2
              border-[#0D1E35]
              bg-[#14B8A6]
            "
          />
        </div>

        <div className="flex flex-col leading-tight">
          <span className="text-xs font-bold text-white">
            Atbriz AI
          </span>

          <span className="text-[8px] text-[#8A8278]">
            Powered by AI
          </span>
        </div>
      </Link>
    </main>
  );
}