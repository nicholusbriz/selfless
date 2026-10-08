'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Search,
  X,
  BookOpen,
  ArrowUp,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowDownUp,
  Send,
  Flame,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { SocialActions } from '@/components/social/SocialActions';
import {
  compareFollowersThenLikes,
  rankByTrending,
} from '@/lib/social/ranking';
import {
  patchStudentsShape,
  findInStudentsShape,
} from '@/lib/social/patchHelpers';
import type { PageCacheAdapter } from '@/lib/social/cacheKeys';
import { getTechCenterHue } from '@/lib/social/constants';

// ============================================================
// TYPES
// ============================================================

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  role: { name: string };
  techCenter: {
    id: string;
    name: string;
    country: { name: string };
  } | null;
  generalCourse: string | null;
  takesReligion: boolean | null;
  status: string;
  isActive: boolean;
  isVerified: boolean;
  verificationStatus: string;
  createdAt: string;
  studentCourses: Array<{
    id: string;
    code: string;
    courseUnit: string;
    credits: number;
    status: string;
  }>;
  followersCount: number;
  followingCount: number;
  likesReceivedCount: number;
  profileViewsCount: number;
  isFollowing: boolean;
  isLiked: boolean;
}

interface TechCenter {
  id: string;
  name: string;
  country: { name: string };
}

type Router = ReturnType<typeof useRouter>;
type FeedScope = 'following' | 'all';

// ============================================================
// PAGE CACHE ADAPTER
// ============================================================

const STUDENT_DIRECTORY_ADAPTERS: PageCacheAdapter[] = [
  {
    queryKey: ['studentDirectory'],
    patch: (old, targetId, patch) =>
      patchStudentsShape(old, targetId, patch),
    find: (old, targetId) => findInStudentsShape(old, targetId),
  },
];

// ============================================================
// SORT
// ============================================================

type SortOption =
  | 'trending'
  | 'popularity'
  | 'name'
  | 'newest'
  | 'active'
  | 'mostFollowed'
  | 'mostLiked';

const popularityScore = (s: Student): number =>
  (s.followersCount || 0) * 2 + (s.likesReceivedCount || 0);

const compareStudentNames = (a: Student, b: Student): number =>
  `${a.firstName} ${a.lastName}`
    .trim()
    .toLowerCase()
    .localeCompare(`${b.firstName} ${b.lastName}`.trim().toLowerCase());

const getStudentInitial = (student: Student): string =>
  student.firstName.trim().charAt(0).toUpperCase();

const sortStudents = (students: Student[], sortBy: SortOption): Student[] => {
  if (sortBy === 'trending') {
    return [...students].sort(compareFollowersThenLikes);
  }

  const copy = [...students];

  if (sortBy === 'popularity') {
    return copy.sort((a, b) => {
      const diff = popularityScore(b) - popularityScore(a);
      if (diff !== 0) return diff;
      return (
        b.followersCount - a.followersCount ||
        b.likesReceivedCount - a.likesReceivedCount ||
        `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`,
        )
      );
    });
  }
  if (sortBy === 'name') {
    return copy.sort(compareStudentNames);
  }
  if (sortBy === 'newest') {
    return copy.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }
  if (sortBy === 'mostFollowed') {
    return copy.sort((a, b) => b.followersCount - a.followersCount);
  }
  if (sortBy === 'mostLiked') {
    return copy.sort((a, b) => b.likesReceivedCount - a.likesReceivedCount);
  }
  return copy.sort((a, b) => Number(b.isActive) - Number(a.isActive));
};

// ============================================================
// MESSAGE COMPOSER
// ============================================================

function StudentMessageComposer({
  recipientId,
  recipientName,
}: {
  recipientId: string;
  recipientName: string;
}) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<'sent' | 'error' | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = message.trim();
    if (!content || isSending) return;

    setIsSending(true);
    setSendStatus(null);

    try {
      const conversationResponse = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId: recipientId }),
      });
      const conversationData = await conversationResponse
        .json()
        .catch(() => ({}));
      if (!conversationResponse.ok || !conversationData.conversation?.id) {
        throw new Error('Failed to start conversation');
      }

      const response = await fetch(
        `/api/messages/${conversationData.conversation.id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        },
      );
      if (!response.ok) throw new Error('Failed to send message');

      setMessage('');
      setSendStatus('sent');
    } catch {
      setSendStatus('error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="border-t border-[#E5E7EB] bg-[#FAFAF8] px-3 py-2">
      <form onSubmit={handleSubmit} className="flex min-w-0 items-center gap-1.5">
        <input
          type="text"
          value={message}
          onChange={(event) => {
            setMessage(event.target.value);
            setSendStatus(null);
          }}
          placeholder={`Message ${recipientName}...`}
          aria-label={`Message ${recipientName}`}
          disabled={isSending}
          className="h-8 min-w-0 flex-1 border border-[#D1D5DB] bg-white px-2 text-[11px] text-[#1A2B4C] placeholder:text-[#9CA3AF] focus:border-[#1A2B4C] focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!message.trim() || isSending}
          aria-label="Send message"
          title="Send message"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center bg-[#1A2B4C] text-white transition-colors hover:bg-[#23385d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B98A3E] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
      {sendStatus && (
        <p
          className={`mt-1 text-[10px] ${
            sendStatus === 'error' ? 'text-[#A4462F]' : 'text-[#55705B]'
          }`}
          aria-live="polite"
        >
          {sendStatus === 'sent' ? 'Message sent' : 'Could not send message'}
        </p>
      )}
    </div>
  );
}

// ============================================================
// STUDENT CARD (ENHANCED)
// ============================================================

const StudentCard = ({
  student,
  router,
  currentUserId,
  rank,
  isTrendingSection,
}: {
  student: Student;
  router: Router;
  currentUserId?: string;
  rank?: number;
  isTrendingSection?: boolean;
}) => {
  const initials = `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase();
  const fullName = `${student.firstName} ${student.lastName}`;
  const totalCredits =
    student.studentCourses?.reduce((t, c) => t + (c.credits || 0), 0) ?? 0;
  const hue = getTechCenterHue(student.techCenter?.name);
  const isCurrentUser = currentUserId === student.id;
  const roleLabel =
    student.role?.name === 'teacher'
      ? 'Tutor'
      : student.role?.name || 'Student';

  return (
    <article className="group flex w-[380px] shrink-0 snap-start flex-col border border-[#D1D5DB] bg-white transition-shadow hover:shadow-[0_2px_12px_rgba(26,43,76,0.08)]">
      {/* ── Header ─────────────────────────────────── */}
      <div className="relative bg-[#1A2B4C] px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate font-mono text-[10px] font-bold uppercase tracking-wider text-[#B98A3E]">
            {student.techCenter?.name || 'Student Record'}
          </span>
          {isTrendingSection ? (
            <span className="inline-flex shrink-0 items-center gap-1 bg-[#B98A3E] px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-white">
              <Flame className="h-2.5 w-2.5" />
              Trending
            </span>
          ) : (
            <span className="shrink-0 font-mono text-[9px] font-bold uppercase text-white/50">
              {roleLabel}
            </span>
          )}
        </div>
        {/* Accent bar tied to tech center hue */}
        <span
          className="absolute bottom-0 left-0 h-[2px] w-full opacity-80"
          style={{ backgroundColor: hue || '#B98A3E' }}
        />
      </div>

      {/* ── Two Column Layout ─────────────────────── */}
      <div className="flex gap-3 px-3 pt-3">
        {/* ── Column 1: Profile Image (extended down) ── */}
        <button
          type="button"
          onClick={() => router.push(`/dashboard/students/${student.id}`)}
          className={`relative h-auto w-28 shrink-0 overflow-hidden border bg-[#F7F6F2] ${
            isTrendingSection
              ? 'border-[#B98A3E] ring-2 ring-[#B98A3E]/30'
              : 'border-[#D1D5DB]'
          }`}
          aria-label={`Open ${fullName}'s profile`}
        >
          {student.profileImageUrl ? (
            <Image
              src={student.profileImageUrl}
              alt={fullName}
              fill
              className="object-cover"
              sizes="112px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#1A2B4C]">
              <span className="font-mono text-[24px] font-bold tracking-wider text-[#B98A3E]">
                {initials}
              </span>
            </div>
          )}
        </button>

        {/* ── Column 2: Name, Tech Center, Role, Stats ── */}
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => router.push(`/dashboard/students/${student.id}`)}
            className="block w-full text-left"
          >
            <h3 className="line-clamp-2 break-words text-[14px] font-bold leading-tight text-[#1A2B4C] hover:text-[#B98A3E] hover:underline">
              {fullName}
            </h3>
          </button>

          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#4B5646]">
            <span
              className="h-2 w-2 shrink-0 rounded-full border border-[#D1D5DB]"
              style={{ backgroundColor: hue || '#B98A3E' }}
            />
            <span className="truncate" title={student.techCenter?.name ?? ''}>
              {student.techCenter?.name ||
                student.techCenter?.country?.name ||
                'Campus Member'}
            </span>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            <span className="border border-[#D1D5DB] bg-[#F8F9FA] px-1.5 py-0.5 font-mono text-[9px] font-semibold text-[#4B5646]">
              {roleLabel}
            </span>
            {student.isActive && (
              <span className="inline-flex items-center gap-1 border border-[#55705B]/30 bg-[#55705B]/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-[#55705B]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#55705B]" />
                Active
              </span>
            )}
          </div>

          {/* Stats below badges */}
          <div className="mt-2 flex items-center gap-2 text-[10px]">
            <span className="font-mono font-bold text-[#1A2B4C]">
              {student.followersCount}
            </span>
            <span className="text-[#6B7280]">followers</span>
            <span className="text-[#6B7280]">•</span>
            <span className="font-mono font-bold text-[#1A2B4C]">
              {Math.max(0, student.likesReceivedCount)}
            </span>
            <span className="text-[#6B7280]">likes</span>
            <span className="text-[#6B7280]">•</span>
            <span className="font-mono font-bold text-[#1A2B4C]">
              {student.profileViewsCount}
            </span>
            <span className="text-[#6B7280]">views</span>
          </div>


        </div>
      </div>

      {/* ── Body ───────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-2.5 px-3 py-3">
        <div>
          <span className="block font-mono text-[9px] font-bold uppercase tracking-wide text-[#B98A3E]">
            Degree Program
          </span>
          <span className="mt-0.5 block truncate text-[11.5px] font-medium text-[#1A2B4C]">
            {student.generalCourse || 'General Curriculum'}
          </span>
        </div>

        {student.studentCourses?.length > 0 && (
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-wide text-[#1A2B4C]">
                <BookOpen className="h-3 w-3 text-[#B98A3E]" />
                Enrolled Units
              </span>
              <span className="font-mono text-[10px] font-bold text-[#1A2B4C]">
                {totalCredits} cr
              </span>
            </div>

            <ul className="space-y-1">
              {student.studentCourses.slice(0, 3).map((course) => (
                <li
                  key={course.id}
                  className="flex items-center justify-between gap-2 border-l-2 border-[#E5E7EB] pl-2 py-0.5"
                >
                  <span className="truncate text-[10.5px] text-[#1A2B4C]">
                    {course.courseUnit}
                  </span>
                  <span className="shrink-0 font-mono text-[9px] font-bold text-[#55705B]">
                    {course.credits}cr
                  </span>
                </li>
              ))}
            </ul>
            {student.studentCourses.length > 3 && (
              <p className="mt-1 pl-2 font-mono text-[9px] text-[#6B7280]">
                +{student.studentCourses.length - 3} more units
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Footer Actions ─────────────────────────── */}
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#E5E7EB] px-3 py-2">
        <button
          type="button"
          onClick={() => router.push(`/dashboard/students/${student.id}`)}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1A2B4C] hover:text-[#B98A3E]"
        >
          View profile
          <ChevronRight className="h-3 w-3" />
        </button>

        {!isCurrentUser && (
          <div className="flex min-w-0 flex-wrap items-center justify-end gap-1">
            <SocialActions
              userId={student.id}
              currentUserId={currentUserId}
              isFollowing={student.isFollowing}
              isLiked={student.isLiked}
              pageAdapters={STUDENT_DIRECTORY_ADAPTERS}
              size="xs"
              allowUnfollow={false}
              allowUnlike={true}
            />
          </div>
        )}
      </div>

      {!isCurrentUser && currentUserId && (
        <StudentMessageComposer
          recipientId={student.id}
          recipientName={fullName}
        />
      )}
    </article>
  );
};

// ============================================================
// HORIZONTAL RAIL
// ============================================================

function HorizontalRail({
  label,
  hue,
  students,
  router,
  currentUserId,
  showRank,
  isTrendingSection,
  enableAlphabetNav,
}: {
  label: string;
  hue?: string;
  students: Student[];
  router: Router;
  currentUserId?: string;
  showRank?: boolean;
  isTrendingSection?: boolean;
  enableAlphabetNav?: boolean;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const availableLetters = new Set(students.map(getStudentInitial));
  const visibleStudents = selectedLetter
    ? students
        .filter((student) => getStudentInitial(student) === selectedLetter)
        .sort(compareStudentNames)
    : students;

  const scrollLeft = () => {
    railRef.current?.scrollBy({ left: -620, behavior: 'smooth' });
  };
  const scrollRight = () => {
    railRef.current?.scrollBy({ left: 620, behavior: 'smooth' });
  };

  if (students.length === 0) {
    return (
      <section className="mb-6">
        <div className="mb-2.5 flex items-baseline gap-3 border-t border-[#1A2B4C] pt-2">
          {hue && (
            <span
              className="h-3 w-1 shrink-0"
              style={{ backgroundColor: hue }}
            />
          )}
          <h2 className="text-[15px] font-bold uppercase tracking-wide text-[#1A2B4C]">
            {label}
          </h2>
        </div>
        <div className="border border-[#D1D5DB] bg-white px-4 py-5 text-center">
          <p className="text-[12px] text-[#4B5646]">No student records available</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-6">
      <div className="mb-2.5 flex items-baseline border-t border-[#1A2B4C] pt-2">
        <div className="flex items-center gap-2">
          {hue && (
            <span
              className="h-3 w-1 shrink-0"
              style={{ backgroundColor: hue }}
            />
          )}
          <h2 className="text-[15px] font-bold uppercase tracking-wide text-[#1A2B4C]">
            {label}
          </h2>
        </div>
      </div>

      {enableAlphabetNav && (
        <nav
          aria-label={`Browse ${label} by first name`}
          className="mb-2 flex min-w-0 flex-nowrap items-center gap-2.5 overflow-x-auto whitespace-nowrap"
          style={{ scrollbarWidth: 'none' }}
        >
          <button
            type="button"
            onClick={() => setSelectedLetter(null)}
            aria-pressed={selectedLetter === null}
            className={`shrink-0 font-mono text-[10px] font-bold transition-colors focus-visible:outline-none focus-visible:underline ${
              selectedLetter === null
                ? 'text-[#B98A3E] underline underline-offset-4'
                : 'text-[#6B7280] hover:text-[#1A2B4C]'
            }`}
          >
            All
          </button>
          {letters.map((letter) => {
            const isAvailable = availableLetters.has(letter);
            return (
              <button
                key={letter}
                type="button"
                disabled={!isAvailable}
                onClick={() => setSelectedLetter(letter)}
                aria-label={`Show ${label} names beginning with ${letter}`}
                aria-pressed={selectedLetter === letter}
                className={`shrink-0 font-mono text-[10px] font-semibold transition-colors focus-visible:outline-none focus-visible:underline ${
                  selectedLetter === letter
                    ? 'text-[#B98A3E] underline underline-offset-4'
                    : isAvailable
                      ? 'text-[#1A2B4C] hover:text-[#B98A3E]'
                      : 'cursor-not-allowed text-[#C4C8CE]'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </nav>
      )}

      <div
        ref={railRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'thin', scrollSnapType: 'x mandatory' }}
      >
        {visibleStudents.map((student, idx) => (
          <StudentCard
            key={student.id}
            student={student}
            router={router}
            currentUserId={currentUserId}
            rank={showRank ? idx + 1 : undefined}
            isTrendingSection={isTrendingSection}
          />
        ))}
        <div className="w-1 shrink-0" aria-hidden />
      </div>

      <div className="mt-1 flex items-center justify-between gap-1">
        {/* Scroll indicator text */}
        {visibleStudents.length > 2 && (
          <div className="flex items-center gap-2 text-[11px] text-[#6B7280]">
            <span className="font-mono text-[10px] uppercase tracking-wider">Scroll to discover more</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        )}

        {/* Scroll buttons */}
        <div className="flex items-center gap-1 ml-auto">
          <button
            type="button"
            onClick={scrollLeft}
            aria-label="Scroll left"
            className="inline-flex h-6 w-6 items-center justify-center border border-[#D1D5DB] bg-white text-[#4B5646] hover:border-[#1A2B4C] hover:text-[#1A2B4C]"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={scrollRight}
            aria-label="Scroll right"
            className="inline-flex h-6 w-6 items-center justify-center border border-[#D1D5DB] bg-white text-[#4B5646] hover:border-[#1A2B4C] hover:text-[#1A2B4C]"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// SKELETON
// ============================================================

function StudentDirectorySkeleton() {
  return (
    <div className="space-y-5" aria-label="Loading student directory" aria-busy="true">
      {[0, 1, 2].map((rail) => (
        <section key={rail} className="mb-6">
          <div className="mb-2.5 flex items-center gap-2 border-t border-[#1A2B4C] pt-2">
            <span className="h-3 w-1 shrink-0 bg-[#D1D5DB]" />
            <span className="h-4 w-36 animate-pulse bg-[#E5E7EB]" />
          </div>
          <div className="flex gap-3 overflow-hidden pb-2">
            {[0, 1, 2, 3].map((card) => (
              <div
                key={card}
                aria-hidden="true"
                className="h-[280px] w-[380px] shrink-0 border border-[#D1D5DB] bg-white"
              >
                <div className="h-8 animate-pulse bg-[#E5E7EB]" />
                <div className="p-3">
                  <div className="flex gap-3">
                    <div className="h-24 w-28 shrink-0 animate-pulse bg-[#E5E7EB]" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="h-3 w-3/4 animate-pulse bg-[#E5E7EB]" />
                      <div className="h-2.5 w-1/2 animate-pulse bg-[#F0F1F2]" />
                      <div className="h-2 w-16 animate-pulse bg-[#F0F1F2]" />
                      <div className="h-2 w-24 animate-pulse bg-[#F0F1F2]" />
                      <div className="h-2 w-32 animate-pulse bg-[#F0F1F2]" />
                      <div className="h-2 w-40 animate-pulse bg-[#F0F1F2]" />
                    </div>
                  </div>
                  <div className="mt-4 h-2.5 w-1/3 animate-pulse bg-[#E5E7EB]" />
                  <div className="mt-2 h-3 w-2/3 animate-pulse bg-[#F0F1F2]" />
                  <div className="mt-4 h-8 animate-pulse bg-[#F0F1F2]" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// ============================================================
// SEARCH & FILTER BAR
// ============================================================

function SearchFilterBar({
  searchQuery,
  setSearchQuery,
  selectedLocation,
  setSelectedLocation,
  locations,
  isLoading,
  sortBy,
  setSortBy,
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedLocation: string;
  setSelectedLocation: (id: string) => void;
  locations: TechCenter[];
  isLoading: boolean;
  sortBy: SortOption;
  setSortBy: (s: SortOption) => void;
}) {
  const useDropdown = locations.length > 8;

  const chipBase =
    'inline-flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-bold border transition-colors';
  const chipOn = 'bg-[#1A2B4C] border-[#1A2B4C] text-white';
  const chipOff = 'bg-white border-[#D1D5DB] text-[#4B5646] hover:border-[#1A2B4C]';

  return (
    <section className="border border-[#1A2B4C] bg-white">
      <div className="bg-[#F7F6F2] px-3 py-2">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex items-center gap-1.5">
              <ArrowDownUp className="h-3 w-3 text-[#6B7280]" />
              <label htmlFor="sort-select" className="sr-only">
                Sort students
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-7 border border-[#D1D5DB] bg-white px-2 pr-6 text-[11px] font-normal text-[#1A2B4C] focus:border-[#1A2B4C] focus:outline-none"
              >
                <option value="trending">Trending</option>
                <option value="popularity">Most popular</option>
                <option value="name">Name (A–Z)</option>
                <option value="newest">Newest</option>
                <option value="active">Recently active</option>
                <option value="mostFollowed">Most followed</option>
                <option value="mostLiked">Most liked</option>
              </select>
            </div>
          </div>

          {useDropdown ? (
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="h-7 w-full border border-[#D1D5DB] bg-white px-2 text-[11px] font-normal text-[#1A2B4C] focus:border-[#1A2B4C] focus:outline-none"
            >
              <option value="all">All Tech Centers</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                onClick={() => setSelectedLocation('all')}
                className={`${chipBase} ${selectedLocation === 'all' ? chipOn : chipOff}`}
              >
                All
              </button>

              {locations.map((location) => {
                const isSelected = selectedLocation === location.id;
                const hue = getTechCenterHue(location.name);

                return (
                  <button
                    key={location.id}
                    type="button"
                    onClick={() => setSelectedLocation(location.id)}
                    className={`${chipBase} ${isSelected ? chipOn : chipOff}`}
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0 border border-[#D1D5DB]"
                      style={{ backgroundColor: hue }}
                    />
                    <span>{location.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {selectedLocation !== 'all' && (
            <div className="flex items-center gap-2 text-[11px] text-[#4B5646]">
              <span>Active center:</span>
              <span className="font-bold text-[#1A2B4C]">
                {locations.find((l) => l.id === selectedLocation)?.name}
              </span>
              <button
                type="button"
                onClick={() => setSelectedLocation('all')}
                className="text-[#A4462F] underline hover:text-[#1A2B4C]"
              >
                Clear filter
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-[#D1D5DB] px-3 py-2">
        <div className="relative w-full">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6B7280]"
          />
          <input
            type="text"
            inputMode="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student records by name or course unit..."
            aria-label="Search students"
            className="h-8 w-full border border-[#D1D5DB] bg-white pl-8 pr-7 text-[12px] font-normal text-[#1A2B4C] placeholder:text-[#9CA3AF] focus:border-[#1A2B4C] focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1A2B4C]"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// COMMUNITY TICKER
// ============================================================

function CommunityTicker({ students }: { students: Student[] }) {
  const profileStudents = students.filter(
    (student) =>
      typeof student.profileImageUrl === 'string' &&
      student.profileImageUrl.trim().length > 0,
  );
  const tickerStudents = [...profileStudents, ...profileStudents];

  return (
    <div className="border border-[#1A2B4C] bg-[#1A2B4C]">
      <div className="flex h-9 items-center overflow-hidden">
        <div className="flex h-full shrink-0 items-center border-r border-white/20 bg-[#0F1923] px-3">
          <span className="font-mono text-[9px] font-bold tracking-widest text-[#B98A3E] uppercase">
            Directory Stream
          </span>
        </div>

        <div className="relative min-w-0 flex-1 overflow-hidden">
          {profileStudents.length > 0 ? (
            <div className="student-avatar-ticker flex w-max items-center gap-2 px-3">
              {tickerStudents.map((student, index) => (
                <div
                  key={`${student.id}-${index}`}
                  className="relative h-6 w-6 shrink-0 border border-white/30 overflow-hidden bg-white"
                  title={`${student.firstName} ${student.lastName}`}
                >
                  <Image
                    src={student.profileImageUrl!}
                    alt={`${student.firstName} ${student.lastName}`}
                    fill
                    sizes="24px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="px-3 text-[11px] text-white/70">
              Active student roster
            </p>
          )}
        </div>
      </div>

      <style jsx>{`
        .student-avatar-ticker {
          animation: studentAvatarTicker 34s linear infinite;
          will-change: transform;
        }
        @keyframes studentAvatarTicker {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .student-avatar-ticker {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function StudentsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('trending');
  const [feedScope, setFeedScope] = useState<FeedScope>('all');

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const {
    data,
    isLoading,
    error,
    refetch: refetchStudents,
  } = useQuery({
    queryKey: ['studentDirectory'],
    queryFn: async () => {
      const response = await fetch('/api/students');
      if (!response.ok) throw new Error('Failed to fetch students');
      return response.json() as Promise<{
        studentsByTechCenter: Record<string, Student[]>;
        techCenters: TechCenter[];
      }>;
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000,
  });

  const studentsByTechCenter = useMemo(
    () => data?.studentsByTechCenter ?? {},
    [data?.studentsByTechCenter],
  );
  const techCenters = data?.techCenters ?? [];

  const allStudents = useMemo(
    () => Object.values(studentsByTechCenter).flat() as Student[],
    [studentsByTechCenter],
  );

  const scopedStudents = useMemo(() => {
    if (feedScope === 'following') {
      return allStudents.filter((s) => s.isFollowing);
    }
    return allStudents;
  }, [allStudents, feedScope]);

  const filterStudents = (students: Student[]) => {
    let filtered = students;
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(
        (student) => student.techCenter?.id === selectedLocation,
      );
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((student) => {
        const fullName =
          `${student.firstName} ${student.lastName}`.toLowerCase();
        return (
          fullName.includes(query) ||
          student.studentCourses?.some(
            (course) =>
              course.code.toLowerCase().includes(query) ||
              course.courseUnit.toLowerCase().includes(query),
          ) ||
          (student.generalCourse &&
            student.generalCourse.toLowerCase().includes(query)) ||
          (student.techCenter &&
            student.techCenter.name.toLowerCase().includes(query))
        );
      });
    }
    return filtered;
  };

  const filteredScoped = useMemo(
    () => filterStudents(scopedStudents),
    [scopedStudents, selectedLocation, searchQuery],
  );
  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#1A2B4C]">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        
        {/* Institutional Header Banner */}
        <div className="mb-5 border border-[#1A2B4C] bg-[#1A2B4C] p-4 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-[#B98A3E]">
                Official Directory
              </p>
              <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                Student Directory & Academic Roster
              </h1>
              <p className="mt-1 text-[11px] text-white/80">
                Browse student profiles, course registrations, and institutional campus locations.
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFeedScope('all')}
                className={`border px-3 py-1.5 text-[11px] font-bold transition-colors ${
                  feedScope === 'all'
                    ? 'border-[#B98A3E] bg-[#B98A3E] text-white'
                    : 'border-white/20 bg-[#1A2B4C] text-white hover:border-white'
                }`}
              >
                All Students
              </button>
              {currentUserId && (
                <button
                  type="button"
                  onClick={() => setFeedScope('following')}
                  className={`border px-3 py-1.5 text-[11px] font-bold transition-colors ${
                    feedScope === 'following'
                      ? 'border-[#B98A3E] bg-[#B98A3E] text-white'
                      : 'border-white/20 bg-[#1A2B4C] text-white hover:border-white'
                  }`}
                >
                    Following
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Community Ticker */}
        {!isSearching && !isLoading && (
          <div className="mb-5">
            <CommunityTicker students={allStudents} />
          </div>
        )}

        {/* Search & Filter Section */}
        <div className="mb-6">
          <SearchFilterBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
            locations={techCenters}
            isLoading={isLoading}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        </div>

        {/* Dynamic Rails / Content */}
        {isLoading ? (
          <StudentDirectorySkeleton />
        ) : error ? (
          <div className="border border-[#A4462F] bg-white p-6 text-center">
            <AlertCircle className="mx-auto h-6 w-6 text-[#A4462F]" />
            <p className="mt-2 text-[12px] font-bold text-[#1A2B4C]">
              Unable to load roster records.
            </p>
            <button
              type="button"
              onClick={() => void refetchStudents()}
              className="mt-3 border border-[#1A2B4C] bg-[#1A2B4C] px-3 py-1 text-[11px] font-bold text-white hover:bg-[#23385d]"
            >
              Retry
            </button>
          </div>
        ) : filteredScoped.length === 0 ? (
          <div className="border border-dashed border-[#D1D5DB] bg-white p-10 text-center">
            <Users className="mx-auto h-8 w-8 text-[#6B7280]" />
            <h3 className="mt-2 text-[13px] font-bold text-[#1A2B4C]">
              No matching student records found
            </h3>
            <p className="mt-1 text-[11px] text-[#6B7280]">
              Modify your search keywords or campus filter parameters.
            </p>
          </div>
        ) : (
          <div>
            {!isSearching && selectedLocation === 'all' && (
              <>
                <HorizontalRail
                  label="Trending Student Profiles"
                  hue="#B98A3E"
                  students={rankByTrending(filteredScoped).slice(0, 10)}
                  router={router}
                  currentUserId={currentUserId}
                  showRank={true}
                  isTrendingSection={true}
                />

                <HorizontalRail
                  label="All Students"
                  hue="#1A2B4C"
                  students={sortStudents(filteredScoped, 'name')}
                  router={router}
                  currentUserId={currentUserId}
                  enableAlphabetNav={true}
                />
              </>
            )}

            {techCenters.map((loc) => {
              if (selectedLocation !== 'all' && loc.id !== selectedLocation) {
                return null;
              }

              const centerStudents = filteredScoped.filter(
                (s) => s.techCenter?.id === loc.id,
              );
              if (
                isSearching
                  ? centerStudents.length === 0
                  : centerCentersCountIsZeroAndShouldHideIfUnfiltered(
                      selectedLocation,
                      centerStudents.length,
                    )
              ) return null;
              return (
                <HorizontalRail
                  key={loc.id}
                  label={loc.name}
                  hue={getTechCenterHue(loc.name)}
                  students={sortStudents(centerStudents, sortBy)}
                  router={router}
                  currentUserId={currentUserId}
                  enableAlphabetNav={true}
                />
              );
            })}
          </div>
        )}

        {/* Back to Top */}
        {showBackToTop && (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Back to top"
            className="fixed bottom-5 right-5 z-50 inline-flex h-8 w-8 items-center justify-center border border-[#1A2B4C] bg-[#1A2B4C] text-white hover:bg-[#23385d]"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function centerCentersCountIsZeroAndShouldHideIfUnfiltered(selectedLocation: string, len: number) {
  return selectedLocation === 'all' && len === 0;
}