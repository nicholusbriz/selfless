// app/dashboard/admin/cleaning/page.tsx
// Admin cleaning management page - View weeks, create weeks, manage days

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Users, CheckCircle, XCircle, Clock, ChevronDown, 
  ChevronUp, Sparkles, Plus, Trash2, Edit, UserPlus, Lock, Unlock 
} from 'lucide-react';
import { 
  useAdminCleaning, 
  useCreateWeek, 
  useUpdateWeek, 
  useDeleteWeek,
  useUpdateDay,
  useDeleteDay,
  useManualAssign,
  useMarkAttendance,
  useRemoveStudent
} from '@/hooks/useCleaning';

// Helper to get next Monday
const getNextMonday = () => {
  const date = new Date();
  const day = date.getDay();
  if (day === 1) {
    return date.toISOString().split('T')[0];
  }
  const diff = day === 0 ? 1 : 8 - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().split('T')[0];
};

export default function AdminCleaningManagement() {
  const { data, isLoading, error, refetch } = useAdminCleaning();
  const createWeekMutation = useCreateWeek();
  const updateWeekMutation = useUpdateWeek();
  const deleteWeekMutation = useDeleteWeek();
  const updateDayMutation = useUpdateDay();
  const deleteDayMutation = useDeleteDay();
  const manualAssignMutation = useManualAssign();
  const markAttendanceMutation = useMarkAttendance();
  const removeStudentMutation = useRemoveStudent();
  
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());
  const [showCreateWeek, setShowCreateWeek] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCapacityModal, setShowCapacityModal] = useState(false);
  const [selectedDayForAssignment, setSelectedDayForAssignment] = useState<any>(null);
  const [selectedDayForCapacity, setSelectedDayForCapacity] = useState<any>(null);
  const [selectedStudentForAssignment, setSelectedStudentForAssignment] = useState('');
  const [newCapacityLimit, setNewCapacityLimit] = useState<number>(0);

  const toggleWeek = (weekId: string) => {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(weekId)) {
      newExpanded.delete(weekId);
    } else {
      newExpanded.add(weekId);
    }
    setExpandedWeeks(newExpanded);
  };

  const handleDeleteWeek = async (weekId: string) => {
    if (confirm('⚠️ Are you sure you want to delete this week?\n\nThis will permanently delete:\n• All 5 days (Monday to Friday)\n• All student registrations\n• All attendance records\n\nThis action CANNOT be undone!')) {
      try {
        await deleteWeekMutation.mutateAsync(weekId);
        await refetch();
        alert('✅ Week deleted successfully with all registrations and attendance records.');
      } catch (error) {
        console.error('Error deleting week:', error);
        alert('❌ Failed to delete week. Please try again.');
      }
    }
  };

  const handleDeleteDay = async (dayId: string, dayName: string) => {
    if (confirm(`⚠️ Are you sure you want to delete ${dayName}?\n\nThis will permanently delete:\n• All student registrations for this day\n• All attendance records for this day\n\nThis action CANNOT be undone!`)) {
      try {
        await deleteDayMutation.mutateAsync(dayId);
        await refetch();
        alert(`✅ ${dayName} deleted successfully with all registrations and attendance records.`);
      } catch (error) {
        console.error('Error deleting day:', error);
        alert('❌ Failed to delete day. Please try again.');
      }
    }
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
      alert('✅ Student assigned successfully!');
    } catch (error: any) {
      console.error('Error assigning student:', error);
      alert(error.message || '❌ Failed to assign student');
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
    } catch (error: any) {
      console.error('Error marking attendance:', error);
      alert(error.message || '❌ Failed to mark attendance');
    }
  };

  const handleRemoveStudent = async (studentUserId: string, studentName: string) => {
    if (confirm(`Are you sure you want to remove ${studentName} from this cleaning day?`)) {
      try {
        await removeStudentMutation.mutateAsync(studentUserId);
        await refetch();
        alert(`✅ ${studentName} removed successfully!`);
      } catch (error: any) {
        console.error('Error removing student:', error);
        alert(error.message || '❌ Failed to remove student');
      }
    }
  };

  const handleUpdateCapacity = async () => {
    if (!selectedDayForCapacity || newCapacityLimit < 1) {
      alert('Please enter a valid capacity limit (minimum 1)');
      return;
    }

    try {
      await updateDayMutation.mutateAsync({
        dayId: selectedDayForCapacity.id,
        data: { capacityLimit: newCapacityLimit },
      });
      setShowCapacityModal(false);
      setSelectedDayForCapacity(null);
      await refetch();
      alert(`✅ Capacity updated to ${newCapacityLimit} successfully!`);
    } catch (error: any) {
      console.error('Error updating capacity:', error);
      alert(error.message || '❌ Failed to update capacity limit');
    }
  };

  const handleToggleWeekRegistration = async (weekId: string, isActive: boolean) => {
    try {
      await updateWeekMutation.mutateAsync({
        weekId,
        data: { isActive },
      });
      await refetch();
    } catch (error: any) {
      console.error('Error toggling week:', error);
      alert(error.message || '❌ Failed to update week');
    }
  };

  const handleExtendDeadline = async (weekId: string) => {
    const newDeadline = prompt('Enter new registration deadline (YYYY-MM-DD HH:MM):');
    if (!newDeadline) return;
    
    try {
      const deadlineDate = new Date(newDeadline);
      if (isNaN(deadlineDate.getTime())) {
        alert('Invalid date format. Please use YYYY-MM-DD HH:MM');
        return;
      }
      
      await updateWeekMutation.mutateAsync({
        weekId,
        data: { registrationDeadline: deadlineDate.toISOString() },
      });
      await refetch();
      alert('✅ Registration deadline extended successfully!');
    } catch (error: any) {
      console.error('Error extending deadline:', error);
      alert(error.message || '❌ Failed to extend deadline');
    }
  };

  const handleToggleDayStatus = async (dayId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      await updateDayMutation.mutateAsync({
        dayId,
        data: { status: newStatus },
      });
      await refetch();
    } catch (error: any) {
      console.error('Error toggling day:', error);
      alert(error.message || '❌ Failed to update day');
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

  // Get initials for user
  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-0">
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-6 bg-white/10 rounded w-48 animate-pulse"></div>
                <div className="h-4 bg-white/10 rounded w-64 animate-pulse"></div>
              </div>
            </div>
            <div className="h-10 bg-white/10 rounded-lg w-32 animate-pulse"></div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white/5 rounded-xl p-3 animate-pulse">
                <div className="h-5 bg-white/10 rounded w-8 mx-auto mb-2"></div>
                <div className="h-8 bg-white/10 rounded w-12 mx-auto"></div>
                <div className="h-3 bg-white/10 rounded w-20 mx-auto mt-2"></div>
              </div>
            ))}
          </div>

          {/* Weeks List Skeleton */}
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/5 rounded-xl p-4 animate-pulse">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10"></div>
                    <div className="space-y-2">
                      <div className="h-5 bg-white/10 rounded w-40"></div>
                      <div className="h-3 bg-white/10 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-6 bg-white/10 rounded-full w-16"></div>
                    <div className="w-8 h-8 bg-white/10 rounded-lg"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  {[1, 2].map(j => (
                    <div key={j} className="bg-white/5 rounded-lg p-3">
                      <div className="h-4 bg-white/10 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-white/10 rounded w-32 mb-3"></div>
                      <div className="flex items-center justify-between">
                        <div className="h-6 bg-white/10 rounded-full w-20"></div>
                        <div className="flex gap-1">
                          <div className="w-6 h-6 bg-white/10 rounded"></div>
                          <div className="w-6 h-6 bg-white/10 rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) return <div>Failed to load cleaning data</div>;

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
            <p className="text-gray-400 text-sm">Manage cleaning schedules (Monday to Friday), registrations, and attendance</p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateWeek(true)}
          className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Week (Mon-Fri)
        </button>
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
          <p className="text-gray-400">Create a new week (Monday to Friday) to get started with the cleaning schedule.</p>
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
                        {week.weekLabel || `Week of ${formatDate(week.startDate)}`}
                      </h3>
                      <p className="text-gray-400 text-xs">
                        {formatDate(week.startDate)} - {formatDate(week.endDate)} (Mon-Fri)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleWeekRegistration(week.id, !week.isActive)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full border transition-colors ${
                        week.isActive
                          ? 'bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30'
                          : 'bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30'
                      }`}
                      title={week.isActive ? 'Close registration' : 'Open registration'}
                    >
                      {week.isActive ? (
                        <Unlock className="w-3 h-3" />
                      ) : (
                        <Lock className="w-3 h-3" />
                      )}
                      <span className="text-xs font-medium">
                        {week.isActive ? 'Open' : 'Closed'}
                      </span>
                    </button>
                    <button
                      onClick={() => handleExtendDeadline(week.id)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-blue-500/30 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                      title="Extend registration deadline"
                    >
                      <Clock className="w-3 h-3" />
                      <span className="text-xs font-medium">Extend Deadline</span>
                    </button>
                    <button
                      onClick={() => handleDeleteWeek(week.id)}
                      className="p-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors"
                      title="Delete week and all registrations"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
                                    {day.currentRegistrations} / {day.capacityLimit}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleToggleDayStatus(day.id, day.status)}
                                  className={`p-1.5 rounded-lg border transition-colors ${
                                    day.status === 'OPEN' || day.status === 'FULL'
                                      ? 'bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30'
                                      : 'bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30'
                                  }`}
                                  title={day.status === 'OPEN' || day.status === 'FULL' ? 'Close day' : 'Open day'}
                                >
                                  {day.status === 'OPEN' || day.status === 'FULL' ? (
                                    <Unlock className="w-4 h-4" />
                                  ) : (
                                    <Lock className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedDayForCapacity(day);
                                    setNewCapacityLimit(day.capacityLimit);
                                    setShowCapacityModal(true);
                                  }}
                                  className="p-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-colors"
                                  title="Edit capacity limit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                {day.status !== 'FULL' && (
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
                                )}
                                <button
                                  onClick={() => handleDeleteDay(day.id, day.dayOfWeek)}
                                  className="p-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors"
                                  title="Delete day and all registrations"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Registered Students */}
                            {day.registrations && day.registrations.length > 0 && (
                              <div className="space-y-2">
                                {day.registrations.map((reg: any) => {
                                  const attendance = day.attendanceRecords?.find((a: any) => a.userId === reg.userId);
                                  const initials = getUserInitials(reg.user.firstName, reg.user.lastName);
                                  
                                  return (
                                    <div
                                      key={reg.id}
                                      className="flex items-center justify-between p-2 rounded bg-white/5"
                                    >
                                      <div className="flex items-center gap-2">
                                        {/* Avatar Placeholder */}
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                          {initials || 'U'}
                                        </div>
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
                                        <button
                                          onClick={() => handleRemoveStudent(reg.userId, `${reg.user.firstName} ${reg.user.lastName}`)}
                                          className="p-1 rounded bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
                                          title="Remove student from day"
                                        >
                                          <Trash2 className="w-4 h-4" />
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

      {/* Create Week Modal */}
      <AnimatePresence>
        {showCreateWeek && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateWeek(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Create New Week (Mon-Fri)</h3>
              <p className="text-gray-400 text-sm mb-4">Creates 5 days: Monday to Friday</p>
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const formData = new FormData(form);
                  
                  const startDate = formData.get('startDate') as string;
                  const weekLabel = formData.get('weekLabel') as string;
                  const capacityLimit = parseInt(formData.get('capacityLimit') as string) || 5;
                  const registrationDeadline = formData.get('registrationDeadline') as string;
                  
                  console.log('📝 Form values:', { startDate, weekLabel, capacityLimit, registrationDeadline });
                  
                  if (!startDate) {
                    alert('Please select a start date');
                    return;
                  }
                  
                  if (!registrationDeadline) {
                    alert('Please select a registration deadline');
                    return;
                  }
                  
                  const selectedDate = new Date(startDate);
                  console.log('📅 Selected date:', selectedDate, 'Day:', selectedDate.getDay());
                  
                  if (selectedDate.getDay() !== 1) {
                    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    alert(`❌ Start date must be a Monday. Selected date is ${dayNames[selectedDate.getDay()]}. Please select a Monday.`);
                    return;
                  }
                  
                  const data = {
                    startDate: startDate,
                    weekLabel: weekLabel || undefined,
                    capacityLimit: capacityLimit,
                    registrationDeadline: registrationDeadline,
                  };
                  
                  console.log('📤 Submitting to API:', data);
                  
                  try {
                    await createWeekMutation.mutateAsync(data);
                    setShowCreateWeek(false);
                    await refetch();
                    alert('✅ Week created successfully with 5 days (Monday to Friday)!');
                  } catch (error: any) {
                    console.error('❌ Error from mutation:', error);
                    alert(error.message || 'Failed to create week. Please try again.');
                  }
                }} 
                className="space-y-4"
              >
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Start Date (Monday)</label>
                  <input
                    type="date"
                    name="startDate"
                    required
                    defaultValue={getNextMonday()}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Must be a Monday</p>
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Week Label (optional)</label>
                  <input
                    type="text"
                    name="weekLabel"
                    placeholder="e.g., Week 1"
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Capacity per Day</label>
                  <input
                    type="number"
                    name="capacityLimit"
                    defaultValue={5}
                    min={1}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum students per day</p>
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Registration Deadline</label>
                  <input
                    type="datetime-local"
                    name="registrationDeadline"
                    required
                    defaultValue={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateWeek(false)}
                    className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createWeekMutation.isPending}
                    className="flex-1 px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 transition-colors disabled:opacity-50"
                  >
                    {createWeekMutation.isPending ? 'Creating...' : 'Create Week (Mon-Fri)'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[#F5F0E8] focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Choose a student...</option>
                    {students.map((student: any) => (
                      <option key={student.id} value={student.id} className="text-[#0B0912]">
                        {student.firstName} {student.lastName}
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

      {/* Update Capacity Modal */}
      <AnimatePresence>
        {showCapacityModal && selectedDayForCapacity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCapacityModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Update Capacity Limit</h3>
              <p className="text-gray-400 text-sm mb-4">
                Update capacity for {selectedDayForCapacity.dayOfWeek} ({formatDate(selectedDayForCapacity.cleaningDate)})
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">New Capacity Limit</label>
                  <input
                    type="number"
                    value={newCapacityLimit}
                    onChange={(e) => setNewCapacityLimit(parseInt(e.target.value) || 0)}
                    min={1}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Current registrations: {selectedDayForCapacity.currentRegistrations}
                  </p>
                  <p className="text-xs text-gray-500">
                    Cannot be less than current registrations ({selectedDayForCapacity.currentRegistrations})
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCapacityModal(false)}
                    className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateCapacity}
                    disabled={newCapacityLimit < 1 || newCapacityLimit < selectedDayForCapacity.currentRegistrations || updateDayMutation.isPending}
                    className="flex-1 px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                  >
                    {updateDayMutation.isPending ? 'Updating...' : 'Update'}
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