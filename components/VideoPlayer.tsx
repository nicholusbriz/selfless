'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';

interface VideoPlayerProps {
  videos: string[];
}

export default function VideoPlayer({ videos }: VideoPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentVideo = videos[currentIndex];

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, currentVideo]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleNext = () => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsPlaying(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsPlaying(true);
    }
  };

  const handleVideoEnd = () => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  if (videos.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-xl border border-[#D9E2EC] bg-[#0B1728] shadow-lg">
        <video
          ref={videoRef}
          key={currentVideo}
          src={currentVideo}
          onEnded={handleVideoEnd}
          playsInline
          className="block aspect-video w-full object-cover"
        />

        {/* Custom Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition-all hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous video"
              >
                <SkipBack className="h-5 w-5" />
              </button>

              <button
                onClick={handlePlayPause}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#0B1728] transition-all hover:bg-white/90"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
              </button>

              <button
                onClick={handleNext}
                disabled={currentIndex === videos.length - 1}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition-all hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next video"
              >
                <SkipForward className="h-5 w-5" />
              </button>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleMuteToggle}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition-all hover:bg-white/30"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Video Counter */}
          <div className="mt-3 flex items-center justify-between text-xs text-white/80">
            <span>Video {currentIndex + 1} of {videos.length}</span>
            <span className="text-white/60">Auto-play enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
