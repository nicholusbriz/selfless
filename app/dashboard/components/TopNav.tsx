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
  Dot,
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
    '/dashboard/students': { title: 'Students', section: 'Workspace' },
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
// BADGE — reusable notification dot
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
            'absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1',
            'rounded-full text-white text-[8px] font-bold font-mono',
            'flex items-center justify-center border-2 border-white',
            color
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
    <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
      <Link
        href={href}
        aria-label={label}
        className={cn(
          'relative flex items-center justify-center',
          'w-9 h-9 rounded-xl',
          'text-[#4A5568]',
          'hover:text-[#1A2B4C] hover:bg-[#F3F4F6]',
          'transition-all duration-150',
          'focus:outline-none focus:ring-2 focus:ring-[#B98A3E]/40'
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

  return (
    <motion.header
      initial={{ y: -56, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{ height: TOPBAR_HEIGHT }}
      className={cn(
        'fixed top-0 right-0 z-30',
        'bg-white/98 backdrop-blur-sm',
        'border-b border-[#EAECEF]',
        'transition-all duration-300',
        isMobile
          ? 'left-0'
          : sidebarOpen
            ? 'left-0 lg:left-[240px]'
            : 'left-0 lg:left-[64px]',
        scrolled
          ? 'shadow-[0_1px_0_rgba(0,0,0,0.05),0_4px_16px_rgba(18,32,59,0.08)]'
          : 'shadow-none'
      )}
    >
      <div className="h-full flex items-center justify-between gap-2 px-3 sm:px-4 lg:px-5">

        {/* ── LEFT ── */}
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">

          {/* Mobile: logo button */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={onMenuToggle}
            className={cn(
              'flex lg:hidden items-center justify-center shrink-0',
              'w-9 h-9 rounded-xl',
              'ring-1 ring-[#E5E7EB]',
              'hover:ring-[#B98A3E] hover:bg-[#FBF7EE]',
              'transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-[#B98A3E]/40',
              'overflow-hidden'
            )}
            aria-label="Open sidebar"
          >
            <Image
              src="/freedom.png"
              alt="Selfless"
              width={36}
              height={36}
              className="w-full h-full object-cover"
            />
          </motion.button>

          {/* Desktop: sidebar toggle */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.06 }}
            onClick={() => setSidebarOpen((prev) => !prev)}
            className={cn(
              'hidden lg:flex items-center justify-center shrink-0',
              'w-8 h-8 rounded-lg',
              'text-[#6B7280]',
              'hover:text-[#1A2B4C] hover:bg-[#F3F4F6]',
              'transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-[#B98A3E]/40'
            )}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen
              ? <PanelLeftClose className="w-[18px] h-[18px]" />
              : <PanelLeftOpen className="w-[18px] h-[18px]" />}
          </motion.button>

          {/* Divider */}
          <div className="hidden lg:block h-5 w-px bg-[#E5E7EB] shrink-0" />

          {/* Breadcrumb */}
          <div className="hidden sm:flex min-w-0 items-center gap-1.5">
            {pageInfo.section && (
              <>
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#B98A3E] shrink-0">
                  {pageInfo.section}
                </span>
                <ChevronRight className="w-3 h-3 text-[#D1D5DB] shrink-0" />
              </>
            )}
            <AnimatePresence mode="wait">
              <motion.span
                key={pageInfo.title}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                transition={{ duration: 0.18 }}
                className="text-[13px] font-semibold text-[#1A2B4C] truncate"
              >
                {pageInfo.title}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="flex shrink-0 items-center gap-0.5">

          {/* Announcements */}
          <NavIconButton
            href="/dashboard/announcements"
            label="Announcements"
            badge={<NavBadge count={announcementCount ?? 0} color="bg-[#3E5C76]" />}
          >
            <Megaphone className="w-[18px] h-[18px]" />
          </NavIconButton>

          {/* Notifications */}
          <NavIconButton
            href="/dashboard/notifications"
            label="Notifications"
            badge={<NavBadge count={unreadCount ?? 0} color="bg-[#C0392B]" />}
          >
            <Bell className="w-[18px] h-[18px]" />
          </NavIconButton>

          {/* Messages */}
          <NavIconButton
            href="/dashboard/messages"
            label="Messages"
            badge={<NavBadge count={unreadMessageCount ?? 0} color="bg-[#2E7D52]" />}
          >
            <MessageSquare className="w-[18px] h-[18px]" />
          </NavIconButton>

          {/* Divider */}
          <div className="mx-1 h-5 w-px bg-[#E5E7EB]" />

          {/* User chip */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/dashboard/profile"
              className={cn(
                'flex items-center gap-2',
                'h-9 pl-1 pr-2.5 rounded-xl',
                'ring-1 ring-transparent',
                'hover:ring-[#E5E7EB] hover:bg-[#F9FAFB]',
                'transition-all duration-150',
                'focus:outline-none focus:ring-2 focus:ring-[#B98A3E]/40'
              )}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                {user?.profileImageUrl ? (
                  <Image
                    src={user.profileImageUrl}
                    alt={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`}
                    width={30}
                    height={30}
                    unoptimized
                    className="w-[30px] h-[30px] rounded-full object-cover ring-2 ring-[#B98A3E]/60"
                  />
                ) : (
                  <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-[#B98A3E] to-[#8A6328] flex items-center justify-center ring-2 ring-[#B98A3E]/60">
                    <span className="font-mono text-[10px] font-bold text-white">
                      {getInitials(user)}
                    </span>
                  </div>
                )}
                {/* Online dot */}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#22C55E] border-2 border-white" />
              </div>

              {/* Name + role */}
              <div className="hidden sm:block min-w-0">
                <p className="text-[12px] font-semibold text-[#1A2B4C] leading-tight truncate max-w-[110px]">
                  {user?.firstName}
                </p>
                <p className="text-[9px] font-mono font-bold text-[#B98A3E] uppercase tracking-widest leading-tight">
                  {formatRole(userRole)}
                </p>
              </div>

              <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
