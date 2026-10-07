'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  AlertCircle,
} from 'lucide-react';

type Announcement = {
  id: string;
  label: string;
  title: string;
  body: string;
  warning?: string;
  cta?: { label: string; href: string };
  signoff?: string;
};

const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'assignments',
    label: 'Reminder',
    title: 'Finish and Submit Your Assignments on Time',
    body: 'As we look forward to closing the term, make sure you finish and submit your assignments on time.',
    warning: 'Remember: our minimum GPA is 3.0.',
    signoff: 'Stay focused and finish strong.',
  },
  {
    id: 'portal',
    label: 'Important',
    title: 'This Is the Official Student Portal',
    body: 'Get familiar with it starting next block. Each tech center will be operating on this platform. You will be able to register for your cleaning participation days, submit the course units you are taking this block, and submit the tuition you are demanded.',
    warning:
      'The core feature of this platform is for you to interact, connect, and seek advice.',
    signoff: 'Make the most of it.',
  },
];

const AUTO_SCROLL_MS = 5000;

interface AnnouncementCarouselProps {
  inHeader?: boolean;
}

export default function AnnouncementCarousel({
  inHeader = false,
}: AnnouncementCarouselProps) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);

  const total = ANNOUNCEMENTS.length;
  const current = ANNOUNCEMENTS[index];

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % total) + total) % total);
      setProgressKey((k) => k + 1);
    },
    [total]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (isPaused) return;

    const t = setTimeout(() => next(), AUTO_SCROLL_MS);

    return () => clearTimeout(t);
  }, [index, isPaused, next]);

  const handleCta = (href: string) => {
    window.location.href = href;
  };

  /*
   * HEADER VERSION
   * Institutional palette:
   * Navy   #12203B
   * Brass  #E8A33D
   * Moss   #55705B
   * Rust   #A4462F
   * Cream  #F1F1EC
   */
  if (inHeader) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-xl border border-[#DADCD3] bg-[#12203B] shadow-sm"
      >
        {/* Progress */}
        <div className="h-0.5 w-full bg-[#263653]">
          {!isPaused && (
            <motion.div
              key={progressKey}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{
                duration: AUTO_SCROLL_MS / 1000,
                ease: 'linear',
              }}
              className="h-full bg-[#E8A33D]"
            />
          )}
        </div>

        <div className="p-5">
          {/* Header */}
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#E8A33D]">
              {current.label}
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={prev}
                aria-label="Previous"
                className="flex h-7 w-7 items-center justify-center rounded-md text-[#DADCD3] transition-colors hover:bg-[#263653] hover:text-[#E8A33D]"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={() => setIsPaused((p) => !p)}
                aria-label={isPaused ? 'Play' : 'Pause'}
                className="flex h-7 w-7 items-center justify-center rounded-md text-[#DADCD3] transition-colors hover:bg-[#263653] hover:text-[#E8A33D]"
              >
                {isPaused ? (
                  <Play className="h-3 w-3" />
                ) : (
                  <Pause className="h-3 w-3" />
                )}
              </button>

              <button
                onClick={next}
                aria-label="Next"
                className="flex h-7 w-7 items-center justify-center rounded-md text-[#DADCD3] transition-colors hover:bg-[#263653] hover:text-[#E8A33D]"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.25 }}
            >
              <h3 className="mb-2 text-[15px] font-semibold leading-snug text-[#FFFFFF]">
                {current.title}
              </h3>

              <p className="mb-3 text-[12.5px] leading-relaxed text-[#DADCD3]">
                {current.body}
              </p>

              {current.warning && (
                <div className="mb-3 flex items-start gap-2 rounded-md border border-[#55705B]/60 bg-[#55705B]/20 p-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E8A33D]" />

                  <p className="text-[12px] leading-snug text-[#F1F1EC]">
                    {current.warning}
                  </p>
                </div>
              )}

              {current.cta && (
                <button
                  onClick={() => handleCta(current.cta!.href)}
                  className="flex w-full items-center justify-between gap-2 rounded-md bg-[#E8A33D] px-4 py-2.5 text-[13px] font-semibold text-[#12203B] transition-colors hover:bg-[#C97F1F]"
                >
                  {current.cta.label}

                  <ChevronRight className="h-4 w-4" />
                </button>
              )}

              {current.signoff && (
                <p className="mt-3 text-[11.5px] text-[#AEB4AA]">
                  {current.signoff}
                </p>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Indicators */}
          <div className="mt-4 flex items-center justify-center gap-1.5">
            {ANNOUNCEMENTS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index
                    ? 'w-4 bg-[#E8A33D]'
                    : 'w-1.5 bg-[#687761] hover:bg-[#8A9088]'
                }`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  /*
   * STANDARD VERSION
   *
   * Institutional light palette:
   * Page/Cream  #F1F1EC
   * Surface     #FFFFFF
   * Soft        #F7F6F2
   * Border      #DADCD3
   * Navy       #12203B
   * Body       #4B564C
   * Muted      #6B7268
   * Brass      #B98A3E
   * BrassLight #E8A33D
   * Moss       #55705B
   * Rust       #A4462F
   */
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-xl border border-[#DADCD3] bg-white shadow-sm"
    >
      {/* Progress */}
      <div className="h-0.5 w-full bg-[#F1F1EC]">
        {!isPaused && (
          <motion.div
            key={progressKey}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{
              duration: AUTO_SCROLL_MS / 1000,
              ease: 'linear',
            }}
            className="h-full bg-[#B98A3E]"
          />
        )}
      </div>

      <div className="p-5">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#B98A3E]">
            {current.label}
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={prev}
              aria-label="Previous"
              className="flex h-7 w-7 items-center justify-center rounded-md text-[#6B7268] transition-colors hover:bg-[#F7F6F2] hover:text-[#12203B]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              onClick={() => setIsPaused((p) => !p)}
              aria-label={isPaused ? 'Play' : 'Pause'}
              className="flex h-7 w-7 items-center justify-center rounded-md text-[#6B7268] transition-colors hover:bg-[#F7F6F2] hover:text-[#12203B]"
            >
              {isPaused ? (
                <Play className="h-3.5 w-3.5" />
              ) : (
                <Pause className="h-3.5 w-3.5" />
              )}
            </button>

            <button
              onClick={next}
              aria-label="Next"
              className="flex h-7 w-7 items-center justify-center rounded-md text-[#6B7268] transition-colors hover:bg-[#F7F6F2] hover:text-[#12203B]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="mb-3 text-[18px] font-semibold leading-snug text-[#12203B]">
              {current.title}
            </h2>

            <p className="mb-4 text-[13.5px] leading-relaxed text-[#4B564C]">
              {current.body}
            </p>

            {current.warning && (
              <div className="mb-4 flex items-start gap-2.5 rounded-md border border-[#DADCD3] bg-[#F7F6F2] p-3">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#A4462F]" />

                <p className="text-[12.5px] leading-snug text-[#4B564C]">
                  {current.warning}
                </p>
              </div>
            )}

            {current.cta && (
              <button
                onClick={() => handleCta(current.cta!.href)}
                className="inline-flex items-center gap-2 rounded-md bg-[#12203B] px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1D3152]"
              >
                {current.cta.label}

                <ChevronRight className="h-4 w-4 text-[#E8A33D]" />
              </button>
            )}

            {current.signoff && (
              <p className="mt-4 text-[12px] text-[#6B7268]">
                {current.signoff}
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Indicators */}
        <div className="mt-5 flex items-center justify-center gap-1.5">
          {ANNOUNCEMENTS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index
                  ? 'w-5 bg-[#B98A3E]'
                  : 'w-1.5 bg-[#DADCD3] hover:bg-[#8A9088]'
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}