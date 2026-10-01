// lib/social/patchHelpers.ts
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
