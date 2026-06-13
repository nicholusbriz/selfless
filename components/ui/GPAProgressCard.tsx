'use client';

import React from 'react';
import { TrendingUp, CheckCircle2, Loader2 } from 'lucide-react';
import { getGPACategory, getGPACategoryColor } from '@/lib/grade-utils';
import { WEEKS } from '@/lib/constants';

interface GPAProgressCardProps {
  studentName: string;
  currentGPA: number;
  totalCredits: number;
  weeklyProgress: { week: number; gpa: number }[];
}

export default function GPAProgressCard({
  studentName,
  currentGPA,
  totalCredits,
  weeklyProgress
}: GPAProgressCardProps) {
  const gpaCategory = getGPACategory(currentGPA);
  const gpaColor = getGPACategoryColor(currentGPA);

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border-b border-white/10 p-4">
        <h3 className="text-white font-semibold text-lg">{studentName}</h3>
      </div>

      {/* Current GPA */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Current GPA</p>
            <p className={`text-4xl font-bold ${gpaColor}`}>
              {currentGPA.toFixed(2)}
            </p>
            <p className={`text-sm ${gpaColor}`}>{gpaCategory}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Total Credits</p>
            <p className="text-2xl font-semibold text-white">{totalCredits}</p>
          </div>
        </div>

        {/* Weekly Progress */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>Weekly Progress</span>
          </div>
          
          <div className="space-y-2">
            {WEEKS.map((week) => {
              const progress = weeklyProgress.find(p => p.week === week);
              const hasGPA = progress && progress.gpa > 0;
              
              return (
                <div
                  key={week}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {hasGPA ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <Loader2 className="w-5 h-5 text-gray-500" />
                    )}
                    <span className="text-white font-medium">Week {week}</span>
                  </div>
                  {hasGPA ? (
                    <span className="text-green-400 font-semibold">
                      {progress.gpa.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-gray-500">In Progress</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}