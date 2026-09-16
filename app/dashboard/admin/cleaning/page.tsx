// app/dashboard/admin/cleaning/page.tsx
// Admin cleaning management page - View weeks, create weeks, manage days

'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
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
  MoreVertical,
  UserCheck,
  UserX,
  Hourglass,
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
  type CleaningDay,
  type CleaningWeek,
  type CleaningRegistration,
  type AttendanceRecord,
} from '@/hooks/useCleaning';

/* ============================================================
   TYPES
============================================================ */

type MenuType =
  | `week-${string}`
  | `day-${string}`
  | `student-${string}`
  | null;

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

/* ============================================================
   ACTION MENU
============================================================ */

interface ActionMenuProps {
  menuId: string;
  activeMenu: MenuType;
  setActiveMenu: (menu: MenuType) => void;
  children: React.ReactNode;
  align?: 'left' | 'right';
}

function ActionMenu({
  menuId,
  activeMenu,
  setActiveMenu,
  children,
  align = 'right',
}: ActionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  const isOpen = activeMenu === menuId;

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setActiveMenu(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      );
      document.removeEventListener(
        'keydown',
        handleEscape
      );
    };
  }, [isOpen, setActiveMenu]);

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() =>
          setActiveMenu(isOpen ? null : (menuId as MenuType))
        }
        aria-label="Open actions"
        aria-expanded={isOpen}
        className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
          isOpen
            ? 'border-slate-300 bg-slate-100 text-slate-900'
            : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800'
        }`}
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: -4,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -4,
              scale: 0.98,
            }}
            transition={{
              duration: 0.12,
            }}
            className={`absolute top-[calc(100%+8px)] z-[100] w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl ${
              align === 'right'
                ? 'right-0'
                : 'left-0'
            }`}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
   MENU ITEM
============================================================ */

interface MenuItemProps {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

function MenuItem({
  children,
  onClick,
  danger = false,
  disabled = false,
  icon,
}: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
        disabled
          ? 'cursor-not-allowed opacity-50'
          : danger
            ? 'text-red-700 hover:bg-red-50'
            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
      }`}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
          danger
            ? 'bg-red-50'
            : 'bg-slate-100'
        }`}
      >
        {icon}
      </span>

      <span className="flex-1">{children}</span>
    </button>
  );
}

/* ============================================================
   MENU DIVIDER
============================================================ */

function MenuDivider() {
  return <div className="my-1.5 h-px bg-slate-100" />;
}

/* ============================================================
   HELPER - NEXT MONDAY
============================================================ */

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

/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function AdminCleaningManagement() {
  const { data, isLoading, error, refetch } =
    useAdminCleaning();

  const createWeekMutation = useCreateWeek();
  const updateWeekMutation = useUpdateWeek();
  const deleteWeekMutation = useDeleteWeek();
  const updateDayMutation = useUpdateDay();
  const deleteDayMutation = useDeleteDay();
  const manualAssignMutation = useManualAssign();
  const markAttendanceMutation = useMarkAttendance();
  const removeStudentMutation = useRemoveStudent();

  const [expandedWeeks, setExpandedWeeks] = useState<
    Set<string>
  >(new Set());

  const [activeMenu, setActiveMenu] =
    useState<MenuType>(null);

  const [showCreateWeek, setShowCreateWeek] =
    useState(false);

  const [showAssignModal, setShowAssignModal] =
    useState(false);

  const [showCapacityModal, setShowCapacityModal] =
    useState(false);

  const [deadlineWeekId, setDeadlineWeekId] =
    useState<string | null>(null);

  const [newDeadline, setNewDeadline] = useState('');

  const [
    selectedDayForAssignment,
    setSelectedDayForAssignment,
  ] = useState<CleaningDay | null>(null);

  const [
    selectedDayForCapacity,
    setSelectedDayForCapacity,
  ] = useState<CleaningDay | null>(null);

  const [
    selectedStudentForAssignment,
    setSelectedStudentForAssignment,
  ] = useState('');

  const [newCapacityLimit, setNewCapacityLimit] =
    useState<number>(0);

  const [defaultRegistrationDeadline] = useState(() => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7);
    return deadline.toISOString().slice(0, 16);
  });

  /* ============================================================
     WEEK TOGGLE
  ============================================================ */

  const toggleWeek = (weekId: string) => {
    const newExpanded = new Set(expandedWeeks);

    if (newExpanded.has(weekId)) {
      newExpanded.delete(weekId);
    } else {
      newExpanded.add(weekId);
    }

    setExpandedWeeks(newExpanded);
  };

  /* ============================================================
     DELETE WEEK
  ============================================================ */

  const handleDeleteWeek = async (weekId: string) => {
    setActiveMenu(null);

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
        console.error(
          'Error deleting week:',
          error
        );

        alert(
          'Failed to delete week. Please try again.'
        );
      }
    }
  };

  /* ============================================================
     DELETE DAY
  ============================================================ */

  const handleDeleteDay = async (
    dayId: string,
    dayName: string
  ) => {
    setActiveMenu(null);

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
        console.error(
          'Error deleting day:',
          error
        );

        alert(
          'Failed to delete day. Please try again.'
        );
      }
    }
  };

  /* ============================================================
     MANUAL ASSIGN
  ============================================================ */

  const handleManualAssign = async () => {
    if (
      !selectedDayForAssignment ||
      !selectedStudentForAssignment
    ) {
      return;
    }

    try {
      await manualAssignMutation.mutateAsync({
        studentUserId:
          selectedStudentForAssignment,
        cleaningDayId:
          selectedDayForAssignment.id,
      });

      setShowAssignModal(false);
      setSelectedDayForAssignment(null);
      setSelectedStudentForAssignment('');

      await refetch();

      alert('Student assigned successfully!');
    } catch (error: unknown) {
      console.error(
        'Error assigning student:',
        error
      );

      alert(
        getErrorMessage(error, 'Failed to assign student')
      );
    }
  };

  /* ============================================================
     ATTENDANCE
  ============================================================ */

  const handleMarkAttendance = async (
    userId: string,
    cleaningDayId: string,
    status:
      | 'ATTENDED'
      | 'NO_SHOW'
      | 'PENDING'
  ) => {
    setActiveMenu(null);

    try {
      await markAttendanceMutation.mutateAsync({
        userId,
        cleaningDayId,
        status,
      });

      await refetch();
    } catch (error: unknown) {
      console.error(
        'Error marking attendance:',
        error
      );

      alert(
        getErrorMessage(error, 'Failed to mark attendance')
      );
    }
  };

  /* ============================================================
     REMOVE STUDENT
  ============================================================ */

  const handleRemoveStudent = async (
    studentUserId: string,
    studentName: string
  ) => {
    setActiveMenu(null);

    if (
      confirm(
        `Are you sure you want to remove ${studentName} from this cleaning day?`
      )
    ) {
      try {
        await removeStudentMutation.mutateAsync(
          studentUserId
        );

        await refetch();

        alert(
          `${studentName} removed successfully!`
        );
      } catch (error: unknown) {
        console.error(
          'Error removing student:',
          error
        );

        alert(
          getErrorMessage(error, 'Failed to remove student')
        );
      }
    }
  };

  /* ============================================================
     UPDATE CAPACITY
  ============================================================ */

  const handleUpdateCapacity = async () => {
    if (
      !selectedDayForCapacity ||
      newCapacityLimit < 1
    ) {
      alert(
        'Please enter a valid capacity limit (minimum 1)'
      );

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
    } catch (error: unknown) {
      console.error(
        'Error updating capacity:',
        error
      );

      alert(
        getErrorMessage(error, 'Failed to update capacity limit')
      );
    }
  };

  /* ============================================================
     TOGGLE WEEK
  ============================================================ */

  const handleToggleWeekRegistration = async (
    weekId: string,
    isActive: boolean
  ) => {
    setActiveMenu(null);

    try {
      await updateWeekMutation.mutateAsync({
        weekId,
        data: { isActive },
      });

      await refetch();
    } catch (error: unknown) {
      console.error(
        'Error toggling week:',
        error
      );

      alert(
        getErrorMessage(error, 'Failed to update week')
      );
    }
  };

  /* ============================================================
     EXTEND DEADLINE
  ============================================================ */

  const openDeadlinePicker = (week: CleaningWeek) => {
    setActiveMenu(null);
    setDeadlineWeekId(week.id);
    setNewDeadline(
      new Date(week.registrationDeadline)
        .toISOString()
        .slice(0, 16),
    );
  };

  const handleExtendDeadline = () => {
    if (!deadlineWeekId || !newDeadline) {
      return;
    }

    const weekId = deadlineWeekId;
    const deadlineDate = new Date(newDeadline);

    if (isNaN(deadlineDate.getTime())) {
      alert('Please choose a valid deadline.');
      return;
    }

    updateWeekMutation.mutate(
      {
        weekId,
        data: {
          registrationDeadline: deadlineDate.toISOString(),
        },
      },
      {
        onSuccess: async () => {
          await refetch();
          alert('Registration deadline extended successfully!');
        },
        onError: (error: unknown) => {
          console.error('Error extending deadline:', error);
          alert(getErrorMessage(error, 'Failed to extend deadline'));
        },
      },
    );

    setDeadlineWeekId(null);
    setNewDeadline('');
  };

  /* ============================================================
     TOGGLE DAY STATUS
  ============================================================ */

  const handleToggleDayStatus = async (
    dayId: string,
    currentStatus: string
  ) => {
    setActiveMenu(null);

    const newStatus =
      currentStatus === 'OPEN'
        ? 'CLOSED'
        : 'OPEN';

    try {
      await updateDayMutation.mutateAsync({
        dayId,
        data: {
          status: newStatus,
        },
      });

      await refetch();
    } catch (error: unknown) {
      console.error(
        'Error toggling day:',
        error
      );

      alert(
        getErrorMessage(error, 'Failed to update day')
      );
    }
  };

  /* ============================================================
     OPEN CAPACITY MODAL
  ============================================================ */

  const openCapacityModal = (day: CleaningDay) => {
    setActiveMenu(null);
    setSelectedDayForCapacity(day);
    setNewCapacityLimit(day.capacityLimit);
    setShowCapacityModal(true);
  };

  /* ============================================================
     OPEN ASSIGN MODAL
  ============================================================ */

  const openAssignModal = (day: CleaningDay) => {
    setActiveMenu(null);
    setSelectedDayForAssignment(day);
    setShowAssignModal(true);
  };

  /* ============================================================
     FORMAT DATE
  ============================================================ */

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleDateString(
      'en-US',
      {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
    );
  };

  const formatDeadline = (dateString: string) =>
    new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

  /* ============================================================
     USER INITIALS
  ============================================================ */

  const getUserInitials = (
    firstName: string,
    lastName: string
  ) => {
    return `${firstName?.charAt(0) || ''}${
      lastName?.charAt(0) || ''
    }`.toUpperCase();
  };

  /* ============================================================
     AVATAR COLOR
  ============================================================ */

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

  const weeks = data?.weeks || [];
  const students = data?.students || [];
  const registeredStudentIds = new Set(
    weeks.flatMap((week) =>
      week.days.flatMap((day) =>
        day.registrations.map((registration) => registration.userId),
      ),
    ),
  );
  const availableStudents = students.filter(
    (student) => !registeredStudentIds.has(student.id),
  );

  const stats = data?.stats || {
    totalRegistrations: 0,
    totalAttended: 0,
    totalNoShow: 0,
    totalPending: 0,
  };

  /* ============================================================
     LOADING
  ============================================================ */

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-slate-200" />

            <div className="space-y-2">
              <div className="h-6 w-48 rounded bg-slate-200" />
              <div className="h-4 w-72 rounded bg-slate-200" />
            </div>
          </div>

          <div className="h-10 w-40 rounded-lg bg-slate-200" />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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

  /* ============================================================
     ERROR
  ============================================================ */

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
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  /* ============================================================
     PAGE
  ============================================================ */

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 pb-8"
    >
      {/* ========================================================
          PAGE HEADER
      ======================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50">
              <Sparkles className="h-5 w-5 text-[#1a365d]" />
            </div>

            <div className="min-w-0">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Cleaning Management
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage cleaning schedules,
                registrations and attendance.
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

      {/* ========================================================
          STATS
      ======================================================== */}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Registered
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {stats.totalRegistrations}
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
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
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Attended
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {stats.totalAttended}
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
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
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Pending
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {stats.totalPending}
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50">
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
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                No Show
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {stats.totalNoShow}
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* ========================================================
          WEEKS
      ======================================================== */}

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
            Create a new cleaning week from Monday
            to Friday to get started.
          </p>

          <button
            onClick={() => setShowCreateWeek(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#1a365d] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#153475]"
          >
            <Plus className="h-4 w-4" />
            Create First Week
          </button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {weeks.map((week: CleaningWeek) => {
            const isExpanded =
              expandedWeeks.has(week.id);

            return (
              <motion.div
                key={week.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                {/* ==================================================
                    WEEK HEADER
                ================================================== */}

                <div className="relative z-20 p-4">
                  <div className="flex items-center gap-3">
                    {/* Expand toggle */}
                    <button
                      onClick={() =>
                        toggleWeek(week.id)
                      }
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

                    {/* Week info - takes remaining space */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-bold text-slate-900">
                          {week.weekLabel ||
                            `Week of ${formatDate(
                              week.startDate
                            )}`}
                        </h3>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            week.isActive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {week.isActive
                            ? 'OPEN'
                            : 'LOCKED'}
                        </span>
                      </div>

                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {formatDate(
                          week.startDate
                        )}{' '}
                        –{' '}
                        {formatDate(
                          week.endDate
                        )}
                      </p>

                      <p className="mt-1 text-xs font-medium text-slate-500">
                        Deadline: {formatDeadline(week.registrationDeadline)}
                      </p>
                    </div>

                    {/* Desktop-only registration text */}
                    <div className="hidden text-right lg:block">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Registration
                      </p>

                      <p
                        className={`mt-0.5 text-xs font-semibold ${
                          week.isActive
                            ? 'text-emerald-700'
                            : 'text-slate-500'
                        }`}
                      >
                        {week.isActive
                          ? 'Open for registration'
                          : 'Registration locked'}
                      </p>
                    </div>

                    {/* Three-dot action menu - pinned right */}
                    <ActionMenu
                      menuId={`week-${week.id}`}
                      activeMenu={activeMenu}
                      setActiveMenu={setActiveMenu}
                    >
                      <div className="px-3 py-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Week actions
                        </p>
                      </div>

                      <MenuItem
                        onClick={() =>
                          handleToggleWeekRegistration(
                            week.id,
                            !week.isActive
                          )
                        }
                        icon={
                          week.isActive ? (
                            <Lock className="h-4 w-4 text-slate-600" />
                          ) : (
                            <Unlock className="h-4 w-4 text-emerald-600" />
                          )
                        }
                      >
                        {week.isActive ? 'Lock week' : 'Open week'}
                      </MenuItem>

                      <MenuItem
                        onClick={() => openDeadlinePicker(week)}
                        icon={<Clock className="h-4 w-4 text-blue-600" />}
                      >
                        Extend deadline
                      </MenuItem>

                      <MenuDivider />

                      <MenuItem
                        danger
                        onClick={() => handleDeleteWeek(week.id)}
                        icon={<Trash2 className="h-4 w-4 text-red-600" />}
                      >
                        Delete week
                      </MenuItem>
                    </ActionMenu>
                  </div>
                </div>

                {/* ==================================================
                    DAYS
                ================================================== */}

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{
                        height: 0,
                        opacity: 0,
                      }}
                      animate={{
                        height: 'auto',
                        opacity: 1,
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                      }}
                      transition={{
                        duration: 0.25,
                      }}
                      className="relative z-10 border-t border-slate-200 bg-slate-50"
                    >
                      <div className="space-y-4 p-4 sm:p-5">
                        {week.days.map(
                          (day: CleaningDay) => (
                            <div
                              key={day.id}
                              className="relative rounded-xl border border-slate-200 bg-white shadow-sm"
                            >
                              {/* DAY HEADER */}

                              <div className="relative z-20 border-b border-slate-100 p-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h4 className="font-bold text-slate-900">
                                        {
                                          day.dayOfWeek
                                        }
                                      </h4>

                                      <span
                                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                          day.status ===
                                          'OPEN'
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : day.status ===
                                                'FULL'
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

                                  {/* DAY ACTION AREA */}

                                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                                    <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                                      <Users className="h-3.5 w-3.5" />

                                      <span>
                                        {
                                          day.currentRegistrations
                                        }{' '}
                                        /{' '}
                                        {
                                          day.capacityLimit
                                        }
                                      </span>
                                    </div>

                                    <ActionMenu
                                      menuId={`day-${day.id}`}
                                      activeMenu={
                                        activeMenu
                                      }
                                      setActiveMenu={
                                        setActiveMenu
                                      }
                                    >
                                      <div className="px-3 py-2">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                          Day actions
                                        </p>
                                      </div>

                                      <MenuItem
                                        onClick={() =>
                                          handleToggleDayStatus(
                                            day.id,
                                            day.status
                                          )
                                        }
                                        icon={
                                          day.status ===
                                            'OPEN' ||
                                          day.status ===
                                            'FULL' ? (
                                            <Lock className="h-4 w-4 text-red-600" />
                                          ) : (
                                            <Unlock className="h-4 w-4 text-emerald-600" />
                                          )
                                        }
                                      >
                                        {day.status ===
                                          'OPEN' ||
                                        day.status ===
                                          'FULL'
                                          ? 'Close day'
                                          : 'Open day'}
                                      </MenuItem>

                                      <MenuItem
                                        onClick={() =>
                                          openCapacityModal(
                                            day
                                          )
                                        }
                                        icon={
                                          <Edit className="h-4 w-4 text-blue-600" />
                                        }
                                      >
                                        Edit capacity
                                      </MenuItem>

                                      <MenuItem
                                        onClick={() =>
                                          openAssignModal(
                                            day
                                          )
                                        }
                                        icon={
                                          <UserPlus className="h-4 w-4 text-[#1a365d]" />
                                        }
                                      >
                                        Assign student
                                      </MenuItem>

                                      <MenuDivider />

                                      <MenuItem
                                        danger
                                        onClick={() =>
                                          handleDeleteDay(
                                            day.id,
                                            day.dayOfWeek
                                          )
                                        }
                                        icon={
                                          <Trash2 className="h-4 w-4 text-red-600" />
                                        }
                                      >
                                        Delete day
                                      </MenuItem>
                                    </ActionMenu>
                                  </div>
                                </div>
                              </div>

                              {/* ==================================================
                                  REGISTERED STUDENTS
                              ================================================== */}

                              <div className="p-4">
                                {day.registrations &&
                                day.registrations
                                  .length > 0 ? (
                                  <div className="space-y-2">
                                    <div className="mb-3 flex items-center justify-between">
                                      <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                          Registered
                                          Students
                                        </p>

                                        <p className="mt-0.5 text-xs text-slate-400">
                                          {
                                            day.currentRegistrations
                                          }{' '}
                                          student
                                          {day.currentRegistrations !==
                                          1
                                            ? 's'
                                            : ''}{' '}
                                          registered
                                        </p>
                                      </div>
                                    </div>

                                    {day.registrations.map(
                                      (
                                        reg: CleaningRegistration
                                      ) => {
                                        const attendance =
                                          day.attendanceRecords?.find(
                                            (
                                              a: AttendanceRecord
                                            ) =>
                                              a.userId ===
                                              reg.userId
                                          );

                                        const initials =
                                          getUserInitials(
                                            reg
                                              .user
                                              .firstName,
                                            reg
                                              .user
                                              .lastName
                                          );

                                        return (
                                          <div
                                            key={
                                              reg.id
                                            }
                                            className="relative flex min-w-0 items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 transition hover:border-slate-200 hover:bg-slate-100/70"
                                          >
                                            {/* STUDENT */}

                                            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-white">
                                              {reg.user
                                                .profileImageUrl ? (
                                                <Image
                                                  src={
                                                    reg
                                                      .user
                                                      .profileImageUrl
                                                  }
                                                  alt={`${reg.user.firstName} ${reg.user.lastName}`}
                                                  width={36}
                                                  height={36}
                                                  unoptimized
                                                  className="h-full w-full object-cover"
                                                />
                                              ) : (
                                                <div
                                                  className={`flex h-full w-full items-center justify-center ${getAvatarColor(
                                                    reg
                                                      .user
                                                      .firstName,
                                                    reg
                                                      .user
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

                                            <div className="min-w-0 flex-1">
                                              <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                                                <p className="text-sm font-semibold text-slate-900">
                                                  {
                                                    reg
                                                      .user
                                                      .firstName
                                                  }{' '}
                                                  {
                                                    reg
                                                      .user
                                                      .lastName
                                                  }
                                                </p>

                                                {attendance && (
                                                  <span
                                                    className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
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

                                              <p className="mt-0.5 text-xs text-slate-400">
                                                Cleaning
                                                participant
                                              </p>
                                            </div>

                                            {/* STUDENT ACTION MENU */}

                                            <ActionMenu
                                              menuId={`student-${reg.id}`}
                                              activeMenu={
                                                activeMenu
                                              }
                                              setActiveMenu={
                                                setActiveMenu
                                              }
                                            >
                                              <div className="px-3 py-2">
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                  Student
                                                  actions
                                                </p>

                                                <p className="mt-0.5 truncate text-xs font-medium text-slate-600">
                                                  {
                                                    reg
                                                      .user
                                                      .firstName
                                                  }{' '}
                                                  {
                                                    reg
                                                      .user
                                                      .lastName
                                                  }
                                                </p>
                                              </div>

                                              <MenuItem
                                                onClick={() =>
                                                  handleMarkAttendance(
                                                    reg.userId,
                                                    day.id,
                                                    'ATTENDED'
                                                  )
                                                }
                                                icon={
                                                  <UserCheck className="h-4 w-4 text-emerald-600" />
                                                }
                                              >
                                                Mark attended
                                              </MenuItem>

                                              <MenuItem
                                                onClick={() =>
                                                  handleMarkAttendance(
                                                    reg.userId,
                                                    day.id,
                                                    'NO_SHOW'
                                                  )
                                                }
                                                icon={
                                                  <UserX className="h-4 w-4 text-red-600" />
                                                }
                                              >
                                                Mark no show
                                              </MenuItem>

                                              <MenuItem
                                                onClick={() =>
                                                  handleMarkAttendance(
                                                    reg.userId,
                                                    day.id,
                                                    'PENDING'
                                                  )
                                                }
                                                icon={
                                                  <Hourglass className="h-4 w-4 text-amber-600" />
                                                }
                                              >
                                                Mark pending
                                              </MenuItem>

                                              <MenuDivider />

                                              <MenuItem
                                                danger
                                                onClick={() =>
                                                  handleRemoveStudent(
                                                    reg.userId,
                                                    `${reg.user.firstName} ${reg.user.lastName}`
                                                  )
                                                }
                                                icon={
                                                  <Trash2 className="h-4 w-4 text-red-600" />
                                                }
                                              >
                                                Remove student
                                              </MenuItem>
                                            </ActionMenu>
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>
                                ) : (
                                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                                    <Users className="mx-auto h-8 w-8 text-slate-300" />

                                    <p className="mt-2 text-sm font-medium text-slate-600">
                                      No students
                                      registered
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                      Students assigned
                                      to this cleaning
                                      day will appear
                                      here.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ========================================================
          CREATE WEEK MODAL
      ======================================================== */}

      <AnimatePresence>
        {showCreateWeek && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onClick={() =>
              setShowCreateWeek(false)
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
              className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <div className="mb-5">
                <h3 className="text-xl font-bold text-slate-900">
                  Create New Week
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  This will create five cleaning
                  days from Monday to Friday.
                </p>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();

                  const form =
                    e.currentTarget;

                  const formData =
                    new FormData(form);

                  const startDate =
                    formData.get(
                      'startDate'
                    ) as string;

                  const weekLabel =
                    formData.get(
                      'weekLabel'
                    ) as string;

                  const capacityLimit =
                    parseInt(
                      formData.get(
                        'capacityLimit'
                      ) as string
                    ) || 5;

                  const registrationDeadline =
                    formData.get(
                      'registrationDeadline'
                    ) as string;

                  if (!startDate) {
                    alert(
                      'Please select a start date'
                    );
                    return;
                  }

                  if (
                    !registrationDeadline
                  ) {
                    alert(
                      'Please select a registration deadline'
                    );
                    return;
                  }

                  const selectedDate =
                    new Date(startDate);

                  if (
                    selectedDate.getDay() !==
                    1
                  ) {
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
                    weekLabel:
                      weekLabel || undefined,
                    capacityLimit,
                    registrationDeadline,
                  };

                  try {
                    await createWeekMutation.mutateAsync(
                      payload
                    );

                    setShowCreateWeek(
                      false
                    );

                    await refetch();

                    alert(
                      'Week created successfully with 5 days (Monday to Friday)!'
                    );
                  } catch (error: unknown) {
                    console.error(
                      'Error creating week:',
                      error
                    );

                    alert(
                      getErrorMessage(
                        error,
                        'Failed to create week. Please try again.'
                      )
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
                    Maximum students allowed
                    per day.
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
                    defaultValue={defaultRegistrationDeadline}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#3182ce] focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setShowCreateWeek(
                        false
                      )
                    }
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      createWeekMutation.isPending
                    }
                    className="flex-1 rounded-lg bg-[#1a365d] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#153475] disabled:cursor-not-allowed disabled:opacity-50"
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
          {deadlineWeekId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
              onClick={() => setDeadlineWeekId(null)}
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0, y: 10 }}
                className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-slate-900">
                  Update registration deadline
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Choose the new date and time when registration should close.
                </p>

                <label className="mt-5 block text-sm font-medium text-slate-700">
                  Registration deadline
                  <input
                    type="datetime-local"
                    value={newDeadline}
                    onChange={(event) => setNewDeadline(event.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#3182ce] focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setDeadlineWeekId(null)}
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExtendDeadline}
                    disabled={!newDeadline || updateWeekMutation.isPending}
                    className="flex-1 rounded-lg bg-[#1a365d] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#153475] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {updateWeekMutation.isPending ? 'Saving...' : 'Save deadline'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
      </AnimatePresence>

      {/* ========================================================
          ASSIGN STUDENT MODAL
      ======================================================== */}

      <AnimatePresence>
        {showAssignModal &&
          selectedDayForAssignment && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
              onClick={() =>
                setShowAssignModal(false)
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
                onClick={(e) =>
                  e.stopPropagation()
                }
              >
                <h3 className="text-xl font-bold text-slate-900">
                  Assign Student
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Assign a student to{' '}
                  <strong>
                    {
                      selectedDayForAssignment.dayOfWeek
                    }
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

                      {availableStudents.length === 0 ? (
                        <option value="" disabled>
                          No unregistered students available
                        </option>
                      ) : (
                        availableStudents.map(
                          (student) => (
                          <option
                            key={student.id}
                            value={
                              student.id
                            }
                          >
                            {
                              student.firstName
                            }{' '}
                            {
                              student.lastName
                            }
                          </option>
                          )
                        )
                      )}
                    </select>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        setShowAssignModal(
                          false
                        )
                      }
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={
                        handleManualAssign
                      }
                      disabled={
                        !selectedStudentForAssignment ||
                        manualAssignMutation.isPending
                      }
                      className="flex-1 rounded-lg bg-[#1a365d] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#153475] disabled:opacity-50"
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

      {/* ========================================================
          CAPACITY MODAL
      ======================================================== */}

      <AnimatePresence>
        {showCapacityModal &&
          selectedDayForCapacity && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
              onClick={() =>
                setShowCapacityModal(
                  false
                )
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
                onClick={(e) =>
                  e.stopPropagation()
                }
              >
                <h3 className="text-xl font-bold text-slate-900">
                  Update Capacity
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Update the capacity for{' '}
                  <strong>
                    {
                      selectedDayForCapacity.dayOfWeek
                    }
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
                      value={
                        newCapacityLimit
                      }
                      onChange={(e) =>
                        setNewCapacityLimit(
                          parseInt(
                            e.target.value
                          ) || 0
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
                        Capacity cannot be lower
                        than current
                        registrations.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        setShowCapacityModal(
                          false
                        )
                      }
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={
                        handleUpdateCapacity
                      }
                      disabled={
                        newCapacityLimit <
                          1 ||
                        newCapacityLimit <
                          selectedDayForCapacity.currentRegistrations ||
                        updateDayMutation.isPending
                      }
                      className="flex-1 rounded-lg bg-[#1a365d] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#153475] disabled:cursor-not-allowed disabled:opacity-50"
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