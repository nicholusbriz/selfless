'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { WEEKS } from '@/lib/constants';

interface GradeFilterBarProps {
  onFilterChange: (filters: {
    week?: number;
    status?: string;
    course?: string;
    search?: string;
  }) => void;
  showStatusFilter?: boolean;
  showWeekFilter?: boolean;
  showCourseFilter?: boolean;
  courses?: string[];
}

export default function GradeFilterBar({
  onFilterChange,
  showStatusFilter = true,
  showWeekFilter = true,
  showCourseFilter = false,
  courses = []
}: GradeFilterBarProps) {
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('all');
  const [week, setWeek] = React.useState<number | undefined>(undefined);
  const [course, setCourse] = React.useState('all');

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onFilterChange({ search: value, status, week, course: course === 'all' ? undefined : course });
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    onFilterChange({ search, status: value === 'all' ? undefined : value, week, course: course === 'all' ? undefined : course });
  };

  const handleWeekChange = (value: string) => {
    const weekNum = value === 'all' ? undefined : parseInt(value);
    setWeek(weekNum);
    onFilterChange({ search, status, week: weekNum, course: course === 'all' ? undefined : course });
  };

  const handleCourseChange = (value: string) => {
    setCourse(value);
    onFilterChange({ search, status, week, course: value === 'all' ? undefined : value });
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by student name or ID..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {showWeekFilter && (
          <select
            value={week === undefined ? 'all' : week}
            onChange={(e) => handleWeekChange(e.target.value)}
            className="bg-slate-900/80 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="all" className="bg-slate-900 text-gray-300">All Weeks</option>
            {WEEKS.map((w) => (
              <option key={w} value={w} className="bg-slate-900 text-white hover:bg-slate-800">
                Week {w}
              </option>
            ))}
          </select>
        )}

        {showStatusFilter && (
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="bg-slate-900/80 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="all" className="bg-slate-900 text-gray-300">All Status</option>
            <option value="graded" className="bg-slate-900 text-white hover:bg-slate-800">Graded</option>
            <option value="not-graded" className="bg-slate-900 text-white hover:bg-slate-800">Not Graded</option>
            <option value="partial" className="bg-slate-900 text-white hover:bg-slate-800">Partial</option>
          </select>
        )}

        {showCourseFilter && courses.length > 0 && (
          <select
            value={course}
            onChange={(e) => handleCourseChange(e.target.value)}
            className="bg-slate-900/80 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="all" className="bg-slate-900 text-gray-300">All Courses</option>
            {courses.map((c) => (
              <option key={c} value={c} className="bg-slate-900 text-white hover:bg-slate-800">
                {c}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
