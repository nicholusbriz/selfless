'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Users, CheckCircle, XCircle, Clock, ChevronDown, 
  ChevronUp, Sparkles, UserPlus 
} from 'lucide-react';
import { 
  useTeacherCleaning, 
  useManualAssign,
  useMarkAttendance,
  useUpdateDay
} from '@/hooks/useCleaning';
import LoadingState from '@/components/shared/LoadingState';
import ErrorState from '@/components/shared/ErrorState';
import UserAvatar from '@/components/shared/UserAvatar';

export default function TeacherCleaningManagement() {
  const { data, isLoading, error, refetch } = useTeacherCleaning();
  const manualAssignMutation = useManualAssign();
  const markAttendanceMutation = useMarkAttendance();
  const updateDayMutation = useUpdateDay();
  
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDayForAssignment, setSelectedDayForAssignment] = useState<any>(null);
  const [selectedStudentForAssignment, setSelectedStudentForAssignment] = useState('');

  const toggleWeek = (weekId: string) => {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(weekId)) {
      newExpanded.delete(weekId);
    } else {
      newExpanded.add(weekId);
    }
    setExpandedWeeks(newExpanded);
  };

  const handleManualAssign = async () => {
    if (!selectedDayForAssignment || !selectedStudentForAssignment) return;
    
    try {
      await manualAssignMutation.mutateAsync({
        studentUserId: selectedStudentForAssignment,
        cleaningDayId: selectedDayForAssignment.id,
      });
      setShowAssignModal(false);
      setSelectedDayForAssignment(null);
      setSelectedStudentForAssignment('');
      await refetch();
    } catch (error) {
      console.error('Error assigning student:', error);
    }
  };

  const handleMarkAttendance = async (userId: string, cleaningDayId: string, status: 'ATTENDED' | 'NO_SHOW' | 'PENDING') => {
    try {
      await markAttendanceMutation.mutateAsync({
        userId,
        cleaningDayId,
        status,
      });
      await refetch();
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  const handleToggleDayOpen = async (dayId: string, isOpen: boolean) => {
    try {
      await updateDayMutation.mutateAsync({
        dayId,
        data: { isOpen },
      });
      await refetch();
    } catch (error) {
      console.error('Error toggling day:', error);
    }
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

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="Failed to load cleaning data" onRetry={() => refetch()} />;

  const weeks = data?.weeks || [];
  const students = data?.students || [];
  const stats = data?.stats || { totalRegistrations: 0, totalAttended: 0, totalNoShow: 0, totalPending: 0 };

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
            <h2 className="text-xl font-bold text-white">Cleaning Management</h2>
            <p className="text-gray-400 text-sm">Manage cleaning schedules, registrations, and attendance</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-purple-500/10 rounded-xl p-3 text-center border border-purple-500/20"
        >
          <Users className="w-5 h-5 text-purple-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{stats.totalRegistrations}</p>
          <p className="text-gray-400 text-xs">Total Registered</p>
        </motion.div>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-green-500/10 rounded-xl p-3 text-center border border-green-500/20"
        >
          <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{stats.totalAttended}</p>
          <p className="text-gray-400 text-xs">Total Attended</p>
        </motion.div>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-yellow-500/10 rounded-xl p-3 text-center border border-yellow-500/20"
        >
          <Clock className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{stats.totalPending}</p>
          <p className="text-gray-400 text-xs">Total Pending</p>
        </motion.div>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-red-500/10 rounded-xl p-3 text-center border border-red-500/20"
        >
          <XCircle className="w-5 h-5 text-red-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{stats.totalNoShow}</p>
          <p className="text-gray-400 text-xs">Total No Show</p>
        </motion.div>
      </div>

      {/* Weeks List */}
      {weeks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-8 text-center"
        >
          <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No cleaning weeks available</h3>
          <p className="text-gray-400">Contact an admin to create cleaning schedules.</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {weeks.map((week: any) => {
            const isExpanded = expandedWeeks.has(week.id);
            return (
              <motion.div
                key={week.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden hover:border-purple-500/30 transition-all"
              >
                {/* Week Header */}
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleWeek(week.id)}
                      className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-white" /> : <ChevronDown className="w-5 h-5 text-white" />}
                    </button>
                    <div className="text-left">
                      <h3 className="text-white font-semibold">
                        {week.weekLabel || `Week ${formatDate(week.startDate)}`}
                      </h3>
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
                      className="border-t border-white/10"
                    >
                      <div className="p-4 space-y-3">
                        {week.days.map((day: any) => (
                          <div
                            key={day.id}
                            className="bg-white/5 rounded-lg p-4 border border-white/10"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="text-white font-semibold">{day.dayOfWeek}</h4>
                                <p className="text-gray-400 text-xs">{formatDate(day.cleaningDate)}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30">
                                  <Users className="w-3 h-3 text-purple-400" />
                                  <span className="text-xs font-medium text-purple-400">
                                    {day.registrations?.length || 0} / {day.capacityLimit}
                                  </span>
                                </div>
                                <button
                                  onClick={() => {
                                    setSelectedDayForAssignment(day);
                                    setShowAssignModal(true);
                                  }}
                                  className="p-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 transition-colors"
                                  title="Assign student"
                                >
                                  <UserPlus className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleToggleDayOpen(day.id, !day.isOpen)}
                                  className={`p-1.5 rounded-lg border transition-colors ${
                                    day.isOpen 
                                      ? 'bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30' 
                                      : 'bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30'
                                  }`}
                                  title={day.isOpen ? 'Close day' : 'Open day'}
                                >
                                  {day.isOpen ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>

                            {/* Registered Students */}
                            {day.registrations && day.registrations.length > 0 && (
                              <div className="space-y-2">
                                {day.registrations.map((reg: any) => {
                                  const attendance = day.attendanceRecords?.find((a: any) => a.userId === reg.userId);
                                  return (
                                    <div
                                      key={reg.id}
                                      className="flex items-center justify-between p-2 rounded bg-white/5"
                                    >
                                      <div className="flex items-center gap-2">
                                        <UserAvatar user={reg.user} size="sm" />
                                        <span className="text-white text-sm">
                                          {reg.user.firstName} {reg.user.lastName}
                                        </span>
                                        {attendance && (
                                          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${
                                            attendance.status === 'ATTENDED' ? 'bg-green-500/20 border-green-500/30' :
                                            attendance.status === 'NO_SHOW' ? 'bg-red-500/20 border-red-500/30' :
                                            'bg-yellow-500/20 border-yellow-500/30'
                                          }`}>
                                            <span className={`text-xs font-medium ${
                                              attendance.status === 'ATTENDED' ? 'text-green-400' :
                                              attendance.status === 'NO_SHOW' ? 'text-red-400' :
                                              'text-yellow-400'
                                            }`}>
                                              {attendance.status.toLowerCase()}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() => handleMarkAttendance(reg.userId, day.id, 'ATTENDED')}
                                          className="p-1 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                          title="Mark as attended"
                                        >
                                          <CheckCircle className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => handleMarkAttendance(reg.userId, day.id, 'NO_SHOW')}
                                          className="p-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                          title="Mark as no-show"
                                        >
                                          <XCircle className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => handleMarkAttendance(reg.userId, day.id, 'PENDING')}
                                          className="p-1 rounded bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                                          title="Mark as pending"
                                        >
                                          <Clock className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Assign Student Modal */}
      <AnimatePresence>
        {showAssignModal && selectedDayForAssignment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAssignModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Assign Student</h3>
              <p className="text-gray-400 text-sm mb-4">
                Assign a student to {selectedDayForAssignment.dayOfWeek} ({formatDate(selectedDayForAssignment.cleaningDate)})
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Select Student</label>
                  <select
                    value={selectedStudentForAssignment}
                    onChange={(e) => setSelectedStudentForAssignment(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Choose a student...</option>
                    {students.map((student: any) => (
                      <option key={student.id} value={student.id}>
                        {student.firstName} {student.lastName} ({student.studentProfile?.studentId || 'N/A'})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleManualAssign}
                    disabled={!selectedStudentForAssignment || manualAssignMutation.isPending}
                    className="flex-1 px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 transition-colors disabled:opacity-50"
                  >
                    {manualAssignMutation.isPending ? 'Assigning...' : 'Assign'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
