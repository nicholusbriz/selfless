'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  useMemo,
  useRef,
} from 'react';
import { useSession } from 'next-auth/react';
import {
  useInfiniteQuery,
  useQuery,
  type InfiniteData,
} from '@tanstack/react-query';
import Link from 'next/link';
import {
  Search,
  X,
  BookOpen,
  ArrowUp,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowDownUp,
  MessageSquare,
  MapPin,
  Pause,
  Play,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { SocialActions } from '@/components/social/SocialActions';
import VerifiedBadge from '@/components/VerifiedBadge';
import { compareProfileImageFirst } from '@/lib/social/ranking';
import {
  patchStudentsShape,
  findInStudentsShape,
} from '@/lib/social/patchHelpers';
import type { PageCacheAdapter } from '@/lib/social/cacheKeys';
import { getTechCenterHue } from '@/lib/social/constants';
import { isRecord } from '../response-guards';

// ============================================================
// TYPES
// ============================================================

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  hasVerifiedBadge?: boolean;
  role: { name: string } | null;
  techCenter: {
    id: string;
    name: string;
    country: { name: string } | null;
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
  country: { name: string } | null;
}

interface StudentPageResponse {
  students: Student[];
  hasMore: boolean;
  nextOffset: number;
}

type StudentCategory = 'all' | 'trending';
const STUDENT_PAGE_SIZE = 20;

type Router = ReturnType<typeof useRouter>;

function isStudent(value: unknown): value is Student {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    typeof value.firstName !== 'string' ||
    typeof value.lastName !== 'string' ||
    (value.profileImageUrl !== null && typeof value.profileImageUrl !== 'string') ||
    (value.role !== null &&
      (!isRecord(value.role) || typeof value.role.name !== 'string')) ||
    (value.techCenter !== null &&
      (!isRecord(value.techCenter) ||
        typeof value.techCenter.id !== 'string' ||
        typeof value.techCenter.name !== 'string' ||
        (value.techCenter.country !== null &&
          (!isRecord(value.techCenter.country) ||
            typeof value.techCenter.country.name !== 'string')))) ||
    (value.generalCourse !== null && typeof value.generalCourse !== 'string') ||
    (value.takesReligion !== null && typeof value.takesReligion !== 'boolean') ||
    typeof value.status !== 'string' ||
    typeof value.isActive !== 'boolean' ||
    typeof value.isVerified !== 'boolean' ||
    typeof value.verificationStatus !== 'string' ||
    typeof value.createdAt !== 'string' ||
    !Array.isArray(value.studentCourses) ||
    !value.studentCourses.every(
      (course) =>
        isRecord(course) &&
        typeof course.id === 'string' &&
        typeof course.code === 'string' &&
        typeof course.courseUnit === 'string' &&
        typeof course.credits === 'number' &&
        typeof course.status === 'string',
    ) ||
    typeof value.followersCount !== 'number' ||
    typeof value.followingCount !== 'number' ||
    typeof value.likesReceivedCount !== 'number' ||
    typeof value.profileViewsCount !== 'number' ||
    typeof value.isFollowing !== 'boolean' ||
    typeof value.isLiked !== 'boolean'
  ) {
    return false;
  }

  return true;
}

async function fetchStudentPage({
  offset,
  category = 'all',
  search,
  techCenterId,
  sortBy,
}: {
  offset: number;
  category?: StudentCategory;
  search?: string;
  techCenterId?: string;
  sortBy: SortOption;
}): Promise<StudentPageResponse> {
  const params = new URLSearchParams({
    category,
    limit: String(STUDENT_PAGE_SIZE),
    offset: String(offset),
    sortBy,
  });
  if (search) params.set('search', search);
  if (techCenterId) params.set('techCenterId', techCenterId);

  const response = await fetch(`/api/students?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch students');
  const data: unknown = await response.json();
  if (
    !isRecord(data) ||
    !Array.isArray(data.students) ||
    !data.students.every(isStudent) ||
    typeof data.hasMore !== 'boolean' ||
    typeof data.nextOffset !== 'number'
  ) {
    throw new Error('Invalid student page response');
  }
  return {
    students: data.students,
    hasMore: data.hasMore,
    nextOffset: data.nextOffset,
  };
}

function patchStudentDirectoryCache(
  old: unknown,
  targetId: string,
  patch: Parameters<typeof patchStudentsShape>[2],
): unknown {
  if (isRecord(old) && Array.isArray(old.pages)) {
    return {
      ...old,
      pages: old.pages.map((page) =>
        patchStudentsShape(page, targetId, patch),
      ),
    };
  }
  return patchStudentsShape(old, targetId, patch);
}

function findStudentInDirectoryCache(
  old: unknown,
  targetId: string,
): Student | undefined {
  if (isRecord(old) && Array.isArray(old.pages)) {
    for (const page of old.pages) {
      const student = findInStudentsShape(page, targetId);
      if (student) return student as Student;
    }
    return undefined;
  }
  return findInStudentsShape(old, targetId) as Student | undefined;
}

const STUDENT_DIRECTORY_ADAPTERS: PageCacheAdapter[] = [
  {
    queryKey: ['studentDirectory'],
    patch: patchStudentDirectoryCache,
    find: findStudentInDirectoryCache,
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
    return students;
  }

  const copy = [...students];

  if (sortBy === 'popularity') {
    return copy.sort((a, b) => {
      const aHasImage = !!(a.profileImageUrl && a.profileImageUrl.trim() !== '');
      const bHasImage = !!(b.profileImageUrl && b.profileImageUrl.trim() !== '');
      if (aHasImage !== bHasImage) {
        return bHasImage ? 1 : -1;
      }
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
      const aHasImage = !!(a.profileImageUrl && a.profileImageUrl.trim() !== '');
      const bHasImage = !!(b.profileImageUrl && b.profileImageUrl.trim() !== '');
      if (aHasImage !== bHasImage) {
        return bHasImage ? 1 : -1;
      }
      return compareStudentNames(a, b);
    });
  }
  if (sortBy === 'newest') {
    return copy.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }
  if (sortBy === 'mostFollowed') {
    return copy.sort((a, b) => {
      const aHasImage = !!(a.profileImageUrl && a.profileImageUrl.trim() !== '');
      const bHasImage = !!(b.profileImageUrl && b.profileImageUrl.trim() !== '');
      if (aHasImage !== bHasImage) {
        return bHasImage ? 1 : -1;
      }
      return b.followersCount - a.followersCount;
    });
  }
  if (sortBy === 'mostLiked') {
    return copy.sort((a, b) => {
      const aHasImage = !!(a.profileImageUrl && a.profileImageUrl.trim() !== '');
      const bHasImage = !!(b.profileImageUrl && b.profileImageUrl.trim() !== '');
      if (aHasImage !== bHasImage) {
        return bHasImage ? 1 : -1;
      }
      return b.likesReceivedCount - a.likesReceivedCount;
    });
  }
  return copy.sort((a, b) => Number(b.isActive) - Number(a.isActive));
};

// ============================================================
// STUDENT CARD
// ============================================================

const StudentCard = ({
  student,
  router,
  currentUserId,
}: {
  student: Student;
  router: Router;
  currentUserId?: string;
  rank?: number;
}) => {
  const initials = `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase();
  const fullName = `${student.firstName} ${student.lastName}`;
  const isCurrentUser = currentUserId === student.id;
  const isSuperAdmin = ['superadmin', 'super_admin'].includes(
    student.role?.name?.toLowerCase() || '',
  );
  const roleLabel =
    student.role?.name === 'teacher'
      ? 'Tutor'
      : student.role?.name === 'admin'
        ? 'Manager'
        : student.role?.name === 'superadmin' || student.role?.name === 'super_admin'
          ? 'Director'
          : student.role?.name || 'Student';

  const totalCredits =
    student.studentCourses?.reduce((sum, course) => sum + (course.credits || 0), 0) || 0;

  return (
    <article className="group w-[260px] shrink-0 snap-start overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm transition-colors hover:border-[#C59B4C]/50 sm:w-[280px]">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#1A2B4C]">
        <div className="absolute inset-x-2.5 top-2.5 z-10 flex items-center justify-between gap-2 text-white">
          {!isSuperAdmin && (
            <span className="inline-flex shrink-0 items-center rounded border border-white/30 bg-black/40 px-2 py-0.5 text-[9.5px] font-semibold">
              {totalCredits >= 6 ? 'Full time' : 'Part time'}
            </span>
          )}
          <Link
            href={`/dashboard/students/${student.id}`}
            className="ml-auto inline-flex shrink-0 items-center rounded border border-white/30 bg-black/40 px-2 py-0.5 text-[9.5px] font-semibold transition-colors hover:border-white/50 hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B4C]"
            aria-label={`View ${fullName}'s profile`}
          >
            View
          </Link>
        </div>
        {student.profileImageUrl ? (
          <Image
            src={student.profileImageUrl}
            alt={fullName}
            fill
            className="h-full w-full object-cover object-center"
            sizes="280px"
            quality={95}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-2xl font-bold text-white/90">
              {initials}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

        <Link
          href={`/dashboard/students/${student.id}`}
          className="absolute inset-0 z-[1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#C59B4C]"
          aria-label={`View ${fullName}'s profile`}
        />

        <div className="pointer-events-none absolute inset-0 flex flex-col justify-end p-2.5">
          {/* Name + Role */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-[13px] font-bold leading-tight text-white">
              <Link
                href={`/dashboard/students/${student.id}`}
                className="rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B4C]"
                aria-label={`View ${fullName}'s profile`}
              >
                {fullName}
              </Link>
              {student.hasVerifiedBadge && (
                <VerifiedBadge className="ml-1 inline h-3 w-3 align-middle" />
              )}
            </h3>
            {roleLabel && (
              <span className="shrink-0 rounded bg-white/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/95">
                {roleLabel}
              </span>
            )}
          </div>

          {/* Course */}
          {student.role?.name !== 'super_admin' && (
            <p className="mt-0.5 line-clamp-1 text-[11px] font-medium text-white/95">
              {student.generalCourse || 'Student'}
            </p>
          )}

          {/* Tech Center */}
          {student.techCenter?.name && (
            <div className="mt-0.5 flex items-center gap-1">
              <MapPin className="h-2.5 w-2.5 shrink-0 text-[#D4A84B]" />
              <span className="line-clamp-1 text-[10.5px] font-medium text-white/90">
                {student.techCenter.name}
              </span>
            </div>
          )}

          {/* Stats */}
          <div className="mt-1 flex items-center gap-1.5 text-[9.5px] text-white/90">
            <span className="font-semibold text-white tabular-nums">{student.followersCount}</span>
            <span>followers</span>
            <span className="text-white/50">·</span>
            <span className="font-semibold text-white tabular-nums">{Math.max(0, student.likesReceivedCount)}</span>
            <span>likes</span>
            <span className="text-white/50">·</span>
            <span className="font-semibold text-white tabular-nums">{student.profileViewsCount}</span>
            <span>views</span>
          </div>

          {/* Enrolled Courses */}
          {student.studentCourses?.length > 0 ? (
            <div className="mt-1">
              <div className="mb-0.5 flex items-center justify-between gap-1">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-2.5 w-2.5 shrink-0 text-[#D4A84B]" />
                  <span className="text-[9px] font-semibold uppercase tracking-wide text-white/90">
                    Courses
                  </span>
                </div>
                <span className="text-[9px] font-semibold text-[#D4A84B] tabular-nums">
                  {totalCredits} cr
                </span>
              </div>
              <div className="space-y-0.5">
                {student.studentCourses.slice(0, 3).map((course) => (
                  <div key={course.id} className="flex items-start justify-between gap-2">
                    <span className="line-clamp-1 text-white/95 text-[10px] font-medium">
                      {course.courseUnit}
                    </span>
                    <span className="shrink-0 text-[9px] font-semibold text-white tabular-nums">
                      {course.credits}cr
                    </span>
                  </div>
                ))}
                {student.studentCourses.length > 3 && (
                  <p className="text-[9px] font-medium text-white/70">
                    +{student.studentCourses.length - 3} more
                  </p>
                )}
              </div>
            </div>
          ) : !isSuperAdmin ? (
            <p className="mt-1 text-[10px] font-medium text-white/85">
              No courses submitted
            </p>
          ) : null}

          {/* Actions */}
          <div className="pointer-events-auto relative z-10 mt-1.5 flex items-center justify-end gap-1.5 overflow-hidden">
            {!isCurrentUser && (
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => router.push(`/dashboard/messages?userId=${student.id}`)}
                  className="inline-flex shrink-0 items-center gap-1 rounded border border-white/30 bg-black/25 px-2 py-0.5 text-[9.5px] font-semibold text-white transition-colors hover:border-white/50 hover:bg-black/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B4C]"
                  aria-label={`Message ${fullName}`}
                  title={`Message ${fullName}`}
                >
                  <MessageSquare className="h-2.5 w-2.5" />
                  Message
                </button>
                <SocialActions
                  userId={student.id}
                  currentUserId={currentUserId}
                  isFollowing={student.isFollowing}
                  isLiked={student.isLiked}
                  pageAdapters={STUDENT_DIRECTORY_ADAPTERS}
                  size="sm"
                  allowUnfollow={true}
                  allowUnlike={true}
                  className="flex items-center gap-1.5"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

// ============================================================
// HORIZONTAL RAIL
// ============================================================

function HorizontalRail({
  railId,
  onStudentsChange,
  label,
  hue,
  category = 'all',
  searchQuery,
  techCenterId,
  sortBy = 'trending',
  initialPage,
  initialPageUpdatedAt,
  showEmptyMessage = false,
  router,
  currentUserId,
  enableAlphabetNav,
}: {
  railId: string;
  onStudentsChange: (railId: string, students: Student[]) => void;
  label: string;
  hue?: string;
  category?: StudentCategory;
  searchQuery?: string;
  techCenterId?: string;
  sortBy?: SortOption;
  initialPage?: StudentPageResponse;
  initialPageUpdatedAt?: number;
  showEmptyMessage?: boolean;
  router: Router;
  currentUserId?: string;
  showRank?: boolean;
  enableAlphabetNav?: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const previousPageCountRef = useRef(0);
  const pendingScrollLeftRef = useRef<number | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const {
    data,
    isLoading,
    isFetchingNextPage,
    isFetchNextPageError,
    error,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery<
    StudentPageResponse,
    Error,
    InfiniteData<StudentPageResponse>,
    readonly unknown[],
    number
  >({
    queryKey: [
      'studentDirectory',
      'pages',
      category,
      searchQuery ?? '',
      techCenterId ?? '',
      sortBy,
    ],
    queryFn: ({ pageParam }) =>
      fetchStudentPage({
        offset: pageParam,
        category,
        search: searchQuery,
        techCenterId,
        sortBy,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextOffset : undefined,
    initialData: initialPage
      ? {
          pages: [initialPage],
          pageParams: [0],
        }
      : undefined,
    initialDataUpdatedAt: initialPageUpdatedAt,
    enabled: isNearViewport || Boolean(initialPage),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const students = useMemo(
    () =>
      data?.pages.flatMap((page) => page.students) ?? [],
    [data?.pages],
  );

  useEffect(() => {
    onStudentsChange(railId, students);
  }, [onStudentsChange, railId, students]);

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const uniqueStudents = Array.from(
    new Map(students.map((s) => [s.id, s])).values(),
  );
  const availableLetters = new Set(uniqueStudents.map(getStudentInitial));
  const visibleStudents = selectedLetter
    ? uniqueStudents
        .filter((student) => getStudentInitial(student) === selectedLetter)
        .sort(compareStudentNames)
    : uniqueStudents;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || isNearViewport) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px' },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [isNearViewport]);

  useLayoutEffect(() => {
    const pageCount = data?.pages.length ?? 0;
    const previousPageCount = previousPageCountRef.current;

    if (pageCount > previousPageCount && pendingScrollLeftRef.current !== null) {
      if (railRef.current) {
        railRef.current.scrollLeft = pendingScrollLeftRef.current;
      }
      pendingScrollLeftRef.current = null;
    } else if (pageCount < previousPageCount) {
      pendingScrollLeftRef.current = null;
    }

    previousPageCountRef.current = pageCount;
  }, [data?.pages.length]);

  const loadMoreStudents = () => {
    pendingScrollLeftRef.current = railRef.current?.scrollLeft ?? null;
    void fetchNextPage();
  };

  const scrollLeft = () => {
    railRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
  };
  const scrollRight = () => {
    railRef.current?.scrollBy({ left: 300, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isPlaying || visibleStudents.length <= 1) return;

    const interval = window.setInterval(() => {
      const rail = railRef.current;
      if (!rail) return;

      const maxScroll = rail.scrollWidth - rail.clientWidth;
      if (rail.scrollLeft >= maxScroll - 1) {
        rail.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        rail.scrollBy({ left: 300, behavior: 'smooth' });
      }
    }, 7000);

    return () => window.clearInterval(interval);
  }, [isPlaying, visibleStudents.length]);

  if (
    data &&
    students.length === 0 &&
    !showEmptyMessage
  ) {
    return null;
  }

  if (error && students.length === 0) {
    return (
      <section ref={sectionRef} className="mb-5">
        <div className="mb-2 flex items-end gap-2 border-b border-[#E5E7EB] pb-1.5">
          {hue && (
            <span
              className="h-2.5 w-1 shrink-0 rounded-sm"
              style={{ backgroundColor: hue }}
            />
          )}
          <h2 className="text-[13px] font-semibold tracking-tight text-[#1A2B4C] sm:text-[14px]">
            {label}
          </h2>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-center" role="alert">
          <p className="text-[12px] text-red-700">
            {error instanceof Error ? error.message : 'Unable to load students.'}
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-2 text-[11.5px] font-semibold text-[#1A2B4C] underline"
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="mb-5"
      aria-busy={isLoading || isFetchingNextPage}
    >
      <div className="mb-2 flex items-end justify-between gap-2 border-b border-[#E5E7EB] pb-1.5">
        <div className="flex min-w-0 items-center gap-2">
          {hue && (
            <span
              className="h-2.5 w-1 shrink-0 rounded-sm"
              style={{ backgroundColor: hue }}
            />
          )}
          <h2 className="truncate text-[13px] font-semibold tracking-tight text-[#1A2B4C] sm:text-[14px]">
            {label}
          </h2>
        </div>

        {students.length > 0 && (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={scrollLeft}
              aria-label="Scroll left"
              className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#6B7280] transition-colors hover:border-[#C59B4C] hover:text-[#1A2B4C]"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => setIsPlaying((playing) => !playing)}
              aria-label={isPlaying ? `Pause ${label} animation` : `Play ${label} animation`}
              aria-pressed={isPlaying}
              className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#6B7280] transition-colors hover:border-[#C59B4C] hover:text-[#1A2B4C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B4C]"
            >
              {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </button>
            <button
              type="button"
              onClick={scrollRight}
              aria-label="Scroll right"
              className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#6B7280] transition-colors hover:border-[#C59B4C] hover:text-[#1A2B4C]"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {data && students.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#E5E7EB] bg-[#F8F9FA] px-4 py-5 text-center">
          <p className="text-[12px] text-[#6B7280]">
            {showEmptyMessage
              ? 'No matching student records found. Try another name or search term.'
              : 'No student records available'}
          </p>
        </div>
      ) : !data ? (
        <div className="flex gap-3 overflow-hidden" aria-hidden="true">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="aspect-[3/4] w-[260px] shrink-0 animate-pulse rounded-lg bg-[#F3F4F6] sm:w-[280px]"
            />
          ))}
        </div>
      ) : (
        <div
          ref={railRef}
          className="flex gap-3 overflow-x-auto pb-1"
          style={{ scrollbarWidth: 'thin' }}
        >
          {visibleStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              router={router}
              currentUserId={currentUserId}
            />
          ))}
          {hasNextPage && (
            <button
              type="button"
              onClick={loadMoreStudents}
              disabled={isFetchingNextPage}
              className="flex aspect-[3/4] w-[260px] shrink-0 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[#E5E7EB] bg-white px-4 text-center text-[#1A2B4C] transition-colors hover:border-[#C59B4C] hover:bg-[#F8F9FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B4C] disabled:cursor-wait disabled:opacity-70 sm:w-[280px]"
            >
              {isFetchingNextPage ? (
                <span
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin rounded-full border-2 border-[#E5E7EB] border-t-[#1A2B4C]"
                />
              ) : (
                <ChevronRight className="h-5 w-5 text-[#C59B4C]" />
              )}
              <span className="text-[12px] font-semibold">
                {isFetchingNextPage
                  ? 'Loading students…'
                  : isFetchNextPageError
                    ? 'Try loading more students'
                    : 'Load more students'}
              </span>
              <span className="text-[10.5px] text-[#6B7280]">
                {isFetchingNextPage
                  ? 'Please wait'
                  : 'Show the next 20 profiles'}
              </span>
            </button>
          )}
          <div className="w-1 shrink-0" aria-hidden />
        </div>
      )}

      {students.length > 0 && enableAlphabetNav && (
        <nav
          aria-label={`Browse ${label} by first name`}
          className="mt-2 flex flex-wrap items-center gap-0.5"
        >
          <button
            type="button"
            onClick={() => setSelectedLetter(null)}
            aria-pressed={selectedLetter === null}
            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B4C] ${
              selectedLetter === null
                ? 'bg-[#1A2B4C] text-white'
                : 'bg-white text-[#4B5646] hover:bg-[#F8F9FA] hover:text-[#1A2B4C]'
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
                className={`rounded px-1.5 py-0.5 text-[10px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B4C] ${
                  selectedLetter === letter
                    ? 'bg-[#1A2B4C] text-white'
                    : isAvailable
                      ? 'bg-white text-[#4B5646] hover:bg-[#F8F9FA] hover:text-[#1A2B4C]'
                      : 'cursor-not-allowed bg-[#F3F4F6] text-[#D1D5DB]'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </nav>
      )}

      {isFetchNextPageError && (
        <p role="alert" className="mt-2 text-center text-[11px] text-[#A4462F]">
          Could not load more students. Try again.
        </p>
      )}
    </section>
  );
}

// ============================================================
// SKELETONS
// ============================================================

function StudentDirectorySkeleton() {
  return (
    <div className="space-y-5" aria-label="Loading student directory" aria-busy="true">
      {[0, 1, 2].map((rail) => (
        <section key={rail} className="mb-5">
          <div className="mb-2 flex items-center gap-2 border-b border-[#E5E7EB] pb-1.5">
            <span className="h-2.5 w-1 shrink-0 rounded-sm bg-[#E5E7EB]" />
            <span className="h-3.5 w-36 animate-pulse rounded bg-[#F3F4F6]" />
          </div>
          <div className="flex gap-3 overflow-hidden pb-2">
            {[0, 1, 2, 3, 4].map((card) => (
              <div
                key={card}
                aria-hidden="true"
                className="aspect-[3/4] w-[260px] shrink-0 animate-pulse rounded-lg bg-[#F3F4F6] sm:w-[280px]"
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function TrendingSkeleton() {
  return (
    <section className="mb-5">
      <div className="mb-2 flex items-center gap-2 border-b border-[#E5E7EB] pb-1.5">
        <span className="h-2.5 w-1 shrink-0 rounded-sm bg-[#C59B4C]" />
        <span className="h-3.5 w-48 animate-pulse rounded bg-[#F3F4F6]" />
      </div>
      <div className="flex gap-3 overflow-hidden pb-2">
        {[0, 1, 2, 3, 4].map((card) => (
          <div
            key={card}
            aria-hidden="true"
            className="aspect-[3/4] w-[260px] shrink-0 animate-pulse rounded-lg bg-[#F3F4F6] sm:w-[280px]"
          />
        ))}
      </div>
    </section>
  );
}

// ============================================================
// SEARCH & FILTER BAR
// ============================================================

function SearchFilterBar({
  searchQuery,
  setSearchQuery,
  onSearch,
  onClearSearch,
  isSearchingResults,
  submittedSearchQuery,
  selectedLocation,
  setSelectedLocation,
  locations,
  sortBy,
  setSortBy,
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void;
  onClearSearch: () => void;
  isSearchingResults: boolean;
  submittedSearchQuery: string;
  selectedLocation: string;
  setSelectedLocation: (id: string) => void;
  locations: TechCenter[];
  sortBy: SortOption;
  setSortBy: (s: SortOption) => void;
}) {
  const useDropdown = locations.length > 8;

  const chipBase =
    'inline-flex items-center gap-1 h-6.5 px-2 text-[11px] font-semibold rounded-md border transition-colors';
  const chipOn = 'bg-[#1A2B4C] border-[#1A2B4C] text-white';
  const chipOff =
    'bg-white border-[#E5E7EB] text-[#4B5646] hover:border-[#C59B4C] hover:text-[#1A2B4C]';

  return (
    <section className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
      <div className="border-b border-[#F3F4F6] bg-[#F8F9FA] px-3 py-2 sm:px-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
              Filter &amp; sort
            </p>
            <div className="flex items-center gap-1.5">
              <ArrowDownUp className="h-3 w-3 text-[#6B7280]" />
              <label htmlFor="sort-select" className="sr-only">
                Sort students
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-7 rounded-md border border-[#E5E7EB] bg-white px-2 pr-6 text-[11.5px] font-medium text-[#1A2B4C] outline-none transition-colors focus:border-[#C59B4C] focus:ring-2 focus:ring-[#C59B4C]/15"
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
              className="h-7 w-full rounded-md border border-[#E5E7EB] bg-white px-2 text-[11.5px] font-medium text-[#1A2B4C] outline-none transition-colors focus:border-[#C59B4C] focus:ring-2 focus:ring-[#C59B4C]/15"
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
                      className="h-1.5 w-1.5 shrink-0 rounded-sm"
                      style={{ backgroundColor: hue }}
                    />
                    <span>{location.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {selectedLocation !== 'all' && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280]">
              <span>Active center:</span>
              <span className="font-semibold text-[#1A2B4C]">
                {locations.find((l) => l.id === selectedLocation)?.name}
              </span>
              <button
                type="button"
                onClick={() => setSelectedLocation('all')}
                className="text-[11px] font-semibold text-[#A4462F] underline-offset-2 hover:underline"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="px-3 py-2 sm:px-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSearch();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              inputMode="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or course unit..."
              aria-label="Search students"
              className="h-8 w-full rounded-md border border-[#E5E7EB] bg-white pl-8 pr-7 text-[12px] text-[#1A2B4C] outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#C59B4C] focus:ring-2 focus:ring-[#C59B4C]/15"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={onClearSearch}
                aria-label="Clear search"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-[#9CA3AF] transition-colors hover:bg-[#F8F9FA] hover:text-[#1A2B4C]"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-[#1A2B4C] px-3 text-[11.5px] font-semibold text-white transition-colors hover:bg-[#263D66] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B4C] focus-visible:ring-offset-2"
          >
            <Search className="h-3 w-3" />
            Search
          </button>
        </form>
        {isSearchingResults && submittedSearchQuery && (
          <p
            role="status"
            aria-live="polite"
            className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#6B7280]"
          >
            <span
              aria-hidden="true"
              className="h-3 w-3 animate-spin rounded-full border-2 border-[#E5E7EB] border-t-[#1A2B4C]"
            />
            Searching for &ldquo;{submittedSearchQuery}&rdquo;...
          </p>
        )}
      </div>
    </section>
  );
}

// ============================================================
// COMMUNITY TICKER
// ============================================================

function CommunityTicker({ students }: { students: Student[] }) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const router = useRouter();
  const profileStudents = students.filter(
    (student) =>
      typeof student.profileImageUrl === 'string' &&
      student.profileImageUrl.trim().length > 0,
  );
  const profileCount = profileStudents.length;

  return (
    <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
      {selectedStudent && (
        <div className="border-b border-[#E5E7EB] bg-[#F8F9FA] px-3 py-2.5">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[#E5E7EB] bg-white">
                {selectedStudent.profileImageUrl ? (
                  <Image
                    src={selectedStudent.profileImageUrl}
                    alt={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
                    fill
                    sizes="40px"
                    className="object-cover object-top"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#1A2B4C]">
                    <span className="text-[12px] font-bold text-[#D4A84B]">
                      {`${selectedStudent.firstName.charAt(0)}${selectedStudent.lastName.charAt(0)}`.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-1 text-[12.5px] font-semibold text-[#1A2B4C]">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </h3>
                <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#6B7280]">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-sm"
                    style={{
                      backgroundColor:
                        getTechCenterHue(selectedStudent.techCenter?.name) || '#D4A84B',
                    }}
                  />
                  <span className="truncate font-medium">
                    {selectedStudent.techCenter?.name || 'Campus Member'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  router.push(`/dashboard/students/${selectedStudent.id}`)
                }
                aria-label={`View ${selectedStudent.firstName} ${selectedStudent.lastName}'s profile`}
                className="inline-flex h-7 items-center gap-1 rounded-md bg-[#1A2B4C] px-2.5 text-[11px] font-semibold text-white transition-colors hover:bg-[#263D66]"
              >
                View profile
                <ChevronRight className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                aria-label="Close student info"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#6B7280] transition-colors hover:border-[#C59B4C] hover:text-[#1A2B4C]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {!selectedStudent && profileStudents.length > 0 && (
        <div className="border-b border-[#F3F4F6] bg-[#F8F9FA] px-3 py-1.5">
          <p className="text-[10.5px] text-[#6B7280]">
            <span className="font-semibold text-[#4B5646]">Tip:</span> Tap a photo to see the student&apos;s name and tech center
          </p>
        </div>
      )}

      <div className="flex h-20 items-center overflow-hidden px-2 sm:px-3">
        <div className="min-w-0 flex-1 overflow-hidden">
          {profileStudents.length > 0 ? (
            <div
              className="animate-marquee flex w-max items-center"
              style={{ animationDuration: `${Math.max(profileCount * 3, 20)}s` }}
            >
              {[...profileStudents, ...profileStudents].map((student, index) => (
                <button
                  key={`${student.id}-${index}`}
                  type="button"
                  onClick={() => setSelectedStudent(student)}
                  className="relative mr-2 h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-transparent bg-white transition-all hover:border-[#C59B4C] focus:border-[#C59B4C] focus:outline-none active:scale-95 touch-manipulation"
                  title={`${student.firstName} ${student.lastName}`}
                  aria-label={`View ${student.firstName} ${student.lastName}'s info`}
                >
                  <Image
                    src={student.profileImageUrl!}
                    alt={`${student.firstName} ${student.lastName}`}
                    fill
                    sizes="56px"
                    className="object-cover object-top"
                  />
                </button>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-[#6B7280]">
              Active student roster
            </p>
          )}
        </div>
      </div>
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
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const {
    data: metadata,
    isLoading,
    error,
    refetch: refetchStudents,
  } = useQuery<{ techCenters: TechCenter[] }>({
    queryKey: ['studentDirectory', 'metadata'],
    queryFn: async () => {
      const response = await fetch('/api/students?metadata=true');
      if (!response.ok) throw new Error('Failed to fetch students');
      return response.json() as Promise<{ techCenters: TechCenter[] }>;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const searchResultsQuery = useQuery<StudentPageResponse>({
    queryKey: [
      'studentDirectory',
      'search-preview',
      submittedSearchQuery,
      selectedLocation,
      sortBy,
    ],
    queryFn: () =>
      fetchStudentPage({
        offset: 0,
        search: submittedSearchQuery,
        techCenterId: selectedLocation === 'all' ? undefined : selectedLocation,
        sortBy,
      }),
    enabled: submittedSearchQuery.length > 0,
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const techCenters = useMemo(
    () => metadata?.techCenters ?? [],
    [metadata?.techCenters],
  );
  const [loadedStudentsByRail, setLoadedStudentsByRail] = useState<
    Record<string, Student[]>
  >({});
  const handleStudentsChange = useCallback(
    (railId: string, students: Student[]) => {
      setLoadedStudentsByRail((current) => {
        const existing = current[railId];
        if (
          existing?.length === students.length &&
          existing.every((student, index) => student === students[index])
        ) {
          return current;
        }
        return { ...current, [railId]: students };
      });
    },
    [],
  );
  const isSearching = submittedSearchQuery.length > 0;
  const allStudents = useMemo(() => {
    const tickerRailIds =
      selectedLocation === 'all'
        ? ['trending', 'all', ...techCenters.map((center) => `center:${center.id}`)]
        : [`center:${selectedLocation}`];
    const seen = new Set<string>();
    return tickerRailIds.flatMap((railId) =>
      (loadedStudentsByRail[railId] ?? []).filter((student) => {
        if (seen.has(student.id)) return false;
        seen.add(student.id);
        return true;
      }),
    );
  }, [loadedStudentsByRail, selectedLocation, techCenters]);
  const searchDataMatchesCurrentQuery =
    searchResultsQuery.data !== undefined &&
    !searchResultsQuery.isPlaceholderData;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A2B4C]">
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-5">
        {!isSearching && !isLoading && (
          <div className="mb-4">
            <CommunityTicker students={allStudents} />
          </div>
        )}

        <div className="mb-4">
          <SearchFilterBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearch={() => setSubmittedSearchQuery(searchQuery.trim())}
            onClearSearch={() => {
              setSearchQuery('');
              setSubmittedSearchQuery('');
            }}
            isSearchingResults={searchResultsQuery.isFetching}
            submittedSearchQuery={submittedSearchQuery}
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
            locations={techCenters}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        </div>

        {isLoading ? (
          <>
            <TrendingSkeleton />
            <StudentDirectorySkeleton />
          </>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-center">
            <AlertCircle className="mx-auto h-5 w-5 text-red-600" />
            <p className="mt-1.5 text-[13px] font-semibold text-[#1A2B4C]">
              Unable to load roster records.
            </p>
            <button
              type="button"
              onClick={() => void refetchStudents()}
              className="mt-3 rounded-md bg-[#1A2B4C] px-3 py-1.5 text-[11.5px] font-semibold text-white transition-colors hover:bg-[#263D66]"
            >
              Retry
            </button>
          </div>
        ) : (
          <div>
            {isSearching ? (
              <HorizontalRail
                railId="search"
                onStudentsChange={handleStudentsChange}
                label="Search results"
                hue="#1A2B4C"
                searchQuery={submittedSearchQuery}
                techCenterId={selectedLocation === 'all' ? undefined : selectedLocation}
                sortBy={sortBy}
                initialPage={
                  searchDataMatchesCurrentQuery
                    ? searchResultsQuery.data
                    : undefined
                }
                initialPageUpdatedAt={searchResultsQuery.dataUpdatedAt}
                showEmptyMessage
                router={router}
                currentUserId={currentUserId}
                enableAlphabetNav
              />
            ) : (
              <>
                {selectedLocation === 'all' && (
                  <>
                    <HorizontalRail
                      railId="trending"
                      onStudentsChange={handleStudentsChange}
                      label="Trending Profiles"
                      hue="#C59B4C"
                      category="trending"
                      sortBy={sortBy}
                      router={router}
                      currentUserId={currentUserId}
                      showRank
                    />

                    <HorizontalRail
                      railId="all"
                      onStudentsChange={handleStudentsChange}
                      label="All Students"
                      hue="#1A2B4C"
                      sortBy={sortBy}
                      router={router}
                      currentUserId={currentUserId}
                      enableAlphabetNav
                    />
                  </>
                )}
                {techCenters.map((loc) => {
                  if (selectedLocation !== 'all' && loc.id !== selectedLocation) {
                    return null;
                  }
                  return (
                    <HorizontalRail
                      key={loc.id}
                      railId={`center:${loc.id}`}
                      onStudentsChange={handleStudentsChange}
                      label={loc.name}
                      hue={getTechCenterHue(loc.name)}
                      techCenterId={loc.id}
                      sortBy={sortBy}
                      router={router}
                      currentUserId={currentUserId}
                      enableAlphabetNav
                    />
                  );
                })}
              </>
            )}
          </div>
        )}

        {showBackToTop && (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Back to top"
            className="fixed bottom-5 right-5 z-50 inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#1A2B4C] text-white shadow-md transition-colors hover:bg-[#263D66]"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}