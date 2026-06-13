'use client';

import { TrendingUp } from 'lucide-react';
import { getGpaColor, getGpaBarColor, formatGPA } from '@/components/shared/GradeUtils';

interface StudentGPATimelineProps {
  weeklyGPAs: { week: number; gpa: number }[];
}

export default function StudentGPATimeline({ weeklyGPAs }: StudentGPATimelineProps) {
  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-violet-400" />
        GPA Progress by Week
      </h2>
      <div className="space-y-4">
        {weeklyGPAs.map((weekData) => {
          const percentage = (weekData.gpa / 4.0) * 100;
          const barColor = getGpaBarColor(weekData.gpa);
          return (
            <div key={weekData.week} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Week {weekData.week}</span>
                <span className={getGpaColor(weekData.gpa)}>
                  {weekData.gpa > 0 ? formatGPA(weekData.gpa) : 'Not graded'}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: weekData.gpa > 0 ? `${percentage}%` : '0%' }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}