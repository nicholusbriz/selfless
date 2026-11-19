'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface BatchCommentAuthor {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
}

interface BatchComment {
  id: string;
  parentId: string | null;
  content: string;
  createdAt: string;
  author: BatchCommentAuthor;
}

interface BatchInteractionsItem {
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isSaved: boolean;
  comments?: BatchComment[];
}

// Fetches like/comment/save counts for many posts in ONE request and seeds
// the per-post react-query cache so MediaPostInteractions never hits the
// network for these ids (until staleTime expires).
export function useMediaInteractionsPrefetch(mediaIds: string[]) {
  const queryClient = useQueryClient();
  const idsKey = mediaIds.slice(0, 50).join(',');

  useEffect(() => {
    if (!idsKey) return;
    const ids = idsKey.split(',');

    // Only fetch ids not already cached
    const missing = ids.filter(
      (id) => !queryClient.getQueryData(['media-interactions', id]),
    );
    if (missing.length === 0) return;

    let cancelled = false;
    fetch(`/api/media/interactions?ids=${missing.join(',')}`)
      .then((res) => res.json())
      .then((data: unknown) => {
        const payload = data as {
          success?: boolean;
          items?: Record<string, BatchInteractionsItem>;
        };
        if (cancelled || !payload?.success || !payload.items) return;
        for (const [id, value] of Object.entries(payload.items)) {
          const { comments, ...interactions } = value;
          queryClient.setQueryData(['media-interactions', id], interactions);
          // Only cache comments when we have ALL of them (post has <=10 comments);
          // otherwise let the per-post endpoint fetch the full thread on open.
          if (
            Array.isArray(comments) &&
            comments.length > 0 &&
            comments.length >= value.commentCount
          ) {
            queryClient.setQueryData(['media-comments', id], comments);
          }
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, queryClient]);
}
