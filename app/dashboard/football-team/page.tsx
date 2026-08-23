'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Trophy,
  Shirt,
  Plus,
  X,
  Loader2,
  ArrowLeft,
  Edit2,
  Save,
  Megaphone,
  Package,
  Stethoscope,
  Award,
  UserCog,
  Circle,
  Target,
  Globe,
  Zap,
  User,
  Crown,
  Gamepad2,
  Joystick,
  Sparkles,
  Flame,
} from 'lucide-react';

import {
  useTeam,
  useRegisterForTeam,
  useLeaveTeam,
  useUpdateTeamMembership,
} from '@/hooks/useTeam';

import { useAuth } from '@/lib/hooks/useAuth';

/* eslint-disable @next/next/no-img-element */

interface TeamMember {
  id: string;
  userId: string;
  techCenterId: string;
  teamType: string;
  teamRole: string;
  jerseyNumber: number | null;
  position: string | null;
  isActive: boolean;
  joinedAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl: string | null;
    phoneNumber: string | null;
  };
  techCenter: {
    id: string;
    name: string;
    country: {
      name: string;
    } | null;
  };
}

interface TeamData {
  teamMembers: TeamMember[];
  currentUserMembership: TeamMember | null;
  totalMembers: number;
}

type SportType =
  | 'FOOTBALL'
  | 'VOLLEYBALL'
  | 'NETBALL'
  | 'BASKETBALL'
  | 'ATHLETICS';

type TeamRole =
  | 'PLAYER'
  | 'COACH'
  | 'KIT_MANAGER'
  | 'CHEERLEADER'
  | 'TEAM_MANAGER'
  | 'MEDICAL'
  | 'REFEREE';

interface SportConfig {
  icon: React.ComponentType<{ className?: string }>;
  name: string;
  description: string;
  positions: string[];
}

interface RoleConfig {
  icon: React.ComponentType<{ className?: string }>;
  name: string;
  rank: string;
}

/*
|--------------------------------------------------------------------------
| Sport configuration
|--------------------------------------------------------------------------
*/

const sportConfigs: Record<SportType, SportConfig> = {
  FOOTBALL: {
    icon: Trophy,
    name: 'Football',
    description: 'Join the football squad',
    positions: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'],
  },

  VOLLEYBALL: {
    icon: Circle,
    name: 'Volleyball',
    description: 'Join the volleyball squad',
    positions: [
      'Setter',
      'Libero',
      'Outside Hitter',
      'Middle Blocker',
      'Opposite',
    ],
  },

  NETBALL: {
    icon: Target,
    name: 'Netball',
    description: 'Join the netball squad',
    positions: [
      'Goal Shooter',
      'Goal Attack',
      'Wing Attack',
      'Center',
      'Wing Defense',
      'Goal Defense',
    ],
  },

  BASKETBALL: {
    icon: Globe,
    name: 'Basketball',
    description: 'Join the basketball squad',
    positions: [
      'Point Guard',
      'Shooting Guard',
      'Small Forward',
      'Power Forward',
      'Center',
    ],
  },

  ATHLETICS: {
    icon: Zap,
    name: 'Athletics',
    description: 'Join track and field',
    positions: [
      'Sprinter',
      'Distance Runner',
      'Jumper',
      'Thrower',
      'Hurdler',
      'Relay Runner',
    ],
  },
};

/*
|--------------------------------------------------------------------------
| Team roles
|--------------------------------------------------------------------------
*/

const roleConfigs: Record<TeamRole, RoleConfig> = {
  PLAYER: {
    icon: Users,
    name: 'Player',
    rank: 'Player',
  },

  COACH: {
    icon: Trophy,
    name: 'Coach',
    rank: 'Coach',
  },

  KIT_MANAGER: {
    icon: Package,
    name: 'Kit Manager',
    rank: 'Staff',
  },

  CHEERLEADER: {
    icon: Megaphone,
    name: 'Cheerleader',
    rank: 'Support',
  },

  TEAM_MANAGER: {
    icon: UserCog,
    name: 'Team Manager',
    rank: 'Management',
  },

  MEDICAL: {
    icon: Stethoscope,
    name: 'Medical Staff',
    rank: 'Medical',
  },

  REFEREE: {
    icon: Award,
    name: 'Referee',
    rank: 'Official',
  },
};

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function FootballTeamPage() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [jerseyNumber, setJerseyNumber] = useState('');
  const [position, setPosition] = useState('');

  const [showJoinForm, setShowJoinForm] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editJerseyNumber, setEditJerseyNumber] = useState('');
  const [editPosition, setEditPosition] = useState('');

  const [selectedRole, setSelectedRole] =
    useState<TeamRole>('PLAYER');

  const [selectedSport, setSelectedSport] =
    useState<SportType>('FOOTBALL');

  const [showProfileModal, setShowProfileModal] = useState(false);

  const [selectedMember, setSelectedMember] =
    useState<TeamMember | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  const techCenterId = user?.techCenterId || null;

  /*
  |--------------------------------------------------------------------------
  | Team data
  |--------------------------------------------------------------------------
  */

  const {
    data,
    isLoading,
    error,
  } = useTeam(techCenterId, selectedSport) as {
    data: TeamData | null | undefined;
    isLoading: boolean;
    error: Error | null;
  };

  const registerMutation = useRegisterForTeam();
  const leaveMutation = useLeaveTeam();
  const updateMutation = useUpdateTeamMembership();

  /*
  |--------------------------------------------------------------------------
  | Preload sport data
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!techCenterId) return;

    const sports: SportType[] = [
      'FOOTBALL',
      'VOLLEYBALL',
      'NETBALL',
      'BASKETBALL',
      'ATHLETICS',
    ];

    sports.forEach((sport) => {
      queryClient.prefetchQuery({
        queryKey: ['team', techCenterId, sport],
        queryFn: async () => {
          const response = await fetch(
            `/api/team/${techCenterId}/${sport}`
          );

          if (!response.ok) {
            throw new Error('Failed to load team data');
          }

          return response.json() as Promise<TeamData>;
        },
        staleTime: 10 * 60 * 1000,
      });
    });
  }, [techCenterId, queryClient]);

  /*
  |--------------------------------------------------------------------------
  | Video playback
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    video.muted = true;

    const playVideo = async () => {
      try {
        await video.play();
      } catch (videoError) {
        console.warn('Video autoplay failed:', videoError);
      }
    };

    playVideo();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        playVideo();
      }
    };

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      );
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Derived data
  |--------------------------------------------------------------------------
  */

  const teamMembers = data?.teamMembers ?? [];

  const currentUserMembership =
    data?.currentUserMembership ?? null;

  const totalMembers = data?.totalMembers ?? teamMembers.length;

  const currentSportConfig =
    sportConfigs[selectedSport];

  const techCenterName =
    teamMembers[0]?.techCenter?.name ||
    'Tech Center';

  /*
  |--------------------------------------------------------------------------
  | Helpers
  |--------------------------------------------------------------------------
  */

  const getInitials = (
    firstName: string,
    lastName: string
  ) => {
    return `${firstName.charAt(0)}${lastName.charAt(
      0
    )}`.toUpperCase();
  };

  const getRoleConfig = (role: string) => {
    return roleConfigs[role as TeamRole] ?? roleConfigs.PLAYER;
  };

  const getRoleAccent = (role: string) => {
    switch (role) {
      case 'COACH':
        return 'text-amber-300 border-amber-300/40 bg-amber-300/5';

      case 'KIT_MANAGER':
        return 'text-orange-300 border-orange-300/40 bg-orange-300/5';

      case 'CHEERLEADER':
        return 'text-pink-300 border-pink-300/40 bg-pink-300/5';

      case 'TEAM_MANAGER':
        return 'text-cyan-300 border-cyan-300/40 bg-cyan-300/5';

      case 'MEDICAL':
        return 'text-red-300 border-red-300/40 bg-red-300/5';

      case 'REFEREE':
        return 'text-slate-200 border-slate-200/40 bg-slate-200/5';

      default:
        return 'text-emerald-300 border-emerald-300/40 bg-emerald-300/5';
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Join team
  |--------------------------------------------------------------------------
  */

  const handleJoinTeam = async () => {
    if (!techCenterId || !jerseyNumber || !position) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await registerMutation.mutateAsync({
        techCenterId,
        teamType: selectedSport,
        teamRole: selectedRole,
        jerseyNumber: parseInt(jerseyNumber, 10),
        position,
      });

      setShowJoinForm(false);
      setJerseyNumber('');
      setPosition('');
      setSelectedRole('PLAYER');
    } catch (joinError) {
      console.error(
        'Failed to join team:',
        joinError
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Leave team
  |--------------------------------------------------------------------------
  */

  const handleLeaveTeam = async (teamId: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to leave this team?'
    );

    if (!confirmed) return;

    try {
      await leaveMutation.mutateAsync(teamId);
    } catch (leaveError) {
      console.error(
        'Failed to leave team:',
        leaveError
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Edit membership
  |--------------------------------------------------------------------------
  */

  const handleEditMembership = () => {
    if (!currentUserMembership) return;

    setEditJerseyNumber(
      currentUserMembership.jerseyNumber?.toString() || ''
    );

    setEditPosition(
      currentUserMembership.position || ''
    );

    setSelectedRole(
      (currentUserMembership.teamRole as TeamRole) ||
        'PLAYER'
    );

    setIsEditing(true);
  };

  const handleUpdateMembership = async () => {
    if (
      !currentUserMembership ||
      !editJerseyNumber ||
      !editPosition
    ) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        teamId: currentUserMembership.id,
        jerseyNumber: parseInt(
          editJerseyNumber,
          10
        ),
        position: editPosition,
      });

      setIsEditing(false);
      setEditJerseyNumber('');
      setEditPosition('');
    } catch (updateError) {
      console.error(
        'Failed to update team membership:',
        updateError
      );
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditJerseyNumber('');
    setEditPosition('');
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#07110c] text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="h-10 w-56 rounded-lg bg-white/10 animate-pulse mb-8" />

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
            {Array.from({ length: 5 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-20 rounded-xl bg-white/5 border border-white/10 animate-pulse"
                />
              )
            )}
          </div>

          <div className="space-y-4">
            {Array.from({ length: 6 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-24 rounded-2xl bg-white/5 border border-white/10 animate-pulse"
                />
              )
            )}
          </div>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#07110c] px-6">
        <div className="w-full max-w-md rounded-2xl border border-red-400/20 bg-black/60 p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-400/10">
            <X className="h-7 w-7 text-red-300" />
          </div>

          <h1 className="text-xl font-semibold text-white">
            Unable to load team
          </h1>

          <p className="mt-2 text-sm text-white/60">
            We could not load the selected sport team.
            Please try again.
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-[#07110c] transition hover:bg-emerald-300"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Page
  |--------------------------------------------------------------------------
  */

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#07110c] text-white">
      {/* ---------------------------------------------------------------
          VIDEO BACKGROUND
      ---------------------------------------------------------------- */}

      <div className="fixed inset-0 z-0 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-75"
        >
          <source
            src="/football-video.mp4"
            type="video/mp4"
          />
        </video>

        {/* Light readability layer instead of the old heavy black overlay */}
        <div className="absolute inset-0 bg-[#07110c]/35" />

        {/* Slight top protection for header */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/45 to-transparent" />

        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-[#07110c] via-[#07110c]/65 to-transparent" />
      </div>

      {/* ---------------------------------------------------------------
          CONTENT
      ---------------------------------------------------------------- */}

      <div className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-5 sm:px-6 lg:px-8">
          {/* -------------------------------------------------------------
              HEADER
          -------------------------------------------------------------- */}

          <header className="mb-8 flex items-center justify-between">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <button
                onClick={() => router.back()}
                aria-label="Go back"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white backdrop-blur-md transition hover:border-emerald-300/50 hover:bg-black/50"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <div className="hidden h-8 w-px bg-white/15 sm:block" />

              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-300/30 bg-black/30 backdrop-blur-md">
                  {React.createElement(
                    currentSportConfig.icon,
                    {
                      className:
                        'h-5 w-5 text-emerald-300',
                    }
                  )}
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-xl font-bold tracking-tight text-white sm:text-2xl">
                    {currentSportConfig.name}
                  </h1>

                  <p className="truncate text-sm text-white/60">
                    {techCenterName} • Squad {totalMembers}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile */}
            <button
              onClick={() =>
                setShowProfileModal(true)
              }
              aria-label="Open profile"
              className="relative shrink-0"
            >
              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  {user?.firstName && (
                    <p className="text-sm font-semibold text-white">
                      {user.firstName} {user.lastName}
                    </p>
                  )}
                  <p className="text-xs text-white/50">
                    {user?.email}
                  </p>
                </div>

                <div className="h-11 w-11 overflow-hidden rounded-full border border-white/25 bg-black/40 backdrop-blur-md transition hover:border-emerald-300/60 sm:h-12 sm:w-12">
                  {user?.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <User className="h-5 w-5 text-white/80" />
                    </div>
                  )}
                </div>

                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#07110c] bg-emerald-400" />
              </div>
            </button>
          </header>

          {/* -------------------------------------------------------------
              STICKY SPORT NAVIGATION
          -------------------------------------------------------------- */}

          <div className="sticky top-0 z-40 -mx-4 mb-8 border-b border-white/10 bg-[#07110c]/80 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="mb-3 flex items-center gap-2">
              <Gamepad2 className="h-4 w-4 text-emerald-300" />

              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
                Select sport
              </span>

              <div className="h-px flex-1 bg-white/10" />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {(
                Object.entries(
                  sportConfigs
                ) as [
                  SportType,
                  SportConfig
                ][]
              ).map(
                ([sport, config]) => {
                  const Icon = config.icon;
                  const isSelected =
                    selectedSport === sport;

                  return (
                    <button
                      key={sport}
                      onClick={() => {
                        setSelectedSport(sport);
                        setShowJoinForm(false);
                        setIsEditing(false);
                      }}
                      className={`
                        flex min-w-[116px] shrink-0
                        items-center justify-center gap-2
                        rounded-xl border px-4 py-3
                        text-sm font-medium
                        transition-all duration-200
                        ${
                          isSelected
                            ? 'border-emerald-300/60 bg-emerald-400/15 text-emerald-200 shadow-sm'
                            : 'border-white/10 bg-black/20 text-white/65 hover:border-white/25 hover:bg-white/5 hover:text-white'
                        }
                      `}
                    >
                      <Icon className="h-4 w-4" />

                      <span>
                        {config.name}
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* -------------------------------------------------------------
              SPORT INTRO
          -------------------------------------------------------------- */}

          <section className="mb-7">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />

                <span className="text-xs font-medium uppercase tracking-wider text-white/65">
                  {currentSportConfig.name}
                </span>
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {user?.firstName ? `Welcome, ${user.firstName}!` : `${currentSportConfig.name} Team`}
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-white/65 sm:text-base">
                {currentSportConfig.description}.
                Browse the members of the{' '}
                {techCenterName} squad below.
              </p>
            </div>
          </section>

          {/* -------------------------------------------------------------
              SIMPLE STATS
          -------------------------------------------------------------- */}

          <section className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-md">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10">
                <Users className="h-4 w-4 text-emerald-300" />
              </div>

              <p className="text-2xl font-bold text-white">
                {totalMembers}
              </p>

              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-white/45">
                Squad members
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-md">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10">
                <Shirt className="h-4 w-4 text-cyan-300" />
              </div>

              <p className="text-2xl font-bold text-white">
                {
                  teamMembers.filter(
                    (member) =>
                      member.teamRole ===
                      'PLAYER'
                  ).length
                }
              </p>

              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-white/45">
                Players
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-md">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/10">
                <Crown className="h-4 w-4 text-amber-300" />
              </div>

              <p className="text-2xl font-bold text-white">
                {
                  teamMembers.filter(
                    (member) =>
                      member.teamRole ===
                      'COACH'
                  ).length
                }
              </p>

              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-white/45">
                Coaches
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-md">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-violet-400/10">
                <Sparkles className="h-4 w-4 text-violet-300" />
              </div>

              <p className="text-2xl font-bold text-white">
                {
                  teamMembers.filter(
                    (member) =>
                      member.isActive
                  ).length
                }
              </p>

              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-white/45">
                Active
              </p>
            </div>
          </section>

          {/* -------------------------------------------------------------
              MULTI-SPORT INFORMATION
          -------------------------------------------------------------- */}

          <div className="mb-7 rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-md sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10">
                <Joystick className="h-5 w-5 text-emerald-300" />
              </div>

              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-white">
                  Multi-sport teams
                </h3>

                <p className="mt-1 text-sm leading-6 text-white/55">
                  Students can participate in
                  different sports. Use the sport
                  categories above to view each
                  squad.
                </p>
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------
              CURRENT MEMBERSHIP
          -------------------------------------------------------------- */}

          <section className="mb-8">
            {currentUserMembership &&
            currentUserMembership.teamType ===
              selectedSport ? (
              <div className="rounded-2xl border border-emerald-300/20 bg-black/30 p-5 backdrop-blur-md">
                {!isEditing ? (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10">
                        <Users className="h-5 w-5 text-emerald-300" />
                      </div>

                      <div>
                        <p className="font-semibold text-white">
                          You are on this team
                        </p>

                        <p className="mt-1 text-sm text-white/55">
                          {getRoleConfig(
                            currentUserMembership.teamRole
                          ).name}{' '}
                          • #
                          {
                            currentUserMembership.jerseyNumber
                          }{' '}
                          •{' '}
                          {
                            currentUserMembership.position
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex w-full gap-2 sm:w-auto">
                      <button
                        onClick={
                          handleEditMembership
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:border-emerald-300/40 hover:bg-white/10 sm:flex-none"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleLeaveTeam(
                            currentUserMembership.id
                          )
                        }
                        disabled={
                          leaveMutation.isPending
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-300/20 bg-red-400/5 px-4 py-2.5 text-sm font-medium text-red-200 transition hover:bg-red-400/10 disabled:opacity-50 sm:flex-none"
                      >
                        {leaveMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}

                        Leave
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10">
                        <Edit2 className="h-5 w-5 text-emerald-300" />
                      </div>

                      <div>
                        <h3 className="font-semibold text-white">
                          Edit your team details
                        </h3>

                        <p className="text-sm text-white/50">
                          Update your jersey number
                          or position.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-white/65">
                          Jersey number
                        </label>

                        <input
                          type="number"
                          value={
                            editJerseyNumber
                          }
                          onChange={(event) =>
                            setEditJerseyNumber(
                              event.target.value
                            )
                          }
                          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-emerald-300/50"
                          placeholder="e.g. 10"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-white/65">
                          Position
                        </label>

                        <select
                          value={editPosition}
                          onChange={(event) =>
                            setEditPosition(
                              event.target.value
                            )
                          }
                          className="w-full rounded-xl border border-white/10 bg-[#0b1711] px-4 py-3 text-white outline-none transition focus:border-emerald-300/50"
                        >
                          <option value="">
                            Select position
                          </option>

                          {currentSportConfig.positions.map(
                            (sportPosition) => (
                              <option
                                key={
                                  sportPosition
                                }
                                value={
                                  sportPosition
                                }
                              >
                                {
                                  sportPosition
                                }
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={
                          handleUpdateMembership
                        }
                        disabled={
                          updateMutation.isPending
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-[#07110c] transition hover:bg-emerald-300 disabled:opacity-50"
                      >
                        {updateMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}

                        Save changes
                      </button>

                      <button
                        onClick={
                          handleCancelEdit
                        }
                        className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white/75 transition hover:bg-white/10"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() =>
                  setShowJoinForm(
                    (current) => !current
                  )
                }
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-4 font-semibold text-[#07110c] shadow-lg shadow-emerald-950/20 transition hover:bg-emerald-300"
              >
                <Plus className="h-5 w-5" />
                Join {currentSportConfig.name}{' '}
                team
              </button>
            )}
          </section>

          {/* -------------------------------------------------------------
              JOIN FORM
          -------------------------------------------------------------- */}

          <AnimatePresence>
            {showJoinForm &&
              !currentUserMembership && (
                <motion.section
                  initial={{
                    opacity: 0,
                    height: 0,
                    y: -10,
                  }}
                  animate={{
                    opacity: 1,
                    height: 'auto',
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                    y: -10,
                  }}
                  className="mb-8 overflow-hidden"
                >
                  <div className="rounded-2xl border border-white/10 bg-black/35 p-5 backdrop-blur-md sm:p-6">
                    <div className="mb-5">
                      <h3 className="text-lg font-semibold text-white">
                        Join{' '}
                        {
                          currentSportConfig.name
                        }
                      </h3>

                      <p className="mt-1 text-sm text-white/50">
                        Add your team details
                        below.
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-white/65">
                          Role
                        </label>

                        <select
                          value={selectedRole}
                          onChange={(event) =>
                            setSelectedRole(
                              event.target
                                .value as TeamRole
                            )
                          }
                          className="w-full rounded-xl border border-white/10 bg-[#0b1711] px-4 py-3 text-white outline-none focus:border-emerald-300/50"
                        >
                          {(
                            Object.entries(
                              roleConfigs
                            ) as [
                              TeamRole,
                              RoleConfig
                            ][]
                          ).map(
                            ([
                              role,
                              config,
                            ]) => (
                              <option
                                key={role}
                                value={role}
                              >
                                {config.name}
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-white/65">
                          Jersey number
                        </label>

                        <input
                          type="number"
                          value={jerseyNumber}
                          onChange={(event) =>
                            setJerseyNumber(
                              event.target.value
                            )
                          }
                          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-emerald-300/50"
                          placeholder="e.g. 10"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-white/65">
                          Position
                        </label>

                        <select
                          value={position}
                          onChange={(event) =>
                            setPosition(
                              event.target.value
                            )
                          }
                          className="w-full rounded-xl border border-white/10 bg-[#0b1711] px-4 py-3 text-white outline-none focus:border-emerald-300/50"
                        >
                          <option value="">
                            Select position
                          </option>

                          {currentSportConfig.positions.map(
                            (sportPosition) => (
                              <option
                                key={
                                  sportPosition
                                }
                                value={
                                  sportPosition
                                }
                              >
                                {
                                  sportPosition
                                }
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    </div>

                    <div className="mt-5 flex gap-3">
                      <button
                        onClick={
                          handleJoinTeam
                        }
                        disabled={
                          registerMutation.isPending
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 font-semibold text-[#07110c] transition hover:bg-emerald-300 disabled:opacity-50"
                      >
                        {registerMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}

                        Join team
                      </button>

                      <button
                        onClick={() =>
                          setShowJoinForm(
                            false
                          )
                        }
                        className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white/75 transition hover:bg-white/10"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.section>
              )}
          </AnimatePresence>

          {/* -------------------------------------------------------------
              TEAM MEMBER LIST
          -------------------------------------------------------------- */}

          <section>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <h2 className="text-xl font-bold text-white sm:text-2xl">
                  {currentSportConfig.name}{' '}
                  squad
                </h2>

                <p className="mt-1 text-sm text-white/50">
                  {totalMembers}{' '}
                  {totalMembers === 1
                    ? 'member'
                    : 'members'}
                </p>
              </div>
            </div>

            {teamMembers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 px-6 py-14 text-center backdrop-blur-md">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
                  <Users className="h-6 w-6 text-white/40" />
                </div>

                <h3 className="text-lg font-semibold text-white">
                  No team members yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/45">
                  There are currently no members
                  registered for this sport at{' '}
                  {techCenterName}.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {teamMembers.map(
                  (member, index) => {
                    const memberRole =
                      getRoleConfig(
                        member.teamRole
                      );

                    const roleAccent =
                      getRoleAccent(
                        member.teamRole
                      );

                    const RoleIcon =
                      memberRole.icon;

                    return (
                      <motion.button
                        key={member.id}
                        type="button"
                        initial={{
                          opacity: 0,
                          y: 12,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          duration: 0.25,
                          delay:
                            Math.min(
                              index * 0.025,
                              0.3
                            ),
                        }}
                        onClick={() =>
                          setSelectedMember(
                            member
                          )
                        }
                        className="group w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-left backdrop-blur-md transition duration-200 hover:border-white/20 hover:bg-black/40 sm:p-5"
                      >
                        <div className="flex items-center gap-3 sm:gap-4">
                          {/* Number */}
                          <div className="hidden w-7 shrink-0 text-center text-xs font-medium text-white/25 sm:block">
                            {String(
                              index + 1
                            ).padStart(2, '0')}
                          </div>

                          {/* Avatar */}
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-white/15 bg-white/5 sm:h-16 sm:w-16">
                            {member.user
                              .profileImageUrl ? (
                              <img
                                src={
                                  member.user
                                    .profileImageUrl
                                }
                                alt={`${member.user.firstName} ${member.user.lastName}`}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <span className="text-sm font-bold text-white/75">
                                  {getInitials(
                                    member.user
                                      .firstName,
                                    member.user
                                      .lastName
                                  )}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Member information */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="truncate text-base font-semibold text-white sm:text-lg">
                                {
                                  member
                                    .user
                                    .firstName
                                }{' '}
                                {
                                  member
                                    .user
                                    .lastName
                                }
                              </h3>

                              {member.isActive && (
                                <span className="hidden shrink-0 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300 sm:inline">
                                  Active
                                </span>
                              )}
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/50">
                              <span>
                                #
                                {member.jerseyNumber ??
                                  '—'}
                              </span>

                              <span className="text-white/20">
                                •
                              </span>

                              <span className="truncate">
                                {member.position ||
                                  'Team member'}
                              </span>
                            </div>

                            <div className="mt-2 flex items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-medium ${roleAccent}`}
                              >
                                <RoleIcon className="h-3 w-3" />
                                {
                                  memberRole.name
                                }
                              </span>

                              {member.isActive && (
                                <span className="inline-flex rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] font-medium text-emerald-300 sm:hidden">
                                  Active
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Right side */}
                          <div className="flex shrink-0 items-center gap-2">
                            <Flame className="hidden h-5 w-5 text-white/15 transition group-hover:text-emerald-300/60 sm:block" />

                            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 transition group-hover:border-white/20">
                              <ArrowLeft className="h-4 w-4 rotate-180 text-white/35 transition group-hover:text-white/70" />
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  }
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* ---------------------------------------------------------------
          PROFILE MODAL
      ---------------------------------------------------------------- */}

      <AnimatePresence>
        {showProfileModal && user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
            onClick={() =>
              setShowProfileModal(false)
            }
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.96,
                y: 15,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
                y: 15,
              }}
              onClick={(event) =>
                event.stopPropagation()
              }
              className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0b1711] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <h2 className="font-semibold text-white">
                    Profile
                  </h2>

                  <p className="text-xs text-white/40">
                    Team information
                  </p>
                </div>

                <button
                  onClick={() =>
                    setShowProfileModal(
                      false
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-24 w-24 overflow-hidden rounded-full border border-white/15 bg-white/5">
                    {user.profileImageUrl ? (
                      <img
                        src={
                          user.profileImageUrl
                        }
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <User className="h-10 w-10 text-white/50" />
                      </div>
                    )}
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-white">
                    {user.firstName}{' '}
                    {user.lastName}
                  </h3>

                  <p className="mt-1 text-sm text-white/50">
                    {user.email}
                  </p>

                  {user.phoneNumber && (
                    <p className="mt-1 text-xs text-white/35">
                      {user.phoneNumber}
                    </p>
                  )}
                </div>

                <div className="mt-7 border-t border-white/10 pt-5">
                  <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
                    Current team
                  </h4>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/50">
                        Sport
                      </span>

                      <span className="text-sm font-medium text-white">
                        {
                          currentSportConfig.name
                        }
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/50">
                        Squad
                      </span>

                      <span className="text-sm font-medium text-white">
                        {techCenterName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/50">
                        Members
                      </span>

                      <span className="text-sm font-medium text-white">
                        {totalMembers}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setShowProfileModal(
                      false
                    )
                  }
                  className="mt-6 w-full rounded-xl bg-emerald-400 px-4 py-3 font-semibold text-[#07110c] transition hover:bg-emerald-300"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------------------------------------------------------
          MEMBER DETAIL MODAL
      ---------------------------------------------------------------- */}

      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
            onClick={() =>
              setSelectedMember(null)
            }
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.96,
                y: 15,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
                y: 15,
              }}
              onClick={(event) =>
                event.stopPropagation()
              }
              className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0b1711] shadow-2xl"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <h2 className="font-semibold text-white">
                    Team member
                  </h2>

                  <p className="text-xs text-white/40">
                    {currentSportConfig.name}
                  </p>
                </div>

                <button
                  onClick={() =>
                    setSelectedMember(null)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-6">
                {/* Avatar */}
                <div className="flex flex-col items-center text-center">
                  <div className="h-24 w-24 overflow-hidden rounded-full border border-white/15 bg-white/5">
                    {selectedMember.user
                      .profileImageUrl ? (
                      <img
                        src={
                          selectedMember
                            .user
                            .profileImageUrl
                        }
                        alt={`${selectedMember.user.firstName} ${selectedMember.user.lastName}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-2xl font-bold text-white/70">
                          {getInitials(
                            selectedMember
                              .user
                              .firstName,
                            selectedMember
                              .user
                              .lastName
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-white">
                    {
                      selectedMember.user
                        .firstName
                    }{' '}
                    {
                      selectedMember.user
                        .lastName
                    }
                  </h3>

                  <p className="mt-1 text-sm text-white/45">
                    {selectedMember.user.email}
                  </p>

                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${getRoleAccent(
                        selectedMember.teamRole
                      )}`}
                    >
                      {
                        getRoleConfig(
                          selectedMember.teamRole
                        ).name
                      }
                    </span>

                    {selectedMember.isActive && (
                      <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                        Active
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="mt-7 space-y-4 border-t border-white/10 pt-5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-white/45">
                      Jersey number
                    </span>

                    <span className="text-sm font-semibold text-white">
                      #
                      {selectedMember.jerseyNumber ??
                        '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-white/45">
                      Position
                    </span>

                    <span className="text-right text-sm font-semibold text-white">
                      {selectedMember.position ||
                        'Not specified'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-white/45">
                      Sport
                    </span>

                    <span className="text-sm font-semibold text-white">
                      {
                        sportConfigs[
                          selectedMember
                            .teamType as SportType
                        ]?.name ||
                        selectedMember.teamType
                      }
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-white/45">
                      Team
                    </span>

                    <span className="max-w-[60%] text-right text-sm font-semibold text-white">
                      {
                        selectedMember
                          .techCenter?.name
                      }
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-white/45">
                      Joined
                    </span>

                    <span className="text-sm font-semibold text-white">
                      {new Date(
                        selectedMember.joinedAt
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setSelectedMember(null)
                  }
                  className="mt-7 w-full rounded-xl bg-emerald-400 px-4 py-3 font-semibold text-[#07110c] transition hover:bg-emerald-300"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}