// app/dashboard/layout.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  Code,
  GraduationCap,
  Images,
  LayoutDashboard,
  Shield,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/hooks/useAuth';
import { getApiErrorMessage, isJsonObject } from '@/lib/api-response';
import { PageTracker } from './components/PageTracker';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';


import Link from 'next/link';

import { PageRefreshButton } from './components/PageRefreshButton';
import { useOnlineUsers } from '@/lib/hooks/useOnlineUsers';
import GiftIcon from '@/components/GiftIcon';
import { GlobalOnlineUsersPopup } from '@/components/GlobalOnlineUsersPopup';
const DASHBOARD_FOOTER_LINKS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Messages', href: '/dashboard/messages' },
  { label: 'Announcements', href: '/dashboard/announcements' },
  { label: 'Cleaning Rota', href: '/dashboard/cleaning' },
  { label: 'English Hub', href: '/dashboard/english-hub' },
  { label: 'Posts', href: '/dashboard/gallery' },
];

// ============================================================
// PAGE TITLE LOOKUP
// ============================================================

type PageInfo = { title: string; section?: string };

function getPageInfo(pathname: string, userRole?: string): PageInfo {
  const pages: Record<string, PageInfo> = {
    '/dashboard': { title: 'Dashboard', section: 'Workspace' },
    '/dashboard/ai': { title: 'Atbriz AI', section: 'Workspace' },
    '/dashboard/students': { title: 'Students' },
    '/dashboard/english-hub': { title: 'English Hub', section: 'Workspace' },
    '/dashboard/trivia/leaderboard': { title: 'Trivia Leaderboard', section: 'Community' },
    '/dashboard/courses': { title: 'Courses', section: 'Academics' },
    '/dashboard/course-units': {
      title: 'Course Units',
      section:
        userRole === 'admin'
          ? 'Administration'
          : userRole === 'super_admin'
            ? 'System'
            : 'Academics',
    },
    '/dashboard/manage-grades': { title: 'Manage Grades', section: 'System' },
    '/dashboard/grades': { title: 'Grades', section: 'Academics' },
    '/dashboard/admin/teachers': { title: 'Tutors', section: 'Academics' },
    '/dashboard/internships': { title: 'Internships', section: 'Opportunities' },
    '/dashboard/live-streaming': { title: 'Live Streaming', section: 'Media' },
    '/dashboard/support-groups': { title: 'Support Groups', section: 'Community' },
    '/dashboard/temple-trips': { title: 'Temple Trips', section: 'Community' },
    '/dashboard/football-team': { title: 'Sports', section: 'Community' },
    '/dashboard/cleaning': { title: 'Cleaning Rota', section: 'Campus' },
    '/dashboard/announcements': { title: 'Announcements', section: 'Communication' },
    '/dashboard/notifications': { title: 'Notifications', section: 'Communication' },
    '/dashboard/admin': { title: 'Administration', section: 'Administration' },
    '/dashboard/admin/users': { title: 'Users', section: 'Administration' },
    '/dashboard/admin/tuition': { title: 'Tuition', section: 'Administration' },
    '/dashboard/admin/tech-centers': { title: 'Tech Centers', section: 'Administration' },
    '/dashboard/admin/cleaning': { title: 'Cleaning Management', section: 'Administration' },
    '/dashboard/teacher': { title: 'Tutors', section: 'Tutoring' },
    '/dashboard/teacher/grades': { title: 'Assign Grades', section: 'Administration' },
    '/dashboard/profile': { title: 'My Profile', section: 'Account' },
    '/dashboard/gallery': { title: 'Posts', section: 'Media' },
    '/dashboard/media-approvals': { title: 'Media Approvals', section: 'Administration' },
    '/dashboard/super-admin': { title: 'System Overview', section: 'System' },
    '/dashboard/super-admin/centers': { title: 'Tech Centers', section: 'System' },
    '/dashboard/super-admin/users': { title: 'Users', section: 'System' },
  };

  if (pages[pathname]) return pages[pathname];

  const matchedPath = Object.keys(pages)
    .filter((path) => path !== '/dashboard')
    .sort((a, b) => b.length - a.length)
    .find((path) => pathname.startsWith(`${path}/`));

  return matchedPath ? pages[matchedPath] : { title: 'Dashboard', section: 'Workspace' };
}

// Pages that already render their own heading — the layout must not render one.
const PAGES_WITH_OWN_HEADER = new Set([
  '/dashboard',
  '/dashboard/announcements',
  '/dashboard/profile',
  '/dashboard/courses',
  '/dashboard/gallery',
  '/dashboard/messages',
  '/dashboard/connections',
  '/dashboard/ai',
  '/dashboard/english-hub',
  '/dashboard/live-streaming',
  '/dashboard/temple-trips',
  '/dashboard/notifications',
  '/dashboard/super-admin',
]);

const PAGES_WITH_OWN_HEADER_PREFIXES = [
  '/dashboard/students',
  '/dashboard/teacher',
  '/dashboard/admin/teachers',
  '/dashboard/cleaning',
  '/dashboard/admin/tuition',
  '/dashboard/policies',
];

function pageHasOwnHeader(pathname: string): boolean {
  if (PAGES_WITH_OWN_HEADER.has(pathname)) return true;
  if (pathname.startsWith('/dashboard/ai/')) return true;
  return PAGES_WITH_OWN_HEADER_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
}

// ============================================================
// MAIN DASHBOARD LAYOUT
// ============================================================

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Sync responsive state
  useEffect(() => {
    const syncResponsiveState = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
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

  const userRole = user?.role || 'student';
  const { users: onlineUsers, isLoading: isLoadingOnlineUsers } = useOnlineUsers(user);

  const { data: postCount } = useQuery<number>({
    queryKey: ['gallery-post-count'],
    queryFn: async () => {
      const response = await fetch('/api/media/list?category=gallery&countOnly=true');
      const data: unknown = await response.json();
      if (
        !response.ok ||
        !isJsonObject(data) ||
        data.success !== true ||
        typeof data.totalCount !== 'number'
      ) {
        throw new Error(getApiErrorMessage(data, 'Could not load post count'));
      }
      return data.totalCount;
    },
    enabled: isAuthenticated && !!user,
  });

  useEffect(() => {
    const refreshPostCount = () => {
      void queryClient.invalidateQueries({ queryKey: ['gallery-post-count'] });
    };
    window.addEventListener('selfless:gallery-posts-changed', refreshPostCount);
    return () => {
      window.removeEventListener('selfless:gallery-posts-changed', refreshPostCount);
    };
  }, [queryClient]);

  // Auth gate — use router.replace so Next state is preserved
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = async () => {
    await logout();
  };

  // Compute page info + header decision once per render
  const pageInfo = useMemo(
    () => getPageInfo(pathname, userRole),
    [pathname, userRole],
  );
  const hasOwnHeader = useMemo(() => pageHasOwnHeader(pathname), [pathname]);

  // Update document title (next/head is deprecated in App Router client components)
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = `${pageInfo.title} | Selfless`;
    }
  }, [pageInfo.title]);

  // ----------------------------------------------------------
  // LOADING
  // ----------------------------------------------------------

  if (isLoading) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center bg-[#F8F9FA]">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="relative mx-auto mb-3 h-8 w-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full border-2 border-[#E5E7EB] border-t-[#1A2B4C]"
            />
            <div className="absolute inset-[7px] rounded-full bg-[#C59B4C]" />
          </div>
          <p className="text-[12px] font-medium tracking-wide text-[#6B7280]">
            Loading Selfless…
          </p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      <PageTracker />
      <GlobalOnlineUsersPopup />

      <div className="min-h-screen w-full min-w-0 overflow-x-clip bg-white">
        {/* MOBILE OVERLAY */}
        {isMobile && sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-[90] bg-black/50 lg:hidden"
          />
        )}

        {/* SIDEBAR */}
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

        {/* TOP NAV */}
        <TopNav
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          user={user}
          userRole={userRole}
          onlineUsers={onlineUsers}
          isLoadingOnlineUsers={isLoadingOnlineUsers}
        />

        {/* MAIN WRAPPER */}
        <div
          className={cn(
            'min-h-screen transition-[margin] duration-300 ease-out',
            mounted
              ? isMobile
                ? 'ml-0'
                : sidebarOpen
                  ? 'ml-[240px]'
                  : 'ml-[64px]'
              : 'ml-0 lg:ml-[240px]',
          )}
        >
          <div className="w-full min-w-0">
            <main
              className={cn(
                'min-h-screen w-full min-w-0 px-2 pt-14 sm:px-3 lg:px-4',
                // Reserve space for the fixed bottom nav on mobile only.
                // Desktop has no bottom nav — the footer takes over.
                'pb-16 lg:pb-20',
              )}
            >
              <div className="w-full min-w-0">
                {/* PAGE HEADING (only for pages without their own) */}
                {!hasOwnHeader && (
                  <motion.div
                    key={pathname}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22 }}
                    className="mb-3"
                  >
                    {pageInfo.section && (
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C59B4C]">
                        {pageInfo.section}
                      </p>
                    )}
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <h1 className="text-[20px] font-bold tracking-tight text-[#1A2B4C]">
                          {pageInfo.title}
                        </h1>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: 28 }}
                          transition={{ duration: 0.3, delay: 0.08 }}
                          className="mt-2 h-[2px] bg-[#C59B4C]"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {children}
              </div>
            </main>

            {/* DESKTOP FOOTER */}
            <footer className="hidden border-t border-[#E5E7EB] bg-white lg:block">
              <div className="w-full min-w-0 px-3 py-3 lg:px-4">
                <div className="flex flex-col items-center justify-between gap-2 md:flex-row">
                  <p className="text-[11.5px] text-[#6B7280]">
                    Selfless Portal — Learn, connect, grow.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11.5px] text-[#6B7280] md:justify-end">
                    {DASHBOARD_FOOTER_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="transition-colors hover:text-[#1A2B4C]"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </footer>
          </div>

          {/* GIFT ICON — top right */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="fixed right-3 top-[68px] z-40 lg:right-4"
          >
            <GiftIcon />
          </motion.div>

          {/* ================================================== */}
          {/* BOTTOM NAVIGATION — available at every screen size */}
          {/* ================================================== */}
          <motion.nav
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            aria-label="Primary navigation"
            className={cn(
              'fixed bottom-0 right-0 z-50',
              'border-t border-[#243857] bg-[#1A2B4C]',
              'pb-[env(safe-area-inset-bottom)]',
            )}
            style={{
              left: mounted && !isMobile
                ? sidebarOpen
                  ? '240px'
                  : '64px'
                : 0,
            }}
          >
            <div className="flex items-stretch justify-around px-0.5" style={{ height: 36 }}>
              {/* Home */}
              {(() => {
                const active = pathname === '/dashboard';
                return (
                  <Link
                    href="/dashboard"
                    aria-current={active ? 'page' : undefined}
                    className="group relative flex flex-1 flex-col items-center justify-center gap-0.5"
                  >
                    <LayoutDashboard
                      aria-hidden="true"
                      className={cn('h-4 w-4 transition-colors duration-150', active ? 'text-[#C59B4C]' : 'text-white/70 group-hover:text-white')}
                    />
                    <span
                      className={cn(
                        'text-[9px] font-semibold leading-none tracking-wide transition-colors duration-150',
                        active ? 'text-[#C59B4C]' : 'text-white/70 group-hover:text-white',
                      )}
                    >
                      Home
                    </span>
                    {active && (
                      <motion.span
                        layoutId="bottom-nav-indicator"
                        className="absolute bottom-0 left-1/2 h-[2px] w-5 -translate-x-1/2 rounded-full bg-[#C59B4C]"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                  </Link>
                );
              })()}

              {/* Posts */}
              {(() => {
                const active =
                  pathname === '/dashboard/gallery' ||
                  pathname.startsWith('/dashboard/gallery/');
                return (
                  <Link
                    href="/dashboard/gallery"
                    aria-current={active ? 'page' : undefined}
                    className="group relative flex flex-1 flex-col items-center justify-center gap-0.5"
                  >
                    <span className="relative inline-flex flex-col items-center gap-0.5">
                      <Images
                        aria-hidden="true"
                        className={cn('h-4 w-4 transition-colors duration-150', active ? 'text-[#C59B4C]' : 'text-white/70 group-hover:text-white')}
                      />
                      <span
                        className={cn(
                          'text-[9px] font-semibold leading-none tracking-wide transition-colors duration-150',
                          active ? 'text-[#C59B4C]' : 'text-white/70 group-hover:text-white',
                        )}
                      >
                        Posts
                      </span>
                      {postCount !== undefined && postCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="absolute -right-3 -top-1 flex h-3.5 min-w-[14px] items-center justify-center rounded-full border border-[#1A2B4C] bg-[#C59B4C] px-1 text-[8px] font-bold leading-none text-white"
                        >
                          {postCount > 9 ? '9+' : postCount}
                        </motion.span>
                      )}
                    </span>
                    {active && (
                      <motion.span
                        layoutId="bottom-nav-indicator"
                        className="absolute bottom-0 left-1/2 h-[2px] w-5 -translate-x-1/2 rounded-full bg-[#C59B4C]"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                  </Link>
                );
              })()}

              {/* Courses — center pill */}
              {(() => {
                const active =
                  pathname === '/dashboard/courses' ||
                  pathname.startsWith('/dashboard/courses/');
                return (
                  <Link
                    href="/dashboard/courses"
                    aria-current={active ? 'page' : undefined}
                    className="group relative flex flex-1 flex-col items-center justify-center gap-0.5"
                  >
                    <BookOpen
                      aria-hidden="true"
                      className={cn('h-4 w-4 transition-colors duration-150', active ? 'text-[#C59B4C]' : 'text-white/70 group-hover:text-white')}
                    />
                    <span
                      className={cn(
                        'text-[9px] font-semibold leading-none tracking-wide transition-colors duration-150',
                        active ? 'text-[#C59B4C]' : 'text-white/70 group-hover:text-white',
                      )}
                    >
                      Courses
                    </span>
                    {active && (
                      <motion.span
                        layoutId="bottom-nav-indicator"
                        className="absolute bottom-0 left-1/2 h-[2px] w-5 -translate-x-1/2 rounded-full bg-[#C59B4C]"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                  </Link>
                );
              })()}

              {/* Connections */}
              {(() => {
                const active =
                  pathname === '/dashboard/connections' ||
                  pathname.startsWith('/dashboard/connections/');
                return (
                  <Link
                    href="/dashboard/connections"
                    aria-current={active ? 'page' : undefined}
                    className="group relative flex flex-1 flex-col items-center justify-center gap-0.5"
                  >
                    <User
                      aria-hidden="true"
                      className={cn('h-4 w-4 transition-colors duration-150', active ? 'text-[#C59B4C]' : 'text-white/70 group-hover:text-white')}
                    />
                    <span
                      className={cn(
                        'text-[9px] font-semibold leading-none tracking-wide transition-colors duration-150',
                        active ? 'text-[#C59B4C]' : 'text-white/70 group-hover:text-white',
                      )}
                    >
                      Connect
                    </span>
                    {active && (
                      <motion.span
                        layoutId="bottom-nav-indicator"
                        className="absolute bottom-0 left-1/2 h-[2px] w-5 -translate-x-1/2 rounded-full bg-[#C59B4C]"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                  </Link>
                );
              })()}

              {/* Tutors / Policies / Dev — role-aware */}
              {(() => {
                const isDev = userRole === 'dev';
                const isSuperAdmin = userRole === 'super_admin';
                const href = isDev
                  ? '/dashboard/dev'
                  : isSuperAdmin
                    ? '/dashboard/policies'
                    : '/dashboard/admin/teachers';
                const label = isDev ? 'Dev' : isSuperAdmin ? 'Policies' : 'Tutors';
                const RoleIcon = isDev ? Code : isSuperAdmin ? Shield : GraduationCap;
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className="group relative flex flex-1 flex-col items-center justify-center gap-0.5"
                  >
                    <RoleIcon
                      aria-hidden="true"
                      className={cn('h-4 w-4 transition-colors duration-150', active ? 'text-[#C59B4C]' : 'text-white/70 group-hover:text-white')}
                    />
                    <span
                      className={cn(
                        'text-[9px] font-semibold leading-none tracking-wide transition-colors duration-150',
                        active ? 'text-[#C59B4C]' : 'text-white/70 group-hover:text-white',
                      )}
                    >
                      {label}
                    </span>
                    {active && (
                      <motion.span
                        layoutId="bottom-nav-indicator"
                        className="absolute bottom-0 left-1/2 h-[2px] w-5 -translate-x-1/2 rounded-full bg-[#C59B4C]"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                  </Link>
                );
              })()}

              {/* Refresh */}
              <div className="relative flex flex-1 flex-col items-center justify-center gap-0.5">
                <PageRefreshButton
                  variant="icon"
                  className="!h-[18px] !w-[18px] !rounded-none !p-0 text-white/70 hover:!bg-transparent hover:text-white"
                />
                <span className="text-[9px] font-semibold leading-none tracking-wide text-white/70">
                  Refresh
                </span>
              </div>
            </div>
          </motion.nav>
        </div>
      </div>
    </>
  );
}