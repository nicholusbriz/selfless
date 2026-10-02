'use client';

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
  /** When false, "Following" is a static badge — clicking does nothing. */
  allowUnfollow?: boolean;
  /** When false, "Liked" is a static badge — clicking does nothing. */
  allowUnlike?: boolean;
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
  'border border-[#E5E7EB] bg-white text-[#1A2B4C] hover:border-red-500 hover:bg-red-50 hover:text-red-600';
const likeIdleFeatured =
  'border border-[#E5E7EB] bg-white/90 text-[#1A2B4C] backdrop-blur-sm hover:border-red-500 hover:bg-red-50 hover:text-red-600';
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
  allowUnfollow = true,
  allowUnlike = true,
}: SocialActionsProps) {
  const social = useSocialActions({ pageAdapters });
  const { isFollowing, isLiked: cachedIsLiked } = social.readLiveState(userId);
  const isSelf = currentUserId === userId;

  const followPending = social.isFollowPending && social.followTarget === userId;
  const unfollowPending =
    social.isUnfollowPending && social.unfollowTarget === userId;
  const likePending = social.isLikePending && social.likeTarget === userId;
  const isLiked = likePending
    ? social.likeTargetIsLiked ?? cachedIsLiked
    : cachedIsLiked;
  const followLoading = followPending || unfollowPending;

  const iconCls = iconSize[size];
  const szCls = sizeClasses[size];
  const isFeatured = variant === 'featured';
  const wrap = `flex flex-wrap items-center gap-1.5 ${className ?? ''}`;

  /* ---------- SELF ---------- */
  if (isSelf) {
    return (
      <div className={wrap}>
        <span
          className={`${baseBtn} ${szCls} border border-[#E5E7EB] bg-white/60 text-[#9CA3AF] cursor-not-allowed`}
          aria-disabled="true"
          title="You cannot like your own profile"
        >
          <Heart className={`${iconCls} text-red-500`} strokeWidth={2} />
          Like
        </span>
        <span
          className={`${baseBtn} ${szCls} border border-[#E5E7EB] bg-white/60 text-[#9CA3AF] cursor-not-allowed`}
          aria-disabled="true"
          title="You cannot follow yourself"
        >
          <UserPlus className={iconCls} strokeWidth={2} />
          Follow
        </span>
        <span
          className={`${baseBtn} ${szCls} border border-[#B98A3E]/40 bg-[#B98A3E]/10 text-[#8A6A2E]`}
        >
          This is you
        </span>
        {onViewProfile && (
          <button
            type="button"
            onClick={onViewProfile}
            className={`${baseBtn} ${szCls} border border-transparent text-[#4B5646] hover:border-[#E5E7EB] hover:bg-white/70`}
          >
            View
          </button>
        )}
      </div>
    );
  }

  /* ---------- NORMAL USER ---------- */
  return (
    <div className={wrap}>
      {/* LIKE */}
      {isLiked ? (
        allowUnlike ? (
          <button
            type="button"
            disabled={likePending}
            onClick={() => social.toggleLike(userId)}
            className={`${baseBtn} ${szCls} ${likeActive}`}
            aria-label="Unlike this profile"
            title="Unlike"
          >
              <Heart className={`${iconCls} fill-red-500 text-red-500`} strokeWidth={2} />
            Liked
          </button>
        ) : (
          <span
            className={`${baseBtn} ${szCls} ${likeActive} cursor-default`}
            aria-label="Already liked"
            title="You liked this profile"
          >
            <Heart className={`${iconCls} fill-red-500 text-red-500`} strokeWidth={2} />
            Liked
          </span>
        )
      ) : (
        <button
          type="button"
          disabled={likePending}
          onClick={() => social.toggleLike(userId)}
          className={`${baseBtn} ${szCls} ${
            isFeatured ? likeIdleFeatured : likeIdleOutlined
          }`}
          aria-label="Like this profile"
          title="Like"
        >
          <Heart className={`${iconCls} text-red-500`} strokeWidth={2} />
          Like
        </button>
      )}

      {/* FOLLOW */}
      {isFollowing ? (
        allowUnfollow ? (
          <button
            type="button"
            disabled={unfollowPending}
            onClick={() => social.unfollow(userId)}
            className={`${baseBtn} ${szCls} ${followActive}`}
            aria-label="Unfollow this user"
            title="Unfollow"
          >
            {unfollowPending ? (
              <Loader2 className={`${iconCls} animate-spin`} strokeWidth={2.5} />
            ) : (
              <Check className={iconCls} strokeWidth={2.5} />
            )}
            Following
          </button>
        ) : (
          <span
            className={`${baseBtn} ${szCls} ${followActive} cursor-default`}
            aria-label="Already following"
            title="You are following this user"
          >
            <Check className={iconCls} strokeWidth={2.5} />
            Following
          </span>
        )
      ) : (
        <button
          type="button"
          disabled={followLoading}
          onClick={() => social.follow(userId)}
          className={`${baseBtn} ${szCls} ${followIdle}`}
          aria-label="Follow this user"
          title="Follow"
        >
          {followLoading ? (
            <Loader2 className={`${iconCls} animate-spin`} strokeWidth={2} />
          ) : (
            <UserPlus className={iconCls} strokeWidth={2} />
          )}
          Follow
        </button>
      )}

      {/* OPTIONAL VIEW */}
      {onViewProfile && (
        <button
          type="button"
          onClick={onViewProfile}
          className={`${baseBtn} ${szCls} border border-transparent text-[#4B5646] hover:border-[#E5E7EB] hover:bg-white/70`}
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