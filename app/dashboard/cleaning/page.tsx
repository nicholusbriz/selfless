// app/dashboard/cleaning/page.tsx
// Public cleaning schedule page for students
//
// Features:
// - Client-side participant search — no database request while searching.
// - Search registered students by first name, last name, full name,
//   cleaning day, or cleaning date.
// - Participant lists start expanded by default.
// - Search results can open the corresponding week.
// - Existing registration, switching, attendance and modal functionality
//   preserved.
// - Professional light institutional theme.
// - Responsive desktop/mobile layout.
// - Accessible controls and focus states.

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
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  Clock,
  Loader2,
  Lock,
  Search,
  User,
  Users,
  X,
  XCircle,
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
} from '@/hooks/useCleaningStudent';

// =========================================================
// Design tokens — ink/brass palette matching the rest of the app
// =========================================================

const TOKENS = `
  [data-cleaning-scope] {
    --ink:        #12203B;
    --ink-2:      #3D4A61;
    --ink-3:      #6B7268;
    --ink-4:      #8A9088;

    --surface:    #FFFFFF;
    --surface-2:  #F7F6F2;
    --surface-3:  #EDECE6;

    --line:       #DADCD3;
    --line-strong:#C8CABF;

    --brand:      #12203B;
    --brand-hover:#1C2E4E;
    --brand-soft: #F0F0EB;

    --brass:      #B98A3E;
    --brass-hover:#A67A34;
    --brass-soft: #F8F3E8;

    --ok:         #55705B;
    --ok-soft:    #EEF3EE;

    --warn:       #8A6E3A;
    --warn-soft:  #F8F4EC;

    --bad:        #A4462F;
    --bad-soft:   #FBF0EC;

    --radius:     0px;
    --radius-sm:  0px;

    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum' 1, 'cv05' 1;
  }
`;

const focusRing =
  'outline-none focus-visible:ring-1 focus-visible:ring-[var(--brass)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--surface)]';

const panel =
  'border border-[var(--line)] bg-[var(--surface)]';

const btnBase = `inline-flex items-center justify-center gap-2 px-3.5 py-2 text-[12px] font-mono font-semibold uppercase tracking-[0.08em] transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${focusRing}`;

const btnPrimary = `${btnBase} bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)]`;

const btnQuiet = `${btnBase} border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-2)] hover:border-[var(--brass)] hover:text-[var(--ink)]`;

// =========================================================
// Helpers
// =========================================================

const getInitials = (firstName: string, lastName: string) =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

const daysUntil = (iso: string) => {
  const target = new Date(iso).getTime();
  const now = Date.now();

  return Math.ceil((target - now) / 86_400_000);
};

const deadlineLabel = (iso: string) => {
  const days = daysUntil(iso);

  if (days < 0) return 'Registration closed';
  if (days === 0) return 'Registration closes today';
  if (days === 1) return 'Registration closes tomorrow';

  return `Registration closes in ${days} days`;
};

type StatusTone = 'ok' | 'warn' | 'bad' | 'neutral';

const toneClasses: Record<StatusTone, string> = {
  ok: 'border-[var(--line)] bg-[var(--ok-soft)] text-[var(--ok)]',
  warn: 'border-[var(--line)] bg-[var(--warn-soft)] text-[var(--warn)]',
  bad: 'border-[var(--line)] bg-[var(--bad-soft)] text-[var(--bad)]',
  neutral:
    'border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-3)]',
};

// =========================================================
// Tag
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
      className={`inline-flex items-center gap-1.5 border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] font-semibold ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}

// =========================================================
// Capacity
// =========================================================

function CapacityMeter({
  current,
  limit,
}: {
  current: number;
  limit: number;
}) {
  const pct = limit > 0 ? Math.min(100, (current / limit) * 100) : 0;

  const tone: StatusTone =
    pct >= 100 ? 'bad' : pct >= 80 ? 'warn' : 'ok';

  return (
    <div className="flex items-center gap-2.5">
      <div
        className="h-1.5 w-16 overflow-hidden bg-[var(--surface-3)]"
        role="img"
        aria-label={`${current} of ${limit} places taken`}
      >
        <motion.div
          className="h-full"
          style={{
            backgroundColor:
              tone === 'bad'
                ? 'var(--bad)'
                : tone === 'warn'
                  ? 'var(--warn)'
                  : 'var(--ok)',
          }}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      <span className="font-mono text-[12px] text-[var(--ink-2)] tabular-nums">
        {current}
        <span className="text-[var(--ink-4)]">/{limit}</span>
      </span>
    </div>
  );
}

// =========================================================
// Avatar
// =========================================================

function Avatar({
  firstName,
  lastName,
  src,
  isSelf,
}: {
  firstName: string;
  lastName: string;
  src?: string | null;
  isSelf?: boolean;
}) {
  return (
    <div className="relative h-8 w-8 shrink-0 overflow-hidden border border-[var(--line)] bg-[var(--brand)]">
      {src ? (
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover grayscale"
          loading="lazy"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-mono text-[11px] font-semibold text-white tracking-wide">
          {getInitials(firstName, lastName)}
        </span>
      )}

      {isSelf && (
        <span className="absolute inset-0 border-2 border-[var(--brass)]" />
      )}
    </div>
  );
}

// =========================================================
// Confirm dialog
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

    node
      ?.querySelector<HTMLElement>('[data-autofocus]')
      ?.focus();

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

      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (
        event.shiftKey &&
        document.activeElement === first
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
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
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-[var(--ink)]/35"
            onClick={() => !pending && onClose()}
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-body"
            initial={{
              opacity: 0,
              y: 12,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 8,
              scale: 0.98,
            }}
            transition={{
              duration: 0.18,
              ease: [0.2, 0, 0, 1],
            }}
            className="relative w-full max-w-sm border border-[var(--line)] bg-[var(--surface)] p-5"
          >
            <h2
              id="confirm-title"
              className="text-base font-semibold text-[var(--ink)]"
            >
              {state.title}
            </h2>

            <p
              id="confirm-body"
              className="mt-2 text-[13px] leading-6 text-[var(--ink-3)]"
            >
              {state.body}
            </p>

            <div className="mt-5 flex justify-end gap-2">
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
                {pending && (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden
                  />
                )}

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
// Header
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
      <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className={`${btnQuiet} px-2.5`}
              aria-label="Go back"
            >
              <ArrowLeft
                className="h-4 w-4"
                aria-hidden
              />
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold tracking-tight text-[var(--ink)]">
                Cleaning Schedule
              </h1>

              <p className="truncate font-mono text-[11px] text-[var(--ink-3)] uppercase tracking-[0.08em]">
                {registeredLabel ??
                  'You have not registered for a day yet'}

                {deadlineText && (
                  <>
                    <span className="mx-2 text-[var(--ink-4)]">
                      ·
                    </span>
                    {deadlineText}
                  </>
                )}
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-1 sm:flex">
            <Link
              href="/dashboard/courses"
              className={btnQuiet}
            >
              Courses
            </Link>

            <Link
              href="/dashboard/students"
              className={btnQuiet}
            >
              Students
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

// =========================================================
// Loading skeleton
// =========================================================

function ScheduleSkeleton() {
  return (
    <div
      className="space-y-3"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">
        Loading the cleaning schedule…
      </span>

      {[0, 1, 2].map((week) => (
        <div
          key={week}
          className={panel}
        >
          <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] px-4 py-3.5 sm:px-5">
            <div className="h-4 w-40 animate-pulse bg-[var(--surface-3)]" />
            <div className="h-4 w-20 animate-pulse bg-[var(--surface-3)]" />
          </div>

          {week === 0 && (
            <div>
              {[0, 1, 2, 3, 4].map((row) => (
                <div
                  key={row}
                  className="flex items-center gap-4 border-b border-[var(--line)] px-4 py-3.5 last:border-b-0 sm:px-5"
                >
                  <div className="h-4 w-28 animate-pulse bg-[var(--surface-3)]" />
                  <div className="h-4 w-24 animate-pulse bg-[var(--surface-3)]" />
                  <div className="ml-auto h-8 w-24 animate-pulse bg-[var(--surface-3)]" />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// =========================================================
// Participant List
//
// IMPORTANT:
// Participants are OPEN by default.
// =========================================================

type AttendanceRecord = {
  userId: string;
  status: string;
};

function ParticipantList({
  day,
  currentUserId,
  canMarkAttendance,
  onMarkAttendance,
}: {
  day: CleaningDay;
  currentUserId?: string;
  canMarkAttendance: boolean;
  onMarkAttendance: (
    userId: string,
    dayId: string,
    status: 'ATTENDED' | 'NO_SHOW' | 'PENDING',
  ) => void;
}) {
  // TRUE means participants are visible immediately.
  const [open, setOpen] = useState(true);

  const count = day.registrations.length;

  if (count === 0) {
    return (
      <p className="font-mono text-[11px] text-[var(--ink-4)]">
        No participants yet
      </p>
    );
  }

  return (
    <div className="border border-[var(--line)] bg-[var(--surface-2)] p-3 sm:p-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`mb-2 inline-flex items-center gap-1.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-2)] hover:text-[var(--ink)] ${focusRing}`}
      >
        <Users
          className="h-3.5 w-3.5"
          aria-hidden
        />

        <span>
          {count}{' '}
          {count === 1
            ? 'participant'
            : 'participants'}
        </span>

        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
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
              duration: 0.2,
              ease: [0.2, 0, 0, 1],
            }}
            className="overflow-hidden"
          >
            <ul className="grid gap-x-6 gap-y-2 border-t border-[var(--line)] pt-3 grid-cols-1 sm:grid-cols-2">
              {day.registrations.map((reg) => {
                const attendance = (
                  day.attendanceRecords as
                    | AttendanceRecord[]
                    | undefined
                )?.find(
                  (record) =>
                    record.userId === reg.userId,
                );

                const isSelf =
                  reg.userId === currentUserId;

                return (
                  <li
                    key={reg.id}
                    className="flex min-w-0 items-center gap-2.5 border border-[var(--line)] bg-[var(--surface)] px-2.5 py-2"
                  >
                    <Avatar
                      firstName={reg.user.firstName}
                      lastName={reg.user.lastName}
                      src={reg.user.profileImageUrl}
                      isSelf={isSelf}
                    />

                    <span className="min-w-0 flex-1 font-mono text-[12px] text-[var(--ink)]">
                      {reg.user.firstName}{' '}
                      {reg.user.lastName}

                      {isSelf && (
                        <span className="ml-1.5 text-[var(--ink-4)]">
                          (you)
                        </span>
                      )}
                    </span>

                    {attendance?.status ===
                      'ATTENDED' && (
                      <CheckCircle
                        className="h-4 w-4 shrink-0 text-[var(--ok)]"
                        aria-label="Attended"
                      />
                    )}

                    {attendance?.status ===
                      'NO_SHOW' && (
                      <XCircle
                        className="h-4 w-4 shrink-0 text-[var(--bad)]"
                        aria-label="No show"
                      />
                    )}

                    {attendance?.status ===
                      'PENDING' && (
                      <Clock
                        className="h-4 w-4 shrink-0 text-[var(--warn)]"
                        aria-label="Attendance pending"
                      />
                    )}

                    {canMarkAttendance && (
                      <span className="flex shrink-0 items-center gap-0.5 border-l border-[var(--line)] pl-2">
                        {(
                          [
                            [
                              'ATTENDED',
                              'Attended',
                            ],
                            [
                              'NO_SHOW',
                              'No Show',
                            ],
                            [
                              'PENDING',
                              'Pending',
                            ],
                          ] as const
                        ).map(
                          ([
                            status,
                            label,
                          ]) => (
                            <button
                              key={status}
                              type="button"
                              title={`Mark ${label.toLowerCase()}`}
                              aria-label={`Mark ${label.toLowerCase()} for ${reg.user.firstName} ${reg.user.lastName}`}
                              aria-pressed={
                                attendance?.status ===
                                status
                              }
                              onClick={() =>
                                onMarkAttendance(
                                  reg.userId,
                                  day.id,
                                  status,
                                )
                              }
                              className={`rounded px-2 py-1 text-[10px] font-medium transition-colors ${focusRing} ${
                                attendance?.status ===
                                status
                                  ? 'bg-[var(--surface-3)] text-[var(--ink)]'
                                  : 'text-[var(--ink-4)] hover:bg-[var(--surface-2)] hover:text-[var(--ink-2)]'
                              }`}
                            >
                              {label}
                            </button>
                          ),
                        )}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =========================================================
// Search result type
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
// Participant Search
//
// This component receives already-loaded data.
// It NEVER calls the database.
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

  const showResults =
    focused && search.trim().length > 0;

  return (
    <section className={`${panel} mb-4`}>
      <div className="border-b border-[var(--line)] p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--line)] bg-[var(--brand)] text-white">
            <Users
              className="h-4 w-4"
              aria-hidden
            />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-semibold tracking-tight text-[var(--ink)]">
              Find a registered participant
            </h2>

            <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--ink-3)]">
              Search registered students by name or cleaning date.
            </p>
          </div>
        </div>

        <div className="relative mt-4">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-4)]"
            aria-hidden
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              onSearchChange(event.target.value)
            }
            onFocus={() => setFocused(true)}
            placeholder="Search student name, day or date..."
            aria-label="Search registered participants"
            className={`h-11 w-full border border-[var(--line)] bg-[var(--surface)] pl-10 pr-10 font-mono text-[13px] text-[var(--ink)] placeholder:text-[var(--ink-4)] ${focusRing}`}
          />

          {search && (
            <button
              type="button"
              onClick={onClear}
              aria-label="Clear participant search"
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[var(--ink-4)] hover:text-[var(--ink)] ${focusRing}`}
            >
              <X
                className="h-4 w-4"
                aria-hidden
              />
            </button>
          )}
        </div>

        {search.trim() && (
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="font-mono text-[11px] text-[var(--ink-3)]">
              {results.length}{' '}
              {results.length === 1
                ? 'registered participant'
                : 'registered participants'}{' '}
              found
            </p>

            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--ink-4)]">
              Client-side search
            </span>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{
              opacity: 0,
              y: -4,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -4,
            }}
          >
            {results.length > 0 ? (
              <div className="max-h-[420px] overflow-y-auto p-2">
                {results.map((result) => (
                  <button
                    type="button"
                    key={`${result.registrationId}-${result.dayId}`}
                    onClick={() => onSelect(result)}
                    className={`flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-[var(--surface-2)] ${focusRing}`}
                  >
                    <Avatar
                      firstName={result.firstName}
                      lastName={result.lastName}
                      src={result.profileImageUrl}
                    />

                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-mono text-[13px] font-semibold text-[var(--ink)]">
                        {result.firstName}{' '}
                        {result.lastName}
                      </span>

                      <span className="mt-0.5 block font-mono text-[11px] text-[var(--ink-3)]">
                        {result.dayOfWeek},{' '}
                        {formatDate(
                          result.cleaningDate,
                        )}
                      </span>
                    </span>

                    <span className="hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--ink-4)] sm:block">
                      {result.weekLabel}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="border-t border-[var(--line)] px-5 py-8 text-center">
                <User
                  className="mx-auto h-6 w-6 text-[var(--ink-4)]"
                  aria-hidden
                />

                <p className="mt-2 font-mono text-[13px] font-semibold text-[var(--ink)]">
                  No registered participant found
                </p>

                <p className="mt-1 font-mono text-[11px] text-[var(--ink-3)]">
                  Try the student's first name, last
                  name, day or date.
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
// Shell
// =========================================================

function Shell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      data-cleaning-scope
      className="min-h-screen bg-[var(--surface-2)] text-[var(--ink)] antialiased"
    >
      <style
        dangerouslySetInnerHTML={{
          __html: TOKENS,
        }}
      />

      {children}
    </div>
  );
}

// =========================================================
// Main page
// =========================================================

export default function CleaningPage() {
  const router = useRouter();

  const [expandedWeeks, setExpandedWeeks] =
    useState<Set<string>>(new Set());

  const [confirm, setConfirm] =
    useState<ConfirmState>(null);

  const [pendingDayId, setPendingDayId] =
    useState<string | null>(null);

  const [notice, setNotice] = useState<{
    tone: 'ok' | 'bad';
    message: string;
  } | null>(null);

  // =======================================================
  // CLIENT-SIDE SEARCH STATE
  // =======================================================

  const [participantSearch, setParticipantSearch] =
    useState('');

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

  const registerMutation =
    useRegisterForCleaning();

  const changeRegistrationMutation =
    useChangeRegistration();

  const markAttendanceMutation =
    useMarkAttendance();

  const weeks = useMemo(
    () => data?.weeks ?? [],
    [data],
  );

  // =======================================================
  // Expand ALL weeks automatically
  //
  // This means participants in every published week start
  // visible rather than only the first week.
  // =======================================================

  useEffect(() => {
    if (weeks.length === 0) return;

    setExpandedWeeks((previous) => {
      const allWeekIds = new Set(
        weeks.map((week) => week.id),
      );

      // Avoid unnecessary state updates.
      if (
        previous.size === allWeekIds.size &&
        Array.from(allWeekIds).every((id) =>
          previous.has(id),
        )
      ) {
        return previous;
      }

      return allWeekIds;
    });
  }, [weeks]);

  // =======================================================
  // Client-side participant search
  //
  // IMPORTANT:
  // This only searches data already loaded into `weeks`.
  // No fetch, axios call, API request or database query.
  // =======================================================

  const participantSearchResults = useMemo(() => {
    const query = participantSearch
      .trim()
      .toLowerCase();

    if (!query) return [];

    const normalizedQuery = query.replace(/\s+/g, ' ');

    const results: ParticipantSearchResult[] = [];

    for (const week of weeks) {
      for (const day of week.days) {
        for (const registration of day.registrations) {
          const firstName =
            registration.user.firstName ?? '';

          const lastName =
            registration.user.lastName ?? '';

          const fullName =
            `${firstName} ${lastName}`.trim();

          const reverseName =
            `${lastName} ${firstName}`.trim();

          const dayName =
            day.dayOfWeek ?? '';

          const dateText =
            formatDate(day.cleaningDate);

          const rawDate =
            day.cleaningDate ?? '';

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

          if (
            searchableText.includes(
              normalizedQuery,
            )
          ) {
            results.push({
              registrationId: registration.id,
              userId: registration.userId,
              firstName,
              lastName,
              profileImageUrl:
                registration.user
                  .profileImageUrl,
              dayId: day.id,
              dayOfWeek: day.dayOfWeek,
              cleaningDate:
                day.cleaningDate,
              weekId: week.id,
              weekLabel: week.weekLabel,
            });
          }
        }
      }
    }

    return results;
  }, [participantSearch, weeks]);

  // =======================================================
  // Search result selection
  // =======================================================

  const handleParticipantSearchSelect = useCallback(
    (result: ParticipantSearchResult) => {
      // Expand the week containing the participant.
      setExpandedWeeks((previous) => {
        const next = new Set(previous);
        next.add(result.weekId);
        return next;
      });

      // Clear the search after selecting.
      setParticipantSearch('');

      // Scroll the matching day into view after React
      // has had time to render/expand it.
      window.setTimeout(() => {
        const element = document.getElementById(
          `cleaning-day-${result.dayId}`,
        );

        element?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 250);
    },
    [],
  );

  // =======================================================
  // Flash messages
  // =======================================================

  const flash = useCallback(
    (
      tone: 'ok' | 'bad',
      message: string,
    ) => {
      setNotice({
        tone,
        message,
      });

      window.setTimeout(
        () => setNotice(null),
        tone === 'ok' ? 4000 : 7000,
      );
    },
    [],
  );

  // =======================================================
  // All days
  // =======================================================

  const allDays = useMemo(
    () =>
      weeks.flatMap(
        (week) => week.days,
      ),
    [weeks],
  );

  const registeredDay = useMemo(
    () =>
      allDays.find(
        (day) =>
          day.id ===
          data?.registration
            ?.cleaningDayId,
      ) ?? null,
    [
      allDays,
      data?.registration?.cleaningDayId,
    ],
  );

  const registeredWeek = useMemo(
    () =>
      weeks.find((week) =>
        week.days.some(
          (day) =>
            day.id ===
            data?.registration
              ?.cleaningDayId,
        ),
      ) ?? null,
    [
      weeks,
      data?.registration?.cleaningDayId,
    ],
  );

  // =======================================================
  // Registration
  // =======================================================

  const runRegister = async (
    dayId: string,
  ) => {
    setPendingDayId(dayId);

    try {
      const result =
        await registerMutation.mutateAsync(
          dayId,
        );

      setConfirm(null);

      flash(
        'ok',
        result.message ??
          'You are registered for this cleaning day.',
      );

      await Promise.all([
        refetch(),
        refetchStatus(),
      ]);
    } catch (err: unknown) {
      const raw =
        err instanceof Error
          ? err.message
          : 'Registration failed';

      const lower =
        raw.toLowerCase();

      setConfirm(null);

      if (
        lower.includes(
          'already registered',
        )
      ) {
        flash(
          'bad',
          'You already have a registration. Use "Switch here" on another open day instead.',
        );
      } else if (
        lower.includes('full')
      ) {
        flash(
          'bad',
          'This day is full. Choose another open day.',
        );
      } else if (
        lower.includes('closed')
      ) {
        flash(
          'bad',
          'Registration for this day is closed.',
        );
      } else {
        flash('bad', raw);
      }
    } finally {
      setPendingDayId(null);
    }
  };

  // =======================================================
  // Change registration
  // =======================================================

  const runChange = async (
    newDayId: string,
  ) => {
    setPendingDayId(newDayId);

    try {
      const result =
        await changeRegistrationMutation.mutateAsync(
          {
            newDayId,
          },
        );

      const newDay =
        allDays.find(
          (day) =>
            day.id === newDayId,
        );

      setConfirm(null);

      flash(
        'ok',
        result.message ??
          `Your registration moved to ${
            newDay?.dayOfWeek ??
            'the selected day'
          }.`,
      );

      await Promise.all([
        refetch(),
        refetchStatus(),
      ]);
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

  // =======================================================
  // Attendance
  // =======================================================

  const handleMarkAttendance =
    async (
      userId: string,
      dayId: string,
      status:
        | 'ATTENDED'
        | 'NO_SHOW'
        | 'PENDING',
    ) => {
      try {
        await markAttendanceMutation.mutateAsync(
          {
            userId,
            cleaningDayId: dayId,
            status,
          },
        );

        flash(
          'ok',
          `Attendance saved as ${status
            .toLowerCase()
            .replace('_', ' ')}.`,
        );

        await refetch();
      } catch (err: unknown) {
        flash(
          'bad',
          err instanceof Error
            ? err.message
            : 'Could not save attendance.',
        );
      }
    };

  // =======================================================
  // Confirmation dialogs
  // =======================================================

  const askRegister = (
    day: CleaningDay,
  ) =>
    setConfirm({
      title: `Register for ${day.dayOfWeek}?`,
      body: `${formatDate(
        day.cleaningDate,
      )}. You are expected to attend the day you select. You can switch days while registration stays open.`,
      confirmLabel: 'Register',
      onConfirm: () =>
        runRegister(day.id),
    });

  const askChange = (
    day: CleaningDay,
    weekLabel: string,
  ) =>
    setConfirm({
      title: `Switch to ${day.dayOfWeek}?`,
      body: `Your registration moves from ${
        registeredDay?.dayOfWeek ??
        'your current day'
      } to ${day.dayOfWeek}, ${formatDate(
        day.cleaningDate,
      )} (${weekLabel}).`,
      confirmLabel: 'Switch day',
      onConfirm: () =>
        runChange(day.id),
    });

  // =======================================================
  // Rules
  // =======================================================

  const isDeadlinePassed = (
    deadline: string,
  ) =>
    new Date() >
    new Date(deadline);

  const canRegister = (
    day: CleaningDay,
    week: {
      registrationDeadline: string;
      isActive: boolean;
    },
  ) =>
    !data?.registration &&
    week.isActive &&
    day.status === 'OPEN' &&
    !isDayPast(day.cleaningDate) &&
    !isDeadlinePassed(
      week.registrationDeadline,
    );

  const canSwitch = (
    day: CleaningDay,
    week: {
      registrationDeadline: string;
      isActive: boolean;
    },
  ) =>
    Boolean(data?.registration) &&
    day.id !==
      data?.registration
        ?.cleaningDayId &&
    week.isActive &&
    day.status === 'OPEN' &&
    !isDayPast(day.cleaningDate) &&
    !isDeadlinePassed(
      week.registrationDeadline,
    );

  const unavailableReason = (
    day: CleaningDay,
    week: {
      registrationDeadline: string;
      isActive: boolean;
    },
  ) => {
    if (
      isDayPast(day.cleaningDate)
    )
      return 'Past';

    if (day.status === 'FULL')
      return 'Full';

    if (day.status === 'CLOSED')
      return 'Closed';

    if (
      isDeadlinePassed(
        week.registrationDeadline,
      )
    )
      return 'Deadline passed';

    if (!week.isActive)
      return 'Week closed';

    return '—';
  };

  const dayTone = (
    day: CleaningDay,
  ): StatusTone => {
    if (
      isDayPast(day.cleaningDate)
    )
      return 'neutral';

    if (day.status === 'OPEN')
      return 'ok';

    if (day.status === 'FULL')
      return 'warn';

    return 'bad';
  };

  const canMarkAttendance =
    data?.user?.role === 'admin' ||
    data?.user?.role === 'teacher' ||
    data?.user?.role ===
      'super_admin';

  // =======================================================
  // Week toggle
  // =======================================================

  const toggleWeek = (
    weekId: string,
  ) =>
    setExpandedWeeks(
      (previous) => {
        const next = new Set(
          previous,
        );

        if (next.has(weekId)) {
          next.delete(weekId);
        } else {
          next.add(weekId);
        }

        return next;
      },
    );

  // =======================================================
  // Header summary
  // =======================================================

  const registeredLabel =
    registeredDay
      ? `Registered for ${registeredDay.dayOfWeek}, ${formatDate(
          registeredDay.cleaningDate,
        )}`
      : null;

  const activeWeek =
    weeks.find(
      (week) => week.isActive,
    );

  const deadlineText =
    registeredWeek
      ? deadlineLabel(
          registeredWeek.registrationDeadline,
        )
      : activeWeek?.registrationDeadline
        ? deadlineLabel(
            activeWeek.registrationDeadline,
          )
        : null;

  // =======================================================
  // Loading
  // =======================================================

  if (isLoading) {
    return (
      <Shell>
        <PageHeader
          onBack={() =>
            router.back()
          }
          registeredLabel={null}
          deadlineText={null}
        />

        <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <ScheduleSkeleton />
        </main>
      </Shell>
    );
  }

  // =======================================================
  // Error
  // =======================================================

  if (error) {
    return (
      <Shell>
        <PageHeader
          onBack={() =>
            router.back()
          }
          registeredLabel={null}
          deadlineText={null}
        />

        <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <div
            className={`${panel} p-6`}
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                className="mt-0.5 h-5 w-5 shrink-0 text-[var(--bad)]"
                aria-hidden
              />

              <div>
                <h2 className="text-base font-semibold text-[var(--ink)]">
                  The schedule could not be loaded
                </h2>

                <p className="mt-1 max-w-prose font-mono text-[13px] leading-6 text-[var(--ink-3)]">
                  {(error as Error)
                    ?.message ??
                    'An unexpected error occurred.'}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    refetch()
                  }
                  className={`${btnPrimary} mt-4`}
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

  // =======================================================
  // Page
  // =======================================================

  return (
    <Shell>
      <PageHeader
        onBack={() =>
          router.back()
        }
        registeredLabel={
          registeredLabel
        }
        deadlineText={
          deadlineText
        }
      />

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        {/* =================================================
            Notice
        ================================================= */}

        <AnimatePresence
          initial={false}
        >
          {notice && (
            <motion.div
              role="status"
              aria-live="polite"
              initial={{
                opacity: 0,
                y: -6,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -6,
              }}
              transition={{
                duration: 0.18,
              }}
              className={`mb-4 flex items-start gap-2.5 border px-4 py-3 font-mono text-[12px] ${
                notice.tone === 'ok'
                  ? toneClasses.ok
                  : toneClasses.bad
              }`}
            >
              {notice.tone === 'ok' ? (
                <Check
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden
                />
              ) : (
                <AlertCircle
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden
                />
              )}

              <p className="flex-1 leading-6">
                {notice.message}
              </p>

              <button
                type="button"
                onClick={() =>
                  setNotice(null)
                }
                aria-label="Dismiss"
                className={`shrink-0 p-0.5 opacity-70 hover:opacity-100 ${focusRing}`}
              >
                <X
                  className="h-4 w-4"
                  aria-hidden
                />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =================================================
            Status
        ================================================= */}

        {statusData && (
          <div
            className={`${panel} mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-3 sm:px-5`}
          >
            <p className="font-mono text-[12px] text-[var(--ink-2)]">
              {statusData.hasRegistration ? (
                <>
                  Your day:{' '}
                  <span className="font-semibold text-[var(--ink)]">
                    {
                      statusData
                        .registration
                        ?.dayOfWeek
                    }
                  </span>

                  <span className="mx-2 text-[var(--ink-4)]">
                    ·
                  </span>

                  {formatDate(
                    statusData
                      .registration
                      ?.cleaningDate ??
                      '',
                  )}
                </>
              ) : data?.isAdmin ? (
                'Administrators do not need to register.'
              ) : (
                'Pick an open day below to register.'
              )}
            </p>

            {statusData.hasRegistration && (
              <Tag
                tone={
                  statusData
                    .registration
                    ?.status ===
                  'ATTENDED'
                    ? 'ok'
                    : statusData
                          .registration
                          ?.status ===
                        'NO_SHOW'
                      ? 'bad'
                      : 'warn'
                }
              >
                {(statusData.registration?.status ?? 'PENDING')
                  .toLowerCase()
                  .replace('_', ' ')}
              </Tag>
            )}
          </div>
        )}

        {/* =================================================
            Participant Search
        ================================================= */}

        {weeks.length > 0 && (
          <ParticipantSearch
            search={
              participantSearch
            }
            results={
              participantSearchResults
            }
            onSearchChange={
              setParticipantSearch
            }
            onClear={() =>
              setParticipantSearch(
                '',
              )
            }
            onSelect={
              handleParticipantSearchSelect
            }
          />
        )}

        {/* =================================================
            Schedule
        ================================================= */}

        {weeks.length === 0 ? (
          <div
            className={`${panel} px-6 py-14 text-center`}
          >
            <Calendar
              className="mx-auto h-6 w-6 text-[var(--ink-4)]"
              aria-hidden
            />

            <h2 className="mt-3 text-base font-semibold text-[var(--ink)]">
              No cleaning weeks published
            </h2>

            <p className="mx-auto mt-1 max-w-sm font-mono text-[13px] leading-6 text-[var(--ink-3)]">
              When your administrator
              publishes a schedule, the
              available days will appear
              here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {weeks.map((week) => {
              const isExpanded =
                expandedWeeks.has(
                  week.id,
                );

              const deadlinePassed =
                isDeadlinePassed(
                  week.registrationDeadline,
                );

              const openCount =
                week.days.filter(
                  (day) =>
                    day.status ===
                      'OPEN' &&
                    !isDayPast(
                      day.cleaningDate,
                    ),
                ).length;

              return (
                <section
                  key={week.id}
                  id={`cleaning-week-${week.id}`}
                  className={panel}
                >
                  {/* =======================================
                      Week Header
                  ======================================= */}

                  <h2>
                    <button
                      type="button"
                      onClick={() =>
                        toggleWeek(
                          week.id,
                        )
                      }
                      aria-expanded={
                        isExpanded
                      }
                      className={`flex w-full items-center justify-between gap-4 border-b border-[var(--line)] px-4 py-3.5 text-left transition-colors hover:bg-[var(--surface-2)] sm:px-5 ${focusRing}`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-[15px] font-semibold tracking-tight text-[var(--ink)]">
                          {
                            week.weekLabel
                          }
                        </span>

                        <span className="block truncate font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--ink-3)]">
                          {formatDate(
                            week.startDate,
                          )}{' '}
                          –{' '}
                          {formatDate(
                            week.endDate,
                          )}

                          <span className="mx-2 text-[var(--ink-4)]">
                            ·
                          </span>

                          {openCount}{' '}
                          open{' '}
                          {openCount ===
                          1
                            ? 'day'
                            : 'days'}
                        </span>
                      </span>

                      <span className="flex shrink-0 items-center gap-2.5">
                        {!week.isActive ? (
                          <Tag tone="bad">
                            <Lock
                              className="h-3 w-3"
                              aria-hidden
                            />
                            Closed
                          </Tag>
                        ) : deadlinePassed ? (
                          <Tag tone="warn">
                            Deadline passed
                          </Tag>
                        ) : (
                          <span className="hidden font-mono text-[11px] text-[var(--ink-3)] sm:inline">
                            {deadlineLabel(
                              week.registrationDeadline,
                            )}
                          </span>
                        )}

                        <ChevronDown
                          className={`h-4 w-4 text-[var(--ink-4)] transition-transform duration-200 ${
                            isExpanded
                              ? 'rotate-180'
                              : ''
                          }`}
                          aria-hidden
                        />
                      </span>
                    </button>
                  </h2>

                  {/* =======================================
                      Week Contents
                  ======================================= */}

                  <AnimatePresence
                    initial={false}
                  >
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
                          duration: 0.22,
                          ease: [
                            0.2,
                            0,
                            0,
                            1,
                          ],
                        }}
                        className="overflow-hidden"
                      >
                        {/* Desktop columns */}
                        <div className="hidden grid-cols-[1fr_auto_auto_auto] items-center gap-6 border-b border-[var(--line)] bg-[var(--surface-2)] px-5 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-4)] lg:grid">
                          <span>
                            Day
                          </span>

                          <span>
                            Places
                          </span>

                          <span>
                            Status
                          </span>

                          <span className="text-right">
                            Action
                          </span>
                        </div>

                        <ul>
                          {week.days.map(
                            (day) => {
                              const isSelf =
                                day.id ===
                                data
                                  ?.registration
                                  ?.cleaningDayId;

                              const registerable =
                                canRegister(
                                  day,
                                  week,
                                );

                              const switchable =
                                canSwitch(
                                  day,
                                  week,
                                );

                              const busy =
                                pendingDayId ===
                                day.id;

                              const past =
                                isDayPast(
                                  day.cleaningDate,
                                );

                              return (
                                <li
                                  key={
                                    day.id
                                  }
                                  id={`cleaning-day-${day.id}`}
                                  className={`border-b border-[var(--line)] last:border-b-0 ${
                                    isSelf
                                      ? 'bg-[var(--brand-soft)]'
                                      : past
                                        ? 'bg-[var(--surface-2)]'
                                        : ''
                                  }`}
                                >
                                  <div className="grid gap-3 px-4 py-3.5 sm:px-5 lg:grid-cols-[1fr_auto_auto_auto] lg:items-center lg:gap-6">
                                    {/* Day */}
                                    <div className="min-w-0">
                                      <p
                                        className={`font-mono text-[13px] font-semibold ${
                                          past
                                            ? 'text-[var(--ink-4)]'
                                            : 'text-[var(--ink)]'
                                        }`}
                                      >
                                        {
                                          day.dayOfWeek
                                        }

                                        {isSelf && (
                                          <span className="ml-2 align-middle font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--brass)]">
                                            Your day
                                          </span>
                                        )}
                                      </p>

                                      <p className="font-mono text-[11px] text-[var(--ink-3)]">
                                        {formatDate(
                                          day.cleaningDate,
                                        )}
                                      </p>
                                    </div>

                                    {/* Places */}
                                    <div className="lg:w-32">
                                      <CapacityMeter
                                        current={
                                          day.currentRegistrations
                                        }
                                        limit={
                                          day.capacityLimit
                                        }
                                      />
                                    </div>

                                    {/* Status */}
                                    <div className="lg:w-24">
                                      <Tag
                                        tone={dayTone(
                                          day,
                                        )}
                                      >
                                        {past
                                          ? 'Past'
                                          : day.status
                                              .charAt(
                                                0,
                                              ) +
                                            day.status
                                              .slice(
                                                1,
                                              )
                                              .toLowerCase()}
                                      </Tag>
                                    </div>

                                    {/* Action */}
                                    <div className="flex items-center lg:justify-end">
                                      {isSelf ? (
                                        <span className="inline-flex items-center gap-1.5 font-mono text-[12px] font-semibold text-[var(--ok)]">
                                          <Check
                                            className="h-4 w-4"
                                            aria-hidden
                                          />
                                          Registered
                                        </span>
                                      ) : registerable ? (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            askRegister(
                                              day,
                                            )
                                          }
                                          disabled={
                                            busy
                                          }
                                          className={
                                            btnPrimary
                                          }
                                        >
                                          {busy && (
                                            <Loader2
                                              className="h-4 w-4 animate-spin"
                                              aria-hidden
                                            />
                                          )}

                                          {busy
                                            ? 'Registering…'
                                            : 'Register'}
                                        </button>
                                      ) : switchable ? (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            askChange(
                                              day,
                                              week.weekLabel,
                                            )
                                          }
                                          disabled={
                                            busy
                                          }
                                          className={
                                            btnQuiet
                                          }
                                        >
                                          {busy && (
                                            <Loader2
                                              className="h-4 w-4 animate-spin"
                                              aria-hidden
                                            />
                                          )}

                                          {busy
                                            ? 'Switching…'
                                            : 'Switch here'}
                                        </button>
                                      ) : (
                                        <span className="font-mono text-[12px] text-[var(--ink-4)]">
                                          {unavailableReason(
                                            day,
                                            week,
                                          )}
                                        </span>
                                      )}
                                    </div>

                                    {/* Participants */}
                                    <div className="lg:col-span-4">
                                      <ParticipantList
                                        day={
                                          day
                                        }
                                        currentUserId={
                                          data
                                            ?.user
                                            ?.id
                                        }
                                        canMarkAttendance={Boolean(
                                          canMarkAttendance,
                                        )}
                                        onMarkAttendance={
                                          handleMarkAttendance
                                        }
                                      />
                                    </div>
                                  </div>
                                </li>
                              );
                            },
                          )}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </section>
              );
            })}
          </div>
        )}

        {/* =================================================
            Guidance
        ================================================= */}

        {weeks.length > 0 && (
          <p className="mt-6 max-w-prose font-mono text-[12px] leading-6 text-[var(--ink-3)]">
            Choose a day you can genuinely
            attend. While registration for a
            week is still open you may switch to
            any day that still has places; once
            the deadline passes your day is fixed
            and attendance is recorded by staff.
          </p>
        )}

        {/* =================================================
            Video
        ================================================= */}

        <section
          className={`${panel} mt-6 overflow-hidden`}
        >
          <div className="border-b border-[var(--line)] px-4 py-3.5 sm:px-5">
            <h2 className="text-[15px] font-semibold tracking-tight text-[var(--ink)]">
              Community cleaning, recorded
            </h2>

            <p className="mt-0.5 max-w-prose font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--ink-3)]">
              A short look at how a cleaning
              session runs, so you know what to
              expect on the day you register for.
            </p>
          </div>

          <video
            className="block aspect-video w-full bg-[var(--ink)] object-cover"
            controls
            playsInline
            preload="metadata"
            aria-label="Community cleaning activities"
          >
            <source
              src="/cleaning.mp4"
              type="video/mp4"
            />

            Your browser does not support
            embedded video.
          </video>
        </section>
      </main>

      {/* =================================================
          Confirm Dialog
      ================================================= */}

      <ConfirmDialog
        state={confirm}
        onClose={() =>
          setConfirm(null)
        }
        pending={
          registerMutation.isPending ||
          changeRegistrationMutation.isPending
        }
      />
    </Shell>
  );
}