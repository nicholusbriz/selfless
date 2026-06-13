'use client';

import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtitle?: string;
  iconColor?: string;
  gradient?: string;
  valueClassName?: string;
}

export default function StatsCard({ 
  icon: Icon, 
  title, 
  value, 
  subtitle,
  iconColor = 'text-violet-400',
  gradient = 'from-violet-600/20 to-indigo-600/20',
  valueClassName = 'text-white'
}: StatsCardProps) {
  return (
    <div className={`bg-gradient-to-br ${gradient} backdrop-blur-lg border border-white/10 rounded-xl p-6`}>
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`w-5 h-5 ${iconColor}`} />
        <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
      </div>
      <p className={`text-3xl font-bold ${valueClassName}`}>{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}