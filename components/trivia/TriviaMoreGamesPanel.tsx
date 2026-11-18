'use client';

import { Gamepad2 } from 'lucide-react';

export default function TriviaMoreGamesPanel() {
  return (
    <section className="flex min-h-0 flex-1 flex-col items-center justify-center space-y-4 px-5 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600">
        <Gamepad2 className="h-7 w-7" />
      </div>
      <div className="max-w-xs space-y-1">
        <h3 className="text-base font-bold text-slate-900">More Games Coming Soon</h3>
        <p className="text-xs leading-relaxed text-slate-500">
          More games are under development and will appear here when they are ready to play.
        </p>
      </div>
    </section>
  );
}
