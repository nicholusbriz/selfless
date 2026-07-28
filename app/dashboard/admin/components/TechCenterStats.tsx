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
  Activity,
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, index) => (
          <StatsCard key={index} {...card} />
        ))}
      </div>

      {/* Recent Activity */}
      {stats.recentActivity && stats.recentActivity.length > 0 && (
        <div className="bg-[#150F20] border border-[#2A2438] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-[#E8A33D]" />
            <h3 className="text-lg font-semibold text-[#F5F0E8]">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {stats.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 bg-[#0B0912] rounded-lg border border-[#2A2438]"
              >
                <div className="w-8 h-8 rounded-full bg-[#E8A33D]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Activity className="w-4 h-4 text-[#E8A33D]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#F5F0E8]">
                    {activity.user ? (
                      `${activity.user.firstName || ''} ${activity.user.lastName || ''}`.trim() || 'Unknown User'
                    ) : (
                      'System'
                    )}
                  </p>
                  <p className="text-xs text-[#A79C8C]">
                    {activity.action ? activity.action.replace(/_/g, ' ').toUpperCase() : 'Unknown Action'}
                    {activity.details && activity.details.name && ` - ${activity.details.name}`}
                  </p>
                  <p className="text-xs text-[#6B6358] mt-0.5">
                    {activity.createdAt ? new Date(activity.createdAt).toLocaleString() : 'Unknown time'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}