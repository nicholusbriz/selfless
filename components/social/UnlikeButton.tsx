'use client';

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
      className={`inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-[#A4462F] transition-all hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 ${className ?? ''}`}
    >
      {loading && <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2} />}
      {loading ? 'Unliking…' : 'Unlike'}
    </button>
  );
}
