'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause, User } from 'lucide-react';
import { useAllFootballTeams } from '@/hooks/useAllFootballTeams';
import Image from 'next/image';

const AUTO_SCROLL_MS = 10000;

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function PlayerGridSkeleton({
  dark = false,
  count = 6,
}: {
  dark?: boolean;
  count?: number;
}) {
  const base = dark ? 'bg-white/10' : 'bg-black/10';
  return (
    <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 px-1 py-1">
          <div className={`h-7 w-7 shrink-0 animate-pulse rounded-full ${base}`} />
          <div className={`h-2.5 w-20 flex-1 animate-pulse rounded sm:w-auto ${base}`} />
          <div className={`h-2.5 w-5 shrink-0 animate-pulse rounded ${base}`} />
        </div>
      ))}
    </div>
  );
}

function CarouselSkeleton({ inHeader = false }: { inHeader?: boolean }) {
  const bg = inHeader ? 'bg-[#12203B]' : 'bg-white';
  const stripe = inHeader ? 'bg-[#263653]' : 'bg-[#F1F1EC]';
  const label = inHeader ? 'bg-white/15' : 'bg-[#DADCD3]';
  const btn = inHeader ? 'bg-white/10' : 'bg-[#F7F6F2]';
  const line = inHeader ? 'bg-white/10' : 'bg-[#EAEAE3]';
  const squadBg = inHeader ? 'bg-[#263653]' : 'bg-[#F7F6F2]';

  return (
    <div className={`overflow-hidden rounded-xl ${bg} shadow-sm`}>
      <div className={`h-0.5 w-full ${stripe}`} />
      <div className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className={`h-2.5 w-14 animate-pulse rounded ${label}`} />
          <div className="flex items-center gap-1">
            <div className={`h-7 w-7 animate-pulse rounded-md ${btn}`} />
            <div className={`h-7 w-7 animate-pulse rounded-md ${btn}`} />
            <div className={`h-7 w-7 animate-pulse rounded-md ${btn}`} />
          </div>
        </div>

        <div className={`mb-3 h-3.5 w-3/4 animate-pulse rounded ${label}`} />
        <div className="mb-4 space-y-2">
          <div className={`h-2.5 w-full animate-pulse rounded ${line}`} />
          <div className={`h-2.5 w-2/3 animate-pulse rounded ${line}`} />
        </div>

        <div className={`mb-4 rounded-md ${squadBg} p-3`}>
          <PlayerGridSkeleton dark={inHeader} count={6} />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className={`h-2.5 w-10 animate-pulse rounded ${line}`} />
          <div className="flex items-center gap-1.5">
            <div className={`h-1.5 w-4 animate-pulse rounded-full ${label}`} />
            <div className={`h-1.5 w-1.5 animate-pulse rounded-full ${line}`} />
            <div className={`h-1.5 w-1.5 animate-pulse rounded-full ${line}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Player grid — avatar, name, then number as plain text              */
/* ------------------------------------------------------------------ */

type Player = {
  id: string;
  lastName: string;
  jerseyNumber?: number | string | null;
  image?: string | null;
};

function PlayerGrid({
  players,
  dark = false,
}: {
  players: Player[];
  dark?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-3">
      {players.map((player) => (
        <div key={player.id} className="flex min-w-0 items-center gap-2">
          {/* Avatar first */}
          <div
            className={`relative h-7 w-7 shrink-0 overflow-hidden rounded-full ${
              dark ? 'bg-white/10' : 'bg-[#F1F1EC]'
            }`}
          >
            {player.image ? (
              <Image
                src={player.image}
                alt={player.lastName}
                fill
                sizes="28px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User
                  className={`h-3.5 w-3.5 ${
                    dark ? 'text-white/50' : 'text-[#6B7268]'
                  }`}
                />
              </div>
            )}
          </div>

          {/* Name */}
          <p
            className={`min-w-0 flex-1 text-[12px] font-semibold leading-tight sm:truncate ${
              dark ? 'text-[#F1F1EC]' : 'text-[#12203B]'
            }`}
          >
            {player.lastName}
          </p>

          {/* Number as plain text at the end */}
          <span
            className={`shrink-0 text-[11px] font-medium tabular-nums ${
              dark ? 'text-[#AEB4AA]' : 'text-[#6B7268]'
            }`}
          >
            {player.jerseyNumber ?? '—'}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

interface AnnouncementCarouselProps {
  inHeader?: boolean;
}

export default function AnnouncementCarousel({
  inHeader = false,
}: AnnouncementCarouselProps) {
  // ---- ALL HOOKS FIRST ----
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const { data: teams, isLoading } = useAllFootballTeams();

  const cards = (teams || []).map((team) => ({
    id: `football-${team.techCenterId}-squad`,
    title: `${team.techCenterName} Squad`,
    body: `${team.members.length} player${
      team.members.length !== 1 ? 's' : ''
    } on the roster`,
    players: team.members.map<Player>((m) => ({
      id: m.user.id,
      lastName: m.user.lastName,
      jerseyNumber: m.jerseyNumber,
      image: m.user.profileImageUrl,
    })),
  }));

  const total = cards.length;
  const current = cards[index];

  const goTo = useCallback(
    (next: number) => {
      if (total === 0) return;
      setIndex(((next % total) + total) % total);
      setProgressKey((k) => k + 1);
    },
    [total]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (isPaused || total === 0) return;
    const t = setTimeout(() => next(), AUTO_SCROLL_MS);
    return () => clearTimeout(t);
  }, [index, isPaused, next, total]);

  useEffect(() => {
    if (total > 0 && index >= total) setIndex(total - 1);
  }, [total, index]);

  // ---- EARLY RETURN (after all hooks) ----
  if (isLoading || total === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <CarouselSkeleton inHeader={inHeader} />
      </motion.div>
    );
  }

  /* ---- Palette by variant ---- */
  const p = inHeader
    ? {
        card: 'bg-[#12203B]',
        stripe: 'bg-[#263653]',
        progress: 'bg-[#E8A33D]',
        label: 'text-[#E8A33D]',
        title: 'text-white',
        body: 'text-[#AEB4AA]',
        navBtn: 'text-[#DADCD3] hover:bg-[#263653] hover:text-[#E8A33D]',
        squadBg: 'bg-[#0E1A30] border-[#263653]',
        counter: 'text-[#687761]',
        dot: 'bg-[#687761] hover:bg-[#8A9088]',
        dotActive: 'bg-[#E8A33D]',
      }
    : {
        card: 'bg-white',
        stripe: 'bg-[#F1F1EC]',
        progress: 'bg-[#B98A3E]',
        label: 'text-[#B98A3E]',
        title: 'text-[#12203B]',
        body: 'text-[#6B7268]',
        navBtn: 'text-[#6B7268] hover:bg-[#F7F6F2] hover:text-[#12203B]',
        squadBg: 'bg-[#F7F6F2] border-[#DADCD3]',
        counter: 'text-[#6B7268]',
        dot: 'bg-[#DADCD3] hover:bg-[#8A9088]',
        dotActive: 'bg-[#B98A3E]',
      };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`overflow-hidden rounded-xl ${p.card} shadow-sm`}
    >
      {/* Progress */}
      <div className={`h-0.5 w-full ${p.stripe}`}>
        {!isPaused && (
          <motion.div
            key={progressKey}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: AUTO_SCROLL_MS / 1000, ease: 'linear' }}
            className={`h-full ${p.progress}`}
          />
        )}
      </div>

      <div className="p-5">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <p
            className={`text-[11px] font-semibold uppercase tracking-[0.15em] ${p.label}`}
          >
            Sports
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={prev}
              aria-label="Previous"
              className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${p.navBtn}`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              onClick={() => setIsPaused((x) => !x)}
              aria-label={isPaused ? 'Play' : 'Pause'}
              className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${p.navBtn}`}
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
              className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${p.navBtn}`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[240px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
            >
              <h3
                className={`mb-1 text-[16px] font-semibold leading-snug ${p.title}`}
              >
                {current.title}
              </h3>

              <p className={`mb-4 text-[12.5px] ${p.body}`}>{current.body}</p>

              <div className={`mb-4 rounded-md border p-3 ${p.squadBg}`}>
                <PlayerGrid players={current.players} dark={inHeader} />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          <span className={`text-[11px] tabular-nums ${p.counter}`}>
            {index + 1} / {total}
          </span>
          <div className="flex items-center gap-1.5">
            {cards.map((c, i) => (
              <button
                key={c.id}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? `w-5 ${p.dotActive}` : `w-1.5 ${p.dot}`
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}