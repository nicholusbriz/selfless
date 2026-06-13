'use client';

import React from 'react';
import { WEEKS } from '@/lib/constants';

interface WeekSelectorProps {
  selectedWeek: number;
  onWeekChange: (week: number) => void;
  weeksCount?: number;
}

export default function WeekSelector({ selectedWeek, onWeekChange, weeksCount = 7 }: WeekSelectorProps) {
  const availableWeeks = WEEKS.slice(0, weeksCount);

  return (
    <div className="flex flex-wrap gap-2">
      {availableWeeks.map((week) => (
        <button
          key={week}
          onClick={() => onWeekChange(week)}
          className={`
            px-4 py-2 rounded-lg font-medium transition-all
            ${selectedWeek === week
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg'
              : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
            }
          `}
        >
          Week {week}
        </button>
      ))}
    </div>
  );
}
