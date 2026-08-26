'use client';

/* ============================================================
   DASHBOARD PAGE
   ------------------------------------------------------------
   UI enhancement only.
   Existing functionality, API calls and routes are preserved.
============================================================ */

import {
  Trophy,
  Users,
  BookOpen,
  Briefcase,
  Clock,
  ArrowRight,
  User,
  MapPin,
  Activity,
  Video,
  Music,
  Play,
  Sparkles,
  Camera,
  Copy,
  GraduationCap,
  Headphones,
} from 'lucide-react';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useAuth } from '@/lib/hooks/useAuth';
import { useEffect, useMemo, useState } from 'react';
import VideoPlayer from '@/components/VideoPlayer';

/* ============================================================
   DESIGN TOKENS
============================================================ */

const COLORS = {
  ink: '#12203B',
  inkHover: '#1C2E4E',
  paper: '#F1F1EC',
  surface: '#FFFFFF',
  surfaceSoft: '#F7F6F2',
  line: '#DADCD3',
  lineStrong: '#C9CCC3',
  muted: '#6B7268',
  mutedLight: '#8A9088',
  brass: '#B98A3E',
  brassHover: '#A67A2E',
  moss: '#55705B',
  rust: '#A4462F',
  slate: '#3E5C76',
  purple: '#7C3AED',
};

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

interface QuickLink {
  icon: React.ReactNode;
  label: string;
  description: string;
  path: string;
  code: string;
}

/* ============================================================
   MAIN PAGE
============================================================ */

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [techCenter, setTechCenter] = useState<TechCenter | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [messageIndex, setMessageIndex] = useState(0);

  /* ============================================================
     DATA
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

  const fetchTechCenter = async (techCenterId: string) => {
    try {
      const response = await fetch(`/api/tech-centers/${techCenterId}`);

      if (response.ok) {
        setTechCenter(await response.json());
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
        setRecentActivity(await response.json());
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/videos');

      if (response.ok) {
        const data = await response.json();
        setVideos(data.videos || []);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  /* ============================================================
     ROTATING MESSAGES
  ============================================================ */

  const motivationMessages = useMemo(
    () => [
      'Learn with purpose. Build with confidence.',
      'Every lesson is another step toward your future.',
      'Use your time well. Keep learning and keep building.',
      'Your skills grow through practice, patience and consistency.',
      'Stay curious. Ask questions. Keep moving forward.',
      'Small progress today can create meaningful opportunities tomorrow.',
    ],
    [],
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setMessageIndex((current) =>
        current === motivationMessages.length - 1 ? 0 : current + 1,
      );
    }, 5000);

    return () => window.clearInterval(interval);
  }, [motivationMessages.length]);

  /* ============================================================
     ACTIVITY HELPERS
  ============================================================ */

  const ACTIVITY_META: Record<
    string,
    {
      label: string;
      color: string;
    }
  > = {
    course_submission: {
      label: 'Course submitted',
      color: COLORS.moss,
    },

    cleaning_registration: {
      label: 'Cleaning day registered',
      color: COLORS.brass,
    },

    cleaning_day_change: {
      label: 'Cleaning day changed',
      color: COLORS.slate,
    },

    cleaning_week_created: {
      label: 'Cleaning week created',
      color: COLORS.rust,
    },

    cleaning_day_created: {
      label: 'Cleaning day created',
      color: COLORS.ink,
    },
  };

  const getActivityMeta = (action: string) =>
    ACTIVITY_META[action.toLowerCase()] ?? {
      label: action.replace(/_/g, ' '),
      color: COLORS.mutedLight,
    };

  const formatTimeAgo = (date: Date | string) => {
    const timestamp = new Date(date).getTime();

    if (Number.isNaN(timestamp)) {
      return '';
    }

    const diffInMs = Date.now() - timestamp;

    const mins = Math.floor(diffInMs / 60000);
    const hours = Math.floor(diffInMs / 3600000);
    const days = Math.floor(diffInMs / 86400000);

    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    if (hours < 24) return `${hours}h`;

    return `${days}d`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';

    return 'Good evening';
  };

  const greeting = getGreeting();

  const userName = user
    ? `${user.firstName} ${user.lastName}`
    : 'Guest';

  const avatarUrl = user?.profileImageUrl || null;

  /* ============================================================
     QUICK LINKS
  ============================================================ */

  const quickLinks: QuickLink[] = [
    {
      icon: <BookOpen className="h-4 w-4" />,
      label: 'My Courses',
      description: 'Access and manage your enrolled courses.',
      path: '/dashboard/courses',
      code: 'ACD',
    },
    {
      icon: <Users className="h-4 w-4" />,
      label: 'Students',
      description: 'Connect with students in your center.',
      path: '/dashboard/students',
      code: 'COM',
    },
    {
      icon: <Briefcase className="h-4 w-4" />,
      label: 'Internships',
      description: 'Discover available internship opportunities.',
      path: '/dashboard/internships',
      code: 'CAR',
    },
    {
      icon: <Clock className="h-4 w-4" />,
      label: 'Cleaning Rota',
      description: 'View your cleaning schedule and registration.',
      path: '/dashboard/cleaning',
      code: 'SCH',
    },
    {
      icon: <Trophy className="h-4 w-4" />,
      label: 'Football Team',
      description: 'View the team and join upcoming activities.',
      path: '/dashboard/football-team',
      code: 'SPT',
    },
  ];

  /* ============================================================
     LOADING
  ============================================================ */

  if (isLoading) {
    return (
      <div
        className="flex min-h-[60vh] items-center justify-center"
        style={{
          backgroundColor: COLORS.paper,
          color: COLORS.ink,
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2"
            style={{
              borderColor: COLORS.line,
              borderTopColor: COLORS.ink,
            }}
          />

          <p
            className="font-mono text-xs uppercase tracking-widest"
            style={{ color: COLORS.muted }}
          >
            Loading
          </p>
        </div>
      </div>
    );
  }

  /* ============================================================
     PAGE
  ============================================================ */

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: COLORS.paper,
        color: COLORS.ink,
      }}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">

        {/* ======================================================
            HEADER / PROFILE COVER
        ====================================================== */}

        <motion.header
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.35,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="overflow-hidden border bg-white"
          style={{ borderColor: COLORS.line }}
        >
          {/* Compact profile cover */}

          <div className="relative h-[190px] overflow-hidden sm:h-[220px] md:h-[245px]">

            {/* Profile image */}

            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={userName}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 1152px"
                className="object-cover"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center"
                style={{ backgroundColor: COLORS.ink }}
              >
                <User className="h-16 w-16 text-white/50" />
              </div>
            )}

            {/* Controlled image treatment */}

            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, rgba(18,32,59,0.92) 0%, rgba(18,32,59,0.42) 42%, rgba(18,32,59,0.08) 100%)',
              }}
            />

            {/* Small top label */}

            <div className="absolute left-5 top-5 sm:left-7 sm:top-6">
              <span className="inline-flex items-center border border-white/25 bg-black/15 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-white/85 backdrop-blur-[2px]">
                Student Dashboard
              </span>
            </div>

            {/* Cover content */}

            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 md:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/65">
                    {greeting}
                  </p>

                  <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl">
                    {userName}
                  </h1>

                  {techCenter && (
                    <p className="mt-2 flex items-center gap-1.5 truncate font-mono text-[11px] text-white/70">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />

                      <span className="truncate">
                        {techCenter.name}
                        {techCenter.city
                          ? ` · ${techCenter.city}`
                          : ''}
                      </span>
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => router.push('/dashboard/profile')}
                  className="inline-flex shrink-0 items-center justify-center gap-2 self-start border border-white/70 bg-white px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[#12203B] transition-colors hover:bg-[#F1F1EC] sm:self-auto"
                >
                  <Camera className="h-3.5 w-3.5" />

                  Profile

                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Small profile information bar */}

          <div
            className="flex flex-col gap-3 border-t px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-7"
            style={{ borderColor: COLORS.line }}
          >
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">

              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: COLORS.moss }}
                />

                <span
                  className="font-mono text-[10px] uppercase tracking-widest"
                  style={{ color: COLORS.muted }}
                >
                  Active account
                </span>
              </div>

              {user?.role && (
                <span
                  className="font-mono text-[10px] uppercase tracking-widest"
                  style={{ color: COLORS.mutedLight }}
                >
                  {user.role}
                </span>
              )}
            </div>

            <span
              className="font-mono text-[10px] uppercase tracking-widest"
              style={{ color: COLORS.mutedLight }}
            >
              Student portal
            </span>
          </div>
        </motion.header>

        {/* ======================================================
            MOTIVATION STRIP
        ====================================================== */}

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-3 overflow-hidden border bg-white"
          style={{ borderColor: COLORS.line }}
        >
          <div className="flex min-h-[48px] items-center">

            <div
              className="hidden h-full min-h-[48px] items-center border-r px-4 sm:flex"
              style={{ borderColor: COLORS.line }}
            >
              <span
                className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em]"
                style={{ color: COLORS.brass }}
              >
                Today
              </span>
            </div>

            <div className="min-w-0 flex-1 overflow-hidden px-4 py-3 sm:px-5">
              <motion.p
                key={messageIndex}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35 }}
                className="truncate text-sm font-medium"
                style={{ color: COLORS.ink }}
              >
                {motivationMessages[messageIndex]}
              </motion.p>
            </div>

            <div className="flex items-center gap-1.5 px-4">
              {motivationMessages.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Show message ${index + 1}`}
                  onClick={() => setMessageIndex(index)}
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: index === messageIndex ? '18px' : '5px',
                    backgroundColor:
                      index === messageIndex
                        ? COLORS.brass
                        : COLORS.lineStrong,
                  }}
                />
              ))}
            </div>
          </div>
        </motion.section>

        {/* ======================================================
            FREE EDUCATIONAL RESOURCES
        ====================================================== */}

        <motion.section
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: 0.14,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mt-6 overflow-hidden border bg-white sm:mt-7"
          style={{ borderColor: COLORS.line }}
        >
          <div className="grid lg:grid-cols-[1fr_270px]">

            {/* Main */}

            <div className="p-5 sm:p-7 lg:p-9">

              <div className="flex items-start gap-4">

                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center"
                  style={{
                    backgroundColor: COLORS.ink,
                    color: '#FFFFFF',
                  }}
                >
                  <BookOpen className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p
                    className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em]"
                    style={{ color: COLORS.brass }}
                  >
                    Free educational resources
                  </p>

                  <h2
                    className="mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl"
                    style={{ color: COLORS.ink }}
                  >
                    Learn something new, anytime.
                  </h2>

                  <p
                    className="mt-3 max-w-2xl text-sm leading-6 sm:text-[15px]"
                    style={{ color: COLORS.muted }}
                  >
                    Visit the Learning Hub to watch educational
                    content for free. Explore English lessons,
                    tutorials, educational videos and other
                    useful resources to support your studies and
                    personal development.
                  </p>
                </div>
              </div>

              {/* Resource categories */}

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">

                <div
                  className="border px-3.5 py-3 transition-colors hover:bg-white"
                  style={{
                    borderColor: COLORS.line,
                    backgroundColor: COLORS.surfaceSoft,
                  }}
                >
                  <BookOpen
                    className="h-4 w-4"
                    style={{ color: COLORS.moss }}
                  />

                  <p
                    className="mt-2 text-xs font-semibold"
                    style={{ color: COLORS.ink }}
                  >
                    English Learning
                  </p>

                  <p
                    className="mt-0.5 text-[11px] leading-4"
                    style={{ color: COLORS.muted }}
                  >
                    Lessons & practice
                  </p>
                </div>

                <div
                  className="border px-3.5 py-3 transition-colors hover:bg-white"
                  style={{
                    borderColor: COLORS.line,
                    backgroundColor: COLORS.surfaceSoft,
                  }}
                >
                  <Video
                    className="h-4 w-4"
                    style={{ color: COLORS.slate }}
                  />

                  <p
                    className="mt-2 text-xs font-semibold"
                    style={{ color: COLORS.ink }}
                  >
                    Educational Videos
                  </p>

                  <p
                    className="mt-0.5 text-[11px] leading-4"
                    style={{ color: COLORS.muted }}
                  >
                    Learn from video
                  </p>
                </div>

                <div
                  className="border px-3.5 py-3 transition-colors hover:bg-white"
                  style={{
                    borderColor: COLORS.line,
                    backgroundColor: COLORS.surfaceSoft,
                  }}
                >
                  <Sparkles
                    className="h-4 w-4"
                    style={{ color: COLORS.brass }}
                  />

                  <p
                    className="mt-2 text-xs font-semibold"
                    style={{ color: COLORS.ink }}
                  >
                    Tutorials
                  </p>

                  <p
                    className="mt-0.5 text-[11px] leading-4"
                    style={{ color: COLORS.muted }}
                  >
                    Discover new skills
                  </p>
                </div>

                <div
                  className="border px-3.5 py-3 transition-colors hover:bg-white"
                  style={{
                    borderColor: COLORS.line,
                    backgroundColor: COLORS.surfaceSoft,
                  }}
                >
                  <Music
                    className="h-4 w-4"
                    style={{ color: COLORS.purple }}
                  />

                  <p
                    className="mt-2 text-xs font-semibold"
                    style={{ color: COLORS.ink }}
                  >
                    Music & More
                  </p>

                  <p
                    className="mt-0.5 text-[11px] leading-4"
                    style={{ color: COLORS.muted }}
                  >
                    Learn and relax
                  </p>
                </div>
              </div>
            </div>

            {/* Action area */}

            <div
              className="flex flex-col justify-between border-t p-5 sm:p-7 lg:border-l lg:border-t-0"
              style={{
                borderColor: COLORS.line,
                backgroundColor: COLORS.surfaceSoft,
              }}
            >
              <div>
                <p
                  className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em]"
                  style={{ color: COLORS.mutedLight }}
                >
                  Student access
                </p>

                <p
                  className="mt-3 text-sm font-semibold leading-5"
                  style={{ color: COLORS.ink }}
                >
                  Educational content is available to explore
                  at no cost.
                </p>

                <p
                  className="mt-2 text-xs leading-5"
                  style={{ color: COLORS.muted }}
                >
                  Open the hub and choose the subject or content
                  that interests you.
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-2.5">

                <button
                  type="button"
                  onClick={() =>
                    router.push('/dashboard/live-streaming')
                  }
                  className="group inline-flex items-center justify-center gap-2 border px-5 py-3 font-mono text-xs uppercase tracking-widest transition-colors"
                  style={{
                    borderColor: COLORS.ink,
                    backgroundColor: COLORS.ink,
                    color: '#FFFFFF',
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.backgroundColor =
                      COLORS.inkHover;
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.backgroundColor =
                      COLORS.ink;
                  }}
                >
                  <Play className="h-3.5 w-3.5 fill-current" />

                  Explore free learning

                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      '/dashboard/live-streaming?tab=music',
                    )
                  }
                  className="group inline-flex items-center justify-center gap-2 border bg-white px-5 py-3 font-mono text-xs uppercase tracking-widest transition-colors"
                  style={{
                    borderColor: COLORS.lineStrong,
                    color: COLORS.ink,
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.borderColor =
                      COLORS.brass;

                    event.currentTarget.style.color =
                      COLORS.brass;
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.borderColor =
                      COLORS.lineStrong;

                    event.currentTarget.style.color =
                      COLORS.ink;
                  }}
                >
                  <Music className="h-3.5 w-3.5" />

                  Browse music
                </button>
              </div>
            </div>
          </div>

          <div
            className="flex flex-col gap-2 border-t px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-7"
            style={{ borderColor: COLORS.line }}
          >
            <p
              className="text-xs leading-5"
              style={{ color: COLORS.muted }}
            >
              Use your free time to learn, practise and discover
              useful educational content.
            </p>

            <span
              className="font-mono text-[10px] uppercase tracking-widest"
              style={{ color: COLORS.mutedLight }}
            >
              Learning Hub
            </span>
          </div>
        </motion.section>

        {/* ======================================================
            QUICK LINKS
        ====================================================== */}

        <section className="mt-8">
          <div className="mb-3 flex items-baseline justify-between">
            <h2
              className="font-mono text-xs uppercase tracking-[0.15em]"
              style={{ color: COLORS.muted }}
            >
              Directory
            </h2>

            <span
              className="font-mono text-xs"
              style={{ color: COLORS.mutedLight }}
            >
              {String(quickLinks.length).padStart(2, '0')} services
            </span>
          </div>

          <div
            className="divide-y border bg-white"
            style={{
              borderColor: COLORS.line,
            }}
          >
            {quickLinks.map((link, index) => (
              <button
                key={link.path}
                type="button"
                onClick={() => router.push(link.path)}
                className="group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors sm:gap-6 sm:px-6"
                onMouseEnter={(event) => {
                  event.currentTarget.style.backgroundColor =
                    COLORS.surfaceSoft;
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.backgroundColor =
                    COLORS.surface;
                }}
              >
                <span
                  className="w-6 shrink-0 font-mono text-xs tabular-nums"
                  style={{ color: COLORS.mutedLight }}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>

                <span
                  className="shrink-0"
                  style={{ color: COLORS.ink }}
                >
                  {link.icon}
                </span>

                <span className="min-w-0 flex-1">
                  <span
                    className="block text-sm font-semibold"
                    style={{ color: COLORS.ink }}
                  >
                    {link.label}
                  </span>

                  <span
                    className="mt-0.5 hidden text-xs sm:block"
                    style={{ color: COLORS.muted }}
                  >
                    {link.description}
                  </span>
                </span>

                <span
                  className="hidden shrink-0 font-mono text-[10px] uppercase tracking-widest sm:block"
                  style={{ color: COLORS.mutedLight }}
                >
                  {link.code}
                </span>

                <ArrowRight
                  className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1"
                  style={{ color: COLORS.mutedLight }}
                />
              </button>
            ))}
          </div>
        </section>

        {/* ======================================================
            RECENT ACTIVITY
        ====================================================== */}

        {techCenter && (
          <section className="mt-8">
            <div className="mb-3 flex items-baseline justify-between">
              <h2
                className="font-mono text-xs uppercase tracking-[0.15em]"
                style={{ color: COLORS.muted }}
              >
                Activity log — {techCenter.name}
              </h2>

              <Activity
                className="h-4 w-4"
                style={{ color: COLORS.mutedLight }}
              />
            </div>

            <div
              className="border bg-white"
              style={{ borderColor: COLORS.line }}
            >
              {recentActivity.length > 0 ? (
                <ul className="divide-y">
                  {recentActivity.map((item) => {
                    const meta = getActivityMeta(item.action);

                    return (
                      <li
                        key={item.id}
                        className="flex items-start gap-4 border-l-[3px] px-5 py-3.5 sm:px-6"
                        style={{
                          borderLeftColor: meta.color,
                        }}
                      >
                        <span
                          className="w-10 shrink-0 pt-0.5 font-mono text-[11px]"
                          style={{ color: COLORS.mutedLight }}
                        >
                          {formatTimeAgo(item.createdAt)}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p
                            className="text-sm"
                            style={{ color: COLORS.ink }}
                          >
                            <span className="font-semibold">
                              {item.user
                                ? `${item.user.firstName} ${item.user.lastName}`
                                : 'System'}
                            </span>{' '}

                            <span style={{ color: COLORS.muted }}>
                              {meta.label}
                            </span>
                          </p>

                          {item.details &&
                            Object.keys(item.details).length > 0 && (
                              <p
                                className="mt-1 font-mono text-[11px]"
                                style={{
                                  color: COLORS.mutedLight,
                                }}
                              >
                                {Object.values(item.details)
                                  .filter(
                                    (value) =>
                                      value !== null &&
                                      value !== undefined,
                                  )
                                  .join('  ·  ')}
                              </p>
                            )}
                        </div>

                        {item.user?.profileImageUrl && (
                          <div
                            className="relative h-7 w-7 shrink-0 overflow-hidden border"
                            style={{
                              borderColor: COLORS.line,
                            }}
                          >
                            <Image
                              src={item.user.profileImageUrl}
                              alt=""
                              fill
                              sizes="28px"
                              className="object-cover"
                            />
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="px-6 py-12 text-center">
                  <p
                    className="font-mono text-xs uppercase tracking-widest"
                    style={{ color: COLORS.mutedLight }}
                  >
                    No activity yet
                  </p>

                  <p
                    className="mx-auto mt-2 max-w-sm text-xs leading-relaxed"
                    style={{ color: COLORS.muted }}
                  >
                    Course submissions and cleaning-rota updates
                    will appear here as they happen.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ======================================================
            VIDEO HUB + PROFILE
        ====================================================== */}

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Video Hub */}

          <section
            className="border bg-white"
            style={{ borderColor: COLORS.line }}
          >
            <div
              className="flex items-center justify-between border-b px-5 py-4 sm:px-6"
              style={{ borderColor: COLORS.line }}
            >
              <div className="flex items-center gap-2.5">
                <Video
                  className="h-4 w-4"
                  style={{ color: COLORS.ink }}
                />

                <h3
                  className="text-sm font-semibold"
                  style={{ color: COLORS.ink }}
                >
                  Video Hub
                </h3>
              </div>

              <span
                className="font-mono text-[10px] uppercase tracking-widest"
                style={{ color: COLORS.mutedLight }}
              >
                {videos.length > 0
                  ? `${videos.length} clips`
                  : 'empty'}
              </span>
            </div>

            <div className="p-5 sm:p-6">
              {videos.length > 0 ? (
                <VideoPlayer videos={videos} />
              ) : (
                <div
                  className="flex aspect-video w-full items-center justify-center border border-dashed"
                  style={{
                    borderColor: COLORS.line,
                    backgroundColor: COLORS.surfaceSoft,
                  }}
                >
                  <div className="text-center">
                    <Video
                      className="mx-auto h-8 w-8"
                      style={{ color: COLORS.mutedLight }}
                    />

                    <p
                      className="mt-2 font-mono text-xs uppercase tracking-widest"
                      style={{ color: COLORS.mutedLight }}
                    >
                      No videos yet
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div
              className="flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              style={{ borderColor: COLORS.line }}
            >
              <p
                className="text-xs"
                style={{ color: COLORS.muted }}
              >
                Shared by your tech center admin.
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push('/dashboard/football-team')
                }
                className="inline-flex items-center gap-1.5 self-start font-mono text-xs uppercase tracking-widest transition-colors"
                style={{ color: COLORS.ink }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.color =
                    COLORS.brass;
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.color =
                    COLORS.ink;
                }}
              >
                Football team

                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </section>

          {/* Profile */}

          <section
            className="border bg-white"
            style={{ borderColor: COLORS.line }}
          >
            <div
              className="flex items-center gap-2.5 border-b px-5 py-4 sm:px-6"
              style={{ borderColor: COLORS.line }}
            >
              <Camera
                className="h-4 w-4"
                style={{ color: COLORS.ink }}
              />

              <h3
                className="text-sm font-semibold"
                style={{ color: COLORS.ink }}
              >
                Update Profile
              </h3>
            </div>

            <div className="p-5 sm:p-6">
              <p
                className="text-sm leading-relaxed"
                style={{ color: COLORS.muted }}
              >
                Keep your profile information and photo current
                so other students and admins can recognize you.
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push('/dashboard/profile')
                }
                className="mt-5 inline-flex items-center gap-2 border px-4 py-2.5 font-mono text-xs uppercase tracking-widest transition-colors"
                style={{
                  borderColor: COLORS.ink,
                  color: COLORS.ink,
                  backgroundColor: COLORS.surface,
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.backgroundColor =
                    COLORS.ink;

                  event.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.backgroundColor =
                    COLORS.surface;

                  event.currentTarget.style.color =
                    COLORS.ink;
                }}
              >
                Update profile

                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </section>
        </div>

        {/* ======================================================
            ATBRIZ AI
        ====================================================== */}

        <section
          className="mt-8 flex flex-col gap-5 border p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
          style={{
            borderColor: COLORS.ink,
            backgroundColor: COLORS.ink,
            color: '#FFFFFF',
          }}
        >
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">
              Student support
            </p>

            <h2 className="mt-1 text-lg font-semibold">
              Atbriz AI
            </h2>

            <p className="mt-1 text-sm leading-6 text-white/65">
              Ask questions and get guidance whenever you need
              help with your studies.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push('/dashboard/ai')}
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start border bg-white px-5 py-2.5 font-mono text-xs uppercase tracking-widest transition-colors sm:self-auto"
            style={{
              borderColor: '#FFFFFF',
              color: COLORS.ink,
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.backgroundColor =
                COLORS.brass;

              event.currentTarget.style.borderColor =
                COLORS.brass;

              event.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.backgroundColor =
                '#FFFFFF';

              event.currentTarget.style.borderColor =
                '#FFFFFF';

              event.currentTarget.style.color =
                COLORS.ink;
            }}
          >
            Open Atbriz AI

            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </section>

        <div className="h-4 sm:h-6" />
      </div>
    </div>
  );
}