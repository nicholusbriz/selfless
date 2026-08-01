// app/dashboard/cleaning/page.tsx
// Public cleaning schedule page for students - Using custom hooks

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import CleaningRota from '@/components/CleaningRota';
import {
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  User,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Home,
  CalendarCheck,
  Circle,
  Check,
  X,
  ArrowRight,
  Lock,
  Unlock
} from 'lucide-react';
import {
  useStudentCleaningData,
  useStudentCleaningStatus,
  useRegisterForCleaning,
  useChangeRegistration,
  useMarkAttendance,
  formatDate,
  isDayPast,
  getStatusColor,
  getAttendanceStatusColor,
  type CleaningDay
} from '@/hooks/useCleaningStudent';

export default function CleaningPage() {
  const router = useRouter();
  
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [changingDayId, setChangingDayId] = useState<string | null>(null);

  // Use custom hooks
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useStudentCleaningData();

  const {
    data: statusData,
    refetch: refetchStatus,
  } = useStudentCleaningStatus();

  const registerMutation = useRegisterForCleaning();
  const changeRegistrationMutation = useChangeRegistration();
  const markAttendanceMutation = useMarkAttendance();

  // Handle register mutation
  const handleRegister = async (dayId: string) => {
    if (!confirm('Are you sure you want to register for this cleaning day?')) return;
    try {
      const result = await registerMutation.mutateAsync(dayId);
      setActionMessage({ 
        type: 'success', 
        message: result.message || '✅ Successfully registered for cleaning day!' 
      });
      await refetch();
      await refetchStatus();
      setTimeout(() => setActionMessage(null), 5000);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to register';
      console.error('Registration error:', errorMessage);
      
      if (errorMessage.toLowerCase().includes('already registered')) {
        const dayMatch = errorMessage.match(/registered for (.+?)\./i);
        const existingDay = dayMatch ? dayMatch[1] : 'a day';
        setActionMessage({ 
          type: 'error', 
          message: `⚠️ You are already registered for ${existingDay}. Click "Change to this" on another available day to switch.` 
        });
      } else if (errorMessage.toLowerCase().includes('full')) {
        setActionMessage({ 
          type: 'error', 
          message: '❌ This cleaning day is full. Please select another day.' 
        });
      } else if (errorMessage.toLowerCase().includes('closed')) {
        setActionMessage({ 
          type: 'error', 
          message: '🔒 This cleaning day is closed. Please select an open day.' 
        });
      } else {
        setActionMessage({ type: 'error', message: errorMessage || '❌ Failed to register for cleaning' });
      }
      setTimeout(() => setActionMessage(null), 8000);
    }
  };

  // Handle change registration - inline without modal
  const handleChangeRegistration = async (newDayId: string) => {
    if (!data?.registration) return;
    
    // Find the old and new days with their weeks
    const oldDay = data.weeks.flatMap(w => w.days).find(d => d.id === data.registration?.cleaningDayId);
    const newDay = data.weeks.flatMap(w => w.days).find(d => d.id === newDayId);
    const oldWeek = data.weeks.find(w => w.days.some(d => d.id === data.registration?.cleaningDayId));
    const newWeek = data.weeks.find(w => w.days.some(d => d.id === newDayId));
    
    if (!confirm(
      `Change your registration from ${oldDay?.dayOfWeek} (${oldWeek?.weekLabel || 'Week'}) to ${newDay?.dayOfWeek} (${newWeek?.weekLabel || 'Week'})?`
    )) return;
    
    setChangingDayId(newDayId);
    
    try {
      const result = await changeRegistrationMutation.mutateAsync({
        newDayId: newDayId,
      });
      
      const message = result.message || `✅ Successfully changed to ${newDay?.dayOfWeek}!`;
      setActionMessage({ type: 'success', message });
      setChangingDayId(null);
      
      await refetch();
      await refetchStatus();
      setTimeout(() => setActionMessage(null), 5000);
    } catch (error: any) {
      setActionMessage({ 
        type: 'error', 
        message: error.message || '❌ Failed to change cleaning day' 
      });
      setChangingDayId(null);
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  const toggleWeek = (weekId: string) => {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(weekId)) {
      newExpanded.delete(weekId);
    } else {
      newExpanded.add(weekId);
    }
    setExpandedWeeks(newExpanded);
  };

  // Check if user can change registration - now allows changes to ANY week
  const canChangeRegistration = (day: CleaningDay, week: any) => {
    if (!data?.registration) return false;
    const isPast = isDayPast(day.cleaningDate);
    const isClosed = day.status === 'CLOSED';
    const isFull = day.status === 'FULL';
    const deadlinePassed = new Date() > new Date(week.registrationDeadline);
    
    // Allow changes to ANY week as long as the day is open and not the current day
    return !isPast && !isClosed && !isFull && !deadlinePassed && day.id !== data.registration.cleaningDayId;
  };

  // Check if user can register (no registration yet)
  const canRegister = (day: CleaningDay, week: any) => {
    if (data?.registration) return false; // If already registered, don't show register button
    
    const isPast = isDayPast(day.cleaningDate);
    const isClosed = day.status === 'CLOSED';
    const isFull = day.status === 'FULL';
    const deadlinePassed = new Date() > new Date(week.registrationDeadline);
    const weekActive = week.isActive;
    
    return !isPast && !isClosed && !isFull && !deadlinePassed && weekActive;
  };

  const isUserRegisteredForDay = (dayId: string) => {
    return data?.registration?.cleaningDayId === dayId;
  };

  const getUserAttendanceStatus = (dayId: string) => {
    const record = data?.userAttendance?.find(a => a.cleaningDay.id === dayId);
    return record?.status;
  };

  // Handle mark attendance
  const handleMarkAttendance = async (userId: string, dayId: string, status: 'ATTENDED' | 'NO_SHOW' | 'PENDING') => {
    try {
      await markAttendanceMutation.mutateAsync({ userId, cleaningDayId: dayId, status });
      setActionMessage({ type: 'success', message: `✅ Attendance marked as ${status.toLowerCase()}` });
      setTimeout(() => setActionMessage(null), 3000);
    } catch (error: any) {
      setActionMessage({ type: 'error', message: error.message || '❌ Failed to mark attendance' });
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Skeleton header */}
          <div className="flex items-center justify-between mb-6">
            <div className="h-8 w-48 bg-[#2A2620] rounded animate-pulse" />
            <div className="h-10 w-32 bg-[#2A2620] rounded animate-pulse" />
          </div>

          {/* Skeleton weeks */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#1A1814] rounded-xl p-6 border border-[#2A2620]">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-40 bg-[#2A2620] rounded animate-pulse" />
                <div className="h-6 w-24 bg-[#2A2620] rounded animate-pulse" />
              </div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="h-16 bg-[#2A2620] rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#F87171]/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-[#F87171]" />
          </div>
          <h3 className="text-xl font-semibold text-[#F5F0E8] mb-2">Failed to Load</h3>
          <p className="text-[#A79C8C]">{(error as Error)?.message || 'An error occurred'}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-6 py-2 bg-[#E8A33D] text-[#0B0912] rounded-lg hover:bg-[#C97F1F] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const weeks = data?.weeks || [];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-[#2A2438]/50 hover:bg-[#2A2438] text-[#A79C8C] hover:text-[#F5F0E8] transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => router.push('/')}
          className="p-2 rounded-lg bg-[#2A2438]/50 hover:bg-[#2A2438] text-[#A79C8C] hover:text-[#F5F0E8] transition-all duration-200"
        >
          <Home className="w-5 h-5" />
        </button>
        
        <div className="h-8 w-px bg-[#2A2438]" />
        
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#E8A33D]/20 to-[#C97F1F]/10 border border-[#E8A33D]/20">
            <Calendar className="w-6 h-6 text-[#E8A33D]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#F5F0E8]" style={{ fontFamily: 'var(--font-display)' }}>
              Cleaning Schedule
            </h1>
            <p className="text-sm text-[#A79C8C]">View and register for cleaning days (Monday to Friday)</p>
          </div>
        </div>
      </div>

      {/* Action Message */}
      {actionMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`p-4 rounded-lg mb-6 flex items-center gap-3 ${actionMessage.type === 'success' ? 'bg-[#34D399]/10 border border-[#34D399]/30 text-[#34D399]' : 'bg-[#F87171]/10 border border-[#F87171]/30 text-[#F87171]'}`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{actionMessage.message}</span>
        </motion.div>
      )}

      {/* My Status Card */}
      {statusData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#150F20] border border-[#2A2438] rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <User className="w-6 h-6 text-[#E8A33D]" />
              <div>
                <h3 className="text-lg font-semibold text-[#F5F0E8]">My Cleaning Status</h3>
                {statusData.hasRegistration ? (
                  <p className="text-sm text-[#A79C8C]">
                    Registered for {statusData.registration?.dayOfWeek} - {formatDate(statusData.registration?.cleaningDate || '')}
                    <span className="ml-2 text-xs text-[#E8A33D]">Click "Change to this" on any open day in any week to switch</span>
                  </p>
                ) : (
                  <p className="text-sm text-[#6B6358]">Not registered for any cleaning day. Select a day below to register.</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {statusData.hasRegistration && (
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getAttendanceStatusColor(statusData.registration?.status || 'PENDING')}`}>
                  {statusData.registration?.status || 'PENDING'}
                </div>
              )}
              {!statusData.hasRegistration && data?.isAdmin && (
                <span className="text-xs text-[#6B6358]">(Admin - No registration required)</span>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Cleaning Rota Display  l will remove this section when l want to remove the cleaning rota on this page */ }
      <div className="mb-8">
        <CleaningRota showTitle={false} />
      </div>

      {/* Weeks List */}
      {weeks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#150F20] border border-[#2A2438] rounded-2xl p-12 text-center"
        >
          <Calendar className="w-16 h-16 text-[#6B6358] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#F5F0E8] mb-2">No Cleaning Weeks Available</h3>
          <p className="text-[#A79C8C]">Check back later for the cleaning schedule.</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {weeks.map((week) => {
            const isExpanded = expandedWeeks.has(week.id);
            const hasAvailableDays = week.days.some(day => day.status === 'OPEN' && !isDayPast(day.cleaningDate));
            const deadlinePassed = new Date() > new Date(week.registrationDeadline);
            
            return (
              <motion.div
                key={week.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#150F20] border border-[#2A2438] rounded-2xl overflow-hidden hover:border-[#E8A33D]/30 transition-all duration-300"
              >
                {/* Week Header */}
                <div className="px-6 py-4 flex items-center justify-between cursor-pointer" onClick={() => toggleWeek(week.id)}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E8A33D] to-[#C97F1F] flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-[#0B0912]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#F5F0E8]">
                        {week.weekLabel}
                      </h3>
                      <p className="text-sm text-[#A79C8C]">
                        {formatDate(week.startDate)} - {formatDate(week.endDate)} (Mon-Fri)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {week.isActive ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#34D399]/20 text-[#34D399]">
                        <Unlock className="w-3 h-3" />
                        Open
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#F87171]/20 text-[#F87171]">
                        <Lock className="w-3 h-3" />
                        Closed
                      </span>
                    )}
                    {deadlinePassed && week.isActive && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#F87171]/20 text-[#F87171]">
                        Deadline Passed
                      </span>
                    )}
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-[#A79C8C]" /> : <ChevronDown className="w-5 h-5 text-[#A79C8C]" />}
                  </div>
                </div>

                {/* Expanded Days */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-[#2A2438]"
                    >
                      <div className="p-6 space-y-4">
                        {week.days.map((day) => {
                          const isFull = day.status === 'FULL';
                          const isClosed = day.status === 'CLOSED';
                          const isOpen = day.status === 'OPEN';
                          const isPast = isDayPast(day.cleaningDate);
                          const userRegistered = isUserRegisteredForDay(day.id);
                          const attendanceStatus = getUserAttendanceStatus(day.id);
                          const canChange = canChangeRegistration(day, week);
                          const canReg = canRegister(day, week);
                          const deadlinePassed = new Date() > new Date(week.registrationDeadline);
                          
                          // Get the current registered week for comparison
                          const currentRegisteredWeek = data?.registration?.cleaningDayId 
                            ? weeks.find(w => w.days.some(d => d.id === data.registration?.cleaningDayId))
                            : null;
                          const isDifferentWeek = currentRegisteredWeek && currentRegisteredWeek.id !== week.id;
                          
                          return (
                            <div
                              key={day.id}
                              className={`bg-[#0B0912] rounded-xl p-4 border transition-all duration-300 ${
                                userRegistered ? 'border-[#34D399]/50 bg-[#34D399]/5' :
                                isPast ? 'border-[#2A2438] opacity-60' :
                                isOpen ? 'border-[#2A2438] hover:border-[#E8A33D]/30' :
                                'border-[#2A2438] opacity-70'
                              }`}
                            >
                              <div className="flex items-center justify-between flex-wrap gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-[#2A2438] flex items-center justify-center flex-shrink-0">
                                    <Calendar className="w-5 h-5 text-[#A79C8C]" />
                                  </div>
                                  <div>
                                    <h4 className="text-white font-semibold">{day.dayOfWeek}</h4>
                                    <p className="text-sm text-[#A79C8C]">{formatDate(day.cleaningDate)}</p>
                                    {/* Show week label for context when changing across weeks */}
                                    {data?.registration && isDifferentWeek && (
                                      <p className="text-xs text-[#E8A33D]">{week.weekLabel}</p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 flex-wrap">
                                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor(day.status)}`}>
                                    {day.status === 'OPEN' ? <Unlock className="w-4 h-4" /> :
                                     day.status === 'FULL' ? <Users className="w-4 h-4" /> :
                                     day.status === 'CLOSED' ? <Lock className="w-4 h-4" /> :
                                     <Circle className="w-4 h-4" />}
                                    <span>{day.status}</span>
                                    <span className="text-[#6B6358]">•</span>
                                    <span>{day.currentRegistrations}/{day.capacityLimit}</span>
                                  </div>

                                  {userRegistered && (
                                    <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#34D399]/20 text-[#34D399]">
                                      <Check className="w-3 h-3" />
                                      <span>Registered</span>
                                      {attendanceStatus && (
                                        <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${getAttendanceStatusColor(attendanceStatus)}`}>
                                          {attendanceStatus}
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {/* Register button - only show if user has NO registration and can register */}
                                  {!data?.registration && canReg && (
                                    <button
                                      onClick={() => handleRegister(day.id)}
                                      disabled={registerMutation.isPending}
                                      className="px-4 py-2 bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] text-[#0B0912] font-medium rounded-lg hover:shadow-lg hover:shadow-[#E8A33D]/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                      {registerMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <CalendarCheck className="w-4 h-4" />
                                      )}
                                      Register
                                    </button>
                                  )}

                                  {/* Change to this button - show on ALL open days in ANY week when user has registration */}
                                  {data?.registration && canChange && (
                                    <button
                                      onClick={() => handleChangeRegistration(day.id)}
                                      disabled={changeRegistrationMutation.isPending && changingDayId === day.id}
                                      className={`px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center gap-2 ${
                                        changingDayId === day.id && changeRegistrationMutation.isPending
                                          ? 'bg-[#2A2438] text-[#A79C8C]'
                                          : 'bg-[#E8A33D]/10 border border-[#E8A33D]/30 text-[#E8A33D] hover:bg-[#E8A33D]/20'
                                      }`}
                                    >
                                      {changeRegistrationMutation.isPending && changingDayId === day.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <ArrowRight className="w-4 h-4" />
                                      )}
                                      Change to this
                                      {isDifferentWeek && (
                                        <span className="text-xs opacity-70">({week.weekLabel})</span>
                                      )}
                                    </button>
                                  )}

                                  {/* Status messages for disabled states when no registration */}
                                  {!userRegistered && !canReg && !data?.registration && (
                                    <span className="text-sm text-[#6B6358]">
                                      {isPast ? 'Past date' :
                                       isFull ? 'Full' :
                                       isClosed ? 'Closed' :
                                       deadlinePassed ? 'Registration deadline passed' :
                                       !week.isActive ? 'Week closed' :
                                       'Unavailable'}
                                    </span>
                                  )}
                                  
                                  {/* Show message when registered but can't change (unavailable) */}
                                  {data?.registration && !canChange && data?.registration?.cleaningDayId !== day.id && (
                                    <span className="text-sm text-[#6B6358]">
                                      {isPast ? 'Past date' :
                                       isFull ? 'Full' :
                                       isClosed ? 'Closed' :
                                       deadlinePassed ? 'Registration deadline passed' :
                                       !week.isActive ? 'Week closed' :
                                       'Unavailable'}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Registered Users List */}
                              {day.registrations.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-[#2A2438]">
                                  <p className="text-xs text-[#6B6358] mb-2">Registered Students ({day.registrations.length})</p>
                                  <div className="flex flex-wrap gap-2">
                                    {day.registrations.map((reg) => {
                                      const attendance = day.attendanceRecords?.find((a: any) => a.userId === reg.userId);
                                      const isCurrentUser = reg.userId === data?.user?.id;
                                      const canMarkAttendance = data?.user?.role === 'admin' || data?.user?.role === 'teacher' || data?.user?.role === 'super_admin';
                                      
                                      return (
                                        <div
                                          key={reg.id}
                                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#2A2438] text-xs text-[#A79C8C]"
                                        >
                                          <User className="w-3 h-3" />
                                          <span>{reg.user.firstName} {reg.user.lastName}</span>
                                          {isCurrentUser && (
                                            <span className="ml-1 text-[#E8A33D]">(You)</span>
                                          )}
                                          {canMarkAttendance && (
                                            <div className="flex items-center gap-1 ml-2">
                                              <button
                                                onClick={() => handleMarkAttendance(reg.userId, day.id, 'ATTENDED')}
                                                className={`p-1 rounded ${attendance?.status === 'ATTENDED' ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-400 hover:bg-green-500/20 hover:text-green-400'}`}
                                                title="Mark as attended"
                                              >
                                                <CheckCircle className="w-3 h-3" />
                                              </button>
                                              <button
                                                onClick={() => handleMarkAttendance(reg.userId, day.id, 'NO_SHOW')}
                                                className={`p-1 rounded ${attendance?.status === 'NO_SHOW' ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-gray-400 hover:bg-red-500/20 hover:text-red-400'}`}
                                                title="Mark as no-show"
                                              >
                                                <XCircle className="w-3 h-3" />
                                              </button>
                                              <button
                                                onClick={() => handleMarkAttendance(reg.userId, day.id, 'PENDING')}
                                                className={`p-1 rounded ${attendance?.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/5 text-gray-400 hover:bg-yellow-500/20 hover:text-yellow-400'}`}
                                                title="Mark as pending"
                                              >
                                                <Clock className="w-3 h-3" />
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}