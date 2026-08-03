// app/dashboard/layout.tsx
'use client';

import { useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Head from 'next/head';
import Image from 'next/image';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
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
  Database
} from 'lucide-react';
import { useUnreadNotificationCount, useAnnouncementCount } from '@/hooks/useNotifications';

// ============================================
// ENHANCED COLOR TOKENS
// ============================================
// Primary: Warm Gold → #E8A33D, #F2C879, #C97F1F
// Secondary: Teal → #14B8A6, #2DD4BF, #0D9488
// Accent: Coral → #FB7185, #FDA4AF, #E11D48
// Gradient: Gold to Coral → from-[#E8A33D] to-[#FB7185]
// Surface: Deep Purple-Black → #0F0A1A, #1A1228, #241B35
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
// TOP BAR COMPONENT - FIXED NOTIFICATION BADGE
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
        ? "bg-[#0F0A1A]/95 backdrop-blur-xl shadow-2xl" 
        : "bg-[#0F0A1A]"
    )}>
      <div className="flex items-center justify-between h-16 px-4 md:px-8">
        {/* Left - Menu Toggle + Brand */}
        <div className="flex items-center gap-3">
          {isMobile ? (
            <button
              onClick={onMenuToggle}
              className="p-2 rounded-xl text-[#8A8278] hover:text-white hover:bg-[#1A1228] transition-all duration-300 hover:scale-110"
            >
              <Menu className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl text-[#8A8278] hover:text-white hover:bg-[#1A1228] transition-all duration-300 hover:scale-110"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#E8A33D] to-[#FB7185] rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#E8A33D] to-[#FB7185] p-[2px] shadow-2xl shadow-[#E8A33D]/30 flex-shrink-0">
                <div className="w-full h-full rounded-[10px] bg-[#0F0A1A] flex items-center justify-center overflow-hidden">
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
            className="relative p-2 rounded-xl text-[#8A8278] hover:text-white hover:bg-[#1A1228] transition-all duration-300 group"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            {unreadCount && unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-[20px] px-1 bg-gradient-to-r from-[#FB7185] to-[#E11D48] rounded-full text-[10px] font-bold text-white ring-2 ring-[#0F0A1A] shadow-lg shadow-[#FB7185]/50 animate-pulse z-10">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

          <Link
            href="/dashboard/announcements"
            className="relative p-2 rounded-xl text-[#8A8278] hover:text-white hover:bg-[#1A1228] transition-all duration-300 group"
            aria-label="Announcements"
          >
            <Megaphone className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            {announcementCount && announcementCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-[20px] px-1 bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] rounded-full text-[10px] font-bold text-white ring-2 ring-[#0F0A1A] shadow-lg shadow-[#E8A33D]/50 animate-pulse z-10">
                {announcementCount > 99 ? '99+' : announcementCount}
              </span>
            )}
          </Link>

          <Link
            href="/dashboard/courses"
            className="p-2 rounded-xl text-[#8A8278] hover:text-white hover:bg-[#1A1228] transition-all duration-300 hover:scale-110 group"
            aria-label="Courses"
          >
            <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
          </Link>

          <Link
            href="/dashboard/cleaning"
            className="p-2 rounded-xl text-[#8A8278] hover:text-white hover:bg-[#1A1228] transition-all duration-300 hover:scale-110 group"
            aria-label="Cleaning Rota"
          >
            <Calendar className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
          </Link>

          <Link
            href="/dashboard/students"
            className="p-2 rounded-xl text-[#8A8278] hover:text-white hover:bg-[#1A1228] transition-all duration-300 hover:scale-110 group"
            aria-label="Students"
          >
            <Users className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
          </Link>

          {/* Profile */}
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 ml-2 pl-3 border-l border-[#1A1228] hover:bg-[#1A1228]/30 rounded-lg px-3 py-2 transition-all duration-300 group"
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
                <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-[#E8A33D] to-[#14B8A6] flex items-center justify-center text-[#0F0A1A] font-bold text-sm shadow-xl shadow-[#E8A33D]/20 transition-transform duration-300 group-hover:scale-110">
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
// SIDEBAR NAVIGATION ITEMS - FIXED ROLE VISIBILITY
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
// SIDEBAR COMPONENT — With fixed notification badge
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

  return (
    <aside className={cn(
      "h-screen bg-[#0F0A1A] flex flex-col transition-all duration-300 overflow-hidden relative",
      sidebarOpen ? "w-72" : "w-20"
    )}>
      {/* Subtle geometric pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
        backgroundSize: '24px 24px'
      }} />
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
        backgroundImage: `linear-gradient(45deg, transparent 48%, white 48%, white 52%, transparent 52%), linear-gradient(-45deg, transparent 48%, white 48%, white 52%, transparent 52%)`,
        backgroundSize: '60px 60px'
      }} />
      {/* Sidebar Header */}
      <div className={cn(
        "flex items-center gap-3 p-4 flex-shrink-0 relative z-10",
        !sidebarOpen && "justify-center"
      )}>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#E8A33D] to-[#FB7185] rounded-xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
          <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-[#E8A33D] to-[#FB7185] p-[2px] shadow-2xl shadow-[#E8A33D]/30 flex-shrink-0">
            <div className="w-full h-full rounded-[10px] bg-[#0F0A1A] flex items-center justify-center overflow-hidden">
              <Image src="/freedom.png" alt="Freedom Tech Logo" width={32} height={32} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
        {sidebarOpen && (
          <span className="text-white font-bold text-lg tracking-tight">
            Dashboard
          </span>
        )}
      </div>

      {/* Search Input */}
      {sidebarOpen && (
        <div className="px-4 pb-2 relative z-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8278]" />
            <input
              type="text"
              placeholder="Search navigation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1A1228]/50 border border-[#1A1228] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-[#8A8278] focus:outline-none focus:border-[#E8A33D]/50 focus:bg-[#1A1228]/70 transition-all duration-300"
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
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-white font-bold hover:bg-gradient-to-r hover:from-[#E8A33D]/10 hover:to-[#14B8A6]/10 transition-all duration-300 group",
            !sidebarOpen && "justify-center"
          )}
        >
          <Home className={cn(
            "w-5 h-5 group-hover:scale-110 transition-transform duration-300 text-white",
            !sidebarOpen && "w-6 h-6"
          )} />
          {sidebarOpen && <span className="text-sm font-bold">Back to Home</span>}
        </Link>

        {/* Divider - subtle gradient */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#1A1228] to-transparent my-2" />

        {/* Navigation Groups */}
        {searchFilteredNavGroups.map((group) => (
          <div key={group.id} className="mb-2">
            <button
              onClick={() => toggleGroup(group.id)}
              className={cn(
                "sticky top-0 z-10 w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[#8A8278] hover:text-white font-medium bg-[#0F0A1A] hover:bg-gradient-to-r hover:from-[#1A1228] hover:to-[#1A1228]/50 transition-all duration-300",
                !sidebarOpen && "justify-center"
              )}
            >
              <span className="text-[#8A8278] group-hover:text-[#E8A33D] transition-colors duration-300">{group.icon}</span>
              {sidebarOpen && (
                <>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8A8278] group-hover:text-white transition-colors duration-300">{group.label}</span>
                  <ChevronDown className={cn(
                    "w-3 h-3 ml-auto transition-transform duration-300",
                    expandedGroups.includes(group.id) ? "rotate-180 text-[#E8A33D]" : "text-[#8A8278]"
                  )} />
                </>
              )}
            </button>

            {(isSearchActive || expandedGroups.includes(group.id)) && sidebarOpen && (
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
                          ? "bg-gradient-to-r from-[#E8A33D]/20 to-[#14B8A6]/20 text-white font-bold shadow-lg shadow-[#E8A33D]/10"
                          : "text-white font-bold hover:bg-gradient-to-r hover:from-[#1A1228] hover:to-[#1A1228]/50"
                      )}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b from-[#E8A33D] to-[#14B8A6]" />
                      )}
                      <span className={cn(
                        "transition-transform duration-300 group-hover:scale-110",
                        isActive ? "text-[#F2C879]" : "text-white"
                      )}>
                        {item.icon}
                      </span>
                      <span className="text-sm font-bold">{item.label}</span>
                      {/* SIDEBAR NOTIFICATION BADGE */}
                      {item.id === 'notifications' && unreadCount && unreadCount > 0 && (
                        <span className="ml-auto min-w-[20px] h-5 px-1 bg-gradient-to-r from-[#FB7185] to-[#E11D48] rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-[#FB7185]/30">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                      {/* SIDEBAR ANNOUNCEMENT BADGE */}
                      {item.id === 'announcements' && announcementCount && announcementCount > 0 && (
                        <span className="ml-auto min-w-[20px] h-5 px-1 bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-[#E8A33D]/30">
                          {announcementCount > 99 ? '99+' : announcementCount}
                        </span>
                      )}
                      {isActive && (
                        <span className="ml-auto flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E8A33D] animate-pulse" />
                          <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6] animate-pulse animation-delay-200" />
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {/* Divider - subtle gradient */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#1A1228] to-transparent my-2" />

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white font-bold hover:bg-gradient-to-r hover:from-[#FB7185]/10 hover:to-[#E11D48]/10 transition-all duration-300 group",
            !sidebarOpen && "justify-center"
          )}
        >
          <LogOut className={cn(
            "w-5 h-5 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-12 text-white",
            !sidebarOpen && "w-6 h-6"
          )} />
          {sidebarOpen && <span className="text-sm font-bold">Logout</span>}
        </button>
      </nav>

      {/* User Info - Fixed at bottom */}
      {sidebarOpen && (
        <div className="flex-shrink-0 p-4 bg-gradient-to-t from-[#1A1228]/30 to-transparent">
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
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-[#E8A33D] to-[#14B8A6] flex items-center justify-center text-[#0F0A1A] font-bold text-sm shadow-xl shadow-[#E8A33D]/20 transition-transform duration-300 group-hover:scale-110">
                  {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                  {user?.lastName?.charAt(0).toUpperCase() || ''}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[#8A8278] text-xs truncate">{user?.email}</p>
              <p className="text-[#6B6358] text-[10px] capitalize mt-0.5 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-[#14B8A6] inline-block"></span>
                {userRole}
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .sidebar-nav {
          scrollbar-width: thin;
          scrollbar-color: #1A1228 transparent;
        }
        .sidebar-nav::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar-nav::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-nav::-webkit-scrollbar-thumb {
          background-color: #1A1228;
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
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const user = session?.user || null;
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
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
    await signOut({ redirect: false });
    router.push('/');
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
      <div className="h-screen w-screen bg-[#0F0A1A] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#E8A33D] to-[#FB7185] rounded-full blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-[#1A1228] border-t-[#E8A33D] border-r-[#14B8A6] mx-auto mb-4"></div>
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
      <div className="flex min-h-screen bg-[#0F0A1A] transition-colors duration-200">
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

          <footer className="bg-gradient-to-t from-[#1A1228]/30 to-transparent w-full">
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

          <main className={cn("flex-1 w-full overflow-x-hidden overflow-y-auto px-4 pb-4", isAiPage ? "pt-20 sm:pt-24" : "pt-[7.5rem]")}> 
            <div className="w-full max-w-7xl mx-auto">
              {children}
            </div>
          </main>

          <footer className="bg-gradient-to-t from-[#1A1228]/30 to-transparent w-full flex-shrink-0">
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
      
      {!isAiPage && (
        <Link
          href="/dashboard/ai"
          className="fixed bottom-4 right-4 z-40 flex items-center gap-2.5 rounded-2xl border-2 border-white/20 bg-gradient-to-br from-[#E8A33D] via-[#FB7185] to-[#14B8A6] px-3.5 py-3 text-white shadow-2xl shadow-[#E8A33D]/40 transition-all duration-300 hover:scale-105"
        >
          <div className="relative">
            <Image src="/atbriz.png" alt="Atbriz Ai" width={32} height={32} className="h-8 w-8 rounded-xl object-cover" />
            <div className="absolute -right-1 -top-1.5 rounded-full bg-green-400 p-1" />
          </div>
          <span className="whitespace-nowrap text-xs font-bold">Atbriz Ai</span>
        </Link>
      )}
      </div>
    </>
  );
}