'use client';

import {
  useMemo,
  useState,
  type ReactNode,
  useRef,
  useEffect,
} from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Megaphone,
  FileText,
  Shield,
  UserCog,
  School,
  Briefcase,
  Award,
  Trophy,
  Building2,
  HeartHandshake,
  Database,
  Key,
  DollarSign,
  Calendar,
  GraduationCap,
  ArrowUpRight,
  Radio,
  BookMarked,
  BookOpen,
  BarChart3,
  Code,
  MessageSquare,
  Images,
  LifeBuoy,
  User,
  Home,
  LogOut,
  ChevronDown,
  ChevronRight,
  Search,
  X,
  Settings,
  Mail,
  Bell,
  Check,
} from 'lucide-react';

import {
  useUnreadNotificationCount,
  useAnnouncementCount,
} from '@/hooks/useNotifications';

// ============================================================
// CONSTANTS
// ============================================================

const SIDEBAR_WIDTH_EXPANDED = 240;
const SIDEBAR_WIDTH_COLLAPSED = 64;
const TOPBAR_HEIGHT = 56;

const iconClass = 'w-[18px] h-[18px] flex-shrink-0';

const ALL_ROLES = ['student', 'teacher', 'admin', 'dev', 'super_admin'];
const NON_SUPER_ADMIN_ROLES = ['student', 'teacher', 'admin', 'dev'];
const FOOTBALL_TEAM_ROLES = [...NON_SUPER_ADMIN_ROLES, 'super_admin'];
const NON_DEV_ADMIN_ROLES = ['student', 'teacher', 'admin'];

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

interface SidebarProps {
  sidebarOpen: boolean;
  pathname: string;
  user: UserInfo | null;
  userRole: string;
  handleLogout: () => void | Promise<void>;
  isMobile?: boolean;
  setSidebarOpen?: (open: boolean) => void;
  mounted?: boolean;
}

// ============================================================
// NAVIGATION DATA
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
        id: 'connections',
        label: 'Connections',
        path: '/dashboard/connections',
        icon: <User className={iconClass} />,
        roles: ALL_ROLES,
      },
      {
        id: 'atbriz-ai',
        label: 'Atbriz AI',
        path: '/dashboard/ai',
        icon: (
          <Image
            src="/atbriz.png"
            alt=""
            width={18}
            height={18}
            className="h-[18px] w-[18px] shrink-0 rounded object-cover"
          />
        ),
        roles: ALL_ROLES,
      },
      {
        id: 'english-hub',
        label: 'English Hub',
        path: '/dashboard/english-hub',
        icon: <BookOpen className={iconClass} />,
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
        id: 'course-units',
        label: 'Course Units',
        path: '/dashboard/course-units',
        icon: <BookMarked className={iconClass} />,
        roles: ['student', 'teacher', 'dev'],
      },
      {
        id: 'grades',
        label: 'My Grades',
        path: '/dashboard/grades',
        icon: <BarChart3 className={iconClass} />,
        roles: ['student', 'teacher', 'admin', 'dev'],
      },
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
      {
        id: 'gallery',
        label: 'Posts',
        path: '/dashboard/gallery',
        icon: <Images className={iconClass} />,
        roles: ALL_ROLES,
      },
      {
        id: 'media-approvals',
        label: 'Media Approvals',
        path: '/dashboard/media-approvals',
        icon: <Check className={iconClass} />,
        roles: ['dev', 'super_admin'],
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
        label: 'Sports',
        path: '/dashboard/football-team',
        icon: <Trophy className={iconClass} />,
        roles: FOOTBALL_TEAM_ROLES,
      },
    ],
  },

  {
    id: 'campus',
    label: 'Campus',
    items: [
      {
        id: 'cleaning',
        label: 'Cleaning Rota',
        path: '/dashboard/cleaning',
        icon: <Calendar className={iconClass} />,
        roles: NON_DEV_ADMIN_ROLES,
      },
    ],
  },

  {
    id: 'communication',
    label: 'Communication',
    items: [
      {
        id: 'chat',
        label: 'Chat',
        path: '/dashboard/messages',
        icon: <MessageSquare className={iconClass} />,
        roles: ALL_ROLES,
      },
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
        roles: ALL_ROLES,
      },
    ],
  },

  {
    id: 'information',
    label: 'Information',
    items: [
      {
        id: 'policy-book',
        label: 'Policy Book',
        path: '/dashboard/policies',
        icon: <BookMarked className={iconClass} />,
        roles: ALL_ROLES,
      },
      {
        id: 'it-support',
        label: 'Meet IT Support Team',
        path: '/dashboard/support',
        icon: <LifeBuoy className={iconClass} />,
        roles: ALL_ROLES,
      },
    ],
  },
];

const adminNavigation: NavSection = {
  id: 'administration',
  label: 'Administration',
  items: [
    { id: 'admin-dashboard', label: 'Admin', path: '/dashboard/admin', icon: <Shield className={iconClass} />, roles: ['admin'] },
    { id: 'manage-users', label: 'Users', path: '/dashboard/admin/users', icon: <Users className={iconClass} />, roles: ['admin'] },
    { id: 'manage-teachers', label: 'Tutors', path: '/dashboard/admin/teachers', icon: <UserCog className={iconClass} />, roles: ['admin'] },
    { id: 'assign-grades', label: 'Assign Grades', path: '/dashboard/teacher/grades', icon: <Award className={iconClass} />, roles: ['admin'] },
    { id: 'manage-tuition', label: 'Tuition', path: '/dashboard/admin/tuition', icon: <DollarSign className={iconClass} />, roles: ['admin'] },
    { id: 'manage-tech-centers', label: 'Tech Center', path: '/dashboard/admin/tech-centers', icon: <School className={iconClass} />, roles: ['admin'] },
    { id: 'course-units', label: 'Course Units', path: '/dashboard/course-units', icon: <BookMarked className={iconClass} />, roles: ['admin'] },
    { id: 'manage-cleaning', label: 'Cleaning Management', path: '/dashboard/admin/cleaning', icon: <Calendar className={iconClass} />, roles: ['admin'] },
  ],
};

const teacherNavigation: NavSection = {
  id: 'teaching',
  label: 'Tutoring',
  items: [
    { id: 'teacher-dashboard', label: 'Tutors', path: '/dashboard/admin/teachers', icon: <Briefcase className={iconClass} />, roles: ['teacher'] },
    { id: 'assign-grades', label: 'Assign Grades', path: '/dashboard/teacher/grades', icon: <Award className={iconClass} />, roles: ['teacher'] },
    { id: 'manage-tuition', label: 'Tuition', path: '/dashboard/admin/tuition', icon: <DollarSign className={iconClass} />, roles: ['teacher'] },
    { id: 'attendance', label: 'Attendance', path: '/dashboard/cleaning', icon: <Calendar className={iconClass} />, roles: ['teacher'] },
  ],
};

const superAdminNavigation: NavSection = {
  id: 'system',
  label: 'System',
  items: [
    { id: 'manage-grades', label: 'Manage Grades', path: '/dashboard/manage-grades', icon: <Award className={iconClass} />, roles: ['dev', 'super_admin'] },
    { id: 'course-units', label: 'Course Units', path: '/dashboard/course-units', icon: <BookMarked className={iconClass} />, roles: ['super_admin'] },
    { id: 'super-admin-dashboard', label: 'Overview', path: '/dashboard/super-admin', icon: <Shield className={iconClass} />, roles: ['super_admin'] },
    { id: 'trivia-tracking', label: 'Trivia Tracking', path: '/dashboard/admin/trivia', icon: <Trophy className={iconClass} />, roles: ['dev', 'super_admin'] },
    { id: 'english-class', label: 'English Class', path: '/dashboard/dev/english-hub', icon: <BookOpen className={iconClass} />, roles: ['dev', 'super_admin'] },
    { id: 'cleaning-management', label: 'Cleaning Management', path: '/dashboard/dev/cleaning', icon: <Settings className={iconClass} />, roles: ['super_admin'] },
    { id: 'all-centers', label: 'Tech Centers', path: '/dashboard/super-admin/centers', icon: <School className={iconClass} />, roles: ['super_admin'] },
    { id: 'all-users', label: 'Users', path: '/dashboard/super-admin/users', icon: <Users className={iconClass} />, roles: ['super_admin'] },
    { id: 'email-settings', label: 'Send Emails', path: '/dashboard/super-admin/email', icon: <Mail className={iconClass} />, roles: ['super_admin'] },
  ],
};

const devNavigation: NavSection = {
  id: 'developers',
  label: 'Developers',
  items: [
    { id: 'dev-dashboard', label: 'Dev Dashboard', path: '/dashboard/dev', icon: <Code className={iconClass} />, roles: ['dev'] },
    { id: 'dev-cleaning', label: 'Cleaning Management', path: '/dashboard/dev/cleaning', icon: <Settings className={iconClass} />, roles: ['dev', 'super_admin'] },
    { id: 'super-admin-overview', label: 'System Overview', path: '/dashboard/super-admin', icon: <Shield className={iconClass} />, roles: ['dev'] },
    { id: 'trivia-tracking', label: 'Trivia Tracking', path: '/dashboard/admin/trivia', icon: <Trophy className={iconClass} />, roles: ['dev', 'super_admin'] },
    { id: 'email-settings', label: 'Send Emails', path: '/dashboard/super-admin/email', icon: <Mail className={iconClass} />, roles: ['dev'] },
    { id: 'all-centers', label: 'Tech Centers', path: '/dashboard/super-admin/centers', icon: <School className={iconClass} />, roles: ['dev'] },
    { id: 'all-users', label: 'Users', path: '/dashboard/super-admin/users', icon: <Users className={iconClass} />, roles: ['dev'] },
    { id: 'password-resets', label: 'Password Resets', path: '/dashboard/dev/password-resets', icon: <Key className={iconClass} />, roles: ['dev'] },
    { id: 'knowledge-base', label: 'Knowledge Base', path: '/dashboard/dev/knowledge-base', icon: <Database className={iconClass} />, roles: ['dev'] },
    { id: 'activity-logs', label: 'Activity Logs', path: '/dashboard/dev/logs', icon: <FileText className={iconClass} />, roles: ['dev'] },
  ],
};

const accountNavigation: NavSection = {
  id: 'account',
  label: 'Account',
  items: [
    { id: 'profile', label: 'My Profile', path: '/dashboard/profile', icon: <User className={iconClass} />, roles: ALL_ROLES },
  ],
};

// ============================================================
// HELPERS
// ============================================================

function getNavigation(userRole: string): NavSection[] {
  const navigation: NavSection[] = sharedNavigation.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.roles.includes(userRole)),
  }));

  if (userRole === 'admin') {
    navigation.push({
      ...adminNavigation,
      items: adminNavigation.items.filter((item) => item.roles.includes(userRole)),
    });
  }

  if (userRole === 'teacher') {
    navigation.push({
      ...teacherNavigation,
      items: teacherNavigation.items.filter((item) => item.roles.includes(userRole)),
    });
  }

  if (userRole === 'dev') {
    navigation.push({
      ...devNavigation,
      items: devNavigation.items.filter((item) => item.roles.includes(userRole)),
    });
    navigation.push({
      ...superAdminNavigation,
      items: superAdminNavigation.items.filter((item) => item.roles.includes(userRole)),
    });
  }

  if (userRole === 'super_admin') {
    navigation.push({
      ...superAdminNavigation,
      items: superAdminNavigation.items.filter((item) => item.roles.includes(userRole)),
    });
  }

  navigation.push({
    ...accountNavigation,
    items: accountNavigation.items.filter((item) => item.roles.includes(userRole)),
  });

  return navigation.filter((section) => section.items.length > 0);
}

function isPathActive(pathname: string, path: string) {
  if (path === '/dashboard') {
    return pathname === '/dashboard';
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}

function getInitials(user: UserInfo | null) {
  const first = user?.firstName?.charAt(0).toUpperCase() || '';
  const last = user?.lastName?.charAt(0).toUpperCase() || '';
  return `${first}${last}` || 'U';
}

function formatRole(role: string) {
  const formatted = role
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  if (formatted === 'Admin') return 'Manager';
  if (formatted === 'Super Admin' || formatted === 'Superadmin') return 'Director';

  return formatted;
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
  isMobile?: boolean;
  sidebarOpen?: boolean;
  onNavigate?: () => void;
}

function NavigationItem({
  item,
  pathname,
  collapsed = false,
  unreadCount,
  announcementCount,
  index = 0,
  isMobile = false,
  sidebarOpen = false,
  onNavigate,
}: NavigationItemProps) {
  const active = isPathActive(pathname, item.path);

  const badge =
    item.id === 'notifications'
      ? unreadCount
      : item.id === 'announcements'
        ? announcementCount
        : undefined;

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -6 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.18, delay: Math.min(index * 0.02, 0.15) },
    },
  };

  const handleClick = () => {
    if (isMobile && sidebarOpen) {
      onNavigate?.();
    }
  };

  if (collapsed) {
    return (
      <motion.div variants={itemVariants} initial="hidden" animate="visible">
        <Link
          href={item.path}
          aria-label={item.label}
          onClick={handleClick}
          className={cn(
            'relative group flex items-center justify-center',
            'w-full h-11 rounded-md',
            'transition-colors duration-150',
            active
              ? 'bg-[#FBF7EE] text-[#C59B4C]'
              : 'text-[#1A2B4C] hover:text-[#C59B4C] hover:bg-[#F8F9FA]',
          )}
        >
          {active && (
            <motion.span
              layoutId="sidebar-active-indicator"
              className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r bg-[#C59B4C]"
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            />
          )}

          <motion.span
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            className="flex"
          >
            {item.icon}
          </motion.span>

          {badge && badge > 0 ? (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-1 top-1 flex h-3.5 min-w-[14px] items-center justify-center rounded-full border border-white bg-[#C59B4C] px-1 text-[8px] font-semibold leading-none text-white"
            >
              {badge > 9 ? '9+' : badge}
            </motion.span>
          ) : null}

          <span
            className={cn(
              'absolute left-full top-1/2 ml-2 -translate-y-1/2',
              'whitespace-nowrap rounded-md',
              'bg-[#1A2B4C] px-2.5 py-1.5 text-[11.5px] font-medium text-white',
              'shadow-lg',
              'pointer-events-none opacity-0 invisible',
              'translate-x-0 group-hover:translate-x-0.5 group-hover:opacity-100 group-hover:visible',
              'transition-all duration-150',
              'z-[300]',
            )}
          >
            {item.label}
          </span>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div variants={itemVariants} initial="hidden" animate="visible">
      <Link
        href={item.path}
        onClick={handleClick}
        className={cn(
          'relative group flex items-center gap-2.5',
          'w-full min-h-10 px-2.5 rounded-md',
          'text-[13px]',
          'transition-colors duration-150',
          active
            ? 'bg-[#FBF7EE] text-[#1A2B4C] font-semibold'
            : 'text-[#4B5646] font-medium hover:text-[#1A2B4C] hover:bg-[#F8F9FA]',
        )}
      >
        {active && (
          <motion.span
            layoutId="sidebar-active-indicator"
            className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r bg-[#C59B4C]"
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
          />
        )}

        <motion.span
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          className={cn(
            'flex items-center justify-center transition-colors duration-150',
            active ? 'text-[#C59B4C]' : 'text-[#4B5646] group-hover:text-[#1A2B4C]',
          )}
        >
          {item.icon}
        </motion.span>

        <span className="min-w-0 flex-1 truncate font-medium">
          {item.label}
        </span>

        {badge && badge > 0 ? (
          <motion.span
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              'ml-auto flex h-4.5 min-w-[18px] items-center justify-center rounded-full px-1.5',
              'text-[9.5px] font-semibold leading-none text-white',
              'bg-[#C59B4C]',
            )}
          >
            {badge > 99 ? '99+' : badge}
          </motion.span>
        ) : null}

        <ArrowUpRight
          className={cn(
            'ml-auto h-3 w-3 shrink-0',
            'text-[#C59B4C]',
            'opacity-0 -translate-x-0.5',
            'group-hover:opacity-100 group-hover:translate-x-0',
            'transition-all duration-150',
            badge || item.id === 'tutors' ? 'hidden' : '',
          )}
        />
      </Link>
    </motion.div>
  );
}

// ============================================================
// SIDEBAR COMPONENT
// ============================================================

export default function Sidebar({
  sidebarOpen,
  pathname,
  user,
  userRole,
  handleLogout,
  isMobile = false,
  setSidebarOpen,
  mounted = false,
}: SidebarProps) {
  const navigation = useMemo(() => getNavigation(userRole), [userRole]);

  const [expandedSections, setExpandedSections] = useState<string[]>(
    navigation.map((section) => section.id),
  );

  const [searchQuery, setSearchQuery] = useState('');

  const { data: unreadCount } = useUnreadNotificationCount();
  const { data: announcementCount } = useAnnouncementCount();

  const searchInputRef = useRef<HTMLInputElement>(null);

  const closeSidebarOnMobile = () => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen?.(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((previous) =>
      previous.includes(sectionId)
        ? previous.filter((id) => id !== sectionId)
        : [...previous, sectionId],
    );
  };

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return navigation;

    return navigation
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.label.toLowerCase().includes(query) ||
            item.id.toLowerCase().includes(query) ||
            section.label.toLowerCase().includes(query),
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [navigation, searchQuery]);

  const searchActive = searchQuery.trim().length > 0;

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

  // Fixed: toggle now actually toggles state (was a no-op before).
  const toggleSidebar = () => {
    setSidebarOpen?.(!sidebarOpen);
  };

  return (
    <>
      <motion.aside
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          width: mounted
            ? isMobile
              ? SIDEBAR_WIDTH_EXPANDED
              : sidebarOpen
                ? SIDEBAR_WIDTH_EXPANDED
                : SIDEBAR_WIDTH_COLLAPSED
            : SIDEBAR_WIDTH_EXPANDED,
        }}
        className={cn(
          'h-screen bg-white',
          'flex flex-col overflow-hidden',
          'border-r border-[#E5E7EB]',
          'shadow-[0_2px_12px_rgba(26,43,76,0.06)]',
          'transition-[width,transform] duration-300 ease-out',
          'fixed left-0 top-0 z-[100]',
          mounted
            ? isMobile
              ? sidebarOpen
                ? 'translate-x-0'
                : '-translate-x-full'
              : 'translate-x-0'
            : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* BRAND */}
        <div
          style={{ height: TOPBAR_HEIGHT }}
          className={cn(
            'flex-shrink-0',
            'flex items-center',
            'relative overflow-hidden',
            'border-b border-[#F3F4F6]',
            sidebarOpen ? 'px-3' : 'justify-center',
          )}
        >
          <Link
            href="/dashboard"
            onClick={() => isMobile && sidebarOpen && setSidebarOpen?.(false)}
            className="group relative flex min-w-0 items-center gap-2.5"
            aria-label="Selfless Dashboard"
          >
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#C59B4C] shadow-sm"
            >
              <Image
                src="/freedom.png"
                alt="Selfless Logo"
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            </motion.div>

            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className="min-w-0 flex-1"
              >
                <p className="text-[12.5px] font-semibold leading-tight text-[#1A2B4C]">
                  Selfless
                </p>
                <p className="text-[10px] leading-tight text-[#9CA3AF]">
                  Nurturing Resilient Minds
                </p>
              </motion.div>
            )}
          </Link>

          {!isMobile && sidebarOpen && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={toggleSidebar}
              className="ml-auto rounded p-1 text-[#9CA3AF] transition-colors hover:bg-[#F8F9FA] hover:text-[#1A2B4C]"
              aria-label="Collapse sidebar"
            >
              <ChevronDown className="h-3.5 w-3.5 rotate-90" />
            </motion.button>
          )}
        </div>

        {/* SCROLLABLE CONTENT */}
        <div
          className={cn(
            'flex-1 overflow-y-auto overflow-x-hidden',
            'sidebar-scroll',
          )}
        >
          {/* SEARCH */}
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="px-2 pt-1 pb-1.5"
            >
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />

                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search navigation..."
                  aria-label="Search navigation"
                  className={cn(
                    'h-8 w-full rounded-md border border-transparent pl-8 pr-14',
                    'bg-[#F8F9FA]',
                    'text-[12px] text-[#1A2B4C]',
                    'placeholder:text-[#9CA3AF]',
                    'outline-none transition-colors',
                    'focus:border-[#C59B4C] focus:bg-white',
                    'focus:ring-2 focus:ring-[#C59B4C]/15',
                  )}
                />

                {!searchQuery && (
                  <span className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded border border-[#E5E7EB] bg-white px-1 py-0.5 text-[9px] font-semibold text-[#9CA3AF] md:flex">
                    ⌘K
                  </span>
                )}

                {searchQuery && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-[#9CA3AF] transition-colors hover:text-[#1A2B4C]"
                    aria-label="Clear navigation search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}

          {/* NAVIGATION */}
          <nav
            className={cn('py-1.5', sidebarOpen ? 'px-1.5' : 'px-1')}
            aria-label="Dashboard navigation"
          >
            {/* COLLAPSED */}
            {!sidebarOpen && (
              <div className="space-y-0.5">
                {searchResults.flatMap((section) =>
                  section.items.map((item, index) => (
                    <NavigationItem
                      key={`${section.id}-${item.id}`}
                      item={item}
                      pathname={pathname}
                      collapsed
                      index={index}
                      unreadCount={unreadCount || undefined}
                      announcementCount={announcementCount || undefined}
                      isMobile={isMobile}
                      sidebarOpen={sidebarOpen}
                      onNavigate={closeSidebarOnMobile}
                    />
                  )),
                )}
              </div>
            )}

            {/* EXPANDED */}
            {sidebarOpen && (
              <div className="space-y-1.5">
                {searchResults.map((section) => {
                  const expanded =
                    searchActive || expandedSections.includes(section.id);

                  return (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.18 }}
                    >
                      {/* SECTION HEADING */}
                      <button
                        type="button"
                        onClick={() => toggleSection(section.id)}
                        className={cn(
                          'mb-0.5 flex w-full items-center gap-1.5 rounded-md px-2 py-1',
                          'text-[10px] font-semibold uppercase tracking-[0.1em]',
                          'text-[#9CA3AF]',
                          'transition-colors duration-150 hover:text-[#4B5646]',
                        )}
                        aria-expanded={expanded}
                      >
                        <span>{section.label}</span>

                        <motion.span
                          animate={{ rotate: expanded ? 180 : 0 }}
                          transition={{ duration: 0.15 }}
                          className="ml-auto flex"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </motion.span>
                      </button>

                      {/* ITEMS */}
                      <AnimatePresence initial={false}>
                        {expanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="space-y-0.5 overflow-hidden"
                          >
                            {section.items.map((item, index) => (
                              <NavigationItem
                                key={item.id}
                                item={item}
                                pathname={pathname}
                                index={index}
                                unreadCount={unreadCount || undefined}
                                announcementCount={announcementCount || undefined}
                                isMobile={isMobile}
                                sidebarOpen={sidebarOpen}
                                onNavigate={closeSidebarOnMobile}
                              />
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}

                {searchActive && searchResults.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-3 py-8 text-center"
                  >
                    <Search className="mx-auto mb-2 h-5 w-5 text-[#D1D5DB]" />
                    <p className="text-[12px] text-[#6B7280]">No pages found</p>
                  </motion.div>
                )}
              </div>
            )}

            {/* BACK TO HOME */}
            <div className="mt-2 border-t border-[#F3F4F6] pt-2">
              <Link
                href="/"
                aria-label="Back to Home"
                onClick={closeSidebarOnMobile}
                className={cn(
                  'group relative flex h-10 w-full items-center gap-2.5 rounded-md px-2.5',
                  'text-[12.5px] font-medium text-[#6B7280]',
                  'transition-colors duration-150 hover:bg-[#F8F9FA] hover:text-[#1A2B4C]',
                  !sidebarOpen && 'justify-center px-0',
                )}
              >
                <Home className="h-[18px] w-[18px] flex-shrink-0" />

                {sidebarOpen && <span>Back to Home</span>}

                {!sidebarOpen && (
                  <span className="pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#1A2B4C] px-2.5 py-1.5 text-[11.5px] font-medium text-white opacity-0 shadow-lg transition-all duration-150 group-hover:opacity-100 group-hover:visible invisible z-[300]">
                    Back to Home
                  </span>
                )}
              </Link>

              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className={cn(
                  'group relative mt-0.5 flex h-10 w-full items-center gap-2.5 rounded-md px-2.5',
                  'text-[12.5px] font-medium text-[#6B7280]',
                  'transition-colors duration-150 hover:bg-[#FBEDE8] hover:text-[#A4462F]',
                  !sidebarOpen && 'justify-center px-0',
                )}
              >
                <LogOut className="h-[18px] w-[18px] flex-shrink-0" />

                {sidebarOpen && <span>Logout</span>}

                {!sidebarOpen && (
                  <span className="pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#1A2B4C] px-2.5 py-1.5 text-[11.5px] font-medium text-white opacity-0 shadow-lg transition-all duration-150 group-hover:opacity-100 group-hover:visible invisible z-[300]">
                    Logout
                  </span>
                )}
              </motion.button>
            </div>

            <div className="h-2" />
          </nav>
        </div>

        {/* SIDEBAR USER */}
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className="flex-shrink-0 border-t border-[#F3F4F6] px-1.5 py-1.5"
          >
            <Link
              href="/dashboard/profile"
              onClick={closeSidebarOnMobile}
              className="group flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-[#F8F9FA]"
            >
              {user?.profileImageUrl ? (
                <Image
                  src={user.profileImageUrl}
                  alt={`${user?.firstName || ''} ${user?.lastName || ''}`}
                  width={28}
                  height={28}
                  unoptimized
                  className="h-7 w-7 rounded-full border border-[#C59B4C] object-cover"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C59B4C] text-[10.5px] font-semibold text-white">
                  {getInitials(user)}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-[11.5px] font-semibold text-[#1A2B4C]">
                  {user?.firstName} {user?.lastName}
                </p>

                <div className="mt-0.5 flex items-center gap-1">
                  <span className="h-1 w-1 rounded-full bg-[#55705B]" />
                  <p className="truncate text-[9.5px] font-medium uppercase tracking-[0.06em] text-[#9CA3AF]">
                    {formatRole(userRole)}
                  </p>
                </div>
              </div>

              <ChevronRight className="h-3 w-3 shrink-0 text-[#D1D5DB] transition-colors group-hover:text-[#C59B4C]" />
            </Link>
          </motion.div>
        )}
      </motion.aside>

      <style jsx>{`
        .sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: #e5e7eb transparent;
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
          background-color: #e5e7eb;
          border-radius: 999px;
          border: 1px solid transparent;
          background-clip: padding-box;
        }

        .sidebar-scroll:hover::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          background-clip: padding-box;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #9ca3af;
          background-clip: padding-box;
        }
      `}</style>
    </>
  );
}