'use client';

import { Loader2 } from 'lucide-react';
import StatsCardSkeleton from '@/components/skeletons/StatsCardSkeleton';
import StudentListItemSkeleton from '@/components/skeletons/StudentListItemSkeleton';
import CourseListItemSkeleton from '@/components/skeletons/CourseListItemSkeleton';
import TabSkeleton from '@/components/skeletons/TabSkeleton';
import CardSkeleton from '@/components/skeletons/CardSkeleton';
import DashboardLayoutSkeleton from '@/components/skeletons/DashboardLayoutSkeleton';

export function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      <p className="text-gray-400 mt-4">{message}</p>
    </div>
  );
}

// Export all skeletons for easy access
export {
  StatsCardSkeleton,
  StudentListItemSkeleton,
  CourseListItemSkeleton,
  TabSkeleton,
  CardSkeleton,
  DashboardLayoutSkeleton,
};

interface LoadingStateProps {
  type?: 'spinner' | 'dashboard' | 'tabs' | 'stats' | 'students' | 'courses' | 'full';
  count?: number;
}

export default function LoadingState({ type = 'spinner', count = 3 }: LoadingStateProps) {
  if (type === 'dashboard') {
    return <DashboardLayoutSkeleton />;
  }

  if (type === 'tabs') {
    return <TabSkeleton />;
  }

  if (type === 'stats') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array(count).fill(0).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (type === 'students') {
    return (
      <div className="space-y-4">
        {Array(count).fill(0).map((_, i) => (
          <StudentListItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (type === 'courses') {
    return (
      <div className="divide-y divide-white/10">
        {Array(count).fill(0).map((_, i) => (
          <CourseListItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (type === 'full') {
    return (
      <div className="space-y-6">
        <TabSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array(3).fill(0).map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
        <div className="bg-white/5 rounded-xl p-4">
          <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded h-10 w-full mb-4"></div>
        </div>
        <div className="space-y-4">
          {Array(count).fill(0).map((_, i) => (
            <StudentListItemSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return <LoadingSpinner />;
}