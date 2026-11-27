'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { Dices, History, Loader2, Maximize2, PartyPopper, Rose, RotateCcw, UserRound, Users, X } from 'lucide-react';
import VerifiedBadge from '@/components/VerifiedBadge';
import { useAuth } from '@/lib/hooks/useAuth';
import { isRecord } from '@/app/dashboard/response-guards';

interface SpinStudent {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  hasVerifiedBadge?: boolean | null;
  gender?: string | null;
  role?: { name?: string | null } | null;
  techCenter?: { id: string; name: string } | null;
}

const SPIN_MS = 5000;
const FULL_TURNS = 5;
const MAX_SEGMENTS = 16;
const WHEEL_RADIUS_PCT = 36;
const SEGMENT_COLORS = ['#EEF2FF', '#F5F3FF', '#FDF2F8', '#ECFEFF', '#FFF7ED'];
const EXCLUDED_TECH_CENTERS = ['lira', 'mbale', 'jinja'];
const HIDDEN_WHEEL_ROLES = new Set(['dev', 'super_admin', 'superadmin']);

function isAllowedSpinStudent(student: SpinStudent): boolean {
  const centerName = student.techCenter?.name?.trim().toLowerCase();
  if (!centerName) return true;
  return !EXCLUDED_TECH_CENTERS.some((center) =>
    centerName.includes(center),
  );
}

function isWheelVisible(student: SpinStudent): boolean {
  const role = student.role?.name?.toLowerCase();
  return !role || !HIDDEN_WHEEL_ROLES.has(role);
}

function isSpinStudent(value: unknown): value is SpinStudent {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.firstName === 'string' &&
    typeof value.lastName === 'string' &&
    (typeof value.profileImageUrl === 'string' || value.profileImageUrl === null) &&
    (value.gender === undefined ||
      value.gender === null ||
      typeof value.gender === 'string')
  );
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalizedGender(student: SpinStudent): 'male' | 'female' | null {
  const g = student.gender?.toLowerCase();
  return g === 'male' || g === 'female' ? g : null;
}

function canMatch(first: SpinStudent, second: SpinStudent): boolean {
  const firstGender = normalizedGender(first);
  const secondGender = normalizedGender(second);
  const firstCenterId = first.techCenter?.id;
  const secondCenterId = second.techCenter?.id;

  return (
    first.id !== second.id &&
    firstGender !== null &&
    secondGender !== null &&
    firstGender !== secondGender &&
    (!firstCenterId || !secondCenterId || firstCenterId !== secondCenterId)
  );
}

function StudentAvatar({
  student,
  sizeClass,
  textSize = 'text-[10px]',
}: {
  student: SpinStudent;
  sizeClass: string;
  textSize?: string;
}) {
  const name = `${student.firstName} ${student.lastName}`.trim();
  const initials = `${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`
    .toUpperCase();
  return (
    <span
      className={`relative flex ${sizeClass} shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-indigo-100 shadow ${textSize} font-bold text-indigo-700`}
    >
      {student.profileImageUrl ? (
        <Image
          src={student.profileImageUrl}
          alt={name}
          fill
          sizes="48px"
          className="scale-110 object-cover opacity-60 blur-sm"
          unoptimized
        />
      ) : (
        initials || '?'
      )}
      {student.hasVerifiedBadge && (
        <VerifiedBadge className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-white" />
      )}
    </span>
  );
}

function WinnerCard({
  student,
  onExpand,
  showFullPicture = false,
}: {
  student: SpinStudent;
  onExpand?: () => void;
  showFullPicture?: boolean;
}) {
  const name = `${student.firstName} ${student.lastName}`.trim();
  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl border border-slate-200 shadow-sm ${
        showFullPicture
          ? 'h-[min(48dvh,540px)] min-h-[300px] bg-slate-900'
          : 'h-40 bg-slate-100 sm:h-44'
      }`}
    >
      {student.profileImageUrl ? (
        <Image
          src={student.profileImageUrl}
          alt={name}
          fill
          sizes="(max-width: 640px) 45vw, 220px"
          className={showFullPicture ? 'object-contain' : 'object-cover object-top'}
          unoptimized
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span className="text-2xl font-bold text-slate-300">
            {`${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`.toUpperCase() || '?'}
          </span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-2">
        <p className="flex items-start gap-1 text-[11px] font-bold leading-tight text-white">
          <span className="line-clamp-2 break-words">{name}</span>
          {student.hasVerifiedBadge && (
            <VerifiedBadge className="h-3 w-3 shrink-0" />
          )}
        </p>
        {student.techCenter?.name && (
          <p className="mt-0.5 line-clamp-2 break-words text-[9px] font-medium leading-tight text-white/75">
            {student.techCenter.name}
          </p>
        )}
      </div>
      {onExpand && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onExpand();
          }}
          aria-label="View full image"
          title="View full image"
          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/65"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function ShimmerSlot() {
  return (
    <div className="relative h-40 w-full overflow-hidden rounded-xl border border-indigo-100 bg-slate-100 sm:h-44">
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(100deg, rgba(224,231,255,0) 20%, rgba(165,180,252,0.55) 50%, rgba(240,171,252,0.45) 80%, rgba(224,231,255,0) 100%)',
          backgroundSize: '250% 100%',
          animation: 'spin-shimmer 1.6s linear infinite',
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center px-2">
        <span
          className="text-[11px] font-black uppercase tracking-wider"
          style={{
            background:
              'linear-gradient(90deg, #6366f1, #d946ef, #f59e0b, #6366f1)',
            backgroundSize: '300% 100%',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            animation: 'spin-text-shine 2s linear infinite',
          }}
        >
          Finding the best match…
        </span>
      </div>
    </div>
  );
}

function MatchSlot({
  student,
  spinning = false,
  onExpand,
  showFullPicture = false,
  emptyMessage = 'Spin to find your match',
}: {
  student: SpinStudent | null;
  spinning?: boolean;
  onExpand?: () => void;
  showFullPicture?: boolean;
  emptyMessage?: string;
}) {
  if (student) {
    return (
      <WinnerCard
        student={student}
        onExpand={onExpand}
        showFullPicture={showFullPicture}
      />
    );
  }
  if (spinning) return <ShimmerSlot />;
  return (
    <div className="flex h-40 w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 sm:h-44">
      <UserRound className="h-5 w-5 text-slate-300" />
      <p className="px-2 text-center text-[9px] font-semibold leading-tight text-slate-400">
        {emptyMessage}
      </p>
    </div>
  );
}

function HistoryUserCard({ student }: { student: SpinStudent }) {
  const name = `${student.firstName} ${student.lastName}`.trim();
  const initials = `${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`
    .toUpperCase();
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-white bg-indigo-100 shadow-sm">
        {student.profileImageUrl ? (
          <Image
            src={student.profileImageUrl}
            alt={name}
            fill
            sizes="36px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-indigo-700">
            {initials || '?'}
          </span>
        )}
        {student.hasVerifiedBadge && (
          <VerifiedBadge className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-white" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block break-words text-[10px] font-bold leading-snug text-slate-800">
          {name}
        </span>
        <span className="block break-words text-[9px] leading-snug text-slate-400">
          {student.techCenter?.name || '—'}
        </span>
      </span>
    </div>
  );
}

export async function fetchSpinStudents(): Promise<SpinStudent[]> {
  const response = await fetch('/api/dashboard/discover-students?limit=500&all=true');
  if (!response.ok) throw new Error('Failed to fetch students');
  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new Error('Failed to load students');
  return data.filter(isSpinStudent);
}

export default function TriviaSpinWheel({
  showFullPictureCards = false,
}: {
  showFullPictureCards?: boolean;
}) {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();
  const isDirector = role === 'super_admin' || role === 'superadmin';

  const { data: students = [], isLoading, isError } = useQuery<SpinStudent[]>({
    queryKey: ['trivia-spin-students'],
    queryFn: fetchSpinStudents,
    staleTime: 60 * 1000,
    enabled: isDirector,
  });
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winners, setWinners] = useState<[SpinStudent, SpinStudent] | null>(null);
  const [pendingStudent, setPendingStudent] = useState<SpinStudent | null>(null);
  const [fullscreenStudent, setFullscreenStudent] = useState<SpinStudent | null>(null);
  const [matches, setMatches] = useState<
    Array<{ first: SpinStudent; second: SpinStudent }>
  >([]);
  const [showHistory, setShowHistory] = useState(false);
  const rotationRef = useRef(0);

  // Close fullscreen viewer on Escape
  useEffect(() => {
    if (!fullscreenStudent) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreenStudent(null);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [fullscreenStudent]);

  const storageKey = `trivia-spin-matches:${user?.id ?? 'anon'}`;

  // Restore this user's match history for the session
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const raw = sessionStorage.getItem(storageKey);
        const parsed: unknown = raw ? JSON.parse(raw) : [];
        setMatches(
          Array.isArray(parsed)
            ? parsed.filter(
                (m): m is { first: SpinStudent; second: SpinStudent } =>
                  isRecord(m) &&
                  isSpinStudent(m.first) &&
                  isSpinStudent(m.second),
              )
            : [],
        );
      } catch {
        setMatches([]);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  // Persist matches so a refresh doesn't reset the session
  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(matches));
    } catch {
      // storage unavailable — session still works in memory
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches]);

  const matchedIds = useMemo(
    () => new Set(matches.flatMap((m) => [m.first.id, m.second.id])),
    [matches],
  );

  // Only gendered, non-hidden users can be matched at all
  const genderedStudents = useMemo(
    () =>
      students.filter(
        (s) =>
          normalizedGender(s) !== null &&
          isWheelVisible(s) &&
          isAllowedSpinStudent(s),
      ),
    [students],
  );

  // The logged-in user's own card — always the left column
  const selfStudent = useMemo(
    () => genderedStudents.find((s) => s.id === user?.id) ?? null,
    [genderedStudents, user?.id],
  );

  const wheelStudents = useMemo(
    () => genderedStudents.filter(isWheelVisible),
    [genderedStudents],
  );

  const unmatchedWheel = useMemo(
    () => wheelStudents.filter((s) => !matchedIds.has(s.id)),
    [wheelStudents, matchedIds],
  );

  const firstSpinCandidates = useMemo(
    () =>
      unmatchedWheel.filter((student) =>
        unmatchedWheel.some((candidate) => canMatch(student, candidate)),
      ),
    [unmatchedWheel],
  );

  const nextSpinCandidates = useMemo(() => {
    if (!pendingStudent) return firstSpinCandidates;
    return unmatchedWheel.filter((student) => canMatch(pendingStudent, student));
  }, [firstSpinCandidates, pendingStudent, unmatchedWheel]);

  const canSpin = !isSpinning && nextSpinCandidates.length > 0;

  const roundComplete =
    matchedIds.size > 0 &&
    genderedStudents.length >= 2 &&
    firstSpinCandidates.length === 0;

  const participants = useMemo(
    () => shuffle(nextSpinCandidates).slice(0, MAX_SEGMENTS),
    [nextSpinCandidates],
  );

  const segmentCount = participants.length;
  const segmentAngle = segmentCount > 0 ? 360 / segmentCount : 0;

  const conicGradient = useMemo(() => {
    if (segmentCount === 0) return undefined;
    const stops = participants.map((_, i) => {
      const from = (i * segmentAngle).toFixed(2);
      const to = ((i + 1) * segmentAngle).toFixed(2);
      return `${SEGMENT_COLORS[i % SEGMENT_COLORS.length]} ${from}deg ${to}deg`;
    });
    return `conic-gradient(${stops.join(', ')})`;
  }, [participants, segmentAngle, segmentCount]);

  const spin = () => {
    if (!canSpin || segmentCount < 1) return;

    const targetIndex = Math.floor(Math.random() * segmentCount);
    const midAngle = targetIndex * segmentAngle + segmentAngle / 2;

    const current = ((rotationRef.current % 360) + 360) % 360;
    const needed = ((360 - midAngle) % 360 + 360) % 360;
    let delta = needed - current;
    if (delta <= 0) delta += 360;
    const finalRotation = rotationRef.current + FULL_TURNS * 360 + delta;

    setIsSpinning(true);
    if (!pendingStudent) setWinners(null);

    // Slow start → fast middle → gentle stop, exactly SPIN_MS total
    const startRotation = rotationRef.current;
    const startTime = performance.now();
    const easeInOutQuint = (t: number) =>
      t < 0.5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2;

    const animate = (now: number) => {
      const t = Math.min(1, (now - startTime) / SPIN_MS);
      const eased = easeInOutQuint(t);
      const current = startRotation + (finalRotation - startRotation) * eased;
      rotationRef.current = current;
      setRotation(current);

      if (t < 1) {
        requestAnimationFrame(animate);
        return;
      }

      rotationRef.current = finalRotation;
      setRotation(finalRotation);
      if (pendingStudent) {
        const second = participants[targetIndex];
        const validPair = second && canMatch(pendingStudent, second);
        if (validPair) {
          setWinners([pendingStudent, second]);
          setMatches((prev) => [
            { first: pendingStudent, second },
            ...prev,
          ]);
          setPendingStudent(null);
        }
      } else {
        // Feature the logged-in user in the first match when they are eligible.
        const eligibleSelf = participants.find(
          (student) => student.id === selfStudent?.id,
        );
        const first =
          eligibleSelf && !matchedIds.has(eligibleSelf.id)
            ? eligibleSelf
            : participants[targetIndex];
        if (first) setPendingStudent(first);
      }
      setIsSpinning(false);
    };
    requestAnimationFrame(animate);
  };

  if (!isDirector) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-xs font-semibold text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading students…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-6 text-center">
        <p className="text-xs font-semibold text-rose-700">Could not load students.</p>
      </div>
    );
  }

  if (roundComplete) {
    return (
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-fuchsia-50 px-4 py-8 text-center">
        <PartyPopper className="mx-auto h-7 w-7 text-fuchsia-500" />
        <p className="mt-2 text-sm font-bold text-slate-800">
          Round complete!
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          Everyone has found a match. Start a new round to mix everyone again.
        </p>
        <button
          type="button"
          onClick={() => {
            setMatches([]);
            setWinners(null);
            setPendingStudent(null);
          }}
          className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-[11px] font-bold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <Dices className="h-3.5 w-3.5" />
          New round
        </button>
      </div>
    );
  }

  if (unmatchedWheel.length < 2) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center">
        <UserRound className="mx-auto h-6 w-6 text-slate-300" />
        <p className="mt-2 text-xs font-semibold text-slate-500">
          Not enough students yet
        </p>
        <p className="mt-1 text-[11px] text-slate-400">
          We need at least two students to spin the wheel.
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center">
      <style>{`@keyframes spin-shimmer { 0% { background-position: -250% 0; } 100% { background-position: 250% 0; } }
@keyframes spin-text-shine { to { background-position: 300% 0; } }`}</style>
      {/* Two-column match area */}
      <div className="flex w-full items-stretch gap-1.5">
        <div className="min-w-0 flex-1">
          <MatchSlot
            student={pendingStudent ?? winners?.[0] ?? null}
            spinning={isSpinning}
            onExpand={
              pendingStudent
                ? () => setFullscreenStudent(pendingStudent)
                : winners?.[0]
                  ? () => setFullscreenStudent(winners[0])
                  : undefined
            }
            showFullPicture={showFullPictureCards}
          />
        </div>
        <div className="min-w-0 flex-1">
          <MatchSlot
            student={winners?.[1] ?? null}
            spinning={isSpinning}
            onExpand={winners?.[1] ? () => setFullscreenStudent(winners[1]) : undefined}
            showFullPicture={showFullPictureCards}
            emptyMessage={
              pendingStudent ? 'Spin again to find their match' : undefined
            }
          />
        </div>
      </div>

      <p className="mt-1 flex h-4 items-center justify-center gap-1 text-center text-[10px] font-medium text-slate-500">
        {winners && (
          <span className="font-black italic text-fuchsia-500">VS</span>
        )}
        {winners
          ? 'Say hello and get to know each other!'
          : pendingStudent && !isSpinning
            ? 'Spin again to find their match'
            : ''}
      </p>

      {/* View toggle */}
      <div className="mt-1 flex w-full items-center justify-between gap-2">
        <p className="text-[10px] font-medium text-slate-400">
          {unmatchedWheel.length} of {wheelStudents.length} students still in the mix
        </p>
        <div className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          <button
            type="button"
            onClick={() => setShowHistory(false)}
            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-bold transition ${
              !showHistory
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Dices className="h-3 w-3" />
            Wheel
          </button>
          <button
            type="button"
            onClick={() => setShowHistory(true)}
            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-bold transition ${
              showHistory
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="h-3 w-3" />
            History
            {matches.length > 0 && (
              <span
                className={`rounded-full px-1 text-[8px] font-black ${
                  showHistory ? 'bg-white/25 text-white' : 'bg-fuchsia-100 text-fuchsia-600'
                }`}
              >
                {matches.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {showHistory ? (
        <>
          {/* Full-width match history */}
          <div className="flex h-48 w-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)] sm:h-52">
            <div className="flex items-center justify-between gap-2 overflow-x-auto border-b border-slate-100 px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <p className="flex min-w-0 items-center gap-1.5 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                <History className="h-3 w-3 shrink-0 text-fuchsia-500" />
                <span className="truncate">Match history</span>
                <span className="shrink-0 rounded-full bg-fuchsia-50 px-1.5 py-0.5 text-[9px] font-bold text-fuchsia-600">
                  {matches.length}
                </span>
              </p>
              <button
                type="button"
                onClick={() => {
                  setMatches([]);
                  setWinners(null);
                  setPendingStudent(null);
                }}
                disabled={matches.length === 0}
                className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border border-slate-200 px-2 py-1 text-[9px] font-bold text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCcw className="h-3 w-3" />
                Reset session
              </button>
            </div>
            <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto p-2">
              {matches.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-3 py-6 text-center">
                  <History className="h-4 w-4 text-slate-300" />
                  <p className="text-[10px] font-semibold text-slate-400">
                    No matches yet
                  </p>
                  <p className="text-[9px] text-slate-400">
                    Spin the wheel to start your session.
                  </p>
                </div>
              ) : (
                matches.map((match, index) => (
                  <div
                    key={`${match.first.id}-${match.second.id}-${index}`}
                    className="flex items-center justify-between gap-3 border-b border-slate-100 px-1 pb-1.5"
                  >
                    <HistoryUserCard student={match.first} />
                    <Rose className="h-3.5 w-3.5 shrink-0 fill-rose-400 text-rose-400" />
                    <HistoryUserCard student={match.second} />
                  </div>
                ))
              )}
            </div>
          </div>

        </>
      ) : (
        <div className="flex h-48 w-full items-center justify-center sm:h-52">
      <div className="relative h-48 w-48 sm:h-52 sm:w-52">
        {/* Pointer */}
        <div className="absolute -top-1 left-1/2 z-20 h-0 w-0 -translate-x-1/2 border-x-[11px] border-t-[18px] border-x-transparent border-t-rose-500 drop-shadow" />

        {/* Rotating wheel */}
        <div
          className="absolute inset-0 overflow-hidden rounded-full border-4 border-white shadow-xl"
          style={{
            background: conicGradient,
            transform: `rotate(${rotation}deg)`,
            transition: 'none',
          }}
        >
          {participants.map((student, i) => {
            const mid = i * segmentAngle + segmentAngle / 2;
            const rad = (mid * Math.PI) / 180;
            const left = 50 + WHEEL_RADIUS_PCT * Math.sin(rad);
            const top = 50 - WHEEL_RADIUS_PCT * Math.cos(rad);
            return (
              <span
                key={student.id}
                className="absolute h-[22%] w-[22%] -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${left}%`, top: `${top}%` }}
              >
                <StudentAvatar
                  student={student}
                  sizeClass="h-full w-full"
                  textSize="text-[8px]"
                />
              </span>
            );
          })}
        </div>

        {/* Center hub = spin button */}
        <button
          type="button"
          onClick={spin}
          disabled={!canSpin}
          aria-label={
            isSpinning
              ? 'Spinning'
              : pendingStudent
                ? 'Spin for their match'
                : 'Spin'
          }
          title={
            isSpinning
              ? 'Spinning…'
              : pendingStudent
                ? 'Spin again to find their match'
                : 'Start spin'
          }
          className="absolute left-1/2 top-1/2 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white shadow-lg transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSpinning ? (
            <span className="relative flex h-7 w-7 items-center justify-center">
              <span
                className="absolute inset-0 animate-spin rounded-full border-2 border-dashed border-white/80"
                style={{ animationDuration: '0.9s' }}
              />
              <Dices className="h-5 w-5 animate-pulse" />
            </span>
          ) : (
            <span className="text-sm font-black tracking-wide">Spin</span>
          )}
        </button>
      </div>

      </div>
      )}

      <p className="mt-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
        <Users className="h-3 w-3 text-fuchsia-500" />
        Meet someone new
      </p>

      {/* Fullscreen image viewer */}
      {fullscreenStudent && (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setFullscreenStudent(null)}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setFullscreenStudent(null)}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="relative flex h-[75vh] w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-slate-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {fullscreenStudent.profileImageUrl ? (
              <Image
                src={fullscreenStudent.profileImageUrl}
                alt={`${fullscreenStudent.firstName} ${fullscreenStudent.lastName}`}
                fill
                sizes="(max-width: 640px) 90vw, 384px"
                className="object-contain"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-6xl font-bold text-white/20">
                {`${fullscreenStudent.firstName?.[0] || ''}${fullscreenStudent.lastName?.[0] || ''}`.toUpperCase()}
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-8">
              <p className="flex items-center justify-center gap-1 text-sm font-bold text-white">
                {fullscreenStudent.firstName} {fullscreenStudent.lastName}
                {fullscreenStudent.hasVerifiedBadge && (
                  <VerifiedBadge className="h-4 w-4" />
                )}
              </p>
              {fullscreenStudent.techCenter?.name && (
                <p className="text-center text-[11px] text-white/70">
                  {fullscreenStudent.techCenter.name}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
