// app/dashboard/layout.tsx
'use client';

import {
  useEffect,
  useState,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/hooks/useAuth';
import { PageTracker } from './components/PageTracker';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';

import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { GlobalOnlineUsersPopup } from '@/components/GlobalOnlineUsersPopup';
import { useOnlineUsers } from '@/lib/hooks/useOnlineUsers';

const DASHBOARD_FOOTER_LINKS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Messages', href: '/dashboard/messages' },
  { label: 'Announcements', href: '/dashboard/announcements' },
  { label: 'Cleaning Rota', href: '/dashboard/cleaning' },
  { label: 'English Hub', href: '/dashboard/english-hub' },
];

// ============================================================
// HELPERS
// ============================================================

function getPageInfo(pathname: string, userRole?: string) {
  const pages: Record<
    string,
    { title: string; section?: string }
  > = {
    '/dashboard': {
      title: 'Dashboard',
      section: 'Workspace',
    },
    '/dashboard/ai': {
      title: 'Atbriz AI',
      section: 'Workspace',
    },
    '/dashboard/students': {
      title: 'Students',
      section: 'Workspace',
    },
    '/dashboard/english-hub': {
      title: 'English Hub',
      section: 'Workspace',
    },
    '/dashboard/courses': {
      title: 'Courses',
      section: 'Academics',
    },
    '/dashboard/course-units': {
      title: 'Course Units',
      section:
        userRole === 'admin'
          ? 'Administration'
          : userRole === 'super_admin'
            ? 'System'
            : 'Academics',
    },
    '/dashboard/manage-grades': {
      title: 'Manage Grades',
      section: 'System',
    },
    '/dashboard/grades': {
      title: 'Grades',
      section: 'Academics',
    },
    '/dashboard/admin/teachers': {
      title: 'Tutors',
      section: 'Academics',
    },
    '/dashboard/internships': {
      title: 'Internships',
      section: 'Opportunities',
    },
    '/dashboard/live-streaming': {
      title: 'Live Streaming',
      section: 'Media',
    },
    '/dashboard/support-groups': {
      title: 'Support Groups',
      section: 'Community',
    },
    '/dashboard/temple-trips': {
      title: 'Temple Trips',
      section: 'Community',
    },
    '/dashboard/football-team': {
      title: 'Sports',
      section: 'Community',
    },
    '/dashboard/cleaning': {
      title: 'Cleaning Rota',
      section: 'Campus',
    },
    '/dashboard/announcements': {
      title: 'Announcements',
      section: 'Communication',
    },
    '/dashboard/notifications': {
      title: 'Notifications',
      section: 'Communication',
    },
    '/dashboard/admin': {
      title: 'Administration',
      section: 'Administration',
    },
    '/dashboard/admin/users': {
      title: 'Users',
      section: 'Administration',
    },
    '/dashboard/admin/tuition': {
      title: 'Tuition',
      section: 'Administration',
    },
    '/dashboard/admin/tech-centers': {
      title: 'Tech Centers',
      section: 'Administration',
    },
    '/dashboard/admin/cleaning': {
      title: 'Cleaning Management',
      section: 'Administration',
    },
    '/dashboard/teacher': {
      title: 'Tutors',
      section: 'Tutoring',
    },
    '/dashboard/teacher/grades': {
      title: 'Assign Grades',
      section: 'Administration',
    },
    '/dashboard/profile': {
      title: 'My Profile',
      section: 'Account',
    },
    '/dashboard/gallery': {
      title: 'Gallery',
      section: 'Media',
    },
    '/dashboard/super-admin': {
      title: 'System Overview',
      section: 'System',
    },
    '/dashboard/super-admin/centers': {
      title: 'Tech Centers',
      section: 'System',
    },
    '/dashboard/super-admin/users': {
      title: 'Users',
      section: 'System',
    },
  };

  if (pages[pathname]) {
    return pages[pathname];
  }

  const matchedPath = Object.keys(pages)
    .filter((path) => path !== '/dashboard')
    .sort((a, b) => b.length - a.length)
    .find((path) =>
      pathname.startsWith(`${path}/`)
    );

  return matchedPath
    ? pages[matchedPath]
    : {
      title: 'Dashboard',
      section: 'Workspace',
    };
}

// ============================================================
// MAIN DASHBOARD LAYOUT
// ============================================================

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    user,
    isLoading,
    isAuthenticated,
    logout,
  } = useAuth();

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [isMobile, setIsMobile] =
    useState(false);

  // Prevents the sidebar from flashing in its "desktop-open" state on mobile
  // before the viewport has been measured. Until `mounted` is true we render
  // breakpoint-correct CSS defaults (off-canvas on mobile, visible on desktop).
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  // Initialize sidebar state based on screen size
  useEffect(() => {
    const syncResponsiveState = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // Close sidebar on mobile, open on desktop
      setSidebarOpen(!mobile);
      setMounted(true);
    };

    const frameId = window.requestAnimationFrame(syncResponsiveState);
    window.addEventListener('resize', syncResponsiveState);
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', syncResponsiveState);
    };
  }, []);

  const userRole =
    user?.role || 'student';

  const isAiPage =
    pathname === '/dashboard/ai' ||
    pathname.startsWith(
      '/dashboard/ai/'
    );

  const onlineUsers = useOnlineUsers(user);

  // ----------------------------------------------------------
  // AUTHENTICATION
  // ----------------------------------------------------------

  useEffect(() => {
    if (
      !isLoading &&
      !isAuthenticated
    ) {
      window.location.replace('/');
    }
  }, [
    isAuthenticated,
    isLoading,
    router,
  ]);

  // ----------------------------------------------------------
  // ACTIVITY TRACKING
  // ----------------------------------------------------------

  // ----------------------------------------------------------
  // LOGOUT
  // ----------------------------------------------------------

  const handleLogout = async () => {
    await logout();
  };

  // ----------------------------------------------------------
  // LOADING
  // ----------------------------------------------------------

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[#F8F9FA] flex items-center justify-center">
        <motion.div
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="text-center"
        >
          <div className="relative w-9 h-9 mx-auto mb-4">
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute inset-0 rounded-full border-2 border-[#E5E7EB] border-t-[#1A2B4C]"
            />

            <div className="absolute inset-[9px] bg-[#C59B4C] rounded-full" />
          </div>

          <p className="text-[#6B7268] text-sm font-mono uppercase tracking-wide">
            Loading Selfless...
          </p>
        </motion.div>
      </div>
    );
  }

  if (
    !isAuthenticated ||
    !user
  ) {
    return null;
  }

  const pageInfo =
    getPageInfo(pathname, userRole);

  return (
    <>
      <Head>
        <meta
          name="robots"
          content="noindex, nofollow"
        />

        <meta
          name="googlebot"
          content="noindex, nofollow"
        />

        <title>
          {pageInfo.title} | Selfless
        </title>
      </Head>

      {/* 🎯 Page visit tracker — fires POST /api/user/activity on route change */}
      <PageTracker />

      {/* 🎯 Global online users popup */}
      <GlobalOnlineUsersPopup onlineUsers={onlineUsers || []} currentUserId={user?.id} />

      <div className="min-h-screen bg-white">
        {/* ================================================== */}
        {/* MOBILE OVERLAY */}
        {/* ================================================== */}

        {isMobile && sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-[90] lg:hidden"
          />
        )}

        {/* ================================================== */}
        {/* SIDEBAR - Mobile slide-in, Desktop fixed */}
        {/* ================================================== */}

        <Sidebar
          key={userRole}
          sidebarOpen={sidebarOpen}
          pathname={pathname}
          user={user}
          userRole={userRole}
          handleLogout={handleLogout}
          isMobile={isMobile}
          setSidebarOpen={setSidebarOpen}
          mounted={mounted}
        />

        {/* ================================================== */}
        {/* TOP NAV */}
        {/* ================================================== */}

        <TopNav
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          user={user}
          userRole={userRole}
        />

        {/* ================================================== */}
        {/* MAIN CONTENT */}
        {/* ================================================== */}

        <div
          className={cn(
            'min-h-screen',
            'transition-[margin] duration-350',
            'ease-[cubic-bezier(0.22,1,0.36,1)]',
            // Before mount: CSS-responsive defaults (no shift on mobile, 240px on desktop).
            // After mount: drive by measured state.
            mounted
              ? isMobile
                ? 'ml-0'
                : sidebarOpen
                  ? 'ml-[240px]'
                  : 'ml-[64px]'
              : 'ml-0 lg:ml-[240px]'
          )}
        >
          {/* ================================================= */}
          {/* MAIN CONTENT */}
          {/* ================================================= */}

          <div>
            {/* ✅ FULL-WIDTH CONTENT — no max-width cap */}
            <main className="min-h-screen px-3 xl:px-4 pt-[72px] pb-6">
              <div className="w-full">
                {/* PAGE HEADING */}
                {pathname !==
                  '/dashboard' &&
                  !isAiPage && (
                    <motion.div
                      key={pathname}
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        duration: 0.25,
                      }}
                      className="mb-4"
                    >
                      <div className="flex items-center gap-2 font-mono text-[11px] text-[#B98A3E] mb-1.5 uppercase tracking-wide font-bold">
                        <span>
                          Dashboard
                        </span>

                        <ChevronRight className="w-3 h-3 text-[#B98A3E]" />

                        <span className="text-[#1A2B4C] font-bold">
                          {pageInfo.section}
                        </span>
                      </div>

                      <div className="flex items-end justify-between gap-5">
                        <div>
                          <h1 className="text-2xl font-bold tracking-tight text-[#1A2B4C]">
                            {
                              pageInfo.title
                            }
                          </h1>

                          <motion.div
                            initial={{
                              width: 0,
                            }}
                            animate={{
                              width: 32,
                            }}
                            transition={{
                              duration: 0.35,
                              delay: 0.1,
                            }}
                            className="mt-2.5 h-[2px] bg-[#B98A3E]"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                {children}
              </div>
            </main>

            {/* DESKTOP FOOTER — full width */}
            <footer className="bg-transparent">
              <div className="w-full px-3 xl:px-4 py-3">
                <div className="flex flex-col md:flex-row items-center justify-between gap-2">
                  <p className="font-mono text-xs text-[#8A9088]">
                    Selfless Portal - Learn, connect, grow.
                  </p>

                  <div className="flex items-center gap-5 text-xs text-[#8A9088]">
                    {DASHBOARD_FOOTER_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="hover:text-[#1A2B4C] transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </footer>
          </div>

          {/* ================================================== */}
          {/* ATBRIZ AI QUICK ACCESS */}
          {/* ================================================== */}

          {!isAiPage && (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.9,
                y: 8,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              transition={{
                duration: 0.35,
                delay: 0.25,
              }}
              className="fixed bottom-4 right-4 z-40"
            >
              <Link
                href="/dashboard/ai"
                aria-label="Open Atbriz AI"
                className={cn(
                  'group flex items-center gap-2',
                  'bg-white',
                  'px-3 py-2 rounded-lg',
                  'shadow-[0_4px_12px_rgba(18,32,59,0.10)]',
                  'hover:shadow-[0_7px_20px_rgba(18,32,59,0.14)]',
                  'transition-all duration-200'
                )}
              >
                <div className="relative flex-shrink-0">
                  <motion.div
                    whileHover={{
                      scale: 1.05,
                    }}
                    whileTap={{
                      scale: 0.95,
                    }}
                  >
                    <Image
                      src="/atbriz.png"
                      alt="Atbriz AI"
                      width={30}
                      height={30}
                      className="w-[30px] h-[30px] object-cover border border-[#E5E7EB] rounded"
                    />
                  </motion.div>

                  <motion.span
                    animate={{
                      opacity: [
                        0.55,
                        1,
                        0.55,
                      ],
                    }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                    }}
                    className="absolute -right-0.5 -top-0.5 w-2 h-2 rounded-full bg-[#55705B] border-2 border-white"
                  />
                </div>

                <div className="hidden sm:block leading-tight">
                  <p className="text-[11px] font-semibold text-[#1A2B4C]">
                    Atbriz AI
                  </p>

                  <p className="text-[9px] font-mono text-[#8A9088] uppercase tracking-wide">
                    Assistant
                  </p>
                </div>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
