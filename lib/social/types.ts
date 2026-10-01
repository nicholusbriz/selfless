// lib/social/types.ts

export interface UserSocialState {
  isFollowing?: boolean;
  isLiked?: boolean;
  followersCount?: number;
  followingCount?: number;
  likesReceivedCount?: number;
  profileViewsCount?: number;
}

export type SocialPatch = Partial<{
  isFollowing: boolean;
  isLiked: boolean;
  followersCount: number;
  followingCount: number;
  likesReceivedCount: number;
  profileViewsCount: number;
}>;

export interface Rankable {
  id: string;
  followersCount: number;
  likesReceivedCount: number;
  firstName?: string;
  lastName?: string;
}

export interface UserSocialStats {
  followersCount: number;
  followingCount: number;
  likesReceivedCount: number;
  profileViewsCount: number;
  isFollowing: boolean;
  isLiked: boolean;
}

export type SocialStatsMap = Record<string, UserSocialStats>;