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
} from 'lucide-react';

import {
  useStudentCleaningData,
  useStudentCleaningStatus,
  useRegisterForCleaning,
  useChangeRegistration,
  useMarkAttendance,
  formatDate,
  isDayPast,
  type CleaningDay,
  type UnregisteredStudent,
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
        className={`relative shrink-0 overflow-hidden border rounded-full ${
          isSelf ? 'border-[var(--brass)]' : 'border-[var(--line)]'
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
                onClick={() => state.onConfirm()}
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
  day,
  weekLabel,
  status,
  deadlineText,
  onSwitchRequest,
}: {
  day: CleaningDay;
  weekLabel: string;
  status: string;
  deadlineText: string | null;
  onSwitchRequest: () => void;
}) {
  const tone: StatusTone =
    status === 'ATTENDED' ? 'ok' : status === 'NO_SHOW' ? 'bad' : 'warn';

  return (
    <motion.section
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 overflow-hidden rounded-xl border border-[var(--brass)]/40 bg-gradient-to-r from-[var(--brass-soft)] to-[var(--surface)] shadow-[0_2px_8px_rgba(185,138,62,0.08)]"
    >
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--brass)]/15 text-[var(--brass)]">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--brass)]">
              You&apos;re registered
            </p>
            <p className="mt-0.5 text-[16px] font-semibold text-[var(--ink)]">
              {day.dayOfWeek}, {formatDate(day.cleaningDate)}
            </p>
            <p className="mt-0.5 text-[12.5px] text-[var(--ink-3)]">
              {weekLabel}
              {deadlineText && (
                <>
                  <span className="mx-1.5 text-[var(--ink-4)]">·</span>
                  {deadlineText}
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Tag tone={tone}>{status.toLowerCase().replace('_', ' ')}</Tag>
          <button type="button" onClick={onSwitchRequest} className={btnQuiet}>
            Switch day
          </button>
        </div>
      </div>
    </motion.section>
  );
}

// =========================================================
// WEEK FILTER CHIPS
// =========================================================

type WeekFilter = { kind: 'all' } | { kind: 'week'; index: 0 | 1 | 2 };

function WeekFilterChips({
  filter,
  setFilter,
  availableWeeks,
}: {
  filter: WeekFilter;
  setFilter: (f: WeekFilter) => void;
  availableWeeks: number;
}) {
  const isSelected = (target: WeekFilter) => {
    if (target.kind !== filter.kind) return false;
    if (target.kind === 'week' && filter.kind === 'week')
      return target.index === filter.index;
    return true;
  };

  const chipBase =
    'inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold rounded-md border transition-colors';
  const chipOn = 'bg-[var(--ink)] border-[var(--ink)] text-white';
  const chipOff =
    'bg-[var(--surface)] border-[var(--line)] text-[var(--ink-2)] hover:border-[var(--brass)] hover:text-[var(--ink)]';

  const options: { label: string; value: WeekFilter; enabled: boolean }[] = [
    { label: 'All', value: { kind: 'all' }, enabled: true },
    {
      label: 'First week',
      value: { kind: 'week', index: 0 },
      enabled: availableWeeks > 0,
    },
    {
      label: 'Second week',
      value: { kind: 'week', index: 1 },
      enabled: availableWeeks > 1,
    },
    {
      label: 'Third week',
      value: { kind: 'week', index: 2 },
      enabled: availableWeeks > 2,
    },
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
          className={`${chipBase} ${
            isSelected(opt.value) ? chipOn : chipOff
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
  onSwitch,
  onOpenParticipants,
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
  onSwitch: () => void;
  onOpenParticipants: () => void;
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
      className={`group relative flex flex-col overflow-hidden rounded-xl border bg-[var(--surface)] transition-all ${
        isSelf
          ? 'border-[var(--brass)] shadow-[0_4px_16px_rgba(185,138,62,0.15)]'
          : 'border-[var(--line)] shadow-[0_1px_2px_rgba(18,32,59,0.03)] hover:border-[var(--brass)]/50 hover:shadow-[0_4px_16px_rgba(18,32,59,0.06)]'
      }`}
    >
      {/* HEADER */}
      <div
        className={`flex items-start justify-between gap-2 border-b border-[var(--line)] px-4 py-3 ${
          isSelf ? 'bg-[var(--brass-soft)]' : 'bg-[var(--surface-2)]'
        }`}
      >
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold tracking-tight text-[var(--ink)]">
            {day.dayOfWeek}
          </p>
          <p className="mt-0.5 text-[11.5px] font-medium text-[var(--ink-3)]">
            {formatDate(day.cleaningDate)}
          </p>

          {/* WEEK LABEL BADGE — tells the user which week this day belongs to */}
          <span
            className="mt-1.5 inline-flex items-center gap-1 rounded-md border border-[var(--line)] bg-[var(--surface)] px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]"
            title={`Part of ${week.weekLabel}`}
          >
            <Calendar className="h-2.5 w-2.5 text-[var(--brass)]" />
            {week.weekLabel}
          </span>
          <p className="mt-1.5 text-[11px] font-medium text-[var(--ink-3)]">
            {deadlineLabel(week.registrationDeadline)}
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.06em] rounded-md ${toneClasses[statusTone]}`}
        >
          {isSelf && <CheckCircle className="h-3 w-3" />}
          {statusLabel}
        </span>
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

        <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-2)] overflow-hidden">
          <div className="flex items-center justify-between gap-2 border-b border-[var(--line)] px-3 py-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--ink-3)]">
              Participants
              {day.registrations.length > 0 && (
                <span className="ml-1.5 text-[var(--ink-4)]">
                  ({day.registrations.length})
                </span>
              )}
            </span>

            {canMarkAttendance && day.registrations.length > 0 && (
              <button
                type="button"
                onClick={onOpenParticipants}
                className={`inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--brass)] hover:text-[var(--brand)] underline decoration-1 underline-offset-2 rounded ${focusRing}`}
                aria-label={`Mark attendance for ${day.dayOfWeek}`}
              >
                <ClipboardCheck className="h-3 w-3" />
                Mark attendance
              </button>
            )}
          </div>

          {day.registrations.length === 0 ? (
            <div className="px-3 py-3 text-[12px] text-[var(--ink-4)]">
              No participants yet
            </div>
          ) : (
            <ul className="divide-y divide-[var(--line)]">
              {allParticipants.map((reg) => (
                <li
                  key={reg.id}
                  className="flex items-center gap-2.5 px-3 py-2"
                >
                  <Avatar
                    firstName={reg.user.firstName}
                    lastName={reg.user.lastName}
                    src={reg.user.profileImageUrl}
                    size={28}
                  />
                  <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-[var(--ink)]">
                    {reg.user.firstName} {reg.user.lastName}
                  </span>
                </li>
              ))}
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
          ) : registerable ? (
            <button
              type="button"
              onClick={onRegister}
              disabled={busy}
              className="w-full rounded-md bg-[var(--brass)] px-3 py-2.5 text-[12px] font-bold uppercase tracking-[0.06em] text-white transition-colors hover:bg-[var(--brass-hover)] disabled:opacity-50"
            >
              {busy ? 'Registering…' : 'Register'}
            </button>
          ) : switchable ? (
            <button
              type="button"
              onClick={onSwitch}
              disabled={busy}
              className="w-full rounded-md bg-[var(--brand)] px-3 py-2.5 text-[12px] font-bold uppercase tracking-[0.06em] text-white transition-colors hover:bg-[var(--brand-hover)] disabled:opacity-50"
            >
              {busy ? 'Switching…' : 'Switch here'}
            </button>
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

function ParticipantsDrawer({
  day,
  weekLabel,
  currentUserId,
  onClose,
  onMarkAttendance,
}: {
  day: CleaningDay | null;
  weekLabel: string;
  currentUserId?: string;
  onClose: () => void;
  onMarkAttendance: (
    userId: string,
    dayId: string,
    status: 'ATTENDED' | 'NO_SHOW' | 'PENDING',
  ) => void;
}) {
  useEffect(() => {
    if (!day) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [day, onClose]);

  return (
    <AnimatePresence>
      {day && (
        <div className="fixed inset-0 z-[55] flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-[var(--ink)]/45"
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="participants-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex h-full w-full max-w-md flex-col border-l border-[var(--line)] bg-[var(--surface)] shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] bg-[var(--surface-2)] px-5 py-4">
              <div className="min-w-0">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--brass)]">
                  Mark attendance
                </p>
                <h2
                  id="participants-title"
                  className="mt-0.5 text-[17px] font-semibold text-[var(--ink)]"
                >
                  {day.dayOfWeek}, {formatDate(day.cleaningDate)}
                </h2>
                <p className="mt-0.5 text-[12px] text-[var(--ink-3)]">
                  {weekLabel}
                  <span className="mx-1.5 text-[var(--ink-4)]">·</span>
                  {day.currentRegistrations}/{day.capacityLimit} registered
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close participants"
                className={`inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-2)] transition-colors hover:border-[var(--brass)] hover:text-[var(--ink)] ${focusRing}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {day.registrations.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
                  <Users className="h-8 w-8 text-[var(--ink-4)]" />
                  <p className="text-[14px] font-semibold text-[var(--ink)]">
                    No participants yet
                  </p>
                  <p className="text-[12.5px] text-[var(--ink-3)]">
                    There is no one to mark attendance for on this day.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-[var(--line)]">
                  {day.registrations.map((reg) => {
                    const attendance = (
                      day.attendanceRecords as AttendanceRecord[] | undefined
                    )?.find((r) => r.userId === reg.userId);
                    const isSelf = reg.userId === currentUserId;

                    return (
                      <li key={reg.id} className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          <Avatar
                            firstName={reg.user.firstName}
                            lastName={reg.user.lastName}
                            src={reg.user.profileImageUrl}
                            isSelf={isSelf}
                            size={40}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                              <p className="text-[14px] font-semibold text-[var(--ink)]">
                                {reg.user.firstName} {reg.user.lastName}
                                {isSelf && (
                                  <span className="ml-1.5 text-[11px] font-medium text-[var(--brass)]">
                                    You
                                  </span>
                                )}
                              </p>
                              {attendance?.status && (
                                <span
                                  className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded ${
                                    attendance.status === 'ATTENDED'
                                      ? 'bg-[var(--ok-soft)] text-[var(--ok)]'
                                      : attendance.status === 'NO_SHOW'
                                        ? 'bg-[var(--bad-soft)] text-[var(--bad)]'
                                        : 'bg-[var(--warn-soft)] text-[var(--warn)]'
                                  }`}
                                >
                                  {attendance.status.replace('_', ' ')}
                                </span>
                              )}
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  onMarkAttendance(
                                    reg.userId,
                                    day.id,
                                    'ATTENDED',
                                  )
                                }
                                aria-pressed={attendance?.status === 'ATTENDED'}
                                className={`border border-[var(--ok)]/30 px-3 py-1.5 text-[11.5px] font-semibold rounded-md ${focusRing} ${
                                  attendance?.status === 'ATTENDED'
                                    ? 'bg-[var(--ok)] text-white'
                                    : 'bg-[var(--ok-soft)] text-[var(--ok)] hover:bg-[var(--ok-soft)]/70'
                                }`}
                              >
                                Attended
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  onMarkAttendance(reg.userId, day.id, 'NO_SHOW')
                                }
                                aria-pressed={attendance?.status === 'NO_SHOW'}
                                className={`border border-[var(--bad)]/30 px-3 py-1.5 text-[11.5px] font-semibold rounded-md ${focusRing} ${
                                  attendance?.status === 'NO_SHOW'
                                    ? 'bg-[var(--bad)] text-white'
                                    : 'bg-[var(--bad-soft)] text-[var(--bad)] hover:bg-[var(--bad-soft)]/70'
                                }`}
                              >
                                No Show
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  onMarkAttendance(reg.userId, day.id, 'PENDING')
                                }
                                aria-pressed={attendance?.status === 'PENDING'}
                                className={`border border-[var(--warn)]/30 px-3 py-1.5 text-[11.5px] font-semibold rounded-md ${focusRing} ${
                                  attendance?.status === 'PENDING'
                                    ? 'bg-[var(--warn)] text-white'
                                    : 'bg-[var(--warn-soft)] text-[var(--warn)] hover:bg-[var(--warn-soft)]/70'
                                }`}
                              >
                                Pending
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="border-t border-[var(--line)] bg-[var(--surface-2)] px-5 py-3">
              <button
                type="button"
                onClick={onClose}
                className={`${btnQuiet} w-full`}
              >
                Done
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

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
}: {
  students: UnregisteredStudent[];
}) {
  if (students.length === 0) {
    return (
      <div className="mb-4 flex items-center gap-2 text-[12.5px] text-[var(--ink-3)]">
        <CheckCircle className="h-4 w-4 text-[var(--ok)]" />
        <span className="font-medium">
          Every student is registered for a cleaning day.
        </span>
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
  const [openDrawerDayId, setOpenDrawerDayId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useStudentCleaningData();
  const { data: statusData, refetch: refetchStatus } =
    useStudentCleaningStatus();
  const registerMutation = useRegisterForCleaning();
  const changeRegistrationMutation = useChangeRegistration();
  const markAttendanceMutation = useMarkAttendance();

  const weeks = useMemo(() => data?.weeks ?? [], [data]);
  const allDays = useMemo(() => weeks.flatMap((week) => week.days), [weeks]);

  const registeredDay = useMemo(
    () =>
      allDays.find((day) => day.id === data?.registration?.cleaningDayId) ??
      null,
    [allDays, data?.registration?.cleaningDayId],
  );

  const registeredWeek = useMemo(
    () =>
      weeks.find((week) =>
        week.days.some((day) => day.id === data?.registration?.cleaningDayId),
      ) ?? null,
    [weeks, data?.registration?.cleaningDayId],
  );

  const openDrawerDay = useMemo(
    () => allDays.find((d) => d.id === openDrawerDayId) ?? null,
    [allDays, openDrawerDayId],
  );

  const openDrawerWeekLabel = useMemo(() => {
    if (!openDrawerDay) return '';
    const week = weeks.find((w) =>
      w.days.some((d) => d.id === openDrawerDay.id),
    );
    return week?.weekLabel ?? '';
  }, [openDrawerDay, weeks]);

  const filteredDays = useMemo(() => {
    if (weekFilter.kind === 'all') {
      return weeks.flatMap((week) => week.days.map((day) => ({ day, week })));
    }
    const week = weeks[weekFilter.index];
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
      setConfirm(null);
      flash(
        'ok',
        result.message ?? 'You are registered for this cleaning day.',
      );
      await Promise.all([refetch(), refetchStatus()]);
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Registration failed';
      const lower = raw.toLowerCase();
      setConfirm(null);
      if (lower.includes('already registered')) {
        flash(
          'bad',
          'You already have a registration. Use "Switch here" on another open day instead.',
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

  const runChange = async (newDayId: string) => {
    setPendingDayId(newDayId);
    setConfirm(null);
    try {
      const result = await changeRegistrationMutation.mutateAsync({
        newDayId,
      });
      const newDay = allDays.find((day) => day.id === newDayId);
      flash(
        'ok',
        result.message ??
          `Your registration moved to ${
            newDay?.dayOfWeek ?? 'the selected day'
          }.`,
      );
      await Promise.all([refetch(), refetchStatus()]);
    } catch (err: unknown) {
      setConfirm(null);
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
    });

  const askChange = (day: CleaningDay, weekLabel: string) =>
    setConfirm({
      title: `Switch to ${day.dayOfWeek}?`,
      body: `Your registration moves from ${
        registeredDay?.dayOfWeek ?? 'your current day'
      } to ${day.dayOfWeek}, ${formatDate(day.cleaningDate)} (${weekLabel}).`,
      confirmLabel: 'Switch day',
      onConfirm: () => runChange(day.id),
    });

  const isAtMinimumThreshold = (day: CleaningDay) =>
    day.currentRegistrations === 4;

  const canRegister = (
    day: CleaningDay,
    week: { registrationDeadline: string; isActive: boolean },
  ) =>
    !data?.registration &&
    week.isActive &&
    day.status === 'OPEN';

  const canSwitch = (
    day: CleaningDay,
    week: { registrationDeadline: string; isActive: boolean },
  ) => {
    const currentDayAtMinimum =
      registeredDay && isAtMinimumThreshold(registeredDay);

    return Boolean(
      data?.registration &&
        day.id !== data?.registration?.cleaningDayId &&
        week.isActive &&
        day.status === 'OPEN' &&
        !currentDayAtMinimum,
    );
  };

  const unavailableReason = (
    day: CleaningDay,
    week: { registrationDeadline: string; isActive: boolean },
  ) => {
    const currentDayAtMinimum =
      registeredDay && isAtMinimumThreshold(registeredDay);
    if (currentDayAtMinimum && day.id !== data?.registration?.cleaningDayId)
      return 'Current day at minimum';
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

  const registeredLabel = registeredDay
    ? `Registered for ${registeredDay.dayOfWeek}, ${formatDate(
        registeredDay.cleaningDate,
      )}`
    : null;

  const activeWeek = weeks.find((week) => week.isActive);

  const deadlineText = registeredWeek
    ? deadlineLabel(registeredWeek.registrationDeadline)
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
        registeredLabel={registeredLabel}
        deadlineText={deadlineText}
      />

      <main className="mx-auto max-w-5xl px-4 pt-6 pb-10 sm:px-6 sm:pt-8 sm:pb-12">
        <ScrollingNotice />

        <AnimatePresence initial={false}>
          {notice && (
            <motion.div
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className={`mb-4 flex items-start gap-2.5 border px-3.5 py-3 text-[13px] rounded-md ${
                notice.tone === 'ok' ? toneClasses.ok : toneClasses.bad
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

        {registeredDay && registeredWeek && statusData?.registration && (
          <YourRegistrationBanner
            day={registeredDay}
            weekLabel={registeredWeek.weekLabel}
            status={statusData.registration.status ?? 'PENDING'}
            deadlineText={deadlineText}
            onSwitchRequest={() => {
              setWeekFilter({ kind: 'all' });
              window.setTimeout(() => {
                document
                  .getElementById('cleaning-grid')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 50);
            }}
          />
        )}

        <UnregisteredStudentsList students={data?.unregisteredStudents ?? []} />

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
              availableWeeks={weeks.length}
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
                className="grid gap-3.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              >
                {filteredDays.map(({ day, week }) => {
                  const isSelf =
                    day.id === data?.registration?.cleaningDayId;
                  const registerable = canRegister(day, week);
                  const switchable = canSwitch(day, week);
                  const busy = pendingDayId === day.id;

                  return (
                    <div
                      key={day.id}
                      id={`cleaning-day-${day.id}`}
                      className="scroll-mt-24"
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
                        onSwitch={() => askChange(day, week.weekLabel)}
                        onOpenParticipants={() =>
                          setOpenDrawerDayId(day.id)
                        }
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

        <section className={`${panel} mt-5 overflow-hidden`}>
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

      <ParticipantsDrawer
        day={openDrawerDay}
        weekLabel={openDrawerWeekLabel}
        currentUserId={data?.user?.id}
        onClose={() => setOpenDrawerDayId(null)}
        onMarkAttendance={handleMarkAttendance}
      />

      <ConfirmDialog
        state={confirm}
        onClose={() => setConfirm(null)}
        pending={
          registerMutation.isPending || changeRegistrationMutation.isPending
        }
      />
    </Shell>
  );
}