'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause, User, Users, Trophy, Crown, Briefcase, GraduationCap, ChevronDown } from 'lucide-react';
import { useAllFootballTeams } from '@/hooks/useAllFootballTeams';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';

const AUTO_SCROLL_MS = 10000;

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function PlayerGridSkeleton({
  dark = false,
  count = 12,
}: {
  dark?: boolean;
  count?: number;
}) {
  const base = dark ? 'bg-white/10' : 'bg-black/10';
  return (
    <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 px-1 py-1">
          <div className={`h-8 w-8 shrink-0 animate-pulse rounded-full ${base}`} />
          <div className="min-w-0 flex-1 space-y-1">
            <div className={`h-2.5 w-24 animate-pulse rounded sm:w-auto ${base}`} />
            <div className={`h-2 w-8 animate-pulse rounded ${base}`} />
          </div>
          <div className={`h-2.5 w-6 shrink-0 animate-pulse rounded ${base}`} />
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
      <div className="p-3">
        <div className={`mb-2 h-3.5 w-3/4 animate-pulse rounded ${label}`} />
        <div className="mb-2 space-y-2">
          <div className={`h-2.5 w-full animate-pulse rounded ${line}`} />
          <div className={`h-2.5 w-2/3 animate-pulse rounded ${line}`} />
        </div>

        {/* Squad panel — fixed height for consistent size across screen sizes */}
        <div className={`mb-2 h-[260px] overflow-hidden rounded-md ${squadBg} p-3 sm:h-[100px]`}>
          <PlayerGridSkeleton dark={inHeader} count={12} />
        </div>

        {/* Bottom controls */}
        <div className="mt-2 flex items-center justify-between">
          <div className={`h-2.5 w-10 animate-pulse rounded ${line}`} />
          <div className="flex items-center gap-1">
            <div className={`h-6 w-6 animate-pulse rounded-md ${btn}`} />
            <div className={`h-6 w-6 animate-pulse rounded-md ${btn}`} />
            <div className={`h-6 w-6 animate-pulse rounded-md ${btn}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Player grid — fixed height + internal scroll on ALL sizes          */
/* ------------------------------------------------------------------ */

type Player = {
  id: string;
  lastName: string;
  jerseyNumber?: number | string | null;
  image?: string | null;
  isDirector?: boolean;
  isManager?: boolean;
  isTutor?: boolean;
  firstName?: string;
  position?: string | null;
};

type Director = {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string | null;
};

type TechCenterAdmin = {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string | null;
  isManager?: boolean;
  isTutor?: boolean;
};

function PlayerGrid({
  players,
  dark = false,
}: {
  players: Player[];
  dark?: boolean;
}) {
  return (
    // Fixed height + scroll everywhere. 1 col on mobile, 3 on sm+.
    <div className="grid h-full grid-cols-1 gap-x-3 gap-y-2 overflow-y-auto pr-1 [scrollbar-width:none] sm:grid-cols-3 [&::-webkit-scrollbar]:hidden">
      {players.map((player) => (
        <div key={player.id} className="flex min-w-0 items-center gap-2">
          {/* Avatar */}
          <div
            className={`relative h-8 w-8 shrink-0 overflow-hidden rounded-full ${
              dark ? 'bg-white/10' : 'bg-[#F1F1EC]'
            }`}
          >
            {player.image ? (
              <Image
                src={player.image}
                alt={player.firstName ? `${player.firstName} ${player.lastName}` : player.lastName}
                fill
                sizes="32px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User
                  className={`h-4 w-4 ${
                    dark ? 'text-white/50' : 'text-[#6B7268]'
                  }`}
                />
              </div>
            )}
          </div>

          {/* Name */}
          <div className="min-w-0 flex-1">
            <p
              className={`text-[13px] font-semibold leading-tight truncate ${
                dark ? 'text-[#F1F1EC]' : 'text-[#12203B]'
              }`}
            >
              {player.isDirector || player.isManager || player.isTutor
                ? `${player.firstName || ''} ${player.lastName}`.trim()
                : player.lastName}
            </p>
            {/* Role label after name */}
            <p
              className={`text-[10px] font-medium leading-tight ${
                player.isDirector
                  ? dark
                    ? 'text-[#E8A33D]'
                    : 'text-[#B98A3E]'
                  : dark
                  ? 'text-[#AEB4AA]'
                  : 'text-[#6B7268]'
              }`}
            >
              {player.isDirector
                ? 'Director'
                : player.isManager
                ? 'Manager'
                : player.isTutor
                ? 'Tutor'
                : player.position || 'Player'}
            </p>
          </div>

          {/* Icon or jersey number */}
          {player.isDirector ? (
            <Crown
              className={`h-3.5 w-3.5 shrink-0 ${
                dark ? 'text-[#E8A33D]' : 'text-[#B98A3E]'
              }`}
            />
          ) : player.isManager ? (
            <Briefcase
              className={`h-3.5 w-3.5 shrink-0 ${
                dark ? 'text-[#55705B]' : 'text-[#55705B]'
              }`}
            />
          ) : player.isTutor ? (
            <GraduationCap
              className={`h-3.5 w-3.5 shrink-0 ${
                dark ? 'text-[#55705B]' : 'text-[#55705B]'
              }`}
            />
          ) : (
            <span
              className={`shrink-0 text-[12px] font-medium tabular-nums ${
                dark ? 'text-[#AEB4AA]' : 'text-[#6B7268]'
              }`}
            >
              {player.jerseyNumber ?? '—'}
            </span>
          )}
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
  const { data: teams, isLoading: teamsLoading } = useAllFootballTeams();

  // Fetch directors
  const { data: directors = [], isLoading: directorsLoading } = useQuery({
    queryKey: ['directors'],
    queryFn: async () => {
      const response = await fetch('/api/directors');
      if (!response.ok) throw new Error('Failed to fetch directors');
      const data = await response.json();
      if (!data.success) throw new Error(data?.error ?? 'Failed');
      return data.directors;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchInterval: 3 * 60 * 1000, // Refetch every 3 minutes to keep data fresh
  });

  // Fetch tech center admin teams
  const { data: techCenterTeams = [], isLoading: techCenterTeamsLoading } = useQuery({
    queryKey: ['tech-center-admin-teams'],
    queryFn: async () => {
      const response = await fetch('/api/tech-centers/admin-teams');
      if (!response.ok) throw new Error('Failed to fetch tech center admin teams');
      const data = await response.json();
      if (!data.success) throw new Error(data?.error ?? 'Failed');
      return data.techCenters;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchInterval: 3 * 60 * 1000, // Refetch every 3 minutes to keep data fresh
  });

  const isLoading = teamsLoading || directorsLoading || techCenterTeamsLoading;

  const cards = [
    // Director card
    ...(directors.length > 0 ? [{
      id: 'selfless-directors',
      title: 'Selfless Directors',
      body: `${directors.length} director${directors.length !== 1 ? 's' : ''} leading the organization`,
      players: directors.map((d: Director): Player => ({
        id: d.id,
        firstName: d.firstName,
        lastName: d.lastName,
        jerseyNumber: null,
        image: d.profileImageUrl,
        isDirector: true,
      })),
    }] : []),
    // Tech center administration team cards
    ...techCenterTeams.map((tc: any) => {
      const allTeamMembers = [
        ...tc.admins.map((a: any) => ({ ...a, isManager: true })),
        ...tc.teachers.map((t: any) => ({ ...t, isTutor: true })),
      ];

      if (allTeamMembers.length === 0) return null;

      return {
        id: `admin-team-${tc.id}`,
        title: `${tc.name} Administration Team`,
        body: `${tc.admins.length} manager${tc.admins.length !== 1 ? 's' : ''}, ${tc.teachers.length} tutor${tc.teachers.length !== 1 ? 's' : ''}`,
        players: allTeamMembers.map((m: TechCenterAdmin): Player => ({
          id: m.id,
          firstName: m.firstName,
          lastName: m.lastName,
          jerseyNumber: null,
          image: m.profileImageUrl,
          isManager: m.isManager,
          isTutor: m.isTutor,
        })),
      };
    }).filter(Boolean),
    // Football team cards
    ...(teams || []).map((team) => ({
      id: `football-${team.techCenterId}-squad`,
      title: `${team.techCenterName} Football Team Squad`,
      body: `${team.members.length} player${
        team.members.length !== 1 ? 's' : ''
      } on the roster`,
      players: team.members.map<Player>((m) => ({
        id: m.user.id,
        lastName: m.user.lastName,
        jerseyNumber: m.jerseyNumber,
        image: m.user.profileImageUrl,
        isDirector: false,
        position: m.position,
      })),
    })),
  ];

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

      <div className="p-3">
        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25 }}
          >
            <h3
              className={`mb-1 text-[15px] font-semibold leading-snug ${p.title}`}
            >
              {current.title}
            </h3>

            <p className={`mb-2 text-[12px] ${p.body}`}>{current.body}</p>

            {/* Squad panel — fixed height for consistent size across screen sizes */}
            <div
              className={`mb-2 h-[260px] overflow-hidden rounded-md border p-3 sm:h-[100px] ${p.squadBg}`}
            >
              <PlayerGrid players={current.players} dark={inHeader} />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom controls */}
        <div className="mt-2 flex items-center justify-between">
          <span className={`text-[10px] tabular-nums ${p.counter}`}>
            {index + 1} / {total}
          </span>

          {/* Scroll indicator in the middle */}
          {current.players.length > 6 && (
            <div
              className={`flex items-center gap-1 text-[10px] font-medium ${
                inHeader ? 'text-[#AEB4AA]' : 'text-[#6B7268]'
              }`}
            >
              <span>scroll</span>
              <ChevronDown className="h-3 w-3" />
            </div>
          )}

          <div className="flex items-center gap-1">
            <button
              onClick={prev}
              aria-label="Previous"
              className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${p.navBtn}`}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => setIsPaused((x) => !x)}
              aria-label={isPaused ? 'Play' : 'Pause'}
              className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${p.navBtn}`}
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
              className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${p.navBtn}`}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}