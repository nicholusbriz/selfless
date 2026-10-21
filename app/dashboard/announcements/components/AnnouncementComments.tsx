'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { MessageCircle, MoreVertical, Reply, Send, Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface CommentAuthor {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  role?: { name: string; displayName: string } | null;
  techCenter?: { name: string } | null;
}

function getRoleLabel(role?: { name: string; displayName: string } | null): string {
  if (!role) return 'Member';
  switch (role.name) {
    case 'admin': return 'Manager';
    case 'super_admin': return 'Director';
    case 'teacher': return 'Tutor';
    case 'dev': return 'Selfless Support';
    default: return role.displayName || 'Member';
  }
}

interface AnnouncementComment {
  id: string;
  parentId: string | null;
  content: string;
  createdAt: string;
  author: CommentAuthor;
}

interface AnnouncementCommentsProps {
  announcementId: string;
  currentUserId?: string | null;
}

export function AnnouncementComments({
  announcementId,
  currentUserId,
}: AnnouncementCommentsProps) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close the open menu when clicking outside it.
  useEffect(() => {
    if (!openMenuId) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openMenuId]);

  const { data, isLoading } = useQuery<{ comments: AnnouncementComment[] }>({
    queryKey: ['announcement-comments', announcementId],
    queryFn: async () => {
      const res = await fetch(`/api/announcements/${announcementId}/comments`);
      if (!res.ok) throw new Error('Failed to load comments');
      return res.json();
    },
  });

  const postMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/announcements/${announcementId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, parentId: replyingTo }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to post comment');
      }
      return res.json();
    },
    onSuccess: (result) => {
      queryClient.setQueryData<{ comments: AnnouncementComment[] }>(
        ['announcement-comments', announcementId],
        (old) => ({ comments: [...(old?.comments || []), result.comment] })
      );
      setContent('');
      setReplyingTo(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const res = await fetch(
        `/api/announcements/${announcementId}/comments/${commentId}`,
        { method: 'DELETE' }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to delete comment');
      }
      return commentId;
    },
    onSuccess: (commentId) => {
      // Remove the deleted comment and any of its replies from the cache.
      queryClient.setQueryData<{ comments: AnnouncementComment[] }>(
        ['announcement-comments', announcementId],
        (old) => ({
          comments: (old?.comments || []).filter(
            (c) => c.id !== commentId && c.parentId !== commentId
          ),
        })
      );
      setDeletingId(null);
    },
    onError: () => setDeletingId(null),
  });

  const handleDelete = (commentId: string) => {
    setDeletingId(commentId);
    deleteMutation.mutate(commentId);
  };

  const comments = data?.comments || [];
  const roots = comments.filter((c) => !c.parentId);
  const repliesFor = (id: string) => comments.filter((c) => c.parentId === id);

  const renderComment = (comment: AnnouncementComment, isReply = false) => {
    const isOwn = currentUserId === comment.author.id;
    const isDeleting = deletingId === comment.id;

    return (
      <div key={comment.id} className={isReply ? 'ml-8 border-l-2 border-[#E2E8F0] pl-3' : ''}>
        <div className="flex gap-2.5">
          {/* Avatar */}
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
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1A365D] text-[10px] font-semibold text-white">
              {comment.author.firstName.charAt(0)}{comment.author.lastName.charAt(0)}
            </div>
          )}

          {/* Body */}
          <div className="min-w-0 flex-1">
            {/* Header row — name · tech center · options */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-[#1E293B]">
                  {comment.author.firstName} {comment.author.lastName}
                </span>
                {comment.author.techCenter?.name && (
                  <span className="text-[10px] text-[#94A3B8]">
                    {comment.author.techCenter.name}
                  </span>
                )}
              </div>

              {/* Three-dot menu — only on the user's own comments */}
              {isOwn && (
                <div className="relative shrink-0" ref={openMenuId === comment.id ? menuRef : null}>
                  <button
                    type="button"
                    onClick={() => setOpenMenuId(openMenuId === comment.id ? null : comment.id)}
                    aria-label="Comment options"
                    className="rounded p-0.5 text-[#CBD5E1] transition-colors hover:text-[#64748B]"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {openMenuId === comment.id && (
                    <div className="absolute right-0 top-6 z-20 min-w-[120px] overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-lg">
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuId(null);
                          handleDelete(comment.id);
                        }}
                        disabled={isDeleting}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-[#C53030] transition-colors hover:bg-[#FFF5F5] disabled:opacity-40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-5 text-[#475569]">
              {comment.content}
            </p>

            {!isReply && (
              <button
                type="button"
                onClick={() => setReplyingTo(comment.id)}
                className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-[#3182CE] hover:text-[#1A365D]"
              >
                <Reply className="h-3 w-3" /> Reply
              </button>
            )}
          </div>
        </div>

        {/* Replies */}
        <div className="mt-3 space-y-3">
          {repliesFor(comment.id).map((reply) => renderComment(reply, true))}
        </div>
      </div>
    );
  };

  return (
    <div className="border-t border-[#E2E8F0] bg-white px-4 py-5 sm:px-5">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <MessageCircle className="h-4 w-4 text-[#3182CE]" />
        <h4 className="text-sm font-semibold text-[#1E293B]">Comments</h4>
        <span className="text-xs text-[#94A3B8]">{comments.length}</span>
      </div>

      {/* Comments list */}
      {isLoading ? (
        <div className="space-y-3">
          <div className="h-10 animate-pulse rounded bg-[#F1F5F9]" />
          <div className="h-10 w-4/5 animate-pulse rounded bg-[#F1F5F9]" />
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">{roots.map((c) => renderComment(c))}</div>
      ) : (
        <p className="mb-4 text-xs text-[#94A3B8]">Be the first to comment.</p>
      )}

      {/* Delete error */}
      {deleteMutation.isError && (
        <p className="mt-2 text-xs text-[#C53030]">{deleteMutation.error.message}</p>
      )}

      {/* Replying-to banner */}
      {replyingTo && (
        <div className="mt-4 flex items-center justify-between rounded bg-[#F8FAFC] px-3 py-2 text-xs text-[#64748B]">
          <span>Replying to a comment</span>
          <button
            type="button"
            onClick={() => setReplyingTo(null)}
            className="font-semibold text-[#3182CE]"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (content.trim() && !postMutation.isPending) postMutation.mutate();
        }}
        className="mt-3 flex items-center gap-2"
      >
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={1000}
          placeholder={replyingTo ? 'Write a reply...' : 'Add a comment...'}
          className="min-w-0 flex-1 rounded-lg border border-[#CBD5E1] px-3 py-2 text-sm outline-none focus:border-[#3182CE]"
        />
        <button
          type="submit"
          disabled={!content.trim() || postMutation.isPending}
          aria-label="Post comment"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1A365D] text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

      {postMutation.isError && (
        <p className="mt-2 text-xs text-[#C53030]">{postMutation.error.message}</p>
      )}
    </div>
  );
}
