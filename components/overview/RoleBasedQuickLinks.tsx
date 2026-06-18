'use client';

import { motion } from 'framer-motion';
import { 
  Users, BookOpen, Calendar, Settings, FileText, Award, 
  GraduationCap, Plus, TrendingUp, ClipboardList, UserCheck,
  DollarSign, Bell, MessageSquare
} from 'lucide-react';

interface QuickLink {
  id: string;
  label: string;
  icon: any;
  href: string;
  description: string;
}

interface RoleBasedQuickLinksProps {
  userRole?: string;
  userId?: string;
}

export default function RoleBasedQuickLinks({ userRole, userId }: RoleBasedQuickLinksProps) {
  const getQuickLinks = (): QuickLink[] => {
    switch (userRole) {
      case 'ADMIN':
        return [
          {
            id: 'admin-dashboard',
            label: 'Admin Dashboard',
            icon: Users,
            href: '/dashboard/admin',
            description: 'Admin management panel'
          },
          {
            id: 'overview',
            label: 'Overview',
            icon: TrendingUp,
            href: '/dashboard/student',
            description: 'System overview and statistics'
          },
          {
            id: 'teachers',
            label: 'Teachers',
            icon: GraduationCap,
            href: '/dashboard/teachers',
            description: 'Manage teachers'
          },
          {
            id: 'students',
            label: 'Students',
            icon: Users,
            href: '/dashboard/student',
            description: 'Manage students'
          },
          {
            id: 'cleaning',
            label: 'Cleaning',
            icon: Calendar,
            href: '/dashboard/overview',
            description: 'View cleaning schedule'
          },
          {
            id: 'settings',
            label: 'Settings',
            icon: Settings,
            href: '/dashboard/settings',
            description: 'System settings'
          },
          {
            id: 'profile',
            label: 'Profile',
            icon: Settings,
            href: '/dashboard/profile',
            description: 'Update profile'
          }
        ];

      case 'TEACHER':
        return [
          {
            id: 'overview',
            label: 'Overview',
            icon: TrendingUp,
            href: '/dashboard/overview',
            description: 'View assigned students and stats'
          },
          {
            id: 'students',
            label: 'My Students',
            icon: Users,
            href: '/dashboard/overview',
            description: 'View assigned students'
          },
          {
            id: 'cleaning',
            label: 'Cleaning',
            icon: Calendar,
            href: '/dashboard/overview',
            description: 'Mark cleaning attendance'
          },
          {
            id: 'profile',
            label: 'My Profile',
            icon: Settings,
            href: '/dashboard/profile',
            description: 'Update profile'
          },
          {
            id: 'settings',
            label: 'Settings',
            icon: Settings,
            href: '/dashboard/settings',
            description: 'Account settings'
          }
        ];

      case 'STUDENT':
        return [
          {
            id: 'overview',
            label: 'Overview',
            icon: TrendingUp,
            href: '/dashboard/overview',
            description: 'View your progress and tutor'
          },
          {
            id: 'courses',
            label: 'My Courses',
            icon: BookOpen,
            href: '/dashboard/overview',
            description: 'View enrolled courses'
          },
          {
            id: 'cleaning',
            label: 'Cleaning',
            icon: Calendar,
            href: '/dashboard/overview',
            description: 'View cleaning schedule'
          },
          {
            id: 'profile',
            label: 'My Profile',
            icon: Settings,
            href: '/dashboard/profile',
            description: 'Update personal information'
          },
          {
            id: 'settings',
            label: 'Settings',
            icon: Settings,
            href: '/dashboard/settings',
            description: 'Account settings'
          }
        ];

      default:
        return [
          {
            id: 'overview',
            label: 'Overview',
            icon: TrendingUp,
            href: '/dashboard/overview',
            description: 'Go to dashboard'
          },
          {
            id: 'profile',
            label: 'Profile',
            icon: Settings,
            href: '/dashboard/profile',
            description: 'Update profile'
          }
        ];
    }
  };

  const quickLinks = getQuickLinks();

  if (quickLinks.length === 0) {
    return null;
  }

  const getRoleLabel = () => {
    switch (userRole) {
      case 'ADMIN': return 'Admin';
      case 'TEACHER': return 'Teacher';
      case 'STUDENT': return 'Student';
      default: return 'User';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Quick Links</h2>
          <p className="text-gray-400 text-sm">{getRoleLabel()} shortcuts and actions</p>
        </div>
      </div>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {quickLinks.map((link, index) => {
          const Icon = link.icon;
          return (
            <motion.a
              key={link.id}
              href={link.href}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 hover:border-purple-500/30 transition-all duration-300 group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-3 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all">
                  <Icon className="w-6 h-6 text-purple-400 group-hover:text-purple-300 transition-colors" />
                </div>
                <h3 className="text-white font-semibold text-sm mb-1">{link.label}</h3>
                <p className="text-gray-400 text-xs">{link.description}</p>
              </div>
            </motion.a>
          );
        })}
      </div>
    </motion.div>
  );
}
