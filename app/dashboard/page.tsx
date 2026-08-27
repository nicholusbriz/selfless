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
import { useQuery } from '@tanstack/react-query';

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

interface Tutor {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  email: string;
  techCenter?: {
    id: string;
    name: string;
  };
  role?: {
    name: string;
  };
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
     TUTORS WITH TANSTACK QUERY (CACHED)
  ============================================================ */

  const { data: tutorsData } = useQuery({
    queryKey: ['tutors'],
    queryFn: async () => {
      const response = await fetch('/api/tech-centers/tutors?limit=10');

      if (!response.ok) {
        throw new Error('Failed to fetch tutors');
      }

      const data = await response.json();
      return data.tutors || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - data remains fresh
    gcTime: 30 * 60 * 1000, // 30 minutes - garbage collection time
  });

  const tutors = tutorsData || [];

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

            {/* Simple overlay */}

            <div
              className="absolute inset-0 bg-black/40"
            />

            {/* Cover content */}

            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 md:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

                <div className="min-w-0">
                  <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl">
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

          <div className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#55705B]" />

                <span className="font-mono text-[10px] uppercase tracking-widest text-[#6B7268]">
                  Active account
                </span>
              </div>

              {user?.role && (
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#8A9088]">
                  {user.role}
                </span>
              )}
            </div>

            <span className="font-mono text-[10px] uppercase tracking-widest text-[#8A9088]">
              Student portal
            </span>
          </div>
        </motion.header>

        {/* Tutors Section */}
        {tutors.length > 0 && (
          <div className="mb-6 px-5 sm:px-7">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-[#B98A3E]" />
              <h2 className="text-[13px] font-semibold text-[#12203B]">
                Your Tutors ({tutors.length})
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {tutors.map((tutor: Tutor) => (
                <div
                  key={tutor.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#F7F6F2] rounded-full hover:bg-[#EDECE6] transition-colors"
                >
                  {tutor.profileImageUrl ? (
                    <img
                      src={tutor.profileImageUrl}
                      alt={`${tutor.firstName} ${tutor.lastName}`}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#12203B] flex items-center justify-center text-white text-[10px] font-semibold">
                      {tutor.firstName.charAt(0)}{tutor.lastName.charAt(0)}
                    </div>
                  )}
                  <span className="text-[12px] font-medium text-[#12203B]">
                    {tutor.firstName} {tutor.lastName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================
            MOTIVATION STRIP
        ====================================================== */}

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-4 px-5 sm:px-7"
        >
          <div className="flex items-center gap-3">
            <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[#B98A3E]">
              Today
            </span>
            <motion.p
              key={messageIndex}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35 }}
              className="text-sm font-medium text-[#12203B]"
            >
              {motivationMessages[messageIndex]}
            </motion.p>
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
          className="mt-6 px-5 sm:px-7"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#12203B] text-white">
              <BookOpen className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#B98A3E]">
                Free educational resources
              </p>

              <h2 className="mt-1 text-lg font-semibold tracking-tight text-[#12203B] sm:text-xl">
                Learn something new, anytime.
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#6B7268]">
                Visit the Learning Hub to watch educational content for free.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard/live-streaming')}
              className="flex flex-col items-center gap-2 p-3 bg-[#F7F6F2] rounded-lg hover:bg-[#EDECE6] transition-colors"
            >
              <BookOpen className="h-5 w-5 text-[#55705B]" />
              <span className="text-xs font-medium text-[#12203B]">English Learning</span>
            </button>

            <button
              type="button"
              onClick={() => router.push('/dashboard/live-streaming')}
              className="flex flex-col items-center gap-2 p-3 bg-[#F7F6F2] rounded-lg hover:bg-[#EDECE6] transition-colors"
            >
              <Video className="h-5 w-5 text-[#3E5C76]" />
              <span className="text-xs font-medium text-[#12203B]">Educational Videos</span>
            </button>

            <button
              type="button"
              onClick={() => router.push('/dashboard/live-streaming')}
              className="flex flex-col items-center gap-2 p-3 bg-[#F7F6F2] rounded-lg hover:bg-[#EDECE6] transition-colors"
            >
              <Sparkles className="h-5 w-5 text-[#B98A3E]" />
              <span className="text-xs font-medium text-[#12203B]">Tutorials</span>
            </button>

            <button
              type="button"
              onClick={() => router.push('/dashboard/live-streaming?tab=music')}
              className="flex flex-col items-center gap-2 p-3 bg-[#F7F6F2] rounded-lg hover:bg-[#EDECE6] transition-colors"
            >
              <Music className="h-5 w-5 text-[#7C3AED]" />
              <span className="text-xs font-medium text-[#12203B]">Music & More</span>
            </button>
          </div>
        </motion.section>

        {/* ======================================================
            QUICK LINKS
        ====================================================== */}

        <section className="mt-8 px-5 sm:px-7">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.15em] text-[#6B7268]">
            Directory
          </h2>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {quickLinks.map((link) => (
              <button
                key={link.path}
                type="button"
                onClick={() => router.push(link.path)}
                className="flex flex-col items-center gap-2 p-4 bg-[#F7F6F2] rounded-lg hover:bg-[#EDECE6] transition-colors"
              >
                <span className="text-[#12203B]">{link.icon}</span>
                <span className="text-xs font-medium text-[#12203B] text-center">
                  {link.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* ======================================================
            RECENT ACTIVITY
        ====================================================== */}

        {techCenter && recentActivity.length > 0 && (
          <section className="mt-8 px-5 sm:px-7">
            <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.15em] text-[#6B7268]">
              Recent Activity
            </h2>

            <div className="space-y-3">
              {recentActivity.slice(0, 5).map((item) => {
                const meta = getActivityMeta(item.action);

                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 bg-[#F7F6F2] rounded-lg"
                  >
                    <span className="w-16 shrink-0 pt-0.5 font-mono text-[11px] text-[#8A9088]">
                      {formatTimeAgo(item.createdAt)}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-[#12203B]">
                        <span className="font-semibold">
                          {item.user
                            ? `${item.user.firstName} ${item.user.lastName}`
                            : 'System'}
                        </span>{' '}

                        <span className="text-[#6B7268]">
                          {meta.label}
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ======================================================
            VIDEO HUB
        ====================================================== */}

        {videos.length > 0 && (
          <section className="mt-8 px-5 sm:px-7">
            <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.15em] text-[#6B7268]">
              Video Hub ({videos.length})
            </h2>

            <div className="bg-[#F7F6F2] rounded-lg p-4">
              <VideoPlayer videos={videos} />
            </div>
          </section>
        )}

        {/* ======================================================
            ATBRIZ AI
        ====================================================== */}

        <section
          className="mt-8 px-5 sm:px-7"
        >
          <div className="flex items-start gap-4 bg-[#12203B] rounded-lg p-5 text-white">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">
                Student support
              </p>

              <h2 className="mt-1 text-lg font-semibold">
                Atbriz AI
              </h2>

              <p className="mt-1 text-sm leading-6 text-white/65">
                Ask questions and get guidance whenever you need help with your studies.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push('/dashboard/ai')}
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start border bg-white px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors sm:self-auto hover:bg-[#B98A3E] hover:border-[#B98A3E] hover:text-white"
            >
              Open Atbriz AI

              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>

        <div className="h-4 sm:h-6" />
      </div>
    </div>
  );
}