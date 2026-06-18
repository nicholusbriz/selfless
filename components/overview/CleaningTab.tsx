'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Users, CheckCircle, XCircle, Clock, ChevronDown, 
  ChevronUp, Sparkles, Filter 
} from 'lucide-react';
import { useWeeks } from '@/hooks/useCleaning';
import LoadingState from '@/components/shared/LoadingState';
import ErrorState from '@/components/shared/ErrorState';
import DayCard from '@/components/Cleaning/DayCard';

interface CleaningStudent {
  id: string;
  name: string;
  status: 'attended' | 'pending' | 'no-show';
}

interface CleaningDay {
  id: string;
  dayName: string;
  date: string;
  registered: number;
  attended: number;
  pending: number;
  noShow: number;
  students: CleaningStudent[];
  isFull: boolean;
  isOpen: boolean;
  weekLabel?: string;
}


export default function CleaningTab() {
  const { data: weeks, isLoading, error, refetch } = useWeeks();
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'attended' | 'pending' | 'no-show'>('all');

  // Transform weeks data into cleaning days format
  const cleaningData: CleaningDay[] = weeks?.flatMap((week: any) => 
    week.days.map((day: any) => {
      const registrations = day.registrations || [];
      const attendanceRecords = day.attendanceRecords || [];
      
      // Create student list with attendance status
      const students: CleaningStudent[] = registrations.map((reg: any) => {
        const attendance = attendanceRecords.find((a: any) => a.userId === reg.userId);
        return {
          id: reg.user.id,
          name: `${reg.user.firstName} ${reg.user.lastName}`,
          status: attendance?.status?.toLowerCase() as 'attended' | 'pending' | 'no-show' || 'pending',
        };
      });

      // Calculate counts
      const attended = students.filter(s => s.status === 'attended').length;
      const pending = students.filter(s => s.status === 'pending').length;
      const noShow = students.filter(s => s.status === 'no-show').length;

      return {
        id: day.id,
        dayName: day.dayOfWeek,
        date: new Date(day.cleaningDate).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        registered: registrations.length,
        attended,
        pending,
        noShow,
        students,
        isFull: day.isFull,
        isOpen: day.isOpen,
        weekLabel: week.weekLabel,
      };
    })
  ) || [];

  const toggleDay = (dayId: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dayId)) {
      newExpanded.delete(dayId);
    } else {
      newExpanded.add(dayId);
    }
    setExpandedDays(newExpanded);
  };

  const expandAll = () => {
    setExpandedDays(new Set(cleaningData.map(day => day.id)));
  };

  const collapseAll = () => {
    setExpandedDays(new Set());
  };


  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="Failed to load cleaning data" onRetry={() => refetch()} />;


  // Calculate totals
  const totals = {
    registered: cleaningData.reduce((sum, day) => sum + day.registered, 0),
    attended: cleaningData.reduce((sum, day) => sum + day.attended, 0),
    pending: cleaningData.reduce((sum, day) => sum + day.pending, 0),
    noShow: cleaningData.reduce((sum, day) => sum + day.noShow, 0)
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Cleaning Schedule</h2>
            <p className="text-gray-400 text-sm">Track student attendance for cleaning days</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filter Buttons */}
          <div className="flex bg-white/5 rounded-lg p-1 gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filter === 'all' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('attended')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                filter === 'attended' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <CheckCircle className="w-3 h-3" />
              Attended
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                filter === 'pending' ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Clock className="w-3 h-3" />
              Pending
            </button>
            <button
              onClick={() => setFilter('no-show')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                filter === 'no-show' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <XCircle className="w-3 h-3" />
              No Show
            </button>
          </div>

          {/* Expand/Collapse Buttons */}
          <div className="flex gap-2">
            <button
              onClick={expandAll}
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* No data state */}
      {cleaningData.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-8 text-center"
        >
          <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No cleaning schedule available</h3>
          <p className="text-gray-400">Check back later for the cleaning schedule.</p>
        </motion.div>
      )}

      {/* Summary Stats Cards */}
      {cleaningData.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-purple-500/10 rounded-xl p-3 text-center border border-purple-500/20"
        >
          <Users className="w-5 h-5 text-purple-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{totals.registered}</p>
          <p className="text-gray-400 text-xs">Total Registered</p>
        </motion.div>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-green-500/10 rounded-xl p-3 text-center border border-green-500/20"
        >
          <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{totals.attended}</p>
          <p className="text-gray-400 text-xs">Total Attended</p>
        </motion.div>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-yellow-500/10 rounded-xl p-3 text-center border border-yellow-500/20"
        >
          <Clock className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{totals.pending}</p>
          <p className="text-gray-400 text-xs">Total Pending</p>
        </motion.div>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-red-500/10 rounded-xl p-3 text-center border border-red-500/20"
        >
          <XCircle className="w-5 h-5 text-red-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{totals.noShow}</p>
          <p className="text-gray-400 text-xs">Total No Show</p>
        </motion.div>
        </div>
      )}

      {/* Cleaning Days List */}
      {cleaningData.length > 0 && (
        <div className="space-y-3">
          {cleaningData.map((day, index) => (
            <DayCard
              key={day.id}
              day={day}
              isExpanded={expandedDays.has(day.id)}
              onToggle={() => toggleDay(day.id)}
              filter={filter}
              index={index}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}