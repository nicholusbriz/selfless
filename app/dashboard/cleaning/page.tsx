// app/dashboard/cleaning/page.tsx
// Public cleaning schedule page for students
// Professional light institutional design with responsive animated experience

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  User,
  AlertCircle,
  Loader2,
  ArrowRight,
  CalendarCheck,
  Circle,
  Check,
  Lock,
  Unlock,
  Info,
  PartyPopper,
  ThumbsUp,
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
  type CleaningDay,
} from '@/hooks/useCleaningStudent';

// ---------------------------------------------------------
// Helper functions
// ---------------------------------------------------------

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

const getAvatarColor = (firstName: string, lastName: string) => {
  const colors = [
    'from-[#1a365d] to-[#2c5282]',
    'from-[#2c5282] to-[#3182ce]',
    'from-[#315b88] to-[#1a365d]',
  ];

  const hash = firstName.charCodeAt(0) + lastName.charCodeAt(0);

  return colors[Math.abs(hash) % colors.length];
};

// ---------------------------------------------------------
// Animated Billboard
// ---------------------------------------------------------

const billboardMessages = [
  {
    title: 'Choose a day you can commit to',
    description:
      'Select a cleaning day that fits your schedule and allows you to participate fully.',
  },
  {
    title: 'Together, we keep our environment better',
    description:
      'Every contribution matters. A clean environment creates a better place to learn, work, and connect.',
  },
  {
    title: 'Check availability before registering',
    description:
      'Review available spaces and see who has already registered for each cleaning day.',
  },
  {
    title: 'Plans changed? You can switch',
    description:
      'When registration is still open, you can change your registration to another available day.',
  },
  {
    title: 'Your participation matters',
    description:
      'One cleaning session may seem small, but consistent participation makes a meaningful difference.',
  },
  {
    title: 'Register today. Show up tomorrow.',
    description:
      'Please honor the commitment you make by attending your selected cleaning day.',
  },
];

const animatedWords = [
  'Together.',
  'Committed.',
  'Responsible.',
  'Ready.',
  'Community.',
  'Progress.',
  'Teamwork.',
  'Respect.',
  'Service.',
  'Impact.',
];

function AnimatedBillboard() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const messageTimer = setInterval(() => {
      setMessageIndex(
        (current) => (current + 1) % billboardMessages.length
      );
    }, 6000);

    return () => clearInterval(messageTimer);
  }, []);

  useEffect(() => {
    const wordTimer = setInterval(() => {
      setWordIndex(
        (current) => (current + 1) % animatedWords.length
      );
    }, 2500);

    return () => clearInterval(wordTimer);
  }, []);

  const currentMessage = billboardMessages[messageIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative mb-8 overflow-hidden rounded-2xl border border-[#dbe4ee] bg-white shadow-[0_10px_35px_rgba(26,54,93,0.07)]"
    >
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.08, 0.14, 0.08],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#3182ce]"
      />

      <motion.div
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-[#1a365d]"
      />

      <motion.div
        animate={{
          opacity: [0.03, 0.06, 0.03],
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="pointer-events-none absolute right-4 top-1/2 h-32 w-32 -translate-y-1/2"
      >
        <img
          src="/freedom.png"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-contain"
        />
      </motion.div>

      <div className="relative p-5 sm:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex items-center gap-2">
              <motion.div
                animate={{
                  rotate: [0, -4, 4, -4, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#1a365d]/10"
              >
                <img
                  src="/freedom.png"
                  alt=""
                  aria-hidden="true"
                  className="h-full w-full object-contain p-1.5"
                />
              </motion.div>

              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#3182ce]">
                Community Service
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={messageIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{
                  duration: 0.5,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              >
                <h2 className="text-xl font-bold leading-tight text-[#1a365d] sm:text-2xl">
                  {currentMessage.title}
                </h2>

                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#64748b]">
                  {currentMessage.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex shrink-0 items-center justify-center md:min-w-[190px]">
            <div className="relative flex h-24 w-full items-center justify-center overflow-hidden rounded-xl border border-[#dbe4ee] bg-[#f8fafc] px-5 sm:h-28 sm:w-[190px]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={wordIndex}
                  initial={{
                    opacity: 0,
                    y: 16,
                    scale: 0.9,
                    filter: 'blur(2px)',
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    filter: 'blur(0px)',
                  }}
                  exit={{
                    opacity: 0,
                    y: -16,
                    scale: 1.05,
                    filter: 'blur(2px)',
                  }}
                  transition={{
                    duration: 0.4,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                  className="text-center text-xl font-bold tracking-tight text-[#1a365d] sm:text-2xl"
                >
                  {animatedWords[wordIndex]}
                </motion.span>
              </AnimatePresence>

              <motion.div
                animate={{
                  scaleX: [0.6, 1, 0.6],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute bottom-3 h-0.5 w-16 rounded-full bg-[#3182ce]"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-2 border-t border-[#e2e8f0] pt-4 sm:grid-cols-3">
          {[
            'Choose a suitable day',
            'See who is participating',
            'Honor your commitment',
          ].map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.15 + index * 0.1,
                duration: 0.4,
              }}
              className="flex items-center gap-2 text-xs font-medium text-[#64748b]"
            >
              <motion.span
                animate={{
                  scale: [1, 1.15, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.35,
                }}
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#3182ce]"
              />
              {item}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------
// Cleaning Video
// ---------------------------------------------------------

function CleaningVideo() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
      }}
      className="mt-8 overflow-hidden rounded-2xl border border-[#dbe4ee] bg-white shadow-[0_10px_35px_rgba(26,54,93,0.07)]"
    >
      <div className="border-b border-[#e2e8f0] px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#3182ce]">
              Community in Action
            </p>

            <h2 className="text-base font-bold text-[#1a365d] sm:text-lg">
              Together, We Make a Difference
            </h2>

            <p className="mt-1 max-w-2xl text-xs leading-5 text-[#64748b] sm:text-sm">
              Take a moment to see the spirit of teamwork and service behind our community cleaning activities.
            </p>
          </div>

          <span className="w-fit shrink-0 rounded-full border border-[#3182ce]/20 bg-[#3182ce]/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#3182ce] sm:text-xs">
            Watch &amp; Get Inspired
          </span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden bg-[#0f172a]">
        <video
          className="block aspect-video h-auto w-full object-cover"
          controls
          playsInline
          preload="metadata"
          aria-label="Community cleaning activities video"
        >
          <source src="/cleaning.mp4" type="video/mp4" />

          Your browser does not support the video element.
        </video>
      </div>

      <div className="flex flex-col gap-3 border-t border-[#e2e8f0] bg-[#f8fafc] px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#3182ce]/10">
            <Users className="h-4 w-4 text-[#1a365d]" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#1e293b]">
              Every contribution counts
            </p>

            <p className="mt-1 text-xs leading-5 text-[#64748b] sm:text-sm">
              Your time, effort, and commitment help create a cleaner, more welcoming environment for everyone.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-[#e2e8f0] pt-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#94a3b8]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#3182ce]" />
          Serve • Participate • Make an impact
        </div>
      </div>
    </motion.section>
  );
}

// ---------------------------------------------------------
// Main Page
// ---------------------------------------------------------

export default function CleaningPage() {
  const router = useRouter();

  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(
    new Set()
  );

  const [actionMessage, setActionMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [changingDayId, setChangingDayId] = useState<string | null>(
    null
  );

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

  // -------------------------------------------------------
  // Register
  // -------------------------------------------------------

  const handleRegister = async (dayId: string) => {
    if (
      !confirm(
        'Are you sure you want to register for this cleaning day?'
      )
    ) {
      return;
    }

    try {
      const result = await registerMutation.mutateAsync(dayId);

      setActionMessage({
        type: 'success',
        message:
          result.message ||
          "You're registered! Thank you for committing to community service.",
      });

      await refetch();
      await refetchStatus();

      setTimeout(() => setActionMessage(null), 5000);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to register';

      console.error('Registration error:', errorMessage);

      if (
        errorMessage
          .toLowerCase()
          .includes('already registered')
      ) {
        const dayMatch = errorMessage.match(
          /registered for (.+?)\./i
        );

        const existingDay = dayMatch
          ? dayMatch[1]
          : 'a day';

        setActionMessage({
          type: 'error',
          message: `You're already registered for ${existingDay}. Choose "Change to this" on another available day if you need to switch.`,
        });
      } else if (
        errorMessage.toLowerCase().includes('full')
      ) {
        setActionMessage({
          type: 'error',
          message:
            'This cleaning day has reached its capacity. Please choose another available day.',
        });
      } else if (
        errorMessage.toLowerCase().includes('closed')
      ) {
        setActionMessage({
          type: 'error',
          message:
            'Registration for this day is closed. Please select another open day.',
        });
      } else {
        setActionMessage({
          type: 'error',
          message:
            errorMessage ||
            'Something went wrong. Please try again.',
        });
      }

      setTimeout(() => setActionMessage(null), 8000);
    }
  };

  // -------------------------------------------------------
  // Change registration
  // -------------------------------------------------------

  const handleChangeRegistration = async (
    newDayId: string
  ) => {
    if (!data?.registration) return;

    const oldDay = data.weeks
      .flatMap((week) => week.days)
      .find(
        (day) =>
          day.id === data.registration?.cleaningDayId
      );

    const newDay = data.weeks
      .flatMap((week) => week.days)
      .find((day) => day.id === newDayId);

    const oldWeek = data.weeks.find((week) =>
      week.days.some(
        (day) =>
          day.id === data.registration?.cleaningDayId
      )
    );

    const newWeek = data.weeks.find((week) =>
      week.days.some((day) => day.id === newDayId)
    );

    if (
      !confirm(
        `Change your registration from ${oldDay?.dayOfWeek} (${oldWeek?.weekLabel || 'Week'}) to ${newDay?.dayOfWeek} (${newWeek?.weekLabel || 'Week'})?`
      )
    ) {
      return;
    }

    setChangingDayId(newDayId);

    try {
      const result =
        await changeRegistrationMutation.mutateAsync({
          newDayId,
        });

      const message =
        result.message ||
        `You're now registered for ${newDay?.dayOfWeek}.`;

      setActionMessage({
        type: 'success',
        message,
      });

      setChangingDayId(null);

      await refetch();
      await refetchStatus();

      setTimeout(() => setActionMessage(null), 5000);
    } catch (error: unknown) {
      setActionMessage({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to change cleaning day',
      });

      setChangingDayId(null);

      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  // -------------------------------------------------------
  // Toggle week
  // -------------------------------------------------------

  const toggleWeek = (weekId: string) => {
    const newExpanded = new Set(expandedWeeks);

    if (newExpanded.has(weekId)) {
      newExpanded.delete(weekId);
    } else {
      newExpanded.add(weekId);
    }

    setExpandedWeeks(newExpanded);
  };

  // -------------------------------------------------------
  // Registration rules
  // -------------------------------------------------------

  const canChangeRegistration = (
    day: CleaningDay,
    week: {
      registrationDeadline: string;
    }
  ) => {
    if (!data?.registration) return false;

    const isPast = isDayPast(day.cleaningDate);
    const isClosed = day.status === 'CLOSED';
    const isFull = day.status === 'FULL';

    const deadlinePassed =
      new Date() > new Date(week.registrationDeadline);

    return (
      !isPast &&
      !isClosed &&
      !isFull &&
      !deadlinePassed &&
      day.id !== data.registration.cleaningDayId
    );
  };

  const canRegister = (
    day: CleaningDay,
    week: {
      registrationDeadline: string;
      isActive: boolean;
    }
  ) => {
    if (data?.registration) return false;

    const isPast = isDayPast(day.cleaningDate);
    const isClosed = day.status === 'CLOSED';
    const isFull = day.status === 'FULL';

    const deadlinePassed =
      new Date() > new Date(week.registrationDeadline);

    return (
      !isPast &&
      !isClosed &&
      !isFull &&
      !deadlinePassed &&
      week.isActive
    );
  };

  const isUserRegisteredForDay = (dayId: string) => {
    return (
      data?.registration?.cleaningDayId === dayId
    );
  };

  const getUserAttendanceStatus = (dayId: string) => {
    const record = data?.userAttendance?.find(
      (attendance) =>
        attendance.cleaningDay.id === dayId
    );

    return record?.status;
  };

  // -------------------------------------------------------
  // Attendance
  // -------------------------------------------------------

  const handleMarkAttendance = async (
    userId: string,
    dayId: string,
    status: 'ATTENDED' | 'NO_SHOW' | 'PENDING'
  ) => {
    try {
      await markAttendanceMutation.mutateAsync({
        userId,
        cleaningDayId: dayId,
        status,
      });

      setActionMessage({
        type: 'success',
        message: `Attendance updated — marked as ${status
          .toLowerCase()
          .replace('_', ' ')}`,
      });

      setTimeout(() => setActionMessage(null), 3000);
    } catch (error: unknown) {
      setActionMessage({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to mark attendance',
      });

      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  // -------------------------------------------------------
  // Loading
  // -------------------------------------------------------

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="h-10 w-48 animate-pulse rounded-lg bg-[#e2e8f0]" />
            <div className="h-10 w-32 animate-pulse rounded-lg bg-[#e2e8f0]" />
          </div>

          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="h-6 w-40 animate-pulse rounded bg-[#e2e8f0]" />
                <div className="h-6 w-24 animate-pulse rounded bg-[#e2e8f0]" />
              </div>

              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div
                    key={j}
                    className="h-16 animate-pulse rounded-lg bg-[#f1f5f9]"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------
  // Error
  // -------------------------------------------------------

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4">
        <div className="w-full max-w-md rounded-2xl border border-[#e2e8f0] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>

          <h3 className="mb-2 text-xl font-semibold text-[#1e293b]">
            Unable to Load the Schedule
          </h3>

          <p className="text-sm leading-6 text-[#64748b]">
            {(error as Error)?.message ||
              'An unexpected error occurred while loading the cleaning schedule.'}
          </p>

          <button
            onClick={() => refetch()}
            className="mt-5 rounded-lg bg-[#1a365d] px-6 py-2.5 font-medium text-white transition-all duration-200 hover:bg-[#153475]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const weeks = data?.weeks || [];

  // -------------------------------------------------------
  // Page
  // -------------------------------------------------------

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8fafc]">
      {/* -------------------------------------------------- */}
      {/* Header */}
      {/* -------------------------------------------------- */}

      <div className="mb-6 flex flex-wrap items-center gap-2 sm:mb-8 sm:gap-3">
        <button
          onClick={() => router.back()}
          className="rounded-lg border border-[#dbe4ee] bg-white px-3 py-2 text-sm font-medium text-[#475569] shadow-sm transition-all duration-200 hover:border-[#1a365d]/30 hover:bg-[#f8fafc] hover:text-[#1a365d]"
        >
          Back
        </button>

        <Link
          href="/dashboard/courses"
          className="rounded-lg border border-[#dbe4ee] bg-white px-3 py-2 text-sm font-medium text-[#475569] shadow-sm transition-all duration-200 hover:border-[#1a365d]/30 hover:bg-[#f8fafc] hover:text-[#1a365d]"
        >
          Courses
        </Link>

        <Link
          href="/dashboard/students"
          className="rounded-lg border border-[#dbe4ee] bg-white px-3 py-2 text-sm font-medium text-[#475569] shadow-sm transition-all duration-200 hover:border-[#1a365d]/30 hover:bg-[#f8fafc] hover:text-[#1a365d]"
        >
          Students
        </Link>

        <div className="hidden h-8 w-px bg-[#dbe4ee] sm:block" />

        {/* Single logo only */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -2, 0],
          }}
          transition={{
            opacity: { duration: 0.5 },
            scale: { duration: 0.5 },
            y: {
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
          className="ml-auto flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#dbe4ee] bg-white shadow-sm"
        >
          <img
            src="/freedom.png"
            alt="Freedom"
            className="h-full w-full object-contain p-1.5"
          />
        </motion.div>
      </div>

      {/* -------------------------------------------------- */}
      {/* Animated Billboard */}
      {/* -------------------------------------------------- */}

      <AnimatedBillboard />

      {/* -------------------------------------------------- */}
      {/* Action Message */}
      {/* -------------------------------------------------- */}

      <AnimatePresence>
        {actionMessage && (
          <motion.div
            initial={{
              opacity: 0,
              y: -20,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -20,
              scale: 0.95,
            }}
            transition={{
              duration: 0.4,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className={`mb-6 rounded-2xl border-2 p-5 shadow-lg ${
              actionMessage.type === 'success'
                ? 'border-emerald-300 bg-gradient-to-br from-emerald-50 to-emerald-100/50'
                : 'border-red-300 bg-gradient-to-br from-red-50 to-red-100/50'
            }`}
          >
            <div className="flex items-start gap-4">
              <motion.div
                initial={{
                  scale: 0,
                  rotate: -180,
                }}
                animate={{
                  scale: 1,
                  rotate: 0,
                }}
                transition={{
                  delay: 0.1,
                  duration: 0.5,
                  type: 'spring',
                  stiffness: 200,
                }}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  actionMessage.type === 'success'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-red-500 text-white'
                }`}
              >
                {actionMessage.type === 'success' ? (
                  <PartyPopper className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
              </motion.div>

              <div className="flex-1">
                <motion.p
                  initial={{
                    opacity: 0,
                    x: -10,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay: 0.2,
                    duration: 0.3,
                  }}
                  className={`text-sm font-semibold leading-6 ${
                    actionMessage.type === 'success'
                      ? 'text-emerald-800'
                      : 'text-red-800'
                  }`}
                >
                  {actionMessage.message}
                </motion.p>

                {actionMessage.type === 'success' && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 5,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: 0.3,
                      duration: 0.3,
                    }}
                    className="mt-2 flex items-center gap-2 text-xs font-medium text-emerald-600"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    <span>Thank you for your commitment.</span>
                  </motion.div>
                )}
              </div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                onClick={() => setActionMessage(null)}
                className="shrink-0 rounded-lg p-1 text-[#94a3b8] transition-colors hover:bg-black/5 hover:text-[#64748b]"
                aria-label="Dismiss message"
              >
                <XCircle className="h-4 w-4" />
              </motion.button>
            </div>

            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{
                duration:
                  actionMessage.type === 'success'
                    ? 5
                    : 8,
                ease: 'linear',
              }}
              className={`mt-3 h-1 rounded-full ${
                actionMessage.type === 'success'
                  ? 'bg-emerald-400'
                  : 'bg-red-400'
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* -------------------------------------------------- */}
      {/* My Status */}
      {/* -------------------------------------------------- */}

      {statusData && (
        <motion.div
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{ duration: 0.5 }}
          className="mb-8 rounded-2xl border border-[#dbe4ee] bg-white p-5 shadow-[0_8px_30px_rgba(26,54,93,0.05)] sm:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <motion.div
                animate={{
                  scale: [1, 1.08, 1],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                }}
                className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3182ce]/10"
              >
                <User className="h-5 w-5 text-[#1a365d]" />
              </motion.div>

              <div className="min-w-0">
                <h3 className="text-base font-semibold text-[#1e293b] sm:text-lg">
                  My Cleaning Status
                </h3>

                {statusData.hasRegistration ? (
                  <p className="mt-1 text-sm leading-6 text-[#64748b]">
                    You are registered for{' '}
                    <span className="font-semibold text-[#1a365d]">
                      {statusData.registration?.dayOfWeek}
                    </span>{' '}
                    —{' '}
                    {formatDate(
                      statusData.registration
                        ?.cleaningDate || ''
                    )}

                    <span className="mt-1 block text-xs text-[#3182ce]">
                      You can change to another available day while registration remains open.
                    </span>
                  </p>
                ) : (
                  <p className="mt-1 text-sm leading-6 text-[#64748b]">
                    You have not registered for a cleaning day yet.
                    Select an available day below to participate.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {statusData.hasRegistration && (
                <div
                  className={`rounded-full px-3 py-1 text-xs font-medium ${getAttendanceStatusColor(
                    statusData.registration?.status ||
                      'PENDING'
                  )}`}
                >
                  {statusData.registration?.status ||
                    'PENDING'}
                </div>
              )}

              {!statusData.hasRegistration &&
                data?.isAdmin && (
                  <span className="text-xs text-[#64748b]">
                    Admin — No registration required
                  </span>
                )}
            </div>
          </div>
        </motion.div>
      )}

      {/* -------------------------------------------------- */}
      {/* Weeks */}
      {/* -------------------------------------------------- */}

      {weeks.length === 0 ? (
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="rounded-2xl border border-[#dbe4ee] bg-white p-8 text-center shadow-sm sm:p-12"
        >
          <Calendar className="mx-auto mb-4 h-16 w-16 text-[#94a3b8]" />

          <h3 className="mb-2 text-xl font-semibold text-[#1e293b]">
            No Cleaning Weeks Available
          </h3>

          <p className="text-sm text-[#64748b]">
            The cleaning schedule is not currently available.
            Please check back later for upcoming opportunities.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {weeks.map((week, weekIndex) => {
            const isExpanded = expandedWeeks.has(
              week.id
            );

            const deadlinePassed =
              new Date() >
              new Date(week.registrationDeadline);

            return (
              <motion.div
                key={week.id}
                initial={{
                  opacity: 0,
                  y: 18,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.45,
                  delay: weekIndex * 0.06,
                }}
                className="overflow-hidden rounded-2xl border border-[#dbe4ee] bg-white shadow-[0_6px_25px_rgba(26,54,93,0.045)] transition-all duration-300 hover:border-[#3182ce]/30"
              >
                {/* Week Header */}
                <div
                  className="flex cursor-pointer items-center justify-between gap-3 px-4 py-4 sm:px-6"
                  onClick={() =>
                    toggleWeek(week.id)
                  }
                >
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <motion.div
                      animate={{
                        scale: isExpanded
                          ? [1, 1.06, 1]
                          : 1,
                      }}
                      transition={{
                        duration: 0.5,
                      }}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1a365d]"
                    >
                      <Calendar className="h-5 w-5 text-white" />
                    </motion.div>

                    <div className="min-w-0">
                      <motion.h3
                        animate={{
                          x: isExpanded ? 2 : 0,
                        }}
                        className="truncate text-base font-semibold text-[#1e293b] sm:text-lg"
                      >
                        {week.weekLabel}
                      </motion.h3>

                      <p className="truncate text-xs text-[#64748b] sm:text-sm">
                        {formatDate(week.startDate)} -{' '}
                        {formatDate(week.endDate)}
                        <span className="hidden sm:inline">
                          {' '}
                          (Monday - Friday)
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                    {week.isActive ? (
                      <span className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 sm:px-3 sm:text-xs">
                        <Unlock className="h-3 w-3" />
                        Open
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-600 sm:px-3 sm:text-xs">
                        <Lock className="h-3 w-3" />
                        Closed
                      </span>
                    )}

                    {deadlinePassed &&
                      week.isActive && (
                        <span className="hidden rounded-full border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-600 md:inline-flex">
                          Deadline Passed
                        </span>
                      )}

                    <motion.div
                      animate={{
                        rotate: isExpanded ? 180 : 0,
                      }}
                      transition={{
                        duration: 0.25,
                      }}
                    >
                      <ChevronDown className="h-5 w-5 text-[#64748b]" />
                    </motion.div>
                  </div>
                </div>

                {/* Expanded Days */}
                <AnimatePresence initial={false}>
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
                        duration: 0.35,
                        ease: 'easeInOut',
                      }}
                      className="border-t border-[#e2e8f0]"
                    >
                      <div className="space-y-4 p-4 sm:p-6">
                        {week.days.map(
                          (day, dayIndex) => {
                            const isFull =
                              day.status === 'FULL';

                            const isClosed =
                              day.status === 'CLOSED';

                            const isOpen =
                              day.status === 'OPEN';

                            const isPast =
                              isDayPast(
                                day.cleaningDate
                              );

                            const userRegistered =
                              isUserRegisteredForDay(
                                day.id
                              );

                            const attendanceStatus =
                              getUserAttendanceStatus(
                                day.id
                              );

                            const canChange =
                              canChangeRegistration(
                                day,
                                week
                              );

                            const canReg =
                              canRegister(day, week);

                            const currentRegisteredWeek =
                              data?.registration
                                ?.cleaningDayId
                                ? weeks.find((w) =>
                                    w.days.some(
                                      (d) =>
                                        d.id ===
                                        data.registration
                                          ?.cleaningDayId
                                    )
                                  )
                                : null;

                            const isDifferentWeek =
                              currentRegisteredWeek &&
                              currentRegisteredWeek.id !==
                                week.id;

                            const canMarkAttendance =
                              data?.user?.role ===
                                'admin' ||
                              data?.user?.role ===
                                'teacher' ||
                              data?.user?.role ===
                                'super_admin';

                            return (
                              <motion.div
                                key={day.id}
                                initial={{
                                  opacity: 0,
                                  y: 12,
                                }}
                                animate={{
                                  opacity: 1,
                                  y: 0,
                                }}
                                transition={{
                                  delay:
                                    dayIndex * 0.055,
                                  duration: 0.35,
                                }}
                                className={`rounded-xl border p-4 transition-all duration-200 ${
                                  userRegistered
                                    ? 'border-emerald-300 bg-emerald-50/60'
                                    : isPast
                                      ? 'border-[#e2e8f0] bg-[#f8fafc] opacity-60'
                                      : isOpen
                                        ? 'border-[#dbe4ee] bg-white hover:-translate-y-0.5 hover:border-[#3182ce]/40 hover:shadow-md'
                                        : 'border-[#e2e8f0] bg-[#f8fafc] opacity-70'
                                }`}
                              >
                                <div className="flex flex-col gap-4">
                                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                                    <div className="flex min-w-0 items-center gap-3">
                                      <motion.div
                                        animate={{
                                          y: [
                                            0,
                                            -2,
                                            0,
                                          ],
                                        }}
                                        transition={{
                                          duration: 3,
                                          repeat:
                                            Infinity,
                                          delay:
                                            dayIndex *
                                            0.15,
                                        }}
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f1f5f9]"
                                      >
                                        <Calendar className="h-5 w-5 text-[#64748b]" />
                                      </motion.div>

                                      <div className="min-w-0">
                                        <h4 className="font-semibold text-[#1e293b]">
                                          {day.dayOfWeek}
                                        </h4>

                                        <p className="text-sm text-[#64748b]">
                                          {formatDate(
                                            day.cleaningDate
                                          )}
                                        </p>

                                        {data?.registration &&
                                          isDifferentWeek && (
                                            <p className="mt-0.5 text-xs font-medium text-[#3182ce]">
                                              {
                                                week.weekLabel
                                              }
                                            </p>
                                          )}
                                      </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                                      <div className="hidden sm:flex">
                                        <StatusBadge
                                          status={
                                            day.status
                                          }
                                          currentRegistrations={
                                            day.currentRegistrations
                                          }
                                          capacityLimit={
                                            day.capacityLimit
                                          }
                                        />
                                      </div>

                                      {userRegistered && (
                                        <RegisteredBadge
                                          attendanceStatus={
                                            attendanceStatus
                                          }
                                        />
                                      )}

                                      {!data?.registration &&
                                        canReg && (
                                          <button
                                            onClick={() =>
                                              handleRegister(
                                                day.id
                                              )
                                            }
                                            disabled={
                                              registerMutation.isPending
                                            }
                                            className="flex items-center gap-2 rounded-lg bg-[#1a365d] px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#153475] hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                                          >
                                            {registerMutation.isPending ? (
                                              <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                              <CalendarCheck className="h-4 w-4" />
                                            )}
                                            Register
                                          </button>
                                        )}

                                      {data?.registration &&
                                        canChange && (
                                          <button
                                            onClick={() =>
                                              handleChangeRegistration(
                                                day.id
                                              )
                                            }
                                            disabled={
                                              changeRegistrationMutation.isPending &&
                                              changingDayId ===
                                                day.id
                                            }
                                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 disabled:opacity-50 ${
                                              changingDayId ===
                                                day.id &&
                                              changeRegistrationMutation.isPending
                                                ? 'bg-[#f1f5f9] text-[#64748b]'
                                                : 'border border-[#3182ce]/25 bg-[#3182ce]/5 text-[#1a365d] hover:-translate-y-0.5 hover:border-[#3182ce]/40 hover:bg-[#3182ce]/10 active:translate-y-0'
                                            }`}
                                          >
                                            {changeRegistrationMutation.isPending &&
                                            changingDayId ===
                                              day.id ? (
                                              <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                              <ArrowRight className="h-4 w-4" />
                                            )}

                                            Change to this

                                            {isDifferentWeek && (
                                              <span className="text-xs opacity-70">
                                                (
                                                {
                                                  week.weekLabel
                                                }
                                                )
                                              </span>
                                            )}
                                          </button>
                                        )}

                                      {!userRegistered &&
                                        !canReg &&
                                        !data?.registration && (
                                          <AvailabilityMessage
                                            isPast={isPast}
                                            isFull={isFull}
                                            isClosed={
                                              isClosed
                                            }
                                            deadlinePassed={
                                              deadlinePassed
                                            }
                                            weekActive={
                                              week.isActive
                                            }
                                          />
                                        )}

                                      {data?.registration &&
                                        !canChange &&
                                        data.registration
                                          ?.cleaningDayId !==
                                          day.id && (
                                          <AvailabilityMessage
                                            isPast={isPast}
                                            isFull={isFull}
                                            isClosed={
                                              isClosed
                                            }
                                            deadlinePassed={
                                              deadlinePassed
                                            }
                                            weekActive={
                                              week.isActive
                                            }
                                          />
                                        )}
                                    </div>
                                  </div>

                                  {/* Registered Students */}

                                  {day.registrations.length >
                                    0 && (
                                    <div className="border-t border-[#e2e8f0] pt-4">
                                      <div className="mb-3 flex items-center justify-between gap-2">
                                        <p className="text-xs font-bold uppercase tracking-wider text-[#1a365d]">
                                          Participants
                                        </p>

                                        <span className="flex items-center gap-1 text-xs font-semibold text-[#3182ce]">
                                          <Users className="h-3 w-3" />
                                          {
                                            day
                                              .registrations
                                              .length
                                          }{' '}
                                          registered
                                        </span>
                                      </div>

                                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        {day.registrations.map(
                                          (reg, index) => {
                                            const attendance =
                                              day.attendanceRecords?.find(
                                                (
                                                  record: {
                                                    userId: string;
                                                    status: string;
                                                  }
                                                ) =>
                                                  record.userId ===
                                                  reg.userId
                                              );

                                            const isCurrentUser =
                                              reg.userId ===
                                              data?.user
                                                ?.id;

                                            return (
                                              <motion.div
                                                key={reg.id}
                                                initial={{
                                                  opacity: 0,
                                                  scale: 0.92,
                                                  y: 8,
                                                }}
                                                animate={{
                                                  opacity: 1,
                                                  scale: 1,
                                                  y: 0,
                                                }}
                                                transition={{
                                                  duration: 0.35,
                                                  delay:
                                                    index *
                                                    0.05,
                                                  ease: [
                                                    0.25,
                                                    0.1,
                                                    0.25,
                                                    1,
                                                  ],
                                                }}
                                                whileHover={{
                                                  scale: 1.03,
                                                  borderColor:
                                                    '#3182ce',
                                                  boxShadow:
                                                    '0 4px 12px rgba(49, 130, 206, 0.15)',
                                                }}
                                                className="group flex items-center gap-3 rounded-xl border-2 border-[#e2e8f0] bg-white px-3 py-2.5 shadow-sm transition-all"
                                              >
                                                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-[#dbe4ee] shadow-sm transition-colors group-hover:border-[#3182ce]/30">
                                                  {reg.user
                                                    .profileImageUrl ? (
                                                    <img
                                                      src={
                                                        reg
                                                          .user
                                                          .profileImageUrl
                                                      }
                                                      alt={`${reg.user.firstName} ${reg.user.lastName}`}
                                                      className="h-full w-full object-cover"
                                                    />
                                                  ) : (
                                                    <div
                                                      className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${getAvatarColor(
                                                        reg.user
                                                          .firstName,
                                                        reg.user
                                                          .lastName
                                                      )}`}
                                                    >
                                                      <span className="text-xs font-bold text-white">
                                                        {getInitials(
                                                          reg
                                                            .user
                                                            .firstName,
                                                          reg
                                                            .user
                                                            .lastName
                                                        )}
                                                      </span>
                                                    </div>
                                                  )}

                                                  {isCurrentUser && (
                                                    <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-[#3182ce] shadow-sm">
                                                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                                    </div>
                                                  )}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                  <div className="flex items-center gap-2">
                                                    <span className="truncate text-sm font-semibold text-[#1e293b] transition-colors group-hover:text-[#3182ce]">
                                                      {
                                                        reg.user
                                                          .firstName
                                                      }{' '}
                                                      {
                                                        reg.user
                                                          .lastName
                                                      }
                                                    </span>

                                                    {isCurrentUser && (
                                                      <span className="shrink-0 rounded-full bg-[#3182ce]/10 px-2 py-0.5 text-[10px] font-bold text-[#3182ce]">
                                                        You
                                                      </span>
                                                    )}
                                                  </div>

                                                  {attendance?.status && (
                                                    <div className="mt-0.5 flex items-center gap-1 text-[10px] font-medium">
                                                      {attendance.status ===
                                                        'ATTENDED' && (
                                                        <>
                                                          <CheckCircle className="h-3 w-3 text-emerald-600" />
                                                          <span className="text-emerald-600">
                                                            Attended
                                                          </span>
                                                        </>
                                                      )}

                                                      {attendance.status ===
                                                        'NO_SHOW' && (
                                                        <>
                                                          <XCircle className="h-3 w-3 text-red-600" />
                                                          <span className="text-red-600">
                                                            No show
                                                          </span>
                                                        </>
                                                      )}

                                                      {attendance.status ===
                                                        'PENDING' && (
                                                        <>
                                                          <Clock className="h-3 w-3 text-amber-600" />
                                                          <span className="text-amber-600">
                                                            Pending
                                                          </span>
                                                        </>
                                                      )}
                                                    </div>
                                                  )}
                                                </div>

                                                {canMarkAttendance && (
                                                  <div className="flex shrink-0 items-center gap-1 border-l border-[#dbe4ee] pl-2">
                                                    <button
                                                      onClick={() =>
                                                        handleMarkAttendance(
                                                          reg.userId,
                                                          day.id,
                                                          'ATTENDED'
                                                        )
                                                      }
                                                      className={`rounded-lg p-1.5 transition-colors ${
                                                        attendance?.status ===
                                                        'ATTENDED'
                                                          ? 'bg-emerald-100 text-emerald-600'
                                                          : 'text-[#94a3b8] hover:bg-emerald-50 hover:text-emerald-600'
                                                      }`}
                                                      title="Mark as attended"
                                                    >
                                                      <CheckCircle className="h-4 w-4" />
                                                    </button>

                                                    <button
                                                      onClick={() =>
                                                        handleMarkAttendance(
                                                          reg.userId,
                                                          day.id,
                                                          'NO_SHOW'
                                                        )
                                                      }
                                                      className={`rounded-lg p-1.5 transition-colors ${
                                                        attendance?.status ===
                                                        'NO_SHOW'
                                                          ? 'bg-red-100 text-red-600'
                                                          : 'text-[#94a3b8] hover:bg-red-50 hover:text-red-600'
                                                      }`}
                                                      title="Mark as no-show"
                                                    >
                                                      <XCircle className="h-4 w-4" />
                                                    </button>

                                                    <button
                                                      onClick={() =>
                                                        handleMarkAttendance(
                                                          reg.userId,
                                                          day.id,
                                                          'PENDING'
                                                        )
                                                      }
                                                      className={`rounded-lg p-1.5 transition-colors ${
                                                        attendance?.status ===
                                                        'PENDING'
                                                          ? 'bg-amber-100 text-amber-600'
                                                          : 'text-[#94a3b8] hover:bg-amber-50 hover:text-amber-600'
                                                      }`}
                                                      title="Mark as pending"
                                                    >
                                                      <Clock className="h-4 w-4" />
                                                    </button>
                                                  </div>
                                                )}
                                              </motion.div>
                                            );
                                          }
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Mobile Status */}

                                  <div className="flex flex-wrap items-center gap-2 sm:hidden">
                                    <StatusBadge
                                      status={day.status}
                                      currentRegistrations={
                                        day.currentRegistrations
                                      }
                                      capacityLimit={
                                        day.capacityLimit
                                      }
                                      mobile
                                    />

                                    {userRegistered && (
                                      <RegisteredBadge
                                        attendanceStatus={
                                          attendanceStatus
                                        }
                                      />
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          }
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

      {/* -------------------------------------------------- */}
      {/* Bottom Information */}
      {/* -------------------------------------------------- */}

      {weeks.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 rounded-2xl border border-[#dbe4ee] bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex items-start gap-3">
            <motion.div
              animate={{
                scale: [1, 1.08, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
              }}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#3182ce]/10"
            >
              <Info className="h-4 w-4 text-[#1a365d]" />
            </motion.div>

            <div>
              <h3 className="text-sm font-semibold text-[#1e293b]">
                Making your commitment count
              </h3>

              <p className="mt-1 text-sm leading-6 text-[#64748b]">
                Choose a cleaning day you can attend and participate
                responsibly. You can review the participants under
                each day and switch to another available day when
                registration is still open.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold text-emerald-800">
                      Open
                    </span>
                  </div>

                  <p className="text-xs leading-5 text-emerald-700">
                    Registration is available while spaces remain.
                  </p>
                </div>

                <div className="rounded-xl border border-red-100 bg-red-50/60 p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-xs font-semibold text-red-800">
                      Full or Closed
                    </span>
                  </div>

                  <p className="text-xs leading-5 text-red-700">
                    Registration is not available for these days.
                  </p>
                </div>

                <div className="rounded-xl border border-[#3182ce]/10 bg-[#3182ce]/5 p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#3182ce]" />
                    <span className="text-xs font-semibold text-[#1a365d]">
                      Registered
                    </span>
                  </div>

                  <p className="text-xs leading-5 text-[#64748b]">
                    Your selected day is highlighted for easy reference.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* -------------------------------------------------- */}
      {/* Cleaning Video — LAST CONTENT BEFORE FOOTER */}
      {/* -------------------------------------------------- */}

      <CleaningVideo />

      {/* -------------------------------------------------- */}
      {/* Footer Indicator */}
      {/* -------------------------------------------------- */}

      <motion.div
        animate={{
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="mx-auto mt-7 flex items-center justify-center gap-2 pb-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#94a3b8]"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#3182ce]" />
        Serve • Participate • Make an impact
        <span className="h-1.5 w-1.5 rounded-full bg-[#3182ce]" />
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------
// Status Badge
// ---------------------------------------------------------

function StatusBadge({
  status,
  currentRegistrations,
  capacityLimit,
  mobile = false,
}: {
  status: string;
  currentRegistrations: number;
  capacityLimit: number;
  mobile?: boolean;
}) {
  return (
    <motion.div
      animate={
        status === 'OPEN'
          ? {
              scale: [1, 1.02, 1],
            }
          : undefined
      }
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusColor(
        status
      )} ${mobile ? 'w-fit' : ''}`}
    >
      {status === 'OPEN' ? (
        <Unlock className="h-3.5 w-3.5" />
      ) : status === 'FULL' ? (
        <Users className="h-3.5 w-3.5" />
      ) : status === 'CLOSED' ? (
        <Lock className="h-3.5 w-3.5" />
      ) : (
        <Circle className="h-3.5 w-3.5" />
      )}

      <span>{status}</span>

      <span className="text-current opacity-50">
        •
      </span>

      <span>
        {currentRegistrations}/{capacityLimit}
      </span>
    </motion.div>
  );
}

// ---------------------------------------------------------
// Registered Badge
// ---------------------------------------------------------

function RegisteredBadge({
  attendanceStatus,
}: {
  attendanceStatus?: string;
}) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
      <Check className="h-3 w-3" />

      <span>Registered</span>

      {attendanceStatus && (
        <span
          className={`ml-1 rounded-full px-2 py-0.5 text-[10px] ${getAttendanceStatusColor(
            attendanceStatus
          )}`}
        >
          {attendanceStatus}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------
// Availability Message
// ---------------------------------------------------------

function AvailabilityMessage({
  isPast,
  isFull,
  isClosed,
  deadlinePassed,
  weekActive,
}: {
  isPast: boolean;
  isFull: boolean;
  isClosed: boolean;
  deadlinePassed: boolean;
  weekActive: boolean;
}) {
  let message = 'Unavailable';

  if (isPast) {
    message = 'Past date';
  } else if (isFull) {
    message = 'Full';
  } else if (isClosed) {
    message = 'Closed';
  } else if (deadlinePassed) {
    message = 'Registration deadline passed';
  } else if (!weekActive) {
    message = 'Week closed';
  }

  return (
    <span className="text-xs font-medium text-[#94a3b8] sm:text-sm">
      {message}
    </span>
  );
}