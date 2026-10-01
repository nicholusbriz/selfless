// ============================================================
//  setup-social.js
//  Creates lib/social/*, lib/hooks/*, components/social/*
//  with full production code.
//  Backs up app/dashboard/students/page.tsx and connections/page.tsx
//  Run from C:\selfless\my-app\  with:  node setup-social.js
// ============================================================

const fs = require('fs');
const path = require('path');

const root = process.cwd();

// ---------- helpers ----------
function ensureDir(dir) {
  const full = path.join(root, dir);
  if (!fs.existsSync(full)) {
    fs.mkdirSync(full, { recursive: true });
    console.log(`  created folder ${dir}`);
  }
}

function writeFile(file, content) {
  const full = path.join(root, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log(`  wrote ${file}`);
}

function backupFile(file) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) {
    console.log(`  WARN: ${file} not found, skipping backup`);
    return;
  }
  const bak = `${full}.bak`;
  fs.copyFileSync(full, bak);
  console.log(`  backed up ${file} -> ${file}.bak`);
}

console.log(`=== Social setup starting in ${root} ===`);
console.log('');

// ---------- folders ----------
console.log('Creating folders...');
ensureDir('lib/social');
ensureDir('lib/hooks');
ensureDir('components/social');
console.log('');

// ============================================================
//  BATCH 1 — lib/social/*
// ============================================================
console.log('Writing lib/social/* ...');

writeFile('lib/social/types.ts', `// lib/social/types.ts
// Pure types. No React, no imports.

export interface UserSocialState {
  isFollowing?: boolean;
  isLiked?: boolean;
  followersCount?: number;
  followingCount?: number;
  likesReceivedCount?: number;
}

export type SocialPatch = Partial<{
  isFollowing: boolean;
  isLiked: boolean;
  followersCount: number;
  followingCount: number;
  likesReceivedCount: number;
}>;

export interface Rankable {
  id: string;
  followersCount: number;
  likesReceivedCount: number;
  firstName?: string;
  lastName?: string;
}
`);

writeFile('lib/social/endpoints.ts', `// lib/social/endpoints.ts
// Single source of truth for social URLs.

export const socialEndpoints = {
  follow: (id: string) => \`/api/social/follow/\${id}\`,
  like: (id: string) => \`/api/social/like/\${id}\`,
  trending: (limit = 10) => \`/api/social/trending?limit=\${limit}\`,
  connections: (id: string, type: 'followers' | 'following') =>
    \`/api/social/connections/\${id}?type=\${type}\`,
  likes: (id: string) => \`/api/social/likes/\${id}\`,
} as const;

export async function socialFetch<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || \`Request failed: \${res.status}\`);
  }
  return res.json();
}
`);

writeFile('lib/social/cacheKeys.ts', `// lib/social/cacheKeys.ts
// Canonical cache keys + adapter contract for page-specific shapes.

import type { SocialPatch } from '@/lib/social/types';

export const socialKeys = {
  students: ['students'] as const,
  trending: ['social', 'trending'] as const,
  followers: (userId?: string) => ['connections', 'followers', userId] as const,
  following: (userId?: string) => ['connections', 'following', userId] as const,
  likes: (userId?: string) => ['connections', 'likes', userId] as const,
  userStats: (userId?: string) => ['currentUserStats', userId] as const,
} as const;

export interface PageCacheAdapter {
  queryKey: readonly unknown[];
  patch: (old: unknown, targetId: string, patch: SocialPatch) => unknown;
  find?: (old: unknown, targetId: string) => any | undefined;
}
`);

writeFile('lib/social/patchHelpers.ts', `// lib/social/patchHelpers.ts
// Pure functions that patch any shape containing students/connections/likes.

import type { SocialPatch } from '@/lib/social/types';

export function patchStudentsShape(
  old: unknown,
  targetId: string,
  patch: SocialPatch,
): unknown {
  if (Array.isArray(old)) {
    return old.map((s: any) => (s.id === targetId ? { ...s, ...patch } : s));
  }
  if (!old || typeof old !== 'object') return old;

  const data = old as any;
  if (Array.isArray(data.students)) {
    return {
      ...data,
      students: data.students.map((s: any) =>
        s.id === targetId ? { ...s, ...patch } : s,
      ),
    };
  }
  if (data.studentsByTechCenter) {
    return {
      ...data,
      studentsByTechCenter: Object.fromEntries(
        Object.entries(data.studentsByTechCenter).map(
          ([key, list]: [string, any]) => [
            key,
            list.map((s: any) => (s.id === targetId ? { ...s, ...patch } : s)),
          ],
        ),
      ),
    };
  }
  return old;
}

export function findInStudentsShape(
  old: unknown,
  targetId: string,
): any | undefined {
  if (Array.isArray(old)) return old.find((s: any) => s.id === targetId);
  if (!old || typeof old !== 'object') return undefined;
  const data = old as any;
  const list =
    data.students ?? Object.values(data.studentsByTechCenter ?? {}).flat();
  return (list as any[]).find((s) => s.id === targetId);
}

export function patchConnectionList(
  old: unknown,
  targetId: string,
  patch: SocialPatch,
): unknown {
  if (!Array.isArray(old)) return old;
  return old.map((u: any) => (u.id === targetId ? { ...u, ...patch } : u));
}

export function patchLikesShape(
  old: unknown,
  targetId: string,
  patch: SocialPatch,
): unknown {
  if (!old || typeof old !== 'object') return old;
  const data = old as any;
  return {
    likers: Array.isArray(data.likers)
      ? data.likers.map((u: any) => (u.id === targetId ? { ...u, ...patch } : u))
      : data.likers,
    likedUsers: Array.isArray(data.likedUsers)
      ? data.likedUsers.map((u: any) =>
          u.id === targetId ? { ...u, ...patch } : u,
        )
      : data.likedUsers,
  };
}
`);

writeFile('lib/social/ranking.ts', `// lib/social/ranking.ts
// Followers-first, likes as tie-breaker, name for stability.

import type { Rankable } from '@/lib/social/types';

export function compareFollowersThenLikes(a: Rankable, b: Rankable): number {
  const af = a.followersCount || 0;
  const bf = b.followersCount || 0;
  if (bf !== af) return bf - af;

  const al = Math.max(0, a.likesReceivedCount || 0);
  const bl = Math.max(0, b.likesReceivedCount || 0);
  if (bl !== al) return bl - al;

  const nameA = \`\${a.firstName ?? ''} \${a.lastName ?? ''}\`.trim().toLowerCase();
  const nameB = \`\${b.firstName ?? ''} \${b.lastName ?? ''}\`.trim().toLowerCase();
  return nameA.localeCompare(nameB);
}

export function rankByTrending<T extends Rankable>(list: T[]): T[] {
  return [...list].sort(compareFollowersThenLikes);
}
`);

writeFile('lib/social/constants.ts', `// lib/social/constants.ts
// Shared tech-center hue map.

export const TECH_CENTER_HUES: Record<string, string> = {
  'Freedom City Tech Center': '#55705B',
  'Kampala Central': '#3E5C76',
  'Gulu Hub': '#7C3AED',
  'Mbarara Tech': '#B98A3E',
  'Jinja Center': '#A4462F',
};

export function getTechCenterHue(name?: string): string {
  if (!name) return '#9CA3AF';
  if (TECH_CENTER_HUES[name]) return TECH_CENTER_HUES[name];

  const palette = ['#55705B', '#3E5C76', '#7C3AED', '#B98A3E', '#A4462F', '#0F766E'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}
`);

// ============================================================
//  BATCH 2 — hook + components
// ============================================================
console.log('');
console.log('Writing lib/hooks/useSocialActions.ts ...');

writeFile('lib/hooks/useSocialActions.ts', `'use client';

import { useCallback, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { socialEndpoints, socialFetch } from '@/lib/social/endpoints';
import { socialKeys } from '@/lib/social/cacheKeys';
import type { PageCacheAdapter } from '@/lib/social/cacheKeys';
import type { SocialPatch } from '@/lib/social/types';
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

  const takeSnapshot = useCallback(() => {
    const keys: readonly unknown[][] = [
      socialKeys.students as unknown as unknown[],
      socialKeys.trending as unknown as unknown[],
      ...(currentUserId
        ? [
            socialKeys.followers(currentUserId) as unknown as unknown[],
            socialKeys.following(currentUserId) as unknown as unknown[],
            socialKeys.likes(currentUserId) as unknown as unknown[],
            socialKeys.userStats(currentUserId) as unknown as unknown[],
          ]
        : []),
      ...pageAdapters.map((a) => a.queryKey as unknown as unknown[]),
    ];
    return keys.map(
      (key) => [key, queryClient.getQueryData(key)] as const,
    );
  }, [queryClient, currentUserId, pageAdapters]);

  const restoreSnapshot = useCallback(
    (snap: ReadonlyArray<readonly [readonly unknown[], unknown]>) => {
      for (const [key, data] of snap) queryClient.setQueryData(key, data);
    },
    [queryClient],
  );

  const readCount = useCallback(
    (
      targetId: string,
      field: 'followersCount' | 'followingCount' | 'likesReceivedCount',
    ): number => {
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

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: socialKeys.students,
      refetchType: 'none',
    });
    queryClient.invalidateQueries({
      queryKey: socialKeys.trending,
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
          const nextFollowing = readCount(currentUserId, 'followingCount') + 1;
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
`);

console.log('Writing components/social/* ...');

writeFile('components/social/SocialActions.tsx', `'use client';

import { Heart, UserPlus, Check, Loader2, Eye } from 'lucide-react';
import { useSocialActions } from '@/lib/hooks/useSocialActions';
import type { PageCacheAdapter } from '@/lib/social/cacheKeys';

type Size = 'xs' | 'sm' | 'md';
type Variant = 'full' | 'compact' | 'featured';

interface SocialActionsProps {
  userId: string;
  currentUserId?: string;
  size?: Size;
  variant?: Variant;
  onViewProfile?: () => void;
  pageAdapters?: PageCacheAdapter[];
  className?: string;
}

const baseBtn =
  'inline-flex items-center justify-center gap-1 font-semibold transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B98A3E] focus-visible:ring-offset-1';

const sizeClasses: Record<Size, string> = {
  xs: 'px-1.5 py-0.5 text-[10px] rounded',
  sm: 'px-2.5 py-1 text-[11px] rounded-full',
  md: 'px-3.5 py-1.5 text-[13px] rounded-full',
};

const iconSize: Record<Size, string> = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
};

const likeIdleOutlined =
  'border border-[#E5E7EB] bg-white text-[#1A2B4C] hover:border-red-300 hover:bg-red-50 hover:text-red-600';
const likeIdleFeatured =
  'border border-[#E5E7EB] bg-white/90 text-[#1A2B4C] backdrop-blur-sm hover:border-red-300 hover:bg-red-50 hover:text-red-600';
const likeActive = 'border border-red-200 bg-red-50 text-red-600';
const followIdle = 'bg-[#1A2B4C] text-white hover:bg-[#2C3E5A] hover:shadow-md';
const followActive = 'border border-[#55705B] bg-[#55705B] text-white';

export function SocialActions({
  userId,
  currentUserId,
  size = 'sm',
  variant = 'full',
  onViewProfile,
  pageAdapters,
  className,
}: SocialActionsProps) {
  const social = useSocialActions({ pageAdapters });
  const { isFollowing, isLiked } = social.readLiveState(userId);
  const isSelf = currentUserId === userId;

  const followPending = social.isFollowPending && social.followTarget === userId;
  const unfollowPending = social.isUnfollowPending && social.unfollowTarget === userId;
  const likePending = social.isLikePending && social.likeTarget === userId;
  const followLoading = followPending || unfollowPending;

  const iconCls = iconSize[size];
  const szCls = sizeClasses[size];
  const isFeatured = variant === 'featured';
  const wrap = \`flex flex-wrap items-center gap-1.5 \${className ?? ''}\`;

  if (isSelf) {
    return (
      <div className={wrap}>
        <span
          className={\`\${baseBtn} \${szCls} border border-[#E5E7EB] bg-white/60 text-[#9CA3AF] cursor-not-allowed\`}
          aria-disabled="true"
          title="You cannot like your own profile"
        >
          <Heart className={iconCls} strokeWidth={2} />
          Like
        </span>
        <span
          className={\`\${baseBtn} \${szCls} border border-[#E5E7EB] bg-white/60 text-[#9CA3AF] cursor-not-allowed\`}
          aria-disabled="true"
          title="You cannot follow yourself"
        >
          <UserPlus className={iconCls} strokeWidth={2} />
          Follow
        </span>
        <span
          className={\`\${baseBtn} \${szCls} border border-[#B98A3E]/40 bg-[#B98A3E]/10 text-[#8A6A2E]\`}
        >
          This is you
        </span>
        {onViewProfile && (
          <button
            type="button"
            onClick={onViewProfile}
            className={\`\${baseBtn} \${szCls} border border-transparent text-[#4B5646] hover:border-[#E5E7EB] hover:bg-white/70\`}
          >
            View
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={wrap}>
      {isLiked ? (
        <span className={\`\${baseBtn} \${szCls} \${likeActive}\`}>
          <Heart className={\`\${iconCls} fill-red-500 text-red-500\`} strokeWidth={2} />
          Liked
        </span>
      ) : (
        <button
          type="button"
          disabled={likePending}
          onClick={() => social.toggleLike(userId)}
          className={\`\${baseBtn} \${szCls} \${
            isFeatured ? likeIdleFeatured : likeIdleOutlined
          }\`}
          aria-label="Like this profile"
          title="Like"
        >
          {likePending ? (
            <Loader2 className={\`\${iconCls} animate-spin\`} strokeWidth={2} />
          ) : (
            <Heart className={iconCls} strokeWidth={2} />
          )}
          Like
        </button>
      )}

      {isFollowing ? (
        <button
          type="button"
          disabled={unfollowPending}
          onClick={() => social.unfollow(userId)}
          className={\`\${baseBtn} \${szCls} \${followActive}\`}
          aria-label="Unfollow this user"
          title="Unfollow"
        >
          {unfollowPending ? (
            <Loader2 className={\`\${iconCls} animate-spin\`} strokeWidth={2.5} />
          ) : (
            <Check className={iconCls} strokeWidth={2.5} />
          )}
          Following
        </button>
      ) : (
        <button
          type="button"
          disabled={followLoading}
          onClick={() => social.follow(userId)}
          className={\`\${baseBtn} \${szCls} \${followIdle}\`}
          aria-label="Follow this user"
          title="Follow"
        >
          {followLoading ? (
            <Loader2 className={\`\${iconCls} animate-spin\`} strokeWidth={2} />
          ) : (
            <UserPlus className={iconCls} strokeWidth={2} />
          )}
          Follow
        </button>
      )}

      {onViewProfile && (
        <button
          type="button"
          onClick={onViewProfile}
          className={\`\${baseBtn} \${szCls} border border-transparent text-[#4B5646] hover:border-[#E5E7EB] hover:bg-white/70\`}
        >
          {variant === 'featured' ? (
            'View'
          ) : (
            <>
              <Eye className={iconCls} strokeWidth={2} />
              View
            </>
          )}
        </button>
      )}
    </div>
  );
}
`);

writeFile('components/social/UnfollowButton.tsx', `'use client';

import { Loader2 } from 'lucide-react';
import { useSocialActions } from '@/lib/hooks/useSocialActions';

export function UnfollowButton({
  userId,
  className,
}: {
  userId: string;
  className?: string;
}) {
  const social = useSocialActions();
  const loading =
    social.isUnfollowPending && social.unfollowTarget === userId;

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => social.unfollow(userId)}
      className={\`inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-[#A4462F] transition-all hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 \${className ?? ''}\`}
    >
      {loading && <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2} />}
      {loading ? 'Unfollowing…' : 'Unfollow'}
    </button>
  );
}
`);

writeFile('components/social/UnlikeButton.tsx', `'use client';

import { Loader2 } from 'lucide-react';
import { useSocialActions } from '@/lib/hooks/useSocialActions';

export function UnlikeButton({
  userId,
  className,
}: {
  userId: string;
  className?: string;
}) {
  const social = useSocialActions();
  const loading = social.isLikePending && social.likeTarget === userId;

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => social.unlike(userId)}
      className={\`inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-[#A4462F] transition-all hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 \${className ?? ''}\`}
    >
      {loading && <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2} />}
      {loading ? 'Unliking…' : 'Unlike'}
    </button>
  );
}
`);

writeFile('components/social/index.ts', `export { SocialActions } from '@/components/social/SocialActions';
export { UnfollowButton } from '@/components/social/UnfollowButton';
export { UnlikeButton } from '@/components/social/UnlikeButton';
`);

// ============================================================
//  BACKUP PAGES
// ============================================================
console.log('');
console.log('Backing up existing pages...');
backupFile('app/dashboard/students/page.tsx');
backupFile('app/dashboard/connections/page.tsx');

// ============================================================
//  SUMMARY
// ============================================================
console.log('');
console.log('=== Summary ===');
console.log('');

const listDir = (dir) => {
  const full = path.join(root, dir);
  if (!fs.existsSync(full)) return;
  console.log(`${dir}:`);
  for (const name of fs.readdirSync(full)) {
    const stat = fs.statSync(path.join(full, name));
    if (stat.isFile()) {
      const size = fs.statSync(path.join(full, name)).size;
      console.log(`  ${name}  (${size} bytes)`);
    }
  }
  console.log('');
};

listDir('lib/social');
listDir('lib/hooks');
listDir('components/social');

console.log('=== Done ===');
console.log('');
console.log('Next steps:');
console.log('  1. Run:  npx tsc --noEmit');
console.log('  2. Patch app/dashboard/students/page.tsx (backup at .bak)');
console.log('  3. Patch app/dashboard/connections/page.tsx (backup at .bak)');
console.log('');