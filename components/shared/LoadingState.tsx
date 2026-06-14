'use client';

import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      <p className="text-gray-400 mt-4">{message}</p>
    </div>
  );
}

// Simple skeleton components
export function StatsCardSkeleton() {
  return (
    <div className="bg-white/5 rounded-xl p-6 animate-pulse">
      <div className="h-4 bg-white/10 rounded w-24 mb-4"></div>
      <div className="h-8 bg-white/10 rounded w-16"></div>
    </div>
  );
}

export function TabSkeleton() {
  return (
    <div className="flex space-x-2 mb-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-10 bg-white/10 rounded-lg w-24 animate-pulse"></div>
      ))}
    </div>
  );
}

export function StudentListItemSkeleton() {
  return (
    <div className="bg-white/5 rounded-xl p-4 animate-pulse">
      <div className="h-4 bg-white/10 rounded w-32 mb-3"></div>
      <div className="h-3 bg-white/10 rounded w-48"></div>
    </div>
  );
}

export function CourseListItemSkeleton() {
  return (
    <div className="bg-white/5 rounded-xl p-4 animate-pulse">
      <div className="h-4 bg-white/10 rounded w-40 mb-3"></div>
      <div className="h-3 bg-white/10 rounded w-56"></div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white/5 rounded-xl p-6 animate-pulse">
      <div className="h-4 bg-white/10 rounded w-32 mb-4"></div>
      <div className="h-8 bg-white/10 rounded w-16"></div>
    </div>
  );
}

export function DashboardLayoutSkeleton() {
  return (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="animate-pulse text-center">
        <div className="h-8 bg-gray-800 rounded w-32 mx-auto mb-4"></div>
        <div className="h-4 bg-gray-800 rounded w-48 mx-auto"></div>
      </div>
    </div>
  );
}

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