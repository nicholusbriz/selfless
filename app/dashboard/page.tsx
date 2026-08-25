'use client';

/* ============================================================
   FONT SETUP (add once, in app/layout.tsx — not in this file)
   ------------------------------------------------------------
   import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';

   const plexSans = IBM_Plex_Sans({
     subsets: ['latin'],
     weight: ['400', '500', '600', '700'],
     variable: '--font-sans',
   });

   const plexMono = IBM_Plex_Mono({
     subsets: ['latin'],
     weight: ['400', '500', '600'],
     variable: '--font-mono',
   });

   // on <body>: className={`${plexSans.variable} ${plexMono.variable} font-sans`}
   // tailwind.config: fontFamily: { sans: ['var(--font-sans)'], mono: ['var(--font-mono)'] }
============================================================ */

import {
  Trophy,
  Users,
  BookOpen,
  Briefcase,
  Clock,
  ArrowRight,
  User,
  Camera,
  MapPin,
  Activity,
  Video,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useAuth } from '@/lib/hooks/useAuth';
import { useEffect, useState } from 'react';
import VideoPlayer from '@/components/VideoPlayer';

/* ============================================================
   TOKENS
   ink        #12203B   primary text / dark surfaces
   paper      #F1F1EC   page background
   surface    #FFFFFF   card background
   hairline   #DADCD3   borders / dividers
   muted      #6B7268   secondary text
   brass      #B98A3E   primary accent
   moss       #55705B   accent — community / academic
   rust       #A4462F   accent — schedule / alerts
   slate      #3E5C76   accent — misc / system
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
  code: string; // short category code, e.g. "ACD" for Academic
}

/* ============================================================
   DASHBOARD PAGE
============================================================ */

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [techCenter, setTechCenter] = useState<TechCenter | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [videos, setVideos] = useState<string[]>([]);

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
      if (response.ok) setTechCenter(await response.json());
    } catch (error) {
      console.error('Error fetching tech center:', error);
    }
  };

  const fetchRecentActivity = async (techCenterId: string) => {
    try {
      const response = await fetch(
        `/api/tech-centers/${techCenterId}/activity?limit=10`,
      );
      if (response.ok) setRecentActivity(await response.json());
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
     ACTIVITY HELPERS — color returns a hex used only as a
     left border strip, never a filled badge/pill.
  ============================================================ */

  const ACTIVITY_META: Record<
    string,
    { label: string; color: string }
  > = {
    course_submission: { label: 'Course submitted', color: '#55705B' },
    cleaning_registration: { label: 'Cleaning day registered', color: '#B98A3E' },
    cleaning_day_change: { label: 'Cleaning day changed', color: '#3E5C76' },
    cleaning_week_created: { label: 'Cleaning week created', color: '#A4462F' },
    cleaning_day_created: { label: 'Cleaning day created', color: '#12203B' },
  };

  const getActivityMeta = (action: string) =>
    ACTIVITY_META[action.toLowerCase()] ?? {
      label: action.replace(/_/g, ' '),
      color: '#8A9088',
    };

  const formatTimeAgo = (date: Date | string) => {
    const diffInMs = Date.now() - new Date(date).getTime();
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
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Guest';
  const avatarUrl = user?.profileImageUrl || null;

  /* ============================================================
     QUICK LINKS — ordered as a real directory, category shown
     as a short mono code rather than a colored pill.
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
     LOADING STATE
  ============================================================ */

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F1F1EC]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#DADCD3] border-t-[#12203B]" />
          <p className="font-mono text-xs uppercase tracking-widest text-[#6B7268]">
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
    <div className="min-h-screen bg-[#F1F1EC] text-[#12203B]">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ==================================================
            HEADER — directory-board strip
        ================================================== */}

        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="border border-[#DADCD3] bg-white"
        >
          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-center gap-5">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden border border-[#DADCD3] bg-[#F1F1EC]">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={userName}
                    fill
                    sizes="64px"
                    className="object-cover grayscale"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#6B7268]">
                    <User className="h-7 w-7" />
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#B98A3E]">
                  {greeting}
                </p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-[28px]">
                  {userName}
                </h1>
                {techCenter && (
                  <p className="mt-1.5 flex items-center gap-1.5 font-mono text-xs text-[#6B7268]">
                    <MapPin className="h-3.5 w-3.5" />
                    {techCenter.name}
                    {techCenter.city ? ` · ${techCenter.city}` : ''}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => router.push('/dashboard/profile')}
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start border border-[#12203B] bg-[#12203B] px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-white transition-colors hover:bg-[#1C2E4E] sm:self-auto"
            >
              Profile
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.header>

        {/* ==================================================
            QUICK LINKS — directory list, not badge cards
        ================================================== */}

        <section className="mt-8">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-mono text-xs uppercase tracking-[0.15em] text-[#6B7268]">
              Directory
            </h2>
            <span className="font-mono text-xs text-[#8A9088]">
              {String(quickLinks.length).padStart(2, '0')} services
            </span>
          </div>

          <div className="divide-y divide-[#DADCD3] border border-[#DADCD3] bg-white">
            {quickLinks.map((link, i) => (
              <button
                key={link.path}
                onClick={() => router.push(link.path)}
                className="group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-[#F7F6F2] sm:gap-6 sm:px-6"
              >
                <span className="w-6 shrink-0 font-mono text-xs text-[#8A9088] tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>

                <span className="shrink-0 text-[#12203B]">{link.icon}</span>

                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-[#12203B]">
                    {link.label}
                  </span>
                  <span className="mt-0.5 hidden text-xs text-[#6B7268] sm:block">
                    {link.description}
                  </span>
                </span>

                <span className="hidden shrink-0 font-mono text-[10px] uppercase tracking-widest text-[#8A9088] sm:block">
                  {link.code}
                </span>

                <ArrowRight className="h-4 w-4 shrink-0 text-[#8A9088] transition-transform group-hover:translate-x-1 group-hover:text-[#12203B]" />
              </button>
            ))}
          </div>
        </section>

        {/* ==================================================
            RECENT ACTIVITY — log, not icon-bubble list
        ================================================== */}

        {techCenter && (
          <section className="mt-8">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="font-mono text-xs uppercase tracking-[0.15em] text-[#6B7268]">
                Activity log — {techCenter.name}
              </h2>
              <Activity className="h-4 w-4 text-[#8A9088]" />
            </div>

            <div className="border border-[#DADCD3] bg-white">
              {recentActivity.length > 0 ? (
                <ul className="divide-y divide-[#DADCD3]">
                  {recentActivity.map((item) => {
                    const meta = getActivityMeta(item.action);
                    return (
                      <li
                        key={item.id}
                        className="flex items-start gap-4 border-l-[3px] px-5 py-3.5 sm:px-6"
                        style={{ borderLeftColor: meta.color }}
                      >
                        <span className="w-10 shrink-0 pt-0.5 font-mono text-[11px] text-[#8A9088]">
                          {formatTimeAgo(item.createdAt)}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-[#12203B]">
                            <span className="font-semibold">
                              {item.user
                                ? `${item.user.firstName} ${item.user.lastName}`
                                : 'System'}
                            </span>{' '}
                            <span className="text-[#6B7268]">{meta.label}</span>
                          </p>

                          {item.details && Object.keys(item.details).length > 0 && (
                            <p className="mt-1 font-mono text-[11px] text-[#8A9088]">
                              {Object.values(item.details)
                                .filter((v) => v !== null && v !== undefined)
                                .join('  ·  ')}
                            </p>
                          )}
                        </div>

                        {item.user?.profileImageUrl && (
                          <div className="relative h-7 w-7 shrink-0 overflow-hidden border border-[#DADCD3]">
                            <Image
                              src={item.user.profileImageUrl}
                              alt=""
                              fill
                              sizes="28px"
                              className="object-cover grayscale"
                            />
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="px-6 py-12 text-center">
                  <p className="font-mono text-xs uppercase tracking-widest text-[#8A9088]">
                    No activity yet
                  </p>
                  <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-[#6B7268]">
                    Course submissions and cleaning-rota updates will
                    appear here as they happen.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ==================================================
            VIDEO HUB + PROFILE
        ================================================== */}

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="border border-[#DADCD3] bg-white">
            <div className="flex items-center justify-between border-b border-[#DADCD3] px-5 py-4 sm:px-6">
              <div className="flex items-center gap-2.5">
                <Video className="h-4 w-4 text-[#12203B]" />
                <h3 className="text-sm font-semibold">Video Hub</h3>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#8A9088]">
                {videos.length > 0 ? `${videos.length} clips` : 'empty'}
              </span>
            </div>

            <div className="p-5 sm:p-6">
              {videos.length > 0 ? (
                <VideoPlayer videos={videos} />
              ) : (
                <div className="flex aspect-video w-full items-center justify-center border border-dashed border-[#DADCD3] bg-[#F7F6F2]">
                  <div className="text-center">
                    <Video className="mx-auto h-8 w-8 text-[#8A9088]" />
                    <p className="mt-2 font-mono text-xs uppercase tracking-widest text-[#8A9088]">
                      No videos yet
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-[#DADCD3] px-5 py-4 sm:px-6">
              <p className="text-xs text-[#6B7268]">
                Shared by your tech center admin.
              </p>
              <button
                onClick={() => router.push('/dashboard/football-team')}
                className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-[#12203B] hover:text-[#B98A3E]"
              >
                Football team
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </section>

          <section className="border border-[#DADCD3] bg-white">
            <div className="flex items-center gap-2.5 border-b border-[#DADCD3] px-5 py-4 sm:px-6">
              <Camera className="h-4 w-4 text-[#12203B]" />
              <h3 className="text-sm font-semibold">Update Profile</h3>
            </div>

            <div className="p-5 sm:p-6">
              <p className="text-sm leading-relaxed text-[#6B7268]">
                Keep your profile information and photo current so
                other students and admins recognize you.
              </p>

              <button
                onClick={() => router.push('/dashboard/profile')}
                className="mt-5 inline-flex items-center gap-2 border border-[#12203B] px-4 py-2.5 font-mono text-xs uppercase tracking-widest text-[#12203B] transition-colors hover:bg-[#12203B] hover:text-white"
              >
                Update profile
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </section>
        </div>

        {/* ==================================================
            ATBRIZ AI
        ================================================== */}

        <section className="mt-8 flex flex-col gap-4 border border-[#DADCD3] bg-[#12203B] p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/50">
              Student support
            </p>
            <h2 className="mt-1 text-lg font-semibold">Atbriz AI</h2>
            <p className="mt-1 text-sm text-white/70">
              Ask questions and get guidance any time.
            </p>
          </div>

          <button
            onClick={() => router.push('/dashboard/ai')}
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start border border-white/30 bg-white px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-[#12203B] transition-colors hover:bg-[#B98A3E] hover:border-[#B98A3E] hover:text-white sm:self-auto"
          >
            Open Atbriz AI
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </section>
      </div>
    </div>
  );
}