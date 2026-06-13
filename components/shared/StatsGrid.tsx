'use client';

import StatsCard from './StatsCard';

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
          <div key={i} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 animate-pulse">
            <div className="w-8 h-8 bg-white/10 rounded mb-2"></div>
            <div className="w-24 h-8 bg-white/10 rounded"></div>
          </div>
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