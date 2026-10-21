// app/dashboard/cleaning/page.tsx
// Cleaning Schedule — Card Grid (Pattern A)
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
  ClipboardCheck,
  Loader2,
  Search,
  User,
  Users,
  X,
  MapPin,
  Filter,
  MoreVertical,
  UserCheck,
  UserX,
  Hourglass,
  Trash2,
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
  type Week as WeekType,
} from '@/hooks/useCleaningStudent';

// =========================================================
// DESIGN TOKENS
// =========================================================

const TOKENS = `
  [data-cleaning-scope] {
    --ink: #12203B;
    --ink-2: #3D4A61;
    --ink-3: #4B5646;
    --ink-4: #6B7280;

    --surface: #FFFFFF;
    --surface-2: #F7F6F2;
    --surface-3: #EDECE6;

    --line: #DADCD3;
    --line-strong: #C8CABF;

    --brand: #12203B;
    --brand-hover: #1C2E4E;
    --brand-soft: #F0F0EB;

    --brass: #B98A3E;
    --brass-hover: #A67A34;
    --brass-soft: #F8F3E8;

    --ok: #2F6B45;
    --ok-soft: #E6F1EA;

    --warn: #6E5520;
    --warn-soft: #F8F1E0;

    --bad: #8B3A24;
    --bad-soft: #FBE9E3;

    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum' 1, 'cv05' 1;
  }
`;

const focusRing =
  'outline-none focus-visible:ring-2 focus-visible:ring-[var(--brass)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]';

const panel =
  'border border-[var(--line)] bg-[var(--surface)] rounded-lg shadow-[0_1px_2px_rgba(18,32,59,0.03)]';

const btnBase = `inline-flex items-center justify-center gap-2 px-3.5 py-2 text-[12px] font-mono font-semibold uppercase tracking-[0.06em] transition-colors disabled:cursor-not-allowed disabled:opacity-45 rounded-md ${focusRing}`;

const btnPrimary = `${btnBase} bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)]`;
const btnQuiet = `${btnBase} border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-2)] hover:border-[var(--brass)] hover:text-[var(--ink)]`;

// =========================================================
// HELPERS
// =========================================================

const getInitials = (firstName: string, lastName: string) =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

const daysUntil = (iso: string) => {
  const target = new Date(iso).getTime();
  const now = Date.now();
  return Math.ceil((target - now) / 86_400_000);
};

const deadlineLabel = (iso: string) => {
  return daysUntil(iso) < 0
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
      className={`inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] rounded-md ${toneClasses[tone]}`}
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
        className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${isOpen
          ? 'border-slate-300 bg-slate-100 text-slate-900'
          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800'
          }`}
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-[calc(100%+8px)] z-[9999] w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
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
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100">
        {icon}
      </span>
      <span className="flex-1">{children}</span>
    </button>
  );
}

function MenuDivider() {
  return <div className="my-1.5 h-px bg-slate-100" />;
}

// =========================================================
// SWITCH DROPDOWN
// =========================================================

function SwitchDropdown({
  menuId,
  activeMenu,
  setActiveMenu,
  registeredDays,
  weeks,
  onSelect,
}: {
  menuId: string;
  activeMenu: MenuType;
  setActiveMenu: (menu: MenuType) => void;
  registeredDays: CleaningDay[];
  weeks: WeekType[];
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
    <div ref={menuRef} className="relative shrink-0 w-full">
      <button
        type="button"
        onClick={() => setActiveMenu(isOpen ? null : (menuId as MenuType))}
        aria-label="Switch from registered day"
        aria-expanded={isOpen}
        className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] rounded-md border transition-colors ${isOpen
          ? 'border-[var(--brass)] bg-[var(--brass-soft)] text-[var(--brass)]'
          : 'border-[var(--line)] bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)]'
          }`}
      >
        <ArrowRightLeft className="h-3.5 w-3.5" />
        Switch
        <ChevronDown className={`h-3 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-[calc(100%+8px)] z-[9999] w-64 overflow-hidden rounded-xl border border-[var(--line)] bg-white p-1.5 shadow-xl"
          >
            <div className="px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-3)]">
                Switch from
              </p>
            </div>
            {registeredDays.map((day) => {
              const week = weeks.find((w) => w.days.some((d) => d.id === day.id));
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => {
                    onSelect(day.id, menuId.replace('switch-', ''));
                    setActiveMenu(null);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--surface-2)]"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--brand-soft)] text-[var(--brand)]">
                    <Calendar className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-[var(--ink)]">
                      {day.dayOfWeek}
                    </p>
                    <p className="truncate text-[11px] text-[var(--ink-3)]">
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
  size = 40,
}: {
  firstName: string;
  lastName: string;
  src?: string | null;
  isSelf?: boolean;
  size?: number;
}) {
  return (
    <div className="relative shrink-0">
      <div
        className={`relative shrink-0 overflow-hidden border rounded-full ${isSelf ? 'border-[var(--brass)]' : 'border-[var(--line)]'
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
            className="flex h-full w-full items-center justify-center font-mono font-semibold tracking-wide text-white"
            style={{ fontSize: size * 0.32 }}
          >
            {getInitials(firstName, lastName)}
          </span>
        )}
        {isSelf && (
          <span className="absolute inset-0 border-2 border-[var(--brass)] rounded-full" />
        )}
      </div>
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
            className="absolute inset-0 bg-[var(--ink)]/45"
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
            className="relative w-full max-w-md border border-[var(--line)] bg-[var(--surface)] p-6 rounded-xl shadow-xl"
          >
            <h2
              id="confirm-title"
              className="text-[17px] font-semibold text-[var(--ink)]"
            >
              {state.title}
            </h2>
            <p
              id="confirm-body"
              className="mt-2 text-[14px] leading-6 text-[var(--ink-3)]"
            >
              {state.body}
            </p>
            <div className="mt-6 flex justify-end gap-2">
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
                {pending && <Loader2 className="h-4 w-4 animate-spin" />}
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
// PAGE HEADER — NON-STICKY
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
      <div className="mx-auto max-w-5xl px-4 py-3.5 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              type="button"
              onClick={onBack}
              className={`${btnQuiet} h-9 w-9 px-0 rounded-md`}
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-[17px] font-semibold tracking-tight text-[var(--ink)] sm:text-[18px]">
                Cleaning Schedule
              </h1>
              <p className="mt-0.5 truncate text-[12.5px] leading-4 text-[var(--ink-3)]">
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
          <nav className="hidden items-center gap-1.5 sm:flex">
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
    <div className="mb-4 overflow-hidden border border-[var(--line)] bg-[var(--brand)] text-white rounded-lg">
      <div className="flex h-10 items-center overflow-hidden">
        <div className="shrink-0 border-r border-white/20 px-3.5 sm:px-4">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white">
            Important
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
                className="mx-6 font-mono text-[11.5px] font-medium tracking-[0.01em] text-white"
              >
                {message}
                <span className="ml-6 text-[var(--brass)]">•</span>
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
  userAttendance: any[];
  onUnregisterRequest: (dayId: string) => void;
}) {
  const getAttendanceStatus = (dayId: string) => {
    const attendance = userAttendance.find((a) => a.cleaningDay.id === dayId);
    return attendance?.status || 'PENDING';
  };

  const tone: StatusTone = 'ok';

  return (
    <motion.section
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 overflow-hidden rounded-xl border border-[var(--brass)]/40 bg-gradient-to-r from-[var(--brass-soft)] to-[var(--surface)] shadow-[0_2px_8px_rgba(185,138,62,0.08)]"
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-3.5 mb-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--brass)]/15 text-[var(--brass)]">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--brass)]">
              {days.length === 1 ? "You're registered" : `You have ${days.length} registrations`}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {days.map((day, index) => {
            const week = weeks.find((w) => w.days.some((d) => d.id === day.id));
            const status = getAttendanceStatus(day.id);

            return (
              <div
                key={day.id}
                className="flex items-center justify-between gap-3 rounded-lg bg-white/50 p-3 border border-[var(--brass)]/20"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-[var(--ink)]">
                    {day.dayOfWeek}, {formatDate(day.cleaningDate)}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-[var(--ink-3)]">
                    {week?.weekLabel}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Tag tone={status === 'ATTENDED' ? 'ok' : status === 'NO_SHOW' ? 'bad' : 'warn'}>
                    {status.toLowerCase().replace('_', ' ')}
                  </Tag>
                  <button
                    type="button"
                    onClick={() => onUnregisterRequest(day.id)}
                    className={`${btnQuiet} text-red-600 hover:text-red-700 hover:border-red-300`}
                    title="Unregister from this day"
                  >
                    Unregister
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {days.length < 2 && (
          <div className="mt-3 text-center">
            <p className="text-[11.5px] text-[var(--ink-3)]">
              You can register for up to 2 cleaning days
            </p>
          </div>
        )}
      </div>
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
    'inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold rounded-md border transition-colors';
  const chipOn = 'bg-[var(--ink)] border-[var(--ink)] text-white';
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
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <div className="mr-1 flex items-center gap-1.5 text-[var(--ink-3)]">
        <Filter className="h-3.5 w-3.5" />
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.1em]">
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
// CAPACITY BAR
// =========================================================

function CapacityBar({ current, limit }: { current: number; limit: number }) {
  const pct = limit > 0 ? Math.min(100, (current / limit) * 100) : 0;
  const color =
    pct >= 100 ? 'var(--bad)' : pct >= 80 ? 'var(--warn)' : 'var(--ok)';

  return (
    <div
      className="h-1.5 w-full overflow-hidden bg-[var(--surface-3)] rounded-full"
      role="img"
      aria-label={`${current} of ${limit} places taken`}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
    </div>
  );
}

// =========================================================
// DAY CARD — with week label badge
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
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`group relative flex flex-col overflow-visible rounded-xl border bg-[var(--surface)] transition-all ${isSelf
        ? 'border-[var(--brass)] shadow-[0_4px_16px_rgba(185,138,62,0.15)]'
        : 'border-[var(--line)] shadow-[0_1px_2px_rgba(18,32,59,0.03)] hover:border-[var(--brass)]/50 hover:shadow-[0_4px_16px_rgba(18,32,59,0.06)]'
        }`}
    >
      {/* HEADER */}
      <div
        className={`flex items-start justify-between gap-2 border-b border-[var(--line)] px-4 py-3 ${isSelf ? 'bg-[var(--brass-soft)]' : 'bg-[var(--surface-2)]'
          }`}
      >
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold tracking-tight text-[var(--ink)]">
            {day.dayOfWeek}
          </p>
          <p className="mt-0.5 text-[11.5px] font-medium text-[var(--ink-3)]">
            {formatDate(day.cleaningDate)}
          </p>

          {/* WEEK LABEL + DEADLINE — same row */}
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="text-[11.5px] font-semibold text-[var(--ink-2)]">
              {week.weekLabel}
            </p>
            <p className="shrink-0 text-right text-[10.5px] font-medium text-[var(--ink-3)]">
              {deadlineLabel(week.registrationDeadline)}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-start">
          <span
            className={`inline-flex items-center gap-1.5 border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.06em] rounded-md ${toneClasses[statusTone]}`}
          >
            {isSelf && <CheckCircle className="h-3 w-3" />}
            {statusLabel}
          </span>
        </div>
      </div>

      {/* BODY */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--ink-3)]">
              Capacity
            </span>
            <span className="font-mono text-[13px] font-bold text-[var(--ink)]">
              {day.currentRegistrations}
              <span className="text-[var(--ink-4)]">/{day.capacityLimit}</span>
            </span>
          </div>
          <div className="mt-2">
            <CapacityBar
              current={day.currentRegistrations}
              limit={day.capacityLimit}
            />
          </div>
        </div>

        <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-2)] overflow-visible">
          <div className="flex items-center justify-between gap-2 border-b border-[var(--line)] px-3 py-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--ink-3)]">
              Participants
              {day.registrations.length > 0 && (
                <span className="ml-1.5 text-[var(--ink-4)]">
                  ({day.registrations.length})
                </span>
              )}
            </span>
          </div>

          {day.registrations.length === 0 ? (
            <div className="px-3 py-3 text-[12px] text-[var(--ink-4)]">
              No participants yet
            </div>
          ) : (
            <ul className="divide-y divide-[var(--line)] overflow-visible">
              {allParticipants.map((reg) => {
                const attendance = (
                  day.attendanceRecords as AttendanceRecord[] | undefined
                )?.find((r) => r.userId === reg.userId);
                const isSelf = reg.userId === currentUserId;

                return (
                  <li
                    key={reg.id}
                    className="flex items-center gap-2.5 px-3 py-2 overflow-visible"
                  >
                    <Avatar
                      firstName={reg.user.firstName}
                      lastName={reg.user.lastName}
                      src={reg.user.profileImageUrl}
                      isSelf={isSelf}
                      size={28}
                    />
                    <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-[var(--ink)]">
                      {reg.user.firstName} {reg.user.lastName}
                      {isSelf && (
                        <span className="ml-1.5 text-[10px] font-medium text-[var(--brass)]">
                          (You)
                        </span>
                      )}
                      {attendance?.status && (
                        <span className="ml-1.5 text-[10px] font-medium text-[var(--ink-3)]">
                          - {attendance.status.replace('_', ' ')}
                        </span>
                      )}
                    </span>
                    {canMarkAttendance && (
                      <ActionMenu
                        menuId={`student-${reg.id}`}
                        activeMenu={activeMenu}
                        setActiveMenu={setActiveMenu}
                      >
                        <div className="px-3 py-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Mark attendance
                          </p>
                          <p className="mt-0.5 truncate text-xs font-medium text-slate-600">
                            {reg.user.firstName} {reg.user.lastName}
                          </p>
                        </div>
                        <MenuItem
                          onClick={() => {
                            onMarkAttendance(reg.userId, day.id, 'ATTENDED');
                            setActiveMenu(null);
                          }}
                          icon={<UserCheck className="h-4 w-4 text-emerald-600" />}
                        >
                          Mark attended
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            onMarkAttendance(reg.userId, day.id, 'NO_SHOW');
                            setActiveMenu(null);
                          }}
                          icon={<UserX className="h-4 w-4 text-red-600" />}
                        >
                          Mark no show
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            onMarkAttendance(reg.userId, day.id, 'PENDING');
                            setActiveMenu(null);
                          }}
                          icon={<Hourglass className="h-4 w-4 text-amber-600" />}
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

        <div className="flex items-center gap-1.5 text-[11.5px] text-[var(--ink-3)]">
          <MapPin className="h-3 w-3 shrink-0" />
          <span>Tech Center opens 8:00 AM</span>
        </div>

        <div className="mt-auto pt-2">
          {isSelf ? (
            <div className="flex items-center justify-center gap-1.5 rounded-md bg-[var(--ok-soft)] px-3 py-2 text-[12px] font-bold uppercase tracking-[0.06em] text-[var(--ok)]">
              <CheckCircle className="h-3.5 w-3.5" />
              You&apos;re registered
            </div>
          ) : registerable && switchable ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onRegister}
                disabled={busy}
                className="rounded-md bg-[var(--brass)] px-3 py-2.5 text-[12px] font-bold uppercase tracking-[0.06em] text-white transition-colors hover:bg-[var(--brass-hover)] disabled:opacity-50"
              >
                {busy ? 'Registering…' : 'Register'}
              </button>
              <SwitchDropdown
                menuId={`switch-${day.id}`}
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
                registeredDays={registeredDays}
                weeks={weeks}
                onSelect={onSwitchSelect}
              />
            </div>
          ) : registerable ? (
            <button
              type="button"
              onClick={onRegister}
              disabled={busy}
              className="w-full rounded-md bg-[var(--brass)] px-3 py-2.5 text-[12px] font-bold uppercase tracking-[0.06em] text-white transition-colors hover:bg-[var(--brass-hover)] disabled:opacity-50"
            >
              {busy ? 'Registering…' : hasMultipleRegistrations ? 'Register for another day' : 'Register'}
            </button>
          ) : switchable ? (
            <div className="flex items-center justify-center">
              <SwitchDropdown
                menuId={`switch-${day.id}`}
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
                registeredDays={registeredDays}
                weeks={weeks}
                onSelect={onSwitchSelect}
              />
            </div>
          ) : (
            <div className="text-center text-[11.5px] font-medium text-[var(--ink-4)]">
              {unavailableText}
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}

// =========================================================
// PARTICIPANTS DRAWER
// =========================================================

type AttendanceRecord = {
  userId: string;
  status: string;
};

// =========================================================
// SEARCH RESULT TYPE
// =========================================================

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
    <section className={`${panel} mb-4`}>
      <div className="px-4 py-4 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[var(--brand)] text-white rounded-md">
            <Search className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-[var(--ink)]">
              Find a registered participant
            </h2>
            <p className="mt-0.5 text-[12.5px] text-[var(--ink-3)]">
              Search by student name, cleaning day or date.
            </p>
          </div>
        </div>

        <div className="relative mt-3.5">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-4)]"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="Search student, day or date..."
            aria-label="Search registered participants"
            className={`h-11 w-full border border-[var(--line)] bg-[var(--surface)] pl-10 pr-10 text-[13.5px] text-[var(--ink)] placeholder:text-[var(--ink-4)] rounded-md ${focusRing}`}
          />
          {search && (
            <button
              type="button"
              onClick={onClear}
              aria-label="Clear participant search"
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[var(--ink-4)] hover:text-[var(--ink)] rounded ${focusRing}`}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {search.trim() && (
          <div className="mt-2.5 flex items-center justify-between gap-3">
            <p className="text-[12px] font-medium text-[var(--ink-3)]">
              {results.length}{' '}
              {results.length === 1 ? 'participant' : 'participants'} found
            </p>
            <span className="hidden font-mono text-[10px] uppercase tracking-wide text-[var(--ink-4)] sm:block">
              Client-side search
            </span>
          </div>
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
              <div className="max-h-[380px] overflow-y-auto border-t border-[var(--line)]">
                {results.map((result) => (
                  <button
                    type="button"
                    key={`${result.registrationId}-${result.dayId}`}
                    onClick={() => onSelect(result)}
                    className={`flex w-full items-center gap-3 border-b border-[var(--line)] px-4 py-3 text-left last:border-b-0 hover:bg-[var(--surface-2)] ${focusRing}`}
                  >
                    <Avatar
                      firstName={result.firstName}
                      lastName={result.lastName}
                      src={result.profileImageUrl}
                      size={36}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block break-words text-[13.5px] font-semibold text-[var(--ink)]">
                        {result.firstName} {result.lastName}
                      </span>
                      <span className="mt-0.5 block text-[11.5px] text-[var(--ink-3)]">
                        {result.dayOfWeek}, {formatDate(result.cleaningDate)}
                      </span>
                    </span>
                    <span className="hidden shrink-0 text-[10.5px] uppercase tracking-wide text-[var(--ink-4)] sm:block">
                      {result.weekLabel}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="border-t border-[var(--line)] px-5 py-8 text-center">
                <User className="mx-auto h-5 w-5 text-[var(--ink-4)]" />
                <p className="mt-2 text-[13.5px] font-semibold text-[var(--ink)]">
                  No registered participant found
                </p>
                <p className="mt-1 text-[12px] text-[var(--ink-3)]">
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
// UNREGISTERED STUDENTS — PLAIN TEXT
// =========================================================

function UnregisteredStudentsList({
  students,
  totalWeeks,
  totalDays,
}: {
  students: UnregisteredStudent[];
  totalWeeks: number;
  totalDays: number;
}) {
  if (students.length === 0) {
    return (
      <div className="mb-4">
        <div className="flex items-center gap-2 text-[12.5px] text-[var(--ink-3)]">
          <CheckCircle className="h-4 w-4 text-[var(--ok)]" />
          <span className="font-medium">
            Every student is registered for a cleaning day.
          </span>
        </div>
        <p className="mt-2 text-[12px] text-[var(--ink-3)]">
          Total weeks: {totalWeeks} · Total days: {totalDays}
        </p>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <p className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]">
        Students not yet registered ({students.length})
      </p>
      <p className="text-[13px] leading-6 text-[var(--ink)]">
        {students.map((s) => `${s.firstName} ${s.lastName}`.trim()).join(' · ')}
      </p>
      <p className="mt-2 text-[12px] text-[var(--ink-3)]">
        Total weeks: {totalWeeks} · Total days: {totalDays}
      </p>
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
          className="h-[380px] animate-pulse rounded-xl border border-[var(--line)] bg-[var(--surface)]"
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

  const { data, isLoading, error, refetch } = useStudentCleaningData();
  const { data: statusData, refetch: refetchStatus } =
    useStudentCleaningStatus();
  const registerMutation = useRegisterForCleaning();
  const changeRegistrationMutation = useChangeRegistration();
  const unregisterMutation = useUnregisterFromCleaning();
  const markAttendanceMutation = useMarkAttendance();

  const weeks = useMemo(() => data?.weeks ?? [], [data]);
  const allDays = useMemo(() => weeks.flatMap((week) => week.days), [weeks]);

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
        result.message ?? 'You are registered for this cleaning day.',
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
        result.message ??
        `Your registration moved to ${newDay?.dayOfWeek ?? 'the selected day'
        }.`,
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

  const askUnregister = (day: CleaningDay) =>
    setConfirm({
      title: `Unregister from ${day.dayOfWeek}?`,
      body: `You will be removed from ${day.dayOfWeek}, ${formatDate(day.cleaningDate)}. This action cannot be undone.`,
      confirmLabel: 'Unregister',
      onConfirm: () => runUnregister(day.id),
      immediateClose: true,
    });

  const isAtMinimumThreshold = (day: CleaningDay) =>
    day.currentRegistrations === 4;

  const canRegister = (
    day: CleaningDay,
    week: { registrationDeadline: string; isActive: boolean },
  ) =>
    (!data?.registrations || data.registrations.length < 2) &&
    !registeredDays.some((d) => d.id === day.id) &&
    week.isActive &&
    day.status === 'OPEN';

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
      !currentDayAtMinimum,
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
    if (daysUntil(week.registrationDeadline) < 0) return 'Deadline passed';
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
        <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
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
        <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
          <ScrollingNotice />
          <div className={`${panel} p-5`}>
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--bad)]" />
              <div>
                <h2 className="text-[15.5px] font-semibold text-[var(--ink)]">
                  The schedule could not be loaded
                </h2>
                <p className="mt-1 max-w-prose text-[13.5px] leading-6 text-[var(--ink-3)]">
                  {(error as Error)?.message ?? 'An unexpected error occurred.'}
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className={`${btnPrimary} mt-3`}
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
          className="fixed bottom-5 left-3 z-40 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--ink)] shadow-md transition-all hover:-translate-y-0.5 hover:border-[var(--brass)] hover:bg-[var(--surface-2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brass)] focus-visible:ring-offset-2 sm:left-5"
        >
          <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
        </button>
      )}

      <PageHeader
        onBack={() => router.back()}
        registeredLabel={null}
        deadlineText={null}
      />

      <main className="mx-auto max-w-5xl px-4 pt-6 pb-10 sm:px-6 sm:pt-8 sm:pb-12 overflow-visible">
        <ScrollingNotice />

        <AnimatePresence initial={false}>
          {notice && (
            <motion.div
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className={`mb-4 flex items-start gap-2.5 border px-3.5 py-3 text-[13px] rounded-md ${notice.tone === 'ok' ? toneClasses.ok : toneClasses.bad
                }`}
            >
              {notice.tone === 'ok' ? (
                <Check className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <p className="flex-1 leading-5 font-medium">{notice.message}</p>
              <button
                type="button"
                onClick={() => setNotice(null)}
                aria-label="Dismiss"
                className={`shrink-0 p-0.5 rounded ${focusRing}`}
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

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
          students={data?.unregisteredStudents ?? []}
          totalWeeks={weeks.length}
          totalDays={allDays.length}
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
          <div className={`${panel} px-5 py-16 text-center`}>
            <Calendar className="mx-auto h-7 w-7 text-[var(--ink-4)]" />
            <h2 className="mt-3 text-[16px] font-semibold text-[var(--ink)]">
              No cleaning weeks published
            </h2>
            <p className="mx-auto mt-1.5 max-w-sm text-[13.5px] leading-6 text-[var(--ink-3)]">
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
              <div className={`${panel} px-5 py-12 text-center`}>
                <Calendar className="mx-auto h-6 w-6 text-[var(--ink-4)]" />
                <p className="mt-3 text-[14px] font-semibold text-[var(--ink)]">
                  No days match this filter
                </p>
                <button
                  type="button"
                  onClick={() => setWeekFilter({ kind: 'all' })}
                  className={`${btnQuiet} mt-3`}
                >
                  Show all days
                </button>
              </div>
            ) : (
              <div
                id="cleaning-grid"
                className="grid gap-3.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 overflow-visible"
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
                      className="scroll-mt-24 overflow-visible"
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
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {weeks.length > 0 && (
          <div className="mt-5 border-l-2 border-[var(--brass)] bg-[var(--brass-soft)] px-3.5 py-3 rounded-md">
            <p className="text-[12.5px] leading-5 text-[var(--ink-2)] font-medium">
              Choose a day you can genuinely attend. You may switch while
              registration is open if another day still has space.
            </p>
          </div>
        )}

        <section className={`${panel} mt-5 overflow-visible`}>
          <div className="border-b border-[var(--line)] px-4 py-3.5 sm:px-5">
            <h2 className="text-[15px] font-semibold text-[var(--ink)]">
              Community cleaning, recorded
            </h2>
            <p className="mt-0.5 text-[12.5px] text-[var(--ink-3)]">
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
    </Shell>
  );
}