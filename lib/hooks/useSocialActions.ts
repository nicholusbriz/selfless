'use client';

import { useCallback, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { socialEndpoints, socialFetch } from '@/lib/social/endpoints';
import { socialKeys } from '@/lib/social/cacheKeys';
import type { PageCacheAdapter } from '@/lib/social/cacheKeys';
import type { SocialPatch, SocialStatsMap } from '@/lib/social/types';
import {
  patchStudentsShape,
  findInStudentsShape,
  patchConnectionList,
  patchLikesShape,
} from '@/lib/social/patchHelpers';

interface Options {
  pageAdapters?: PageCacheAdapter[];
  enableFollow?: boolean;
  enableLike?: boolean;
}

export function useSocialActions(opts: Options = {}) {
  const { pageAdapters = [], enableFollow = true, enableLike = true } = opts;
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const queryClient = useQueryClient();

  const patchAllCaches = useCallback(
    (targetId: string, patch: SocialPatch) => {
      queryClient.setQueryData(socialKeys.students, (old) =>
        patchStudentsShape(old, targetId, patch),
      );

      queryClient.setQueryData(socialKeys.trending, (old) =>
        Array.isArray(old)
          ? old.map((u: any) => (u.id === targetId ? { ...u, ...patch } : u))
          : old,
      );

      if (currentUserId) {
        queryClient.setQueryData(socialKeys.followers(currentUserId), (old) =>
          patchConnectionList(old, targetId, patch),
        );
        queryClient.setQueryData(socialKeys.following(currentUserId), (old) =>
          patchConnectionList(old, targetId, patch),
        );
        queryClient.setQueryData(socialKeys.likes(currentUserId), (old) =>
          patchLikesShape(old, targetId, patch),
        );
      }

      // Stats map — patches every cached variant
      queryClient.setQueriesData<SocialStatsMap>(
        { queryKey: ['social', 'stats'] },
        (old) => {
          if (!old || typeof old !== 'object') return old;
          if (!old[targetId]) return old;
          return {
            ...old,
            [targetId]: { ...old[targetId], ...patch },
          };
        },
      );

      for (const adapter of pageAdapters) {
        queryClient.setQueryData(adapter.queryKey, (old) =>
          adapter.patch(old, targetId, patch),
        );
      }
    },
    [queryClient, currentUserId, pageAdapters],
  );

  const readLiveState = useCallback(
    (targetId: string): { isFollowing: boolean; isLiked: boolean } => {
      const statsEntries = queryClient.getQueriesData<SocialStatsMap>({
        queryKey: ['social', 'stats'],
      });
      for (const [, data] of statsEntries) {
        if (data?.[targetId]) {
          return {
            isFollowing: !!data[targetId].isFollowing,
            isLiked: !!data[targetId].isLiked,
          };
        }
      }

      const trending =
        queryClient.getQueryData<any[]>(socialKeys.trending) ?? [];
      const t = trending.find((u) => u.id === targetId);
      if (t) {
        return { isFollowing: !!t.isFollowing, isLiked: !!t.isLiked };
      }

      const s = findInStudentsShape(
        queryClient.getQueryData(socialKeys.students),
        targetId,
      );
      if (s) {
        return { isFollowing: !!s.isFollowing, isLiked: !!s.isLiked };
      }

      for (const adapter of pageAdapters) {
        const data = queryClient.getQueryData(adapter.queryKey);
        const found = adapter.find
          ? adapter.find(data, targetId)
          : findInStudentsShape(data, targetId);
        if (found) {
          return {
            isFollowing: !!found.isFollowing,
            isLiked: !!found.isLiked,
          };
        }
      }

      return { isFollowing: false, isLiked: false };
    },
    [queryClient, pageAdapters],
  );

  const readCount = useCallback(
    (
      targetId: string,
      field: 'followersCount' | 'followingCount' | 'likesReceivedCount',
    ): number => {
      const statsEntries = queryClient.getQueriesData<SocialStatsMap>({
        queryKey: ['social', 'stats'],
      });
      for (const [, data] of statsEntries) {
        if (data?.[targetId] && typeof data[targetId][field] === 'number') {
          return data[targetId][field] as number;
        }
      }

      const trending =
        queryClient.getQueryData<any[]>(socialKeys.trending) ?? [];
      const t = trending.find((u) => u.id === targetId);
      if (t && typeof t[field] === 'number') return t[field];

      const s = findInStudentsShape(
        queryClient.getQueryData(socialKeys.students),
        targetId,
      );
      if (s && typeof s[field] === 'number') return s[field];

      for (const adapter of pageAdapters) {
        const found = adapter.find
          ? adapter.find(queryClient.getQueryData(adapter.queryKey), targetId)
          : findInStudentsShape(
              queryClient.getQueryData(adapter.queryKey),
              targetId,
            );
        if (found && typeof found[field] === 'number') return found[field];
      }
      return 0;
    },
    [queryClient, pageAdapters],
  );

  const takeSnapshot = useCallback(() => {
    const queries = queryClient.getQueryCache().getAll();
    return queries.map((q) => [q.queryKey, q.state.data] as const);
  }, [queryClient]);

  const restoreSnapshot = useCallback(
    (snap: ReadonlyArray<readonly [readonly unknown[], unknown]>) => {
      for (const [key, data] of snap) queryClient.setQueryData(key, data);
    },
    [queryClient],
  );

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: socialKeys.students,
      refetchType: 'none',
    });
    queryClient.invalidateQueries({
      queryKey: socialKeys.trending,
      refetchType: 'active',
    });
    queryClient.invalidateQueries({
      queryKey: ['social', 'stats'],
      refetchType: 'active',
    });
    if (currentUserId) {
      queryClient.invalidateQueries({
        queryKey: socialKeys.followers(currentUserId),
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: socialKeys.following(currentUserId),
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: socialKeys.likes(currentUserId),
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: socialKeys.userStats(currentUserId),
        refetchType: 'active',
      });
    }
  }, [queryClient, currentUserId]);

  const followMutation = useMutation({
    mutationFn: (targetId: string) =>
      socialFetch(socialEndpoints.follow(targetId), { method: 'POST' }),
    onMutate: async (targetId) => {
      await queryClient.cancelQueries();
      const snapshot = takeSnapshot();
      const before = readLiveState(targetId);
      if (!before.isFollowing) {
        patchAllCaches(targetId, { isFollowing: true });
        const nextFollowers = readCount(targetId, 'followersCount') + 1;
        patchAllCaches(targetId, { followersCount: nextFollowers });
        if (currentUserId) {
          const nextFollowing =
            readCount(currentUserId, 'followingCount') + 1;
          patchAllCaches(currentUserId, { followingCount: nextFollowing });
        }
      }
      return { snapshot };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.snapshot) restoreSnapshot(ctx.snapshot);
    },
    onSettled: () => invalidateAll(),
  });

  const unfollowMutation = useMutation({
    mutationFn: (targetId: string) =>
      socialFetch(socialEndpoints.follow(targetId), { method: 'DELETE' }),
    onMutate: async (targetId) => {
      await queryClient.cancelQueries();
      const snapshot = takeSnapshot();
      const before = readLiveState(targetId);
      if (before.isFollowing) {
        patchAllCaches(targetId, { isFollowing: false });
        const nextFollowers = Math.max(
          0,
          readCount(targetId, 'followersCount') - 1,
        );
        patchAllCaches(targetId, { followersCount: nextFollowers });
        if (currentUserId) {
          const nextFollowing = Math.max(
            0,
            readCount(currentUserId, 'followingCount') - 1,
          );
          patchAllCaches(currentUserId, { followingCount: nextFollowing });
        }
      }
      return { snapshot };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.snapshot) restoreSnapshot(ctx.snapshot);
    },
    onSettled: () => invalidateAll(),
  });

  const likeMutation = useMutation({
    mutationFn: ({
      targetId,
      isLiked,
    }: {
      targetId: string;
      isLiked: boolean;
    }) =>
      socialFetch(socialEndpoints.like(targetId), {
        method: isLiked ? 'DELETE' : 'POST',
      }),
    onMutate: async ({ targetId, isLiked }) => {
      await queryClient.cancelQueries();
      const snapshot = takeSnapshot();
      patchAllCaches(targetId, { isLiked: !isLiked });
      const nextLikes = Math.max(
        0,
        readCount(targetId, 'likesReceivedCount') + (isLiked ? -1 : 1),
      );
      patchAllCaches(targetId, { likesReceivedCount: nextLikes });
      return { snapshot };
    },
    onSuccess: (data: any, { targetId, isLiked }) => {
      const serverCount = data?.counts?.likesReceivedCount;
      if (typeof serverCount === 'number') {
        patchAllCaches(targetId, {
          isLiked: !isLiked,
          likesReceivedCount: serverCount,
        });
      }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.snapshot) restoreSnapshot(ctx.snapshot);
    },
    onSettled: () => invalidateAll(),
  });

  return useMemo(
    () => ({
      readLiveState,
      follow: (id: string) => enableFollow && followMutation.mutate(id),
      unfollow: (id: string) => enableFollow && unfollowMutation.mutate(id),
      toggleFollow: (id: string) => {
        if (!enableFollow) return;
        const { isFollowing } = readLiveState(id);
        if (isFollowing) unfollowMutation.mutate(id);
        else followMutation.mutate(id);
      },
      toggleLike: (id: string) => {
        if (!enableLike) return;
        const { isLiked } = readLiveState(id);
        likeMutation.mutate({ targetId: id, isLiked });
      },
      unlike: (id: string) => {
        if (!enableLike) return;
        likeMutation.mutate({ targetId: id, isLiked: true });
      },
      isFollowPending: followMutation.isPending,
      isUnfollowPending: unfollowMutation.isPending,
      isLikePending: likeMutation.isPending,
      followTarget: followMutation.variables,
      unfollowTarget: unfollowMutation.variables,
      likeTarget: likeMutation.variables?.targetId,
    }),
    [
      readLiveState,
      enableFollow,
      enableLike,
      followMutation,
      unfollowMutation,
      likeMutation,
    ],
  );
}