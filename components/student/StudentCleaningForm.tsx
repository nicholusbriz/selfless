'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Users, CheckCircle, XCircle, Clock, ChevronDown, 
  ChevronUp, Sparkles, AlertCircle, CalendarDays 
} from 'lucide-react';
import { 
  useStudentCleaning, 
  useRegisterDay, 
  useUnregisterDay, 
  useSwitchDay 
} from '@/hooks/useCleaning';
import LoadingState from '@/components/shared/LoadingState';
import ErrorState from '@/components/shared/ErrorState';

export default function StudentCleaningForm() {
  const { data, isLoading, error, refetch } = useStudentCleaning();
  const registerMutation = useRegisterDay();
  const unregisterMutation = useUnregisterDay();
  const switchMutation = useSwitchDay();
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());

  const toggleWeek = (weekId: string) => {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(weekId)) {
      newExpanded.delete(weekId);
    } else {
      newExpanded.add(weekId);
    }
    setExpandedWeeks(newExpanded);
  };

  const expandAll = () => {
    if (data?.availableWeeks) {
      setExpandedWeeks(new Set(data.availableWeeks.map((w: any) => w.id)));
    }
  };

  const collapseAll = () => {
    setExpandedWeeks(new Set());
  };

  const handleRegister = async (cleaningDayId: string) => {
    try {
      await registerMutation.mutateAsync(cleaningDayId);
      await refetch();
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleUnregister = async () => {
    try {
      await unregisterMutation.mutateAsync();
      await refetch();
    } catch (error) {
      console.error('Unregistration failed:', error);
    }
  };

  const handleSwitchDay = async (cleaningDayId: string) => {
    try {
      await switchMutation.mutateAsync(cleaningDayId);
      await refetch();
    } catch (error) {
      console.error('Switch day failed:', error);
    }
  };

  const isRegistrationDisabled = (day: any) => {
    return (
      day.isFull ||
      !day.isOpen ||
      !day.week?.registrationEnabled ||
      new Date() > new Date(day.week.registrationDeadline)
    );
  };

  const getRegistrationDisabledReason = (day: any) => {
    if (day.isFull) return 'Day is full';
    if (!day.isOpen) return 'Day is closed';
    if (!day.week?.registrationEnabled) return 'Registration disabled';
    if (new Date() > new Date(day.week.registrationDeadline)) return 'Deadline passed';
    return '';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatDeadline = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="Failed to load cleaning data" onRetry={() => refetch()} />;

  const registration = data?.registration;
  const availableWeeks = data?.availableWeeks || [];

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
            <h2 className="text-xl font-bold text-white">Cleaning Registration</h2>
            <p className="text-gray-400 text-sm">Register for your cleaning day</p>
          </div>
        </div>
      </div>

      {/* Registration Status */}
      {registration ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-lg border border-green-500/30 rounded-xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">You are registered</h3>
              <p className="text-gray-300 mb-2">
                <span className="font-semibold text-white">{registration.cleaningDay?.dayOfWeek}</span> - {formatDate(registration.cleaningDay?.cleaningDate || '')}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                  <Users className="w-3 h-3 text-green-400" />
                  <span className="text-xs font-medium text-green-400">
                    {registration.cleaningDay?.registrations?.length || 0} / {registration.cleaningDay?.capacityLimit || 0} spots
                  </span>
                </div>
                {registration.cleaningDay?.week?.weekLabel && (
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30">
                    <CalendarDays className="w-3 h-3 text-purple-400" />
                    <span className="text-xs font-medium text-purple-400">{registration.cleaningDay.week.weekLabel}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleUnregister}
                  disabled={unregisterMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {unregisterMutation.isPending ? 'Unregistering...' : 'Unregister'}
                </button>
                <button
                  onClick={() => {
                    expandAll();
                  }}
                  className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 transition-colors text-sm"
                >
                  Change Day
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-lg border border-yellow-500/30 rounded-xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Not registered</h3>
              <p className="text-gray-300">You are not registered for any cleaning day. Select a day below to register.</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Available Days */}
      {availableWeeks.length > 0 ? (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Available Days</h3>
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

          <div className="space-y-3">
            {availableWeeks.map((week: any) => {
              const isExpanded = expandedWeeks.has(week.id);
              const hasAvailableDays = week.days && week.days.length > 0;

              return (
                <motion.div
                  key={week.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden hover:border-purple-500/30 transition-all"
                >
                  {/* Week Header */}
                  <button
                    onClick={() => toggleWeek(week.id)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-white font-semibold">
                          {week.weekLabel || `Week ${formatDate(week.startDate)}`}
                        </h4>
                        <p className="text-gray-400 text-xs">
                          {formatDate(week.startDate)} - {formatDate(week.endDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {week.registrationEnabled ? (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                          <span className="text-xs font-medium text-green-400">Open</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30">
                          <XCircle className="w-3 h-3 text-red-400" />
                          <span className="text-xs font-medium text-red-400">Closed</span>
                        </div>
                      )}
                      <div className="text-gray-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Days */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-white/10"
                      >
                        <div className="p-4">
                          {hasAvailableDays ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {week.days.map((day: any) => {
                                const disabled = isRegistrationDisabled(day);
                                const isCurrentDay = registration?.cleaningDayId === day.id;

                                return (
                                  <motion.div
                                    key={day.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`p-4 rounded-lg border transition-all ${
                                      isCurrentDay
                                        ? 'bg-purple-500/20 border-purple-500/30'
                                        : disabled
                                        ? 'bg-white/5 border-white/10 opacity-50'
                                        : 'bg-white/5 border-white/10 hover:border-purple-500/30 hover:bg-white/10'
                                    }`}
                                  >
                                    <div className="mb-3">
                                      <h5 className="text-white font-semibold text-sm">{day.dayOfWeek}</h5>
                                      <p className="text-gray-400 text-xs">{formatDate(day.cleaningDate)}</p>
                                    </div>
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30">
                                        <Users className="w-3 h-3 text-purple-400" />
                                        <span className="text-xs font-medium text-purple-400">
                                          {day.currentRegistrations} / {day.capacityLimit}
                                        </span>
                                      </div>
                                      {day.isFull ? (
                                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30">
                                          <XCircle className="w-3 h-3 text-red-400" />
                                          <span className="text-xs font-medium text-red-400">Full</span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30">
                                          <CheckCircle className="w-3 h-3 text-green-400" />
                                          <span className="text-xs font-medium text-green-400">Open</span>
                                        </div>
                                      )}
                                    </div>
                                    {disabled && (
                                      <p className="text-xs text-gray-500 mb-3">{getRegistrationDisabledReason(day)}</p>
                                    )}
                                    {registration ? (
                                      <button
                                        onClick={() => handleSwitchDay(day.id)}
                                        disabled={disabled || switchMutation.isPending || isCurrentDay}
                                        className="w-full px-3 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                      >
                                        {isCurrentDay ? 'Current Day' : 'Switch to This Day'}
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleRegister(day.id)}
                                        disabled={disabled || registerMutation.isPending}
                                        className="w-full px-3 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                      >
                                        {registerMutation.isPending ? 'Registering...' : 'Register'}
                                      </button>
                                    )}
                                  </motion.div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-6">
                              <Clock className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                              <p className="text-gray-500 text-sm">No available days in this week</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-8 text-center"
        >
          <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No available weeks</h3>
          <p className="text-gray-400">Check back later for new cleaning schedules.</p>
        </motion.div>
      )}
    </motion.div>
  );
}
