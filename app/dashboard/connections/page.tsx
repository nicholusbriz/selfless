'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Heart,
  Loader2,
  AlertCircle,
  TrendingUp,
  UserPlus,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface ConnectionUser {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  techCenter: {
    id: string;
    name: string;
  } | null;
  followersCount: number;
  followingCount: number;
  likesReceivedCount: number;
  connectedAt?: string;
  likedAt?: string;
  isFollowing?: boolean;
  isLiked?: boolean;
}

interface StudentStats {
  id: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string | null;
  techCenter?: { id: string; name: string } | null;
  followersCount: number;
  followingCount: number;
  likesReceivedCount: number;
  isFollowing?: boolean;
  isLiked?: boolean;
}

interface StudentsApiResponse {
  studentsByTechCenter?: Record<string, StudentStats[]>;
  totalStudents?: number;
}

interface LikesData {
  likers: ConnectionUser[];
  likedUsers: ConnectionUser[];
}

type TabKey = 'trending' | 'followers' | 'following' | 'likes';
type LikesView = 'received' | 'sent';

// -------- Fetchers --------
async function fetchConnections(
  userId: string,
  type: 'followers' | 'following'
): Promise<ConnectionUser[]> {
  const res = await fetch(`/api/social/connections/${userId}?type=${type}`);
  if (!res.ok) throw new Error(`Failed to fetch ${type}`);
  const data = await res.json();
  return Array.isArray(data.connections) ? data.connections : [];
}

async function fetchLikes(userId: string): Promise<LikesData> {
  const res = await fetch(`/api/social/likes/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch likes');
  const data = await res.json();
  return {
    likers: Array.isArray(data.likers) ? data.likers : [],
    likedUsers: Array.isArray(data.likedUsers) ? data.likedUsers : [],
  };
}

async function fetchAllStudents(): Promise<StudentStats[]> {
  const res = await fetch('/api/students');
  if (!res.ok) throw new Error('Failed to fetch students');
  const data: unknown = await res.json();

  if (Array.isArray(data)) return data as StudentStats[];

  if (data && typeof data === 'object') {
    const obj = data as StudentsApiResponse & { students?: StudentStats[] };
    if (Array.isArray(obj.students)) return obj.students;
    if (obj.studentsByTechCenter && typeof obj.studentsByTechCenter === 'object') {
      return Object.values(obj.studentsByTechCenter).flat();
    }
  }
  return [];
}

// -------- Date helper --------
function formatDate(value?: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// -------- Popularity --------
const popularityScore = (s: {
  followersCount?: number;
  likesReceivedCount?: number;
}) => (s.followersCount || 0) * 2 + (s.likesReceivedCount || 0);

function updateStudentsCache(
  old: unknown,
  update: (student: StudentStats) => StudentStats,
): unknown {
  if (Array.isArray(old)) {
    return old.map((student) => update(student as StudentStats));
  }
  if (!old || typeof old !== 'object') return old;

  const data = old as StudentsApiResponse & { students?: StudentStats[] };
  if (Array.isArray(data.students)) {
    return { ...data, students: data.students.map(update) };
  }
  if (data.studentsByTechCenter) {
    return {
      ...data,
      studentsByTechCenter: Object.fromEntries(
        Object.entries(data.studentsByTechCenter).map(([key, students]) => [
          key,
          students.map(update),
        ]),
      ),
    };
  }
  return old;
}

function findCachedStudent(old: unknown, studentId: string): StudentStats | undefined {
  if (Array.isArray(old)) {
    return old.find((student) => student?.id === studentId) as
      | StudentStats
      | undefined;
  }
  if (!old || typeof old !== 'object') return undefined;

  const data = old as StudentsApiResponse & { students?: StudentStats[] };
  const students = data.students ??
    Object.values(data.studentsByTechCenter ?? {}).flat();
  return students.find((student) => student.id === studentId);
}

// ============================================================
// SKELETONS
// ============================================================

const SkeletonRow = () => (
  <li className="px-4 py-2.5 flex items-center gap-3 animate-pulse">
    <div className="w-9 h-9 shrink-0 rounded-full bg-[#E5E7EB]" />
    <div className="flex-1 min-w-0 space-y-1.5">
      <div className="h-3 w-32 max-w-[45%] bg-[#E5E7EB] rounded" />
      <div className="h-2.5 w-40 max-w-[55%] bg-[#F3F4F6] rounded" />
    </div>
    <div className="flex items-center gap-4 shrink-0">
      <div className="h-3 w-16 bg-[#E5E7EB] rounded" />
      <div className="h-3 w-14 bg-[#F3F4F6] rounded" />
    </div>
  </li>
);

const SkeletonList = ({ rows = 8 }: { rows?: number }) => (
  <ul className="divide-y divide-[#F3F4F6]">
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonRow key={i} />
    ))}
  </ul>
);

const StatsSkeleton = () => (
  <div className="mt-4 flex flex-wrap items-center gap-4 animate-pulse">
    <div className="h-4 w-24 bg-[#E5E7EB] rounded" />
    <div className="h-4 w-24 bg-[#E5E7EB] rounded" />
    <div className="h-4 w-20 bg-[#E5E7EB] rounded" />
    <div className="h-4 w-20 bg-[#E5E7EB] rounded" />
  </div>
);

const InlineCountSkeleton = () => (
  <span
    aria-hidden="true"
    className="inline-block h-3 w-5 animate-pulse rounded bg-[#E5E7EB] align-middle"
  />
);

export default function ConnectionsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const currentUserId = session?.user?.id;

  const [activeTab, setActiveTab] = useState<TabKey>('trending');
  const [likesView, setLikesView] = useState<LikesView>('received');

  const sharedQueryOptions = {
    enabled: !!currentUserId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchInterval: 60 * 1000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: false,
  } as const;

  // ============================================================
  // PREFETCH EVERYTHING ON MOUNT
  // Fires as soon as currentUserId is available, regardless of
  // the active tab — so the user sees Trending instantly.
  // ============================================================
  useEffect(() => {
    if (!currentUserId) return;

    // Trending source
    queryClient.prefetchQuery({
      queryKey: ['students'],
      queryFn: fetchAllStudents,
      staleTime: sharedQueryOptions.staleTime,
    });

    // Followers
    queryClient.prefetchQuery({
      queryKey: ['connections', 'followers', currentUserId],
      queryFn: () => fetchConnections(currentUserId, 'followers'),
      staleTime: sharedQueryOptions.staleTime,
    });

    // Following
    queryClient.prefetchQuery({
      queryKey: ['connections', 'following', currentUserId],
      queryFn: () => fetchConnections(currentUserId, 'following'),
      staleTime: sharedQueryOptions.staleTime,
    });

    // Likes
    queryClient.prefetchQuery({
      queryKey: ['connections', 'likes', currentUserId],
      queryFn: () => fetchLikes(currentUserId),
      staleTime: sharedQueryOptions.staleTime,
    });

    // Current-user stats
    queryClient.prefetchQuery({
      queryKey: ['currentUserStats', currentUserId],
      queryFn: async () => {
        const all = await fetchAllStudents();
        return all.find((s) => s.id === currentUserId) ?? null;
      },
      staleTime: sharedQueryOptions.staleTime,
    });
  }, [currentUserId, queryClient, sharedQueryOptions.staleTime]);

  // ---------- Data (active views) ----------
  const followersQuery = useQuery({
    queryKey: ['connections', 'followers', currentUserId],
    queryFn: () => fetchConnections(currentUserId!, 'followers'),
    ...sharedQueryOptions,
  });

  const followingQuery = useQuery({
    queryKey: ['connections', 'following', currentUserId],
    queryFn: () => fetchConnections(currentUserId!, 'following'),
    ...sharedQueryOptions,
  });

  const likesQuery = useQuery({
    queryKey: ['connections', 'likes', currentUserId],
    queryFn: () => fetchLikes(currentUserId!),
    ...sharedQueryOptions,
  });

  const studentsQuery = useQuery({
    queryKey: ['students'],
    queryFn: fetchAllStudents,
    ...sharedQueryOptions,
  });

  const statsQuery = useQuery({
    queryKey: ['currentUserStats', currentUserId],
    queryFn: async (): Promise<StudentStats | null> => {
      if (!currentUserId) return null;
      const all = await fetchAllStudents();
      return all.find((s) => s.id === currentUserId) ?? null;
    },
    ...sharedQueryOptions,
  });

  const currentUserStats = statsQuery.data;

  // ---------- Trending (top 10 across all tech centers) ----------
  const trendingUsers: StudentStats[] = useMemo(() => {
    const raw = studentsQuery.data;
    const all: StudentStats[] = Array.isArray(raw) ? raw : [];
    const filtered = all.filter((s) => s && s.id !== currentUserId);

    const sorted = [...filtered].sort((a, b) => {
      const diff = popularityScore(b) - popularityScore(a);
      if (diff !== 0) return diff;
      return (
        (b.followersCount || 0) - (a.followersCount || 0) ||
        (b.likesReceivedCount || 0) - (a.likesReceivedCount || 0) ||
        `${a.firstName ?? ''} ${a.lastName ?? ''}`.localeCompare(
          `${b.firstName ?? ''} ${b.lastName ?? ''}`
        )
      );
    });

    return sorted.slice(0, 10);
  }, [studentsQuery.data, currentUserId]);

  // ---------- Active dataset ----------
  const activeQuery = useMemo(() => {
    if (activeTab === 'followers') return followersQuery;
    if (activeTab === 'following') return followingQuery;
    if (activeTab === 'likes') return likesQuery;
    return studentsQuery;
  }, [activeTab, followersQuery, followingQuery, likesQuery, studentsQuery]);

  const connections: ConnectionUser[] = useMemo(() => {
    if (activeTab === 'trending') {
      const source = Array.isArray(studentsQuery.data) ? studentsQuery.data : [];
      const byId = new Map(source.map((s) => [s.id, s]));

      return trendingUsers.map((u) => {
        const live = byId.get(u.id) ?? u;
        return {
          id: live.id,
          firstName: live.firstName ?? '',
          lastName: live.lastName ?? '',
          profileImageUrl: live.profileImageUrl ?? null,
          techCenter: live.techCenter ?? null,
          followersCount: live.followersCount || 0,
          followingCount: live.followingCount || 0,
          likesReceivedCount: live.likesReceivedCount || 0,
          isFollowing: live.isFollowing,
          isLiked: live.isLiked,
        };
      });
    }

    if (activeTab === 'likes') {
      return likesView === 'sent'
        ? likesQuery.data?.likedUsers ?? []
        : likesQuery.data?.likers ?? [];
    }

    if (activeTab === 'following') {
      const source = Array.isArray(studentsQuery.data) ? studentsQuery.data : [];
      const byId = new Map(source.map((s) => [s.id, s]));
      const base = Array.isArray(activeQuery?.data)
        ? (activeQuery?.data as ConnectionUser[])
        : [];

      return base
        .map((c) => {
          const live = byId.get(c.id);
          if (!live) return c;
          return {
            ...c,
            followersCount: live.followersCount ?? c.followersCount,
            followingCount: live.followingCount ?? c.followingCount,
            likesReceivedCount:
              live.likesReceivedCount ?? c.likesReceivedCount,
            isFollowing: live.isFollowing ?? c.isFollowing,
            isLiked: live.isLiked ?? c.isLiked,
          };
        })
        .filter((c) => c.isFollowing !== false);
    }

    const data = activeQuery?.data;
    return Array.isArray(data) ? (data as ConnectionUser[]) : [];
  }, [activeTab, likesView, likesQuery.data, trendingUsers, activeQuery, studentsQuery.data]);

  const isFetchingWithoutData =
    !!activeQuery?.isFetching && activeQuery.data === undefined;
  const error = activeQuery?.error;

  // ---------- Unfollow mutation ----------
  const unfollowMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/social/follow/${userId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to unfollow');
      return res.json();
    },
    onMutate: async (userId) => {
      const followingKey = ['connections', 'following', currentUserId];
      const followersKey = ['connections', 'followers', currentUserId];

      await Promise.all([
        queryClient.cancelQueries({ queryKey: followingKey }),
        queryClient.cancelQueries({ queryKey: followersKey }),
        queryClient.cancelQueries({ queryKey: ['students'] }),
      ]);

      const previousFollowing =
        queryClient.getQueryData<ConnectionUser[]>(followingKey);
      const previousFollowers =
        queryClient.getQueryData<ConnectionUser[]>(followersKey);
      const previousStudents = queryClient.getQueryData(['students']);
      const previousStats = queryClient.getQueryData<StudentStats | null | undefined>([
        'currentUserStats',
        currentUserId,
      ]);

      queryClient.setQueryData<ConnectionUser[]>(followingKey, (old) =>
        Array.isArray(old) ? old.filter((u) => u.id !== userId) : old
      );

      queryClient.setQueryData<StudentStats | null | undefined>(
        ['currentUserStats', currentUserId],
        (old) =>
          old
            ? { ...old, followingCount: Math.max(0, (old.followingCount || 0) - 1) }
            : old
      );

      queryClient.setQueryData(['students'], (old) =>
        updateStudentsCache(old, (student) => {
          if (student.id === userId) {
            return {
              ...student,
              isFollowing: false,
              followersCount: Math.max(0, (student.followersCount || 0) - 1),
            };
          }
          if (student.id === currentUserId) {
            return {
              ...student,
              followingCount: Math.max(0, (student.followingCount || 0) - 1),
            };
          }
          return student;
        }),
      );

      return { previousFollowing, previousFollowers, previousStudents, previousStats };
    },
    onError: (_err, _userId, context) => {
      if (!context) return;
      queryClient.setQueryData(
        ['connections', 'following', currentUserId],
        context.previousFollowing
      );
      queryClient.setQueryData(
        ['connections', 'followers', currentUserId],
        context.previousFollowers
      );
      queryClient.setQueryData(['students'], context.previousStudents);
      queryClient.setQueryData(
        ['currentUserStats', currentUserId],
        context.previousStats,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['connections', 'following', currentUserId],
        refetchType: 'none',
      });
      queryClient.invalidateQueries({
        queryKey: ['currentUserStats', currentUserId],
        refetchType: 'none',
      });
      queryClient.invalidateQueries({
        queryKey: ['students'],
        refetchType: 'none',
      });
    },
  });

  // ---------- Follow mutation ----------
  const followMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const response = await fetch(`/api/social/follow/${studentId}`, {
        method: 'POST',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to follow');
      }
      return response.json();
    },
    onMutate: async (studentId: string) => {
      const followingKey = ['connections', 'following', currentUserId];
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['students'] }),
        queryClient.cancelQueries({ queryKey: followingKey }),
      ]);
      const previousStudents = queryClient.getQueryData(['students']);
      const previousFollowing =
        queryClient.getQueryData<ConnectionUser[]>(followingKey);
      const followedStudent = findCachedStudent(previousStudents, studentId);

      queryClient.setQueryData(['students'], (old) =>
        updateStudentsCache(old, (student) => {
          if (student.id === studentId) {
            return {
              ...student,
              isFollowing: true,
              followersCount: (student.followersCount || 0) + 1,
            };
          }
          if (student.id === currentUserId) {
            return {
              ...student,
              followingCount: (student.followingCount || 0) + 1,
            };
          }
          return student;
        }),
      );

      queryClient.setQueryData<StudentStats | null | undefined>(
        ['currentUserStats', currentUserId],
        (old) =>
          old
            ? { ...old, followingCount: (old.followingCount || 0) + 1 }
            : old,
      );

      if (followedStudent) {
        queryClient.setQueryData<ConnectionUser[]>(followingKey, (old) => {
          if (!Array.isArray(old) || old.some((user) => user.id === studentId)) {
            return old;
          }
          return [
            ...old,
            {
              id: followedStudent.id,
              firstName: followedStudent.firstName ?? '',
              lastName: followedStudent.lastName ?? '',
              profileImageUrl: followedStudent.profileImageUrl ?? null,
              techCenter: followedStudent.techCenter ?? null,
              followersCount: followedStudent.followersCount || 0,
              followingCount: followedStudent.followingCount || 0,
              likesReceivedCount: followedStudent.likesReceivedCount || 0,
              isFollowing: true,
              isLiked: followedStudent.isLiked,
            },
          ];
        });
      }

      return { previousStudents, previousFollowing };
    },
    onError: (_err, _variables, context) => {
      if (!context) return;
      queryClient.setQueryData(['students'], context.previousStudents);
      queryClient.setQueryData(
        ['connections', 'following', currentUserId],
        context.previousFollowing,
      );
      queryClient.setQueryData<StudentStats | null | undefined>(
        ['currentUserStats', currentUserId],
        (old) =>
          old
            ? { ...old, followingCount: Math.max(0, (old.followingCount || 0) - 1) }
            : old,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['students'], refetchType: 'none' });
      queryClient.invalidateQueries({
        queryKey: ['connections', 'following', currentUserId],
        refetchType: 'none',
      });
      queryClient.invalidateQueries({
        queryKey: ['currentUserStats', currentUserId],
        refetchType: 'none',
      });
    },
  });

  // ---------- Like / Unlike mutation ----------
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to toggle like');
      }
      return response.json();
    },
    onMutate: async ({ studentId, isLiked }) => {
      const likesKey = ['connections', 'likes', currentUserId];
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['students'] }),
        queryClient.cancelQueries({ queryKey: likesKey }),
      ]);
      const previousStudents = queryClient.getQueryData(['students']);
      const previousLikes = queryClient.getQueryData<LikesData>(likesKey);
      const targetStudent = findCachedStudent(previousStudents, studentId);

      queryClient.setQueryData(['students'], (old) =>
        updateStudentsCache(old, (student) =>
          student.id === studentId
            ? {
                ...student,
                isLiked: !isLiked,
                likesReceivedCount: isLiked
                  ? Math.max(0, (student.likesReceivedCount || 0) - 1)
                  : (student.likesReceivedCount || 0) + 1,
              }
            : student,
        ),
      );

      queryClient.setQueryData<LikesData>(likesKey, (old) => {
        if (!old) return old;
        if (isLiked) {
          return {
            ...old,
            likedUsers: old.likedUsers.filter((user) => user.id !== studentId),
          };
        }
        if (!targetStudent || old.likedUsers.some((user) => user.id === studentId)) {
          return old;
        }
        return {
          ...old,
          likedUsers: [
            {
              id: targetStudent.id,
              firstName: targetStudent.firstName ?? '',
              lastName: targetStudent.lastName ?? '',
              profileImageUrl: targetStudent.profileImageUrl ?? null,
              techCenter: targetStudent.techCenter ?? null,
              followersCount: targetStudent.followersCount || 0,
              followingCount: targetStudent.followingCount || 0,
              likesReceivedCount: targetStudent.likesReceivedCount || 0,
              likedAt: new Date().toISOString(),
              isLiked: true,
            },
            ...old.likedUsers,
          ],
        };
      });

      return { previousStudents, previousLikes };
    },
    onSuccess: (
      data: any,
      { studentId, isLiked }: { studentId: string; isLiked: boolean }
    ) => {
      queryClient.setQueryData(['students'], (old) =>
        updateStudentsCache(old, (student) =>
          student.id === studentId
            ? {
                ...student,
                isLiked: !isLiked,
                likesReceivedCount:
                  data?.counts?.likesReceivedCount ?? student.likesReceivedCount,
              }
            : student,
        ),
      );
    },
    onError: (_err, _variables, context) => {
      if (context?.previousStudents) {
        queryClient.setQueryData(['students'], context.previousStudents);
      }
      if (context) {
        queryClient.setQueryData(
          ['connections', 'likes', currentUserId],
          context.previousLikes,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['students'], refetchType: 'none' });
      queryClient.invalidateQueries({
        queryKey: ['connections', 'likes', currentUserId],
        refetchType: 'none',
      });
    },
  });

  const handleUnfollow = (userId: string) => unfollowMutation.mutate(userId);

  const handleFollow = (studentId: string) => {
    const student = findCachedStudent(
      queryClient.getQueryData(['students']),
      studentId,
    );
    if (student?.isFollowing) unfollowMutation.mutate(studentId);
    else followMutation.mutate(studentId);
  };

  const handleLikeToggle = (studentId: string) => {
    const student = findCachedStudent(
      queryClient.getQueryData(['students']),
      studentId,
    );
    likeMutation.mutate({ studentId, isLiked: student?.isLiked || false });
  };

  const handleUnlike = (studentId: string) => {
    likeMutation.mutate({ studentId, isLiked: true });
  };

  const getInitials = (first?: string, last?: string) =>
    `${(first || '?').charAt(0)}${(last || '?').charAt(0)}`.toUpperCase();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['connections'] });
    queryClient.invalidateQueries({ queryKey: ['students'] });
    queryClient.invalidateQueries({
      queryKey: ['currentUserStats', currentUserId],
    });
  };

  // Show the skeleton for Trending only while BOTH the session is
  // resolved AND the students query is genuinely loading.
  const showSessionLoading = status === 'loading';

  return (
    <div className="min-h-screen bg-[#F7F6F2]">
      <div className="mx-auto max-w-[900px] px-4 sm:px-6 lg:px-8 py-6">
        {/* HEADER */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[30px] sm:text-[34px] font-bold tracking-tight text-[#1A2B4C] leading-tight">
                My Connections
              </h1>
              <p className="mt-1.5 text-[14px] leading-5 text-[#B98A3E] font-semibold">
                Trending, followers, following, and likes
              </p>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#E5E7EB] bg-white rounded text-[12px] font-bold text-[#1A2B4C] hover:border-[#B98A3E] hover:bg-[#F7F6F2] transition-colors"
            >
              Refresh
            </button>
          </div>

          {/* Stats / Tabs */}
          {(showSessionLoading || statsQuery.isLoading) ? (
            <StatsSkeleton />
          ) : (
            currentUserStats && (
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('trending')}
                  className={`flex items-center gap-2 transition-colors underline ${
                    activeTab === 'trending'
                      ? 'text-[#B98A3E] font-bold'
                      : 'text-[#1A2B4C] hover:text-[#B98A3E]'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" strokeWidth={2} />
                  <span className="text-[14px]">Trending</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('followers')}
                  className={`flex items-center gap-2 transition-colors underline ${
                    activeTab === 'followers'
                      ? 'text-[#B98A3E] font-bold'
                      : 'text-[#1A2B4C] hover:text-[#B98A3E]'
                  }`}
                >
                  <Users className="w-4 h-4" strokeWidth={2} />
                  <span className="text-[14px]">
                    {currentUserStats.followersCount} followers
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('following')}
                  className={`flex items-center gap-2 transition-colors underline ${
                    activeTab === 'following'
                      ? 'text-[#55705B] font-bold'
                      : 'text-[#1A2B4C] hover:text-[#55705B]'
                  }`}
                >
                  <Users className="w-4 h-4" strokeWidth={2} />
                  <span className="text-[14px]">
                    {currentUserStats.followingCount} following
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('likes')}
                  className={`flex items-center gap-2 transition-colors underline ${
                    activeTab === 'likes'
                      ? 'text-red-500 font-bold'
                      : 'text-[#1A2B4C] hover:text-red-500'
                  }`}
                >
                  <Heart className="w-4 h-4" strokeWidth={2} />
                  <span className="text-[14px]">
                    {likesQuery.data ? (
                      `${likesQuery.data.likers.length + likesQuery.data.likedUsers.length} likes`
                    ) : (
                      <span className="inline-flex items-center gap-1.5">
                        <InlineCountSkeleton /> likes
                      </span>
                    )}
                  </span>
                </button>
              </div>
            )
          )}
        </header>

        {/* CONTENT */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-md overflow-hidden">
          {activeTab === 'likes' && (
            <div
              className="flex items-center gap-4 border-b border-[#F3F4F6] px-4 py-3"
              role="tablist"
              aria-label="Likes"
            >
              <button
                type="button"
                role="tab"
                aria-selected={likesView === 'received'}
                onClick={() => setLikesView('received')}
                className={`text-[13px] font-semibold underline underline-offset-4 ${likesView === 'received' ? 'text-red-600' : 'text-[#6B7280] hover:text-[#1A2B4C]'}`}
              >
                Received ({likesQuery.data ? likesQuery.data.likers.length : <InlineCountSkeleton />})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={likesView === 'sent'}
                onClick={() => setLikesView('sent')}
                className={`text-[13px] font-semibold underline underline-offset-4 ${likesView === 'sent' ? 'text-red-600' : 'text-[#6B7280] hover:text-[#1A2B4C]'}`}
              >
                You liked ({likesQuery.data ? likesQuery.data.likedUsers.length : <InlineCountSkeleton />})
              </button>
            </div>
          )}
          {(showSessionLoading || isFetchingWithoutData) ? (
            <SkeletonList rows={8} />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <AlertCircle
                className="w-10 h-10 text-[#A4462F] mb-4"
                strokeWidth={1.6}
              />
              <h3 className="text-[16px] font-bold text-[#1A2B4C] mb-2">
                Error loading connections
              </h3>
              <p className="text-[14px] text-[#4B5646] mb-4">
                {error instanceof Error
                  ? error.message
                  : 'Failed to load connections'}
              </p>
              <button
                type="button"
                onClick={() => activeQuery?.refetch()}
                className="inline-flex items-center gap-1.5 h-10 px-5 bg-[#1A2B4C] text-white font-mono text-[12px] uppercase tracking-widest hover:bg-[#2C3E5A] transition-colors rounded font-bold"
              >
                Retry
              </button>
            </div>
          ) : connections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              {activeTab === 'likes' ? (
                <Heart className="w-10 h-10 text-[#9CA3AF] mb-4" strokeWidth={1.6} />
              ) : activeTab === 'trending' ? (
                <TrendingUp className="w-10 h-10 text-[#9CA3AF] mb-4" strokeWidth={1.6} />
              ) : (
                <Users className="w-10 h-10 text-[#9CA3AF] mb-4" strokeWidth={1.6} />
              )}
              <h3 className="text-[16px] font-bold text-[#1A2B4C] mb-2">
                {activeTab === 'trending'
                  ? 'No trending students yet'
                  : activeTab === 'likes' && likesView === 'sent'
                  ? 'No profiles liked yet'
                  : `No ${activeTab} yet`}
              </h3>
              <p className="text-[14px] text-[#4B5646]">
                {activeTab === 'likes' && likesView === 'sent'
                  ? 'Profiles you like will appear here. You can unlike them from this tab.'
                  : activeTab === 'followers'
                  ? 'When people follow you, they will appear here.'
                  : activeTab === 'following'
                  ? 'Follow other students to see them here.'
                  : activeTab === 'likes'
                  ? 'When people like your profile, they will appear here.'
                  : 'Students will appear here as the community grows.'}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[#F3F4F6]">
              {connections.map((user) => {
                const initials = getInitials(user.firstName, user.lastName);
                const fullName =
                  `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() ||
                  'Unknown';

                const isUnfollowing =
                  unfollowMutation.isPending &&
                  unfollowMutation.variables === user.id;
                const isUnliking =
                  likeMutation.isPending &&
                  likeMutation.variables?.studentId === user.id &&
                  likeMutation.variables.isLiked;

                const connectedDate = formatDate(user.connectedAt);
                const likedDate = formatDate(user.likedAt);

                let dateLabel: string | null = null;
                if (activeTab === 'followers') {
                  dateLabel = connectedDate
                    ? `followed you on ${connectedDate}`
                    : 'followed you';
                } else if (activeTab === 'following') {
                  dateLabel = connectedDate
                    ? `started following on ${connectedDate}`
                    : 'started following';
                } else if (activeTab === 'likes') {
                  const likeMessage = likesView === 'sent'
                    ? 'You liked this profile'
                    : 'liked your student profile';
                  dateLabel = likedDate ? `${likeMessage} on ${likedDate}` : likeMessage;
                }

                return (
                  <li
                    key={user.id}
                    className="px-4 py-2.5 flex flex-wrap items-center gap-3 hover:bg-[#F7F6F2] transition-colors sm:flex-nowrap"
                  >
                    <div className="relative shrink-0">
                      {user.profileImageUrl ? (
                        <Image
                          src={user.profileImageUrl}
                          alt={fullName}
                          width={36}
                          height={36}
                          className="w-9 h-9 object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-9 h-9 flex items-center justify-center bg-[#1A2B4C] rounded-full">
                          <span className="text-white text-[11px] font-mono font-bold">
                            {initials}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-[14px] font-bold text-[#1A2B4C] leading-tight break-words">
                        {fullName}
                      </h3>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[#4B5646] leading-snug">
                        {user.techCenter && (
                          <span className="font-medium break-words">
                            {user.techCenter.name}
                          </span>
                        )}
                        {activeTab === 'trending' ? (
                          <>
                            <span className="text-[#D1D5DB]">•</span>
                            <span className="text-[#6B7280]">
                              {user.followersCount} followers · {user.likesReceivedCount} likes
                            </span>
                          </>
                        ) : (
                          dateLabel && (
                            <span className="text-[#6B7280] break-words">
                              {dateLabel}
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-x-3 gap-y-2 sm:w-auto">
                      {activeTab === 'trending' ? (
                        <>
                          {user.isLiked ? (
                            <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-red-600">
                              <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" strokeWidth={2} />
                              Liked
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleLikeToggle(user.id)}
                              className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#1A2B4C] underline underline-offset-2 decoration-[#B98A3E] transition-colors hover:text-[#B98A3E]"
                            >
                              <Heart className="w-3.5 h-3.5" strokeWidth={2} />
                              Like
                            </button>
                          )}

                          {user.isFollowing ? (
                            <span className="text-[12px] font-semibold text-[#55705B]">
                              Following
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleFollow(user.id)}
                              className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#1A2B4C] underline underline-offset-2 decoration-[#B98A3E] transition-colors hover:text-[#B98A3E]"
                            >
                              <UserPlus className="w-3.5 h-3.5" strokeWidth={2} />
                              Follow
                            </button>
                          )}

                          <Link
                            href={`/dashboard/students/${user.id}`}
                            className="text-[12px] font-semibold text-[#1A2B4C] underline underline-offset-2 decoration-[#B98A3E] hover:text-[#B98A3E] transition-colors"
                          >
                            View
                          </Link>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => router.push(`/dashboard/students/${user.id}`)}
                            className="text-[12px] font-semibold text-[#1A2B4C] underline underline-offset-2 decoration-[#B98A3E] hover:text-[#B98A3E] transition-colors"
                          >
                            View Profile
                          </button>

                          {activeTab === 'following' && (
                            <button
                              type="button"
                              onClick={() => handleUnfollow(user.id)}
                              disabled={isUnfollowing}
                              className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#A4462F] underline underline-offset-2 decoration-[#A4462F] hover:opacity-70 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isUnfollowing && (
                                <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} />
                              )}
                              {isUnfollowing ? 'Unfollowing…' : 'Unfollow'}
                            </button>
                          )}

                          {activeTab === 'likes' && likesView === 'sent' && (
                            <button
                              type="button"
                              onClick={() => handleUnlike(user.id)}
                              disabled={isUnliking}
                              className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#A4462F] underline underline-offset-2 decoration-[#A4462F] hover:opacity-70 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isUnliking && (
                                <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} />
                              )}
                              {isUnliking ? 'Unliking…' : 'Unlike'}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {activeTab === 'trending' && connections.length > 0 && (
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[12px] text-[#6B7280]">
            <TrendingUp className="h-3.5 w-3.5 shrink-0 text-[#B98A3E]" strokeWidth={2} />
            <span>
              Ranked by followers and likes received; followers carry extra weight.
            </span>
          </p>
        )}
      </div>
    </div>
  );
}