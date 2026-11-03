'use client';

import { useMemo, useState, type ReactNode } from 'react';
import Image from 'next/image';
import {
  AlertCircle,
  Bookmark,
  Heart,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Reply,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getApiErrorMessage, isJsonObject } from '@/lib/api-response';
import { MAX_MEDIA_COMMENT_LENGTH } from '@/lib/media-comments';

interface MediaInteractions {
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isSaved: boolean;
}

interface MediaComment {
  id: string;
  parentId: string | null;
  content: string;
  createdAt: string;
  pending?: boolean;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
  };
}

const EMPTY_MEDIA_COMMENTS: MediaComment[] = [];

function isMediaInteractions(value: unknown): value is MediaInteractions {
  return (
    isJsonObject(value) &&
    typeof value.likeCount === 'number' &&
    typeof value.commentCount === 'number' &&
    typeof value.isLiked === 'boolean' &&
    typeof value.isSaved === 'boolean'
  );
}

function isMediaComment(value: unknown): value is MediaComment {
  if (
    !isJsonObject(value) ||
    typeof value.id !== 'string' ||
    (value.parentId !== null && typeof value.parentId !== 'string') ||
    typeof value.content !== 'string' ||
    typeof value.createdAt !== 'string' ||
    !isJsonObject(value.author)
  ) {
    return false;
  }

  return (
    typeof value.author.id === 'string' &&
    typeof value.author.firstName === 'string' &&
    typeof value.author.lastName === 'string' &&
    (typeof value.author.profileImageUrl === 'string' ||
      value.author.profileImageUrl === null)
  );
}

export default function MediaPostInteractions({
  mediaId,
  currentUser,
}: {
  mediaId: string;
  currentUser: MediaComment['author'];
}) {
  const queryClient = useQueryClient();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<MediaComment | null>(null);
  const [openCommentMenuId, setOpenCommentMenuId] = useState<string | null>(null);

  const interactionsQuery = useQuery<MediaInteractions>({
    queryKey: ['media-interactions', mediaId],
    queryFn: async () => {
      const response = await fetch(`/api/media/${mediaId}/interactions`);
      const result: unknown = await response.json();
      if (!response.ok || !isJsonObject(result) || !isMediaInteractions(result)) {
        throw new Error(getApiErrorMessage(result, 'Could not load post interactions'));
      }
      return result;
    },
    staleTime: 30 * 1000,
  });

  const commentsQuery = useQuery<MediaComment[]>({
    queryKey: ['media-comments', mediaId],
    queryFn: async () => {
      const response = await fetch(`/api/media/${mediaId}/comments`);
      const result: unknown = await response.json();
      const responseComments = isJsonObject(result) ? result.comments : null;
      if (
        !response.ok ||
        !Array.isArray(responseComments) ||
        !responseComments.every(isMediaComment)
      ) {
        throw new Error(getApiErrorMessage(result, 'Could not load comments'));
      }
      return responseComments;
    },
    enabled: commentsOpen,
  });

  const likeMutation = useMutation({
    mutationFn: async (liked: boolean) => {
      const response = await fetch(`/api/media/${mediaId}/likes`, {
        method: liked ? 'PUT' : 'DELETE',
      });
      const result: unknown = await response.json();
      if (
        !response.ok ||
        !isJsonObject(result) ||
        typeof result.likeCount !== 'number' ||
        typeof result.isLiked !== 'boolean'
      ) {
        throw new Error(getApiErrorMessage(result, 'Could not update like'));
      }
      return {
        likeCount: result.likeCount,
        isLiked: result.isLiked,
      };
    },
    onMutate: async (liked) => {
      const queryKey = ['media-interactions', mediaId];
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<MediaInteractions>(queryKey);
      if (previous) {
        queryClient.setQueryData<MediaInteractions>(queryKey, {
          ...previous,
          isLiked: liked,
          likeCount: Math.max(0, previous.likeCount + (liked ? 1 : -1)),
        });
      }
      return { previous };
    },
    onError: (_error, _liked, context) => {
      if (context?.previous) {
        queryClient.setQueryData<MediaInteractions>(
          ['media-interactions', mediaId],
          (current) =>
            current
              ? {
                  ...current,
                  isLiked: context.previous?.isLiked ?? current.isLiked,
                  likeCount: context.previous?.likeCount ?? current.likeCount,
                }
              : context.previous,
        );
      }
    },
    onSuccess: (result) => {
      queryClient.setQueryData<MediaInteractions>(
        ['media-interactions', mediaId],
        (previous) => previous ? { ...previous, ...result } : previous,
      );
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['media-interactions', mediaId] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (saved: boolean) => {
      const response = await fetch(`/api/media/${mediaId}/saves`, {
        method: saved ? 'PUT' : 'DELETE',
      });
      const result: unknown = await response.json();
      if (
        !response.ok ||
        !isJsonObject(result) ||
        typeof result.isSaved !== 'boolean'
      ) {
        throw new Error(getApiErrorMessage(result, 'Could not save post'));
      }
      return result.isSaved;
    },
    onMutate: async (saved) => {
      const queryKey = ['media-interactions', mediaId];
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<MediaInteractions>(queryKey);
      if (previous) {
        queryClient.setQueryData<MediaInteractions>(queryKey, {
          ...previous,
          isSaved: saved,
        });
      }
      return { previous };
    },
    onError: (_error, _saved, context) => {
      if (context?.previous) {
        queryClient.setQueryData<MediaInteractions>(
          ['media-interactions', mediaId],
          (current) =>
            current
              ? { ...current, isSaved: context.previous?.isSaved ?? current.isSaved }
              : context.previous,
        );
      }
    },
    onSuccess: (isSaved) => {
      queryClient.setQueryData<MediaInteractions>(
        ['media-interactions', mediaId],
        (previous) => previous ? { ...previous, isSaved } : previous,
      );
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['media-interactions', mediaId] });
      void queryClient.invalidateQueries({ queryKey: ['gallery-saved-posts'] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (variables: {
      content: string;
      parentId: string | null;
      optimisticId: string;
    }) => {
      const response = await fetch(`/api/media/${mediaId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: variables.content,
          parentId: variables.parentId,
        }),
      });
      const result: unknown = await response.json();
      if (!response.ok || !isJsonObject(result) || !isMediaComment(result.comment)) {
        throw new Error(getApiErrorMessage(result, 'Could not post comment'));
      }
      return { comment: result.comment, optimisticId: variables.optimisticId };
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['media-comments', mediaId] });
      await queryClient.cancelQueries({ queryKey: ['media-interactions', mediaId] });
      const optimisticComment: MediaComment = {
        id: variables.optimisticId,
        parentId: variables.parentId,
        content: variables.content,
        createdAt: new Date().toISOString(),
        pending: true,
        author: currentUser,
      };
      queryClient.setQueryData<MediaComment[]>(
        ['media-comments', mediaId],
        (previous = []) => [...previous, optimisticComment],
      );
      queryClient.setQueryData<MediaInteractions>(
        ['media-interactions', mediaId],
        (previous) =>
          previous
            ? { ...previous, commentCount: previous.commentCount + 1 }
            : previous,
      );
      setContent('');
      return { optimisticId: variables.optimisticId };
    },
    onError: (_error, _variables, context) => {
      if (context) {
        queryClient.setQueryData<MediaComment[]>(
          ['media-comments', mediaId],
          (previous = []) => previous.filter((comment) => comment.id !== context.optimisticId),
        );
        queryClient.setQueryData<MediaInteractions>(
          ['media-interactions', mediaId],
          (previous) =>
            previous
              ? { ...previous, commentCount: Math.max(0, previous.commentCount - 1) }
              : previous,
        );
        setContent(_variables.content);
      }
    },
    onSuccess: ({ comment, optimisticId }) => {
      queryClient.setQueryData<MediaComment[]>(
        ['media-comments', mediaId],
        (previous = []) => {
          const optimisticIndex = previous.findIndex((item) => item.id === optimisticId);
          if (optimisticIndex === -1) return [...previous, comment];
          return previous.map((item) => item.id === optimisticId ? comment : item);
        },
      );
      setReplyingTo(null);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['media-comments', mediaId] });
      void queryClient.invalidateQueries({ queryKey: ['media-interactions', mediaId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const response = await fetch(
        `/api/media/${mediaId}/comments/${commentId}`,
        { method: 'DELETE' },
      );
      const result: unknown = await response.json();
      const deletedIds = isJsonObject(result) ? result.deletedIds : null;
      if (
        !response.ok ||
        !Array.isArray(deletedIds) ||
        !deletedIds.every((id) => typeof id === 'string')
      ) {
        throw new Error(getApiErrorMessage(result, 'Could not delete comment'));
      }
      return deletedIds.filter((id): id is string => typeof id === 'string');
    },
    onSuccess: (deletedIds) => {
      const deleted = new Set(deletedIds);
      queryClient.setQueryData<MediaComment[]>(
        ['media-comments', mediaId],
        (previous = []) => previous.filter((comment) => !deleted.has(comment.id)),
      );
      queryClient.setQueryData<MediaInteractions>(
        ['media-interactions', mediaId],
        (previous) =>
          previous
            ? {
                ...previous,
                commentCount: Math.max(0, previous.commentCount - deletedIds.length),
              }
            : previous,
      );
      if (replyingTo && deleted.has(replyingTo.id)) setReplyingTo(null);
    },
  });

  const comments = commentsQuery.data ?? EMPTY_MEDIA_COMMENTS;
  const commentIsOverLimit = content.length > MAX_MEDIA_COMMENT_LENGTH;
  const commentsByParent = useMemo(() => {
    const grouped = new Map<string | null, MediaComment[]>();
    for (const comment of comments) {
      const siblings = grouped.get(comment.parentId) ?? [];
      siblings.push(comment);
      grouped.set(comment.parentId, siblings);
    }
    return grouped;
  }, [comments]);

  const renderComment = (comment: MediaComment, depth = 0): ReactNode => (
    <div
      key={comment.id}
      className="border-l border-[#E8EBF0] pl-3"
      style={{ marginLeft: `${Math.min(depth * 16, 64)}px` }}
    >
      <div className="flex items-start gap-2.5">
        {comment.author.profileImageUrl ? (
          <Image
            src={comment.author.profileImageUrl}
            alt=""
            width={30}
            height={30}
            unoptimized
            className="h-7 w-7 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E8ECF3] text-[10px] font-semibold text-[#1A2B4C]">
            {comment.author.firstName[0]}{comment.author.lastName[0]}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="min-w-0 truncate text-xs font-semibold text-[#172033]">
              {comment.author.firstName} {comment.author.lastName}
              <span className="ml-2 font-normal text-[#9AA3B1]">
                {new Date(comment.createdAt).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
            </p>
            {comment.author.id === currentUser.id && !comment.pending && (
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setOpenCommentMenuId((openId) =>
                      openId === comment.id ? null : comment.id,
                    )
                  }
                  aria-label="Comment options"
                  aria-haspopup="menu"
                  aria-expanded={openCommentMenuId === comment.id}
                  className="rounded p-1 text-[#9AA3B1] transition hover:bg-[#EEF0F4] hover:text-[#526078]"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {openCommentMenuId === comment.id && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-10 mt-1 min-w-36 rounded-lg border border-[#E1E5EB] bg-white p-1 shadow-lg"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setOpenCommentMenuId(null);
                        deleteMutation.mutate(comment.id);
                      }}
                      disabled={deleteMutation.isPending}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete comment
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <p className={`mt-1 whitespace-pre-wrap break-words text-sm leading-5 text-[#526078] ${comment.pending ? 'opacity-70' : ''}`}>
            {comment.content}
            {comment.pending && (
              <span className="ml-2 text-xs text-[#8A93A2]">Sending...</span>
            )}
          </p>
          <button
            type="button"
            onClick={() => {
              setReplyingTo(comment);
              setCommentsOpen(true);
            }}
            className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-[#526078] hover:text-[#1A2B4C]"
          >
            <Reply className="h-3 w-3" />
            Reply
          </button>
        </div>
      </div>
      <div className="mt-3 space-y-3">
        {(commentsByParent.get(comment.id) ?? []).map((reply) =>
          renderComment(reply, depth + 1),
        )}
      </div>
    </div>
  );

  const interactions = interactionsQuery.data;

  return (
    <div className="border-t border-[#EEF0F4]">
      <div className="flex items-center gap-5 px-5 py-3">
        <button
          type="button"
          onClick={() => likeMutation.mutate(!interactions?.isLiked)}
          disabled={!interactions || likeMutation.isPending}
          aria-pressed={interactions?.isLiked ?? false}
          className={`inline-flex items-center gap-2 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60 ${
            interactions?.isLiked ? 'text-rose-600' : 'text-[#687386] hover:text-rose-600'
          }`}
        >
          {likeMutation.isPending ? (
            <Loader2 className="h-[18px] w-[18px] animate-spin" />
          ) : (
            <Heart className={`h-[18px] w-[18px] ${interactions?.isLiked ? 'fill-current' : ''}`} />
          )}
          {interactions?.likeCount ?? '—'}
          <span className="sr-only">likes</span>
        </button>
        <button
          type="button"
          onClick={() => setCommentsOpen((open) => !open)}
          aria-expanded={commentsOpen}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#687386] transition hover:text-[#1A2B4C]"
        >
          <MessageCircle className="h-[18px] w-[18px]" />
          {interactions?.commentCount ?? (commentsOpen ? comments.length : '—')}
          <span>Comments</span>
        </button>
        <button
          type="button"
          onClick={() => saveMutation.mutate(!interactions?.isSaved)}
          disabled={!interactions || saveMutation.isPending}
          aria-pressed={interactions?.isSaved ?? false}
          className={`ml-auto inline-flex items-center gap-2 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60 ${
            interactions?.isSaved
              ? 'text-[#1A2B4C]'
              : 'text-[#687386] hover:text-[#1A2B4C]'
          }`}
        >
          {saveMutation.isPending ? (
            <Loader2 className="h-[18px] w-[18px] animate-spin" />
          ) : (
            <Bookmark className={`h-[18px] w-[18px] ${interactions?.isSaved ? 'fill-current' : ''}`} />
          )}
          {interactions?.isSaved ? 'Saved' : 'Save'}
        </button>
      </div>

      {(interactionsQuery.error || likeMutation.error || saveMutation.error || deleteMutation.error) && (
        <p className="mx-5 mb-3 flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {interactionsQuery.error?.message ??
            likeMutation.error?.message ??
            saveMutation.error?.message ??
            deleteMutation.error?.message}
        </p>
      )}

      {commentsOpen && (
        <div className="space-y-4 border-t border-[#EEF0F4] bg-[#FAFBFC] px-5 py-4">
          {commentsQuery.isLoading ? (
            <div className="flex items-center gap-2 py-2 text-xs text-[#687386]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading comments...
            </div>
          ) : comments.length ? (
            <div className="max-h-[420px] space-y-4 overflow-y-auto">
              {(commentsByParent.get(null) ?? []).map((comment) => renderComment(comment))}
            </div>
          ) : commentsQuery.error ? (
            <p className="text-xs text-red-600">{commentsQuery.error.message}</p>
          ) : (
            <p className="text-xs text-[#8A93A2]">Be the first to comment.</p>
          )}
          {commentsQuery.error && comments.length > 0 && (
            <p className="text-xs text-red-600">{commentsQuery.error.message}</p>
          )}

          {commentMutation.error && (
            <p className="text-xs text-red-600">{commentMutation.error.message}</p>
          )}

          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (
                content.trim() &&
                !commentIsOverLimit &&
                !commentMutation.isPending
              ) {
                commentMutation.mutate({
                  content: content.trim(),
                  parentId: replyingTo?.id ?? null,
                  optimisticId: `pending-${crypto.randomUUID()}`,
                });
              }
            }}
            className="space-y-2"
          >
            {replyingTo && (
              <div className="flex items-center justify-between text-xs text-[#687386]">
                <span>Replying to {replyingTo.author.firstName}</span>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  aria-label="Cancel reply"
                  className="rounded p-1 hover:bg-[#EEF0F4]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <div className="flex items-end gap-2">
              <label className="sr-only" htmlFor={`media-comment-${mediaId}`}>
                {replyingTo ? 'Write a reply' : 'Write a comment'}
              </label>
              <textarea
                id={`media-comment-${mediaId}`}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                disabled={commentMutation.isPending}
                maxLength={MAX_MEDIA_COMMENT_LENGTH}
                rows={1}
                placeholder={replyingTo ? 'Write a reply...' : 'Add a comment...'}
                aria-describedby={`media-comment-count-${mediaId}`}
                className="max-h-28 min-h-10 flex-1 resize-y rounded-xl border border-[#E1E5EB] bg-white px-3 py-2.5 text-sm text-[#172033] outline-none transition placeholder:text-[#9AA3B1] focus:border-[#A9B6C8] focus:ring-2 focus:ring-[#1A2B4C]/10"
              />
              <button
                type="submit"
                disabled={!content.trim() || commentIsOverLimit || commentMutation.isPending}
                aria-label={replyingTo ? 'Send reply' : 'Send comment'}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1A2B4C] text-white transition hover:bg-[#263D66] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {commentMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
            <p
              id={`media-comment-count-${mediaId}`}
              aria-live="polite"
              className={`text-right text-xs ${
                commentIsOverLimit ? 'text-red-600' : 'text-[#8A93A2]'
              }`}
            >
              {content.length}/{MAX_MEDIA_COMMENT_LENGTH}
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
