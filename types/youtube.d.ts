// types/youtube.d.ts
// Global type declarations for YouTube IFrame API

export interface YouTubePlayer {
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  getVolume(): number;
  setVolume(volume: number): void;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  destroy(): void;
}

export interface YouTubePlayerOptions {
  videoId: string;
  height?: string | number;
  width?: string | number;
  playerVars?: {
    autoplay?: number;
    controls?: number;
    rel?: number;
    modestbranding?: number;
    showinfo?: number;
    [key: string]: any;
  };
  events?: {
    onReady?: (event: { target: YouTubePlayer }) => void;
    onStateChange?: (event: { data: number; target: YouTubePlayer }) => void;
    onError?: (event: { data: number; target: YouTubePlayer }) => void;
  };
}

export interface YouTubeIframeAPI {
  Player: new (elementId: string | HTMLElement, options: YouTubePlayerOptions) => YouTubePlayer;
  PlayerState: {
    UNSTARTED: number;
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
}

declare global {
  interface Window {
    YT: YouTubeIframeAPI;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export {};
