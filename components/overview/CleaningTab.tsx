'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Users, CheckCircle, XCircle, Clock, ChevronDown, 
  ChevronUp, Sparkles, Filter, AlertTriangle, RotateCcw, Wrench,
  Users as UsersIcon, Target, Utensils, ChevronRight, Search
} from 'lucide-react';
import { useWeeks } from '@/hooks/useCleaning';
import LoadingState from '@/components/shared/LoadingState';
import ErrorState from '@/components/shared/ErrorState';
import DayCard from '@/components/Cleaning/DayCard';
import UserAvatar from '@/components/shared/UserAvatar';
import { useWebSocketEvent } from '@/hooks/useWebSocket';
import { useQueryClient } from '@tanstack/react-query';

interface CleaningStudent {
  id: string;
  name: string;
  status: 'attended' | 'pending' | 'no-show';
  user?: {
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
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

/* ============================================================
   TOKENS — shares the site's palette (amber / jade / coral on
   plum-black) instead of the generic purple-pink dashboard look.
   ============================================================ */
const COLORS = {
  brand: {
    text: '#F2C879',
    bg: 'bg-[#E8A33D]/10',
    border: 'border-[#E8A33D]/20',
    solid: '#E8A33D',
    gradient: 'from-[#E8A33D] to-[#C97F1F]',
  },
  status: {
    attended: { text: 'text-[#45C7A6]', bg: 'bg-[#2FA88A]/10', border: 'border-[#2FA88A]/20', badge: 'bg-[#2FA88A]', ring: '#2FA88A' },
    pending: { text: 'text-[#F2C879]', bg: 'bg-[#E8A33D]/10', border: 'border-[#E8A33D]/20', badge: 'bg-[#E8A33D]', ring: '#E8A33D' },
    'no-show': { text: 'text-[#F0827A]', bg: 'bg-[#E05252]/10', border: 'border-[#E05252]/20', badge: 'bg-[#E05252]', ring: '#E05252' },
  },
  surface: 'bg-[#150F20]/50',
  surfaceSoft: 'bg-[#0B0912]/40',
  border: 'border-[#2A2438]',
};

const getStatusColors = (status: 'attended' | 'pending' | 'no-show') => COLORS.status[status];

export default function CleaningTab() {
  const { data: weeks, isLoading, error, refetch } = useWeeks();
  const queryClient = useQueryClient();
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'attended' | 'pending' | 'no-show'>('all');
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<{ student: CleaningStudent; day: CleaningDay } | null>(null);

  const handleAttendanceUpdate = useCallback(() => {
    refetch();
  }, [refetch]);

  useWebSocketEvent('cleaning:attendance:updated', handleAttendanceUpdate);

  const cleaningData: CleaningDay[] = weeks?.flatMap((week: any) => 
    week.days.map((day: any) => {
      const registrations = day.registrations || [];
      const attendanceRecords = day.attendanceRecords || [];
      
      const students: CleaningStudent[] = registrations.map((reg: any) => {
        const attendance = attendanceRecords.find((a: any) => a.userId === reg.userId);
        return {
          id: reg.user?.id || reg.userId,
          name: `${reg.user?.firstName || ''} ${reg.user?.lastName || ''}`.trim() || 'Unknown',
          status: attendance?.status?.toLowerCase() as 'attended' | 'pending' | 'no-show' || 'pending',
          user: reg.user,
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

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setSearchResult(null);
      return;
    }

    for (const day of cleaningData) {
      const foundStudent = day.students.find(student => 
        student.name.toLowerCase().includes(term.toLowerCase())
      );
      if (foundStudent) {
        setSearchResult({ student: foundStudent, day });
        return;
      }
    }
    setSearchResult(null);
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="Failed to load cleaning data" onRetry={() => refetch()} />;

  const totals = {
    registered: cleaningData.reduce((sum, day) => sum + day.registered, 0),
    attended: cleaningData.reduce((sum, day) => sum + day.attended, 0),
    pending: cleaningData.reduce((sum, day) => sum + day.pending, 0),
    noShow: cleaningData.reduce((sum, day) => sum + day.noShow, 0)
  };

  // Guidelines content — each category now reads via a single accent
  // border + icon color on a neutral panel, instead of six stacked
  // pastel-tinted boxes competing for attention.
  const GuidelinesContent = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-[#150F20]/40 border border-[#2A2438] border-l-[3px] border-l-[#2FA88A] rounded-lg p-3 sm:p-4">
          <h4 className="text-[#F5F0E8] font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
            <Utensils className="w-4 h-4 text-[#45C7A6] flex-shrink-0" />
            Food Preparation & Serving
          </h4>
          <ul className="space-y-1.5 sm:space-y-2 text-[#A79C8C] text-xs sm:text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-[#45C7A6] mt-0.5 flex-shrink-0" />
              <span>Prepare food for all students at the tech center</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-[#45C7A6] mt-0.5 flex-shrink-0" />
              <span>Serve food to students ensuring fair distribution</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-[#45C7A6] mt-0.5 flex-shrink-0" />
              <span>Wash all cooking utensils used during preparation</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-[#45C7A6] mt-0.5 flex-shrink-0" />
              <span>Organize everything as you found it after use</span>
            </li>
          </ul>
        </div>

        <div className="bg-[#150F20]/40 border border-[#2A2438] border-l-[3px] border-l-[#E8A33D] rounded-lg p-3 sm:p-4">
          <h4 className="text-[#F5F0E8] font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
            <Wrench className="w-4 h-4 text-[#F2C879] flex-shrink-0" />
            Cleaning Duties
          </h4>
          <ul className="space-y-1.5 sm:space-y-2 text-[#A79C8C] text-xs sm:text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-[#F2C879] mt-0.5 flex-shrink-0" />
              <span>Clean rooms and maintain hygiene standards</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-[#F2C879] mt-0.5 flex-shrink-0" />
              <span>Ensure all areas are tidy after activities</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-[#F2C879] mt-0.5 flex-shrink-0" />
              <span>Report any maintenance issues immediately</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-[#F2C879] mt-0.5 flex-shrink-0" />
              <span>Follow proper waste disposal procedures</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Safety Guidelines — coral marks it as the "pay attention" category */}
      <div className="bg-[#150F20]/40 border border-[#2A2438] border-l-[3px] border-l-[#E8735C] rounded-lg p-3 sm:p-4">
        <h4 className="text-[#F5F0E8] font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-[#E8735C]" />
          Safety Guidelines
        </h4>
        <div className="space-y-2 sm:space-y-3 text-[#A79C8C] text-xs sm:text-sm">
          <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-[#0B0912]/40 border border-[#2A2438] rounded-lg">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#E8735C]/15 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-[#E8735C]" />
            </div>
            <div>
              <p className="text-[#F5F0E8] font-medium text-xs sm:text-sm">Pressure Cooker Safety</p>
              <p className="text-[#A79C8C] text-xs sm:text-sm">If you don't know how to use the pressure cooker, ask for help immediately. Always let the pressure out completely before opening.</p>
            </div>
          </div>
          <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-[#0B0912]/40 border border-[#2A2438] rounded-lg">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#E8735C]/15 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-[#E8735C]" />
            </div>
            <div>
              <p className="text-[#F5F0E8] font-medium text-xs sm:text-sm">Gas Safety</p>
              <p className="text-[#A79C8C] text-xs sm:text-sm">Ensure proper ventilation, check for gas leaks before use, and never leave gas unattended while lit.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Core Rules */}
      <div className="bg-[#150F20]/40 border border-[#2A2438] border-l-[3px] border-l-[#E8A33D] rounded-lg p-3 sm:p-4">
        <h4 className="text-[#F5F0E8] font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#F2C879]" />
          Core Rules & Guidelines
        </h4>
        <div className="space-y-2 sm:space-y-3 text-[#A79C8C] text-xs sm:text-sm">
          <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-[#0B0912]/40 border border-[#2A2438] rounded-lg">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#E05252]/15 rounded-full flex items-center justify-center flex-shrink-0">
              <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-[#F0827A]" />
            </div>
            <div>
              <p className="text-[#F5F0E8] font-medium text-xs sm:text-sm">10:00 AM Deadline</p>
              <p className="text-[#A79C8C] text-xs sm:text-sm">If you are on duty, you must be at the tech center by 10:00 AM.</p>
            </div>
          </div>
          <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-[#0B0912]/40 border border-[#2A2438] rounded-lg">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#E8A33D]/15 rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 text-[#F2C879]" />
            </div>
            <div>
              <p className="text-[#F5F0E8] font-medium text-xs sm:text-sm">20,000 UGX Penalty for Absence</p>
              <p className="text-[#A79C8C] text-xs sm:text-sm">If you don't show up by 10:00 AM, 20k will be deducted from your stipend.</p>
            </div>
          </div>
          <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-[#0B0912]/40 border border-[#2A2438] rounded-lg">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#2FA88A]/15 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-[#45C7A6]" />
            </div>
            <div>
              <p className="text-[#F5F0E8] font-medium text-xs sm:text-sm">Personal Plate Responsibility</p>
              <p className="text-[#A79C8C] text-xs sm:text-sm">Even if you are not on duty, you must wash your own plate after eating.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Duty Rotation */}
      <div className="bg-[#150F20]/40 border border-[#2A2438] border-l-[3px] border-l-[#45C7A6] rounded-lg p-3 sm:p-4">
        <h4 className="text-[#F5F0E8] font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-[#45C7A6]" />
          Duty Rotation System
        </h4>
        <div className="space-y-2 sm:space-y-3 text-[#A79C8C] text-xs sm:text-sm">
          <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-[#0B0912]/40 border border-[#2A2438] rounded-lg">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#2FA88A]/15 rounded-full flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 text-[#45C7A6]" />
            </div>
            <div>
              <p className="text-[#F5F0E8] font-medium text-xs sm:text-sm">7-Week Rotation Cycle</p>
              <p className="text-[#A79C8C] text-xs sm:text-sm">Duty assignments rotate weekly. Once all students complete their duties, the cycle repeats.</p>
            </div>
          </div>
          <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-[#0B0912]/40 border border-[#2A2438] rounded-lg">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#2FA88A]/15 rounded-full flex items-center justify-center flex-shrink-0">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-[#45C7A6]" />
            </div>
            <div>
              <p className="text-[#F5F0E8] font-medium text-xs sm:text-sm">Track Your Weeks</p>
              <p className="text-[#A79C8C] text-xs sm:text-sm">Monitor this tab regularly to see your assigned weeks. It's your responsibility to know when you're scheduled.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Accountability */}
      <div className="bg-[#150F20]/40 border border-[#2A2438] border-l-[3px] border-l-[#F0827A] rounded-lg p-3 sm:p-4">
        <h4 className="text-[#F5F0E8] font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#F0827A]" />
          Personal Accountability
        </h4>
        <div className="space-y-2 sm:space-y-3 text-[#A79C8C] text-xs sm:text-sm">
          <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-[#0B0912]/40 border border-[#2A2438] rounded-lg">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#2FA88A]/15 rounded-full flex items-center justify-center flex-shrink-0">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-[#45C7A6]" />
            </div>
            <div>
              <p className="text-[#F5F0E8] font-medium text-xs sm:text-sm">Check Your Duty Schedule</p>
              <p className="text-[#A79C8C] text-xs sm:text-sm">Check this tab regularly for updates and your assigned dates.</p>
            </div>
          </div>
          <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-[#0B0912]/40 border border-[#2A2438] rounded-lg">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#E05252]/15 rounded-full flex items-center justify-center flex-shrink-0">
              <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-[#F0827A]" />
            </div>
            <div>
              <p className="text-[#F5F0E8] font-medium text-xs sm:text-sm">You Are Accountable</p>
              <p className="text-[#A79C8C] text-xs sm:text-sm">If you don't show up for your duty, you are personally responsible.</p>
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
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#E8A33D] to-[#C97F1F] p-[2px] flex-shrink-0 shadow-lg shadow-[#E8A33D]/20">
              <div className="w-full h-full rounded-[10px] bg-[#0B0912] flex items-center justify-center">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#F2C879]" />
              </div>
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-[#F5F0E8]">Cleaning Schedule</h2>
              <p className="text-xs sm:text-sm text-[#A79C8C] hidden xs:block">Track student attendance for cleaning days</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowGuidelines(!showGuidelines)}
            className="flex items-center gap-1 text-xs font-medium text-[#F2C879] bg-[#E8A33D]/10 hover:bg-[#E8A33D]/15 px-3 py-2 rounded-lg border border-[#E8A33D]/20 min-h-[44px] transition-colors duration-200"
          >
            <span>{showGuidelines ? 'Hide' : 'Show'} Rules</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${showGuidelines ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className={`${showGuidelines ? 'block' : 'hidden'}`}>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-[#150F20]/50 backdrop-blur-lg border border-[#2A2438] rounded-xl p-3 sm:p-6"
          >
            <h3 className="text-base sm:text-lg font-semibold text-[#F5F0E8] mb-3 sm:mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#F2C879]" />
              Cleaning Duties & Guidelines
            </h3>
            <GuidelinesContent />
          </motion.div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6358] group-focus-within:text-[#E8A33D] transition-colors duration-200" />
            <input
              type="text"
              placeholder="Search by student name..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-[#150F20]/50 border border-[#2A2438] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#F5F0E8] placeholder-[#6B6358] focus:outline-none focus:border-[#E8A33D]/50 focus:ring-1 focus:ring-[#E8A33D]/50 transition-colors duration-200"
            />
          </div>

          {searchResult && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#2FA88A]/10 border border-[#2FA88A]/20 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#45C7A6] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-[#F5F0E8] font-semibold mb-1">Student Found</p>
                  <p className="text-[#A79C8C] text-sm">
                    <span className="font-medium text-[#F5F0E8]">{searchResult.student.name}</span> is registered for cleaning on:
                  </p>
                  <p className="text-[#45C7A6] font-medium text-sm mt-1">
                    {searchResult.day.dayName} - {searchResult.day.date}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      searchResult.student.status === 'attended' ? 'bg-[#2FA88A]/20 text-[#45C7A6]' :
                      searchResult.student.status === 'pending' ? 'bg-[#E8A33D]/20 text-[#F2C879]' :
                      'bg-[#E05252]/20 text-[#F0827A]'
                    }`}>
                      {searchResult.student.status.charAt(0).toUpperCase() + searchResult.student.status.slice(1)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => { setSearchTerm(''); setSearchResult(null); }}
                  className="text-[#6B6358] hover:text-[#F5F0E8] transition-colors duration-200"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {searchTerm && !searchResult && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#E05252]/10 border border-[#E05252]/20 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-[#F0827A] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-[#F5F0E8] font-semibold mb-1">Student Not Found</p>
                  <p className="text-[#A79C8C] text-sm">
                    No student named "{searchTerm}" is registered for cleaning duties.
                  </p>
                </div>
                <button
                  onClick={() => { setSearchTerm(''); setSearchResult(null); }}
                  className="text-[#6B6358] hover:text-[#F5F0E8] transition-colors duration-200"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          <div className="flex flex-col xs:flex-row gap-2 items-start xs:items-center justify-between">
            <div className="flex bg-[#150F20]/50 border border-[#2A2438] rounded-lg p-1 gap-0.5 sm:gap-1 overflow-x-auto w-full xs:w-auto">
              <button
                onClick={() => setFilter('all')}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs font-medium transition-all duration-200 whitespace-nowrap min-h-[36px] sm:min-h-[44px] ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] text-[#0B0912] shadow-md shadow-[#E8A33D]/20'
                    : 'text-[#A79C8C] hover:text-[#F5F0E8]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('attended')}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1 whitespace-nowrap min-h-[36px] sm:min-h-[44px] ${
                  filter === 'attended'
                    ? 'bg-[#2FA88A] text-[#0B0912] shadow-md shadow-[#2FA88A]/20'
                    : 'text-[#A79C8C] hover:text-[#F5F0E8]'
                }`}
              >
                <CheckCircle className="w-3 h-3" />
                <span className="hidden xs:inline">Attended</span>
                <span className="xs:hidden inline">✅</span>
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1 whitespace-nowrap min-h-[36px] sm:min-h-[44px] ${
                  filter === 'pending'
                    ? 'bg-[#E8A33D] text-[#0B0912] shadow-md shadow-[#E8A33D]/20'
                    : 'text-[#A79C8C] hover:text-[#F5F0E8]'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span className="hidden xs:inline">Pending</span>
                <span className="xs:hidden inline">⏳</span>
              </button>
              <button
                onClick={() => setFilter('no-show')}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1 whitespace-nowrap min-h-[36px] sm:min-h-[44px] ${
                  filter === 'no-show'
                    ? 'bg-[#E05252] text-white shadow-md shadow-[#E05252]/20'
                    : 'text-[#A79C8C] hover:text-[#F5F0E8]'
                }`}
              >
                <XCircle className="w-3 h-3" />
                <span className="hidden xs:inline">No Show</span>
                <span className="xs:hidden inline">❌</span>
              </button>
            </div>

            <div className="flex gap-2 text-xs">
              <button
                onClick={expandAll}
                className="text-[#F2C879] hover:text-[#E8A33D] transition-colors duration-200 min-h-[36px] sm:min-h-[44px] px-2"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="text-[#A79C8C] hover:text-[#F5F0E8] transition-colors duration-200 min-h-[36px] sm:min-h-[44px] px-2"
              >
                Collapse All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* No data state */}
      {cleaningData.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#150F20]/50 backdrop-blur-lg border border-[#2A2438] rounded-xl p-6 sm:p-8 text-center"
        >
          <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-[#6B6358] mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-[#F5F0E8] mb-2">No cleaning schedule available</h3>
          <p className="text-sm sm:text-base text-[#A79C8C]">Check back later for the cleaning schedule.</p>
        </motion.div>
      )}

      {/* Summary Stats Cards */}
      {cleaningData.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.03 }}
            className="bg-[#E8A33D]/10 rounded-lg p-2 sm:p-3 text-center border border-[#E8A33D]/20"
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#F2C879] mx-auto mb-0.5 sm:mb-1" />
            <p className="text-lg sm:text-2xl font-bold text-[#F5F0E8]">{totals.registered}</p>
            <p className="text-[10px] sm:text-xs text-[#A79C8C]">Registered</p>
          </motion.div>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.03 }}
            className="bg-[#2FA88A]/10 rounded-lg p-2 sm:p-3 text-center border border-[#2FA88A]/20"
          >
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#45C7A6] mx-auto mb-0.5 sm:mb-1" />
            <p className="text-lg sm:text-2xl font-bold text-[#F5F0E8]">{totals.attended}</p>
            <p className="text-[10px] sm:text-xs text-[#A79C8C]">Attended</p>
          </motion.div>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.03 }}
            className="bg-[#E8A33D]/10 rounded-lg p-2 sm:p-3 text-center border border-[#E8A33D]/20"
          >
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#F2C879] mx-auto mb-0.5 sm:mb-1" />
            <p className="text-lg sm:text-2xl font-bold text-[#F5F0E8]">{totals.pending}</p>
            <p className="text-[10px] sm:text-xs text-[#A79C8C]">Pending</p>
          </motion.div>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.03 }}
            className="bg-[#E05252]/10 rounded-lg p-2 sm:p-3 text-center border border-[#E05252]/20"
          >
            <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#F0827A] mx-auto mb-0.5 sm:mb-1" />
            <p className="text-lg sm:text-2xl font-bold text-[#F5F0E8]">{totals.noShow}</p>
            <p className="text-[10px] sm:text-xs text-[#A79C8C]">No Show</p>
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