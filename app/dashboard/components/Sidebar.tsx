'use client';

import {
  useMemo,
  useState,
  type ReactNode,
  useRef,
  useEffect,
} from 'react';
import { usePathname } from 'next/navigation';
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
  CircleDot,
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
        label: 'Selfless CE Gallery',
        path: '/dashboard/gallery',
        icon: <Images className={iconClass} />,
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
      id: 'assign-grades',
      label: 'Assign Grades',
      path: '/dashboard/teacher/grades',
      icon: <Award className={iconClass} />,
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
      label: 'Tech Center',
      path: '/dashboard/admin/tech-centers',
      icon: <School className={iconClass} />,
      roles: ['admin'],
    },
    {
      id: 'manage-cleaning',
      label: 'Cleaning Management',
      path: '/dashboard/admin/cleaning',
      icon: <Calendar className={iconClass} />,
      roles: ['admin'],
    },
  ],
};

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
      label: 'Assign Grades',
      path: '/dashboard/teacher/grades',
      icon: <Award className={iconClass} />,
      roles: ['teacher'],
    },
    {
      id: 'attendance',
      label: 'Attendance',
      path: '/dashboard/cleaning',
      icon: <Calendar className={iconClass} />,
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
      id: 'cleaning-management',
      label: 'Cleaning Management',
      path: '/dashboard/dev/cleaning',
      icon: <Settings className={iconClass} />,
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
      id: 'email-settings',
      label: 'Send Emails',
      path: '/dashboard/super-admin/email',
      icon: <Mail className={iconClass} />,
      roles: ['super_admin'],
    },
  ],
};

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
      id: 'dev-cleaning',
      label: 'Cleaning Management',
      path: '/dashboard/dev/cleaning',
      icon: <Settings className={iconClass} />,
      roles: ['dev', 'super_admin'],
    },
    {
      id: 'super-admin-overview',
      label: 'System Overview',
      path: '/dashboard/super-admin',
      icon: <Shield className={iconClass} />,
      roles: ['dev'],
    },
    {
      id: 'email-settings',
      label: 'Send Emails',
      path: '/dashboard/super-admin/email',
      icon: <Mail className={iconClass} />,
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
  ],
};

// ============================================================
// HELPERS
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
  const formatted = role
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );

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
            'w-full h-12 rounded-xl',
            'transition-all duration-200',
            active
              ? 'bg-[#FFF8E7] text-[#B98A3E]'
              : 'text-[#1A2B4C] hover:text-[#B98A3E] hover:bg-[#F7F6F2]'
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
              'bg-[#1A2B4C] text-white',
              'text-xs font-semibold',
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
          'w-full min-h-12 px-3 rounded-xl',
          'text-[14px]',
          'transition-all duration-200',
          active
            ? 'bg-[#FFF8E7] text-[#1A2B4C] font-semibold'
            : 'text-[#1A2B4C] font-semibold hover:text-[#B98A3E] hover:bg-[#F7F6F2]'
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
              : 'text-[#1A2B4C]'
          )}
        >
          {item.icon}
        </motion.span>

        <span className="flex-1 min-w-0 font-semibold">
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
            'text-[#B98A3E]',
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

  const toggleSidebar = () => {
    // Sidebar is controlled by parent component
  };

  return (
    <>
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{
        x: isMobile ? (sidebarOpen ? 0 : '-100%') : 0,
        opacity: 1,
      }}
      transition={{ duration: 0.3 }}
      style={{
        width: isMobile
          ? SIDEBAR_WIDTH_EXPANDED
          : sidebarOpen
            ? SIDEBAR_WIDTH_EXPANDED
            : SIDEBAR_WIDTH_COLLAPSED,
      }}
      className={cn(
        'h-screen bg-white',
        'flex flex-col overflow-hidden',
        'shadow-[0_8px_32px_rgba(18,32,59,0.12),0_2px_8px_rgba(18,32,59,0.06)]',
        'transition-all duration-350 ease-[cubic-bezier(0.22,1,0.36,1)]',
        'fixed left-0 top-0 z-[100]'
      )}
    >
      {/* ================================================== */}
      {/* BRAND */}
      {/* ================================================== */}

      <div
        style={{ height: TOPBAR_HEIGHT }}
        className={cn(
          'flex-shrink-0',
          'flex items-center',
          'relative overflow-hidden',
          'bg-transparent',
          sidebarOpen
            ? 'px-4'
            : 'justify-center'
        )}
      >
        <Link
          href="/dashboard"
          onClick={() => isMobile && sidebarOpen && setSidebarOpen?.(false)}
          className="relative flex items-center gap-3 min-w-0 group"
          aria-label="Selfless CE Dashboard"
        >
          <motion.div
            whileHover={{
              scale: 1.06,
              rotate: 2,
            }}
            whileTap={{
              scale: 0.94,
            }}
            className="relative w-9 h-9 bg-[#B98A3E] flex items-center justify-center overflow-hidden flex-shrink-0 rounded-lg shadow-lg"
          >
            <Image
              src="/freedom.png"
              alt="Selfless CE Logo"
              width={36}
              height={36}
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
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 min-w-0"
            >
              <p className="text-[13px] font-semibold text-[#1A2B4C] leading-tight">
                Selfless CE
              </p>
              <p className="text-[10.5px] text-[#8A9088] leading-tight">
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
            className="ml-auto text-[#8A9088] hover:text-[#1A2B4C] transition-colors"
            aria-label="Toggle sidebar"
          >
            <ChevronDown
              className={cn(
                'w-4 h-4 transition-transform duration-200',
                sidebarOpen ? 'rotate-180' : 'rotate-0'
              )}
            />
          </motion.button>
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
        {/* SEARCH */}
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
            className="px-3 pt-0.5 pb-2"
          >
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B98A3E]" />

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
                  'w-full h-10 pl-10 pr-9 rounded-xl',
                  'bg-[#F7F6F2]',
                  'text-[13px] text-[#1A2B4C] font-semibold',
                  'placeholder:text-[#8A9088]',
                  'outline-none',
                  'focus:bg-white',
                  'focus:ring-2 focus:ring-[#B98A3E]/30',
                  'transition-all duration-200'
                )}
              />

              {!searchQuery && (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden xl:flex items-center gap-0.5 font-mono text-[9px] text-[#B98A3E] bg-white px-1.5 py-0.5 rounded-lg font-semibold">
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
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#B98A3E] hover:text-[#1A2B4C] p-1 rounded-lg"
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
            'py-2',
            sidebarOpen
              ? 'px-2'
              : 'px-1.5'
          )}
          aria-label="Dashboard navigation"
        >
          {/* COLLAPSED */}
          {!sidebarOpen && (
            <div className="space-y-0.5">
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
            <div className="space-y-2.5">
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
                          'px-2.5 mb-1 py-1.5 rounded-lg',
                          'font-mono text-[10px]',
                          'uppercase tracking-[0.12em]',
                          'font-bold',
                          'text-[#B98A3E]',
                          'hover:text-[#1A2B4C]',
                          'hover:bg-[#F7F6F2]',
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
                          <ChevronDown className="w-3 h-3 text-[#B98A3E]" />
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

          {/* BACK TO HOME */}
          <div className="mt-3 pt-1">
            <Link
              href="/"
              aria-label="Back to Home"
              className={cn(
                'relative group w-full flex items-center gap-3',
                'h-12 px-3 rounded-lg',
                'text-[14px] text-[#6B7268] font-medium',
                'hover:text-[#1A2B4C] hover:bg-[#F3F4F6]',
                'transition-all duration-200',
                !sidebarOpen && 'justify-center px-0'
              )}
            >
              <Home className="w-[18px] h-[18px] flex-shrink-0" />

              {sidebarOpen && <span>Back to Home</span>}

              {!sidebarOpen && (
                <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-[#1A2B4C] text-white text-xs font-medium px-3 py-2 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-[300]">
                  Back to Home
                </span>
              )}
            </Link>
          </div>

          {/* LOGOUT */}
          <div className="mt-2 pt-1">
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
                'h-12 px-3 rounded-lg',
                'text-[14px]',
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
                <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-[#1A2B4C] text-white text-xs font-medium px-3 py-2 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-[300]">
                  Logout
                </span>
              )}
            </motion.button>
          </div>

          <div className="h-3" />
        </nav>
      </div>

      {/* ================================================== */}
      {/* SIDEBAR USER */}
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
          className="flex-shrink-0 px-1.5 py-2 bg-transparent"
        >
          <Link
            href="/dashboard/profile"
            className="group flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[#F3F4F6] transition-all duration-200"
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

            <div className="min-w-0 flex-1">
              <p className="text-[#1A2B4C] text-xs font-semibold truncate">
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
              <ChevronRight className="w-3.5 h-3.5 text-[#B9BEB2] group-hover:text-[#C59B4C] transition-colors duration-200" />
            </motion.div>
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
          background-color: #b9beb2;
          background-clip: padding-box;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #8f968d;
          background-clip: padding-box;
        }
      `}</style>
    </>
  );
}
