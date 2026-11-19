'use client';

import { Gamepad2 } from 'lucide-react';

export default function TriviaMoreGamesPanel() {
  return (
    <section className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden px-5 text-center">
      {/* Background video */}
      <video
        src="/games.mp4"
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      />
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/20 to-slate-950/60" />

      {/* Content on top */}
      <div className="relative z-10 flex flex-col items-center space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white backdrop-blur-sm">
          <Gamepad2 className="h-7 w-7" />
        </div>
        <div className="max-w-xs space-y-1">
          <h3 className="text-base font-bold text-white drop-shadow">More Games Coming Soon</h3>
          <p className="text-xs leading-relaxed text-white/80">
            More games are under development and will appear here when they are ready to play.
          </p>
        </div>
      </div>
    </section>
  );
}
