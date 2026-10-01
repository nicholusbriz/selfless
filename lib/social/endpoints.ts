// lib/social/endpoints.ts
// Single source of truth for social URLs.

export const socialEndpoints = {
  follow: (id: string) => `/api/social/follow/${id}`,
  like: (id: string) => `/api/social/like/${id}`,
  trending: (limit = 10) => `/api/social/trending?limit=${limit}`,
  connections: (id: string, type: 'followers' | 'following') =>
    `/api/social/connections/${id}?type=${type}`,
  likes: (id: string) => `/api/social/likes/${id}`,
  stats: (ids: string[]) =>
    `/api/social/stats?userIds=${encodeURIComponent(ids.join(','))}`,
} as const;

export async function socialFetch<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Request failed: ${res.status}`);
  }
  return res.json();
}