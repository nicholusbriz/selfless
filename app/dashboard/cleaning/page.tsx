// app/dashboard/cleaning/page.tsx
// Cleaning Schedule — Card Grid
//
// Day cards now show their week label so users can see at a glance
// which week each day belongs to.

'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  AlertCircle,
  ArrowLeft,
  ArrowUp,
  ArrowRightLeft,
  Calendar,
  Check,
  CheckCircle,
  Loader2,
  Search,
  User,
  X,
  MapPin,
  Filter,
  MoreVertical,
  UserCheck,
  UserX,
  Hourglass,
  ChevronDown,
} from 'lucide-react';

import {
  useStudentCleaningData,
  useStudentCleaningStatus,
  useRegisterForCleaning,
  useChangeRegistration,
  useUnregisterFromCleaning,
  useMarkAttendance,
  formatDate,
  isDayPast,
  type CleaningDay,
  type UnregisteredStudent,
  type UserAttendance,
  type Week as WeekType,
} from '@/hooks/useCleaningStudent';
import { isRecord } from '../response-guards';

// =========================================================
// DESIGN TOKENS — standard palette
// =========================================================

const TOKENS = `
  [data-cleaning-scope] {
    --ink: #1A2B4C;
    --ink-2: #3D4A61;
    --ink-3: #4B5646;
    --ink-4: #6B7280;

    --surface: #FFFFFF;
    --surface-2: #F8F9FA;
    --surface-3: #F3F4F6;

    --line: #E5E7EB;
    --line-strong: #D1D5DB;

    --brand: #1A2B4C;
    --brand-hover: #263D66;
    --brand-soft: #EEF1F5;

    --brass: #C59B4C;
    --brass-hover: #B08A3F;
    --brass-soft: #FBF7EE;

    --ok: #2F6B45;
    --ok-soft: #ECF6F0;

    --warn: #6E5520;
    --warn-soft: #FBF5E5;

    --bad: #8B3A24;
    --bad-soft: #FBEDE8;

    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum' 1, 'cv05' 1;
  }
`;

const focusRing =
  'outline-none focus-visible:ring-2 focus-visible:ring-[var(--brass)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]';

const panel =
  'border border-[var(--line)] bg-[var(--surface)] rounded-lg shadow-[0_1px_2px_rgba(26,43,76,0.04)]';

const btnBase = `inline-flex items-center justify-center gap-2 px-3 py-1.5 text-[12px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45 rounded-md ${focusRing}`;

const btnPrimary = `${btnBase} bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)]`;
const btnQuiet = `${btnBase} border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-2)] hover:border-[var(--brass)] hover:text-[var(--ink)]`;

// =========================================================
// HELPERS
// =========================================================

const getInitials = (firstName: string, lastName: string) =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

const registrationDeadlinePassed = (iso: string) => {
  return new Date() >= new Date(iso);
};

const deadlineLabel = (iso: string) => {
  return registrationDeadlinePassed(iso)
    ? 'Deadline passed'
    : `Deadline: ${formatDate(iso)}`;
};

type StatusTone = 'ok' | 'warn' | 'bad' | 'neutral';

const toneClasses: Record<StatusTone, string> = {
  ok: 'border-[var(--line)] bg-[var(--ok-soft)] text-[var(--ok)]',
  warn: 'border-[var(--line)] bg-[var(--warn-soft)] text-[var(--warn)]',
  bad: 'border-[var(--line)] bg-[var(--bad-soft)] text-[var(--bad)]',
  neutral: 'border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-3)]',
};

// =========================================================
// TAG
// =========================================================

function Tag({
  tone = 'neutral',
  children,
}: {
  tone?: StatusTone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.04em] rounded-md ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}

// =========================================================
// ACTION MENU
// =========================================================

type MenuType =
  | `student-${string}`
  | `switch-${string}`
  | null;

function ActionMenu({
  menuId,
  activeMenu,
  setActiveMenu,
  children,
}: {
  menuId: string;
  activeMenu: MenuType;
  setActiveMenu: (menu: MenuType) => void;
  children: React.ReactNode;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const isOpen = activeMenu === menuId;

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, setActiveMenu]);

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setActiveMenu(isOpen ? null : (menuId as MenuType))}
        aria-label="Open actions"
        aria-expanded={isOpen}
        className={`flex h-7 w-7 items-center justify-center rounded-md border transition-colors ${isOpen
          ? 'border-[var(--line-strong)] bg-[var(--surface-3)] text-[var(--ink)]'
          : 'border-[var(--line)] bg-white text-[var(--ink-4)] hover:border-[var(--line-strong)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]'
          }`}
      >
        <MoreVertical className="h-3.5 w-3.5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-[calc(100%+6px)] z-[9999] w-52 overflow-hidden rounded-lg border border-[var(--line)] bg-white p-1 shadow-lg"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItem({
  children,
  onClick,
  icon,
}: {
  children: React.ReactNode;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[12.5px] font-medium text-[var(--ink-2)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[var(--surface-2)]">
        {icon}
      </span>
      <span className="flex-1">{children}</span>
    </button>
  );
}

// =========================================================
// SWITCH DROPDOWN
// =========================================================

function SwitchDropdown({
  menuId,
  activeMenu,
  setActiveMenu,
  registeredDays,
  onSelect,
}: {
  menuId: string;
  activeMenu: MenuType;
  setActiveMenu: (menu: MenuType) => void;
  registeredDays: CleaningDay[];
  onSelect: (oldDayId: string, newDayId: string) => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const isOpen = activeMenu === menuId;

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, setActiveMenu]);

  return (
    <div ref={menuRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setActiveMenu(isOpen ? null : (menuId as MenuType))}
        aria-label="Switch from registered day"
        aria-expanded={isOpen}
        className={`w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-[11.5px] font-semibold rounded-md border transition-colors ${isOpen
          ? 'border-[var(--brass)] bg-[var(--brass-soft)] text-[var(--brass)]'
          : 'border-transparent bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)]'
          }`}
      >
        <ArrowRightLeft className="h-3 w-3" />
        Switch
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-[calc(100%+6px)] z-[9999] w-56 overflow-hidden rounded-lg border border-[var(--line)] bg-white p-1 shadow-lg"
          >
            <div className="px-2.5 py-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-4)]">
                Switch from
              </p>
            </div>
            {registeredDays.map((day) => {
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => {
                    onSelect(day.id, menuId.replace('switch-', ''));
                    setActiveMenu(null);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[12.5px] font-medium text-[var(--ink)] transition-colors hover:bg-[var(--surface-2)]"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[var(--brand-soft)] text-[var(--brand)]">
                    <Calendar className="h-3 w-3" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-semibold text-[var(--ink)]">
                      {day.dayOfWeek}
                    </p>
                    <p className="truncate text-[11px] text-[var(--ink-4)]">
                      {formatDate(day.cleaningDate)}
                    </p>
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =========================================================
// AVATAR
// =========================================================

function Avatar({
  firstName,
  lastName,
  src,
  isSelf,
  size = 32,
}: {
  firstName: string;
  lastName: string;
  src?: string | null;
  isSelf?: boolean;
  size?: number;
}) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full ${isSelf ? 'ring-2 ring-[var(--brass)]' : 'border border-[var(--line)]'
        } bg-[var(--brand)]`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          width={size}
          height={size}
          className="h-full w-full object-cover"
          loading="lazy"
          unoptimized
        />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center font-semibold text-white"
          style={{ fontSize: size * 0.36 }}
        >
          {getInitials(firstName, lastName)}
        </span>
      )}
    </div>
  );
}

// =========================================================
// CONFIRM DIALOG
// =========================================================

type ConfirmState = {
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void | Promise<void>;
  immediateClose?: boolean;
} | null;

function ConfirmDialog({
  state,
  onClose,
  pending,
}: {
  state: ConfirmState;
  onClose: () => void;
  pending: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!state) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    const node = panelRef.current;
    node?.querySelector<HTMLElement>('[data-autofocus]')?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !pending) {
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !node) return;
      const focusables = Array.from(
        node.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreRef.current?.focus?.();
    };
  }, [state, pending, onClose]);

  return (
    <AnimatePresence>
      {state && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-[var(--ink)]/40"
            onClick={() => !pending && onClose()}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-body"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
            className="relative w-full max-w-sm rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5 shadow-xl"
          >
            <h2
              id="confirm-title"
              className="text-[15px] font-semibold text-[var(--ink)]"
            >
              {state.title}
            </h2>
            <p
              id="confirm-body"
              className="mt-1.5 text-[13px] leading-5 text-[var(--ink-3)]"
            >
              {state.body}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className={btnQuiet}
                onClick={onClose}
                disabled={pending}
              >
                Cancel
              </button>
              <button
                type="button"
                data-autofocus
                className={btnPrimary}
                onClick={async () => {
                  if (state.immediateClose) {
                    onClose();
                  }
                  await state.onConfirm();
                }}
                disabled={pending}
              >
                {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {pending ? 'Working…' : state.confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// =========================================================
// PAGE HEADER
// =========================================================

function PageHeader({
  onBack,
  registeredLabel,
  deadlineText,
}: {
  onBack: () => void;
  registeredLabel: string | null;
  deadlineText: string | null;
}) {
  return (
    <header className="border-b border-[var(--line)] bg-[var(--surface)]">
      <div className="mx-auto max-w-6xl px-3 py-3 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              type="button"
              onClick={onBack}
              className={`${btnQuiet} h-8 w-8 px-0 rounded-md`}
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-[15px] font-semibold tracking-tight text-[var(--ink)] sm:text-[16px]">
                Cleaning Schedule
              </h1>
              <p className="mt-0.5 truncate text-[11.5px] leading-4 text-[var(--ink-3)]">
                {registeredLabel ?? 'Choose a cleaning day'}
                {deadlineText && (
                  <>
                    <span className="mx-1.5 text-[var(--ink-4)]">·</span>
                    {deadlineText}
                  </>
                )}
              </p>
            </div>
          </div>
          <nav className="hidden items-center gap-1 sm:flex">
            <Link href="/dashboard/courses" className={btnQuiet}>
              Courses
            </Link>
            <Link href="/dashboard/students" className={btnQuiet}>
              Students
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

// =========================================================
// SCROLLING NOTICE
// =========================================================

const scrollingMessages = [
  'The time is now — register for your cleaning day.',
  'Choose a day you can genuinely attend.',
  'Participate fully on your assigned cleaning day.',
  'Keep in touch with your tutors and stay informed.',
  'Submit your courses and assignments on time.',
  'Your participation helps keep our community strong.',
];

function ScrollingNotice() {
  return (
    <div className="mb-3 overflow-hidden rounded-md border border-[var(--line)] bg-[var(--brand)] text-white">
      <div className="flex h-8 items-center overflow-hidden">
        <div className="shrink-0 border-r border-white/15 px-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white">
            Notice
          </span>
        </div>
        <div className="min-w-0 flex-1 overflow-hidden">
          <motion.div
            className="flex w-max items-center whitespace-nowrap"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
          >
            {[...scrollingMessages, ...scrollingMessages].map((message, index) => (
              <span
                key={`${message}-${index}`}
                className="mx-5 text-[11.5px] font-medium tracking-[0.01em] text-white"
              >
                {message}
                <span className="ml-5 text-[var(--brass)]">•</span>
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// YOUR REGISTRATION BANNER
// =========================================================

function YourRegistrationBanner({
  days,
  weeks,
  userAttendance,
  onUnregisterRequest,
}: {
  days: CleaningDay[];
  weeks: WeekType[];
  userAttendance: UserAttendance[];
  onUnregisterRequest: (dayId: string) => void;
}) {
  const getAttendanceStatus = (dayId: string) => {
    const attendance = userAttendance.find((a) => a.cleaningDay.id === dayId);
    return attendance?.status || 'PENDING';
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${panel} mb-3`}
    >
      <div className="flex items-center gap-2 border-b border-[var(--line)] px-3.5 py-2.5">
        <CheckCircle className="h-4 w-4 shrink-0 text-[var(--brass)]" />
        <p className="text-[12px] font-semibold text-[var(--ink)]">
          {days.length === 1
            ? "You're registered"
            : `You have ${days.length} registrations`}
        </p>
      </div>

      <ul className="divide-y divide-[var(--line)]">
        {days.map((day) => {
          const week = weeks.find((w) => w.days.some((d) => d.id === day.id));
          const status = getAttendanceStatus(day.id);

          return (
            <li
              key={day.id}
              className="flex items-center justify-between gap-3 px-3.5 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold leading-5 text-[var(--ink)]">
                  {formatDate(day.cleaningDate)}
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--ink-4)]">
                  {week?.weekLabel}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Tag
                  tone={
                    status === 'ATTENDED'
                      ? 'ok'
                      : status === 'NO_SHOW'
                        ? 'bad'
                        : 'warn'
                  }
                >
                  {status.toLowerCase().replace('_', ' ')}
                </Tag>
                {week && !registrationDeadlinePassed(week.registrationDeadline) && (
                  <button
                    type="button"
                    onClick={() => onUnregisterRequest(day.id)}
                    className="text-[11.5px] font-medium text-red-600 transition-colors hover:text-red-700 hover:underline"
                    title="Unregister from this day"
                  >
                    Unregister
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {days.length < 2 && (
        <div className="border-t border-[var(--line)] px-3.5 py-2">
          <p className="text-[11px] text-[var(--ink-4)]">
            You can register for up to 2 cleaning days
          </p>
        </div>
      )}
    </motion.section>
  );
}

// =========================================================
// WEEK FILTER CHIPS
// =========================================================

type WeekFilter = { kind: 'all' } | { kind: 'week'; weekId: string };

function WeekFilterChips({
  filter,
  setFilter,
  weeks,
}: {
  filter: WeekFilter;
  setFilter: (f: WeekFilter) => void;
  weeks: Array<{ id: string; weekLabel: string }>;
}) {
  const isSelected = (target: WeekFilter) => {
    if (target.kind !== filter.kind) return false;
    if (target.kind === 'week' && filter.kind === 'week')
      return target.weekId === filter.weekId;
    return true;
  };

  const chipBase =
    'inline-flex items-center gap-1.5 px-2.5 py-1 text-[11.5px] font-semibold rounded-md border transition-colors';
  const chipOn = 'bg-[var(--brand)] border-[var(--brand)] text-white';
  const chipOff =
    'bg-[var(--surface)] border-[var(--line)] text-[var(--ink-2)] hover:border-[var(--brass)] hover:text-[var(--ink)]';

  const options: { label: string; value: WeekFilter; enabled: boolean }[] = [
    { label: 'All', value: { kind: 'all' }, enabled: true },
    ...weeks.map((week) => ({
      label: week.weekLabel,
      value: { kind: 'week' as const, weekId: week.id },
      enabled: true,
    })),
  ];

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <div className="mr-0.5 flex items-center gap-1.5 text-[var(--ink-4)]">
        <Filter className="h-3 w-3" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em]">
          Filter
        </span>
      </div>
      {options.map((opt, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => opt.enabled && setFilter(opt.value)}
          disabled={!opt.enabled}
          className={`${chipBase} ${isSelected(opt.value) ? chipOn : chipOff
            } ${!opt.enabled ? 'cursor-not-allowed opacity-40' : ''} ${focusRing}`}
          aria-disabled={!opt.enabled}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// =========================================================
// DAY CARD
// =========================================================

function DayCard({
  day,
  week,
  isSelf,
  registerable,
  switchable,
  unavailableText,
  busy,
  canMarkAttendance,
  onRegister,
  onSwitchSelect,
  currentUserId,
  activeMenu,
  setActiveMenu,
  onMarkAttendance,
  hasMultipleRegistrations,
  registeredDays,
  weeks,
  studentRegistrationCounts,
  onStudentClick,
}: {
  day: CleaningDay;
  week: {
    id: string;
    weekLabel: string;
    registrationDeadline: string;
    isActive: boolean;
  };
  isSelf: boolean;
  registerable: boolean;
  switchable: boolean;
  unavailableText: string;
  busy: boolean;
  canMarkAttendance: boolean;
  onRegister: () => void;
  onSwitchSelect: (oldDayId: string, newDayId: string) => void;
  currentUserId?: string;
  activeMenu: MenuType;
  setActiveMenu: (menu: MenuType) => void;
  onMarkAttendance: (
    userId: string,
    dayId: string,
    status: 'ATTENDED' | 'NO_SHOW' | 'PENDING',
  ) => void;
  hasMultipleRegistrations: boolean;
  registeredDays: CleaningDay[];
  weeks: WeekType[];
  studentRegistrationCounts: Map<string, number>;
  onStudentClick: (userId: string, studentName: string) => void;
}) {
  const isFull = day.currentRegistrations >= day.capacityLimit;

  const statusLabel = isSelf
    ? 'Registered'
    : day.status === 'FULL' || isFull
      ? 'Full'
      : day.status === 'CLOSED'
        ? 'Closed'
        : 'Open';

  const statusTone: StatusTone = isSelf
    ? 'ok'
    : day.status === 'FULL' || isFull
      ? 'bad'
      : day.status === 'CLOSED'
        ? 'warn'
        : 'ok';

  const allParticipants = day.registrations;

  return (
    <motion.article
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col overflow-visible rounded-lg border border-[var(--line)] bg-[var(--surface)] p-3 shadow-[0_1px_2px_rgba(26,43,76,0.04)] transition-colors hover:border-[var(--line-strong)]"
    >
      {/* HEADER */}
      <div className="flex items-start justify-between gap-2 border-b border-[var(--line)] pb-2.5">
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-semibold tracking-tight text-[var(--ink)]">
            {formatDate(day.cleaningDate)}
          </p>
          <div className="mt-0.5 flex items-center justify-between gap-2">
            <p className="text-[11px] font-medium text-[var(--ink-3)]">
              {week.weekLabel}
            </p>
            <p
              className={`shrink-0 text-right text-[10.5px] ${registrationDeadlinePassed(week.registrationDeadline)
                ? 'font-semibold text-[var(--bad)]'
                : 'font-medium text-[var(--ink-4)]'
                }`}
            >
              {deadlineLabel(week.registrationDeadline)}
            </p>
          </div>
        </div>

        <Tag tone={statusTone}>
          {isSelf && <CheckCircle className="h-3 w-3" />}
          {statusLabel}
        </Tag>
      </div>

      {/* BODY */}
      <div className="flex flex-1 flex-col gap-2.5 pt-2.5">
        <div>
          <div className="flex items-center justify-between gap-2 pb-1.5">
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-4)]">
              Participants
              {day.registrations.length > 0 && (
                <span className="ml-1 text-[var(--ink-4)]">
                  ({day.registrations.length})
                </span>
              )}
            </span>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10.5px] font-bold ${isFull
                ? 'bg-[var(--bad-soft)] text-[var(--bad)]'
                : 'bg-[var(--surface-2)] text-[var(--ink-2)]'
                }`}
              aria-label={`${day.currentRegistrations} of ${day.capacityLimit} places filled`}
              title={`${day.currentRegistrations} of ${day.capacityLimit} places filled`}
            >
              {day.currentRegistrations}/{day.capacityLimit}
            </span>
          </div>

          {day.registrations.length === 0 ? (
            <div className="py-2 text-[11.5px] text-[var(--ink-4)]">
              No participants yet
            </div>
          ) : (
            <ul className="space-y-1 overflow-visible">
              {allParticipants.map((reg) => {
                const attendance = (
                  day.attendanceRecords as AttendanceRecord[] | undefined
                )?.find((r) => r.userId === reg.userId);
                const isMe = reg.userId === currentUserId;
                const totalRegistrations = studentRegistrationCounts.get(reg.userId) || 0;

                return (
                  <li
                    key={reg.id}
                    className="flex items-center gap-2 overflow-visible py-0.5"
                  >
                    <Avatar
                      firstName={reg.user.firstName}
                      lastName={reg.user.lastName}
                      src={reg.user.profileImageUrl}
                      isSelf={isMe}
                      size={28}
                    />
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 gap-y-0.5">
                      <span className="truncate text-[12px] font-medium text-[var(--ink)]">
                        {reg.user.firstName} {reg.user.lastName}
                      </span>
                      <span className="shrink-0 rounded bg-[var(--brass-soft)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--brass)]">
                        {totalRegistrations}/2
                      </span>
                      {isMe && (
                        <span className="shrink-0 rounded bg-[var(--ok-soft)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--ok)]">
                          You
                        </span>
                      )}
                      {attendance?.status && (
                        <span className="shrink-0 text-[10px] capitalize text-[var(--ink-4)]">
                          {attendance.status.replace('_', ' ').toLowerCase()}
                        </span>
                      )}
                    </div>
                    {canMarkAttendance && (
                      <ActionMenu
                        menuId={`student-${reg.id}`}
                        activeMenu={activeMenu}
                        setActiveMenu={setActiveMenu}
                      >
                        <div className="px-2.5 py-1.5">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-4)]">
                            Mark attendance
                          </p>
                          <p className="mt-0.5 truncate text-[11.5px] font-medium text-[var(--ink-2)]">
                            {reg.user.firstName} {reg.user.lastName}
                          </p>
                        </div>
                        <MenuItem
                          onClick={() => {
                            onMarkAttendance(reg.userId, day.id, 'ATTENDED');
                            setActiveMenu(null);
                          }}
                          icon={<UserCheck className="h-3.5 w-3.5 text-emerald-600" />}
                        >
                          Mark attended
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            onMarkAttendance(reg.userId, day.id, 'NO_SHOW');
                            setActiveMenu(null);
                          }}
                          icon={<UserX className="h-3.5 w-3.5 text-red-600" />}
                        >
                          Mark no show
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            onMarkAttendance(reg.userId, day.id, 'PENDING');
                            setActiveMenu(null);
                          }}
                          icon={<Hourglass className="h-3.5 w-3.5 text-amber-600" />}
                        >
                          Mark pending
                        </MenuItem>
                      </ActionMenu>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[10.5px] text-[var(--ink-4)]">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0" />
            <span>Tech Center opens 8:00 AM</span>
          </span>
        </div>

        <div className="mt-auto pt-1">
          {isSelf ? (
            <div className="flex items-center justify-center gap-1.5 rounded-md bg-[var(--ok-soft)] px-2.5 py-1.5 text-[11.5px] font-semibold text-[var(--ok)]">
              <CheckCircle className="h-3 w-3" />
              You&apos;re registered
            </div>
          ) : registerable && switchable ? (
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={onRegister}
                disabled={busy}
                className="rounded-md bg-[var(--brass)] px-2 py-1.5 text-[11.5px] font-semibold text-white transition-colors hover:bg-[var(--brass-hover)] disabled:opacity-50"
              >
                {busy ? 'Registering…' : 'Register'}
              </button>
              <SwitchDropdown
                menuId={`switch-${day.id}`}
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
                registeredDays={registeredDays}
                onSelect={onSwitchSelect}
              />
            </div>
          ) : registerable ? (
            <button
              type="button"
              onClick={onRegister}
              disabled={busy}
              className="w-full rounded-md bg-[var(--brass)] px-2 py-1.5 text-[11.5px] font-semibold text-white transition-colors hover:bg-[var(--brass-hover)] disabled:opacity-50"
            >
              {busy ? 'Registering…' : hasMultipleRegistrations ? 'Register another day' : 'Register'}
            </button>
          ) : switchable ? (
            <div className="flex items-center justify-center">
              <SwitchDropdown
                menuId={`switch-${day.id}`}
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
                registeredDays={registeredDays}
                onSelect={onSwitchSelect}
              />
            </div>
          ) : (
            <div className="text-center text-[11px] font-medium text-[var(--ink-4)]">
              {unavailableText}
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}

// =========================================================
// STUDENT DAYS MODAL
// =========================================================

function StudentDaysModal({
  isOpen,
  onClose,
  studentName,
  days,
}: {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  days: Array<{ dayId: string; dayOfWeek: string; cleaningDate: string; weekLabel: string }>;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    const node = panelRef.current;
    node?.querySelector<HTMLElement>('[data-autofocus]')?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreRef.current?.focus?.();
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-[var(--ink)]/40"
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
            className="relative w-full max-w-sm rounded-lg border border-[var(--line)] bg-[var(--surface)] shadow-lg"
          >
            <div className="flex items-center justify-between border-b border-[var(--line)] px-3.5 py-2.5">
              <h2 className="text-[13.5px] font-semibold text-[var(--ink)]">
                {studentName}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded p-1 text-[var(--ink-4)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-3.5 py-2.5">
              {days.length === 0 ? (
                <div className="py-4 text-center">
                  <Calendar className="mx-auto h-5 w-5 text-[var(--ink-4)]" />
                  <p className="mt-1.5 text-[12px] font-medium text-[var(--ink)]">
                    No registered days
                  </p>
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {days.map((day) => (
                    <li
                      key={day.dayId}
                      className="flex items-center justify-between gap-2 rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-2.5 py-1.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-[12.5px] font-medium text-[var(--ink)]">
                          {day.dayOfWeek}
                        </p>
                        <p className="text-[11px] text-[var(--ink-4)]">
                          {formatDate(day.cleaningDate)}
                        </p>
                      </div>
                      <span className="shrink-0 rounded border border-[var(--line)] bg-[var(--surface)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--ink-3)]">
                        {day.weekLabel}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// =========================================================
// TYPES
// =========================================================

type AttendanceRecord = {
  userId: string;
  status: string;
};

type ParticipantSearchResult = {
  registrationId: string;
  userId: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string | null;
  dayId: string;
  dayOfWeek: string;
  cleaningDate: string;
  weekId: string;
  weekLabel: string;
  totalRegistrations: number;
};

// =========================================================
// PARTICIPANT SEARCH
// =========================================================

function ParticipantSearch({
  results,
  search,
  onSearchChange,
  onClear,
  onSelect,
}: {
  results: ParticipantSearchResult[];
  search: string;
  onSearchChange: (value: string) => void;
  onClear: () => void;
  onSelect: (result: ParticipantSearchResult) => void;
}) {
  const [focused, setFocused] = useState(false);
  const showResults = focused && search.trim().length > 0;

  return (
    <section className={`${panel} mb-3`}>
      <div className="px-3.5 py-3">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 shrink-0 text-[var(--ink-3)]" />
          <h2 className="text-[13px] font-semibold text-[var(--ink)]">
            Find a registered participant
          </h2>
        </div>

        <div className="relative mt-2">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--ink-4)]"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="Search student, day or date..."
            aria-label="Search registered participants"
            className={`h-9 w-full rounded-md border border-[var(--line)] bg-[var(--surface)] pl-8 pr-8 text-[12.5px] text-[var(--ink)] placeholder:text-[var(--ink-4)] ${focusRing}`}
          />
          {search && (
            <button
              type="button"
              onClick={onClear}
              aria-label="Clear participant search"
              className={`absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 text-[var(--ink-4)] hover:text-[var(--ink)] ${focusRing}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {search.trim() && (
          <p className="mt-1.5 text-[11px] font-medium text-[var(--ink-4)]">
            {results.length}{' '}
            {results.length === 1 ? 'participant' : 'participants'} found
          </p>
        )}
      </div>

      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
          >
            {results.length > 0 ? (
              <div className="max-h-[320px] overflow-y-auto border-t border-[var(--line)]">
                {results.map((result) => (
                  <button
                    type="button"
                    key={`${result.registrationId}-${result.dayId}`}
                    onClick={() => onSelect(result)}
                    className={`flex w-full items-center gap-2.5 border-b border-[var(--line)] px-3.5 py-2 text-left last:border-b-0 hover:bg-[var(--surface-2)] ${focusRing}`}
                  >
                    <Avatar
                      firstName={result.firstName}
                      lastName={result.lastName}
                      src={result.profileImageUrl}
                      size={28}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block break-words text-[12.5px] font-semibold text-[var(--brand)]">
                        {result.firstName} {result.lastName}
                        <span className="ml-1 text-[10px] font-medium text-[var(--brass)]">
                          ({result.totalRegistrations}/2)
                        </span>
                      </span>
                      <span className="mt-0.5 block text-[11px] text-[var(--ink-4)]">
                        {result.dayOfWeek}, {formatDate(result.cleaningDate)}
                      </span>
                    </span>
                    <span className="hidden shrink-0 text-[10px] uppercase tracking-wide text-[var(--ink-4)] sm:block">
                      {result.weekLabel}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="border-t border-[var(--line)] px-3.5 py-6 text-center">
                <User className="mx-auto h-4 w-4 text-[var(--ink-4)]" />
                <p className="mt-1.5 text-[12.5px] font-semibold text-[var(--ink)]">
                  No registered participant found
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--ink-4)]">
                  Try a first name, last name, day or date.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// =========================================================
// UNREGISTERED STUDENTS
// =========================================================

type StudentFilter = 'all' | 'zero' | 'one' | 'two';

type StudentWithCount = UnregisteredStudent & { registrationCount: number };

function UnregisteredStudentsList({
  studentsByRegistrationCount,
  totalWeeks,
  totalDays,
  onStudentClick,
}: {
  studentsByRegistrationCount: {
    zero: UnregisteredStudent[];
    one: UnregisteredStudent[];
    two: UnregisteredStudent[];
  };
  totalWeeks: number;
  totalDays: number;
  onStudentClick?: (userId: string, studentName: string) => void;
}) {
  const [filter, setFilter] = useState<StudentFilter>('all');

  const allStudents: StudentWithCount[] = [
    ...studentsByRegistrationCount.zero.map((s) => ({ ...s, registrationCount: 0 })),
    ...studentsByRegistrationCount.one.map((s) => ({ ...s, registrationCount: 1 })),
    ...studentsByRegistrationCount.two.map((s) => ({ ...s, registrationCount: 2 })),
  ];

  const filteredStudents = useMemo(() => {
    if (filter === 'all') return allStudents;
    return allStudents.filter((s) => {
      if (filter === 'zero') return s.registrationCount === 0;
      if (filter === 'one') return s.registrationCount === 1;
      if (filter === 'two') return s.registrationCount === 2;
      return false;
    });
  }, [filter, allStudents]);

  const totalStudents = allStudents.length;

  if (totalStudents === 0) {
    return (
      <div className={`${panel} mb-3 px-3.5 py-2.5`}>
        <div className="flex items-center gap-2 text-[12px] text-[var(--ink-3)]">
          <CheckCircle className="h-3.5 w-3.5 text-[var(--ok)]" />
          <span className="font-medium">
            Every student is registered for a cleaning day.
          </span>
        </div>
        <p className="mt-1 text-[11px] text-[var(--ink-4)]">
          Total weeks: {totalWeeks} · Total days: {totalDays}
        </p>
      </div>
    );
  }

  const filterOptions = [
    { key: 'all' as const, label: 'All', count: totalStudents, description: 'All students' },
    { key: 'zero' as const, label: 'Not registered', count: studentsByRegistrationCount.zero.length, description: 'Students who haven\'t registered for a cleaning day' },
    { key: 'one' as const, label: 'One day', count: studentsByRegistrationCount.one.length, description: 'Students registered for one day' },
    { key: 'two' as const, label: 'Two days', count: studentsByRegistrationCount.two.length, description: 'Students registered for two days' },
  ];

  return (
    <div className={`${panel} mb-3`}>
      <div className="flex items-center justify-between border-b border-[var(--line)] px-3.5 py-2.5">
        <p className="text-[12px] font-semibold text-[var(--ink)]">
          Students by registration
        </p>
        <p className="text-[11px] text-[var(--ink-4)]">
          Total: {totalStudents}
        </p>
      </div>

      <div className="px-3.5 py-2.5">
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {filterOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setFilter(option.key)}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-semibold transition-colors ${filter === option.key
                ? 'border-[var(--brand)] bg-[var(--brand)] text-white'
                : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink-2)] hover:border-[var(--brass)] hover:text-[var(--ink)]'
                } ${focusRing}`}
              title={option.description}
            >
              {option.label}
              <span
                className={`ml-0.5 rounded px-1 py-0.5 text-[10px] font-bold ${filter === option.key
                  ? 'bg-white/20 text-white'
                  : 'bg-[var(--surface-2)] text-[var(--ink-3)]'
                  }`}
              >
                {option.count}
              </span>
            </button>
          ))}
        </div>

        {filteredStudents.length === 0 ? (
          <div className="py-1.5 text-[11.5px] text-[var(--ink-4)]">
            No students in this category
          </div>
        ) : (
          <p className="text-[12px] leading-6 text-[var(--ink)]">
            {filteredStudents
              .sort((a, b) => a.firstName.localeCompare(b.firstName))
              .map((s, index) => (
                <span key={s.id}>
                  {index > 0 && ' · '}
                  <button
                    type="button"
                    onClick={() => onStudentClick?.(s.id, `${s.firstName} ${s.lastName}`)}
                    className={`${s.registrationCount > 0
                      ? 'font-semibold text-blue-600'
                      : 'text-[var(--ink)]'
                      } hover:underline decoration-1 underline-offset-2`}
                  >
                    {s.firstName} {s.lastName}
                  </button>
                </span>
              ))}
          </p>
        )}

        <div className="mt-2 border-t border-[var(--line)] pt-2">
          <p className="text-[11px] text-[var(--ink-4)]">
            Click a name to see their registration status. Total weeks: {totalWeeks} · Total days: {totalDays}
          </p>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// SHELL
// =========================================================

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-cleaning-scope
      className="min-h-screen bg-[var(--surface-2)] text-[var(--ink)] antialiased"
    >
      <style dangerouslySetInnerHTML={{ __html: TOKENS }} />
      {children}
    </div>
  );
}

// =========================================================
// SKELETON
// =========================================================

function GridSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="h-[320px] animate-pulse rounded-lg border border-[var(--line)] bg-[var(--surface)]"
        />
      ))}
    </div>
  );
}

// =========================================================
// MAIN PAGE
// =========================================================

export default function CleaningPage() {
  const router = useRouter();
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [pendingDayId, setPendingDayId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    tone: 'ok' | 'bad';
    message: string;
  } | null>(null);
  const [participantSearch, setParticipantSearch] = useState('');
  const [weekFilter, setWeekFilter] = useState<WeekFilter>({ kind: 'all' });
  const [activeMenu, setActiveMenu] = useState<MenuType>(null);

  const [studentDaysModal, setStudentDaysModal] = useState<{
    studentId: string;
    studentName: string;
    days: Array<{ dayId: string; dayOfWeek: string; cleaningDate: string; weekLabel: string }>;
  } | null>(null);

  const handleStudentClick = (studentId: string, studentName: string) => {
    const days: Array<{ dayId: string; dayOfWeek: string; cleaningDate: string; weekLabel: string }> = [];
    weeks.forEach((week) => {
      week.days.forEach((day) => {
        day.registrations.forEach((reg) => {
          if (reg.userId === studentId) {
            days.push({
              dayId: day.id,
              dayOfWeek: day.dayOfWeek,
              cleaningDate: day.cleaningDate,
              weekLabel: week.weekLabel,
            });
          }
        });
      });
    });
    setStudentDaysModal({ studentId, studentName, days });
  };

  const { data, isLoading, error, refetch } = useStudentCleaningData();
  const { data: statusData, refetch: refetchStatus } =
    useStudentCleaningStatus();
  const registerMutation = useRegisterForCleaning();
  const changeRegistrationMutation = useChangeRegistration();
  const unregisterMutation = useUnregisterFromCleaning();
  const markAttendanceMutation = useMarkAttendance();

  const weeks = useMemo(() => data?.weeks ?? [], [data]);
  const allDays = useMemo(() => weeks.flatMap((week) => week.days), [weeks]);

  const studentRegistrationCounts = useMemo(() => {
    const counts = new Map<string, number>();
    weeks.forEach((week) =>
      week.days.forEach((day) =>
        day.registrations.forEach((registration) => {
          const currentCount = counts.get(registration.userId) || 0;
          counts.set(registration.userId, currentCount + 1);
        }),
      ),
    );
    return counts;
  }, [weeks]);

  const registeredDays = useMemo(
    () =>
      (data?.registrations || [])
        .map((reg) => allDays.find((day) => day.id === reg.cleaningDayId))
        .filter((day): day is CleaningDay => day !== undefined),
    [allDays, data?.registrations],
  );

  const registeredWeeks = useMemo(
    () =>
      (data?.registrations || [])
        .map((reg) => weeks.find((week) => week.days.some((day) => day.id === reg.cleaningDayId)))
        .filter((week): week is WeekType => week !== undefined),
    [weeks, data?.registrations],
  );

  const summaryStats = useMemo(() => {
    const openDays = allDays.filter((day) => day.status === 'OPEN').length;
    const fullDays = allDays.filter((day) => day.status === 'FULL').length;
    const closedDays = allDays.filter((day) => day.status === 'CLOSED').length;

    return {
      weeks: weeks.length,
      days: allDays.length,
      registered: registeredDays.length,
      open: openDays,
      full: fullDays,
      closed: closedDays,
    };
  }, [allDays, weeks.length, registeredDays.length]);

  const filteredDays = useMemo(() => {
    if (weekFilter.kind === 'all') {
      return weeks.flatMap((week) => week.days.map((day) => ({ day, week })));
    }
    const week = weeks.find((w) => w.id === weekFilter.weekId);
    if (!week) return [];
    return week.days.map((day) => ({ day, week }));
  }, [weeks, weekFilter]);

  const participantSearchResults = useMemo(() => {
    const query = participantSearch.trim().toLowerCase();
    if (!query) return [];
    const normalizedQuery = query.replace(/\s+/g, ' ');
    const results: ParticipantSearchResult[] = [];

    for (const week of weeks) {
      for (const day of week.days) {
        for (const registration of day.registrations) {
          const firstName = registration.user.firstName ?? '';
          const lastName = registration.user.lastName ?? '';
          const fullName = `${firstName} ${lastName}`.trim();
          const reverseName = `${lastName} ${firstName}`.trim();
          const dayName = day.dayOfWeek ?? '';
          const dateText = formatDate(day.cleaningDate);
          const rawDate = day.cleaningDate ?? '';

          const searchableText = [
            firstName,
            lastName,
            fullName,
            reverseName,
            dayName,
            dateText,
            rawDate,
            week.weekLabel,
          ]
            .join(' ')
            .toLowerCase()
            .replace(/\s+/g, ' ');

          if (searchableText.includes(normalizedQuery)) {
            results.push({
              registrationId: registration.id,
              userId: registration.userId,
              firstName,
              lastName,
              profileImageUrl: registration.user.profileImageUrl,
              dayId: day.id,
              dayOfWeek: day.dayOfWeek,
              cleaningDate: day.cleaningDate,
              weekId: week.id,
              weekLabel: week.weekLabel,
              totalRegistrations: studentRegistrationCounts.get(registration.userId) || 0,
            });
          }
        }
      }
    }
    return results;
  }, [participantSearch, weeks]);

  const handleParticipantSearchSelect = useCallback(
    (result: ParticipantSearchResult) => {
      setParticipantSearch('');
      setWeekFilter({ kind: 'all' });
      window.setTimeout(() => {
        const element = document.getElementById(
          `cleaning-day-${result.dayId}`,
        );
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 250);
    },
    [],
  );

  const flash = useCallback((tone: 'ok' | 'bad', message: string) => {
    setNotice({ tone, message });
    window.setTimeout(() => setNotice(null), tone === 'ok' ? 4000 : 7000);
  }, []);

  const runRegister = async (dayId: string) => {
    setPendingDayId(dayId);
    try {
      const result = await registerMutation.mutateAsync(dayId);
      flash(
        'ok',
        isRecord(result) && typeof result.message === 'string'
          ? result.message
          : 'You are registered for this cleaning day.',
      );
      await Promise.all([refetch(), refetchStatus()]);
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Registration failed';
      const lower = raw.toLowerCase();
      if (lower.includes('already registered')) {
        flash(
          'bad',
          'You already have a registration. Use "Switch here" on another open day instead.',
        );
      } else if (lower.includes('maximum of 2')) {
        flash(
          'bad',
          'You can register for a maximum of 2 cleaning days. Unregister from one of your current days first.',
        );
      } else if (lower.includes('full')) {
        flash('bad', 'This day is full. Choose another open day.');
      } else if (lower.includes('closed')) {
        flash('bad', 'Registration for this day is closed.');
      } else {
        flash('bad', raw);
      }
    } finally {
      setPendingDayId(null);
    }
  };

  const runChange = async (newDayId: string, oldDayId?: string) => {
    setPendingDayId(newDayId);
    try {
      const result = await changeRegistrationMutation.mutateAsync({
        newDayId,
        oldDayId,
      });
      const newDay = allDays.find((day) => day.id === newDayId);
      flash(
        'ok',
        isRecord(result) && typeof result.message === 'string'
          ? result.message
          : `Your registration moved to ${newDay?.dayOfWeek ?? 'the selected day'}.`,
      );
      await Promise.all([refetch(), refetchStatus()]);
    } catch (err: unknown) {
      flash(
        'bad',
        err instanceof Error
          ? err.message
          : 'Could not change your cleaning day.',
      );
    } finally {
      setPendingDayId(null);
    }
  };

  const runUnregister = async (dayId: string) => {
    setPendingDayId(dayId);
    try {
      await unregisterMutation.mutateAsync({ cleaningDayId: dayId });
      const day = allDays.find((d) => d.id === dayId);
      flash(
        'ok',
        `You have unregistered from ${day?.dayOfWeek ?? 'this day'}.`,
      );
      await Promise.all([refetch(), refetchStatus()]);
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Unregister failed';
      flash('bad', raw);
    } finally {
      setPendingDayId(null);
    }
  };

  const handleMarkAttendance = async (
    userId: string,
    dayId: string,
    status: 'ATTENDED' | 'NO_SHOW' | 'PENDING',
  ) => {
    try {
      await markAttendanceMutation.mutateAsync({
        userId,
        cleaningDayId: dayId,
        status,
      });
      flash(
        'ok',
        `Attendance saved as ${status.toLowerCase().replace('_', ' ')}.`,
      );
      await refetch();
    } catch (err: unknown) {
      flash(
        'bad',
        err instanceof Error ? err.message : 'Could not save attendance.',
      );
    }
  };

  const askRegister = (day: CleaningDay) =>
    setConfirm({
      title: `Register for ${day.dayOfWeek}?`,
      body: `${formatDate(
        day.cleaningDate,
      )}. You are expected to attend the day you select. You can switch days while registration stays open.`,
      confirmLabel: 'Register',
      onConfirm: () => runRegister(day.id),
      immediateClose: true,
    });

  const askChange = (day: CleaningDay, weekLabel: string, oldDayId?: string) =>
    setConfirm({
      title: `Switch to ${day.dayOfWeek}?`,
      body: `Your registration moves from ${oldDayId
        ? registeredDays.find(d => d.id === oldDayId)?.dayOfWeek ?? 'your current day'
        : registeredDays[0]?.dayOfWeek ?? 'your current day'
        } to ${day.dayOfWeek}, ${formatDate(day.cleaningDate)} (${weekLabel}).`,
      confirmLabel: 'Switch day',
      onConfirm: () => runChange(day.id, oldDayId),
      immediateClose: true,
    });

  const handleSwitchSelect = (oldDayId: string, newDayId: string) => {
    const newDay = allDays.find((d) => d.id === newDayId);
    const week = weeks.find((w) => w.days.some((d) => d.id === newDayId));
    if (newDay && week) {
      askChange(newDay, week.weekLabel, oldDayId);
    }
  };

  const askUnregister = (day: CleaningDay) => {
    const week = weeks.find((item) => item.days.some((itemDay) => itemDay.id === day.id));
    if (!week || registrationDeadlinePassed(week.registrationDeadline)) {
      return;
    }

    setConfirm({
      title: `Unregister from ${day.dayOfWeek}?`,
      body: `You will be removed from ${day.dayOfWeek}, ${formatDate(day.cleaningDate)}. This action cannot be undone.`,
      confirmLabel: 'Unregister',
      onConfirm: () => runUnregister(day.id),
      immediateClose: true,
    });
  };

  const isAtMinimumThreshold = (day: CleaningDay) =>
    day.currentRegistrations === 4;

  const canRegister = (
    day: CleaningDay,
    week: { registrationDeadline: string; isActive: boolean },
  ) =>
    (!data?.registrations || data.registrations.length < 2) &&
    !registeredDays.some((d) => d.id === day.id) &&
    week.isActive &&
    day.status === 'OPEN' &&
    !registrationDeadlinePassed(week.registrationDeadline);

  const canSwitch = (
    day: CleaningDay,
    week: { registrationDeadline: string; isActive: boolean },
    oldDayId?: string,
  ) => {
    const targetOldDay = oldDayId
      ? registeredDays.find((d) => d.id === oldDayId)
      : registeredDays[0];

    const currentDayAtMinimum =
      targetOldDay && isAtMinimumThreshold(targetOldDay);

    return Boolean(
      registeredDays.length > 0 &&
      day.id !== targetOldDay?.id &&
      week.isActive &&
      day.status === 'OPEN' &&
      !currentDayAtMinimum &&
      !registrationDeadlinePassed(week.registrationDeadline),
    );
  };

  const unavailableReason = (
    day: CleaningDay,
    week: { registrationDeadline: string; isActive: boolean },
  ) => {
    if (registeredDays.some((d) => d.id === day.id)) return 'Already registered';
    if (data?.registrations && data.registrations.length >= 2) return 'Max registrations reached';
    if (day.currentRegistrations >= day.capacityLimit) return 'Full';
    if (day.status === 'FULL') return 'Full';
    if (day.status === 'CLOSED') return 'Closed';
    if (registrationDeadlinePassed(week.registrationDeadline)) return 'Deadline passed';
    if (!week.isActive) return 'Week closed';
    if (isDayPast(day.cleaningDate)) return 'Unavailable';
    return 'Unavailable';
  };

  const canMarkAttendance =
    data?.user?.role === 'admin' ||
    data?.user?.role === 'teacher' ||
    data?.user?.role === 'super_admin';

  const registeredLabel = registeredDays.length > 0
    ? registeredDays.length === 1
      ? `Registered for ${registeredDays[0].dayOfWeek}, ${formatDate(registeredDays[0].cleaningDate)}`
      : `Registered for ${registeredDays.length} days`
    : null;

  const activeWeek = weeks.find((week) => week.isActive);

  const deadlineText = registeredWeeks.length > 0
    ? deadlineLabel(registeredWeeks[0].registrationDeadline)
    : activeWeek?.registrationDeadline
      ? deadlineLabel(activeWeek.registrationDeadline)
      : null;

  if (isLoading) {
    return (
      <Shell>
        <PageHeader
          onBack={() => router.back()}
          registeredLabel={null}
          deadlineText={null}
        />
        <main className="mx-auto max-w-6xl px-3 py-5 sm:px-5">
          <ScrollingNotice />
          <GridSkeleton />
        </main>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell>
        <PageHeader
          onBack={() => router.back()}
          registeredLabel={null}
          deadlineText={null}
        />
        <main className="mx-auto max-w-6xl px-3 py-5 sm:px-5">
          <ScrollingNotice />
          <div className={`${panel} p-4`}>
            <div className="flex items-start gap-2.5">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--bad)]" />
              <div>
                <h2 className="text-[13.5px] font-semibold text-[var(--ink)]">
                  The schedule could not be loaded
                </h2>
                <p className="mt-1 max-w-prose text-[12.5px] leading-5 text-[var(--ink-3)]">
                  {(error as Error)?.message ?? 'An unexpected error occurred.'}
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className={`${btnPrimary} mt-2.5`}
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </main>
      </Shell>
    );
  }

  return (
    <Shell>
      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          title="Back to top"
          className="fixed bottom-4 left-3 z-40 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--ink)] shadow-md transition-all hover:-translate-y-0.5 hover:border-[var(--brass)] hover:bg-[var(--surface-2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brass)] focus-visible:ring-offset-2 sm:left-5"
        >
          <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
        </button>
      )}

      <PageHeader
        onBack={() => router.back()}
        registeredLabel={null}
        deadlineText={null}
      />

      <main className="mx-auto max-w-6xl px-3 pb-8 pt-4 sm:px-5 sm:pb-10 sm:pt-5 overflow-visible">
        <ScrollingNotice />

        <AnimatePresence initial={false}>
          {notice && (
            <motion.div
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className={`mb-3 flex items-start gap-2 rounded-md border px-3 py-2 text-[12px] ${notice.tone === 'ok' ? toneClasses.ok : toneClasses.bad
                }`}
            >
              {notice.tone === 'ok' ? (
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              )}
              <p className="flex-1 leading-5 font-medium">{notice.message}</p>
              <button
                type="button"
                onClick={() => setNotice(null)}
                aria-label="Dismiss"
                className={`shrink-0 rounded p-0.5 ${focusRing}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats — plain inline text strip */}
        <div className={`${panel} mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2 text-[12px] text-[var(--ink-3)]`}>
          <span>Weeks <span className="font-semibold text-[var(--ink)]">{summaryStats.weeks}</span></span>
          <span className="text-[var(--line-strong)]">·</span>
          <span>Days <span className="font-semibold text-[var(--ink)]">{summaryStats.days}</span></span>
          <span className="text-[var(--line-strong)]">·</span>
          <span>Registered <span className="font-semibold text-[var(--ok)]">{summaryStats.registered}</span></span>
          <span className="text-[var(--line-strong)]">·</span>
          <span>Open <span className="font-semibold text-[var(--ok)]">{summaryStats.open}</span></span>
          <span className="text-[var(--line-strong)]">·</span>
          <span>Full <span className="font-semibold text-[var(--bad)]">{summaryStats.full}</span></span>
          <span className="text-[var(--line-strong)]">·</span>
          <span>Closed <span className="font-semibold text-[var(--warn)]">{summaryStats.closed}</span></span>
        </div>

        {registeredDays.length > 0 && (
          <YourRegistrationBanner
            days={registeredDays}
            weeks={registeredWeeks}
            userAttendance={data?.userAttendance || []}
            onUnregisterRequest={(dayId) => {
              const day = allDays.find((d) => d.id === dayId);
              if (day) {
                askUnregister(day);
              }
            }}
          />
        )}

        <UnregisteredStudentsList
          studentsByRegistrationCount={data?.studentsByRegistrationCount ?? { zero: [], one: [], two: [] }}
          totalWeeks={weeks.length}
          totalDays={allDays.length}
          onStudentClick={handleStudentClick}
        />

        {weeks.length > 0 && (
          <ParticipantSearch
            search={participantSearch}
            results={participantSearchResults}
            onSearchChange={setParticipantSearch}
            onClear={() => setParticipantSearch('')}
            onSelect={handleParticipantSearchSelect}
          />
        )}

        {weeks.length === 0 ? (
          <div className={`${panel} px-4 py-12 text-center`}>
            <Calendar className="mx-auto h-6 w-6 text-[var(--ink-4)]" />
            <h2 className="mt-2 text-[14px] font-semibold text-[var(--ink)]">
              No cleaning weeks published
            </h2>
            <p className="mx-auto mt-1 max-w-sm text-[12px] leading-5 text-[var(--ink-3)]">
              When your administrator publishes a schedule, the available days
              will appear here.
            </p>
          </div>
        ) : (
          <>
            <WeekFilterChips
              filter={weekFilter}
              setFilter={setWeekFilter}
              weeks={weeks}
            />

            {filteredDays.length === 0 ? (
              <div className={`${panel} px-4 py-10 text-center`}>
                <Calendar className="mx-auto h-5 w-5 text-[var(--ink-4)]" />
                <p className="mt-2 text-[13px] font-semibold text-[var(--ink)]">
                  No days match this filter
                </p>
                <button
                  type="button"
                  onClick={() => setWeekFilter({ kind: 'all' })}
                  className={`${btnQuiet} mt-2.5`}
                >
                  Show all days
                </button>
              </div>
            ) : (
              <div
                id="cleaning-grid"
                className="grid grid-cols-1 gap-3 overflow-visible sm:grid-cols-2 lg:grid-cols-3"
              >
                {filteredDays.map(({ day, week }) => {
                  const isSelf = registeredDays.some((d) => d.id === day.id);
                  const registerable = canRegister(day, week);
                  const switchable = canSwitch(day, week);
                  const busy = pendingDayId === day.id;

                  return (
                    <div
                      key={day.id}
                      id={`cleaning-day-${day.id}`}
                      className="scroll-mt-20 overflow-visible"
                    >
                      <DayCard
                        day={day}
                        week={{
                          id: week.id,
                          weekLabel: week.weekLabel,
                          registrationDeadline: week.registrationDeadline,
                          isActive: week.isActive,
                        }}
                        isSelf={isSelf}
                        registerable={registerable}
                        switchable={switchable}
                        unavailableText={unavailableReason(day, week)}
                        busy={busy}
                        canMarkAttendance={canMarkAttendance}
                        onRegister={() => askRegister(day)}
                        onSwitchSelect={handleSwitchSelect}
                        currentUserId={data?.user?.id}
                        activeMenu={activeMenu}
                        setActiveMenu={setActiveMenu}
                        onMarkAttendance={handleMarkAttendance}
                        hasMultipleRegistrations={registeredDays.length > 0}
                        registeredDays={registeredDays}
                        weeks={weeks}
                        studentRegistrationCounts={studentRegistrationCounts}
                        onStudentClick={handleStudentClick}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {weeks.length > 0 && (
          <div className="mt-4 rounded-md border-l-2 border-[var(--brass)] bg-[var(--brass-soft)] px-3 py-2">
            <p className="text-[12px] leading-5 text-[var(--ink-2)]">
              Choose a day you can genuinely attend. You may switch while
              registration is open if another day still has space.
            </p>
          </div>
        )}

        <section className={`${panel} mt-4 overflow-hidden`}>
          <div className="border-b border-[var(--line)] px-3.5 py-2.5">
            <h2 className="text-[13px] font-semibold text-[var(--ink)]">
              Community cleaning, recorded
            </h2>
            <p className="mt-0.5 text-[11.5px] text-[var(--ink-4)]">
              See what to expect during a community cleaning session.
            </p>
          </div>
          <video
            className="block aspect-video w-full bg-[var(--ink)] object-cover"
            controls
            playsInline
            preload="metadata"
            aria-label="Community cleaning activities"
          >
            <source src="/cleaning.mp4" type="video/mp4" />
            Your browser does not support embedded video.
          </video>
        </section>
      </main>

      <ConfirmDialog
        state={confirm}
        onClose={() => setConfirm(null)}
        pending={
          registerMutation.isPending ||
          changeRegistrationMutation.isPending ||
          unregisterMutation.isPending
        }
      />

      <StudentDaysModal
        isOpen={studentDaysModal !== null}
        onClose={() => setStudentDaysModal(null)}
        studentName={studentDaysModal?.studentName ?? ''}
        days={studentDaysModal?.days ?? []}
      />
    </Shell>
  );
}