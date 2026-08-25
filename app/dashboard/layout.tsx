// app/dashboard/layout.tsx
'use client';

import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
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
  GraduationCap,
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
} from 'lucide-react';

import {
  useUnreadNotificationCount,
  useAnnouncementCount,
} from '@/hooks/useNotifications';

// ============================================================
// DESIGN TOKENS
// ============================================================
//
// Background:
//   Page       #F8FAFC
//   Surface    #FFFFFF
//
// Borders:
//   #E5E7EB
//
// Text:
//   Heading    #111827
//   Body       #374151
//   Muted      #6B7280
//   Subtle     #9CA3AF
//
// Primary:
//   Blue       #2563EB
//   Blue tint  #EFF6FF
//
// Status:
//   Success    #16A34A
//   Danger     #DC2626
//   Warning    #D97706
//
// The design intentionally avoids:
//   - gradients
//   - excessive rounded cards
//   - glow effects
//   - excessive animations
//   - oversized navigation
//
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

const ALL_ROLES = ['student', 'teacher', 'admin', 'super_admin'];

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
        roles: ALL_ROLES,
      },
      {
        id: 'grades',
        label: 'Grades',
        path: '/dashboard/grades',
        icon: <BarChart3 className={iconClass} />,
        roles: ALL_ROLES,
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
      {
        id: 'my-applications',
        label: 'Applications',
        path: '/dashboard/internships/applications',
        icon: <ClipboardList className={iconClass} />,
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
        roles: ALL_ROLES,
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
        roles: ALL_ROLES,
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
        roles: ALL_ROLES,
      },
    ],
  },
];

// ============================================================
// ROLE-SPECIFIC NAVIGATION
// ============================================================

const adminNavigation: NavSection = {
  id: 'administration',
  label: 'Administration',
  items: [
    {
      id: 'admin-dashboard',
      label: 'Overview',
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
      label: 'Teachers',
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

const teacherNavigation: NavSection = {
  id: 'teaching',
  label: 'Teaching',
  items: [
    {
      id: 'teacher-dashboard',
      label: 'Overview',
      path: '/dashboard/teacher',
      icon: <Briefcase className={iconClass} />,
      roles: ['teacher'],
    },
    {
      id: 'manage-students',
      label: 'Students',
      path: '/dashboard/teacher/students',
      icon: <Users className={iconClass} />,
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
      // Preserved exactly from the original functionality.
      path: '/dashboard/cleaning',
      icon: <Clock className={iconClass} />,
      roles: ['teacher'],
    },
  ],
};

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
    {
      id: 'all-users',
      label: 'Users',
      path: '/dashboard/super-admin/users',
      icon: <Users className={iconClass} />,
      roles: ['super_admin'],
    },
    {
      id: 'password-resets',
      label: 'Password Resets',
      path: '/dashboard/super-admin/password-resets',
      icon: <Key className={iconClass} />,
      roles: ['super_admin'],
    },
    {
      id: 'knowledge-base',
      label: 'Knowledge Base',
      path: '/dashboard/super-admin/knowledge-base',
      icon: <Database className={iconClass} />,
      roles: ['super_admin'],
    },
    {
      id: 'activity-logs',
      label: 'Activity Logs',
      path: '/dashboard/super-admin/logs',
      icon: <FileText className={iconClass} />,
      roles: ['super_admin'],
    },
    {
      id: 'system-settings',
      label: 'System Settings',
      path: '/dashboard/super-admin/settings',
      icon: <Settings className={iconClass} />,
      roles: ['super_admin'],
    },
  ],
};

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
    items: section.items.filter((item) => item.roles.includes(userRole)),
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

  return navigation.filter((section) => section.items.length > 0);
}

// ============================================================
// HELPERS
// ============================================================

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
  return role
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getPageInfo(pathname: string) {
  const pages: Record<string, { title: string; section?: string }> = {
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
    '/dashboard/internships': {
      title: 'Internships',
      section: 'Opportunities',
    },
    '/dashboard/internships/applications': {
      title: 'Applications',
      section: 'Opportunities',
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
    '/dashboard/admin/teachers': {
      title: 'Teachers',
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
      title: 'Teaching Overview',
      section: 'Teaching',
    },
    '/dashboard/teacher/students': {
      title: 'Students',
      section: 'Teaching',
    },
    '/dashboard/teacher/grades': {
      title: 'Grades',
      section: 'Teaching',
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
    '/dashboard/super-admin/password-resets': {
      title: 'Password Resets',
      section: 'System',
    },
    '/dashboard/super-admin/knowledge-base': {
      title: 'Knowledge Base',
      section: 'System',
    },
    '/dashboard/super-admin/logs': {
      title: 'Activity Logs',
      section: 'System',
    },
    '/dashboard/super-admin/settings': {
      title: 'System Settings',
      section: 'System',
    },
  };

  if (pages[pathname]) {
    return pages[pathname];
  }

  const matchedPath = Object.keys(pages)
    .filter((path) => path !== '/dashboard')
    .sort((a, b) => b.length - a.length)
    .find((path) => pathname.startsWith(`${path}/`));

  return matchedPath
    ? pages[matchedPath]
    : {
        title: 'Dashboard',
        section: 'Workspace',
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
  const [scrolled, setScrolled] = useState(false);

  const { data: unreadCount } = useUnreadNotificationCount();
  const { data: announcementCount } = useAnnouncementCount();

  const pathname = usePathname();
  const pageInfo = getPageInfo(pathname);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 h-16 bg-white border-b border-[#E5E7EB]',
        'transition-shadow duration-200',
        isMobile
          ? 'left-0'
          : sidebarOpen
            ? 'left-0 lg:left-64'
            : 'left-0 lg:left-[72px]',
        scrolled && 'shadow-[0_1px_8px_rgba(15,23,42,0.05)]'
      )}
    >
      <div className="h-full flex items-center justify-between px-4 sm:px-6 lg:px-7">
        {/* Left side */}
        <div className="flex items-center min-w-0">
          <button
            type="button"
            onClick={
              isMobile
                ? onMenuToggle
                : () => setSidebarOpen((previous) => !previous)
            }
            className={cn(
              'flex items-center justify-center w-9 h-9 rounded-md',
              'text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]',
              'transition-colors duration-150'
            )}
            aria-label={isMobile ? 'Open navigation' : 'Toggle sidebar'}
          >
            {isMobile ? (
              <Menu className="w-5 h-5" />
            ) : sidebarOpen ? (
              <PanelLeftClose className="w-5 h-5" />
            ) : (
              <PanelLeftOpen className="w-5 h-5" />
            )}
          </button>

          <div className="ml-3 pl-3 border-l border-[#E5E7EB] min-w-0">
            <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
              {pageInfo.section && (
                <>
                  <span className="hidden sm:inline truncate">
                    {pageInfo.section}
                  </span>
                  <ChevronRight className="hidden sm:block w-3 h-3 text-[#D1D5DB]" />
                </>
              )}
              <span className="text-[#374151] font-medium truncate">
                {pageInfo.title}
              </span>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1 sm:gap-2 ml-3">
          {/* Announcements */}
          <Link
            href="/dashboard/announcements"
            aria-label="Announcements"
            className={cn(
              'relative flex items-center justify-center w-9 h-9 rounded-md',
              'text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]',
              'transition-colors duration-150'
            )}
          >
            <Megaphone className="w-[18px] h-[18px]" />

            {announcementCount && announcementCount > 0 ? (
              <span className="absolute top-1 right-1 min-w-[15px] h-[15px] px-1 rounded-full bg-[#D97706] text-white text-[9px] font-semibold flex items-center justify-center border-2 border-white">
                {announcementCount > 99 ? '99+' : announcementCount}
              </span>
            ) : null}
          </Link>

          {/* Notifications */}
          <Link
            href="/dashboard/notifications"
            aria-label="Notifications"
            className={cn(
              'relative flex items-center justify-center w-9 h-9 rounded-md',
              'text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]',
              'transition-colors duration-150'
            )}
          >
            <Bell className="w-[18px] h-[18px]" />

            {unreadCount && unreadCount > 0 ? (
              <span className="absolute top-1 right-1 min-w-[15px] h-[15px] px-1 rounded-full bg-[#DC2626] text-white text-[9px] font-semibold flex items-center justify-center border-2 border-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            ) : null}
          </Link>

          {/* User */}
          <Link
            href="/dashboard/profile"
            className={cn(
              'ml-1 sm:ml-2 pl-2 sm:pl-3 border-l border-[#E5E7EB]',
              'flex items-center gap-2.5 rounded-md py-1.5 px-1.5',
              'hover:bg-[#F9FAFB] transition-colors duration-150'
            )}
          >
            {user?.profileImageUrl ? (
              <Image
                src={user.profileImageUrl}
                alt={`${user?.firstName || ''} ${user?.lastName || ''}`}
                width={34}
                height={34}
                unoptimized
                className="w-[34px] h-[34px] rounded-full object-cover border border-[#E5E7EB]"
              />
            ) : (
              <div className="w-[34px] h-[34px] rounded-full bg-[#2563EB] flex items-center justify-center text-white text-[11px] font-semibold">
                {getInitials(user)}
              </div>
            )}

            <div className="hidden sm:block min-w-0">
              <p className="text-[#111827] text-sm font-medium leading-tight truncate max-w-[150px]">
                {user?.firstName} {user?.lastName}
              </p>

              <p className="text-[#9CA3AF] text-[11px] leading-tight mt-0.5">
                {formatRole(userRole)}
              </p>
            </div>

            <ChevronDown className="hidden md:block w-3.5 h-3.5 text-[#9CA3AF]" />
          </Link>
        </div>
      </div>
    </header>
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
}

function NavigationItem({
  item,
  pathname,
  collapsed = false,
  unreadCount,
  announcementCount,
}: NavigationItemProps) {
  const active = isPathActive(pathname, item.path);

  const badge =
    item.id === 'notifications'
      ? unreadCount
      : item.id === 'announcements'
        ? announcementCount
        : undefined;

  if (collapsed) {
    return (
      <Link
        href={item.path}
        aria-label={item.label}
        className={cn(
          'relative group flex items-center justify-center w-full h-10 rounded-md',
          'transition-colors duration-150',
          active
            ? 'bg-[#EFF6FF] text-[#2563EB]'
            : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]'
        )}
      >
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#2563EB]" />
        )}

        {item.icon}

        {badge && badge > 0 ? (
          <span className="absolute top-1 right-1 min-w-[14px] h-[14px] px-0.5 rounded-full bg-[#DC2626] text-white text-[8px] font-semibold flex items-center justify-center border border-white">
            {badge > 9 ? '9+' : badge}
          </span>
        ) : null}

        <span
          className={cn(
            'absolute left-full ml-2.5 top-1/2 -translate-y-1/2',
            'whitespace-nowrap bg-[#111827] text-white text-xs font-medium',
            'px-2.5 py-1.5 rounded-md shadow-lg',
            'opacity-0 invisible group-hover:opacity-100 group-hover:visible',
            'transition-all duration-150 pointer-events-none z-[200]'
          )}
        >
          {item.label}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={item.path}
      className={cn(
        'relative flex items-center gap-3 w-full min-h-10 px-3 rounded-md',
        'text-[13px] transition-colors duration-150',
        active
          ? 'bg-[#EFF6FF] text-[#1D4ED8] font-semibold'
          : 'text-[#4B5563] font-medium hover:text-[#111827] hover:bg-[#F3F4F6]'
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#2563EB]" />
      )}

      <span
        className={cn(
          'flex items-center justify-center',
          active ? 'text-[#2563EB]' : 'text-[#6B7280]'
        )}
      >
        {item.icon}
      </span>

      <span className="truncate">{item.label}</span>

      {badge && badge > 0 ? (
        <span
          className={cn(
            'ml-auto min-w-[20px] h-5 px-1.5 rounded-full',
            'flex items-center justify-center',
            'text-[10px] font-semibold text-white',
            item.id === 'notifications'
              ? 'bg-[#DC2626]'
              : 'bg-[#D97706]'
          )}
        >
          {badge > 99 ? '99+' : badge}
        </span>
      ) : null}
    </Link>
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

  const [expandedSections, setExpandedSections] = useState<string[]>(
    navigation.map((section) => section.id)
  );

  const [searchQuery, setSearchQuery] = useState('');

  const { data: unreadCount } = useUnreadNotificationCount();
  const { data: announcementCount } = useAnnouncementCount();

  useEffect(() => {
    setExpandedSections(navigation.map((section) => section.id));
  }, [navigation]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((previous) =>
      previous.includes(sectionId)
        ? previous.filter((id) => id !== sectionId)
        : [...previous, sectionId]
    );
  };

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return navigation;
    }

    return navigation
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.label.toLowerCase().includes(query) ||
            item.id.toLowerCase().includes(query) ||
            section.label.toLowerCase().includes(query)
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [navigation, searchQuery]);

  const searchActive = searchQuery.trim().length > 0;

  return (
    <aside
      className={cn(
        'h-screen bg-white border-r border-[#E5E7EB]',
        'flex flex-col overflow-hidden',
        'transition-[width] duration-200 ease-out',
        sidebarOpen ? 'w-64' : 'w-[72px]'
      )}
    >
      {/* ================================================== */}
      {/* BRAND */}
      {/* ================================================== */}

      <div
        className={cn(
          'h-16 flex-shrink-0 border-b border-[#E5E7EB]',
          'flex items-center',
          sidebarOpen ? 'px-4' : 'justify-center'
        )}
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-3 min-w-0"
          aria-label="Selfless CE Dashboard"
        >
          <div className="w-8 h-8 rounded-md bg-[#111827] flex items-center justify-center overflow-hidden flex-shrink-0">
            <Image
              src="/freedom.png"
              alt="Selfless CE Logo"
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          </div>

          {sidebarOpen && (
            <div className="min-w-0">
              <p className="text-[#111827] font-semibold text-sm leading-tight truncate">
                Selfless CE
              </p>

              <p className="text-[#9CA3AF] text-[10px] leading-tight mt-0.5">
                Student Portal
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* ================================================== */}
      {/* SEARCH */}
      {/* ================================================== */}

      {sidebarOpen && (
        <div className="px-3 pt-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search..."
              aria-label="Search navigation"
              className={cn(
                'w-full h-9 pl-9 pr-8 rounded-md',
                'bg-[#F8FAFC] border border-[#E5E7EB]',
                'text-[13px] text-[#111827]',
                'placeholder:text-[#9CA3AF]',
                'outline-none',
                'focus:bg-white focus:border-[#93C5FD]',
                'transition-colors duration-150'
              )}
            />

            {!searchQuery && (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden xl:flex items-center gap-0.5 text-[9px] text-[#9CA3AF] border border-[#E5E7EB] rounded px-1 py-0.5 bg-white">
                Ctrl K
              </span>
            )}

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#111827]"
                aria-label="Clear navigation search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* NAVIGATION */}
      {/* ================================================== */}

      <nav
        className={cn(
          'sidebar-nav flex-1 overflow-y-auto overflow-x-hidden',
          'py-3',
          sidebarOpen ? 'px-3' : 'px-2'
        )}
        aria-label="Dashboard navigation"
      >
        {/* Back to public site */}
        <div className="mb-3">
          <Link
            href="/"
            className={cn(
              'relative flex items-center gap-3 h-10 px-3 rounded-md',
              'text-[13px] text-[#6B7280] font-medium',
              'hover:text-[#111827] hover:bg-[#F3F4F6]',
              'transition-colors duration-150',
              !sidebarOpen && 'justify-center px-0'
            )}
          >
            <Home className="w-[18px] h-[18px] flex-shrink-0" />

            {sidebarOpen && <span>Back to Home</span>}

            {!sidebarOpen && (
              <span className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 whitespace-nowrap bg-[#111827] text-white text-xs font-medium px-2.5 py-1.5 rounded-md opacity-0 invisible group-hover:opacity-100 z-[200]">
                Back to Home
              </span>
            )}
          </Link>
        </div>

        <div className="h-px bg-[#E5E7EB] mb-3" />

        {/* Collapsed navigation */}
        {!sidebarOpen && (
          <div className="space-y-1">
            {searchResults.flatMap((section) =>
              section.items.map((item) => (
                <NavigationItem
                  key={`${section.id}-${item.id}`}
                  item={item}
                  pathname={pathname}
                  collapsed
                  unreadCount={unreadCount || undefined}
                  announcementCount={announcementCount || undefined}
                />
              ))
            )}
          </div>
        )}

        {/* Expanded navigation */}
        {sidebarOpen && (
          <div className="space-y-4">
            {searchResults.map((section) => {
              const expanded =
                searchActive || expandedSections.includes(section.id);

              return (
                <div key={section.id}>
                  {/* Section heading */}
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 mb-1',
                      'text-[10px] uppercase tracking-[0.08em]',
                      'font-semibold text-[#9CA3AF]',
                      'hover:text-[#4B5563]',
                      'transition-colors duration-150'
                    )}
                    aria-expanded={expanded}
                  >
                    <span>{section.label}</span>

                    <ChevronDown
                      className={cn(
                        'w-3 h-3 ml-auto transition-transform duration-150',
                        expanded
                          ? 'rotate-180 text-[#6B7280]'
                          : 'text-[#D1D5DB]'
                      )}
                    />
                  </button>

                  {/* Section items */}
                  {expanded && (
                    <div className="space-y-0.5">
                      {section.items.map((item) => (
                        <NavigationItem
                          key={item.id}
                          item={item}
                          pathname={pathname}
                          unreadCount={unreadCount || undefined}
                          announcementCount={
                            announcementCount || undefined
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {searchActive && searchResults.length === 0 && (
              <div className="px-3 py-8 text-center">
                <Search className="w-5 h-5 mx-auto mb-2 text-[#D1D5DB]" />
                <p className="text-xs text-[#6B7280]">
                  No pages found
                </p>
              </div>
            )}
          </div>
        )}

        {/* ================================================== */}
        {/* LOGOUT */}
        {/* ================================================== */}

        <div className="mt-4 pt-3 border-t border-[#E5E7EB]">
          <button
            type="button"
            onClick={handleLogout}
            className={cn(
              'relative group w-full flex items-center gap-3',
              'h-10 px-3 rounded-md',
              'text-[13px] text-[#6B7280] font-medium',
              'hover:text-[#DC2626] hover:bg-[#FEF2F2]',
              'transition-colors duration-150',
              !sidebarOpen && 'justify-center px-0'
            )}
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" />

            {sidebarOpen && <span>Logout</span>}

            {!sidebarOpen && (
              <span className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 whitespace-nowrap bg-[#111827] text-white text-xs font-medium px-2.5 py-1.5 rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 pointer-events-none z-[200]">
                Logout
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* ================================================== */}
      {/* SIDEBAR USER */}
      {/* ================================================== */}

      {sidebarOpen && (
        <div className="flex-shrink-0 border-t border-[#E5E7EB] px-3 py-3">
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-[#F8FAFC] transition-colors duration-150"
          >
            {user?.profileImageUrl ? (
              <Image
                src={user.profileImageUrl}
                alt={`${user?.firstName || ''} ${user?.lastName || ''}`}
                width={34}
                height={34}
                unoptimized
                className="w-[34px] h-[34px] rounded-full object-cover border border-[#E5E7EB]"
              />
            ) : (
              <div className="w-[34px] h-[34px] rounded-full bg-[#2563EB] flex items-center justify-center text-white text-[11px] font-semibold">
                {getInitials(user)}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="text-[#111827] text-xs font-semibold truncate">
                {user?.firstName} {user?.lastName}
              </p>

              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                <p className="text-[#9CA3AF] text-[10px] truncate">
                  {formatRole(userRole)}
                </p>
              </div>
            </div>

            <ChevronRight className="w-3.5 h-3.5 text-[#D1D5DB]" />
          </Link>
        </div>
      )}

      <style jsx>{`
        .sidebar-nav {
          scrollbar-width: thin;
          scrollbar-color: #e5e7eb transparent;
        }

        .sidebar-nav::-webkit-scrollbar {
          width: 5px;
        }

        .sidebar-nav::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-nav::-webkit-scrollbar-thumb {
          background-color: #e5e7eb;
          border-radius: 999px;
        }

        .sidebar-nav:hover::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
        }
      `}</style>
    </aside>
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const pathname = usePathname();
  const router = useRouter();

  const userRole = user?.role || 'student';

  const isAiPage =
    pathname === '/dashboard/ai' ||
    pathname.startsWith('/dashboard/ai/');

  // ----------------------------------------------------------
  // Close mobile navigation after route change
  // ----------------------------------------------------------

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileMenuOpen(false);
  }, [pathname]);

  // ----------------------------------------------------------
  // Prevent background scrolling when mobile menu is open
  // ----------------------------------------------------------

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset';

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // ----------------------------------------------------------
  // Responsive sidebar
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

    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // ----------------------------------------------------------
  // Authentication protection
  // ----------------------------------------------------------

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  // ----------------------------------------------------------
  // Logout
  // ----------------------------------------------------------

  const handleLogout = async () => {
    await logout();
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen((previous) => !previous);
  };

  // ----------------------------------------------------------
  // Mobile animation
  // ----------------------------------------------------------

  const mobileMenuVariants: Variants = {
    hidden: {
      x: '-100%',
    },
    visible: {
      x: 0,
      transition: {
        duration: 0.25,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
    exit: {
      x: '-100%',
      transition: {
        duration: 0.2,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  // ----------------------------------------------------------
  // Loading
  // ----------------------------------------------------------

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#E5E7EB] border-t-[#2563EB] animate-spin mx-auto mb-3" />

          <p className="text-[#6B7280] text-sm">
            Loading Selfless CE...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const pageInfo = getPageInfo(pathname);

  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="googlebot" content="noindex, nofollow" />
        <title>{pageInfo.title} | Selfless CE</title>
      </Head>

      <div className="min-h-screen bg-[#F8FAFC]">
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
            'min-h-screen transition-[margin] duration-200',
            sidebarOpen ? 'lg:ml-64' : 'lg:ml-[72px]'
          )}
        >
          {/* ================================================= */}
          {/* DESKTOP */}
          {/* ================================================= */}

          <div className="hidden lg:block">
            <TopBar
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              isMobile={false}
              user={user}
              userRole={userRole}
            />

            <main className="min-h-screen px-7 xl:px-8 pt-[88px] pb-10">
              <div className="w-full max-w-[1440px] mx-auto">
                {/* Page heading */}
                {pathname !== '/dashboard' && !isAiPage && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 text-xs text-[#9CA3AF] mb-2">
                      <span>Dashboard</span>

                      <ChevronRight className="w-3 h-3 text-[#D1D5DB]" />

                      <span className="text-[#6B7280]">
                        {pageInfo.section}
                      </span>
                    </div>

                    <h1 className="text-2xl font-semibold tracking-tight text-[#111827]">
                      {pageInfo.title}
                    </h1>
                  </div>
                )}

                {children}
              </div>
            </main>

            {/* Desktop footer */}
            <footer className="border-t border-[#E5E7EB] bg-white">
              <div className="max-w-[1440px] mx-auto px-7 xl:px-8 py-5">
                <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                  <p className="text-xs text-[#9CA3AF]">
                    © 2026 Selfless CE Organization
                  </p>

                  <div className="flex items-center gap-5 text-xs text-[#9CA3AF]">
                    <button
                      type="button"
                      className="hover:text-[#374151] transition-colors"
                    >
                      About
                    </button>

                    <button
                      type="button"
                      className="hover:text-[#374151] transition-colors"
                    >
                      FAQ
                    </button>

                    <button
                      type="button"
                      className="hover:text-[#374151] transition-colors"
                    >
                      Contact
                    </button>

                    <button
                      type="button"
                      className="hover:text-[#374151] transition-colors"
                    >
                      Privacy
                    </button>

                    <button
                      type="button"
                      className="hover:text-[#374151] transition-colors"
                    >
                      Terms
                    </button>
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
              setSidebarOpen={setSidebarOpen}
              isMobile
              onMenuToggle={toggleMobileMenu}
              user={user}
              userRole={userRole}
            />

            <main
              className={cn(
                'flex-1 w-full px-4 sm:px-5 pb-6 [overflow-x:clip]',
                isAiPage ? 'pt-20' : 'pt-[84px]'
              )}
            >
              <div className="w-full max-w-7xl mx-auto">
                {pathname !== '/dashboard' && !isAiPage && (
                  <div className="mb-5">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#9CA3AF] mb-1.5">
                      <span>Dashboard</span>

                      <ChevronRight className="w-3 h-3 text-[#D1D5DB]" />

                      <span>{pageInfo.section}</span>
                    </div>

                    <h1 className="text-xl font-semibold tracking-tight text-[#111827]">
                      {pageInfo.title}
                    </h1>
                  </div>
                )}

                {children}
              </div>
            </main>

            <footer className="border-t border-[#E5E7EB] bg-white">
              <div className="px-4 py-4">
                <div className="flex flex-col items-center gap-3 text-[10px] text-[#9CA3AF]">
                  <p>© 2026 Selfless CE Organization</p>

                  <div className="flex flex-wrap justify-center gap-4">
                    <button
                      type="button"
                      className="hover:text-[#374151] transition-colors"
                    >
                      About
                    </button>

                    <button
                      type="button"
                      className="hover:text-[#374151] transition-colors"
                    >
                      FAQ
                    </button>

                    <button
                      type="button"
                      className="hover:text-[#374151] transition-colors"
                    >
                      Contact
                    </button>

                    <button
                      type="button"
                      className="hover:text-[#374151] transition-colors"
                    >
                      Privacy
                    </button>

                    <button
                      type="button"
                      className="hover:text-[#374151] transition-colors"
                    >
                      Terms
                    </button>
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
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-[9998] lg:hidden bg-black/35"
                onClick={() => setMobileMenuOpen(false)}
                aria-hidden="true"
              />

              {/* Drawer */}
              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={mobileMenuVariants}
                className="fixed inset-y-0 left-0 w-[84%] max-w-[300px] z-[9999] lg:hidden shadow-2xl"
              >
                <Sidebar
                  sidebarOpen
                  pathname={pathname}
                  user={user}
                  userRole={userRole}
                  handleLogout={handleLogout}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ================================================== */}
        {/* ATBRIZ AI QUICK ACCESS */}
        {/* ================================================== */}

        {!isAiPage && (
          <Link
            href="/dashboard/ai"
            aria-label="Open Atbriz AI"
            className={cn(
              'fixed bottom-5 right-5 z-40',
              'flex items-center gap-2',
              'bg-white border border-[#D1D5DB]',
              'rounded-lg px-3 py-2',
              'shadow-[0_4px_12px_rgba(15,23,42,0.08)]',
              'hover:border-[#93C5FD] hover:shadow-[0_6px_16px_rgba(15,23,42,0.10)]',
              'transition-all duration-150',
              'group'
            )}
          >
            <div className="relative flex-shrink-0">
              <Image
                src="/atbriz.png"
                alt="Atbriz AI"
                width={30}
                height={30}
                className="w-[30px] h-[30px] rounded-md object-cover border border-[#E5E7EB]"
              />

              <span className="absolute -right-0.5 -top-0.5 w-2 h-2 rounded-full bg-[#16A34A] border-2 border-white" />
            </div>

            <div className="hidden sm:block leading-tight">
              <p className="text-[11px] font-semibold text-[#111827]">
                Atbriz AI
              </p>

              <p className="text-[9px] text-[#9CA3AF]">
                Assistant
              </p>
            </div>
          </Link>
        )}
      </div>
    </>
  );
}