// app/dashboard/layout.tsx
'use client';

import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useRef,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import {
  motion,
  AnimatePresence,
  type Variants,
} from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/hooks/useAuth';

import {
  LayoutDashboard,
  Home,
  LogOut,
  Menu,
  X,
  User,
  BookOpen,
  Calendar,
  BarChart3,
  Settings,
  Bell,
  ChevronDown,
  Users,
  Megaphone,
  FileText,
  Sparkles,
  Shield,
  UserCog,
  School,
  Briefcase,
  ClipboardList,
  Clock,
  Award,
  Trophy,
  Search,
  Building2,
  HeartHandshake,
  Database,
  Key,
  DollarSign,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  GraduationCap,
  ArrowUpRight,
  CircleDot,
  MessageCircle,
  Radio,
  BookMarked,
  Code,
  MessageSquare,
} from 'lucide-react';

import {
  useUnreadNotificationCount,
  useAnnouncementCount,
} from '@/hooks/useNotifications';

// ============================================================
// DESIGN TOKENS
// ============================================================

const COLORS = {
  page: '#F1F1EC',
  surface: '#FFFFFF',
  surfaceSoft: '#F7F6F2',
  surfaceWarm: '#F7F1E4',
  border: '#DADCD3',
  borderSoft: '#E8E9E3',

  ink: '#12203B',
  body: '#4B564C',
  muted: '#6B7268',
  subtle: '#8A9088',
  faint: '#B9BEB2',

  brass: '#B98A3E',
  brassDark: '#936B2B',

  moss: '#55705B',
  rust: '#A4462F',
  slate: '#3E5C76',
};

// ============================================================
// TYPES
// ============================================================

interface UserInfo {
  profileImageUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  role?: string | null;
}

interface TopBarProps {
  sidebarOpen: boolean;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  isMobile: boolean;
  onMenuToggle?: () => void;
  user: UserInfo | null;
  userRole: string;
}

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: ReactNode;
  roles: string[];
}

interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

const ALL_ROLES = ['student', 'teacher', 'admin', 'dev', 'super_admin'];
const NON_SUPER_ADMIN_ROLES = ['student', 'teacher', 'admin', 'dev'];

const iconClass = 'w-[18px] h-[18px] flex-shrink-0';

// ============================================================
// SHARED NAVIGATION
// ============================================================

const sharedNavigation: NavSection[] = [
  {
    id: 'workspace',
    label: 'Workspace',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/dashboard',
        icon: <LayoutDashboard className={iconClass} />,
        roles: ALL_ROLES,
      },
      {
        id: 'students',
        label: 'Students',
        path: '/dashboard/students',
        icon: <Users className={iconClass} />,
        roles: ALL_ROLES,
      },
      {
        id: 'atbriz-ai',
        label: 'Atbriz AI',
        path: '/dashboard/ai',
        icon: <Sparkles className={iconClass} />,
        roles: ALL_ROLES,
      },
    ],
  },

  {
    id: 'academics',
    label: 'Academics',
    items: [
      {
        id: 'courses',
        label: 'Courses',
        path: '/dashboard/courses',
        icon: <BookOpen className={iconClass} />,
        roles: NON_SUPER_ADMIN_ROLES,
      },
      {
        id: 'grades',
        label: 'Grades',
        path: '/dashboard/grades',
        icon: <BarChart3 className={iconClass} />,
        roles: NON_SUPER_ADMIN_ROLES,
      },

      // --------------------------------------------------------
      // STUDENT TUTORS
      // --------------------------------------------------------
      {
        id: 'tutors',
        label: 'Tutors',
        path: '/dashboard/admin/teachers',
        icon: <GraduationCap className={iconClass} />,
        roles: ['student'],
      },
    ],
  },

  {
    id: 'opportunities',
    label: 'Opportunities',
    items: [
      {
        id: 'browse-internships',
        label: 'Internships',
        path: '/dashboard/internships',
        icon: <Briefcase className={iconClass} />,
        roles: ALL_ROLES,
      },
    ],
  },

  {
    id: 'media',
    label: 'Media',
    items: [
      {
        id: 'my-applications',
        label: 'Live Streaming',
        path: '/dashboard/live-streaming',
        icon: <Radio className={iconClass} />,
        roles: ALL_ROLES,
      },
    ],
  },

  {
    id: 'community',
    label: 'Community',
    items: [
      {
        id: 'support-groups',
        label: 'Support Groups',
        path: '/dashboard/support-groups',
        icon: <HeartHandshake className={iconClass} />,
        roles: ALL_ROLES,
      },
      {
        id: 'temple-trips',
        label: 'Temple Trips',
        path: '/dashboard/temple-trips',
        icon: <Building2 className={iconClass} />,
        roles: ALL_ROLES,
      },
      {
        id: 'football-team',
        label: 'Football Team',
        path: '/dashboard/football-team',
        icon: <Trophy className={iconClass} />,
        roles: NON_SUPER_ADMIN_ROLES,
      },
    ],
  },

  {
    id: 'campus',
    label: 'Campus',
    items: [
      {
        id: 'cleaning',
        label: 'Cleaning',
        path: '/dashboard/cleaning',
        icon: <Calendar className={iconClass} />,
        roles: NON_SUPER_ADMIN_ROLES,
      },
    ],
  },

  {
    id: 'communication',
    label: 'Communication',
    items: [
      {
        id: 'announcements',
        label: 'Announcements',
        path: '/dashboard/announcements',
        icon: <Megaphone className={iconClass} />,
        roles: ALL_ROLES,
      },
      {
        id: 'notifications',
        label: 'Notifications',
        path: '/dashboard/notifications',
        icon: <Bell className={iconClass} />,
        roles: NON_SUPER_ADMIN_ROLES,
      },
    ],
  },
];

// ============================================================
// ADMIN NAVIGATION
// ============================================================

const adminNavigation: NavSection = {
  id: 'administration',
  label: 'Administration',
  items: [
    {
      id: 'admin-dashboard',
      label: 'Admin',
      path: '/dashboard/admin',
      icon: <Shield className={iconClass} />,
      roles: ['admin'],
    },
    {
      id: 'manage-users',
      label: 'Users',
      path: '/dashboard/admin/users',
      icon: <Users className={iconClass} />,
      roles: ['admin'],
    },
    {
      id: 'manage-teachers',
      label: 'Tutors',
      path: '/dashboard/admin/teachers',
      icon: <UserCog className={iconClass} />,
      roles: ['admin'],
    },
    {
      id: 'manage-tuition',
      label: 'Tuition',
      path: '/dashboard/admin/tuition',
      icon: <DollarSign className={iconClass} />,
      roles: ['admin'],
    },
    {
      id: 'manage-tech-centers',
      label: 'Tech Centers',
      path: '/dashboard/admin/tech-centers',
      icon: <School className={iconClass} />,
      roles: ['admin'],
    },
    {
      id: 'manage-cleaning',
      label: 'Cleaning',
      path: '/dashboard/admin/cleaning',
      icon: <Calendar className={iconClass} />,
      roles: ['admin'],
    },
  ],
};

// ============================================================
// TEACHER NAVIGATION
// ============================================================

const teacherNavigation: NavSection = {
  id: 'teaching',
  label: 'Tutoring',
  items: [
    {
      id: 'teacher-dashboard',
      label: 'Tutors',
      path: '/dashboard/admin/teachers',
      icon: <Briefcase className={iconClass} />,
      roles: ['teacher'],
    },
    {
      id: 'assign-grades',
      label: 'Grades',
      path: '/dashboard/teacher/grades',
      icon: <Award className={iconClass} />,
      roles: ['teacher'],
    },
    {
      id: 'attendance',
      label: 'Attendance',
      path: '/dashboard/cleaning',
      icon: <Clock className={iconClass} />,
      roles: ['teacher'],
    },
  ],
};

// ============================================================
// SUPER ADMIN NAVIGATION
// ============================================================

const superAdminNavigation: NavSection = {
  id: 'system',
  label: 'System',
  items: [
    {
      id: 'super-admin-dashboard',
      label: 'Overview',
      path: '/dashboard/super-admin',
      icon: <Shield className={iconClass} />,
      roles: ['super_admin'],
    },
    {
      id: 'all-centers',
      label: 'Tech Centers',
      path: '/dashboard/super-admin/centers',
      icon: <School className={iconClass} />,
      roles: ['super_admin'],
    },
    // ADDED: Users link for super_admin
    {
      id: 'all-users',
      label: 'Users',
      path: '/dashboard/super-admin/users',
      icon: <Users className={iconClass} />,
      roles: ['super_admin'],
    },
  ],
};

// ============================================================
// DEVELOPER NAVIGATION
// ============================================================

const devNavigation: NavSection = {
  id: 'developers',
  label: 'Developers',
  items: [
    {
      id: 'dev-dashboard',
      label: 'Dev Dashboard',
      path: '/dashboard/dev',
      icon: <Code className={iconClass} />,
      roles: ['dev'],
    },
    {
      id: 'super-admin-overview',
      label: 'System Overview',
      path: '/dashboard/super-admin',
      icon: <Shield className={iconClass} />,
      roles: ['dev'],
    },
    {
      id: 'all-centers',
      label: 'Tech Centers',
      path: '/dashboard/super-admin/centers',
      icon: <School className={iconClass} />,
      roles: ['dev'],
    },
    {
      id: 'all-users',
      label: 'Users',
      path: '/dashboard/super-admin/users',
      icon: <Users className={iconClass} />,
      roles: ['dev'],
    },
    {
      id: 'password-resets',
      label: 'Password Resets',
      path: '/dashboard/dev/password-resets',
      icon: <Key className={iconClass} />,
      roles: ['dev'],
    },
    {
      id: 'knowledge-base',
      label: 'Knowledge Base',
      path: '/dashboard/dev/knowledge-base',
      icon: <Database className={iconClass} />,
      roles: ['dev'],
    },
    {
      id: 'activity-logs',
      label: 'Activity Logs',
      path: '/dashboard/dev/logs',
      icon: <FileText className={iconClass} />,
      roles: ['dev'],
    },
    {
      id: 'system-settings',
      label: 'System Settings',
      path: '/dashboard/dev/settings',
      icon: <Settings className={iconClass} />,
      roles: ['dev'],
    },
  ],
};

// ============================================================
// ACCOUNT NAVIGATION
// ============================================================

const accountNavigation: NavSection = {
  id: 'account',
  label: 'Account',
  items: [
    {
      id: 'profile',
      label: 'My Profile',
      path: '/dashboard/profile',
      icon: <User className={iconClass} />,
      roles: ALL_ROLES,
    },
    {
      id: 'settings',
      label: 'Settings',
      path: '/dashboard/settings',
      icon: <Settings className={iconClass} />,
      roles: ALL_ROLES,
    },
  ],
};

// ============================================================
// NAVIGATION BUILDER
// ============================================================

function getNavigation(userRole: string): NavSection[] {
  const navigation: NavSection[] = sharedNavigation.map((section) => ({
    ...section,
    items: section.items.filter((item) =>
      item.roles.includes(userRole)
    ),
  }));

  if (userRole === 'admin') {
    navigation.push({
      ...adminNavigation,
      items: adminNavigation.items.filter((item) =>
        item.roles.includes(userRole)
      ),
    });
  }

  if (userRole === 'teacher') {
    navigation.push({
      ...teacherNavigation,
      items: teacherNavigation.items.filter((item) =>
        item.roles.includes(userRole)
      ),
    });
  }

  if (userRole === 'dev') {
    navigation.push({
      ...devNavigation,
      items: devNavigation.items.filter((item) =>
        item.roles.includes(userRole)
      ),
    });
  }

  if (userRole === 'super_admin') {
    navigation.push({
      ...superAdminNavigation,
      items: superAdminNavigation.items.filter((item) =>
        item.roles.includes(userRole)
      ),
    });
  }

  navigation.push({
    ...accountNavigation,
    items: accountNavigation.items.filter((item) =>
      item.roles.includes(userRole)
    ),
  });

  return navigation.filter(
    (section) => section.items.length > 0
  );
}

// ============================================================
// HELPERS
// ============================================================

function isPathActive(pathname: string, path: string) {
  if (path === '/dashboard') {
    return pathname === '/dashboard';
  }

  return (
    pathname === path ||
    pathname.startsWith(`${path}/`)
  );
}

function getInitials(user: UserInfo | null) {
  const first =
    user?.firstName?.charAt(0).toUpperCase() || '';

  const last =
    user?.lastName?.charAt(0).toUpperCase() || '';

  return `${first}${last}` || 'U';
}

function formatRole(role: string) {
  return role
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
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
      title: 'Cleaning',
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
      title: 'Grades',
      section: 'Tutoring',
    },

    '/dashboard/profile': {
      title: 'My Profile',
      section: 'Account',
    },

    '/dashboard/settings': {
      title: 'Settings',
      section: 'Account',
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
// SIDEBAR BILLBOARD DATA
// ============================================================

function getSidebarBillboard(userRole: string) {
  if (userRole === 'student') {
    return {
      eyebrow: 'STUDENT LIFE',
      title: 'Your next step matters.',
      description:
        'Stay connected, keep learning and make the most of your Selfless CE journey.',
      href: '/dashboard/courses',
      action: 'Explore courses',
      icon: <BookMarked className="w-4 h-4" />,
    };
  }

  if (userRole === 'teacher') {
    return {
      eyebrow: 'TEACHING',
      title: 'Make every student count.',
      description:
        'Keep track of your learners, grades and daily responsibilities.',
      href: '/dashboard/teacher/grades',
      action: 'Open teaching space',
      icon: <GraduationCap className="w-4 h-4" />,
    };
  }

  if (userRole === 'admin') {
    return {
      eyebrow: 'ADMINISTRATION',
      title: 'Lead with clarity.',
      description:
        'Manage people, centres, academics and the student experience.',
      href: '/dashboard/admin',
      action: 'Open administration',
      icon: <Shield className="w-4 h-4" />,
    };
  }

  return {
    eyebrow: 'SYSTEM',
    title: 'Everything connected.',
    description:
      'Monitor the Selfless CE platform and keep every part moving.',
    href: '/dashboard/super-admin',
    action: 'Open system',
    icon: <Database className="w-4 h-4" />,
  };
}

// ============================================================
// TOP BAR
// ============================================================

function TopBar({
  sidebarOpen,
  setSidebarOpen,
  isMobile,
  onMenuToggle,
  user,
  userRole,
}: TopBarProps) {
  const [scrolled, setScrolled] =
    useState(false);

  const { data: unreadCount } =
    useUnreadNotificationCount();

  const { data: announcementCount } =
    useAnnouncementCount();

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
        'fixed top-0 right-0 z-30 h-16',
        'bg-white/95 backdrop-blur-sm',
        'border-b border-[#DADCD3]',
        'transition-all duration-300',
        isMobile
          ? 'left-0'
          : sidebarOpen
            ? 'left-0 lg:left-64'
            : 'left-0 lg:left-[72px]',
        scrolled &&
          'shadow-[0_4px_24px_rgba(18,32,59,0.08)]'
      )}
    >
      <div className="h-full flex items-center justify-between px-4 sm:px-6 lg:px-7">
        {/* LEFT */}
        <div className="flex items-center min-w-0">
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.04 }}
            onClick={
              isMobile
                ? onMenuToggle
                : () =>
                    setSidebarOpen(
                      (previous) => !previous
                    )
            }
            className={cn(
              'flex items-center justify-center',
              'w-9 h-9 rounded-lg',
              'text-[#6B7268]',
              'hover:text-[#12203B]',
              'hover:bg-[#F5F4EE]',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-[#B98A3E]/20'
            )}
            aria-label={
              isMobile
                ? 'Open navigation'
                : 'Toggle sidebar'
            }
          >
            {isMobile ? (
              <Menu className="w-5 h-5" />
            ) : sidebarOpen ? (
              <PanelLeftClose className="w-5 h-5" />
            ) : (
              <PanelLeftOpen className="w-5 h-5" />
            )}
          </motion.button>

          <div className="ml-3 pl-3 border-l border-[#DADCD3] min-w-0">
            <div className="flex items-center gap-2 font-mono text-[11px] text-[#8A9088]">
              {pageInfo.section && (
                <>
                  <span className="hidden sm:inline truncate uppercase tracking-wider">
                    {pageInfo.section}
                  </span>

                  <ChevronRight className="hidden sm:block w-3 h-3 text-[#B9BEB2]" />
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
                className="text-[#12203B] font-medium truncate"
              >
                {pageInfo.title}
              </motion.span>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-1 sm:gap-2 ml-3">
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
                'text-[#6B7268]',
                'hover:text-[#12203B]',
                'hover:bg-[#F5F4EE]',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-[#B98A3E]/20'
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

          {/* NOTIFICATIONS - Hide for super_admin */}
          {userRole !== 'super_admin' && (
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
                  'text-[#6B7268]',
                  'hover:text-[#12203B]',
                  'hover:bg-[#F5F4EE]',
                  'transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-[#B98A3E]/20'
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
          )}

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
                'text-[#6B7268]',
                'hover:text-[#12203B]',
                'hover:bg-[#F5F4EE]',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-[#B98A3E]/20'
              )}
            >
              <MessageSquare className="w-[18px] h-[18px]" />
            </Link>
          </motion.div>

          {/* USER */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href="/dashboard/profile"
              className={cn(
                'ml-1 sm:ml-2',
                'pl-2 sm:pl-3',
                'border-l border-[#DADCD3]',
                'flex items-center gap-2.5',
                'py-1.5 px-1.5 rounded-lg',
                'hover:bg-[#F7F6F2]',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-[#B98A3E]/20'
              )}
            >
              {user?.profileImageUrl ? (
                <Image
                  src={user.profileImageUrl}
                  alt={`${user?.firstName || ''} ${user?.lastName || ''}`}
                  width={34}
                  height={34}
                  unoptimized
                  className="w-[34px] h-[34px] object-cover grayscale border border-[#DADCD3] rounded-full"
                />
              ) : (
                <div className="w-[34px] h-[34px] bg-[#12203B] flex items-center justify-center text-white font-mono text-[11px] font-semibold rounded-full">
                  {getInitials(user)}
                </div>
              )}

              <div className="hidden sm:block min-w-0">
                <p className="text-[#12203B] text-sm font-medium leading-tight truncate max-w-[150px]">
                  {user?.firstName} {user?.lastName}
                </p>

                <p className="text-[#8A9088] text-[11px] font-mono leading-tight mt-0.5 uppercase tracking-wide">
                  {formatRole(userRole)}
                </p>
              </div>

              <ChevronDown className="hidden md:block w-3.5 h-3.5 text-[#8A9088]" />
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}

// ============================================================
// NAVIGATION ITEM
// ============================================================

interface NavigationItemProps {
  item: NavItem;
  pathname: string;
  collapsed?: boolean;
  unreadCount?: number;
  announcementCount?: number;
  index?: number;
}

function NavigationItem({
  item,
  pathname,
  collapsed = false,
  unreadCount,
  announcementCount,
  index = 0,
}: NavigationItemProps) {
  const active = isPathActive(
    pathname,
    item.path
  );

  const badge =
    item.id === 'notifications'
      ? unreadCount
      : item.id === 'announcements'
        ? announcementCount
        : undefined;

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      x: -8,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.2,
        delay: Math.min(index * 0.025, 0.18),
      },
    },
  };

  if (collapsed) {
    return (
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <Link
          href={item.path}
          aria-label={item.label}
          className={cn(
            'relative group flex items-center justify-center',
            'w-full h-11 rounded-lg',
            'transition-all duration-200',
            active
              ? 'bg-[#F7F1E4] text-[#B98A3E]'
              : 'text-[#6B7268] hover:text-[#12203B] hover:bg-[#F5F4EE]'
          )}
        >
          {active && (
            <motion.span
              layoutId="collapsed-active-indicator"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#B98A3E] rounded-r"
              transition={{
                type: 'spring',
                stiffness: 450,
                damping: 32,
              }}
            />
          )}

          <motion.span
            whileHover={{
              scale: 1.08,
              y: -1,
            }}
            whileTap={{ scale: 0.92 }}
            className="flex"
          >
            {item.icon}
          </motion.span>

          {badge && badge > 0 ? (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-1 right-1 min-w-[14px] h-[14px] px-0.5 rounded-full bg-[#A4462F] text-white text-[8px] font-mono font-semibold flex items-center justify-center border border-white"
            >
              {badge > 9 ? '9+' : badge}
            </motion.span>
          ) : null}

          <span
            className={cn(
              'absolute left-full ml-3 top-1/2 -translate-y-1/2',
              'whitespace-nowrap',
              'bg-[#12203B] text-white',
              'text-xs font-medium',
              'px-3 py-2 rounded-lg',
              'shadow-[0_8px_20px_rgba(18,32,59,0.16)]',
              'opacity-0 invisible',
              'group-hover:opacity-100 group-hover:visible',
              'translate-x-1 group-hover:translate-x-0',
              'transition-all duration-200',
              'pointer-events-none z-[300]'
            )}
          >
            {item.label}
          </span>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
    >
      <Link
        href={item.path}
        className={cn(
          'relative group flex items-center gap-3',
          'w-full min-h-10 px-3 rounded-lg',
          'text-[13px]',
          'transition-all duration-200',
          active
            ? 'bg-[#F7F1E4] text-[#12203B] font-semibold'
            : 'text-[#4B564C] font-medium hover:text-[#12203B] hover:bg-[#F5F4EE]'
        )}
      >
        {active && (
          <motion.span
            layoutId="expanded-active-indicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#B98A3E] rounded-r"
            transition={{
              type: 'spring',
              stiffness: 450,
              damping: 32,
            }}
          />
        )}

        <motion.span
          whileHover={{
            scale: 1.08,
            x: 1,
          }}
          whileTap={{ scale: 0.92 }}
          className={cn(
            'flex items-center justify-center transition-colors duration-200',
            active
              ? 'text-[#B98A3E]'
              : 'text-[#6B7268]'
          )}
        >
          {item.icon}
        </motion.span>

        <span className="truncate">
          {item.label}
        </span>

        {item.id === 'tutors' && (
          <span className="ml-auto flex items-center gap-1 text-[9px] font-mono uppercase tracking-wide text-[#B98A3E] opacity-80">
            <CircleDot className="w-2.5 h-2.5" />
          </span>
        )}

        {badge && badge > 0 ? (
          <motion.span
            initial={{
              scale: 0.7,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            className={cn(
              'ml-auto min-w-[20px] h-5 px-1.5 rounded-full',
              'flex items-center justify-center',
              'text-[10px] font-mono font-semibold text-white',
              item.id === 'notifications'
                ? 'bg-[#A4462F]'
                : 'bg-[#3E5C76]'
            )}
          >
            {badge > 99 ? '99+' : badge}
          </motion.span>
        ) : null}

        <ArrowUpRight
          className={cn(
            'w-3.5 h-3.5',
            'ml-auto',
            'text-[#B9BEB2]',
            'opacity-0 -translate-x-1',
            'group-hover:opacity-100',
            'group-hover:translate-x-0',
            'transition-all duration-200',
            badge || item.id === 'tutors'
              ? 'hidden'
              : ''
          )}
        />
      </Link>
    </motion.div>
  );
}

// ============================================================
// SIDEBAR BILLBOARD
// ============================================================

function SidebarBillboard({
  userRole,
  collapsed,
}: {
  userRole: string;
  collapsed: boolean;
}) {
  const billboard =
    getSidebarBillboard(userRole);

  if (collapsed) {
    return (
      <div className="px-2 mb-3">
        <Link
          href={billboard.href}
          aria-label={billboard.title}
          className="group relative flex items-center justify-center h-12 overflow-hidden bg-[#12203B] rounded-lg"
        >
          <motion.div
            className="absolute inset-y-0 left-0 w-[3px] bg-[#B98A3E]"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{
              duration: 0.45,
              delay: 0.2,
            }}
            style={{
              transformOrigin: 'top',
            }}
          />

          <motion.div
            animate={{
              y: [0, -2, 0],
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="text-[#F7F1E4]"
          >
            {billboard.icon}
          </motion.div>

          <span className="absolute left-full ml-3 whitespace-nowrap bg-[#12203B] text-white text-xs px-3 py-2 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[300]">
            {billboard.action}
          </span>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.35,
        delay: 0.1,
      }}
      className="px-3 pb-3"
    >
      <Link
        href={billboard.href}
        className="group relative block overflow-hidden bg-[#12203B] text-white rounded-lg"
      >
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#B98A3E]"
          animate={{
            opacity: [0.55, 1, 0.55],
          }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <div className="absolute right-0 top-0 w-16 h-16 border-l border-b border-white/10" />

        <motion.div
          animate={{
            x: [0, 3, 0],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#B9BEB2]">
              {billboard.eyebrow}
            </span>

            <motion.span
              whileHover={{
                rotate: 45,
              }}
              className="text-[#B98A3E]"
            >
              <ArrowUpRight className="w-4 h-4" />
            </motion.span>
          </div>

          <h3 className="text-[15px] leading-[1.25] font-semibold tracking-tight pr-5">
            {billboard.title}
          </h3>

          <p className="mt-2 text-[11px] leading-[1.55] text-white/65">
            {billboard.description}
          </p>

          <div className="mt-4 flex items-center gap-2 text-[10px] font-medium text-[#F7F1E4]">
            <span className="w-5 h-px bg-[#B98A3E]" />

            <span>{billboard.action}</span>

            <ChevronRight className="w-3 h-3 text-[#B98A3E]" />
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

// ============================================================
// SIDEBAR
// ============================================================

interface SidebarProps {
  sidebarOpen: boolean;
  pathname: string;
  user: UserInfo | null;
  userRole: string;
  handleLogout: () => void | Promise<void>;
}

function Sidebar({
  sidebarOpen,
  pathname,
  user,
  userRole,
  handleLogout,
}: SidebarProps) {
  const navigation = useMemo(
    () => getNavigation(userRole),
    [userRole]
  );

  const [expandedSections, setExpandedSections] =
    useState<string[]>(
      navigation.map(
        (section) => section.id
      )
    );

  const [searchQuery, setSearchQuery] =
    useState('');

  const { data: unreadCount } =
    useUnreadNotificationCount();

  const { data: announcementCount } =
    useAnnouncementCount();

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setExpandedSections(
      navigation.map(
        (section) => section.id
      )
    );
  }, [navigation]);

  const toggleSection = (
    sectionId: string
  ) => {
    setExpandedSections((previous) =>
      previous.includes(sectionId)
        ? previous.filter(
            (id) => id !== sectionId
          )
        : [...previous, sectionId]
    );
  };

  const searchResults = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    if (!query) {
      return navigation;
    }

    return navigation
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.label
              .toLowerCase()
              .includes(query) ||
            item.id
              .toLowerCase()
              .includes(query) ||
            section.label
              .toLowerCase()
              .includes(query)
        ),
      }))
      .filter(
        (section) =>
          section.items.length > 0
      );
  }, [
    navigation,
    searchQuery,
  ]);

  const searchActive =
    searchQuery.trim().length > 0;

  // Focus search on Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'h-screen bg-white',
        'border-r border-[#DADCD3]',
        'flex flex-col overflow-hidden',
        'transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        sidebarOpen
          ? 'w-64'
          : 'w-[72px]'
      )}
    >
      {/* ================================================== */}
      {/* BRAND - Fixed */}
      {/* ================================================== */}

      <div
        className={cn(
          'h-16 flex-shrink-0',
          'border-b border-[#DADCD3]',
          'flex items-center',
          'relative overflow-hidden',
          'bg-white',
          sidebarOpen
            ? 'px-4'
            : 'justify-center'
        )}
      >
        <Link
          href="/dashboard"
          className="relative flex items-center gap-3 min-w-0 group"
          aria-label="Selfless CE Dashboard"
        >
          <motion.div
            whileHover={{
              scale: 1.04,
            }}
            whileTap={{
              scale: 0.96,
            }}
            className="relative w-8 h-8 bg-[#12203B] flex items-center justify-center overflow-hidden flex-shrink-0 rounded-lg"
          >
            <Image
              src="/freedom.png"
              alt="Selfless CE Logo"
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />

            <motion.span
              className="absolute inset-y-0 left-0 w-1/3 bg-white/20"
              animate={{
                x: ['-120%', '320%'],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                repeatDelay: 5,
                ease: 'easeInOut',
              }}
            />
          </motion.div>

          {sidebarOpen && (
            <motion.div
              initial={{
                opacity: 0,
                x: -6,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.22,
              }}
              className="min-w-0"
            >
              <p className="text-[#12203B] font-semibold text-sm leading-tight truncate">
                Selfless CE
              </p>

              <p className="text-[#8A9088] text-[10px] font-mono uppercase tracking-wide leading-tight mt-0.5">
                Student Portal
              </p>
            </motion.div>
          )}
        </Link>

        {sidebarOpen && (
          <motion.div
            className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.25,
            }}
          >
            <motion.span
              animate={{
                opacity: [0.55, 1, 0.55],
              }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
              }}
              className="w-1.5 h-1.5 rounded-full bg-[#55705B]"
            />

            <span className="font-mono text-[8px] uppercase tracking-wider text-[#B9BEB2]">
              Live
            </span>
          </motion.div>
        )}
      </div>

      {/* ================================================== */}
      {/* SCROLLABLE CONTENT */}
      {/* ================================================== */}

      <div
        className={cn(
          'flex-1 overflow-y-auto overflow-x-hidden',
          'sidebar-scroll'
        )}
      >
        {/* BILLBOARD - Scrolls with content */}
        <div className="pt-3">
          <SidebarBillboard
            userRole={userRole}
            collapsed={!sidebarOpen}
          />
        </div>

        {/* SEARCH - Scrolls with content */}
        {sidebarOpen && (
          <motion.div
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: 'auto',
            }}
            className="px-3 pt-1 pb-2"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A9088]" />

              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
                placeholder="Search navigation..."
                aria-label="Search navigation"
                className={cn(
                  'w-full h-9 pl-9 pr-8 rounded-lg',
                  'bg-[#F7F6F2]',
                  'border border-[#DADCD3]',
                  'text-[13px] text-[#12203B]',
                  'placeholder:text-[#8A9088]',
                  'outline-none',
                  'focus:bg-white',
                  'focus:border-[#B98A3E]',
                  'focus:ring-2 focus:ring-[#B98A3E]/20',
                  'transition-all duration-200'
                )}
              />

              {!searchQuery && (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden xl:flex items-center gap-0.5 font-mono text-[9px] text-[#8A9088] border border-[#DADCD3] px-1 py-0.5 bg-white rounded">
                  ⌘K
                </span>
              )}

              {searchQuery && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  type="button"
                  onClick={() =>
                    setSearchQuery('')
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8A9088] hover:text-[#12203B] p-1 rounded"
                  aria-label="Clear navigation search"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* NAVIGATION */}
        <nav
          className={cn(
            'py-3',
            sidebarOpen
              ? 'px-3'
              : 'px-2'
          )}
          aria-label="Dashboard navigation"
        >
          {/* BACK HOME */}
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            className="mb-3"
          >
            <Link
              href="/"
              className={cn(
                'relative group flex items-center gap-3',
                'h-10 px-3 rounded-lg',
                'text-[13px]',
                'text-[#6B7268]',
                'font-medium',
                'hover:text-[#12203B]',
                'hover:bg-[#F5F4EE]',
                'transition-all duration-200',
                !sidebarOpen &&
                  'justify-center px-0'
              )}
            >
              <Home className="w-[18px] h-[18px] flex-shrink-0" />

              {sidebarOpen && (
                <span>Back to Home</span>
              )}

              {!sidebarOpen && (
                <span
                  className={cn(
                    'absolute left-full ml-3',
                    'top-1/2 -translate-y-1/2',
                    'whitespace-nowrap',
                    'bg-[#12203B] text-white',
                    'text-xs font-medium',
                    'px-3 py-2 rounded-lg',
                    'shadow-xl',
                    'opacity-0 invisible',
                    'group-hover:opacity-100',
                    'group-hover:visible',
                    'transition-all duration-200',
                    'pointer-events-none z-[300]'
                  )}
                >
                  Back to Home
                </span>
              )}
            </Link>
          </motion.div>

          <div className="h-px bg-[#DADCD3] mb-3" />

          {/* COLLAPSED */}
          {!sidebarOpen && (
            <div className="space-y-1">
              {searchResults.flatMap(
                (section) =>
                  section.items.map(
                    (item, index) => (
                      <NavigationItem
                        key={`${section.id}-${item.id}`}
                        item={item}
                        pathname={pathname}
                        collapsed
                        index={index}
                        unreadCount={
                          unreadCount ||
                          undefined
                        }
                        announcementCount={
                          announcementCount ||
                          undefined
                        }
                      />
                    )
                  )
              )}
            </div>
          )}

          {/* EXPANDED */}
          {sidebarOpen && (
            <div className="space-y-4">
              {searchResults.map(
                (section) => {
                  const expanded =
                    searchActive ||
                    expandedSections.includes(
                      section.id
                    );

                  return (
                    <motion.div
                      key={section.id}
                      initial={{
                        opacity: 0,
                      }}
                      animate={{
                        opacity: 1,
                      }}
                      transition={{
                        duration: 0.2,
                      }}
                    >
                      {/* SECTION HEADING */}
                      <button
                        type="button"
                        onClick={() =>
                          toggleSection(
                            section.id
                          )
                        }
                        className={cn(
                          'w-full flex items-center gap-2',
                          'px-3 mb-1 py-1 rounded',
                          'font-mono text-[10px]',
                          'uppercase tracking-[0.1em]',
                          'font-semibold',
                          'text-[#8A9088]',
                          'hover:text-[#4B564C]',
                          'hover:bg-[#F5F4EE]',
                          'transition-all duration-200'
                        )}
                        aria-expanded={
                          expanded
                        }
                      >
                        <span>
                          {section.label}
                        </span>

                        <motion.span
                          animate={{
                            rotate: expanded
                              ? 180
                              : 0,
                          }}
                          transition={{
                            duration: 0.18,
                          }}
                          className="ml-auto flex"
                        >
                          <ChevronDown className="w-3 h-3 text-[#B9BEB2]" />
                        </motion.span>
                      </button>

                      {/* ITEMS */}
                      <AnimatePresence initial={false}>
                        {expanded && (
                          <motion.div
                            initial={{
                              height: 0,
                              opacity: 0,
                            }}
                            animate={{
                              height: 'auto',
                              opacity: 1,
                            }}
                            exit={{
                              height: 0,
                              opacity: 0,
                            }}
                            transition={{
                              duration: 0.2,
                            }}
                            className="overflow-hidden space-y-0.5"
                          >
                            {section.items.map(
                              (
                                item,
                                index
                              ) => (
                                <NavigationItem
                                  key={item.id}
                                  item={item}
                                  pathname={
                                    pathname
                                  }
                                  index={
                                    index
                                  }
                                  unreadCount={
                                    unreadCount ||
                                    undefined
                                  }
                                  announcementCount={
                                    announcementCount ||
                                    undefined
                                  }
                                />
                              )
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                }
              )}

              {searchActive &&
                searchResults.length ===
                  0 && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 5,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className="px-3 py-8 text-center"
                  >
                    <Search className="w-5 h-5 mx-auto mb-2 text-[#B9BEB2]" />

                    <p className="text-xs text-[#6B7268]">
                      No pages found
                    </p>
                  </motion.div>
                )}
            </div>
          )}

          {/* ================================================== */}
          {/* QUICK STATUS CARD */}
          {/* ================================================== */}

          {sidebarOpen && (
            <motion.div
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.3,
                delay: 0.15,
              }}
              className="mt-4 px-1"
            >
              <div className="border border-[#DADCD3] bg-[#F7F6F2] p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 bg-white border border-[#DADCD3] rounded">
                      <CircleDot className="w-3 h-3 text-[#55705B]" />
                    </span>

                    <div>
                      <p className="text-[10px] font-semibold text-[#12203B]">
                        Portal status
                      </p>

                      <p className="font-mono text-[8px] uppercase tracking-wide text-[#8A9088]">
                        All systems active
                      </p>
                    </div>
                  </div>

                  <motion.span
                    animate={{
                      opacity: [0.55, 1, 0.55],
                    }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                    }}
                    className="w-1.5 h-1.5 rounded-full bg-[#55705B]"
                  />
                </div>

                <div className="mt-3 h-px bg-[#DADCD3]" />

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[9px] text-[#8A9088]">
                    Selfless CE
                  </span>

                  <span className="font-mono text-[9px] text-[#6B7268]">
                    2026
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ================================================== */}
          {/* LOGOUT */}
          {/* ================================================== */}

          <div className="mt-4 pt-3 border-t border-[#DADCD3]">
            <motion.button
              type="button"
              whileHover={{
                x: sidebarOpen ? 2 : 0,
              }}
              whileTap={{
                scale: 0.98,
              }}
              onClick={handleLogout}
              className={cn(
                'relative group w-full flex items-center gap-3',
                'h-10 px-3 rounded-lg',
                'text-[13px]',
                'text-[#6B7268]',
                'font-medium',
                'hover:text-[#A4462F]',
                'hover:bg-[#FBF0EC]',
                'transition-all duration-200',
                !sidebarOpen &&
                  'justify-center px-0'
              )}
            >
              <LogOut className="w-[18px] h-[18px] flex-shrink-0" />

              {sidebarOpen && (
                <span>Logout</span>
              )}

              {!sidebarOpen && (
                <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-[#12203B] text-white text-xs font-medium px-3 py-2 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-[300]">
                  Logout
                </span>
              )}
            </motion.button>
          </div>

          {/* Bottom spacer for comfortable scrolling */}
          <div className="h-4" />
        </nav>
      </div>

      {/* ================================================== */}
      {/* SIDEBAR USER - Fixed at bottom */}
      {/* ================================================== */}

      {sidebarOpen && (
        <motion.div
          initial={{
            opacity: 0,
            y: 6,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.25,
          }}
          className="flex-shrink-0 border-t border-[#DADCD3] px-3 py-3 bg-white"
        >
          <Link
            href="/dashboard/profile"
            className="group flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#F7F6F2] transition-all duration-200"
          >
            {user?.profileImageUrl ? (
              <Image
                src={user.profileImageUrl}
                alt={`${user?.firstName || ''} ${user?.lastName || ''}`}
                width={34}
                height={34}
                unoptimized
                className="w-[34px] h-[34px] object-cover grayscale border border-[#DADCD3] rounded-full"
              />
            ) : (
              <div className="w-[34px] h-[34px] bg-[#12203B] flex items-center justify-center text-white font-mono text-[11px] font-semibold rounded-full">
                {getInitials(user)}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="text-[#12203B] text-xs font-semibold truncate">
                {user?.firstName}{' '}
                {user?.lastName}
              </p>

              <div className="flex items-center gap-1.5 mt-0.5">
                <motion.span
                  animate={{
                    opacity: [0.55, 1, 0.55],
                  }}
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                  }}
                  className="w-1.5 h-1.5 rounded-full bg-[#55705B]"
                />

                <p className="text-[#8A9088] text-[10px] font-mono uppercase tracking-wide truncate">
                  {formatRole(userRole)}
                </p>
              </div>
            </div>

            <motion.div
              initial={{
                x: 0,
              }}
              whileHover={{
                x: 3,
              }}
            >
              <ChevronRight className="w-3.5 h-3.5 text-[#B9BEB2] group-hover:text-[#B98A3E] transition-colors duration-200" />
            </motion.div>
          </Link>
        </motion.div>
      )}

      <style jsx>{`
        .sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: #dadcd3 transparent;
          overscroll-behavior: contain;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }

        .sidebar-scroll::-webkit-scrollbar {
          width: 5px;
        }

        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb {
          background-color: #dadcd3;
          border-radius: 999px;
          border: 1px solid transparent;
          background-clip: padding-box;
        }

        .sidebar-scroll:hover::-webkit-scrollbar-thumb {
          background-color: #b9beb2;
          background-clip: padding-box;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #8f968d;
          background-clip: padding-box;
        }
      `}</style>
    </motion.aside>
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
  const {
    user,
    isLoading,
    isAuthenticated,
    logout,
  } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const pathname = usePathname();
  const router = useRouter();

  const userRole =
    user?.role || 'student';

  const isAiPage =
    pathname === '/dashboard/ai' ||
    pathname.startsWith(
      '/dashboard/ai/'
    );

  // ----------------------------------------------------------
  // CLOSE MOBILE NAV AFTER ROUTE CHANGE
  // ----------------------------------------------------------

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // ----------------------------------------------------------
  // PREVENT BACKGROUND SCROLL
  // ----------------------------------------------------------

  useEffect(() => {
    document.body.style.overflow =
      mobileMenuOpen
        ? 'hidden'
        : 'unset';

    return () => {
      document.body.style.overflow =
        'unset';
    };
  }, [mobileMenuOpen]);

  // ----------------------------------------------------------
  // RESPONSIVE SIDEBAR
  // ----------------------------------------------------------

  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkMobile();

    window.addEventListener(
      'resize',
      checkMobile
    );

    return () =>
      window.removeEventListener(
        'resize',
        checkMobile
      );
  }, []);

  // ----------------------------------------------------------
  // AUTHENTICATION
  // ----------------------------------------------------------

  useEffect(() => {
    if (
      !isLoading &&
      !isAuthenticated
    ) {
      router.push('/');
    }
  }, [
    isAuthenticated,
    isLoading,
    router,
  ]);

  // ----------------------------------------------------------
  // LOGOUT
  // ----------------------------------------------------------

  const handleLogout = async () => {
    await logout();
  };

  // ----------------------------------------------------------
  // MOBILE MENU
  // ----------------------------------------------------------

  const toggleMobileMenu = () => {
    setMobileMenuOpen(
      (previous) => !previous
    );
  };

  // ----------------------------------------------------------
  // MOBILE ANIMATION
  // ----------------------------------------------------------

  const mobileMenuVariants: Variants = {
    hidden: {
      x: '-100%',
    },

    visible: {
      x: 0,
      transition: {
        duration: 0.34,
        ease: [
          0.22,
          1,
          0.36,
          1,
        ],
      },
    },

    exit: {
      x: '-100%',
      transition: {
        duration: 0.24,
        ease: [
          0.4,
          0,
          1,
          1,
        ],
      },
    },
  };

  // ----------------------------------------------------------
  // LOADING
  // ----------------------------------------------------------

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[#F1F1EC] flex items-center justify-center">
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
              className="absolute inset-0 rounded-full border-2 border-[#DADCD3] border-t-[#12203B]"
            />

            <div className="absolute inset-[9px] bg-[#B98A3E] rounded-full" />
          </div>

          <p className="text-[#6B7268] text-sm font-mono uppercase tracking-wide">
            Loading Selfless CE...
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
    getPageInfo(pathname);

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
          {pageInfo.title} | Selfless CE
        </title>
      </Head>

      <div className="min-h-screen bg-[#F1F1EC]">
        {/* ================================================== */}
        {/* DESKTOP SIDEBAR */}
        {/* ================================================== */}

        <div className="hidden lg:flex fixed inset-y-0 left-0 z-[100]">
          <Sidebar
            sidebarOpen={sidebarOpen}
            pathname={pathname}
            user={user}
            userRole={userRole}
            handleLogout={handleLogout}
          />
        </div>

        {/* ================================================== */}
        {/* MAIN CONTENT */}
        {/* ================================================== */}

        <div
          className={cn(
            'min-h-screen',
            'transition-[margin] duration-300',
            'ease-[cubic-bezier(0.22,1,0.36,1)]',
            sidebarOpen
              ? 'lg:ml-64'
              : 'lg:ml-[72px]'
          )}
        >
          {/* ================================================= */}
          {/* DESKTOP */}
          {/* ================================================= */}

          <div className="hidden lg:block">
            <TopBar
              sidebarOpen={sidebarOpen}
              setSidebarOpen={
                setSidebarOpen
              }
              isMobile={false}
              user={user}
              userRole={userRole}
            />

            <main className="min-h-screen px-7 xl:px-8 pt-[88px] pb-10">
              <div className="w-full max-w-[1440px] mx-auto">
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
                      className="mb-6"
                    >
                      <div className="flex items-center gap-2 font-mono text-[11px] text-[#8A9088] mb-2 uppercase tracking-wide">
                        <span>
                          Dashboard
                        </span>

                        <ChevronRight className="w-3 h-3 text-[#B9BEB2]" />

                        <span className="text-[#6B7268]">
                          {pageInfo.section}
                        </span>
                      </div>

                      <div className="flex items-end justify-between gap-5">
                        <div>
                          <h1 className="text-2xl font-semibold tracking-tight text-[#12203B]">
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
                            className="mt-3 h-[2px] bg-[#B98A3E]"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                {children}
              </div>
            </main>

            {/* DESKTOP FOOTER */}
            <footer className="border-t border-[#DADCD3] bg-white">
              <div className="max-w-[1440px] mx-auto px-7 xl:px-8 py-5">
                <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                  <p className="font-mono text-xs text-[#8A9088]">
                    © 2026 Selfless CE
                    Organization
                  </p>

                  <div className="flex items-center gap-5 text-xs text-[#8A9088]">
                    {[
                      'About',
                      'FAQ',
                      'Contact',
                      'Privacy',
                      'Terms',
                    ].map(
                      (label) => (
                        <button
                          key={label}
                          type="button"
                          className="hover:text-[#12203B] transition-colors duration-200"
                        >
                          {label}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </footer>
          </div>

          {/* ================================================= */}
          {/* MOBILE */}
          {/* ================================================= */}

          <div className="lg:hidden min-h-screen flex flex-col">
            <TopBar
              sidebarOpen={sidebarOpen}
              setSidebarOpen={
                setSidebarOpen
              }
              isMobile
              onMenuToggle={
                toggleMobileMenu
              }
              user={user}
              userRole={userRole}
            />

            <main
              className={cn(
                'flex-1 w-full px-4 sm:px-5',
                'pb-6 [overflow-x:clip]',
                isAiPage
                  ? 'pt-20'
                  : 'pt-[84px]'
              )}
            >
              <div className="w-full max-w-7xl mx-auto">
                {pathname !==
                  '/dashboard' &&
                  !isAiPage && (
                    <motion.div
                      key={pathname}
                      initial={{
                        opacity: 0,
                        y: 7,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        duration: 0.25,
                      }}
                      className="mb-5"
                    >
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#8A9088] mb-1.5 uppercase tracking-wide">
                        <span>
                          Dashboard
                        </span>

                        <ChevronRight className="w-3 h-3 text-[#B9BEB2]" />

                        <span>
                          {
                            pageInfo.section
                          }
                        </span>
                      </div>

                      <h1 className="text-xl font-semibold tracking-tight text-[#12203B]">
                        {pageInfo.title}
                      </h1>

                      <motion.div
                        initial={{
                          width: 0,
                        }}
                        animate={{
                          width: 28,
                        }}
                        transition={{
                          duration: 0.3,
                        }}
                        className="mt-2 h-[2px] bg-[#B98A3E]"
                      />
                    </motion.div>
                  )}

                {children}
              </div>
            </main>

            <footer className="border-t border-[#DADCD3] bg-white">
              <div className="px-4 py-4">
                <div className="flex flex-col items-center gap-3 font-mono text-[10px] text-[#8A9088]">
                  <p>
                    © 2026 Selfless CE
                    Organization
                  </p>

                  <div className="flex flex-wrap justify-center gap-4">
                    {[
                      'About',
                      'FAQ',
                      'Contact',
                      'Privacy',
                      'Terms',
                    ].map(
                      (label) => (
                        <button
                          key={label}
                          type="button"
                          className="hover:text-[#12203B] transition-colors duration-200"
                        >
                          {label}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </div>

        {/* ================================================== */}
        {/* MOBILE NAVIGATION */}
        {/* ================================================== */}

        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* OVERLAY */}
              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                transition={{
                  duration: 0.2,
                }}
                className="fixed inset-0 z-[9998] lg:hidden bg-[#12203B]/45 backdrop-blur-[2px]"
                onClick={() =>
                  setMobileMenuOpen(
                    false
                  )
                }
                aria-hidden="true"
              />

              {/* DRAWER */}
              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={
                  mobileMenuVariants
                }
                className="fixed inset-y-0 left-0 w-[88%] max-w-[330px] z-[9999] lg:hidden shadow-[12px_0_40px_rgba(18,32,59,0.18)]"
              >
                <Sidebar
                  sidebarOpen
                  pathname={pathname}
                  user={user}
                  userRole={userRole}
                  handleLogout={
                    handleLogout
                  }
                />

                {/* MOBILE CLOSE BUTTON */}
                <motion.button
                  type="button"
                  whileTap={{
                    scale: 0.9,
                  }}
                  onClick={() =>
                    setMobileMenuOpen(
                      false
                    )
                  }
                  aria-label="Close navigation"
                  className="absolute top-3 right-[-46px] w-9 h-9 flex items-center justify-center bg-white border border-[#DADCD3] text-[#6B7268] shadow-lg rounded-lg"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

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
            className="fixed bottom-5 right-5 z-40"
          >
            <Link
              href="/dashboard/ai"
              aria-label="Open Atbriz AI"
              className={cn(
                'group flex items-center gap-2',
                'bg-white',
                'border border-[#DADCD3]',
                'px-3 py-2 rounded-lg',
                'shadow-[0_4px_12px_rgba(18,32,59,0.10)]',
                'hover:border-[#B98A3E]',
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
                    className="w-[30px] h-[30px] object-cover border border-[#DADCD3] rounded"
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
                <p className="text-[11px] font-semibold text-[#12203B]">
                  Atbriz AI
                </p>

                <p className="text-[9px] font-mono text-[#8A9088] uppercase tracking-wide">
                  Assistant
                </p>
              </div>

              <ArrowUpRight className="w-3 h-3 text-[#B9BEB2] group-hover:text-[#B98A3E] transition-colors duration-200" />
            </Link>
          </motion.div>
        )}
      </div>
    </>
  );
}