// app/dashboard/admin/components/TechCenterStats.tsx
'use client';

import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  Calendar,
  Megaphone,
  UserCheck,
  Award,
  Clock,
  Loader2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { adminTechCenterApi, type TechCenterStats } from '@/lib/api/admin-tech-center';

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

const StatsCard = ({ title, value, icon, color, subtitle }: StatsCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[#150F20] border border-[#2A2438] rounded-xl p-6 hover:border-[#E8A33D]/30 transition-all duration-300"
  >
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#6B6358] truncate">{title}</p>
        <p className="text-2xl font-bold text-[#F5F0E8] mt-1">{value}</p>
        {subtitle && (
          <p className="text-xs text-[#6B6358] mt-1">{subtitle}</p>
        )}
      </div>
      <div className={`w-12 h-12 rounded-xl bg-[#${color}]/10 flex items-center justify-center flex-shrink-0 ml-3`}>
        <div className={`text-[#${color}] w-6 h-6`}>{icon}</div>
      </div>
    </div>
  </motion.div>
);

export default function TechCenterStats() {
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['adminTechCenterStats'],
    queryFn: adminTechCenterApi.getTechCenterStats,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#150F20] border border-[#2A2438] rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-[#2A2438] rounded w-20 mb-2"></div>
            <div className="h-8 bg-[#2A2438] rounded w-12"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#150F20] border border-[#F87171]/30 rounded-xl p-6 text-center">
        <p className="text-[#F87171]">Failed to load statistics</p>
        <p className="text-[#6B6358] text-sm mt-1">{(error as Error)?.message || 'Please try again later'}</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statsCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: <Users className="w-6 h-6" />,
      color: '6366F1',
      subtitle: `${stats.activeStudents} active`
    },
    {
      title: 'Total Courses',
      value: stats.totalCourses,
      icon: <BookOpen className="w-6 h-6" />,
      color: '34D399',
      subtitle: `${stats.completedCourses} completed`
    },
    {
      title: 'Cleaning Days',
      value: stats.totalCleaningDays,
      icon: <Calendar className="w-6 h-6" />,
      color: 'F59E0B',
      subtitle: `${stats.openCleaningDays} open`
    },
    {
      title: 'Announcements',
      value: stats.totalAnnouncements,
      icon: <Megaphone className="w-6 h-6" />,
      color: 'E8A33D',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsCards.map((card, index) => (
        <StatsCard key={index} {...card} />
      ))}
    </div>
  );
}