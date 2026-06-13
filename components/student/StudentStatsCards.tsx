'use client';

import StatsCard from '@/components/shared/StatsCard';
import StatsCardSkeleton from '@/components/shared/LoadingState';

interface StatItem {
  id: string;
  icon: any;
  title: string;
  value: string | number;
  subtitle?: string;
  iconColor?: string;
  gradient?: string;
  valueClassName?: string;
}

interface StatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
  isLoading?: boolean;
}

export default function StatsGrid({ stats, columns = 3, isLoading }: StatsGridProps) {
  const columnClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  if (isLoading) {
    return (
      <div className={`grid ${columnClasses[columns]} gap-6`}>
        {[...Array(columns)].map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={`grid ${columnClasses[columns]} gap-6`}>
      {stats.map((stat) => (
        <StatsCard key={stat.id} {...stat} />
      ))}
    </div>
  );
}