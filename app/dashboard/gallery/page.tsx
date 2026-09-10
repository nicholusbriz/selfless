'use client';

import { Images, Sparkles } from 'lucide-react';

export default function GalleryPage() {
  return (
    <main className="min-h-[520px]">
      <section className="overflow-hidden rounded-2xl border border-[#DADCD3] bg-white shadow-sm">
        <div className="border-b border-[#DADCD3] px-6 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#B98A3E]/25 bg-[#F7F1E4] text-[#B98A3E]">
              <Images className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#B98A3E]">
                Selfless CE moments
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#12203B] sm:text-3xl">
                Gallery
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#4B564C] sm:text-base">
                All Selfless CE moments will be displayed here.
              </p>
            </div>
          </div>
        </div>

        <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-12 text-center sm:min-h-[360px] sm:px-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#55705B]/20 bg-[#55705B]/5 text-[#55705B]">
            <Sparkles className="h-7 w-7" />
          </div>
          <h3 className="mt-5 text-lg font-semibold text-[#12203B]">
            Your memories will appear here
          </h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-[#6B7268]">
            Photos, celebrations, learning experiences, and community moments
            from across Selfless CE will be collected in this gallery.
          </p>
        </div>
      </section>
    </main>
  );
}
