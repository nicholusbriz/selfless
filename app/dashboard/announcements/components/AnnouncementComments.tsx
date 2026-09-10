'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MessageCircle, Reply, Send } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface CommentAuthor {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  role?: { displayName: string } | null;
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
}

export function AnnouncementComments({ announcementId }: AnnouncementCommentsProps) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ comments: AnnouncementComment[] }>({
    queryKey: ['announcement-comments', announcementId],
    queryFn: async () => {
      const response = await fetch(`/api/announcements/${announcementId}/comments`);
      if (!response.ok) throw new Error('Failed to load comments');
      return response.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/announcements/${announcementId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, parentId: replyingTo }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to post comment');
      }
      return response.json();
    },
    onSuccess: (result) => {
      queryClient.setQueryData<{ comments: AnnouncementComment[] }>(
        ['announcement-comments', announcementId],
        (oldData) => ({ comments: [...(oldData?.comments || []), result.comment] })
      );
      setContent('');
      setReplyingTo(null);
    },
  });

  const comments = data?.comments || [];
  const roots = comments.filter((comment) => !comment.parentId);
  const repliesFor = (commentId: string) => comments.filter((comment) => comment.parentId === commentId);

  const renderComment = (comment: AnnouncementComment, isReply = false) => (
    <div key={comment.id} className={isReply ? 'ml-8 border-l-2 border-[#E2E8F0] pl-3' : ''}>
      <div className="flex gap-2.5">
        {comment.author.profileImageUrl ? (
          <Image src={comment.author.profileImageUrl} alt="" width={30} height={30} unoptimized className="h-7 w-7 shrink-0 rounded-full object-cover" />
        ) : (
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1A365D] text-[10px] font-semibold text-white">
            {comment.author.firstName.charAt(0)}{comment.author.lastName.charAt(0)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#1E293B]">{comment.author.firstName} {comment.author.lastName}</span>
            <span className="text-[10px] text-[#94A3B8]">{comment.author.role?.displayName || 'Member'}</span>
          </div>
          <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-5 text-[#475569]">{comment.content}</p>
          {!isReply && (
            <button type="button" onClick={() => setReplyingTo(comment.id)} className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-[#3182CE] hover:text-[#1A365D]">
              <Reply className="h-3 w-3" /> Reply
            </button>
          )}
        </div>
      </div>
      <div className="mt-3 space-y-3">{repliesFor(comment.id).map((reply) => renderComment(reply, true))}</div>
    </div>
  );

  return (
    <div className="border-t border-[#E2E8F0] bg-white px-4 py-5 sm:px-5">
      <div className="mb-4 flex items-center gap-2">
        <MessageCircle className="h-4 w-4 text-[#3182CE]" />
        <h4 className="text-sm font-semibold text-[#1E293B]">Comments</h4>
        <span className="text-xs text-[#94A3B8]">{comments.length}</span>
      </div>

      {isLoading ? (
        <div className="space-y-3"><div className="h-10 animate-pulse rounded bg-[#F1F5F9]" /><div className="h-10 w-4/5 animate-pulse rounded bg-[#F1F5F9]" /></div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">{roots.map((comment) => renderComment(comment))}</div>
      ) : (
        <p className="mb-4 text-xs text-[#94A3B8]">Be the first to comment.</p>
      )}

      {replyingTo && (
        <div className="mt-4 flex items-center justify-between rounded bg-[#F8FAFC] px-3 py-2 text-xs text-[#64748B]">
          <span>Replying to a comment</span>
          <button type="button" onClick={() => setReplyingTo(null)} className="font-semibold text-[#3182CE]">Cancel</button>
        </div>
      )}
      <form onSubmit={(event) => { event.preventDefault(); if (content.trim() && !mutation.isPending) mutation.mutate(); }} className="mt-3 flex items-center gap-2">
        <input value={content} onChange={(event) => setContent(event.target.value)} maxLength={1000} placeholder={replyingTo ? 'Write a reply...' : 'Add a comment...'} className="min-w-0 flex-1 rounded-lg border border-[#CBD5E1] px-3 py-2 text-sm outline-none focus:border-[#3182CE]" />
        <button type="submit" disabled={!content.trim() || mutation.isPending} aria-label="Post comment" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1A365D] text-white disabled:cursor-not-allowed disabled:opacity-50"><Send className="h-4 w-4" /></button>
      </form>
      {mutation.isError && <p className="mt-2 text-xs text-[#C53030]">{mutation.error.message}</p>}
    </div>
  );
}
