'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Users, CheckCircle, XCircle, Clock, ChevronDown, 
  ChevronUp, Sparkles, Filter, AlertTriangle, RotateCcw, Wrench,
  Users as UsersIcon, Target, Utensils, ChevronRight
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

// Consistent color scheme
const COLORS = {
  primary: {
    light: 'purple-400',
    main: 'purple-500',
    dark: 'purple-600',
    bg: 'purple-500/10',
    border: 'purple-500/20',
    gradient: 'from-purple-500 to-purple-600',
  },
  status: {
    attended: {
      bg: 'green-500/10',
      border: 'green-500/20',
      text: 'green-400',
      badge: 'bg-green-500',
    },
    pending: {
      bg: 'yellow-500/10',
      border: 'yellow-500/20',
      text: 'yellow-400',
      badge: 'bg-yellow-500',
    },
    'no-show': {
      bg: 'red-500/10',
      border: 'red-500/20',
      text: 'red-400',
      badge: 'bg-red-500',
    },
  },
  surface: 'white/5',
  border: 'white/10',
};

// Status color helper
const getStatusColors = (status: 'attended' | 'pending' | 'no-show') => {
  return COLORS.status[status];
};

export default function CleaningTab() {
  const { data: weeks, isLoading, error, refetch } = useWeeks();
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'attended' | 'pending' | 'no-show'>('all');
  const [showGuidelines, setShowGuidelines] = useState(false);

  // Transform weeks data into cleaning days format
  const cleaningData: CleaningDay[] = weeks?.flatMap((week: any) => 
    week.days.map((day: any) => {
      const registrations = day.registrations || [];
      const attendanceRecords = day.attendanceRecords || [];
      
      const students: CleaningStudent[] = registrations.map((reg: any) => {
        const attendance = attendanceRecords.find((a: any) => a.userId === reg.userId);
        return {
          id: reg.user.id,
          name: `${reg.user.firstName} ${reg.user.lastName}`,
          status: attendance?.status?.toLowerCase() as 'attended' | 'pending' | 'no-show' || 'pending',
        };
      });

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

  const totals = {
    registered: cleaningData.reduce((sum, day) => sum + day.registered, 0),
    attended: cleaningData.reduce((sum, day) => sum + day.attended, 0),
    pending: cleaningData.reduce((sum, day) => sum + day.pending, 0),
    noShow: cleaningData.reduce((sum, day) => sum + day.noShow, 0)
  };

  // Guidelines content component for reusability
  const GuidelinesContent = () => (
    <div className="space-y-4">
      {/* Two Major Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 sm:p-4">
          <h4 className="text-white font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
            <span className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></span>
            Food Preparation & Serving
          </h4>
          <ul className="space-y-1.5 sm:space-y-2 text-gray-300 text-xs sm:text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 mt-0.5 flex-shrink-0" />
              <span>Prepare food for all students at the tech center</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 mt-0.5 flex-shrink-0" />
              <span>Serve food to students ensuring fair distribution</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 mt-0.5 flex-shrink-0" />
              <span>Wash all cooking utensils used during preparation</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 mt-0.5 flex-shrink-0" />
              <span>Organize everything as you found it after use</span>
            </li>
          </ul>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 sm:p-4">
          <h4 className="text-white font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
            <span className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></span>
            Cleaning Duties
          </h4>
          <ul className="space-y-1.5 sm:space-y-2 text-gray-300 text-xs sm:text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <span>Clean rooms and maintain hygiene standards</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <span>Ensure all areas are tidy after activities</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <span>Report any maintenance issues immediately</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <span>Follow proper waste disposal procedures</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Safety Guidelines - simplified with primary color */}
      <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 sm:p-4">
        <h4 className="text-white font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
          Safety Guidelines
        </h4>
        <div className="space-y-2 sm:space-y-3 text-gray-300 text-xs sm:text-sm">
          <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-white/5 rounded-lg">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" />
            </div>
            <div>
              <p className="text-white font-medium text-xs sm:text-sm">Pressure Cooker Safety</p>
              <p className="text-gray-400 text-xs sm:text-sm">If you don't know how to use the pressure cooker, ask for help immediately. Always let the pressure out completely before opening.</p>
            </div>
          </div>
          <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-white/5 rounded-lg">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" />
            </div>
            <div>
              <p className="text-white font-medium text-xs sm:text-sm">Gas Safety</p>
              <p className="text-gray-400 text-xs sm:text-sm">Ensure proper ventilation, check for gas leaks before use, and never leave gas unattended while lit.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Core Rules - using primary color consistently */}
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 sm:p-4">
        <h4 className="text-white font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
          Core Rules & Guidelines
        </h4>
        <div className="space-y-2 sm:space-y-3 text-gray-300 text-xs sm:text-sm">
          <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-white/5 rounded-lg">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
            </div>
            <div>
              <p className="text-white font-medium text-xs sm:text-sm">10:00 AM Deadline</p>
              <p className="text-gray-400 text-xs sm:text-sm">If you are on duty, you must be at the tech center by 10:00 AM.</p>
            </div>
          </div>
          <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-white/5 rounded-lg">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-white font-medium text-xs sm:text-sm">20,000 UGX Penalty for Absence</p>
              <p className="text-gray-400 text-xs sm:text-sm">If you don't show up by 10:00 AM, 20k will be deducted from your stipend.</p>
            </div>
          </div>
          <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-white/5 rounded-lg">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
            </div>
            <div>
              <p className="text-white font-medium text-xs sm:text-sm">Personal Plate Responsibility</p>
              <p className="text-gray-400 text-xs sm:text-sm">Even if you are not on duty, you must wash your own plate after eating.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Duty Rotation - using primary color */}
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 sm:p-4">
        <h4 className="text-white font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
          Duty Rotation System
        </h4>
        <div className="space-y-2 sm:space-y-3 text-gray-300 text-xs sm:text-sm">
          <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-white/5 rounded-lg">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-white font-medium text-xs sm:text-sm">7-Week Rotation Cycle</p>
              <p className="text-gray-400 text-xs sm:text-sm">Duty assignments rotate weekly. Once all students complete their duties, the cycle repeats.</p>
            </div>
          </div>
          <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-white/5 rounded-lg">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-white font-medium text-xs sm:text-sm">Track Your Weeks</p>
              <p className="text-gray-400 text-xs sm:text-sm">Monitor this tab regularly to see your assigned weeks. It's your responsibility to know when you're scheduled.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Accountability - using primary color */}
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 sm:p-4">
        <h4 className="text-white font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
          Personal Accountability
        </h4>
        <div className="space-y-2 sm:space-y-3 text-gray-300 text-xs sm:text-sm">
          <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-white/5 rounded-lg">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-white font-medium text-xs sm:text-sm">Check Your Duty Schedule</p>
              <p className="text-gray-400 text-xs sm:text-sm">Check this tab regularly for updates and your assigned dates.</p>
            </div>
          </div>
          <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-white/5 rounded-lg">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
            </div>
            <div>
              <p className="text-white font-medium text-xs sm:text-sm">You Are Accountable</p>
              <p className="text-gray-400 text-xs sm:text-sm">If you don't show up for your duty, you are personally responsible.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 sm:space-y-6"
    >
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-white">Cleaning Schedule</h2>
              <p className="text-xs sm:text-sm text-gray-400 hidden xs:block">Track student attendance for cleaning days</p>
            </div>
          </div>
          
          {/* Mobile toggle for guidelines */}
          <button
            onClick={() => setShowGuidelines(!showGuidelines)}
            className="md:hidden flex items-center gap-1 text-xs text-purple-400 bg-purple-500/10 px-3 py-2 rounded-lg border border-purple-500/20 min-h-[44px]"
          >
            <span>{showGuidelines ? 'Hide' : 'Show'} Rules</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showGuidelines ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Guidelines - Desktop always visible, Mobile collapsible */}
        <div className={`${showGuidelines ? 'block' : 'hidden'} md:block`}>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-3 sm:p-6"
          >
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
              Cleaning Duties & Guidelines
            </h3>
            <GuidelinesContent />
          </motion.div>
        </div>

        {/* Controls - Mobile Optimized */}
        <div className="flex flex-col xs:flex-row gap-2 items-start xs:items-center justify-between">
          {/* Filter Buttons - Scrollable on mobile */}
          <div className="flex bg-white/5 rounded-lg p-1 gap-0.5 sm:gap-1 overflow-x-auto w-full xs:w-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap min-h-[36px] sm:min-h-[44px] ${
                filter === 'all' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('attended')}
              className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs font-medium transition-all flex items-center gap-1 whitespace-nowrap min-h-[36px] sm:min-h-[44px] ${
                filter === 'attended' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <CheckCircle className="w-3 h-3" />
              <span className="hidden xs:inline">Attended</span>
              <span className="xs:hidden inline">✅</span>
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs font-medium transition-all flex items-center gap-1 whitespace-nowrap min-h-[36px] sm:min-h-[44px] ${
                filter === 'pending' ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span className="hidden xs:inline">Pending</span>
              <span className="xs:hidden inline">⏳</span>
            </button>
            <button
              onClick={() => setFilter('no-show')}
              className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs font-medium transition-all flex items-center gap-1 whitespace-nowrap min-h-[36px] sm:min-h-[44px] ${
                filter === 'no-show' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <XCircle className="w-3 h-3" />
              <span className="hidden xs:inline">No Show</span>
              <span className="xs:hidden inline">❌</span>
            </button>
          </div>

          {/* Expand/Collapse Buttons */}
          <div className="flex gap-2 text-xs">
            <button
              onClick={expandAll}
              className="text-purple-400 hover:text-purple-300 transition-colors min-h-[36px] sm:min-h-[44px] px-2"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="text-gray-400 hover:text-white transition-colors min-h-[36px] sm:min-h-[44px] px-2"
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
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 sm:p-8 text-center"
        >
          <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-gray-500 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-white mb-2">No cleaning schedule available</h3>
          <p className="text-sm sm:text-base text-gray-400">Check back later for the cleaning schedule.</p>
        </motion.div>
      )}

      {/* Summary Stats Cards - Mobile Optimized */}
      {cleaningData.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-purple-500/10 rounded-lg p-2 sm:p-3 text-center border border-purple-500/20"
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 mx-auto mb-0.5 sm:mb-1" />
            <p className="text-lg sm:text-2xl font-bold text-white">{totals.registered}</p>
            <p className="text-[10px] sm:text-xs text-gray-400">Registered</p>
          </motion.div>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-green-500/10 rounded-lg p-2 sm:p-3 text-center border border-green-500/20"
          >
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mx-auto mb-0.5 sm:mb-1" />
            <p className="text-lg sm:text-2xl font-bold text-white">{totals.attended}</p>
            <p className="text-[10px] sm:text-xs text-gray-400">Attended</p>
          </motion.div>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-yellow-500/10 rounded-lg p-2 sm:p-3 text-center border border-yellow-500/20"
          >
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 mx-auto mb-0.5 sm:mb-1" />
            <p className="text-lg sm:text-2xl font-bold text-white">{totals.pending}</p>
            <p className="text-[10px] sm:text-xs text-gray-400">Pending</p>
          </motion.div>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-red-500/10 rounded-lg p-2 sm:p-3 text-center border border-red-500/20"
          >
            <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 mx-auto mb-0.5 sm:mb-1" />
            <p className="text-lg sm:text-2xl font-bold text-white">{totals.noShow}</p>
            <p className="text-[10px] sm:text-xs text-gray-400">No Show</p>
          </motion.div>
        </div>
      )}

      {/* Cleaning Days List */}
      {cleaningData.length > 0 && (
        <div className="space-y-2 sm:space-y-3">
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