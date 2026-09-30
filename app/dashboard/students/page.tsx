'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Search,
  X,
  BookOpen,
  ArrowUp,
  AlertCircle,
  ChevronRight,
  Eye,
  ArrowDownUp,
  LayoutGrid,
  List,
  Heart,
  UserPlus,
  Loader2,
  Check,
  Send,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Message } from '@/types/messaging';

// ============================================================
// STUDENTS DIRECTORY
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
  isFollowing?: boolean;
  isLiked?: boolean;
}

interface TechCenter {
  id: string;
  name: string;
  country: { name: string };
  _count?: { students: number };
}

type Router = ReturnType<typeof useRouter>;

// ============================================================
// TECH CENTER HUES
// ============================================================

const TECH_CENTER_HUES: Record<string, string> = {
  'Freedom City Tech Center': '#55705B',
  'Kampala Central': '#3E5C76',
  'Gulu Hub': '#7C3AED',
  'Mbarara Tech': '#B98A3E',
  'Jinja Center': '#A4462F',
};

const getTechCenterHue = (name: string | undefined): string => {
  if (!name) return '#9CA3AF';
  if (TECH_CENTER_HUES[name]) return TECH_CENTER_HUES[name];

  const palette = ['#55705B', '#3E5C76', '#7C3AED', '#B98A3E', '#A4462F', '#0F766E'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
};

// ============================================================
// SORT HELPERS
// ============================================================

type SortOption =
  | 'popularity'
  | 'name'
  | 'newest'
  | 'active'
  | 'mostFollowed'
  | 'mostLiked';

const popularityScore = (s: Student): number =>
  (s.followersCount || 0) * 2 + (s.likesReceivedCount || 0);

const sortStudents = (students: Student[], sortBy: SortOption): Student[] => {
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
    return copy.sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.trim().toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.trim().toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }
  if (sortBy === 'newest') {
    return copy.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
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
// SKELETONS
// ============================================================

const SkeletonCard = () => (
  <article className="bg-white shadow-md rounded-lg overflow-hidden animate-pulse">
    <div className="grid grid-cols-3">
      {/* Top-left: avatar block */}
      <div className="bg-[#F7F6F2] aspect-square" />
      {/* Top-right: info block */}
      <div className="col-span-2 px-2.5 py-2 space-y-1.5">
        <div className="h-3 w-3/4 bg-[#E5E7EB] rounded" />
        <div className="h-2.5 w-1/2 bg-[#F3F4F6] rounded" />
        <div className="flex items-center gap-2 pt-1">
          <div className="h-2.5 w-10 bg-[#E5E7EB] rounded" />
          <div className="h-2.5 w-10 bg-[#F3F4F6] rounded" />
        </div>
      </div>

      {/* Bottom: course area */}
      <div className="col-span-3 px-2.5 py-2 border-t border-[#F3F4F6] space-y-1.5">
        <div className="h-2.5 w-24 bg-[#F3F4F6] rounded" />
        <div className="h-3 w-4/5 bg-[#E5E7EB] rounded" />
        <div className="h-3 w-3/5 bg-[#F3F4F6] rounded" />
      </div>

      {/* Footer actions */}
      <div className="col-span-3 px-2.5 py-1.5 border-t border-[#F3F4F6] flex items-center justify-between">
        <div className="h-3 w-16 bg-[#E5E7EB] rounded" />
        <div className="flex items-center gap-1">
          <div className="h-4 w-10 bg-[#F3F4F6] rounded" />
          <div className="h-4 w-12 bg-[#F3F4F6] rounded" />
        </div>
      </div>
    </div>
  </article>
);

const SkeletonListCard = () => (
  <article className="bg-white shadow-sm rounded-lg overflow-hidden animate-pulse">
    <div className="px-4 py-3 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 w-40 bg-[#E5E7EB] rounded" />
          <div className="h-2.5 w-52 bg-[#F3F4F6] rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-14 bg-[#E5E7EB] rounded" />
          <div className="h-3 w-10 bg-[#F3F4F6] rounded" />
        </div>
      </div>

      <div className="space-y-1">
        <div className="h-2.5 w-28 bg-[#F3F4F6] rounded" />
        <div className="h-3 w-5/6 bg-[#E5E7EB] rounded" />
      </div>

      <div className="pt-2 border-t border-[#F3F4F6] flex items-center justify-between">
        <div className="h-3 w-16 bg-[#E5E7EB] rounded" />
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-10 bg-[#F3F4F6] rounded" />
          <div className="h-4 w-12 bg-[#F3F4F6] rounded" />
        </div>
      </div>
    </div>
  </article>
);

const SectionHeaderSkeleton = () => (
  <div className="mb-4 flex items-center gap-2.5 animate-pulse">
    <span className="h-4 w-[3px] rounded-full bg-[#E5E7EB]" />
    <div className="h-4 w-40 bg-[#E5E7EB] rounded" />
    <div className="h-6 w-20 bg-[#F3F4F6] rounded" />
  </div>
);

const StudentsGridSkeleton = ({
  viewMode,
  count = 6,
}: {
  viewMode: 'grid' | 'list';
  count?: number;
}) => {
  if (viewMode === 'grid') {
    return (
      <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }
  return (
    <div className="grid gap-2 grid-cols-1">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonListCard key={i} />
      ))}
    </div>
  );
};

const SectionSkeleton = ({ viewMode }: { viewMode: 'grid' | 'list' }) => (
  <section className="mb-8">
    <SectionHeaderSkeleton />
    <StudentsGridSkeleton viewMode={viewMode} count={6} />
  </section>
);

const FullPageSkeleton = ({ viewMode }: { viewMode: 'grid' | 'list' }) => (
  <div className="min-h-screen bg-[#F7F6F2]">
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-6">
      {/* Header skeleton */}
      <div className="animate-pulse space-y-3">
        <div className="flex gap-1.5">
          <div className="h-7 w-20 bg-white border border-[#E5E7EB] rounded" />
          <div className="h-7 w-20 bg-white border border-[#E5E7EB] rounded" />
          <div className="h-7 w-20 bg-white border border-[#E5E7EB] rounded" />
        </div>
        <div className="h-8 w-40 bg-white border border-[#E5E7EB] rounded" />
        <div className="h-4 w-64 bg-white border border-[#E5E7EB] rounded" />
      </div>

      {/* Search/filter skeleton */}
      <div className="mt-4 h-24 bg-white border border-[#E5E7EB] rounded-lg shadow-md animate-pulse" />

      {/* Ticker skeleton */}
      <div className="mt-4 h-14 bg-white border border-[#E5E7EB] rounded-lg shadow-md animate-pulse" />

      {/* Sections skeleton — 3 fake sections */}
      <div className="pt-6">
        {[1, 2, 3].map((i) => (
          <SectionSkeleton key={i} viewMode={viewMode} />
        ))}
      </div>
    </div>
  </div>
);

// ============================================================
// SEARCH & FILTER
// ============================================================

const SearchFilterBar = ({
  searchQuery,
  setSearchQuery,
  selectedLocation,
  setSelectedLocation,
  locations,
  totalStudents,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedLocation: string;
  setSelectedLocation: (id: string) => void;
  locations: TechCenter[];
  totalStudents: number;
  sortBy: SortOption;
  setSortBy: (s: SortOption) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
}) => {
  const activeLocation = locations.find((loc) => loc.id === selectedLocation);

  const chipBase =
    'inline-flex items-center justify-center gap-1.5 min-h-[34px] px-3 py-1.5 border text-[12px] font-semibold leading-tight transition-colors duration-150 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B98A3E] focus-visible:ring-offset-1';

  const chipOn = 'bg-[#1A2B4C] border-[#1A2B4C] text-white';
  const chipOff =
    'bg-white border-[#E5E7EB] text-[#374151] hover:border-[#B98A3E] hover:text-[#1A2B4C] hover:bg-[#F8F9FA]';

  const useDropdown = locations.length > 8;

  return (
    <section className="rounded-lg border border-[#E5E7EB] bg-white shadow-md">
      {/* SEARCH */}
      <div className="px-4 py-4 sm:px-5">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="h-4 w-[3px] bg-[#B98A3E] rounded-full" />
              <h2 className="text-[16px] font-bold tracking-tight text-[#1A2B4C]">
                Search students
              </h2>
            </div>
            <p className="mt-1 text-[13px] text-[#4B5646]">
              Find students by name, course, or tech center.
            </p>
          </div>

          <div className="relative w-full md:w-[390px] lg:w-[450px] shrink-0">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none"
              strokeWidth={2}
            />
            <input
              type="text"
              inputMode="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students, courses..."
              aria-label="Search students"
              className="
                w-full h-10 pl-10 pr-9
                bg-[#F7F6F2]
                border border-[#E5E7EB] rounded
                text-[#1A2B4C]
                placeholder:text-[#9CA3AF]
                text-[14px] font-semibold
                focus:outline-none
                focus:bg-white
                focus:border-[#B98A3E]
                transition-colors
              "
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#6B7280] hover:text-[#1A2B4C]"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="border-t border-[#E5E7EB] bg-[#F7F6F2] px-4 py-3 sm:px-5">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#B98A3E] font-bold">
                Tech centers
              </span>
              <span className="inline-flex items-center gap-1 border border-[#E5E7EB] bg-white px-2 py-1 rounded">
                <Users className="w-3.5 h-3.5 text-[#1A2B4C]" strokeWidth={2} />
                <span className="font-mono text-[12px] font-bold text-[#1A2B4C] tabular-nums">
                  {totalStudents}
                </span>
              </span>
            </div>

            <div className="ml-auto flex items-center gap-1.5">
              <ArrowDownUp className="w-4 h-4 text-[#B98A3E]" />
              <label htmlFor="sort-select" className="sr-only">
                Sort students
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="
                  h-9 px-3 pr-8
                  bg-white border border-[#E5E7EB] rounded
                  text-[12px] font-bold text-[#1A2B4C]
                  focus:outline-none focus:border-[#B98A3E]
                  cursor-pointer
                "
              >
                <option value="popularity">Sort: Most Popular</option>
                <option value="name">Sort: Name (A–Z)</option>
                <option value="newest">Sort: Newest</option>
                <option value="active">Sort: Recently Active</option>
                <option value="mostFollowed">Sort: Most Followed</option>
                <option value="mostLiked">Sort: Most Liked</option>
              </select>
            </div>
          </div>

          {useDropdown ? (
            <div className="flex items-center gap-2">
              <label htmlFor="tech-center-select" className="sr-only">
                Filter by tech center
              </label>
              <select
                id="tech-center-select"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="
                  w-full h-10 px-3
                  bg-white border border-[#E5E7EB] rounded
                  text-[13px] font-bold text-[#1A2B4C]
                  focus:outline-none focus:border-[#B98A3E]
                  cursor-pointer
                "
              >
                <option value="all">
                  All tech centers ({totalStudents})
                </option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc._count?.students || 0})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div
              className="flex flex-wrap items-center gap-1.5"
              role="tablist"
              aria-label="Filter by tech center"
            >
              <button
                type="button"
                role="tab"
                aria-selected={selectedLocation === 'all'}
                onClick={() => setSelectedLocation('all')}
                className={`${chipBase} ${selectedLocation === 'all' ? chipOn : chipOff}`}
              >
                <Users className="w-3.5 h-3.5" strokeWidth={2.2} />
                <span>All</span>
                <span
                  className={`font-mono text-[11px] tabular-nums ${
                    selectedLocation === 'all' ? 'text-white/80' : 'text-[#6B7280]'
                  }`}
                >
                  {totalStudents}
                </span>
              </button>

              {locations.map((location) => {
                const count = location._count?.students || 0;
                const isSelected = selectedLocation === location.id;
                const hue = getTechCenterHue(location.name);

                return (
                  <button
                    key={location.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setSelectedLocation(location.id)}
                    title={location.name}
                    className={`${chipBase} ${isSelected ? chipOn : chipOff}`}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: isSelected ? '#fff' : hue }}
                    />
                    <span className="break-words text-left">{location.name}</span>
                    <span
                      className={`font-mono text-[11px] tabular-nums ${
                        isSelected ? 'text-white/80' : 'text-[#6B7280]'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {selectedLocation !== 'all' && (
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] text-[#6B7280]">Showing</span>
              <span className="inline-flex items-center gap-1.5 border border-[#E5E7EB] bg-white px-2 py-1 text-[12px] font-bold text-[#1A2B4C] rounded">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: getTechCenterHue(activeLocation?.name) }}
                />
                {activeLocation?.name || 'Selected center'}
                <Check className="w-3 h-3 text-[#B98A3E]" strokeWidth={3} />
              </span>
            </div>
          )}

          <div className="flex items-center gap-1 border border-[#E5E7EB] bg-white rounded-lg p-1 ml-auto">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[#B98A3E] text-white'
                  : 'text-[#6B7280] hover:text-[#1A2B4C]'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" strokeWidth={2} />
              <span className="text-[12px] font-semibold">Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-[#B98A3E] text-white'
                  : 'text-[#6B7280] hover:text-[#1A2B4C]'
              }`}
              title="List view"
            >
              <List className="w-3.5 h-3.5" strokeWidth={2} />
              <span className="text-[12px] font-semibold">List</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================================
// STUDENT CARD (Grid View)
// ============================================================

const StudentCard = ({
  student,
  router,
  currentUserId,
  onFollowToggle,
  onLikeToggle,
  isFollowing,
  isLiked,
  isFollowLoading,
}: {
  student: Student;
  router: Router;
  currentUserId?: string;
  onFollowToggle?: (studentId: string) => void;
  onLikeToggle?: (studentId: string) => void;
  isFollowing?: boolean;
  isLiked?: boolean;
  isFollowLoading?: boolean;
}) => {
  const getInitials = (firstName: string, lastName: string) =>
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const getTotalCredits = (s: Student) =>
    s.studentCourses?.reduce(
      (total, course) => total + (course.credits || 0),
      0,
    ) ?? 0;

  const initials = getInitials(student.firstName, student.lastName);
  const fullName = `${student.firstName} ${student.lastName}`;
  const totalCredits = getTotalCredits(student);
  const hue = getTechCenterHue(student.techCenter?.name);
  const isCurrentUser = currentUserId === student.id;

  return (
    <article
      className="
        group bg-white shadow-md rounded-lg
        overflow-hidden
        transition-all duration-200
        hover:shadow-lg hover:-translate-y-0.5
      "
    >
      <div className="grid grid-cols-3">
        <div className="relative bg-[#F7F6F2] aspect-square">
          {student.profileImageUrl ? (
            <Image
              src={student.profileImageUrl}
              alt={fullName}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 33vw, 160px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#1A2B4C]">
              <span className="text-white text-[18px] font-mono font-bold">
                {initials}
              </span>
            </div>
          )}
        </div>

        <div className="col-span-2 px-2.5 py-2 flex flex-col justify-center">
          <div className="flex items-start justify-between gap-1 mb-1">
            <h3 className="text-[13px] font-bold leading-tight text-[#1A2B4C] break-words flex-1">
              {fullName}
            </h3>
            <span className="text-[9px] font-semibold text-[#4B5646] shrink-0 bg-[#F7F6F2] px-1 py-0.5 rounded">
              {student.role?.name === 'teacher'
                ? 'Tutor'
                : student.role?.name || 'Student'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-[#4B5646] mb-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: hue }}
            />
            <span className="truncate font-medium">
              {student.techCenter?.name || 'No location'}
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-[9px]">
            <div className="flex items-center gap-0.5">
              <Users className="w-2.5 h-2.5 text-[#B98A3E]" strokeWidth={2.2} />
              <span className="font-mono font-bold text-[#1A2B4C]">
                {student.followersCount}
              </span>
              <span className="text-[#6B7280] font-medium">followers</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Heart className="w-2.5 h-2.5 text-red-500" strokeWidth={2.2} />
              <span className="font-mono font-bold text-[#1A2B4C]">
                {Math.max(0, student.likesReceivedCount)}
              </span>
              <span className="text-[#6B7280] font-medium">likes</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Eye className="w-2.5 h-2.5 text-[#3E5C76]" strokeWidth={2.2} />
              <span className="font-mono font-bold text-[#1A2B4C]">
                {student.profileViewsCount}
              </span>
              <span className="text-[#6B7280] font-medium">views</span>
            </div>
          </div>

          {!isCurrentUser && currentUserId && (
            <div className="mt-1 min-w-0">
              <StudentMessageComposer
                recipientId={student.id}
                currentUserId={currentUserId}
              />
            </div>
          )}
        </div>

        <div className="col-span-3 px-2.5 pt-1.5 pb-1">
          <div>
            <p className="font-mono text-[8px] uppercase tracking-[0.09em] text-[#B98A3E] font-bold mb-0.5">
              General Degree Course
            </p>
            <p className="text-[11px] font-semibold text-[#1A2B4C] break-words leading-4 mb-1">
              {student.generalCourse || 'Not specified'}
            </p>
          </div>

          {student.studentCourses?.length > 0 && (
            <div>
              <p className="flex items-center justify-between gap-1 font-mono text-[8px] uppercase tracking-[0.1em] text-[#B98A3E] font-bold mb-0.5">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-2.5 h-2.5 text-[#B98A3E]" strokeWidth={2.2} />
                  Course Units
                </span>
                <span className="text-[#1A2B4C]">{totalCredits} cr</span>
              </p>
              <div className="divide-y divide-[#EDF1F4]">
                {student.studentCourses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between gap-1.5"
                  >
                    <span className="min-w-0 flex-1 break-words text-[10px] font-semibold leading-tight text-[#1A2B4C]">
                      {course.courseUnit}
                    </span>
                    <span className="shrink-0 rounded-sm bg-[#F7F6F2] px-1 font-mono text-[9px] font-bold tabular-nums text-[#4B5646]">
                      {course.credits}cr
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="col-span-3 px-2.5 py-1 flex items-center justify-between flex-wrap gap-1">
          <button
            type="button"
            onClick={() => router.push(`/dashboard/students/${student.id}`)}
            className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#B98A3E] transition-colors hover:text-[#1A2B4C] cursor-pointer"
          >
            View Profile
            <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </button>

          {!isCurrentUser && (
            <div className="flex items-center gap-1">
              {isLiked ? (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-red-500 bg-red-50 text-red-600">
                  <Heart className="w-3 h-3 fill-red-500 text-red-500" strokeWidth={2} />
                  <span className="text-[9px] font-bold">Liked</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onLikeToggle?.(student.id)}
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-white hover:border-[#B98A3E] transition-colors"
                  title="Like"
                >
                  <Heart className="w-3 h-3 text-[#6B7280]" strokeWidth={2} />
                  <span className="text-[9px] font-bold text-[#1A2B4C]">Like</span>
                </button>
              )}

              {isFollowing ? (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-[#55705B] bg-[#55705B] text-[9px] font-bold text-white">
                  Following
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onFollowToggle?.(student.id)}
                  disabled={isFollowLoading}
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-white hover:border-[#B98A3E] text-[#1A2B4C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Follow"
                >
                  {isFollowLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} />
                  ) : (
                    <UserPlus className="w-3 h-3" strokeWidth={2} />
                  )}
                  <span className="text-[9px] font-bold">Follow</span>
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </article>
  );
};

const StudentMessageComposer = ({
  recipientId,
  currentUserId,
}: {
  recipientId: string;
  currentUserId: string;
}) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<'sent' | 'error' | null>(null);
  const queryClient = useQueryClient();

  const handleSend = async () => {
    const content = message.trim();
    if (!content || isSending) return;

    setIsSending(true);
    setMessage('');
    setSendStatus('sent');

    try {
      const conversationResponse = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId: recipientId }),
      });
      const conversationData = await conversationResponse.json().catch(() => ({}));
      if (!conversationResponse.ok || !conversationData.conversation?.id) {
        throw new Error(conversationData.error || 'Failed to start conversation');
      }

      const conversationId = conversationData.conversation.id as string;
      const messageResponse = await fetch(`/api/messages/${conversationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const messageData = await messageResponse.json().catch(() => ({}));
      if (!messageResponse.ok) {
        throw new Error(messageData.error || 'Failed to send message');
      }

      if (messageData.message) {
        queryClient.setQueryData<Message[] | undefined>(
          ['messages', conversationId],
          (oldMessages) => {
            if (!oldMessages) return oldMessages;
            if (oldMessages.some((item) => item.id === messageData.message.id)) {
              return oldMessages;
            }
            return [...oldMessages, messageData.message];
          },
        );
      }
      void queryClient.invalidateQueries({
        queryKey: ['conversations', currentUserId],
      });
    } catch {
      setMessage(content);
      setSendStatus('error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void handleSend();
      }}
      className="flex w-full min-w-0 items-center gap-1"
    >
      <input
        type="text"
        value={message}
        onChange={(event) => {
          setMessage(event.target.value);
          setSendStatus(null);
        }}
        placeholder="Write a message..."
        aria-label="Write a message"
        disabled={isSending}
        className="h-7 min-w-0 w-0 flex-1 rounded border border-[#E5E7EB] px-2 text-[11px] text-[#1A2B4C] placeholder:text-[#9CA3AF] focus:border-[#B98A3E] focus:outline-none disabled:opacity-60 sm:w-28 sm:flex-none"
      />
      <button
        type="submit"
        disabled={!message.trim() || isSending}
        aria-label="Send message"
        title="Send message"
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[#1A2B4C] text-white transition-colors hover:bg-[#2C3E5A] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Send className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
      <span
        className={`shrink-0 text-[10px] ${sendStatus === 'error' ? 'text-[#A4462F]' : 'text-[#55705B]'}`}
        aria-live="polite"
      >
        {sendStatus === 'sent' ? 'Sent' : sendStatus === 'error' ? 'Failed' : ''}
      </span>
    </form>
  );
};

// ============================================================
// STUDENT LIST CARD (List View)
// ============================================================

const StudentListCard = ({
  student,
  router,
  currentUserId,
  onFollowToggle,
  onLikeToggle,
  isFollowing,
  isLiked,
  isFollowLoading,
}: {
  student: Student;
  router: Router;
  currentUserId?: string;
  onFollowToggle?: (studentId: string) => void;
  onLikeToggle?: (studentId: string) => void;
  isFollowing?: boolean;
  isLiked?: boolean;
  isFollowLoading?: boolean;
}) => {
  const getTotalCredits = (s: Student) =>
    s.studentCourses?.reduce(
      (total, course) => total + (course.credits || 0),
      0,
    ) ?? 0;

  const fullName = `${student.firstName} ${student.lastName}`;
  const totalCredits = getTotalCredits(student);
  const hue = getTechCenterHue(student.techCenter?.name);
  const isCurrentUser = currentUserId === student.id;

  return (
    <article className="bg-white shadow-sm rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-bold text-[#1A2B4C] truncate">
              {fullName}
            </h3>

            <div className="mt-1 flex items-center gap-2 text-[12px] text-[#4B5646]">
              <span className="flex shrink-0 items-center gap-1 whitespace-nowrap">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: hue }}
                />
                <span className="whitespace-nowrap font-medium">
                  {student.techCenter?.name || 'No location'}
                </span>
              </span>

              <span className="ml-auto shrink-0 whitespace-nowrap font-medium">
                {student.role?.name === 'teacher'
                  ? 'Tutor'
                  : student.role?.name || 'Student'}
              </span>
            </div>
          </div>

          <div className="shrink-0 flex flex-wrap items-center justify-start gap-x-3 gap-y-1 text-[12px] sm:justify-end">
            <span className="inline-flex items-center gap-1 font-mono text-[#4B5646] font-bold">
              <Users className="h-3.5 w-3.5 text-[#B98A3E]" strokeWidth={2.2} />
              {student.followersCount} followers
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-[#4B5646] font-bold">
              <Heart className="h-3.5 w-3.5 text-red-500" strokeWidth={2.2} />
              {Math.max(0, student.likesReceivedCount)} likes
            </span>
            <span className="font-mono text-[#B98A3E] font-bold">
              {student.studentCourses?.length || 0} courses
            </span>
            <span className="font-mono text-[#4B5646] font-bold">
              {totalCredits} cr
            </span>
          </div>
        </div>

        <div className="mt-2 space-y-1.5">
          <div className="flex flex-wrap items-baseline gap-1.5">
            <p className="font-mono text-[9px] uppercase tracking-[0.09em] text-[#B98A3E] font-bold">
              General Degree Course:
            </p>
            <p className="text-[12px] font-semibold text-[#1A2B4C]">
              {student.generalCourse || 'Not specified'}
            </p>
          </div>

          {student.studentCourses?.length > 0 && (
            <div>
              <p className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.1em] text-[#B98A3E] font-bold mb-1">
                <BookOpen className="w-2.5 h-2.5 text-[#B98A3E]" strokeWidth={2.2} />
                Course Units taking
              </p>

              <div className="space-y-0.5">
                {student.studentCourses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="text-[11px] font-medium text-[#1A2B4C] flex-1 truncate">
                      {course.courseUnit}
                    </span>
                    <span className="shrink-0 font-mono text-[10px] text-[#4B5646] tabular-nums font-bold">
                      {course.credits} cr
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-2.5 pt-2.5 border-t border-[#F3F4F6] flex items-center justify-between gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => router.push(`/dashboard/students/${student.id}`)}
            className="inline-flex items-center gap-0.5 text-[12px] font-bold text-[#B98A3E] transition-colors hover:text-[#1A2B4C] cursor-pointer"
          >
            View Profile
            <ChevronRight className="w-3 h-3" />
          </button>

          {!isCurrentUser && (
            <div className="flex items-center gap-1.5">
              {isLiked ? (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-red-500 bg-red-50 text-red-600">
                  <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" strokeWidth={2} />
                  <span className="text-[10px] font-bold">Liked</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onLikeToggle?.(student.id)}
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-white hover:border-[#B98A3E] transition-colors"
                  title="Like"
                >
                  <Heart className="w-3.5 h-3.5 text-[#6B7280]" strokeWidth={2} />
                  <span className="text-[10px] font-bold text-[#1A2B4C]">Like</span>
                </button>
              )}

              {isFollowing ? (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-[#55705B] bg-[#55705B] text-[10px] font-bold text-white">
                  Following
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onFollowToggle?.(student.id)}
                  disabled={isFollowLoading}
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-white hover:border-[#B98A3E] text-[#1A2B4C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Follow"
                >
                  {isFollowLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
                  ) : (
                    <UserPlus className="w-3.5 h-3.5" strokeWidth={2} />
                  )}
                  <span className="text-[10px] font-bold">Follow</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

// ============================================================
// COMMUNITY TICKER
// ============================================================

const CommunityTicker = ({ students }: { students: Student[] }) => {
  const profileStudents = students.filter(
    (student) =>
      typeof student.profileImageUrl === 'string' &&
      student.profileImageUrl.trim().length > 0,
  );
  const tickerStudents = [...profileStudents, ...profileStudents];

  return (
    <div className="overflow-hidden border border-[#E5E7EB] bg-white rounded-lg shadow-md">
      <div className="flex h-14 items-center overflow-hidden">
        <div className="h-full shrink-0 border-r border-[#E5E7EB] bg-[#1A2B4C] px-3 flex items-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.13em] text-white font-bold">
            Community
          </span>
        </div>

        <div className="relative min-w-0 flex-1 overflow-hidden">
          {profileStudents.length > 0 ? (
            <div className="student-avatar-ticker flex w-max items-center gap-3 px-3">
              {tickerStudents.map((student, index) => (
                <div
                  key={`${student.id}-${index}`}
                  className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-sm ring-1 ring-[#DADCD3]"
                  title={`${student.firstName} ${student.lastName}`}
                >
                  <Image
                    src={student.profileImageUrl!}
                    alt={`${student.firstName} ${student.lastName}`}
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="px-4 text-[12px] font-medium text-[#6B7268]">
              Student community
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
};

// ============================================================
// MAIN PAGE
// ============================================================

export default function StudentsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const currentUserId = session?.user?.id;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
    isFetching,
    error,
    refetch: refetchStudents,
  } = useQuery({
    queryKey: ['studentDirectory'],
    queryFn: async () => {
      const response = await fetch('/api/students');
      if (!response.ok) throw new Error('Failed to fetch students');
      const result = await response.json();
      return result as {
        studentsByTechCenter: { [key: string]: Student[] };
        techCenters: TechCenter[];
        totalStudents: number;
      };
    },
    staleTime: 5 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 10 * 1000,
  });

  const studentsByTechCenter = useMemo(
    () => data?.studentsByTechCenter || {},
    [data?.studentsByTechCenter],
  );
  const techCenters = data?.techCenters || [];
  const totalStudents = data?.totalStudents || 0;

  const allStudents = useMemo(
    () => Object.values(studentsByTechCenter).flat() as Student[],
    [studentsByTechCenter],
  );

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

  const filteredAllStudents = sortStudents(filterStudents(allStudents), sortBy);

  const getLocationCount = (locationId: string) =>
    allStudents.filter((student) => student.techCenter?.id === locationId)
      .length;

  const locations = [...techCenters]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((center) => ({
      ...center,
      _count: { students: getLocationCount(center.id) },
    }));

  const clearFilter = () => {
    setSelectedLocation('all');
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedLocation !== 'all' || Boolean(searchQuery.trim());
  const hasStudents = allStudents.length > 0;

  // Show the full-page skeleton only when we truly have no data yet.
  // Background refetches (isFetching) do NOT trigger it.
  const isInitialLoading = isLoading && !data;

  const socialStatus = useMemo(() => {
    const status: Record<string, { isFollowing: boolean; isLiked: boolean }> = {};
    allStudents.forEach((student) => {
      if (student.id !== currentUserId) {
        status[student.id] = {
          isFollowing: student.isFollowing || false,
          isLiked: student.isLiked || false,
        };
      }
    });
    return status;
  }, [allStudents, currentUserId]);

  const followMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const response = await fetch(`/api/social/follow/${studentId}`, {
        method: 'POST',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to follow');
      }
      return response.json();
    },
    onMutate: async (studentId: string) => {
      await queryClient.cancelQueries({ queryKey: ['studentDirectory'] });
      const previousStudents = queryClient.getQueryData(['studentDirectory']);

      queryClient.setQueryData(['studentDirectory'], (old: any) => {
        if (!old) return old;
        const updateStudent = (students: any[]) =>
          students.map((student: any) => {
            if (student.id === studentId) {
              return {
                ...student,
                isFollowing: true,
                followersCount: student.followersCount + 1,
              };
            }
            if (student.id === currentUserId) {
              return {
                ...student,
                followingCount: student.followingCount + 1,
              };
            }
            return student;
          });

        return {
          ...old,
          studentsByTechCenter: Object.fromEntries(
            Object.entries(old.studentsByTechCenter).map(
              ([key, students]: [string, any]) => [key, updateStudent(students)],
            ),
          ),
        };
      });

      return { previousStudents };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentDirectory'] });
    },
    onError: (_err: any, _variables: any, context: any) => {
      if (context?.previousStudents) {
        queryClient.setQueryData(['studentDirectory'], context.previousStudents);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['studentDirectory'] });
    },
  });

  const likeMutation = useMutation({
    mutationFn: async ({
      studentId,
      isLiked,
    }: {
      studentId: string;
      isLiked: boolean;
    }) => {
      const response = await fetch(`/api/social/like/${studentId}`, {
        method: isLiked ? 'DELETE' : 'POST',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to toggle like');
      }
      return response.json();
    },
    onMutate: async ({
      studentId,
      isLiked,
    }: {
      studentId: string;
      isLiked: boolean;
    }) => {
      await queryClient.cancelQueries({ queryKey: ['studentDirectory'] });
      const previousStudents = queryClient.getQueryData(['studentDirectory']);

      queryClient.setQueryData(['studentDirectory'], (old: any) => {
        if (!old) return old;
        const updateStudent = (students: any[]) =>
          students.map((student: any) => {
            if (student.id === studentId) {
              return {
                ...student,
                isLiked: !isLiked,
                likesReceivedCount: isLiked
                  ? Math.max(0, student.likesReceivedCount - 1)
                  : student.likesReceivedCount + 1,
              };
            }
            return student;
          });

        return {
          ...old,
          studentsByTechCenter: Object.fromEntries(
            Object.entries(old.studentsByTechCenter).map(
              ([key, students]: [string, any]) => [key, updateStudent(students)],
            ),
          ),
        };
      });

      return { previousStudents };
    },
    onSuccess: (
      data: any,
      { studentId, isLiked }: { studentId: string; isLiked: boolean },
    ) => {
      queryClient.setQueryData(['studentDirectory'], (old: any) => {
        if (!old) return old;
        const updateStudent = (students: any[]) =>
          students.map((student: any) => {
            if (student.id === studentId) {
              return {
                ...student,
                isLiked: !isLiked,
                likesReceivedCount:
                  data.counts?.likesReceivedCount ?? student.likesReceivedCount,
              };
            }
            return student;
          });

        return {
          ...old,
          studentsByTechCenter: Object.fromEntries(
            Object.entries(old.studentsByTechCenter).map(
              ([key, students]: [string, any]) => [key, updateStudent(students)],
            ),
          ),
        };
      });
    },
    onError: (_err: any, _variables: any, context: any) => {
      if (context?.previousStudents) {
        queryClient.setQueryData(['studentDirectory'], context.previousStudents);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['studentDirectory'] });
    },
  });

  const handleFollowToggle = (studentId: string) => {
    const liveStatus = queryClient.getQueryData<any>(['studentDirectory']);
    let isCurrentlyFollowing = false;
    if (liveStatus?.studentsByTechCenter) {
      for (const students of Object.values(
        liveStatus.studentsByTechCenter,
      ) as any[]) {
        const found = students.find((s: any) => s.id === studentId);
        if (found) {
          isCurrentlyFollowing = found.isFollowing || false;
          break;
        }
      }
    }
    if (!isCurrentlyFollowing) {
      followMutation.mutate(studentId);
    }
  };

  const handleLikeToggle = (studentId: string) => {
    const liveStatus = queryClient.getQueryData<any>(['studentDirectory']);
    let isCurrentlyLiked = false;
    if (liveStatus?.studentsByTechCenter) {
      for (const students of Object.values(
        liveStatus.studentsByTechCenter,
      ) as any[]) {
        const found = students.find((s: any) => s.id === studentId);
        if (found) {
          isCurrentlyLiked = found.isLiked || false;
          break;
        }
      }
    }
    likeMutation.mutate({ studentId, isLiked: isCurrentlyLiked });
  };

  /* ==========================================================
     INITIAL LOADING (full-page skeleton)
  ========================================================== */

  if (isInitialLoading) {
    return <FullPageSkeleton viewMode={viewMode} />;
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  if (error) {
    return (
      <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center border border-[#E5E7EB] bg-white p-8 rounded-lg shadow-md">
          <div className="mx-auto w-12 h-12 bg-[#FBF0EC] flex items-center justify-center rounded">
            <AlertCircle className="w-6 h-6 text-[#A4462F]" strokeWidth={2} />
          </div>
          <h2 className="mt-4 text-[17px] font-bold text-[#1A2B4C]">
            Failed to load students
          </h2>
          <p className="mt-1.5 text-[13px] leading-5 text-[#4B5646]">
            {error instanceof Error ? error.message : 'Please try again later'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 h-10 px-5 bg-[#1A2B4C] text-white font-mono text-[12px] uppercase tracking-widest hover:bg-[#2C3E5A] transition-colors rounded font-bold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* ==========================================================
     PAGE
  ========================================================== */

  // When a background refetch is happening AND we have no students yet,
  // still show section skeletons instead of the empty state.
  const showSectionSkeletons = isFetching && !hasStudents;

  return (
    <div className="min-h-screen bg-[#F7F6F2]">
      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          title="Back to top"
          className="fixed bottom-5 left-3 z-40 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#1A2B4C] shadow-lg transition-all hover:-translate-y-0.5 hover:border-[#B98A3E] hover:bg-[#F7F6F2] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B98A3E] focus-visible:ring-offset-2 sm:left-5"
        >
          <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
        </button>
      )}

      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 pb-10">
        {/* HEADER */}
        <header className="pt-6 pb-5">
          <div className="flex flex-wrap items-center gap-1.5 mb-4">
            <Link
              href="/dashboard"
              className="border border-[#E5E7EB] bg-white px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wide text-[#4B5646] hover:border-[#B98A3E] hover:text-[#1A2B4C] transition-colors rounded font-semibold"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/courses"
              className="border border-[#E5E7EB] bg-white px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wide text-[#4B5646] hover:border-[#B98A3E] hover:text-[#1A2B4C] transition-colors rounded font-semibold"
            >
              Courses
            </Link>
            <Link
              href="/dashboard/cleaning"
              className="border border-[#E5E7EB] bg-white px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wide text-[#4B5646] hover:border-[#B98A3E] hover:text-[#1A2B4C] transition-colors rounded font-semibold"
            >
              Cleaning
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="text-[30px] sm:text-[34px] font-bold tracking-tight text-[#1A2B4C] leading-tight">
                Students
              </h1>
              <p className="mt-1.5 text-[14px] leading-5 text-[#B98A3E] font-semibold">
                {totalStudents} students across {techCenters.length} tech centers.
              </p>
            </div>
            <button
              onClick={() => refetchStudents()}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#E5E7EB] bg-white rounded text-[12px] font-bold text-[#1A2B4C] hover:border-[#B98A3E] hover:bg-[#F7F6F2] transition-colors"
            >
              Refresh
            </button>
          </div>
        </header>

        <p className="mb-3 text-[12px] leading-5 text-[#3E5C76]">
          High engagement can earn a blue verification badge and a free Pro upgrade.
        </p>

        {/* SEARCH + FILTER */}
        <SearchFilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          locations={locations}
          totalStudents={totalStudents}
          sortBy={sortBy}
          setSortBy={setSortBy}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {/* TICKER */}
        <div className="mt-4">
          <CommunityTicker students={allStudents} />
        </div>

        {/* RESULTS */}
        <main className="pt-6">
          {/* SKELETON — no students yet but still fetching */}
          {showSectionSkeletons && (
            <>
              {[1, 2, 3].map((i) => (
                <SectionSkeleton key={i} viewMode={viewMode} />
              ))}
            </>
          )}

          {/* NO STUDENTS */}
          {!showSectionSkeletons && !hasStudents && (
            <div className="border border-dashed border-[#D1D5DB] bg-white py-20 text-center rounded-lg shadow-md">
              <Users className="mx-auto w-10 h-10 text-[#9CA3AF]" strokeWidth={1.6} />
              <h3 className="mt-4 text-[16px] font-bold text-[#1A2B4C]">
                No students yet
              </h3>
              <p className="mt-1.5 text-[14px] text-[#4B5646]">
                Students will appear here once they register.
              </p>
            </div>
          )}

          {/* FILTERED */}
          {hasStudents && hasActiveFilters && (
            <>
              {filteredAllStudents.length === 0 ? (
                <div className="border border-[#E5E7EB] bg-white py-16 text-center px-6 rounded-lg shadow-md">
                  <Search className="mx-auto w-9 h-9 text-[#9CA3AF]" strokeWidth={1.8} />
                  <h3 className="mt-3 text-[16px] font-bold text-[#1A2B4C]">
                    No matching students
                  </h3>
                  <p className="mt-1.5 text-[14px] leading-5 text-[#4B5646]">
                    Try changing your search or location filter.
                  </p>
                  <button
                    onClick={clearFilter}
                    className="mt-5 h-10 px-5 bg-[#1A2B4C] text-white font-mono text-[12px] uppercase tracking-widest hover:bg-[#2C3E5A] transition-colors rounded font-bold"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <>
                  {viewMode === 'grid' ? (
                    <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                      {filteredAllStudents.map((student) => (
                        <StudentCard
                          key={student.id}
                          student={student}
                          router={router}
                          currentUserId={currentUserId}
                          onFollowToggle={handleFollowToggle}
                          onLikeToggle={handleLikeToggle}
                          isFollowing={socialStatus?.[student.id]?.isFollowing}
                          isLiked={socialStatus?.[student.id]?.isLiked}
                          isFollowLoading={
                            followMutation.isPending &&
                            followMutation.variables === student.id
                          }
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-2 grid-cols-1">
                      {filteredAllStudents.map((student) => (
                        <StudentListCard
                          key={student.id}
                          student={student}
                          router={router}
                          currentUserId={currentUserId}
                          onFollowToggle={handleFollowToggle}
                          onLikeToggle={handleLikeToggle}
                          isFollowing={socialStatus?.[student.id]?.isFollowing}
                          isLiked={socialStatus?.[student.id]?.isLiked}
                          isFollowLoading={
                            followMutation.isPending &&
                            followMutation.variables === student.id
                          }
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* ALL BY TECH CENTER */}
          {hasStudents && !hasActiveFilters && (
            <>
              {Object.entries(studentsByTechCenter)
                .sort(([nameA], [nameB]) => nameA.localeCompare(nameB))
                .map(([locationName, students]) => {
                  const studentList = sortStudents(students as Student[], sortBy);
                  if (studentList.length === 0) return null;
                  const techCenter = techCenters.find(
                    (tc) => tc.name === locationName,
                  );
                  const hue = getTechCenterHue(locationName);
                  const previewCount = 6;
                  const hasMore = studentList.length > previewCount;
                  const visibleStudents = hasMore
                    ? studentList.slice(0, previewCount)
                    : studentList;

                  return (
                    <section key={locationName} className="mb-8">
                      <header className="mb-4 flex items-center justify-between gap-3 flex-wrap">
                        <div className="min-w-0 flex items-center gap-2.5">
                          <span
                            className="h-4 w-[3px] shrink-0 rounded-full"
                            style={{ backgroundColor: hue }}
                          />
                          <h2 className="text-[17px] font-bold tracking-tight text-[#1A2B4C] truncate">
                            {locationName}
                          </h2>
                          <div className="shrink-0 flex items-center gap-1.5 bg-white px-2.5 py-1 border border-[#E5E7EB] rounded">
                            <span className="font-mono text-[12px] font-bold text-[#1A2B4C] tabular-nums">
                              {studentList.length}
                            </span>
                            <span className="font-mono text-[10px] uppercase tracking-wider text-[#B98A3E]">
                              students
                            </span>
                          </div>
                        </div>
                      </header>

                      {viewMode === 'grid' ? (
                        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                          {visibleStudents.map((student) => (
                            <StudentCard
                              key={student.id}
                              student={student}
                              router={router}
                              currentUserId={currentUserId}
                              onFollowToggle={handleFollowToggle}
                              onLikeToggle={handleLikeToggle}
                              isFollowing={socialStatus?.[student.id]?.isFollowing}
                              isLiked={socialStatus?.[student.id]?.isLiked}
                              isFollowLoading={
                                followMutation.isPending &&
                                followMutation.variables === student.id
                              }
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="grid gap-2 grid-cols-1">
                          {visibleStudents.map((student) => (
                            <StudentListCard
                              key={student.id}
                              student={student}
                              router={router}
                              currentUserId={currentUserId}
                              onFollowToggle={handleFollowToggle}
                              onLikeToggle={handleLikeToggle}
                              isFollowing={socialStatus?.[student.id]?.isFollowing}
                              isLiked={socialStatus?.[student.id]?.isLiked}
                              isFollowLoading={
                                followMutation.isPending &&
                                followMutation.variables === student.id
                              }
                            />
                          ))}
                        </div>
                      )}

                      {hasMore && (
                        <div className="mt-4 flex justify-center">
                          <button
                            type="button"
                            onClick={() => {
                              if (techCenter) {
                                setSelectedLocation(techCenter.id);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }
                            }}
                            className="
                              inline-flex items-center gap-1.5 h-9 px-4
                              border border-[#E5E7EB] bg-white
                              text-[13px] font-bold text-[#1A2B4C]
                              rounded hover:border-[#B98A3E] hover:bg-[#F7F6F2]
                              transition-colors
                              focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B98A3E] focus-visible:ring-offset-1
                            "
                          >
                            View all {locationName} students
                            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
                          </button>
                        </div>
                      )}
                    </section>
                  );
                })}
            </>
          )}

          {/* FOOTER */}
          {hasStudents && (
            <footer className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border border-[#E5E7EB] bg-white px-4 py-3 rounded-lg shadow-md">
              <p className="flex items-center gap-1.5 text-[13px] font-bold text-[#4B5646]">
                <Users className="w-4 h-4 text-[#1A2B4C]" strokeWidth={2} />
                Student Community Directory
              </p>
              <span className="font-mono text-[13px] font-bold text-[#B98A3E] tabular-nums">
                {hasActiveFilters
                  ? `${filteredAllStudents.length} of ${totalStudents} students`
                  : `${totalStudents} students`}
              </span>
            </footer>
          )}
        </main>
      </div>
    </div>
  );
}