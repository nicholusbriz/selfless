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
import {
  compareProfileImageFirst,
} from '@/lib/social/ranking';
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

// ============================================================
// PAGE CACHE ADAPTER
// ============================================================

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
    return [...students].sort((a, b) =>
      compareProfileImageFirst({
        id: a.id,
        followersCount: a.followersCount,
        likesReceivedCount: a.likesReceivedCount,
        firstName: a.firstName,
        lastName: a.lastName,
        profileImageUrl: a.profileImageUrl,
      }, {
        id: b.id,
        followersCount: b.followersCount,
        likesReceivedCount: b.likesReceivedCount,
        firstName: b.firstName,
        lastName: b.lastName,
        profileImageUrl: b.profileImageUrl,
      }),
    );
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
// STUDENT CARD (ENHANCED DESIGN — KEEPS ORIGINAL INFO)
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

  const totalCredits = student.studentCourses?.reduce((sum, course) => sum + (course.credits || 0), 0) || 0;

  // Keep card size consistent
  const cardWidth = 'w-[280px]';
  const cardWidthSm = 'sm:w-[290px]';

  return (
    <article className={`group ${cardWidth} shrink-0 snap-start overflow-hidden rounded-[22px] border border-[#E5E7EB] bg-white shadow-sm transition-shadow hover:shadow-md ${cardWidthSm}`}>
      {/* Image fills the entire card */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#1A2B4C]">
        <div className="absolute inset-x-3 top-3 z-10 flex items-center justify-between gap-2 text-white">
          {!isSuperAdmin && (
            <span className="inline-flex shrink-0 items-center rounded-md border border-white/30 bg-black/40 px-2.5 py-1 text-[10px] font-semibold">
              {totalCredits >= 6 ? 'Full time' : 'Part time'}
            </span>
          )}
          <Link
            href={`/dashboard/students/${student.id}`}
            className="ml-auto inline-flex shrink-0 items-center rounded-md border border-white/30 bg-black/40 px-2.5 py-1 text-[10px] font-semibold transition-colors hover:border-white/50 hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A84B]"
            aria-label={`View ${fullName}'s profile`}
          >
            View profile
          </Link>
        </div>
        {student.profileImageUrl ? (
          <Image
            src={student.profileImageUrl}
            alt={fullName}
            fill
            className="h-full w-full object-cover object-center"
            sizes="290px"
            quality={95}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-mono text-2xl font-black text-white/90">
              {initials}
            </span>
          </div>
        )}

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <Link
          href={`/dashboard/students/${student.id}`}
          className="absolute inset-0 z-[1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#D4A84B]"
          aria-label={`View ${fullName}'s profile`}
        />

        <div className="pointer-events-none absolute inset-0 flex flex-col justify-end p-3">
          {/* Row 1 — Name + Role */}
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[16px] font-bold leading-tight text-white">
              <Link
                href={`/dashboard/students/${student.id}`}
                className="rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A84B]"
                aria-label={`View ${fullName}'s profile`}
              >
                {fullName}
              </Link>
            </h3>
            {roleLabel && (
              <span className="text-[11px] font-medium text-white/90 shrink-0">
                {roleLabel}
              </span>
            )}
          </div>

          {/* Row 2 — Course */}
          {student.role?.name !== 'super_admin' && (
            <p className="text-[13px] font-medium text-white">
              {student.generalCourse || 'Student'}
            </p>
          )}

          {/* Row 3 — Tech Center with MapPin icon */}
          {student.techCenter?.name && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-[12px] w-[12px] shrink-0 text-[#D4A84B]" />
              <span className="text-[12px] font-medium text-white/90">
                {student.techCenter.name}
              </span>
            </div>
          )}

          {/* Row 4 — Stats & Credits (compact) */}
          <div className="mt-1 flex items-center gap-2 text-[11px] text-white/90">
            <span className="font-semibold text-white">{student.followersCount}</span>
            <span>followers</span>
            <span className="text-white/70">•</span>
            <span className="font-semibold text-white">{Math.max(0, student.likesReceivedCount)}</span>
            <span>likes</span>
            <span className="text-white/70">•</span>
            <span className="font-semibold text-white">{student.profileViewsCount}</span>
            <span>views</span>
          </div>

          {/* Row 5 — Enrolled Units summary */}
          {student.studentCourses?.length > 0 ? (
            <div className="mt-1">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <div className="flex items-center gap-1">
                  <BookOpen className="shrink-0 text-[#D4A84B] h-3 w-3" />
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-white/90">
                    Enrolled Courses
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-[#D4A84B]">
                  {totalCredits} credits
                </span>
              </div>
              <div className="space-y-0.5">
                {student.studentCourses.map((course) => (
                  <div key={course.id} className="flex items-start justify-between gap-2">
                    <span className="text-white text-[11px] font-medium">
                      {course.courseUnit}
                    </span>
                    <span className="shrink-0 text-[10px] font-semibold text-white">
                      {course.credits}cr
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : !isSuperAdmin ? (
            <p className="mt-1 text-[11px] font-medium text-white/90">
              Please submit your courses
            </p>
          ) : null}

          {/* Row 6 — Actions */}
          <div className="pointer-events-auto relative z-10 mt-2 flex items-center justify-end gap-1.5 overflow-hidden">
            {!isCurrentUser && (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => router.push(`/dashboard/messages?userId=${student.id}`)}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-white/30 bg-black/25 px-2.5 py-1 text-[10px] font-semibold text-white transition-all hover:bg-black/35 hover:border-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A84B]"
                  aria-label={`Message ${fullName}`}
                  title={`Message ${fullName}`}
                >
                  <MessageSquare className="h-3 w-3" />
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
      data?.pages.flatMap((page) => sortStudents(page.students, sortBy)) ?? [],
    [data?.pages, sortBy],
  );

  useEffect(() => {
    onStudentsChange(railId, students);
  }, [onStudentsChange, railId, students]);

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const availableLetters = new Set(students.map(getStudentInitial));
  const visibleStudents = selectedLetter
    ? students
        .filter((student) => getStudentInitial(student) === selectedLetter)
        .sort(compareStudentNames)
    : students;

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
      <section ref={sectionRef} className="mb-5 sm:mb-6">
        <div className="mb-2.5 flex items-baseline gap-3 border-t border-[#1A2B4C] pt-2">
          {hue && (
            <span
              className="h-3 w-1 shrink-0"
              style={{ backgroundColor: hue }}
            />
          )}
          <h2 className="text-[14px] font-bold uppercase tracking-wide text-[#1A2B4C] sm:text-[15px]">
            {label}
          </h2>
        </div>
        <div className="border border-[#D1D5DB] bg-white px-4 py-5 text-center" role="alert">
          <p className="text-[12px] text-[#4B5646]">
            {error instanceof Error ? error.message : 'Unable to load students.'}
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-2 text-xs font-semibold text-[#1A2B4C] underline"
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
      className="mb-5 sm:mb-6"
      aria-busy={isLoading || isFetchingNextPage}
    >
      <div className="mb-2.5 flex items-baseline border-t border-[#1A2B4C] pt-2">
        <div className="flex items-center gap-2">
          {hue && (
            <span
              className="h-3 w-1 shrink-0"
              style={{ backgroundColor: hue }}
            />
          )}
          <h2 className="text-[14px] font-bold uppercase tracking-wide text-[#1A2B4C] sm:text-[15px]">
            {label}
          </h2>
        </div>
      </div>

      {data && students.length === 0 ? (
        <div className="border border-dashed border-[#D1D5DB] bg-white px-4 py-5 text-center">
          <p className="text-[12px] text-[#4B5646]">
            {showEmptyMessage
              ? 'No matching student records found. Try another name or search term.'
              : 'No student records available'}
          </p>
        </div>
      ) : !data ? (
        <div className="flex gap-3 overflow-hidden" aria-hidden="true">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-72 w-60 shrink-0 animate-pulse bg-[#E5E7EB]" />
          ))}
        </div>
      ) : (
        <div
          ref={railRef}
          className="flex gap-3 overflow-x-auto pb-2 px-1"
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
              className="flex aspect-[3/4] w-[280px] shrink-0 flex-col items-center justify-center gap-3 rounded-[22px] border border-dashed border-[#1A2B4C]/30 bg-white px-6 text-center text-[#1A2B4C] transition-colors hover:border-[#1A2B4C] hover:bg-[#F7F6F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A84B] disabled:cursor-wait disabled:opacity-70 sm:w-[290px]"
            >
              {isFetchingNextPage ? (
                <span
                  aria-hidden="true"
                  className="h-5 w-5 animate-spin rounded-full border-2 border-[#D1D5DB] border-t-[#1A2B4C]"
                />
              ) : (
                <ChevronRight className="h-6 w-6" />
              )}
              <span className="text-sm font-bold">
                {isFetchingNextPage
                  ? 'Loading students…'
                  : isFetchNextPageError
                    ? 'Try loading more students'
                    : 'Load more students'}
              </span>
              <span className="text-xs text-[#6B7280]">
                {isFetchingNextPage
                  ? 'Please wait'
                  : 'Show the next 20 profiles'}
              </span>
            </button>
          )}
          <div className="w-1 shrink-0" aria-hidden />
        </div>
      )}

      {students.length > 0 && <div className="mt-1 flex items-center gap-2">
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={scrollLeft}
            aria-label="Scroll left"
            className="inline-flex h-7 w-7 items-center justify-center border border-[#D1D5DB] bg-white text-[#4B5646] hover:border-[#1A2B4C] hover:text-[#1A2B4C] active:bg-[#E5E7EB] sm:h-6 sm:w-6"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsPlaying((playing) => !playing)}
            aria-label={isPlaying ? `Pause ${label} animation` : `Play ${label} animation`}
            aria-pressed={isPlaying}
            className="inline-flex h-7 w-7 items-center justify-center border border-[#D1D5DB] bg-white text-[#4B5646] hover:border-[#1A2B4C] hover:text-[#1A2B4C] active:bg-[#E5E7EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A84B] sm:h-6 sm:w-6"
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={scrollRight}
            aria-label="Scroll right"
            className="inline-flex h-7 w-7 items-center justify-center border border-[#D1D5DB] bg-white text-[#4B5646] hover:border-[#1A2B4C] hover:text-[#1A2B4C] active:bg-[#E5E7EB] sm:h-6 sm:w-6"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {enableAlphabetNav && (
          <nav
            aria-label={`Browse ${label} by first name`}
            className="flex min-w-0 items-center gap-1 flex-wrap"
          >
            <button
              type="button"
              onClick={() => setSelectedLetter(null)}
              aria-pressed={selectedLetter === null}
              className={`rounded border px-2 py-0.5 font-mono text-[10px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A84B] ${
                selectedLetter === null
                  ? 'border-[#D4A84B] bg-[#D4A84B] text-white'
                  : 'border-[#D1D5DB] bg-white text-[#1A2B4C] hover:border-[#D4A84B] hover:text-[#D4A84B]'
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
                  className={`rounded border px-2 py-0.5 font-mono text-[10px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A84B] ${
                    selectedLetter === letter
                      ? 'border-[#D4A84B] bg-[#D4A84B] text-white'
                      : isAvailable
                        ? 'border-[#D1D5DB] bg-white text-[#1A2B4C] hover:border-[#D4A84B] hover:text-[#D4A84B]'
                        : 'cursor-not-allowed border-[#E5E7EB] bg-gray-50 text-[#C4C8CE]'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </nav>
        )}
      </div>}

      {isFetchNextPageError && (
        <p role="alert" className="mt-2 text-center text-xs text-[#A4462F]">
          Could not load more students. Try again.
        </p>
      )}
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
            {[0, 1, 2, 3, 4].map((card) => (
              <div
                key={card}
                aria-hidden="true"
                className="h-[360px] w-[280px] shrink-0 rounded-[22px] border border-[#E5E7EB] bg-white sm:w-[290px]"
              >
                <div className="flex h-full w-full items-center justify-center">
                  <div className="h-full w-full animate-pulse rounded-[22px] bg-[#E5E7EB]" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function TrendingSkeleton() {
  return (
    <section className="mb-6">
      <div className="mb-2.5 flex items-center gap-2 border-t border-[#1A2B4C] pt-2">
        <span className="h-3 w-1 shrink-0 bg-[#D4A84B]" />
        <span className="h-4 w-48 animate-pulse bg-[#E5E7EB]" />
      </div>
      <div className="flex gap-3 overflow-hidden pb-2">
        {[0, 1, 2, 3, 4].map((card) => (
          <div
            key={card}
            aria-hidden="true"
            className="aspect-[3/4] w-[280px] shrink-0 rounded-[22px] border border-[#E5E7EB] bg-white sm:w-[290px]"
          >
            <div className="flex h-full w-full items-center justify-center">
              <div className="h-full w-full animate-pulse rounded-[22px] bg-[#E5E7EB]" />
            </div>
          </div>
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
    'inline-flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-bold border transition-colors';
  const chipOn = 'bg-[#1A2B4C] border-[#1A2B4C] text-white';
  const chipOff = 'bg-white border-[#D1D5DB] text-[#4B5646] hover:border-[#1A2B4C]';

  return (
    <section className="border border-[#1A2B4C] bg-white">
      <div className="bg-[#F7F6F2] px-3 py-2 sm:px-4">
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

      <div className="border-t border-[#D1D5DB] px-3 py-2 sm:px-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSearch();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative min-w-0 flex-1">
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
                onClick={onClearSearch}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1A2B4C]"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="inline-flex h-8 shrink-0 items-center gap-1.5 bg-[#1A2B4C] px-3 text-[11px] font-bold text-white transition-colors hover:bg-[#23385d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B98A3E] focus-visible:ring-offset-2"
          >
            <Search className="h-3 w-3" />
            Search
          </button>
        </form>
        {isSearchingResults && submittedSearchQuery && (
          <p
            role="status"
            aria-live="polite"
            className="mt-2 flex items-center gap-2 text-[11px] text-[#6B7280]"
          >
            <span
              aria-hidden="true"
              className="h-3 w-3 animate-spin rounded-full border-2 border-[#D1D5DB] border-t-[#1A2B4C]"
            />
            Searching students for &ldquo;{submittedSearchQuery}&rdquo;...
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
    <div className="border border-[#D1D5DB] bg-white">
      {selectedStudent && (
        <div className="border-b border-[#D1D5DB] bg-[#F7F6F2] px-3 py-3 sm:px-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden border border-[#D1D5DB] bg-white">
                {selectedStudent.profileImageUrl ? (
                  <Image
                    src={selectedStudent.profileImageUrl}
                    alt={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
                    fill
                    sizes="48px"
                    className="object-cover object-top"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#1A2B4C]">
                    <span className="font-mono text-[14px] font-bold tracking-wider text-[#D4A84B]">
                      {`${selectedStudent.firstName.charAt(0)}${selectedStudent.lastName.charAt(0)}`.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-[13px] font-bold text-[#1A2B4C] line-clamp-1">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </h3>
                <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#4B5646]">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full border border-[#D1D5DB]"
                    style={{ backgroundColor: getTechCenterHue(selectedStudent.techCenter?.name) || '#D4A84B' }}
                  />
                  <span className="truncate font-medium" title={selectedStudent.techCenter?.name || 'Campus Member'}>
                    {selectedStudent.techCenter?.name || 'Campus Member'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 sm:shrink">
              <button
                type="button"
                onClick={() => router.push(`/dashboard/students/${selectedStudent.id}`)}
                aria-label={`View ${selectedStudent.firstName} ${selectedStudent.lastName}'s profile`}
                className="inline-flex items-center gap-1.5 h-8 px-3 border border-[#1A2B4C] bg-[#1A2B4C] text-[11px] font-bold text-white hover:bg-[#23385d] active:bg-[#2a4473] transition-colors whitespace-nowrap"
              >
                View profile
                <ChevronRight className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                aria-label="Close student info"
                className="inline-flex h-8 w-8 items-center justify-center border border-[#D1D5DB] bg-white text-[#4B5646] hover:border-[#1A2B4C] hover:text-[#1A2B4C] active:bg-[#E5E7EB] shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {!selectedStudent && profileStudents.length > 0 && (
        <div className="bg-[#F7F6F2] px-4 py-2 border-b border-[#D1D5DB]">
          <p className="text-[10px] text-[#6B7280]">
            💡 <span className="font-medium text-[#4B5646]">Tip:</span> Click on any student image to view their name and tech center
          </p>
        </div>
      )}

      <div className="flex h-24 items-center overflow-hidden px-2 sm:px-3">
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
                  className="relative mr-2 h-20 w-20 shrink-0 overflow-hidden bg-white border-2 border-transparent hover:border-[#D4A84B] active:border-[#D4A84B] active:scale-95 transition-all focus:border-[#D4A84B] focus:outline-none touch-manipulation sm:h-20 sm:w-20"
                  title={`${student.firstName} ${student.lastName}`}
                  aria-label={`View ${student.firstName} ${student.lastName}'s info`}
                >
                  <Image
                    src={student.profileImageUrl!}
                    alt={`${student.firstName} ${student.lastName}`}
                    fill
                    sizes="80px"
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
    <div className="min-h-screen bg-[#F7F6F2] text-[#1A2B4C]">
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-5">

        {/* Community Ticker */}
        {!isSearching && !isLoading && (
          <div className="mb-4 sm:mb-5">
            <CommunityTicker students={allStudents} />
          </div>
        )}

        {/* Search & Filter Section */}
        <div className="mb-5 sm:mb-6">
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

        {/* Dynamic Rails / Content */}
        {isLoading ? (
          <>
            <TrendingSkeleton />
            <StudentDirectorySkeleton />
          </>
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
                      label="Trending Student Profiles"
                      hue="#D4A84B"
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