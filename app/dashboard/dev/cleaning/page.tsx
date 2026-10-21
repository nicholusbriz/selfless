// app/dashboard/dev/cleaning/page.tsx
// Dev cleaning management page - View weeks for all tech centers, create weeks for any center, manage days

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  Settings,
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
  Building2,
  UserMinus,
  ArrowLeft,
  Filter,
  Search,
  X,
  User,
} from 'lucide-react';

import {
  useDevCleaning,
  useDevCreateWeek,
  useDevUpdateWeek,
  useDevDeleteWeek,
  useDevUpdateDay,
  useDevDeleteDay,
  useDevManualAssign,
  useDevMarkAttendance,
  useDevRemoveStudent,
  type TechCenter,
  type CleaningDay,
  type CleaningWeek,
  type CleaningRegistration,
  type AttendanceRecord,
} from '@/hooks/useDevCleaning';

// =========================================================
// DESIGN TOKENS (from cleaning rota page)
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

// =========================================================
// FORMAT DATE HELPER
// =========================================================

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

// =========================================================
// AVATAR COMPONENT (from cleaning rota page)
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
  const getInitials = (firstName: string, lastName: string) =>
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

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
// STUDENTS BY REGISTRATION LIST
// =========================================================

type StudentFilter = 'all' | 'zero' | 'one' | 'two';

type StudentWithCount = { id: string; firstName: string; lastName: string; registrationCount: number };

function StudentsByRegistrationList({
  studentsByRegistrationCount,
  totalWeeks,
  totalDays,
  weeks,
  onStudentClick,
}: {
  studentsByRegistrationCount: {
    zero: { id: string; firstName: string; lastName: string }[];
    one: { id: string; firstName: string; lastName: string }[];
    two: { id: string; firstName: string; lastName: string }[];
  };
  totalWeeks: number;
  totalDays: number;
  weeks: CleaningWeek[];
  onStudentClick: (studentId: string, studentName: string) => void;
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

  const filterOptions = [
    { key: 'all' as const, label: 'All', count: totalStudents, description: 'All students' },
    { key: 'zero' as const, label: 'Not registered', count: studentsByRegistrationCount.zero.length, description: 'Students who haven\'t registered for a cleaning day' },
    { key: 'one' as const, label: 'One day', count: studentsByRegistrationCount.one.length, description: 'Students registered for one day' },
    { key: 'two' as const, label: 'Two days', count: studentsByRegistrationCount.two.length, description: 'Students registered for two days' },
  ];

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]">
          Students by registration
        </p>
        <p className="text-[11.5px] text-[var(--ink-4)]">
          Total: {totalStudents}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {filterOptions.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setFilter(option.key)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11.5px] font-semibold rounded-md border transition-colors ${filter === option.key
              ? 'bg-[var(--brand)] border-[var(--brand)] text-white'
              : 'bg-[var(--surface)] border-[var(--line)] text-[var(--ink-2)] hover:border-[var(--brass)] hover:text-[var(--ink)]'
              } ${focusRing}`}
            title={option.description}
          >
            {option.label}
            <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${filter === option.key
              ? 'bg-white/20 text-white'
              : 'bg-[var(--surface-2)] text-[var(--ink-3)]'
              }`}>
              {option.count}
            </span>
          </button>
        ))}
      </div>

      {filteredStudents.length === 0 ? (
        <div className="text-[12.5px] text-[var(--ink-4)] py-2">
          No students in this category
        </div>
      ) : (
        <p className="text-[13px] leading-6 text-[var(--ink)]">
          {filteredStudents
            .sort((a, b) => a.firstName.localeCompare(b.firstName))
            .map((s, index) => (
              <span key={s.id}>
                {index > 0 && ' · '}
                <button
                  type="button"
                  onClick={() => onStudentClick(s.id, `${s.firstName} ${s.lastName}`)}
                  className={`${s.registrationCount > 0 ? 'text-blue-600 font-semibold' : 'text-[var(--ink)]'} hover:underline decoration-1 underline-offset-2`}
                >
                  {s.firstName} {s.lastName}
                </button>
              </span>
            ))}
        </p>
      )}

      <div className="mt-2 flex items-start gap-1.5 text-[11px] text-[var(--ink-3)] bg-[var(--surface-2)] px-2.5 py-2 rounded border border-[var(--line)]">
        <span className="font-semibold text-[var(--brass)]">Pro tip:</span>
        <span>Click on a student name to see their registration status</span>
      </div>

      <p className="mt-2 text-[12px] text-[var(--ink-3)]">
        Total weeks: {totalWeeks} · Total days: {totalDays}
      </p>
    </div>
  );
}

// =========================================================
// PARTICIPANT SEARCH RESULT TYPE
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
                      <span className="block break-words text-[13.5px] font-semibold text-blue-600">
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
// WEEK FILTER CHIPS
// =========================================================

type WeekFilter = { kind: 'all' } | { kind: 'week'; weekId: string };

function WeekFilterChips({
  filter,
  setFilter,
  weeks,
  activeMenu,
  setActiveMenu,
  onToggleWeek,
  onExtendDeadline,
  onDeleteWeek,
}: {
  filter: WeekFilter;
  setFilter: (f: WeekFilter) => void;
  weeks: Array<{ id: string; weekLabel: string; isActive: boolean; registrationDeadline: string }>;
  activeMenu: MenuType;
  setActiveMenu: (menu: MenuType) => void;
  onToggleWeek: (weekId: string, isActive: boolean) => void;
  onExtendDeadline: (week: any) => void;
  onDeleteWeek: (weekId: string) => void;
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
      {options.map((opt, idx) => {
        const isWeekChip = opt.value.kind === 'week';
        const week = isWeekChip ? weeks.find(w => w.id === (opt.value as { kind: 'week'; weekId: string }).weekId) : null;
        
        return (
          <div key={idx} className="flex items-center gap-1">
            <button
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
            {isWeekChip && week && (
              <ActionMenu
                menuId={`week-${week.id}`}
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
                align="left"
              >
                <MenuItem
                  onClick={() => onToggleWeek(week.id, !week.isActive)}
                  icon={week.isActive ? <Lock className="h-4 w-4 text-amber-600" /> : <Unlock className="h-4 w-4 text-emerald-600" />}
                >
                  {week.isActive ? 'Close registrations' : 'Open registrations'}
                </MenuItem>
                <MenuItem
                  onClick={() => onExtendDeadline(week)}
                  icon={<Clock className="h-4 w-4 text-blue-600" />}
                >
                  Extend deadline
                </MenuItem>
                <MenuDivider />
                <MenuItem
                  danger
                  onClick={() => onDeleteWeek(week.id)}
                  icon={<Trash2 className="h-4 w-4 text-red-600" />}
                >
                  Delete week
                </MenuItem>
              </ActionMenu>
            )}
          </div>
        );
      })}
    </div>
  );
}

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
            className={`absolute top-[calc(100%+8px)] z-[9999] w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl ${
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

export default function DevCleaningManagement() {
  const [selectedTechCenterId, setSelectedTechCenterId] = useState<string | null>(null);

  // Only fetch data when a tech center is selected
  const { data, isLoading, error, refetch } =
    useDevCleaning(selectedTechCenterId || '');

  // Fetch all tech centers on mount to populate dropdown
  const [allTechCenters, setAllTechCenters] = useState<TechCenter[]>([]);

  useEffect(() => {
    fetch('/api/dev/tech-centers')
      .then((res) => res.json())
      .then((data) => setAllTechCenters(data))
      .catch((err) => console.error('Failed to load tech centers:', err));
  }, []);

  // Set default tech center to first available one
  useEffect(() => {
    if (allTechCenters.length > 0 && !selectedTechCenterId) {
      setSelectedTechCenterId(allTechCenters[0].id);
    }
  }, [allTechCenters, selectedTechCenterId]);

  const createWeekMutation = useDevCreateWeek(selectedTechCenterId || '');
  const updateWeekMutation = useDevUpdateWeek(selectedTechCenterId || '');
  const deleteWeekMutation = useDevDeleteWeek(selectedTechCenterId || '');
  const updateDayMutation = useDevUpdateDay(selectedTechCenterId || '');
  const deleteDayMutation = useDevDeleteDay(selectedTechCenterId || '');
  const manualAssignMutation = useDevManualAssign(selectedTechCenterId || '');
  const markAttendanceMutation = useDevMarkAttendance(selectedTechCenterId || '');
  const removeStudentMutation = useDevRemoveStudent(selectedTechCenterId || '');

  // Re-fetch when tech center changes
  useEffect(() => {
    if (selectedTechCenterId) {
      refetch();
    }
  }, [selectedTechCenterId, refetch]);

  const [expandedWeeks, setExpandedWeeks] = useState<
    Set<string>
  >(new Set());

  const [weekFilter, setWeekFilter] = useState<WeekFilter>({ kind: 'all' });

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

  const [participantSearch, setParticipantSearch] = useState('');

  const [studentDaysModal, setStudentDaysModal] = useState<{
    studentId: string;
    studentName: string;
    days: Array<{ dayId: string; dayOfWeek: string; cleaningDate: string; weekLabel: string }>;
  } | null>(null);

  /* ============================================================
     STUDENT DAYS MODAL
  ============================================================ */

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
    studentName: string,
    cleaningDayId: string
  ) => {
    setActiveMenu(null);

    if (
      confirm(
        `Are you sure you want to remove ${studentName} from this cleaning day?`
      )
    ) {
      try {
        await removeStudentMutation.mutateAsync({
          studentUserId,
          cleaningDayId,
        });

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

  const techCenters = allTechCenters || [];
  const weeks = data?.weeks || [];
  const weeksWithExtraData = weeks.map(week => ({
    id: week.id,
    weekLabel: week.weekLabel,
    isActive: week.isActive,
    registrationDeadline: week.registrationDeadline,
  }));

  // Students with 0 or 1 registrations (from API - already filtered)
  const assignableStudents = data?.students || [];

  // Count registrations per student (max 2 allowed)
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

  // Students with 0 registrations (for display section)
  const availableStudents = useMemo(() => assignableStudents.filter(
    (student) => (studentRegistrationCounts.get(student.id) || 0) === 0,
  ), [assignableStudents, studentRegistrationCounts]);

  // Filter days based on week filter
  const filteredDays = useMemo(() => {
    if (weekFilter.kind === 'all') {
      return weeks.flatMap((week) =>
        week.days.map((day) => ({ day, week }))
      );
    }
    const week = weeks.find((w) => w.id === weekFilter.weekId);
    if (!week) return [];
    return week.days.map((day) => ({ day, week }));
  }, [weeks, weekFilter]);

  const stats = data?.stats || {
    totalWeeks: 0,
    totalDays: 0,
    totalRegistrations: 0,
    totalUnregistered: 0,
    totalAttended: 0,
    totalNoShow: 0,
    totalPending: 0,
  };

  /* ============================================================
     PARTICIPANT SEARCH
  ============================================================ */

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

  /* ============================================================
     LOADING - Show loading only if data is being fetched
  ============================================================ */

  if (!selectedTechCenterId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 text-sm text-slate-500">Loading tech centers...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-lg bg-slate-200" />

            <div className="space-y-2">
              <div className="h-6 w-48 rounded bg-slate-200" />
              <div className="h-4 w-72 rounded bg-slate-200" />
            </div>
          </div>

          <div className="h-10 w-40 rounded-lg bg-slate-200" />
        </div>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {[1, 2, 3, 4, 5, 6, 7].map((item) => (
            <div
              key={item}
              className="rounded-lg border border-slate-200 bg-white p-3"
            >
              <div className="mx-auto mb-2 h-8 w-8 rounded-md bg-slate-200" />
              <div className="mx-auto mb-1 h-6 w-10 rounded bg-slate-200" />
              <div className="mx-auto h-2 w-12 rounded bg-slate-200" />
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
                  <div className="h-11 w-11 rounded-lg bg-slate-200" />

                  <div className="space-y-2">
                    <div className="h-6 w-40 rounded bg-slate-200" />
                    <div className="h-4 w-56 rounded bg-slate-200" />
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
    <>
      <style>{TOKENS}</style>
      <motion.div
        data-cleaning-scope
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
              <Settings className="h-5 w-5 text-[#1a365d]" />
            </div>

            <div className="min-w-0">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Cleaning Management
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage cleaning schedules and assignments
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
          TECH CENTER FILTER
      ======================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-purple-100 bg-purple-50">
              <Building2 className="h-5 w-5 text-purple-600" />
            </div>

            <div className="min-w-0">
              <h3 className="text-lg font-bold tracking-tight text-slate-900">
                {techCenters.find(tc => tc.id === selectedTechCenterId)?.name || 'Tech Center'}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Managing cleaning data for this tech center
              </p>
            </div>
          </div>

          <div className="w-full sm:w-64">
            <select
              value={selectedTechCenterId || ''}
              onChange={(e) => setSelectedTechCenterId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#3182ce] focus:ring-2 focus:ring-blue-100"
            >
              {techCenters.map((tc: TechCenter) => (
                <option key={tc.id} value={tc.id}>
                  {tc.name} ({tc.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================
          STATS
      ======================================================== */}

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
        >
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-purple-50">
              <Calendar className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-xl font-bold text-slate-900">
              {stats.totalWeeks}
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
              Weeks
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
        >
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-indigo-50">
              <Clock className="h-4 w-4 text-indigo-600" />
            </div>
            <p className="text-xl font-bold text-slate-900">
              {stats.totalDays}
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
              Days
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
        >
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-50">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-xl font-bold text-slate-900">
              {stats.totalRegistrations}
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
              Registered
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
        >
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-orange-50">
              <UserMinus className="h-4 w-4 text-orange-600" />
            </div>
            <p className="text-xl font-bold text-slate-900">
              {stats.totalUnregistered || availableStudents.length}
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
              Unregistered
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
        >
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-50">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-xl font-bold text-slate-900">
              {stats.totalAttended}
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
              Attended
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
        >
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-amber-50">
              <Hourglass className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-xl font-bold text-slate-900">
              {stats.totalPending}
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
              Pending
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
        >
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
            <p className="text-xl font-bold text-slate-900">
              {stats.totalNoShow}
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
              No Show
            </p>
          </div>
        </motion.div>
      </div>

      {/* ========================================================
          STUDENTS BY REGISTRATION FILTER
      ======================================================== */}

      {data?.studentsByRegistrationCount && (
        <StudentsByRegistrationList
          studentsByRegistrationCount={data.studentsByRegistrationCount}
          totalWeeks={stats.totalWeeks}
          totalDays={stats.totalDays}
          weeks={weeks}
          onStudentClick={handleStudentClick}
        />
      )}

      {/* ========================================================
          PARTICIPANT SEARCH
      ======================================================== */}

      {weeks.length > 0 && (
        <ParticipantSearch
          search={participantSearch}
          results={participantSearchResults}
          onSearchChange={setParticipantSearch}
          onClear={() => setParticipantSearch('')}
          onSelect={handleParticipantSearchSelect}
        />
      )}

      {/* ========================================================
          WEEK FILTER
      ======================================================== */}

      {weeks.length > 0 && (
        <WeekFilterChips
          filter={weekFilter}
          setFilter={setWeekFilter}
          weeks={weeksWithExtraData}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          onToggleWeek={handleToggleWeekRegistration}
          onExtendDeadline={openDeadlinePicker}
          onDeleteWeek={handleDeleteWeek}
        />
      )}

      {/* ========================================================
          DAYS GRID
      ======================================================== */}

      {filteredDays.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <Settings className="h-7 w-7 text-slate-500" />
          </div>

          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            No cleaning days available
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            {weeks.length === 0
              ? 'No cleaning weeks found for this tech center. Create a new cleaning week from Monday to Friday to get started.'
              : 'No days match the selected filter.'}
          </p>

          {weeks.length === 0 && (
            <button
              onClick={() => setShowCreateWeek(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#1a365d] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#153475]"
            >
              <Plus className="h-4 w-4" />
              Create First Week
            </button>
          )}
        </motion.div>
      ) : (
        <div
          id="cleaning-grid"
          className="grid gap-3.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 overflow-visible"
        >
          {filteredDays.map(({ day, week }) => (
            <div
              key={day.id}
              className="relative rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col overflow-visible"
            >
                              {/* DAY HEADER */}

                              <div className="relative z-20 border-b border-slate-100 p-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h4 className="font-bold text-slate-900">
                                        {day.dayOfWeek}
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
                                      {formatDate(day.cleaningDate)}
                                    </p>

                                    {/* WEEK LABEL BADGE */}
                                    <span
                                      className="mt-1.5 inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-slate-600"
                                      title={`Part of ${week.weekLabel}`}
                                    >
                                      <Calendar className="h-2.5 w-2.5 text-slate-500" />
                                      {week.weekLabel}
                                    </span>
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

                              <div className="p-4 flex-1 flex flex-col overflow-visible">
                                {day.registrations &&
                                day.registrations
                                  .length > 0 ? (
                                  <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-2)] overflow-visible flex-1 flex flex-col">
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
                                      <ul className="divide-y divide-[var(--line)] flex-1">
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
                                        const totalRegistrations = studentRegistrationCounts.get(reg.userId) || 0;

                                        return (
                                          <li
                                            key={reg.id}
                                            className="flex items-center gap-2.5 px-3 py-2 overflow-visible"
                                          >
                                            <Avatar
                                              firstName={reg.user.firstName}
                                              lastName={reg.user.lastName}
                                              src={reg.user.profileImageUrl}
                                              size={28}
                                            />
                                            <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-[var(--ink)]">
                                              {reg.user.firstName} {reg.user.lastName}
                                              {totalRegistrations > 1 && (
                                                <span className="ml-1.5 text-[10px] font-medium text-[var(--brass)]">
                                                  ({totalRegistrations}/2)
                                                </span>
                                              )}
                                            </span>
                                            <ActionMenu
                                              menuId={`student-${reg.id}`}
                                              activeMenu={activeMenu}
                                              setActiveMenu={setActiveMenu}
                                            >
                                              <div className="px-3 py-2">
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                  Student actions
                                                </p>
                                                <p className="mt-0.5 truncate text-xs font-medium text-slate-600">
                                                  {reg.user.firstName} {reg.user.lastName}
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
                                                icon={<UserCheck className="h-4 w-4 text-emerald-600" />}
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
                                                icon={<UserX className="h-4 w-4 text-red-600" />}
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
                                                icon={<Hourglass className="h-4 w-4 text-amber-600" />}
                                              >
                                                Mark pending
                                              </MenuItem>
                                              <MenuDivider />
                                              <MenuItem
                                                danger
                                                onClick={() =>
                                                  handleRemoveStudent(
                                                    reg.userId,
                                                    `${reg.user.firstName} ${reg.user.lastName}`,
                                                    day.id
                                                  )
                                                }
                                                icon={<Trash2 className="h-4 w-4 text-red-600" />}
                                              >
                                                Remove student
                                              </MenuItem>
                                            </ActionMenu>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                    )}
                                  </div>
                                ) : (
                                  <div className="rounded-lg border border-dashed border-[var(--line)] bg-[var(--surface-2)] px-4 py-8 text-center flex-1">
                                    <Users className="mx-auto h-8 w-8 text-[var(--ink-4)]" />

                                    <p className="mt-2 text-sm font-medium text-[var(--ink-3)]">
                                      No students registered
                                    </p>

                                    <p className="mt-1 text-xs text-[var(--ink-4)]">
                                      Students assigned to this cleaning day will appear here.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
          ))}
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

                  const techCenterId =
                    formData.get(
                      'techCenterId'
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

                  if (!techCenterId) {
                    alert(
                      'Please select a tech center'
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
                    techCenterId,
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
                    Tech Center
                  </label>

                  <select
                    name="techCenterId"
                    required
                    defaultValue={selectedTechCenterId}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#3182ce] focus:ring-2 focus:ring-blue-100"
                  >
                    {techCenters.map((tc: TechCenter) => (
                      <option key={tc.id} value={tc.id}>
                        {tc.name} ({tc.code})
                      </option>
                    ))}
                  </select>
                </div>

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

                      {assignableStudents.length === 0 ? (
                        <option value="" disabled>
                          No students available (all have 2 registrations)
                        </option>
                      ) : (
                        assignableStudents.map(
                          (student) => {
                            const regCount = studentRegistrationCounts.get(student.id) || 0;
                            return (
                              <option
                                key={student.id}
                                value={student.id}
                              >
                                {student.firstName} {student.lastName}
                                {regCount > 0 && ` (${regCount}/2)`}
                              </option>
                            );
                          }
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

        {/* STUDENT DAYS MODAL */}
        <AnimatePresence>
          {studentDaysModal && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                onClick={() => setStudentDaysModal(null)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
                  className="relative w-full max-w-sm border border-[var(--line)] bg-[var(--surface)] rounded-lg shadow-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
                  <h2 className="text-[15px] font-semibold text-[var(--ink)]">
                    {studentDaysModal.studentName}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setStudentDaysModal(null)}
                    className="p-1 text-[var(--ink-3)] hover:text-[var(--ink)] rounded transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="px-4 py-3">

                {studentDaysModal.days.length === 0 ? (
                  <div className="text-center py-4">
                    <Calendar className="mx-auto h-6 w-6 text-[var(--ink-4)]" />
                    <p className="mt-2 text-[13px] font-medium text-[var(--ink)]">
                      No registered days
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-1.5">
                    {studentDaysModal.days.map((day) => (
                      <li
                        key={day.dayId}
                        className="flex items-center justify-between gap-2 rounded border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium text-[var(--ink)]">
                            {day.dayOfWeek}
                          </p>
                          <p className="text-[11px] text-[var(--ink-3)]">
                            {formatDate(day.cleaningDate)}
                          </p>
                        </div>
                        <span className="shrink-0 text-[10px] font-medium text-[var(--ink-3)] bg-[var(--surface)] px-2 py-0.5 rounded border border-[var(--line)]">
                          {day.weekLabel}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </motion.div>
    </>
  );
}
