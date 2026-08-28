'use client';

/* ============================================================
   DASHBOARD PAGE
   ------------------------------------------------------------
   Clean, readable dashboard with improved visual hierarchy.
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
  Video,
  Music,
  Sparkles,
  Camera,
  GraduationCap,
  Headphones,
  ChevronRight,
  Library,
  Star,
  MessageCircle,
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
  inkLight: '#1C2E4E',
  paper: '#F1F1EC',
  surface: '#FFFFFF',
  surfaceSoft: '#F7F6F2',
  surfaceHover: '#EDECE6',
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
     DATA FETCHING
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
     - Filtered by tech center ID
  ============================================================ */

  const { data: tutorsData } = useQuery({
    queryKey: ['tutors', user?.techCenterId],
    queryFn: async () => {
      const response = await fetch('/api/tech-centers/tutors?limit=100');

      if (!response.ok) {
        throw new Error('Failed to fetch tutors');
      }

      const data = await response.json();
      const allTutors = data.tutors || [];
      
      // Filter tutors by tech center ID
      if (user?.techCenterId) {
        return allTutors.filter(
          (tutor: Tutor) => tutor.techCenter?.id === user.techCenterId
        );
      }
      
      return allTutors;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!user?.techCenterId,
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
      label: 'submitted a course',
      color: COLORS.moss,
    },
    cleaning_registration: {
      label: 'registered for cleaning day',
      color: COLORS.brass,
    },
    cleaning_day_change: {
      label: 'changed cleaning day',
      color: COLORS.slate,
    },
    cleaning_week_created: {
      label: 'created cleaning week',
      color: COLORS.rust,
    },
    cleaning_day_created: {
      label: 'created cleaning day',
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

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';

    return 'Good evening';
  };

  const greeting = getGreeting();
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Guest';
  const avatarUrl = user?.profileImageUrl || null;

  /* ============================================================
     QUICK LINKS
  ============================================================ */

  const quickLinks: QuickLink[] = [
    {
      icon: <BookOpen className="h-5 w-5" />,
      label: 'My Courses',
      description: 'Access your enrolled courses',
      path: '/dashboard/courses',
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: 'Students',
      description: 'Connect with your peers',
      path: '/dashboard/students',
    },
    {
      icon: <Briefcase className="h-5 w-5" />,
      label: 'Internships',
      description: 'Discover opportunities',
      path: '/dashboard/internships',
    },
    {
      icon: <Clock className="h-5 w-5" />,
      label: 'Cleaning Rota',
      description: 'View your schedule',
      path: '/dashboard/cleaning',
    },
    {
      icon: <Trophy className="h-5 w-5" />,
      label: 'Football Team',
      description: 'Join activities',
      path: '/dashboard/football-team',
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
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        {/* ======================================================
            HEADER
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
          {/* Profile Cover */}
          <div className="relative h-[180px] overflow-hidden sm:h-[200px] md:h-[220px]">
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
                <User className="h-16 w-16 text-white/30" />
              </div>
            )}

            <div className="absolute inset-0 bg-black/30" />

            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 md:p-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/60">
                    {greeting}
                  </p>

                  <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl">
                    {userName}
                  </h1>

                  {techCenter && (
                    <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px] text-white/70">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">
                        {techCenter.name}
                        {techCenter.city ? ` · ${techCenter.city}` : ''}
                      </span>
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => router.push('/dashboard/profile')}
                  className="inline-flex shrink-0 items-center gap-2 self-start border border-white/60 bg-white/95 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#12203B] transition-colors hover:bg-white sm:self-auto"
                >
                  <Camera className="h-3.5 w-3.5" />
                  Profile
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Info Bar */}
          <div className="flex flex-col gap-2 px-5 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#55705B]" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#6B7268]">
                  Active
                </span>
              </div>

              {user?.role && (
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#8A9088]">
                  {user.role}
                </span>
              )}
            </div>

            <span className="font-mono text-[10px] uppercase tracking-widest text-[#8A9088]">
              Student Portal
            </span>
          </div>
        </motion.header>

        {/* ======================================================
            MOTIVATION STRIP
        ====================================================== */}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-5"
        >
          <div className="flex items-start gap-3 bg-white px-5 py-3.5 border" style={{ borderColor: COLORS.line }}>
            <span className="mt-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[#B98A3E]">
              Today
            </span>
            <motion.p
              key={messageIndex}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="text-sm text-[#12203B]"
            >
              {motivationMessages[messageIndex]}
            </motion.p>
          </div>
        </motion.div>

        {/* ======================================================
            QUICK LINKS - DIRECTORY
        ====================================================== */}

        <section className="mt-6">
          <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-[#6B7268]">
            Quick Access
          </h2>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {quickLinks.map((link) => (
              <button
                key={link.path}
                type="button"
                onClick={() => router.push(link.path)}
                className="flex flex-col items-center gap-2 bg-white p-4 border transition-colors hover:bg-[#F7F6F2]"
                style={{ borderColor: COLORS.line }}
              >
                <span className="text-[#12203B]">{link.icon}</span>
                <span className="text-xs font-medium text-[#12203B] text-center">
                  {link.label}
                </span>
                <span className="text-[9px] text-[#8A9088] text-center leading-tight">
                  {link.description}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* ======================================================
            YOUR TUTORS - Filtered by Tech Center
        ====================================================== */}

        {tutors.length > 0 && (
          <section className="mt-6">
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="h-4 w-4 text-[#B98A3E]" />
              <h2 className="font-mono text-xs uppercase tracking-[0.15em] text-[#6B7268]">
                {techCenter?.name || 'Your'} Tutors ({tutors.length})
              </h2>
            </div>

            <p className="text-[11px] text-[#8A9088] mb-3 flex items-center gap-1.5">
              <MessageCircle className="h-3 w-3" />
              Reach out to them whenever you need more guidance and help
            </p>

            <div className="flex flex-wrap gap-2">
              {tutors.map((tutor: Tutor) => (
                <div
                  key={tutor.id}
                  className="flex items-center gap-2 bg-white px-3 py-1.5 border"
                  style={{ borderColor: COLORS.line }}
                >
                  {tutor.profileImageUrl ? (
                    <img
                      src={tutor.profileImageUrl}
                      alt={`${tutor.firstName} ${tutor.lastName}`}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                      style={{ backgroundColor: COLORS.ink }}
                    >
                      {tutor.firstName.charAt(0)}
                      {tutor.lastName.charAt(0)}
                    </div>
                  )}
                  <span className="text-[12px] font-medium text-[#12203B]">
                    {tutor.firstName} {tutor.lastName}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ======================================================
            RECENT ACTIVITY
        ====================================================== */}

        {techCenter && recentActivity.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-[#6B7268]">
              Recent Activity
            </h2>

            <div className="bg-white border" style={{ borderColor: COLORS.line }}>
              {recentActivity.slice(0, 5).map((item, index) => {
                const meta = getActivityMeta(item.action);

                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-4 px-5 py-3 ${
                      index < recentActivity.slice(0, 5).length - 1
                        ? 'border-b'
                        : ''
                    }`}
                    style={{ borderColor: COLORS.line }}
                  >
                    <span className="shrink-0 font-mono text-[11px] text-[#8A9088] min-w-[70px]">
                      {formatTimeAgo(item.createdAt)}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-[#12203B]">
                        <span className="font-semibold">
                          {item.user
                            ? `${item.user.firstName} ${item.user.lastName}`
                            : 'System'}
                        </span>
                        <span className="text-[#6B7268]">
                          {' '}{meta.label}
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
            LEARNING RESOURCES
        ====================================================== */}

        <section className="mt-6">
          <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-[#6B7268]">
            Learning Resources
          </h2>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard/live-streaming')}
              className="flex flex-col items-center gap-2 bg-white p-4 border transition-colors hover:bg-[#F7F6F2]"
              style={{ borderColor: COLORS.line }}
            >
              <BookOpen className="h-5 w-5 text-[#55705B]" />
              <span className="text-xs font-medium text-[#12203B]">Courses</span>
            </button>

            <button
              type="button"
              onClick={() => router.push('/dashboard/live-streaming')}
              className="flex flex-col items-center gap-2 bg-white p-4 border transition-colors hover:bg-[#F7F6F2]"
              style={{ borderColor: COLORS.line }}
            >
              <Video className="h-5 w-5 text-[#3E5C76]" />
              <span className="text-xs font-medium text-[#12203B]">Videos</span>
            </button>

            <button
              type="button"
              onClick={() => router.push('/dashboard/live-streaming')}
              className="flex flex-col items-center gap-2 bg-white p-4 border transition-colors hover:bg-[#F7F6F2]"
              style={{ borderColor: COLORS.line }}
            >
              <Library className="h-5 w-5 text-[#B98A3E]" />
              <span className="text-xs font-medium text-[#12203B]">Tutorials</span>
            </button>

            <button
              type="button"
              onClick={() => router.push('/dashboard/live-streaming?tab=music')}
              className="flex flex-col items-center gap-2 bg-white p-4 border transition-colors hover:bg-[#F7F6F2]"
              style={{ borderColor: COLORS.line }}
            >
              <Music className="h-5 w-5 text-[#7C3AED]" />
              <span className="text-xs font-medium text-[#12203B]">Music</span>
            </button>
          </div>
        </section>

        {/* ======================================================
            VIDEO HUB
        ====================================================== */}

        {videos.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-[#6B7268]">
              Video Hub ({videos.length})
            </h2>

            <div className="bg-white border p-4" style={{ borderColor: COLORS.line }}>
              <VideoPlayer videos={videos} />
            </div>
          </section>
        )}

        {/* ======================================================
            AI ASSISTANT
        ====================================================== */}

        <section className="mt-6">
          <div className="flex flex-col gap-4 bg-[#12203B] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-[#B98A3E]" />
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">
                  AI Assistant
                </p>
              </div>

              <h3 className="mt-1 text-lg font-semibold text-white">
                Atbriz AI
              </h3>

              <p className="mt-1 text-sm text-white/60">
                Ask questions and get guidance with your studies.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push('/dashboard/ai')}
              className="inline-flex shrink-0 items-center gap-2 self-start bg-white px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-[#12203B] transition-colors hover:bg-[#B98A3E] hover:text-white sm:self-auto"
            >
              Open Assistant
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        <div className="h-4 sm:h-6" />
      </div>
    </div>
  );
}