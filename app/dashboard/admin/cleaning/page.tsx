// app/dashboard/admin/cleaning/page.tsx
// Admin cleaning management page - View weeks, create weeks, manage days

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Plus,
  Trash2,
  Edit,
  UserPlus,
  Lock,
  Unlock,
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
  useRemoveStudent,
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

  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(
    new Set()
  );

  const [showCreateWeek, setShowCreateWeek] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCapacityModal, setShowCapacityModal] = useState(false);

  const [selectedDayForAssignment, setSelectedDayForAssignment] =
    useState<any>(null);

  const [selectedDayForCapacity, setSelectedDayForCapacity] =
    useState<any>(null);

  const [selectedStudentForAssignment, setSelectedStudentForAssignment] =
    useState('');

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
    if (
      confirm(
        'Are you sure you want to delete this week?\n\nThis will permanently delete:\n• All 5 days (Monday to Friday)\n• All student registrations\n• All attendance records\n\nThis action CANNOT be undone!'
      )
    ) {
      try {
        await deleteWeekMutation.mutateAsync(weekId);

        await refetch();

        alert(
          'Week deleted successfully with all registrations and attendance records.'
        );
      } catch (error) {
        console.error('Error deleting week:', error);

        alert('Failed to delete week. Please try again.');
      }
    }
  };

  const handleDeleteDay = async (dayId: string, dayName: string) => {
    if (
      confirm(
        `Are you sure you want to delete ${dayName}?\n\nThis will permanently delete:\n• All student registrations for this day\n• All attendance records for this day\n\nThis action CANNOT be undone!`
      )
    ) {
      try {
        await deleteDayMutation.mutateAsync(dayId);

        await refetch();

        alert(
          `${dayName} deleted successfully with all registrations and attendance records.`
        );
      } catch (error) {
        console.error('Error deleting day:', error);

        alert('Failed to delete day. Please try again.');
      }
    }
  };

  const handleManualAssign = async () => {
    if (!selectedDayForAssignment || !selectedStudentForAssignment) {
      return;
    }

    try {
      await manualAssignMutation.mutateAsync({
        studentUserId: selectedStudentForAssignment,
        cleaningDayId: selectedDayForAssignment.id,
      });

      setShowAssignModal(false);
      setSelectedDayForAssignment(null);
      setSelectedStudentForAssignment('');

      await refetch();

      alert('Student assigned successfully!');
    } catch (error: any) {
      console.error('Error assigning student:', error);

      alert(error.message || 'Failed to assign student');
    }
  };

  const handleMarkAttendance = async (
    userId: string,
    cleaningDayId: string,
    status: 'ATTENDED' | 'NO_SHOW' | 'PENDING'
  ) => {
    try {
      await markAttendanceMutation.mutateAsync({
        userId,
        cleaningDayId,
        status,
      });

      await refetch();
    } catch (error: any) {
      console.error('Error marking attendance:', error);

      alert(error.message || 'Failed to mark attendance');
    }
  };

  const handleRemoveStudent = async (
    studentUserId: string,
    studentName: string
  ) => {
    if (
      confirm(
        `Are you sure you want to remove ${studentName} from this cleaning day?`
      )
    ) {
      try {
        await removeStudentMutation.mutateAsync(studentUserId);

        await refetch();

        alert(`${studentName} removed successfully!`);
      } catch (error: any) {
        console.error('Error removing student:', error);

        alert(error.message || 'Failed to remove student');
      }
    }
  };

  const handleUpdateCapacity = async () => {
    if (!selectedDayForCapacity || newCapacityLimit < 1) {
      alert('Please enter a valid capacity limit (minimum 1)');
      return;
    }

    if (
      newCapacityLimit <
      selectedDayForCapacity.currentRegistrations
    ) {
      alert(
        `Capacity cannot be less than the current registrations (${selectedDayForCapacity.currentRegistrations}).`
      );

      return;
    }

    try {
      await updateDayMutation.mutateAsync({
        dayId: selectedDayForCapacity.id,
        data: {
          capacityLimit: newCapacityLimit,
        },
      });

      setShowCapacityModal(false);
      setSelectedDayForCapacity(null);

      await refetch();

      alert(
        `Capacity updated to ${newCapacityLimit} successfully!`
      );
    } catch (error: any) {
      console.error('Error updating capacity:', error);

      alert(error.message || 'Failed to update capacity limit');
    }
  };

  const handleToggleWeekRegistration = async (
    weekId: string,
    isActive: boolean
  ) => {
    try {
      await updateWeekMutation.mutateAsync({
        weekId,
        data: { isActive },
      });

      await refetch();
    } catch (error: any) {
      console.error('Error toggling week:', error);

      alert(error.message || 'Failed to update week');
    }
  };

  const handleExtendDeadline = async (weekId: string) => {
    const newDeadline = prompt(
      'Enter new registration deadline (YYYY-MM-DD HH:MM):'
    );

    if (!newDeadline) {
      return;
    }

    try {
      const deadlineDate = new Date(newDeadline);

      if (isNaN(deadlineDate.getTime())) {
        alert(
          'Invalid date format. Please use YYYY-MM-DD HH:MM'
        );

        return;
      }

      await updateWeekMutation.mutateAsync({
        weekId,
        data: {
          registrationDeadline: deadlineDate.toISOString(),
        },
      });

      await refetch();

      alert('Registration deadline extended successfully!');
    } catch (error: any) {
      console.error('Error extending deadline:', error);

      alert(error.message || 'Failed to extend deadline');
    }
  };

  const handleToggleDayStatus = async (
    dayId: string,
    currentStatus: string
  ) => {
    const newStatus =
      currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';

    try {
      await updateDayMutation.mutateAsync({
        dayId,
        data: {
          status: newStatus,
        },
      });

      await refetch();
    } catch (error: any) {
      console.error('Error toggling day:', error);

      alert(error.message || 'Failed to update day');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getUserInitials = (
    firstName: string,
    lastName: string
  ) => {
    return `${firstName?.charAt(0) || ''}${
      lastName?.charAt(0) || ''
    }`.toUpperCase();
  };

  const getAvatarColor = (
    firstName: string,
    lastName: string
  ) => {
    const colors = [
      'bg-blue-600',
      'bg-indigo-600',
      'bg-emerald-600',
      'bg-orange-600',
      'bg-violet-600',
      'bg-cyan-600',
    ];

    const hash =
      (firstName?.charCodeAt(0) || 0) +
      (lastName?.charCodeAt(0) || 0);

    return colors[Math.abs(hash) % colors.length];
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-slate-200" />

            <div className="space-y-2">
              <div className="h-6 w-48 rounded bg-slate-200" />
              <div className="h-4 w-72 rounded bg-slate-200" />
            </div>
          </div>

          <div className="h-10 w-40 rounded-lg bg-slate-200" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="mx-auto mb-3 h-6 w-6 rounded bg-slate-200" />
              <div className="mx-auto mb-2 h-8 w-14 rounded bg-slate-200" />
              <div className="mx-auto h-3 w-24 rounded bg-slate-200" />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="flex justify-between">
                <div className="flex gap-3">
                  <div className="h-11 w-11 rounded-full bg-slate-200" />

                  <div className="space-y-2">
                    <div className="h-5 w-40 rounded bg-slate-200" />
                    <div className="h-3 w-56 rounded bg-slate-200" />
                  </div>
                </div>

                <div className="h-8 w-24 rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <XCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />

        <h3 className="font-semibold text-red-800">
          Unable to load cleaning data
        </h3>

        <p className="mt-1 text-sm text-red-600">
          Please refresh the page and try again.
        </p>

        <button
          onClick={() => refetch()}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const weeks = data?.weeks || [];
  const students = data?.students || [];

  const stats = data?.stats || {
    totalRegistrations: 0,
    totalAttended: 0,
    totalNoShow: 0,
    totalPending: 0,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 pb-8"
    >
      {/* PAGE HEADER */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 border border-blue-100">
              <Sparkles className="h-5 w-5 text-[#1a365d]" />
            </div>

            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Cleaning Management
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage cleaning schedules, registrations and
                attendance.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateWeek(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1a365d] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#153475] focus:outline-none focus:ring-2 focus:ring-[#3182ce] focus:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            Create Week
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Registered
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {stats.totalRegistrations}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Attended
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {stats.totalAttended}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Pending
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {stats.totalPending}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                No Show
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {stats.totalNoShow}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* WEEKS */}
      {weeks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <Calendar className="h-7 w-7 text-slate-500" />
          </div>

          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            No cleaning weeks available
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Create a new cleaning week from Monday to Friday
            to get started.
          </p>

          <button
            onClick={() => setShowCreateWeek(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#1a365d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#153475]"
          >
            <Plus className="h-4 w-4" />
            Create First Week
          </button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {weeks.map((week: any) => {
            const isExpanded = expandedWeeks.has(week.id);

            return (
              <motion.div
                key={week.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                {/* WEEK HEADER */}
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <button
                        onClick={() => toggleWeek(week.id)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1a365d] text-white transition hover:bg-[#153475]"
                        aria-label={
                          isExpanded
                            ? 'Collapse week'
                            : 'Expand week'
                        }
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <h3 className="truncate text-base font-bold text-slate-900">
                          {week.weekLabel ||
                            `Week of ${formatDate(
                              week.startDate
                            )}`}
                        </h3>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {formatDate(week.startDate)} –{' '}
                          {formatDate(week.endDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() =>
                          handleToggleWeekRegistration(
                            week.id,
                            !week.isActive
                          )
                        }
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                          week.isActive
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        {week.isActive ? (
                          <Unlock className="h-3.5 w-3.5" />
                        ) : (
                          <Lock className="h-3.5 w-3.5" />
                        )}

                        {week.isActive ? 'Open' : 'Closed'}
                      </button>

                      <button
                        onClick={() =>
                          handleExtendDeadline(week.id)
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                      >
                        <Clock className="h-3.5 w-3.5" />
                        Extend Deadline
                      </button>

                      <button
                        onClick={() =>
                          handleDeleteWeek(week.id)
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">
                          Delete
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* DAYS */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border-t border-slate-200 bg-slate-50"
                    >
                      <div className="space-y-4 p-4 sm:p-5">
                        {week.days.map((day: any) => (
                          <div
                            key={day.id}
                            className="rounded-xl border border-slate-200 bg-white shadow-sm"
                          >
                            {/* DAY HEADER */}
                            <div className="border-b border-slate-100 p-4">
                              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="font-bold text-slate-900">
                                      {day.dayOfWeek}
                                    </h4>

                                    <span
                                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                        day.status === 'OPEN'
                                          ? 'bg-emerald-50 text-emerald-700'
                                          : day.status === 'FULL'
                                            ? 'bg-amber-50 text-amber-700'
                                            : 'bg-red-50 text-red-700'
                                      }`}
                                    >
                                      {day.status}
                                    </span>
                                  </div>

                                  <p className="mt-1 text-xs text-slate-500">
                                    {formatDate(
                                      day.cleaningDate
                                    )}
                                  </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                  <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                                    <Users className="h-3.5 w-3.5" />

                                    {day.currentRegistrations} /{' '}
                                    {day.capacityLimit}
                                  </div>

                                  <button
                                    onClick={() =>
                                      handleToggleDayStatus(
                                        day.id,
                                        day.status
                                      )
                                    }
                                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                                      day.status === 'OPEN' ||
                                      day.status === 'FULL'
                                        ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                                        : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                    }`}
                                  >
                                    {day.status === 'OPEN' ||
                                    day.status === 'FULL' ? (
                                      <>
                                        <Lock className="h-3.5 w-3.5" />
                                        Close Day
                                      </>
                                    ) : (
                                      <>
                                        <Unlock className="h-3.5 w-3.5" />
                                        Open Day
                                      </>
                                    )}
                                  </button>

                                  <button
                                    onClick={() => {
                                      setSelectedDayForCapacity(
                                        day
                                      );
                                      setNewCapacityLimit(
                                        day.capacityLimit
                                      );
                                      setShowCapacityModal(true);
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                    Capacity
                                  </button>

                                  {day.status !== 'FULL' && (
                                    <button
                                      onClick={() => {
                                        setSelectedDayForAssignment(
                                          day
                                        );
                                        setShowAssignModal(true);
                                      }}
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#1a365d]/20 bg-[#1a365d]/5 px-3 py-1.5 text-xs font-semibold text-[#1a365d] hover:bg-[#1a365d]/10"
                                    >
                                      <UserPlus className="h-3.5 w-3.5" />
                                      Assign
                                    </button>
                                  )}

                                  <button
                                    onClick={() =>
                                      handleDeleteDay(
                                        day.id,
                                        day.dayOfWeek
                                      )
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />

                                    <span className="hidden sm:inline">
                                      Delete
                                    </span>
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* REGISTERED STUDENTS */}
                            <div className="p-4">
                              {day.registrations &&
                              day.registrations.length > 0 ? (
                                <div className="space-y-2">
                                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Registered Students
                                  </div>

                                  {day.registrations.map(
                                    (reg: any) => {
                                      const attendance =
                                        day.attendanceRecords?.find(
                                          (a: any) =>
                                            a.userId ===
                                            reg.userId
                                        );

                                      const initials =
                                        getUserInitials(
                                          reg.user.firstName,
                                          reg.user.lastName
                                        );

                                      return (
                                        <div
                                          key={reg.id}
                                          className="flex flex-col gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                          <div className="flex min-w-0 items-center gap-3">
                                            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-white">
                                              {reg.user
                                                .profileImageUrl ? (
                                                <img
                                                  src={
                                                    reg.user
                                                      .profileImageUrl
                                                  }
                                                  alt={`${reg.user.firstName} ${reg.user.lastName}`}
                                                  className="h-full w-full object-cover"
                                                />
                                              ) : (
                                                <div
                                                  className={`flex h-full w-full items-center justify-center ${getAvatarColor(
                                                    reg.user
                                                      .firstName,
                                                    reg.user
                                                      .lastName
                                                  )}`}
                                                >
                                                  <span className="text-xs font-bold text-white">
                                                    {initials ||
                                                      'U'}
                                                  </span>
                                                </div>
                                              )}
                                            </div>

                                            <div className="min-w-0">
                                              <p className="truncate text-sm font-semibold text-slate-900">
                                                {
                                                  reg.user
                                                    .firstName
                                                }{' '}
                                                {
                                                  reg.user
                                                    .lastName
                                                }
                                              </p>

                                              {attendance && (
                                                <span
                                                  className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                                    attendance.status ===
                                                    'ATTENDED'
                                                      ? 'bg-emerald-50 text-emerald-700'
                                                      : attendance.status ===
                                                          'NO_SHOW'
                                                        ? 'bg-red-50 text-red-700'
                                                        : 'bg-amber-50 text-amber-700'
                                                  }`}
                                                >
                                                  {attendance.status.replace(
                                                    '_',
                                                    ' '
                                                  )}
                                                </span>
                                              )}
                                            </div>
                                          </div>

                                          <div className="flex flex-wrap items-center gap-1">
                                            <button
                                              onClick={() =>
                                                handleMarkAttendance(
                                                  reg.userId,
                                                  day.id,
                                                  'ATTENDED'
                                                )
                                              }
                                              className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                                              title="Mark as attended"
                                            >
                                              <CheckCircle className="h-3.5 w-3.5" />
                                              <span className="hidden md:inline">
                                                Attended
                                              </span>
                                            </button>

                                            <button
                                              onClick={() =>
                                                handleMarkAttendance(
                                                  reg.userId,
                                                  day.id,
                                                  'NO_SHOW'
                                                )
                                              }
                                              className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                                              title="Mark as no-show"
                                            >
                                              <XCircle className="h-3.5 w-3.5" />
                                              <span className="hidden md:inline">
                                                No Show
                                              </span>
                                            </button>

                                            <button
                                              onClick={() =>
                                                handleMarkAttendance(
                                                  reg.userId,
                                                  day.id,
                                                  'PENDING'
                                                )
                                              }
                                              className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100"
                                              title="Mark as pending"
                                            >
                                              <Clock className="h-3.5 w-3.5" />
                                              <span className="hidden md:inline">
                                                Pending
                                              </span>
                                            </button>

                                            <button
                                              onClick={() =>
                                                handleRemoveStudent(
                                                  reg.userId,
                                                  `${reg.user.firstName} ${reg.user.lastName}`
                                                )
                                              }
                                              className="inline-flex items-center gap-1 rounded-md border border-orange-200 bg-orange-50 px-2 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-100"
                                              title="Remove student"
                                            >
                                              <Trash2 className="h-3.5 w-3.5" />
                                              <span className="hidden md:inline">
                                                Remove
                                              </span>
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              ) : (
                                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                                  <Users className="mx-auto h-8 w-8 text-slate-300" />

                                  <p className="mt-2 text-sm font-medium text-slate-600">
                                    No students registered
                                  </p>

                                  <p className="mt-1 text-xs text-slate-400">
                                    Students assigned to this
                                    cleaning day will appear here.
                                  </p>
                                </div>
                              )}
                            </div>
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

      {/* CREATE WEEK MODAL */}
      <AnimatePresence>
        {showCreateWeek && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onClick={() => setShowCreateWeek(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 10 }}
              className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5">
                <h3 className="text-xl font-bold text-slate-900">
                  Create New Week
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  This will create five cleaning days from Monday
                  to Friday.
                </p>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();

                  const form = e.currentTarget;
                  const formData = new FormData(form);

                  const startDate =
                    formData.get('startDate') as string;

                  const weekLabel =
                    formData.get('weekLabel') as string;

                  const capacityLimit =
                    parseInt(
                      formData.get('capacityLimit') as string
                    ) || 5;

                  const registrationDeadline =
                    formData.get(
                      'registrationDeadline'
                    ) as string;

                  if (!startDate) {
                    alert('Please select a start date');
                    return;
                  }

                  if (!registrationDeadline) {
                    alert(
                      'Please select a registration deadline'
                    );
                    return;
                  }

                  const selectedDate = new Date(startDate);

                  if (selectedDate.getDay() !== 1) {
                    const dayNames = [
                      'Sunday',
                      'Monday',
                      'Tuesday',
                      'Wednesday',
                      'Thursday',
                      'Friday',
                      'Saturday',
                    ];

                    alert(
                      `Start date must be a Monday. Selected date is ${dayNames[selectedDate.getDay()]}. Please select a Monday.`
                    );

                    return;
                  }

                  const payload = {
                    startDate,
                    weekLabel: weekLabel || undefined,
                    capacityLimit,
                    registrationDeadline,
                  };

                  try {
                    await createWeekMutation.mutateAsync(
                      payload
                    );

                    setShowCreateWeek(false);

                    await refetch();

                    alert(
                      'Week created successfully with 5 days (Monday to Friday)!'
                    );
                  } catch (error: any) {
                    console.error(
                      'Error creating week:',
                      error
                    );

                    alert(
                      error.message ||
                        'Failed to create week. Please try again.'
                    );
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Start Date
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    required
                    defaultValue={getNextMonday()}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#3182ce] focus:ring-2 focus:ring-blue-100"
                  />

                  <p className="mt-1 text-xs text-slate-400">
                    Must be a Monday.
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Week Label
                  </label>

                  <input
                    type="text"
                    name="weekLabel"
                    placeholder="e.g. Week 1"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#3182ce] focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Capacity Per Day
                  </label>

                  <input
                    type="number"
                    name="capacityLimit"
                    defaultValue={5}
                    min={1}
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#3182ce] focus:ring-2 focus:ring-blue-100"
                  />

                  <p className="mt-1 text-xs text-slate-400">
                    Maximum students allowed per day.
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Registration Deadline
                  </label>

                  <input
                    type="datetime-local"
                    name="registrationDeadline"
                    required
                    defaultValue={new Date(
                      Date.now() +
                        7 * 24 * 60 * 60 * 1000
                    )
                      .toISOString()
                      .slice(0, 16)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#3182ce] focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setShowCreateWeek(false)
                    }
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      createWeekMutation.isPending
                    }
                    className="flex-1 rounded-lg bg-[#1a365d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#153475] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {createWeekMutation.isPending
                      ? 'Creating...'
                      : 'Create Week'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ASSIGN STUDENT MODAL */}
      <AnimatePresence>
        {showAssignModal &&
          selectedDayForAssignment && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
              onClick={() => setShowAssignModal(false)}
            >
              <motion.div
                initial={{
                  scale: 0.96,
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  scale: 0.96,
                  opacity: 0,
                  y: 10,
                }}
                className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-slate-900">
                  Assign Student
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Assign a student to{' '}
                  <strong>
                    {selectedDayForAssignment.dayOfWeek}
                  </strong>{' '}
                  (
                  {formatDate(
                    selectedDayForAssignment.cleaningDate
                  )}
                  ).
                </p>

                <div className="mt-5 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Select Student
                    </label>

                    <select
                      value={
                        selectedStudentForAssignment
                      }
                      onChange={(e) =>
                        setSelectedStudentForAssignment(
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#3182ce] focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">
                        Choose a student...
                      </option>

                      {students.map((student: any) => (
                        <option
                          key={student.id}
                          value={student.id}
                        >
                          {student.firstName}{' '}
                          {student.lastName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        setShowAssignModal(false)
                      }
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleManualAssign}
                      disabled={
                        !selectedStudentForAssignment ||
                        manualAssignMutation.isPending
                      }
                      className="flex-1 rounded-lg bg-[#1a365d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#153475] disabled:opacity-50"
                    >
                      {manualAssignMutation.isPending
                        ? 'Assigning...'
                        : 'Assign Student'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
      </AnimatePresence>

      {/* CAPACITY MODAL */}
      <AnimatePresence>
        {showCapacityModal &&
          selectedDayForCapacity && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
              onClick={() =>
                setShowCapacityModal(false)
              }
            >
              <motion.div
                initial={{
                  scale: 0.96,
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  scale: 0.96,
                  opacity: 0,
                  y: 10,
                }}
                className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-slate-900">
                  Update Capacity
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Update the capacity for{' '}
                  <strong>
                    {selectedDayForCapacity.dayOfWeek}
                  </strong>{' '}
                  (
                  {formatDate(
                    selectedDayForCapacity.cleaningDate
                  )}
                  ).
                </p>

                <div className="mt-5 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      New Capacity Limit
                    </label>

                    <input
                      type="number"
                      value={newCapacityLimit}
                      onChange={(e) =>
                        setNewCapacityLimit(
                          parseInt(e.target.value) || 0
                        )
                      }
                      min={1}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#3182ce] focus:ring-2 focus:ring-blue-100"
                    />

                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-slate-500">
                        Current registrations:{' '}
                        <strong>
                          {
                            selectedDayForCapacity.currentRegistrations
                          }
                        </strong>
                      </p>

                      <p className="text-xs text-slate-400">
                        Capacity cannot be lower than current
                        registrations.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        setShowCapacityModal(false)
                      }
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleUpdateCapacity}
                      disabled={
                        newCapacityLimit < 1 ||
                        newCapacityLimit <
                          selectedDayForCapacity.currentRegistrations ||
                        updateDayMutation.isPending
                      }
                      className="flex-1 rounded-lg bg-[#1a365d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#153475] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updateDayMutation.isPending
                        ? 'Updating...'
                        : 'Update Capacity'}
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