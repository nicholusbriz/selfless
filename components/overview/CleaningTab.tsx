'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Users, CheckCircle, XCircle, Clock, ChevronDown, 
  ChevronUp, Sparkles, Filter, AlertTriangle, RotateCcw, Wrench,
  Users as UsersIcon, Target, Utensils 
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

      {/* Rules and Guidelines Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          Cleaning Duties & Guidelines
        </h3>

        {/* Two Major Sections */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Food Preparation & Serving Section */}
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
              Food Preparation & Serving
            </h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                <span>Prepare food for all students at the tech center</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                <span>Serve food to students ensuring fair distribution</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                <span>Wash all cooking utensils used during preparation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                <span>Organize everything as you found it after use</span>
              </li>
            </ul>
          </div>

          {/* Cleaning Section */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              Cleaning Duties
            </h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>Clean rooms and maintain hygiene standards</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>Ensure all areas are tidy after activities</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>Report any maintenance issues immediately</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>Follow proper waste disposal procedures</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Safety Guidelines */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Safety Guidelines
          </h4>
          <div className="space-y-3 text-gray-300 text-sm">
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="text-white font-medium">Pressure Cooker Safety</p>
                <p className="text-gray-400">If you are preparing food and don't know how to use the pressure cooker, ask for help immediately. Pressure cookers can cause serious injuries or death when misused. Always let the pressure out completely before opening.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <p className="text-white font-medium">Gas Safety</p>
                <p className="text-gray-400">We use gas for cooking. Ensure proper ventilation, check for gas leaks before use, and never leave gas unattended while lit. Turn off gas supply immediately after use.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Duty Rotation Information */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-green-400" />
            Duty Rotation System
          </h4>
          <div className="space-y-3 text-gray-300 text-sm">
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-white font-medium">7-Week Rotation Cycle</p>
                <p className="text-gray-400">Duty assignments rotate weekly. Once all students have completed their duties, the cycle repeats for 7 weeks. No re-registration required - keep track of which weeks you've worked to avoid confusion.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <div className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-teal-400" />
              </div>
              <div>
                <p className="text-white font-medium">Track Your Weeks</p>
                <p className="text-gray-400">Monitor this tab regularly to see your assigned weeks. The duty list is updated here - it's your responsibility to know when you're scheduled.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Equipment Care */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-400" />
            Equipment Care & Maintenance
          </h4>
          <div className="space-y-3 text-gray-300 text-sm">
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Wrench className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-medium">Proper Tool Usage</p>
                <p className="text-gray-400">Use cleaning tools appropriately for their intended purpose. Handle equipment with care to prevent damage and ensure longevity.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <XCircle className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <p className="text-white font-medium">Remove Tools from Water</p>
                <p className="text-gray-400">After cleaning, immediately remove mops and cleaning brushes from water. These materials are made of wood and will decay if left soaking in water.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-white font-medium">Report Damaged Equipment</p>
                <p className="text-gray-400">Immediately report any damaged or broken equipment to the tutor on duty or manager. This ensures timely replacements and maintains safety standards.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Responsibility */}
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 mb-4">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-purple-400" />
            Team Responsibility & Coordination
          </h4>
          <div className="space-y-3 text-gray-300 text-sm">
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-white font-medium">2:00 PM Lunch Deadline</p>
                <p className="text-gray-400">Whether you're on cleaning or food preparation duty, ensure lunch is ready by 2:00 PM. Failure to cooperate affects the entire team.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <div className="w-8 h-8 bg-pink-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <UsersIcon className="w-4 h-4 text-pink-400" />
              </div>
              <div>
                <p className="text-white font-medium">Self-Organization Required</p>
                <p className="text-gray-400">You are responsible for organizing and mobilizing among yourselves. The tutor on duty will just assist you but won't organize your team or manage how you complete your duties.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Responsibility */}
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 mb-4">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-400" />
            Personal Accountability
          </h4>
          <div className="space-y-3 text-gray-300 text-sm">
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <p className="text-white font-medium">Check Your Duty Schedule</p>
                <p className="text-gray-400">The tutor on duty does not post duty lists in the group. It is not their responsibility to remind you of your duties. Check this tab regularly for updates and your assigned dates.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <XCircle className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="text-white font-medium">You Are Accountable</p>
                <p className="text-gray-400">If you don't show up for your duty, the tutor will not be blamed for your fault. You are personally responsible for knowing and fulfilling your assigned duties.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Food Standards */}
        <div className="bg-teal-500/10 border border-teal-500/20 rounded-lg p-4 mb-4">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-teal-400" />
            Food Preparation Standards
          </h4>
          <div className="space-y-3 text-gray-300 text-sm">
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <div className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-teal-400" />
              </div>
              <div>
                <p className="text-white font-medium">Quality & Hygiene</p>
                <p className="text-gray-400">Maintain high standards of food hygiene during preparation. Ensure all ingredients are fresh and properly handled.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-medium">Portion Control</p>
                <p className="text-gray-400">Ensure fair and adequate portion sizes for all students. Avoid waste while ensuring everyone gets sufficient food.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <p className="text-white font-medium">Timing & Coordination</p>
                <p className="text-gray-400">Coordinate with the serving team to ensure food is ready on time. Proper timing ensures smooth service and hot meals for everyone.</p>
              </div>
            </div>
          </div>
        </div>

        {/* General Rules */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            Core Rules & Guidelines
          </h4>
          <div className="space-y-3 text-gray-300 text-sm">
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <XCircle className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="text-white font-medium">10:00 AM Deadline</p>
                <p className="text-gray-400">If you are on duty, you must be at the tech center by 10:00 AM. Late arrival will result in penalties.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <p className="text-white font-medium">20,000 UGX Penalty for Absence</p>
                <p className="text-gray-400">If you don't show up by 10:00 AM, the tutor on duty will assign someone else, and 20k will be deducted from your stipend and given to the replacement worker.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-white font-medium">Personal Plate Responsibility</p>
                <p className="text-gray-400">Even if you are not on duty, you must wash your own plate after eating. No exceptions.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-white font-medium">One Plate Per Student</p>
                <p className="text-gray-400">The person serving food and the tutor on duty must ensure every student picks only one plate. No student is allowed to keep food for absent students until all present students have eaten.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-medium">Clean As You Found It</p>
                <p className="text-gray-400">If you choose preparing food, you must wash all the utensils you have used in cooking and preparing by organizing everything you have used as you found it.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

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