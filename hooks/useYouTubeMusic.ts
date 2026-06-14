// hooks/useYouTubeMusic.ts
// Re-export from the queries directory for backward compatibility
export { useYouTubeMusic, useVideoPlayer, categories } from './queries/useYouTubeMusicWithCache';
export type { YouTubeVideo, Category } from './queries/useYouTubeMusicWithCache';