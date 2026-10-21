'use client';

import { useState, useEffect, type ReactNode, type Dispatch } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import {
  Megaphone,
  Bell,
  MessageSquare,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  CircleDot,
} from 'lucide-react';

import {
  useUnreadNotificationCount,
  useAnnouncementCount,
} from '@/hooks/useNotifications';
import { useUnreadMessageCount } from '@/hooks/useMessages';

// ============================================================
// CONSTANTS
// ============================================================

const TOPBAR_HEIGHT = 56;

// ============================================================
// TYPES
// ============================================================

interface UserInfo {
  id?: string;
  profileImageUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  role?: string | null;
  techCenter?: {
    id: string;
    name: string;
  } | null;
}

interface TopNavProps {
  sidebarOpen: boolean;
  setSidebarOpen: Dispatch<React.SetStateAction<boolean>>;
  isMobile: boolean;
  onMenuToggle?: () => void;
  user: UserInfo | null;
  userRole: string;
}

// ============================================================
// HELPERS
// ============================================================

function getInitials(user: UserInfo | null) {
  const first =
    user?.firstName?.charAt(0).toUpperCase() || '';

  const last =
    user?.lastName?.charAt(0).toUpperCase() || '';

  return `${first}${last}` || 'U';
}

function formatRole(role: string) {
  const formatted = role
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );

  if (formatted === 'Admin') return 'Manager';
  if (formatted === 'Super Admin' || formatted === 'Superadmin') return 'Director';

  return formatted;
}

function getPageInfo(pathname: string) {
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
      title: 'Football Team',
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
// TOP NAV COMPONENT
// ============================================================

export default function TopNav({
  sidebarOpen,
  setSidebarOpen,
  isMobile,
  onMenuToggle,
  user,
  userRole,
}: TopNavProps) {
  const [scrolled, setScrolled] =
    useState(false);

  const { data: unreadCount } =
    useUnreadNotificationCount();

  const { data: announcementCount } =
    useAnnouncementCount();

  const { data: unreadMessageCount } =
    useUnreadMessageCount();

  const pathname = usePathname();
  const pageInfo = getPageInfo(pathname);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    window.addEventListener(
      'scroll',
      handleScroll,
      { passive: true }
    );

    return () =>
      window.removeEventListener(
        'scroll',
        handleScroll
      );
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'fixed top-0 right-0 z-30 h-14',
        'bg-white',
        'transition-all duration-300',
        isMobile
          ? 'left-0'
          : sidebarOpen
            ? 'left-0 lg:left-[240px]'
            : 'left-0 lg:left-[64px]',
        scrolled
          ? 'shadow-[0_8px_32px_rgba(18,32,59,0.15),0_2px_8px_rgba(18,32,59,0.08)]'
          : 'shadow-[0_4px_20px_rgba(18,32,59,0.10),0_1px_4px_rgba(18,32,59,0.06)]'
      )}
    >
      <div className="h-full flex items-center justify-between gap-1 px-2 sm:px-3 lg:px-4">
        {/* LEFT */}
        <div className="flex min-w-0 flex-1 items-center overflow-hidden">
          {/* Mobile menu button — shown below lg via CSS so first paint is correct */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.04 }}
            onClick={onMenuToggle}
            className={cn(
              'flex lg:hidden items-center justify-center',
              'w-11 h-11 rounded-xl',
              'bg-[#F7F6F2] border-2 border-[#E5E7EB]',
              'hover:border-[#B98A3E]',
              'hover:bg-white',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-[#B98A3E]/30',
              'shadow-sm'
            )}
            aria-label="Open sidebar"
          >
            <div className="relative w-8 h-8 bg-[#B98A3E] flex items-center justify-center overflow-hidden rounded-lg shadow-md">
              <Image
                src="/freedom.png"
                alt="Selfless CE Logo"
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.button>

          {/* Desktop sidebar toggle — shown at lg+ via CSS so first paint is correct */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.04 }}
            onClick={() =>
              setSidebarOpen(
                (previous) => !previous
              )
            }
            className={cn(
              'hidden lg:flex items-center justify-center',
              'w-9 h-9 shrink-0 rounded-lg',
              'text-[#1A2B4C]',
              'hover:text-[#B98A3E]',
              'hover:bg-[#F7F6F2]',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-[#B98A3E]/30'
            )}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <PanelLeftClose className="w-5 h-5" />
            ) : (
              <PanelLeftOpen className="w-5 h-5" />
            )}
          </motion.button>

          {/* Breadcrumb — no border */}
          <div className="hidden md:block ml-2.5 pl-2.5 min-w-0">
            <div className="flex items-center gap-2 font-mono text-[11px] text-[#8A9088]">
              {pageInfo.section && (
                <>
                  <span className="hidden sm:inline truncate uppercase tracking-wider text-[#B98A3E] font-semibold">
                    {pageInfo.section}
                  </span>

                  <ChevronRight className="hidden sm:block w-3 h-3 text-[#B98A3E]" />
                </>
              )}

              <motion.span
                key={pageInfo.title}
                initial={{
                  opacity: 0,
                  y: 4,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.2,
                }}
                className="text-[#1A2B4C] font-semibold truncate"
              >
                {pageInfo.title}
              </motion.span>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="ml-1 flex shrink-0 items-center gap-0.5 sm:ml-2 sm:gap-1.5">
          {/* ANNOUNCEMENTS */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/dashboard/announcements"
              aria-label="Announcements"
              className={cn(
                'relative flex items-center justify-center',
                'w-9 h-9 rounded-lg',
                'text-[#1A2B4C]',
                'hover:text-[#B98A3E]',
                'hover:bg-[#F7F6F2]',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-[#B98A3E]/30'
              )}
            >
              <Megaphone className="w-[18px] h-[18px]" />

              {announcementCount &&
                announcementCount > 0 ? (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 min-w-[15px] h-[15px] px-1 rounded-full bg-[#3E5C76] text-white text-[9px] font-mono font-semibold flex items-center justify-center border-2 border-white"
                >
                  {announcementCount > 99
                    ? '99+'
                    : announcementCount}
                </motion.span>
              ) : null}
            </Link>
          </motion.div>

          {/* NOTIFICATIONS */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/dashboard/notifications"
              aria-label="Notifications"
              className={cn(
                'relative flex items-center justify-center',
                'w-9 h-9 rounded-lg',
                'text-[#1A2B4C]',
                'hover:text-[#B98A3E]',
                'hover:bg-[#F7F6F2]',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-[#B98A3E]/30'
              )}
            >
              <Bell className="w-[18px] h-[18px]" />

              {unreadCount &&
                unreadCount > 0 ? (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 min-w-[15px] h-[15px] px-1 rounded-full bg-[#A4462F] text-white text-[9px] font-mono font-semibold flex items-center justify-center border-2 border-white"
                >
                  {unreadCount > 99
                    ? '99+'
                    : unreadCount}
                </motion.span>
              ) : null}
            </Link>
          </motion.div>

          {/* MESSAGES */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/dashboard/messages"
              aria-label="Messages"
              className={cn(
                'relative flex items-center justify-center',
                'w-9 h-9 rounded-lg',
                'text-[#1A2B4C]',
                'hover:text-[#B98A3E]',
                'hover:bg-[#F7F6F2]',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-[#B98A3E]/30'
              )}
            >
              <MessageSquare className="w-[18px] h-[18px]" />

              {unreadMessageCount &&
                unreadMessageCount > 0 ? (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 min-w-[15px] h-[15px] px-1 rounded-full bg-[#55705B] text-white text-[9px] font-mono font-semibold flex items-center justify-center border-2 border-white"
                >
                  {unreadMessageCount > 99
                    ? '99+'
                    : unreadMessageCount}
                </motion.span>
              ) : null}
            </Link>
          </motion.div>

          {/* USER — no border-l */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href="/dashboard/profile"
              className={cn(
                'ml-1 sm:ml-1.5',
                'flex items-center gap-2.5',
                'py-1.5 px-1.5 rounded-lg',
                'hover:bg-[#F7F6F2]',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-[#B98A3E]/30'
              )}
            >
              {user?.profileImageUrl ? (
                <Image
                  src={user.profileImageUrl}
                  alt={`${user?.firstName || ''} ${user?.lastName || ''}`}
                  width={32}
                  height={32}
                  unoptimized
                  className="w-[32px] h-[32px] object-cover border-2 border-[#B98A3E] rounded-full"
                />
              ) : (
                <div className="w-[32px] h-[32px] bg-[#B98A3E] flex items-center justify-center text-white font-mono text-[11px] font-semibold rounded-full">
                  {getInitials(user)}
                </div>
              )}

              <div className="hidden sm:block min-w-0">
                <p className="text-[#1A2B4C] text-sm font-semibold leading-tight truncate max-w-[150px]">
                  {user?.firstName} {user?.lastName}
                </p>

                <p className="text-[#B98A3E] text-[11px] font-mono font-semibold leading-tight mt-0.5 uppercase tracking-wide">
                  {formatRole(userRole)}
                </p>
              </div>

              <ChevronDown className="hidden md:block w-3.5 h-3.5 text-[#B98A3E]" />
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
