// app/dashboard/layout.tsx
'use client';

import { useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Head from 'next/head';
import Image from 'next/image';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import { cn } from '@/lib/utils';
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
  DollarSign
} from 'lucide-react';
import { useUnreadNotificationCount, useAnnouncementCount } from '@/hooks/useNotifications';

// ============================================
// ENHANCED COLOR TOKENS
// ============================================
// Primary: Warm Gold → #E8A33D, #F2C879, #C97F1F
// Secondary: Teal → #14B8A6, #2DD4BF, #0D9488
// Accent: Coral → #FB7185, #FDA4AF, #E11D48
// Surface: Navy Sidebar → #0A1628 sidebar, #0D1E35 topbar, #112240 hover | Warm Dark content → #111110 page
// Text: White → #FFFFFF, #F8F5F0, #C4BDB5, #8A8278

interface TopBarProps {
  sidebarOpen: boolean;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  isMobile: boolean;
  onMenuToggle?: () => void;
  mobileMenuOpen?: boolean;
  user: {
    profileImageUrl?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
  userRole: string;
}

// ============================================
// TOP BAR COMPONENT
// ============================================
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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
      "fixed top-0 right-0 z-30 transition-all duration-500",
      isMobile ? "left-0" : sidebarOpen ? "left-0 lg:left-72" : "left-0 lg:left-20",
      scrolled
        ? "bg-[#0D1E35]/95 backdrop-blur-xl shadow-2xl"
        : "bg-[#0D1E35]"
    )}>
      <div className="flex items-center justify-between h-16 px-4 md:px-8">
        {/* Left - Menu Toggle + Brand */}
        <div className="flex items-center gap-3">
          {isMobile ? (
            <button
              onClick={onMenuToggle}
              className="p-2 rounded-xl text-[#8A8278] hover:text-white hover:bg-[#112240] transition-all duration-300 hover:scale-110"
            >
              <Menu className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl text-[#8A8278] hover:text-white hover:bg-[#112240] transition-all duration-300 hover:scale-110"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Enhancement 7: hide brand when sidebar is expanded on desktop */}
          <div className={cn(
            "flex items-center gap-3",
            !isMobile && sidebarOpen && "hidden"
          )}>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#E8A33D] to-[#FB7185] rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#E8A33D] to-[#FB7185] p-[2px] shadow-2xl shadow-[#E8A33D]/30 flex-shrink-0">
                <div className="w-full h-full rounded-[10px] bg-[#0D1E35] flex items-center justify-center overflow-hidden">
                  <Image src="/freedom.png" alt="Freedom Tech Logo" width={36} height={36} className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
            <span className="text-white font-semibold text-lg hidden sm:block tracking-tight">
              Selfless CE
            </span>
          </div>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          {/* NOTIFICATIONS WITH FIXED BADGE */}
          <Link
            href="/dashboard/notifications"
            className="relative p-2 rounded-xl text-[#8A8278] hover:text-white hover:bg-[#112240] transition-all duration-300 group"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            {unreadCount && unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-[20px] px-1 bg-gradient-to-r from-[#FB7185] to-[#E11D48] rounded-full text-[10px] font-bold text-white ring-2 ring-[#111110] shadow-lg shadow-[#FB7185]/50 animate-pulse z-10">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

          <Link
            href="/dashboard/announcements"
            className="relative p-2 rounded-xl text-[#8A8278] hover:text-white hover:bg-[#112240] transition-all duration-300 group"
            aria-label="Announcements"
          >
            <Megaphone className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            {announcementCount && announcementCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-[20px] px-1 bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] rounded-full text-[10px] font-bold text-white ring-2 ring-[#111110] shadow-lg shadow-[#E8A33D]/50 animate-pulse z-10">
                {announcementCount > 99 ? '99+' : announcementCount}
              </span>
            )}
          </Link>

          {/* Enhancement 6: removed Courses, Cleaning, Students shortcuts */}

          {/* Profile */}
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 ml-2 pl-3 border-l border-[#1A3050] hover:bg-[#112240]/30 rounded-lg px-3 py-2 transition-all duration-300 group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#E8A33D] to-[#14B8A6] rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
              {user?.profileImageUrl ? (
                <Image
                  src={user.profileImageUrl}
                  alt={`${user?.firstName} ${user?.lastName}`}
                  width={44}
                  height={44}
                  unoptimized
                  className="relative w-11 h-11 rounded-full object-cover shadow-xl shadow-[#E8A33D]/20 transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-[#E8A33D] to-[#14B8A6] flex items-center justify-center text-[#111110] font-bold text-sm shadow-xl shadow-[#E8A33D]/20 transition-transform duration-300 group-hover:scale-110">
                  {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                  {user?.lastName?.charAt(0).toUpperCase() || ''}
                </div>
              )}
            </div>
            <div className="block lg:hidden">
              <p className="text-white text-xs font-medium leading-tight truncate max-w-[80px]">
                {user?.firstName}
              </p>
              <p className="text-[#8A8278] text-[10px] capitalize flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-[#14B8A6] inline-block"></span>
                {userRole}
              </p>
            </div>
            <div className="hidden lg:block">
              <p className="text-white text-sm font-medium leading-tight">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[#8A8278] text-xs capitalize flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6] inline-block"></span>
                {userRole}
              </p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: ReactNode;
  roles: string[];
}

interface NavGroup {
  id: string;
  label: string;
  icon: ReactNode;
  roles: string[];
  items: NavItem[];
}

// ============================================
// SIDEBAR NAVIGATION ITEMS
// ============================================
const getNavGroups = (userRole: string): NavGroup[] => {
  const groups: NavGroup[] = [];

  // =====================
  // SUPER ADMIN ONLY LINKS
  // =====================
  if (userRole === 'super_admin') {
    // Main section for super admin
    groups.push({
      id: 'main',
      label: 'Main',
      icon: <LayoutDashboard className="w-4 h-4" />,
      roles: ['super_admin'],
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          path: '/dashboard',
          icon: <LayoutDashboard className="w-5 h-5" />,
          roles: ['super_admin']
        },
        {
          id: 'atbriz-ai',
          label: 'Atbriz AI',
          path: '/dashboard/ai',
          icon: <Sparkles className="w-5 h-5" />,
          roles: ['super_admin']
        },
        {
          id: 'students',
          label: 'Students',
          path: '/dashboard/students',
          icon: <Users className="w-5 h-5" />,
          roles: ['super_admin']
        },
        {
          id: 'browse-internships',
          label: 'Browse Internships',
          path: '/dashboard/internships',
          icon: <Briefcase className="w-5 h-5" />,
          roles: ['super_admin']
        },
        {
          id: 'my-applications',
          label: 'My Applications',
          path: '/dashboard/internships/applications',
          icon: <ClipboardList className="w-5 h-5" />,
          roles: ['super_admin']
        },
        {
          id: 'support-groups',
          label: 'Support Groups',
          path: '/dashboard/support-groups',
          icon: <HeartHandshake className="w-5 h-5" />,
          roles: ['super_admin']
        },
        {
          id: 'temple-trips',
          label: 'Temple Trips',
          path: '/dashboard/temple-trips',
          icon: <Building2 className="w-5 h-5" />,
          roles: ['super_admin']
        },
      ]
    });

    groups.push({
      id: 'super-admin',
      label: 'Super Admin',
      icon: <Shield className="w-4 h-4" />,
      roles: ['super_admin'],
      items: [
        {
          id: 'super-admin-dashboard',
          label: 'Overview',
          path: '/dashboard/super-admin',
          icon: <Shield className="w-5 h-5" />,
          roles: ['super_admin']
        },
        {
          id: 'all-centers',
          label: 'All Centers',
          path: '/dashboard/super-admin/centers',
          icon: <School className="w-5 h-5" />,
          roles: ['super_admin']
        },
        {
          id: 'all-users',
          label: 'All Users',
          path: '/dashboard/super-admin/users',
          icon: <Users className="w-5 h-5" />,
          roles: ['super_admin']
        },
        {
          id: 'password-resets',
          label: 'Password Resets',
          path: '/dashboard/super-admin/password-resets',
          icon: <Key className="w-5 h-5" />,
          roles: ['super_admin']
        },
        {
          id: 'system-settings',
          label: 'Settings',
          path: '/dashboard/super-admin/settings',
          icon: <Settings className="w-5 h-5" />,
          roles: ['super_admin']
        },
        {
          id: 'knowledge-base',
          label: 'Knowledge Base',
          path: '/dashboard/super-admin/knowledge-base',
          icon: <Database className="w-5 h-5" />,
          roles: ['super_admin']
        },
        {
          id: 'activity-logs',
          label: 'Logs',
          path: '/dashboard/super-admin/logs',
          icon: <FileText className="w-5 h-5" />,
          roles: ['super_admin']
        },
      ]
    });

    // Super Admin also gets the Profile section
    groups.push({
      id: 'settings',
      label: 'Profile',
      icon: <Settings className="w-4 h-4" />,
      roles: ['super_admin'],
      items: [
        {
          id: 'profile',
          label: 'My Profile',
          path: '/dashboard/profile',
          icon: <User className="w-5 h-5" />,
          roles: ['super_admin']
        },
        {
          id: 'settings',
          label: 'Settings',
          path: '/dashboard/settings',
          icon: <Settings className="w-5 h-5" />,
          roles: ['super_admin']
        },
      ]
    });

    return groups;
  }

  // =====================
  // ADMIN LINKS (includes student links)
  // =====================
  if (userRole === 'admin') {
    // Student/Default links for admin
    groups.push({
      id: 'main',
      label: 'Main',
      icon: <LayoutDashboard className="w-4 h-4" />,
      roles: ['admin'],
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          path: '/dashboard',
          icon: <LayoutDashboard className="w-5 h-5" />,
          roles: ['admin']
        },
        {
          id: 'atbriz-ai',
          label: 'Atbriz AI',
          path: '/dashboard/ai',
          icon: <Sparkles className="w-5 h-5" />,
          roles: ['admin']
        },
        {
          id: 'students',
          label: 'Students',
          path: '/dashboard/students',
          icon: <Users className="w-5 h-5" />,
          roles: ['admin']
        },
        {
          id: 'browse-internships',
          label: 'Browse Internships',
          path: '/dashboard/internships',
          icon: <Briefcase className="w-5 h-5" />,
          roles: ['admin']
        },
        {
          id: 'my-applications',
          label: 'My Applications',
          path: '/dashboard/internships/applications',
          icon: <ClipboardList className="w-5 h-5" />,
          roles: ['admin']
        },
        {
          id: 'support-groups',
          label: 'Support Groups',
          path: '/dashboard/support-groups',
          icon: <HeartHandshake className="w-5 h-5" />,
          roles: ['admin']
        },
        {
          id: 'temple-trips',
          label: 'Temple Trips',
          path: '/dashboard/temple-trips',
          icon: <Building2 className="w-5 h-5" />,
          roles: ['admin']
        },
      ]
    });

    groups.push({
      id: 'academic',
      label: 'Academic',
      icon: <GraduationCap className="w-4 h-4" />,
      roles: ['admin'],
      items: [
        {
          id: 'courses',
          label: 'My Courses',
          path: '/dashboard/courses',
          icon: <BookOpen className="w-5 h-5" />,
          roles: ['admin']
        },
        {
          id: 'grades',
          label: 'My Grades',
          path: '/dashboard/grades',
          icon: <BarChart3 className="w-5 h-5" />,
          roles: ['admin']
        },
      ]
    });

    groups.push({
      id: 'activities',
      label: 'Activities',
      icon: <Trophy className="w-4 h-4" />,
      roles: ['admin'],
      items: [
        {
          id: 'football-team',
          label: 'Football Team',
          path: '/dashboard/football-team',
          icon: <Trophy className="w-5 h-5" />,
          roles: ['admin']
        },
      ]
    });

    groups.push({
      id: 'cleaning',
      label: 'Cleaning',
      icon: <Calendar className="w-4 h-4" />,
      roles: ['admin'],
      items: [
        {
          id: 'cleaning',
          label: 'Cleaning Rota',
          path: '/dashboard/cleaning',
          icon: <Calendar className="w-5 h-5" />,
          roles: ['admin']
        },
      ]
    });

    groups.push({
      id: 'communication',
      label: 'Communication',
      icon: <Megaphone className="w-4 h-4" />,
      roles: ['admin'],
      items: [
        {
          id: 'announcements',
          label: 'Announcements',
          path: '/dashboard/announcements',
          icon: <Megaphone className="w-5 h-5" />,
          roles: ['admin']
        },
        {
          id: 'notifications',
          label: 'Notifications',
          path: '/dashboard/notifications',
          icon: <Bell className="w-5 h-5" />,
          roles: ['admin']
        },
      ]
    });

    // Admin-specific links
    groups.push({
      id: 'admin',
      label: 'Admin',
      icon: <Shield className="w-4 h-4" />,
      roles: ['admin'],
      items: [
        {
          id: 'admin-dashboard',
          label: 'Overview',
          path: '/dashboard/admin',
          icon: <Shield className="w-5 h-5" />,
          roles: ['admin']
        },
        {
          id: 'manage-teachers',
          label: 'Teachers',
          path: '/dashboard/admin/teachers',
          icon: <UserCog className="w-5 h-5" />,
          roles: ['admin']
        },
        {
          id: 'manage-users',
          label: 'Users',
          path: '/dashboard/admin/users',
          icon: <Users className="w-5 h-5" />,
          roles: ['admin']
        },
        {
          id: 'manage-tuition',
          label: 'Tuition',
          path: '/dashboard/admin/tuition',
          icon: <DollarSign className="w-5 h-5" />,
          roles: ['admin']
        },
        {
          id: 'manage-tech-centers',
          label: 'Tech Centers',
          path: '/dashboard/admin/tech-centers',
          icon: <School className="w-5 h-5" />,
          roles: ['admin']
        },
        {
          id: 'manage-cleaning',
          label: 'Cleaning',
          path: '/dashboard/admin/cleaning',
          icon: <Calendar className="w-5 h-5" />,
          roles: ['admin']
        },
      ]
    });

    // Profile section for admin
    groups.push({
      id: 'settings',
      label: 'Profile',
      icon: <Settings className="w-4 h-4" />,
      roles: ['admin'],
      items: [
        {
          id: 'profile',
          label: 'My Profile',
          path: '/dashboard/profile',
          icon: <User className="w-5 h-5" />,
          roles: ['admin']
        },
        {
          id: 'settings',
          label: 'Settings',
          path: '/dashboard/settings',
          icon: <Settings className="w-5 h-5" />,
          roles: ['admin']
        },
      ]
    });

    return groups;
  }

  // =====================
  // TEACHER LINKS (includes student links)
  // =====================
  if (userRole === 'teacher') {
    // Student/Default links for teacher
    groups.push({
      id: 'main',
      label: 'Main',
      icon: <LayoutDashboard className="w-4 h-4" />,
      roles: ['teacher'],
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          path: '/dashboard',
          icon: <LayoutDashboard className="w-5 h-5" />,
          roles: ['teacher']
        },
        {
          id: 'atbriz-ai',
          label: 'Atbriz AI',
          path: '/dashboard/ai',
          icon: <Sparkles className="w-5 h-5" />,
          roles: ['teacher']
        },
        {
          id: 'students',
          label: 'Students',
          path: '/dashboard/students',
          icon: <Users className="w-5 h-5" />,
          roles: ['teacher']
        },
        {
          id: 'browse-internships',
          label: 'Browse Internships',
          path: '/dashboard/internships',
          icon: <Briefcase className="w-5 h-5" />,
          roles: ['teacher']
        },
        {
          id: 'my-applications',
          label: 'My Applications',
          path: '/dashboard/internships/applications',
          icon: <ClipboardList className="w-5 h-5" />,
          roles: ['teacher']
        },
        {
          id: 'support-groups',
          label: 'Support Groups',
          path: '/dashboard/support-groups',
          icon: <HeartHandshake className="w-5 h-5" />,
          roles: ['teacher']
        },
        {
          id: 'temple-trips',
          label: 'Temple Trips',
          path: '/dashboard/temple-trips',
          icon: <Building2 className="w-5 h-5" />,
          roles: ['teacher']
        },
      ]
    });

    groups.push({
      id: 'academic',
      label: 'Academic',
      icon: <GraduationCap className="w-4 h-4" />,
      roles: ['teacher'],
      items: [
        {
          id: 'courses',
          label: 'My Courses',
          path: '/dashboard/courses',
          icon: <BookOpen className="w-5 h-5" />,
          roles: ['teacher']
        },
        {
          id: 'grades',
          label: 'My Grades',
          path: '/dashboard/grades',
          icon: <BarChart3 className="w-5 h-5" />,
          roles: ['teacher']
        },
      ]
    });

    groups.push({
      id: 'activities',
      label: 'Activities',
      icon: <Trophy className="w-4 h-4" />,
      roles: ['teacher'],
      items: [
        {
          id: 'football-team',
          label: 'Football Team',
          path: '/dashboard/football-team',
          icon: <Trophy className="w-5 h-5" />,
          roles: ['teacher']
        },
      ]
    });

    groups.push({
      id: 'cleaning',
      label: 'Cleaning',
      icon: <Calendar className="w-4 h-4" />,
      roles: ['teacher'],
      items: [
        {
          id: 'cleaning',
          label: 'Cleaning Rota',
          path: '/dashboard/cleaning',
          icon: <Calendar className="w-5 h-5" />,
          roles: ['teacher']
        },
      ]
    });

    groups.push({
      id: 'communication',
      label: 'Communication',
      icon: <Megaphone className="w-4 h-4" />,
      roles: ['teacher'],
      items: [
        {
          id: 'announcements',
          label: 'Announcements',
          path: '/dashboard/announcements',
          icon: <Megaphone className="w-5 h-5" />,
          roles: ['teacher']
        },
        {
          id: 'notifications',
          label: 'Notifications',
          path: '/dashboard/notifications',
          icon: <Bell className="w-5 h-5" />,
          roles: ['teacher']
        },
      ]
    });

    // Teacher-specific links
    groups.push({
      id: 'teacher',
      label: 'Teaching',
      icon: <Briefcase className="w-4 h-4" />,
      roles: ['teacher'],
      items: [
        {
          id: 'teacher-dashboard',
          label: 'Overview',
          path: '/dashboard/teacher',
          icon: <Briefcase className="w-5 h-5" />,
          roles: ['teacher']
        },
        {
          id: 'manage-students',
          label: 'Students',
          path: '/dashboard/teacher/students',
          icon: <Users className="w-5 h-5" />,
          roles: ['teacher']
        },
        {
          id: 'assign-grades',
          label: 'Grades',
          path: '/dashboard/teacher/grades',
          icon: <Award className="w-5 h-5" />,
          roles: ['teacher']
        },
        {
          id: 'attendance',
          label: 'Attendance',
          path: '/dashboard/cleaning',
          icon: <Clock className="w-5 h-5" />,
          roles: ['teacher']
        },
      ]
    });

    // Profile section for teacher
    groups.push({
      id: 'settings',
      label: 'Profile',
      icon: <Settings className="w-4 h-4" />,
      roles: ['teacher'],
      items: [
        {
          id: 'profile',
          label: 'My Profile',
          path: '/dashboard/profile',
          icon: <User className="w-5 h-5" />,
          roles: ['teacher']
        },
        {
          id: 'settings',
          label: 'Settings',
          path: '/dashboard/settings',
          icon: <Settings className="w-5 h-5" />,
          roles: ['teacher']
        },
      ]
    });

    return groups;
  }

  // =====================
  // DEFAULT STUDENT LINKS
  // =====================
  // Student-only links
  groups.push({
    id: 'main',
    label: 'Main',
    icon: <LayoutDashboard className="w-4 h-4" />,
    roles: ['student'],
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/dashboard',
        icon: <LayoutDashboard className="w-5 h-5" />,
        roles: ['student']
      },
      {
        id: 'atbriz-ai',
        label: 'Atbriz AI',
        path: '/dashboard/ai',
        icon: <Sparkles className="w-5 h-5" />,
        roles: ['student']
      },
      {
        id: 'students',
        label: 'Students',
        path: '/dashboard/students',
        icon: <Users className="w-5 h-5" />,
        roles: ['student']
      },
      {
        id: 'browse-internships',
        label: 'Browse Internships',
        path: '/dashboard/internships',
        icon: <Briefcase className="w-5 h-5" />,
        roles: ['student']
      },
      {
        id: 'my-applications',
        label: 'My Applications',
        path: '/dashboard/internships/applications',
        icon: <ClipboardList className="w-5 h-5" />,
        roles: ['student']
      },
      {
        id: 'support-groups',
        label: 'Support Groups',
        path: '/dashboard/support-groups',
        icon: <HeartHandshake className="w-5 h-5" />,
        roles: ['student']
      },
      {
        id: 'temple-trips',
        label: 'Temple Trips',
        path: '/dashboard/temple-trips',
        icon: <Building2 className="w-5 h-5" />,
        roles: ['student']
      },
    ]
  });

  groups.push({
    id: 'academic',
    label: 'Academic',
    icon: <GraduationCap className="w-4 h-4" />,
    roles: ['student'],
    items: [
      {
        id: 'courses',
        label: 'My Courses',
        path: '/dashboard/courses',
        icon: <BookOpen className="w-5 h-5" />,
        roles: ['student']
      },
      {
        id: 'grades',
        label: 'My Grades',
        path: '/dashboard/grades',
        icon: <BarChart3 className="w-5 h-5" />,
        roles: ['student']
      },
    ]
  });

  groups.push({
    id: 'activities',
    label: 'Activities',
    icon: <Trophy className="w-4 h-4" />,
    roles: ['student'],
    items: [
      {
        id: 'football-team',
        label: 'Football Team',
        path: '/dashboard/football-team',
        icon: <Trophy className="w-5 h-5" />,
        roles: ['student']
      },
    ]
  });

  groups.push({
    id: 'cleaning',
    label: 'Cleaning',
    icon: <Calendar className="w-4 h-4" />,
    roles: ['student'],
    items: [
      {
        id: 'cleaning',
        label: 'Cleaning Rota',
        path: '/dashboard/cleaning',
        icon: <Calendar className="w-5 h-5" />,
        roles: ['student']
      },
    ]
  });

  groups.push({
    id: 'communication',
    label: 'Communication',
    icon: <Megaphone className="w-4 h-4" />,
    roles: ['student'],
    items: [
      {
        id: 'announcements',
        label: 'Announcements',
        path: '/dashboard/announcements',
        icon: <Megaphone className="w-5 h-5" />,
        roles: ['student']
      },
      {
        id: 'notifications',
        label: 'Notifications',
        path: '/dashboard/notifications',
        icon: <Bell className="w-5 h-5" />,
        roles: ['student']
      },
    ]
  });

  // Profile section for student
  groups.push({
    id: 'settings',
    label: 'Profile',
    icon: <Settings className="w-4 h-4" />,
    roles: ['student'],
    items: [
      {
        id: 'profile',
        label: 'My Profile',
        path: '/dashboard/profile',
        icon: <User className="w-5 h-5" />,
        roles: ['student']
      },
      {
        id: 'settings',
        label: 'Settings',
        path: '/dashboard/settings',
        icon: <Settings className="w-5 h-5" />,
        roles: ['student']
      },
    ]
  });

  return groups;
};

interface SidebarProps {
  sidebarOpen: boolean;
  pathname: string;
  user: {
    profileImageUrl?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
  userRole: string;
  handleLogout: () => void | Promise<void>;
}

// ============================================
// SIDEBAR COMPONENT
// ============================================
function Sidebar({
  sidebarOpen,
  pathname,
  user,
  userRole,
  handleLogout,
}: SidebarProps) {
  const navGroups = getNavGroups(userRole);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(() => navGroups.map(g => g.id));
  const [searchQuery, setSearchQuery] = useState('');
  const { data: unreadCount } = useUnreadNotificationCount();
  const { data: announcementCount } = useAnnouncementCount();

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const filteredNavGroups = navGroups
    .filter(group => group.roles.includes(userRole))
    .map(group => ({
      ...group,
      items: group.items.filter(item => item.roles.includes(userRole))
    }))
    .filter(group => group.items.length > 0);

  // Search filtering
  const searchFilteredNavGroups = searchQuery
    ? filteredNavGroups
      .map(group => ({
        ...group,
        items: group.items.filter(item =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.id.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }))
      .filter(group => group.items.length > 0)
    : filteredNavGroups;

  const isSearchActive = searchQuery.trim().length > 0;

  // Flat list of all nav items for collapsed tooltip mode
  const allNavItems = filteredNavGroups.flatMap(g => g.items);

  return (
    <aside className={cn(
      "h-screen bg-[#0A1628] flex flex-col transition-all duration-300 overflow-hidden relative",
      sidebarOpen ? "w-72" : "w-20"
    )}>
      {/* Enhancement 9: dot grid only, bumped opacity */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
        backgroundSize: '24px 24px'
      }} />

      {/* Enhancement 1: Sidebar Header with org subtitle + border-b */}
      <div className={cn(
        "flex items-center gap-3 px-4 pt-4 pb-3 flex-shrink-0 relative z-10 border-b border-[#1A3050]/80",
        !sidebarOpen && "justify-center"
      )}>
        <div className="relative group flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#E8A33D] to-[#FB7185] rounded-xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
          <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-[#E8A33D] to-[#FB7185] p-[2px] shadow-2xl shadow-[#E8A33D]/30">
            <div className="w-full h-full rounded-[10px] bg-[#0A1628] flex items-center justify-center overflow-hidden">
              <Image src="/freedom.png" alt="Selfless CE Logo" width={32} height={32} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
        {sidebarOpen && (
          <div className="min-w-0">
            <p className="text-white font-bold text-sm leading-tight tracking-tight">Selfless CE</p>
            <p className="text-[#8A8278] text-[10px] leading-tight">Student Portal</p>
          </div>
        )}
      </div>

      {/* Search Input */}
      {sidebarOpen && (
        <div className="px-4 pb-2 pt-3 relative z-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8278]" />
            <input
              type="text"
              placeholder="Search navigation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#112240]/50 border border-[#112240] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-[#8A8278] focus:outline-none focus:border-[#E8A33D]/50 focus:bg-[#112240]/70 transition-all duration-300"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8278] hover:text-white transition-colors duration-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className={cn(
        "sidebar-nav flex-1 overflow-y-auto overflow-x-hidden scroll-smooth py-4 relative z-10",
        sidebarOpen ? "px-3" : "px-2"
      )}>
        {/* Back to Home */}
        <Link
          href="/"
          className={cn(
            "relative group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#C4BDB5] font-medium hover:text-white hover:bg-gradient-to-r hover:from-[#E8A33D]/10 hover:to-[#14B8A6]/10 transition-all duration-300 overflow-visible",
            !sidebarOpen && "justify-center"
          )}
        >
          <Home className={cn(
            "w-5 h-5 group-hover:scale-110 transition-transform duration-300 text-[#C4BDB5] group-hover:text-white flex-shrink-0",
            !sidebarOpen && "w-6 h-6"
          )} />
          {sidebarOpen && <span className="text-sm font-medium">Back to Home</span>}
          {/* Enhancement 3: tooltip when collapsed */}
          {!sidebarOpen && (
            <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-[#112240] text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-xl border border-[#1A3050]">
              Back to Home
            </span>
          )}
        </Link>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#1A3050] to-transparent my-2" />

        {/* Enhancement 3: Collapsed mode — flat icon list with tooltips */}
        {!sidebarOpen && (
          <div className="space-y-0.5">
            {allNavItems.map((item: NavItem) => {
              const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  className={cn(
                    "relative group flex items-center justify-center px-3 py-2.5 rounded-xl transition-all duration-300 overflow-visible",
                    isActive
                      ? "bg-gradient-to-r from-[#E8A33D]/20 to-[#14B8A6]/20 text-white shadow-lg shadow-[#E8A33D]/10"
                      : "text-[#C4BDB5] hover:text-white hover:bg-gradient-to-r hover:from-[#112240] hover:to-[#112240]/50"
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b from-[#E8A33D] to-[#14B8A6]" />
                  )}
                  <span className={cn(
                    "w-6 h-6 transition-transform duration-300 group-hover:scale-110 flex-shrink-0",
                    isActive ? "text-[#F2C879]" : "text-[#C4BDB5] group-hover:text-white"
                  )}>
                    {item.icon}
                  </span>
                  <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-[#112240] text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-xl border border-[#1A3050]">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Enhancement 4: Navigation Groups — expanded mode only */}
        {sidebarOpen && searchFilteredNavGroups.map((group) => {
          const isSingleItem = group.items.length === 1;

          if (isSingleItem) {
            // Enhancement 4: single-item group renders as flat link, no collapsible
            const item = group.items[0];
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
            return (
              <div key={group.id} className="mb-1 pt-2">
                {/* Enhancement 10: separator before settings group */}
                {group.id === 'settings' && (
                  <div className="h-px bg-gradient-to-r from-transparent via-[#1A3050] to-transparent mb-2" />
                )}
                <p className="px-3 mb-0.5 text-[9px] uppercase tracking-wider text-[#8A8278]/60 font-medium">{group.label}</p>
                <Link
                  href={item.path}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 group text-sm",
                    isActive
                      ? "bg-gradient-to-r from-[#E8A33D]/20 to-[#14B8A6]/20 text-white font-semibold shadow-lg shadow-[#E8A33D]/10"
                      : "text-[#C4BDB5] font-medium hover:text-white hover:bg-gradient-to-r hover:from-[#112240] hover:to-[#112240]/50"
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b from-[#E8A33D] to-[#14B8A6]" />
                  )}
                  <span className={cn(
                    "transition-transform duration-300 group-hover:scale-110",
                    isActive ? "text-[#F2C879]" : "text-[#C4BDB5] group-hover:text-white"
                  )}>
                    {item.icon}
                  </span>
                  <span className={isActive ? "text-sm font-semibold" : "text-sm font-medium text-[#C4BDB5] group-hover:text-white"}>
                    {item.label}
                  </span>
                  {/* Notification badges */}
                  {item.id === 'notifications' && unreadCount && unreadCount > 0 && (
                    <span className="ml-auto min-w-[20px] h-5 px-1 bg-gradient-to-r from-[#FB7185] to-[#E11D48] rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-[#FB7185]/30">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                  {item.id === 'announcements' && announcementCount && announcementCount > 0 && (
                    <span className="ml-auto min-w-[20px] h-5 px-1 bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-[#E8A33D]/30">
                      {announcementCount > 99 ? '99+' : announcementCount}
                    </span>
                  )}
                </Link>
              </div>
            );
          }

          // Multi-item group: collapsible with header
          return (
            <div key={group.id} className="mb-1 pt-2">
              {/* Enhancement 10: separator before settings group */}
              {group.id === 'settings' && (
                <div className="h-px bg-gradient-to-r from-transparent via-[#1A3050] to-transparent mb-2" />
              )}
              <button
                onClick={() => toggleGroup(group.id)}
                className={cn(
                  "sticky top-0 z-10 w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[#8A8278] hover:text-white font-medium bg-[#0A1628] hover:bg-gradient-to-r hover:from-[#112240] hover:to-[#112240]/50 transition-all duration-300"
                )}
              >
                <span className="text-[#8A8278] group-hover:text-[#E8A33D] transition-colors duration-300">{group.icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8278] group-hover:text-white transition-colors duration-300">{group.label}</span>
                <ChevronDown className={cn(
                  "w-3 h-3 ml-auto transition-transform duration-300",
                  expandedGroups.includes(group.id) ? "rotate-180 text-[#E8A33D]" : "text-[#8A8278]"
                )} />
              </button>

              {(isSearchActive || expandedGroups.includes(group.id)) && (
                <div className="ml-2 space-y-0.5 mt-0.5">
                  {group.items.map((item: NavItem) => {
                    const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
                    return (
                      <Link
                        key={item.id}
                        href={item.path}
                        className={cn(
                          "relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 group text-sm",
                          isActive
                            ? "bg-gradient-to-r from-[#E8A33D]/20 to-[#14B8A6]/20 text-white font-semibold shadow-lg shadow-[#E8A33D]/10"
                            : "text-[#C4BDB5] font-medium hover:text-white hover:bg-gradient-to-r hover:from-[#112240] hover:to-[#112240]/50"
                        )}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b from-[#E8A33D] to-[#14B8A6]" />
                        )}
                        <span className={cn(
                          "transition-transform duration-300 group-hover:scale-110",
                          isActive ? "text-[#F2C879]" : "text-[#C4BDB5] group-hover:text-white"
                        )}>
                          {item.icon}
                        </span>
                        <span className={isActive ? "text-sm font-semibold" : "text-sm font-medium text-[#C4BDB5] group-hover:text-white"}>
                          {item.label}
                        </span>
                        {/* Enhancement 5: removed dual pulse dots — badges only */}
                        {item.id === 'notifications' && unreadCount && unreadCount > 0 && (
                          <span className="ml-auto min-w-[20px] h-5 px-1 bg-gradient-to-r from-[#FB7185] to-[#E11D48] rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-[#FB7185]/30">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
                        {item.id === 'announcements' && announcementCount && announcementCount > 0 && (
                          <span className="ml-auto min-w-[20px] h-5 px-1 bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-[#E8A33D]/30">
                            {announcementCount > 99 ? '99+' : announcementCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#1A3050] to-transparent my-2" />

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={cn(
            "relative group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#C4BDB5] font-medium hover:text-white hover:bg-gradient-to-r hover:from-[#FB7185]/10 hover:to-[#E11D48]/10 transition-all duration-300 overflow-visible",
            !sidebarOpen && "justify-center"
          )}
        >
          <LogOut className={cn(
            "w-5 h-5 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-12 text-[#C4BDB5] group-hover:text-white flex-shrink-0",
            !sidebarOpen && "w-6 h-6"
          )} />
          {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          {/* Enhancement 3: tooltip when collapsed */}
          {!sidebarOpen && (
            <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-[#112240] text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-xl border border-[#1A3050]">
              Logout
            </span>
          )}
        </button>
      </nav>

      {/* Enhancement 8: Bottom user card — name + role only, no email, bigger online dot */}
      {sidebarOpen && (
        <div className="flex-shrink-0 p-4 bg-gradient-to-t from-[#112240]/40 to-transparent">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#E8A33D] to-[#14B8A6] rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
              {user?.profileImageUrl ? (
                <Image
                  src={user.profileImageUrl}
                  alt={`${user?.firstName} ${user?.lastName}`}
                  width={40}
                  height={40}
                  unoptimized
                  className="relative w-10 h-10 rounded-full object-cover shadow-xl shadow-[#E8A33D]/20 transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-[#E8A33D] to-[#14B8A6] flex items-center justify-center text-[#111110] font-bold text-sm shadow-xl shadow-[#E8A33D]/20 transition-transform duration-300 group-hover:scale-110">
                  {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                  {user?.lastName?.charAt(0).toUpperCase() || ''}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[#8A8278] text-xs capitalize mt-0.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#14B8A6] inline-block flex-shrink-0" style={{ boxShadow: '0 0 6px #14B8A6' }} />
                {userRole}
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .sidebar-nav {
          scrollbar-width: thin;
          scrollbar-color: #1A3050 transparent;
        }
        .sidebar-nav::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar-nav::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-nav::-webkit-scrollbar-thumb {
          background-color: #1A3050;
          border-radius: 999px;
        }
        .sidebar-nav:hover::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #E8A33D, #14B8A6);
        }
        .animation-delay-200 {
          animation-delay: 200ms;
        }
      `}</style>
    </aside>
  );
}

// ============================================
// MAIN LAYOUT
// ============================================
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
  const isAiPage = pathname === '/dashboard/ai' || pathname.startsWith('/dashboard/ai/');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

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
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = async () => {
    await logout();
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const mobileMenuVariants: Variants = {
    hidden: {
      x: '-100%',
    },
    visible: {
      x: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1],
      }
    },
    exit: {
      x: '-100%',
      transition: {
        duration: 0.35,
        ease: [0.25, 0.1, 0.25, 1],
      }
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[#111110] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#E8A33D] to-[#FB7185] rounded-full blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-[#1A3050] border-t-[#E8A33D] border-r-[#14B8A6] mx-auto mb-4"></div>
          </div>
          <p className="text-[#8A8278] animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="googlebot" content="noindex, nofollow" />
      </Head>
      <div className="flex min-h-screen bg-[#111110] transition-colors duration-200">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex h-screen fixed top-0 left-0 z-[100]">
          <Sidebar
            sidebarOpen={sidebarOpen}
            pathname={pathname}
            user={user}
            userRole={userRole}
            handleLogout={handleLogout}
          />
        </div>

        {/* Main Content Area */}
        <div className={`flex-1 min-h-screen w-full ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-20'}`}>
          {/* Desktop Content */}
          <div className="hidden lg:block">
            <TopBar
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              isMobile={false}
              user={user}
              userRole={userRole}
            />

            <main className="min-h-screen w-full px-8 pb-8 pt-[5.5rem]">
              <div className="w-full max-w-7xl mx-auto">
                {children}
              </div>
            </main>

            <footer className="bg-gradient-to-t from-[#1C1B19]/30 to-transparent w-full">
              <div className="w-full px-8 py-6">
                <div className="flex flex-col items-center justify-between gap-4 text-sm text-[#8A8278] sm:flex-row">
                  <p className="flex items-center gap-2">
                    <span className="text-[#E8A33D]">✦</span>
                    &copy; 2026 Selfless CE Organization
                  </p>
                  <div className="flex flex-wrap justify-center gap-6">
                    <button className="transition-colors duration-300 hover:text-white hover:scale-105 transform">About</button>
                    <button className="transition-colors duration-300 hover:text-white hover:scale-105 transform">FAQ</button>
                    <button className="transition-colors duration-300 hover:text-white hover:scale-105 transform">Contact</button>
                    <button className="transition-colors duration-300 hover:text-white hover:scale-105 transform">Privacy</button>
                    <button className="transition-colors duration-300 hover:text-white hover:scale-105 transform">Terms</button>
                  </div>
                </div>
              </div>
            </footer>
          </div>

          {/* Mobile Content */}
          <div className="lg:hidden flex flex-col min-h-screen w-full">
            <TopBar
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              isMobile={true}
              onMenuToggle={toggleMobileMenu}
              user={user}
              userRole={userRole}
            />

            {/* 
              Keep mobile scrolling on the window so page-level sticky
              elements, like the students search bar, behave like desktop.
              `overflow: clip` prevents sideways bleed without creating a
              sticky containing block.
            */}
            <main className={cn("flex-1 w-full px-4 pb-4 [overflow-x:clip]", isAiPage ? "pt-20 sm:pt-24" : "pt-[7.5rem]")}>
              <div className="w-full max-w-7xl mx-auto">
                {children}
              </div>
            </main>

            <footer className="bg-gradient-to-t from-[#1C1B19]/30 to-transparent w-full flex-shrink-0">
              <div className="w-full px-4 py-4">
                <div className="flex flex-col items-center justify-between gap-3 text-xs text-[#8A8278] sm:flex-row">
                  <p>&copy; 2026 Selfless CE Organization</p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <button className="transition-colors duration-300 hover:text-white">About</button>
                    <button className="transition-colors duration-300 hover:text-white">FAQ</button>
                    <button className="transition-colors duration-300 hover:text-white">Contact</button>
                    <button className="transition-colors duration-300 hover:text-white">Privacy</button>
                    <button className="transition-colors duration-300 hover:text-white">Terms</button>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[9998] lg:hidden bg-black/60 backdrop-blur-sm"
                onClick={() => setMobileMenuOpen(false)}
              />

              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={mobileMenuVariants}
                className="fixed top-0 left-0 h-full w-[85%] max-w-sm z-[9999] lg:hidden shadow-2xl"
              >
                <Sidebar
                  sidebarOpen={true}
                  pathname={pathname}
                  user={user}
                  userRole={userRole}
                  handleLogout={handleLogout}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ============================================
            ENHANCED AI BUTTON - CLEAN & PROFESSIONAL
            ============================================ */}
        {!isAiPage && (
          <Link
            href="/dashboard/ai"
            className="fixed bottom-4 right-4 z-40 flex items-center gap-2.5 
              bg-[#0D1E35] 
              border border-[#E8A33D] 
              rounded-2xl 
              px-3.5 py-2.5 
              text-white 
              shadow-xl shadow-[#E8A33D]/20 
              transition-all duration-300 
              hover:scale-105 
              hover:border-[#14B8A6] 
              hover:shadow-2xl hover:shadow-[#E8A33D]/40
              group"
          >
            {/* Icon with status */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-xl bg-[#E8A33D]/20 blur-md group-hover:bg-[#14B8A6]/20 transition-all duration-300" />
              <Image 
                src="/atbriz.png" 
                alt="Atbriz AI" 
                width={32} 
                height={32} 
                className="relative h-8 w-8 rounded-xl object-cover border border-[#E8A33D]/30 group-hover:border-[#14B8A6]/50 transition-all duration-300" 
              />
              {/* Status dot */}
              <div className="absolute -right-0.5 -top-0.5">
                <div className="relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#14B8A6] border-2 border-[#0D1E35] shadow-lg shadow-[#14B8A6]/40" />
                  <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-[#14B8A6] animate-ping opacity-40" />
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="flex flex-col items-start leading-tight">
              <span className="text-xs font-bold text-white group-hover:text-[#E8A33D] transition-colors duration-300">
                Atbriz AI
              </span>
              <span className="text-[8px] text-[#8A8278] group-hover:text-[#14B8A6] transition-colors duration-300">
                Powered by AI
              </span>
            </div>

            {/* Subtle accent indicator */}
            <motion.div
              className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#E8A33D]/30 group-hover:bg-[#14B8A6]/50 transition-all duration-300"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6 }}
            />
          </Link>
        )}
      </div>
    </>
  );
}