'use client';

import { Award, Clock } from 'lucide-react';
import { getGradeColor, getGradeBgColor } from './GradeUtils';

interface GradeBadgeProps {
  grade?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function GradeBadge({ grade, showIcon = true, size = 'md' }: GradeBadgeProps) {
  if (!grade) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Clock className="w-4 h-4" />
        <span className="text-sm">Not graded</span>
      </div>
    );
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <div className={`flex items-center gap-2 rounded-full ${sizeClasses[size]} ${getGradeBgColor(grade)}`}>
      {showIcon && <Award className={`w-4 h-4 ${getGradeColor(grade)}`} />}
      <span className={`font-semibold ${getGradeColor(grade)}`}>{grade}</span>
    </div>
  );
}