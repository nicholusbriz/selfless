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
  Check,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// ============================================================
// TYPES
// ============================================================

interface ConnectionUser {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  techCenter: { id: string; name: string } | null;
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
  students?: StudentStats[];
  totalStudents?: number;
}

interface LikesData {
  likers: ConnectionUser[];
  likedUsers: ConnectionUser[];
}

interface TrendingStudent {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  techCenter: { id: string; name: string } | null;
  followersCount: number;
  followingCount: number;
  likesReceivedCount: number;
  score: number;
  isFollowing: boolean;
  isLiked: boolean;
}

interface TrendingApiResponse {
  students: TrendingStudent[];
  generatedAt: string;
  meta?: {
    weights?: { followers: number; likes: number };
    limit?: number;
    minActivity?: number;
  };
}

type TabKey = 'trending' | 'followers' | 'following' | 'likes';
type LikesView = 'received' | 'sent';

// ============================================================
// FETCHERS
// ============================================================

async function fetchConnections(
  userId: string,
  type: 'followers' | 'following',
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
    const obj = data as StudentsApiResponse;
    if (Array.isArray(obj.students)) return obj.students;
    if (
      obj.studentsByTechCenter &&
      typeof obj.studentsByTechCenter === 'object'
    ) {
      return Object.values(obj.studentsByTechCenter).flat();
    }
  }
  return [];
}

async function fetchTrending(limit = 10): Promise<TrendingStudent[]> {
  const res = await fetch(
    `/api/social/trending?limit=${limit}&_t=${Date.now()}`,
    { cache: 'no-store' },
  );
  if (!res.ok) throw new Error('Failed to fetch trending');
  const data: TrendingApiResponse = await res.json();
  return Array.isArray(data.students) ? data.students : [];
}

// ============================================================
// HELPERS
// ============================================================

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

function updateStudentsCache(
  old: unknown,
  update: (student: StudentStats) => StudentStats,
): unknown {
  if (Array.isArray(old)) {
    return old.map((student) => update(student as StudentStats));
  }
  if (!old || typeof old !== 'object') return old;

  const data = old as StudentsApiResponse;
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

function findCachedStudent(
  old: unknown,
  studentId: string,
): StudentStats | undefined {
  if (Array.isArray(old)) {
    return old.find((student) => student?.id === studentId) as
      | StudentStats
      | undefined;
  }
  if (!old || typeof old !== 'object') return undefined;

  const data = old as StudentsApiResponse;
  const students =
    data.students ?? Object.values(data.studentsByTechCenter ?? {}).flat();
  return students.find((student) => student.id === studentId);
}

// ============================================================
// SKELETONS
// ============================================================

const SkeletonRow = () => (
  <li className="px-4 py-3 flex items-center gap-3">
    <div className="h-7 w-7 shrink-0 rounded-full shimmer" />
    <div className="h-10 w-10 shrink-0 rounded-full shimmer" />
    <div className="flex-1 min-w-0 space-y-2">
      <div className="h-3.5 w-32 max-w-[45%] rounded shimmer" />
      <div className="h-2.5 w-40 max-w-[55%] rounded shimmer" />
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <div className="h-6 w-14 rounded-full shimmer" />
      <div className="h-6 w-16 rounded-full shimmer" />
      <div className="h-6 w-12 rounded-full shimmer" />
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
    <div className="h-4 w-24 rounded shimmer" />
    <div className="h-4 w-24 rounded shimmer" />
    <div className="h-4 w-20 rounded shimmer" />
    <div className="h-4 w-20 rounded shimmer" />
  </div>
);

const InlineCountSkeleton = () => (
  <span
    aria-hidden="true"
    className="inline-block h-3 w-5 rounded shimmer align-middle"
  />
);

// ============================================================
// MAIN PAGE
// ============================================================

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

  // ---------- Prefetch on mount ----------
  useEffect(() => {
    if (!currentUserId) return;

    queryClient.prefetchQuery({
      queryKey: ['students'],
      queryFn: fetchAllStudents,
      staleTime: sharedQueryOptions.staleTime,
    });

    queryClient.prefetchQuery({
      queryKey: ['social', 'trending'],
      queryFn: () => fetchTrending(10),
      staleTime: 0,
    });

    queryClient.prefetchQuery({
      queryKey: ['connections', 'followers', currentUserId],
      queryFn: () => fetchConnections(currentUserId, 'followers'),
      staleTime: sharedQueryOptions.staleTime,
    });

    queryClient.prefetchQuery({
      queryKey: ['connections', 'following', currentUserId],
      queryFn: () => fetchConnections(currentUserId, 'following'),
      staleTime: sharedQueryOptions.staleTime,
    });

    queryClient.prefetchQuery({
      queryKey: ['connections', 'likes', currentUserId],
      queryFn: () => fetchLikes(currentUserId),
      staleTime: sharedQueryOptions.staleTime,
    });

    queryClient.prefetchQuery({
      queryKey: ['currentUserStats', currentUserId],
      queryFn: async () => {
        const all = await fetchAllStudents();
        return all.find((s) => s.id === currentUserId) ?? null;
      },
      staleTime: sharedQueryOptions.staleTime,
    });
  }, [currentUserId, queryClient, sharedQueryOptions.staleTime]);

  // ---------- Queries ----------

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

  const trendingQuery = useQuery({
    queryKey: ['social', 'trending'],
    queryFn: () => fetchTrending(10),
    enabled: !!currentUserId,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: 'always',
  });

  const currentUserStats = statsQuery.data;

  // ---------- Active dataset ----------
  const activeQuery = useMemo(() => {
    if (activeTab === 'followers') return followersQuery;
    if (activeTab === 'following') return followingQuery;
    if (activeTab === 'likes') return likesQuery;
    if (activeTab === 'trending') return trendingQuery;
    return studentsQuery;
  }, [
    activeTab,
    followersQuery,
    followingQuery,
    likesQuery,
    trendingQuery,
    studentsQuery,
  ]);

  const connections: ConnectionUser[] = useMemo(() => {
    // ---------- TRENDING ----------
    // Trust the trending endpoint's isFollowing/isLiked/counts directly.
    // Do NOT overlay the students cache — it lags and causes the wrong
    // button state to render on first paint.
    if (activeTab === 'trending') {
      const trending = trendingQuery.data ?? [];
      if (trending.length === 0) return [];

      return trending.map((u) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        profileImageUrl: u.profileImageUrl,
        techCenter: u.techCenter,
        followersCount: u.followersCount,
        followingCount: u.followingCount,
        likesReceivedCount: u.likesReceivedCount,
        isFollowing: u.isFollowing,
        isLiked: u.isLiked,
      }));
    }

    // ---------- LIKES ----------
    if (activeTab === 'likes') {
      return likesView === 'sent'
        ? likesQuery.data?.likedUsers ?? []
        : likesQuery.data?.likers ?? [];
    }

    // ---------- FOLLOWING ----------
    if (activeTab === 'following') {
      const source = Array.isArray(studentsQuery.data)
        ? studentsQuery.data
        : [];
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

    // ---------- FOLLOWERS ----------
    const data = activeQuery?.data;
    return Array.isArray(data) ? (data as ConnectionUser[]) : [];
  }, [
    activeTab,
    likesView,
    likesQuery.data,
    trendingQuery.data,
    activeQuery,
    studentsQuery.data,
  ]);

  const isFetchingWithoutData =
    !!activeQuery?.isFetching && activeQuery.data === undefined;
  const error = activeQuery?.error;

  // ---------- Unfollow mutation ----------
  const unfollowMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/social/follow/${userId}`, {
        method: 'DELETE',
      });
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
        queryClient.cancelQueries({ queryKey: ['social', 'trending'] }),
      ]);

      const previousFollowing =
        queryClient.getQueryData<ConnectionUser[]>(followingKey);
      const previousFollowers =
        queryClient.getQueryData<ConnectionUser[]>(followersKey);
      const previousStudents = queryClient.getQueryData(['students']);
      const previousTrending = queryClient.getQueryData<TrendingStudent[]>([
        'social',
        'trending',
      ]);
      const previousStats = queryClient.getQueryData<
        StudentStats | null | undefined
      >(['currentUserStats', currentUserId]);

      queryClient.setQueryData<ConnectionUser[]>(followingKey, (old) =>
        Array.isArray(old) ? old.filter((u) => u.id !== userId) : old,
      );

      queryClient.setQueryData<TrendingStudent[]>(
        ['social', 'trending'],
        (old) =>
          Array.isArray(old)
            ? old.map((u) =>
                u.id === userId
                  ? {
                      ...u,
                      isFollowing: false,
                      followersCount: Math.max(0, u.followersCount - 1),
                    }
                  : u,
              )
            : old,
      );

      queryClient.setQueryData<StudentStats | null | undefined>(
        ['currentUserStats', currentUserId],
        (old) =>
          old
            ? {
                ...old,
                followingCount: Math.max(0, (old.followingCount || 0) - 1),
              }
            : old,
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

      return {
        previousFollowing,
        previousFollowers,
        previousStudents,
        previousTrending,
        previousStats,
      };
    },
    onError: (_err, _userId, context) => {
      if (!context) return;
      queryClient.setQueryData(
        ['connections', 'following', currentUserId],
        context.previousFollowing,
      );
      queryClient.setQueryData(
        ['connections', 'followers', currentUserId],
        context.previousFollowers,
      );
      queryClient.setQueryData(['students'], context.previousStudents);
      queryClient.setQueryData(
        ['social', 'trending'],
        context.previousTrending,
      );
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
      // NOTE: we deliberately do NOT invalidate ['social', 'trending'] here.
      // The optimistic update above already wrote the correct state, and the
      // trending query refetches every 30s anyway. Forcing an immediate
      // refetch causes a brief flicker back to the old state.
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
        queryClient.cancelQueries({ queryKey: ['social', 'trending'] }),
      ]);
      const previousStudents = queryClient.getQueryData(['students']);
      const previousFollowing =
        queryClient.getQueryData<ConnectionUser[]>(followingKey);
      const previousTrending = queryClient.getQueryData<TrendingStudent[]>([
        'social',
        'trending',
      ]);
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

      queryClient.setQueryData<TrendingStudent[]>(
        ['social', 'trending'],
        (old) =>
          Array.isArray(old)
            ? old.map((u) =>
                u.id === studentId
                  ? {
                      ...u,
                      isFollowing: true,
                      followersCount: u.followersCount + 1,
                    }
                  : u,
              )
            : old,
      );

      queryClient.setQueryData<StudentStats | null | undefined>(
        ['currentUserStats', currentUserId],
        (old) =>
          old ? { ...old, followingCount: (old.followingCount || 0) + 1 } : old,
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

      return { previousStudents, previousFollowing, previousTrending };
    },
    onError: (_err, _variables, context) => {
      if (!context) return;
      queryClient.setQueryData(['students'], context.previousStudents);
      queryClient.setQueryData(
        ['connections', 'following', currentUserId],
        context.previousFollowing,
      );
      queryClient.setQueryData(
        ['social', 'trending'],
        context.previousTrending,
      );
      queryClient.setQueryData<StudentStats | null | undefined>(
        ['currentUserStats', currentUserId],
        (old) =>
          old
            ? {
                ...old,
                followingCount: Math.max(0, (old.followingCount || 0) - 1),
              }
            : old,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['students'],
        refetchType: 'none',
      });
      queryClient.invalidateQueries({
        queryKey: ['connections', 'following', currentUserId],
        refetchType: 'none',
      });
      queryClient.invalidateQueries({
        queryKey: ['currentUserStats', currentUserId],
        refetchType: 'none',
      });
      // No trending invalidation — see note on unfollowMutation above.
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
        queryClient.cancelQueries({ queryKey: ['social', 'trending'] }),
      ]);
      const previousStudents = queryClient.getQueryData(['students']);
      const previousLikes = queryClient.getQueryData<LikesData>(likesKey);
      const previousTrending = queryClient.getQueryData<TrendingStudent[]>([
        'social',
        'trending',
      ]);
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

      queryClient.setQueryData<TrendingStudent[]>(
        ['social', 'trending'],
        (old) =>
          Array.isArray(old)
            ? old.map((u) =>
                u.id === studentId
                  ? {
                      ...u,
                      isLiked: !isLiked,
                      likesReceivedCount: isLiked
                        ? Math.max(0, u.likesReceivedCount - 1)
                        : u.likesReceivedCount + 1,
                    }
                  : u,
              )
            : old,
      );

      queryClient.setQueryData<LikesData>(likesKey, (old) => {
        if (!old) return old;
        if (isLiked) {
          return {
            ...old,
            likedUsers: old.likedUsers.filter((user) => user.id !== studentId),
          };
        }
        if (
          !targetStudent ||
          old.likedUsers.some((user) => user.id === studentId)
        ) {
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

      return { previousStudents, previousLikes, previousTrending };
    },
    onSuccess: (
      data: { counts?: { likesReceivedCount?: number } },
      { studentId, isLiked }: { studentId: string; isLiked: boolean },
    ) => {
      // Sync the confirmed count from the server into the students cache.
      queryClient.setQueryData(['students'], (old) =>
        updateStudentsCache(old, (student) =>
          student.id === studentId
            ? {
                ...student,
                isLiked: !isLiked,
                likesReceivedCount:
                  data?.counts?.likesReceivedCount ??
                  student.likesReceivedCount,
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
        queryClient.setQueryData(
          ['social', 'trending'],
          context.previousTrending,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['students'],
        refetchType: 'none',
      });
      queryClient.invalidateQueries({
        queryKey: ['connections', 'likes', currentUserId],
        refetchType: 'none',
      });
      // No trending invalidation — see note on unfollowMutation above.
    },
  });

  // ---------- Handlers ----------

  const handleUnfollow = (userId: string) => unfollowMutation.mutate(userId);

  const handleFollow = (studentId: string) => {
    // Prefer the trending cache first (source of truth), fall back to students.
    const trending = queryClient.getQueryData<TrendingStudent[]>([
      'social',
      'trending',
    ]);
    const fromTrending = trending?.find((u) => u.id === studentId);

    if (fromTrending) {
      if (fromTrending.isFollowing) unfollowMutation.mutate(studentId);
      else followMutation.mutate(studentId);
      return;
    }

    const student = findCachedStudent(
      queryClient.getQueryData(['students']),
      studentId,
    );
    if (student?.isFollowing) unfollowMutation.mutate(studentId);
    else followMutation.mutate(studentId);
  };

  const handleLikeToggle = (studentId: string) => {
    const trending = queryClient.getQueryData<TrendingStudent[]>([
      'social',
      'trending',
    ]);
    const fromTrending = trending?.find((u) => u.id === studentId);

    if (fromTrending) {
      likeMutation.mutate({
        studentId,
        isLiked: fromTrending.isLiked,
      });
      return;
    }

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
    queryClient.invalidateQueries({ queryKey: ['social', 'trending'] });
    queryClient.invalidateQueries({
      queryKey: ['currentUserStats', currentUserId],
    });
  };

  const showSessionLoading = status === 'loading';

  return (
    <div className="min-h-screen bg-[#F7F6F2]">
      <style jsx global>{`
        @keyframes shimmerMove {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .shimmer {
          background: linear-gradient(
            90deg,
            #e5e7eb 0%,
            #f3f4f6 50%,
            #e5e7eb 100%
          );
          background-size: 200% 100%;
          animation: shimmerMove 1.4s ease-in-out infinite;
        }
        @keyframes rowEnter {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .row-enter {
          animation: rowEnter 240ms ease-out both;
        }
        @media (prefers-reduced-motion: reduce) {
          .shimmer,
          .row-enter {
            animation: none;
          }
        }
      `}</style>

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
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3.5 py-2 text-[12px] font-bold text-[#1A2B4C] transition-colors hover:border-[#B98A3E] hover:bg-[#F7F6F2] active:scale-95"
            >
              Refresh
            </button>
          </div>

          {showSessionLoading || statsQuery.isLoading ? (
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
                  <span className="relative flex h-4 w-4 items-center justify-center">
                    <TrendingUp className="h-4 w-4" strokeWidth={2} />
                    {activeTab === 'trending' && (
                      <span className="absolute -right-1.5 -top-1 flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#55705B] opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#55705B]" />
                      </span>
                    )}
                  </span>
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
                className={`text-[13px] font-semibold underline underline-offset-4 ${
                  likesView === 'received'
                    ? 'text-red-600'
                    : 'text-[#6B7280] hover:text-[#1A2B4C]'
                }`}
              >
                Received (
                {likesQuery.data ? (
                  likesQuery.data.likers.length
                ) : (
                  <InlineCountSkeleton />
                )}
                )
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={likesView === 'sent'}
                onClick={() => setLikesView('sent')}
                className={`text-[13px] font-semibold underline underline-offset-4 ${
                  likesView === 'sent'
                    ? 'text-red-600'
                    : 'text-[#6B7280] hover:text-[#1A2B4C]'
                }`}
              >
                You liked (
                {likesQuery.data ? (
                  likesQuery.data.likedUsers.length
                ) : (
                  <InlineCountSkeleton />
                )}
                )
              </button>
            </div>
          )}

          {showSessionLoading || isFetchingWithoutData ? (
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
                <TrendingUp
                  className="w-10 h-10 text-[#9CA3AF] mb-4"
                  strokeWidth={1.6}
                />
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
                        : 'Students with followers or likes will appear here as the community grows.'}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[#F3F4F6]">
              {connections.map((user, index) => {
                const rank = index + 1;
                const isTopThree = rank <= 3;
                const isTrending = activeTab === 'trending';
                const isFeatured = isTrending && isTopThree;

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
                  const likeMessage =
                    likesView === 'sent'
                      ? 'You liked this profile'
                      : 'liked your student profile';
                  dateLabel = likedDate
                    ? `${likeMessage} on ${likedDate}`
                    : likeMessage;
                }

                const rankBadgeStyles =
                  rank === 1
                    ? 'bg-gradient-to-br from-[#F5C518] to-[#D4A017] text-white shadow-[0_0_0_1px_rgba(212,160,23,0.25)]'
                    : rank === 2
                      ? 'bg-gradient-to-br from-[#C0C0C0] to-[#9CA3AF] text-white shadow-[0_0_0_1px_rgba(156,163,175,0.25)]'
                      : rank === 3
                        ? 'bg-gradient-to-br from-[#CD7F32] to-[#A65E2E] text-white shadow-[0_0_0_1px_rgba(166,94,46,0.25)]'
                        : 'bg-[#F7F6F2] text-[#4B5646]';

                return (
                  <li
                    key={user.id}
                    className={`
                      row-enter relative transition-colors
                      ${
                        isFeatured
                          ? 'overflow-hidden min-h-[210px] sm:min-h-[220px]'
                          : 'px-4 py-3 hover:bg-[#F7F6F2]/60'
                      }
                      ${
                        isTrending && rank === 1
                          ? 'bg-[#FBF7E9]'
                          : isTrending && rank === 2
                            ? 'bg-[#F5F6F7]'
                            : isTrending && rank === 3
                              ? 'bg-[#FBF4EF]'
                              : ''
                      }
                    `}
                    style={{
                      animationDelay: `${Math.min(index * 30, 300)}ms`,
                    }}
                  >
                    {isFeatured ? (
                      /* ============================================================
                         FEATURED CARD (top 3 trending) — warrior layout
                         ============================================================ */
                      <div className="relative flex min-h-[210px] items-stretch sm:min-h-[220px]">
                        {/* Left content column */}
                        <div className="relative z-10 flex w-1/2 min-w-0 flex-col justify-between p-4 sm:p-5">
                          {/* Top: rank + name + tech center */}
                          <div className="flex items-start gap-2">
                            <div
                              className={`
                                mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center
                                rounded-full font-mono text-[11px] font-bold tabular-nums
                                ${rankBadgeStyles}
                              `}
                              aria-label={`Rank ${rank}`}
                            >
                              {rank}
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3 className="text-[15px] font-bold tracking-[-0.01em] text-[#1A2B4C] leading-tight break-words sm:text-[15.5px]">
                                {fullName}
                              </h3>
                              {user.techCenter && (
                                <p className="mt-0.5 text-[11.5px] font-medium text-[#4B5646] break-words">
                                  {user.techCenter.name}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Middle: stat chips */}
                          <div className="mt-3 flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#B98A3E]/10 px-2 py-1 font-mono text-[10px] font-bold text-[#8A6A2E] tabular-nums">
                              <Users
                                className="h-3 w-3 shrink-0"
                                strokeWidth={2.4}
                              />
                              <span>{user.followersCount}</span>
                              <span className="font-sans font-semibold">
                                Followers
                              </span>
                            </span>

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2 py-1 font-mono text-[10px] font-bold text-red-600 tabular-nums">
                              <Heart
                                className="h-3 w-3 shrink-0 fill-red-500 text-red-500"
                                strokeWidth={2}
                              />
                              <span>{user.likesReceivedCount}</span>
                              <span className="font-sans font-semibold">
                                Likes
                              </span>
                            </span>
                          </div>

                          {/* Bottom: actions */}
                          <div className="mt-3 flex flex-wrap items-center gap-1.5">
                            {user.isLiked ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600">
                                <Heart
                                  className="h-3.5 w-3.5 fill-red-500 text-red-500"
                                  strokeWidth={2}
                                />
                                Liked
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleLikeToggle(user.id)}
                                className="inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[#1A2B4C] backdrop-blur-sm transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600 active:scale-95"
                              >
                                <Heart className="h-3.5 w-3.5" strokeWidth={2} />
                                Like
                              </button>
                            )}

                            {user.isFollowing ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-[#55705B] bg-[#55705B] px-2.5 py-1 text-[11px] font-semibold text-white">
                                <Check
                                  className="h-3.5 w-3.5"
                                  strokeWidth={2.5}
                                />
                                Following
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleFollow(user.id)}
                                className="inline-flex items-center gap-1 rounded-full bg-[#1A2B4C] px-2.5 py-1 text-[11px] font-semibold text-white transition-all hover:bg-[#2C3E5A] hover:shadow-md active:scale-95"
                              >
                                <UserPlus
                                  className="h-3.5 w-3.5"
                                  strokeWidth={2}
                                />
                                Follow
                              </button>
                            )}

                            <Link
                              href={`/dashboard/students/${user.id}`}
                              className="inline-flex items-center gap-1 rounded-full border border-transparent px-2.5 py-1 text-[11px] font-semibold text-[#4B5646] transition-all hover:border-[#E5E7EB] hover:bg-white/70 active:scale-95"
                            >
                              View
                            </Link>
                          </div>
                        </div>

                        {/* Right: hero portrait fills the other half */}
                        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 overflow-hidden">
                          {user.profileImageUrl ? (
                            <Image
                              src={user.profileImageUrl}
                              alt={fullName}
                              fill
                              sizes="(max-width: 640px) 50vw, 450px"
                              className="object-cover object-center"
                              priority={rank === 1}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[#DCE2E8]">
                              <span className="text-5xl font-black tracking-tight text-[#1A2B4C]/35">
                                {initials}
                              </span>
                            </div>
                          )}
                          <div
                            className={`
                              absolute inset-0
                              ${
                                rank === 1
                                  ? 'bg-gradient-to-r from-[#FBF7E9] via-[#FBF7E9]/30 to-transparent'
                                  : rank === 2
                                    ? 'bg-gradient-to-r from-[#F5F6F7] via-[#F5F6F7]/30 to-transparent'
                                    : 'bg-gradient-to-r from-[#FBF4EF] via-[#FBF4EF]/30 to-transparent'
                              }
                            `}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#12203B]/35 via-transparent to-transparent" />
                          <div className="absolute right-3 top-3 rounded-full border border-white/70 bg-[#12203B]/75 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-white backdrop-blur-sm">
                            {rank === 1
                              ? 'Champion'
                              : rank === 2
                                ? 'Warrior'
                                : 'Contender'}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* ============================================================
                         COMPACT ROW (rank 4+, or any non-trending tab)
                         ============================================================ */
                      <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
                        {isTrending && (
                          <div
                            className={`
                              flex h-7 w-7 shrink-0 items-center justify-center
                              rounded-full font-mono text-[11px] font-bold tabular-nums
                              ${rankBadgeStyles}
                            `}
                            aria-label={`Rank ${rank}`}
                          >
                            {rank}
                          </div>
                        )}

                        <div className="relative shrink-0">
                          {user.profileImageUrl ? (
                            <Image
                              src={user.profileImageUrl}
                              alt={fullName}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-full object-cover ring-1 ring-[#E5E7EB]"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A2B4C]">
                              <span className="text-[12px] font-mono font-bold text-white">
                                {initials}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-[14.5px] font-bold tracking-[-0.01em] text-[#1A2B4C] leading-tight break-words">
                            {fullName}
                          </h3>

                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-[#4B5646] leading-snug">
                            {user.techCenter && (
                              <span className="font-medium break-words">
                                {user.techCenter.name}
                              </span>
                            )}

                            {isTrending ? (
                              <>
                                <span className="hidden text-[#D1D5DB] sm:inline">
                                  ·
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#B98A3E]/10 px-2 py-0.5 font-mono text-[10px] font-bold text-[#8A6A2E] tabular-nums">
                                  <Users
                                    className="h-3 w-3"
                                    strokeWidth={2.4}
                                  />
                                  {user.followersCount}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-red-600 tabular-nums">
                                  <Heart
                                    className="h-3 w-3 fill-red-500 text-red-500"
                                    strokeWidth={2}
                                  />
                                  {user.likesReceivedCount}
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

                        <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-1.5 sm:w-auto">
                          {isTrending ? (
                            <>
                              {user.isLiked ? (
                                <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600">
                                  <Heart
                                    className="h-3.5 w-3.5 fill-red-500 text-red-500"
                                    strokeWidth={2}
                                  />
                                  Liked
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleLikeToggle(user.id)}
                                  className="inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#1A2B4C] transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600 active:scale-95"
                                >
                                  <Heart
                                    className="h-3.5 w-3.5"
                                    strokeWidth={2}
                                  />
                                  Like
                                </button>
                              )}

                              {user.isFollowing ? (
                                <span className="inline-flex items-center gap-1 rounded-full border border-[#55705B] bg-[#55705B] px-2.5 py-1 text-[11px] font-semibold text-white">
                                  <Check
                                    className="h-3.5 w-3.5"
                                    strokeWidth={2.5}
                                  />
                                  Following
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleFollow(user.id)}
                                  className="inline-flex items-center gap-1 rounded-full bg-[#1A2B4C] px-2.5 py-1 text-[11px] font-semibold text-white transition-all hover:bg-[#2C3E5A] hover:shadow-md active:scale-95"
                                >
                                  <UserPlus
                                    className="h-3.5 w-3.5"
                                    strokeWidth={2}
                                  />
                                  Follow
                                </button>
                              )}

                              <Link
                                href={`/dashboard/students/${user.id}`}
                                className="inline-flex items-center gap-1 rounded-full border border-transparent px-2.5 py-1 text-[11px] font-semibold text-[#4B5646] transition-all hover:border-[#E5E7EB] hover:bg-[#F7F6F2] active:scale-95"
                              >
                                View
                              </Link>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  router.push(`/dashboard/students/${user.id}`)
                                }
                                className="inline-flex items-center gap-1 rounded-full border border-transparent px-2.5 py-1 text-[11px] font-semibold text-[#1A2B4C] transition-all hover:border-[#E5E7EB] hover:bg-[#F7F6F2] active:scale-95"
                              >
                                View Profile
                              </button>

                              {activeTab === 'following' && (
                                <button
                                  type="button"
                                  onClick={() => handleUnfollow(user.id)}
                                  disabled={isUnfollowing}
                                  className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-[#A4462F] transition-all hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
                                >
                                  {isUnfollowing && (
                                    <Loader2
                                      className="h-3 w-3 animate-spin"
                                      strokeWidth={2}
                                    />
                                  )}
                                  {isUnfollowing ? 'Unfollowing…' : 'Unfollow'}
                                </button>
                              )}

                              {activeTab === 'likes' && likesView === 'sent' && (
                                <button
                                  type="button"
                                  onClick={() => handleUnlike(user.id)}
                                  disabled={isUnliking}
                                  className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-[#A4462F] transition-all hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
                                >
                                  {isUnliking && (
                                    <Loader2
                                      className="h-3 w-3 animate-spin"
                                      strokeWidth={2}
                                    />
                                  )}
                                  {isUnliking ? 'Unliking…' : 'Unlike'}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {activeTab === 'trending' && connections.length > 0 && (
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[12px] text-[#6B7280]">
            <TrendingUp
              className="h-3.5 w-3.5 shrink-0 text-[#B98A3E]"
              strokeWidth={2}
            />
            <span>
              Showing only students with at least one follower or like — ranked
              by followers first, then likes.
            </span>
          </p>
        )}
      </div>
    </div>
  );
}