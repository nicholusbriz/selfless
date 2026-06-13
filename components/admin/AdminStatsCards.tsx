'use client';

import StatsGrid from '@/components/shared/StatsGrid';
import { Users, BookOpen, DollarSign, Award } from 'lucide-react';

interface AdminStatsCardsProps {
  totalStudents: number;
  totalTeachers: number;
  totalAssignments: number;
  totalRevenue: number;
  isLoading?: boolean;
}

export default function AdminStatsCards({
  totalStudents,
  totalTeachers,
  totalAssignments,
  totalRevenue,
  isLoading
}: AdminStatsCardsProps) {
  const stats = [
    {
      id: 'students',
      icon: Users,
      title: 'Total Students',
      value: totalStudents,
      iconColor: 'text-violet-400',
      gradient: 'from-violet-600/20 to-indigo-600/20'
    },
    {
      id: 'teachers',
      icon: Award,
      title: 'Total Teachers',
      value: totalTeachers,
      iconColor: 'text-blue-400',
      gradient: 'from-blue-600/20 to-cyan-600/20'
    },
    {
      id: 'assignments',
      icon: BookOpen,
      title: 'Assignments',
      value: totalAssignments,
      iconColor: 'text-green-400',
      gradient: 'from-green-600/20 to-emerald-600/20'
    },
    {
      id: 'revenue',
      icon: DollarSign,
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      iconColor: 'text-orange-400',
      gradient: 'from-orange-600/20 to-red-600/20'
    }
  ];

  return <StatsGrid stats={stats} columns={4} isLoading={isLoading} />;
}