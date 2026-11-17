'use client';

import { useState, useEffect, type Dispatch } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';

import {
  useUnreadNotificationCount,
  useAnnouncementCount,
} from '@/hooks/useNotifications';
import { useUnreadMessageCount } from '@/hooks/useMessages';
import { OnlineUsers } from '@/components/OnlineUsers';

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
  onlineUsers?: any[];
  isLoadingOnlineUsers?: boolean;
}

// ============================================================
// HELPERS
// ============================================================

function getInitials(user: UserInfo | null) {
  const first = user?.firstName?.charAt(0).toUpperCase() || '';
  const last = user?.lastName?.charAt(0).toUpperCase() || '';
  return `${first}${last}` || 'U';
}

function formatRole(role: string) {
  const formatted = role
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
  if (formatted === 'Admin') return 'Manager';
  if (formatted === 'Super Admin' || formatted === 'Superadmin') return 'Director';
  return formatted;
}

function getPageInfo(pathname: string) {
  const pages: Record<string, { title: string; section?: string }> = {
    '/dashboard': { title: 'Dashboard', section: 'Workspace' },
    '/dashboard/ai': { title: 'Atbriz AI', section: 'Workspace' },
    '/dashboard/connections': { title: 'Connections', section: 'Network' },
    '/dashboard/english-hub': { title: 'English Hub', section: 'Workspace' },
    '/dashboard/courses': { title: 'Courses', section: 'Academics' },
    '/dashboard/course-units': { title: 'Course Units', section: 'Academics' },
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
    '/dashboard/messages': { title: 'Messages', section: 'Communication' },
    '/dashboard/super-admin': { title: 'System Overview', section: 'System' },
    '/dashboard/super-admin/centers': { title: 'Tech Centers', section: 'System' },
    '/dashboard/super-admin/users': { title: 'Users', section: 'System' },
  };

  if (pages[pathname]) return pages[pathname];

  const matchedPath = Object.keys(pages)
    .filter((p) => p !== '/dashboard')
    .sort((a, b) => b.length - a.length)
    .find((p) => pathname.startsWith(`${p}/`));

  return matchedPath ? pages[matchedPath] : { title: 'Dashboard', section: 'Workspace' };
}

// ============================================================
// BADGE
// ============================================================

function NavBadge({ count, color }: { count: number; color: string }) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          key="badge"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={cn(
            'absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1',
            'border-2 border-white text-[8px] font-semibold leading-none text-white tabular-nums',
            color,
          )}
        >
          {count > 99 ? '99+' : count}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

// ============================================================
// NAV ICON BUTTON
// ============================================================

function NavIconButton({
  href,
  label,
  children,
  badge,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Link
        href={href}
        aria-label={label}
        className={cn(
          'relative flex h-9 w-9 items-center justify-center rounded-lg',
          'text-[#4B5646]',
          'transition-colors duration-150',
          'hover:bg-[#F8F9FA] hover:text-[#1A2B4C]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B4C]',
        )}
      >
        {children}
        {badge}
      </Link>
    </motion.div>
  );
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
  onlineUsers = [],
  isLoadingOnlineUsers = false,
}: TopNavProps) {
  const [scrolled, setScrolled] = useState(false);

  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const { data: announcementCount = 0 } = useAnnouncementCount();
  const { data: unreadMessageCount = 0 } = useUnreadMessageCount();

  const pathname = usePathname();
  const pageInfo = getPageInfo(pathname);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const userLabel = user?.firstName
    ? `${user.firstName}${user?.lastName ? ` ${user.lastName.charAt(0)}.` : ''}`
    : 'Account';

  return (
    <motion.header
      initial={{ y: -56, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'fixed right-0 top-0 z-30 h-14',
        'bg-white/95 backdrop-blur-sm',
        'border-b border-[#E5E7EB]',
        'transition-all duration-300',
        isMobile
          ? 'left-0'
          : sidebarOpen
            ? 'left-0 lg:left-[240px]'
            : 'left-0 lg:left-[64px]',
        scrolled
          ? 'shadow-[0_1px_0_rgba(0,0,0,0.04),0_2px_8px_rgba(26,43,76,0.04)]'
          : 'shadow-none',
      )}
    >
      <div className="flex h-full items-center justify-between gap-2 px-3 sm:px-4 lg:px-5">
        {/* ── LEFT ── */}
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
          {/* Mobile: logo button */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={onMenuToggle}
            className={cn(
              'flex shrink-0 items-center justify-center overflow-hidden lg:hidden',
              'h-9 w-9 rounded-lg',
              'ring-1 ring-[#E5E7EB]',
              'transition-colors duration-150',
              'hover:bg-[#F8F9FA] hover:ring-[#C59B4C]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B4C]',
            )}
            aria-label="Open sidebar"
          >
            <Image
              src="/freedom.png"
              alt="Selfless"
              width={36}
              height={36}
              className="h-full w-full object-cover"
            />
          </motion.button>

          {/* Desktop: sidebar toggle */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSidebarOpen((prev) => !prev)}
            className={cn(
              'hidden shrink-0 items-center justify-center lg:flex',
              'h-8 w-8 rounded-md',
              'text-[#6B7280]',
              'transition-colors duration-150',
              'hover:bg-[#F8F9FA] hover:text-[#1A2B4C]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B4C]',
            )}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-[18px] w-[18px]" />
            ) : (
              <PanelLeftOpen className="h-[18px] w-[18px]" />
            )}
          </motion.button>

          {/* Divider */}
          <div className="hidden h-5 w-px shrink-0 bg-[#E5E7EB] lg:block" />

          {/* Breadcrumb */}
          {pageInfo.title && (
            <div className="hidden min-w-0 items-center gap-1.5 sm:flex">
              {pageInfo.section && (
                <>
                  <span className="hidden shrink-0 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#C59B4C] sm:block">
                    {pageInfo.section}
                  </span>
                  <ChevronRight className="hidden h-3 w-3 shrink-0 text-[#D1D5DB] sm:block" />
                </>
              )}
              <AnimatePresence mode="wait">
                <motion.span
                  key={pageInfo.title}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 6 }}
                  transition={{ duration: 0.18 }}
                  className="truncate text-[13px] font-semibold text-[#1A2B4C]"
                >
                  {pageInfo.title}
                </motion.span>
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ── RIGHT ── */}
        <div className="flex shrink-0 items-center gap-0.5">
          {/* Announcements */}
          <NavIconButton
            href="/dashboard/announcements"
            label="Announcements"
            badge={<NavBadge count={announcementCount ?? 0} color="bg-[#C59B4C]" />}
          >
            <Megaphone className="h-[18px] w-[18px]" />
          </NavIconButton>

          {/* Notifications */}
          <NavIconButton
            href="/dashboard/notifications"
            label="Notifications"
            badge={<NavBadge count={unreadCount ?? 0} color="bg-[#DC2626]" />}
          >
            <Bell className="h-[18px] w-[18px]" />
          </NavIconButton>

          {/* Messages */}
          <NavIconButton
            href="/dashboard/messages"
            label="Messages"
            badge={<NavBadge count={unreadMessageCount ?? 0} color="bg-[#C59B4C]" />}
          >
            <MessageSquare className="h-[18px] w-[18px]" />
          </NavIconButton>

          {/* Divider */}
          <div className="mx-1 h-5 w-px bg-[#E5E7EB]" />

          {/* User chip */}
          <Link
            href="/dashboard/profile"
            className={cn(
              'flex h-9 items-center gap-2 rounded-lg pl-1 pr-2.5',
              'ring-1 ring-transparent',
              'transition-colors duration-150',
              'hover:bg-[#F8F9FA] hover:ring-[#E5E7EB]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B4C]',
            )}
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              {user?.profileImageUrl ? (
                <Image
                  src={user.profileImageUrl}
                  alt={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`}
                  width={28}
                  height={28}
                  unoptimized
                  className="h-7 w-7 rounded-full object-cover ring-1 ring-[#E5E7EB]"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C59B4C] ring-1 ring-[#E5E7EB]">
                  <span className="text-[10.5px] font-semibold tabular-nums text-white">
                    {getInitials(user)}
                  </span>
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#22C55E]" />
            </div>

            {/* Name + role */}
            <div className="hidden min-w-0 sm:block">
              <p className="max-w-[120px] truncate text-[12px] font-semibold leading-tight text-[#1A2B4C]">
                {userLabel}
              </p>
              <p className="text-[9.5px] font-semibold uppercase leading-tight tracking-[0.06em] text-[#C59B4C]">
                {formatRole(userRole)}
              </p>
            </div>

            <ChevronDown className="hidden h-3.5 w-3.5 shrink-0 text-[#9CA3AF] sm:block" />
          </Link>
        </div>
      </div>
    </motion.header>
  );
}