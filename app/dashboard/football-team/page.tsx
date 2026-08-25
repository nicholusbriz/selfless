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
  PlayCircle,
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
    positions: [
      'Goalkeeper',
      'Defender',
      'Midfielder',
      'Forward',
    ],
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
  const [editJerseyNumber, setEditJerseyNumber] =
    useState('');
  const [editPosition, setEditPosition] = useState('');

  const [selectedRole, setSelectedRole] =
    useState<TeamRole>('PLAYER');

  const [selectedSport, setSelectedSport] =
    useState<SportType>('FOOTBALL');

  const [showProfileModal, setShowProfileModal] =
    useState(false);

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
  | Derived data
  |--------------------------------------------------------------------------
  */

  const teamMembers = data?.teamMembers ?? [];

  const currentUserMembership =
    data?.currentUserMembership ?? null;

  const totalMembers =
    data?.totalMembers ?? teamMembers.length;

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
    return (
      roleConfigs[role as TeamRole] ??
      roleConfigs.PLAYER
    );
  };

  const getRoleAccent = (role: string) => {
    switch (role) {
      case 'COACH':
        return 'text-amber-700 border-amber-200 bg-amber-50';

      case 'KIT_MANAGER':
        return 'text-orange-700 border-orange-200 bg-orange-50';

      case 'CHEERLEADER':
        return 'text-pink-700 border-pink-200 bg-pink-50';

      case 'TEAM_MANAGER':
        return 'text-cyan-700 border-cyan-200 bg-cyan-50';

      case 'MEDICAL':
        return 'text-red-700 border-red-200 bg-red-50';

      case 'REFEREE':
        return 'text-slate-700 border-slate-200 bg-slate-50';

      default:
        return 'text-emerald-700 border-emerald-200 bg-emerald-50';
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
      currentUserMembership.jerseyNumber?.toString() ||
        ''
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
      <main className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 h-10 w-56 animate-pulse rounded-lg bg-slate-200" />

          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-16 animate-pulse rounded-xl border border-slate-200 bg-white"
                />
              )
            )}
          </div>

          <div className="space-y-4">
            {Array.from({ length: 6 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white"
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
      <main className="flex min-h-screen items-center justify-center overflow-x-hidden bg-slate-50 px-6">
        <div className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <X className="h-7 w-7 text-red-600" />
          </div>

          <h1 className="text-xl font-bold text-slate-900">
            Unable to load team
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            We could not load the selected sport team.
            Please try again.
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-[#1a365d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#153475]"
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
    <div className="min-h-screen overflow-x-hidden bg-[#f6f8fb] text-slate-900">
      <div className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-5 sm:px-6 lg:px-8">
          {/* -------------------------------------------------------------
              HEADER
          -------------------------------------------------------------- */}

          <header className="mb-7 flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <button
                onClick={() => router.back()}
                aria-label="Go back"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <div className="hidden h-8 w-px bg-slate-200 sm:block" />

              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1a365d] shadow-sm">
                  {React.createElement(
                    currentSportConfig.icon,
                    {
                      className:
                        'h-5 w-5 text-white',
                    }
                  )}
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-xl font-bold tracking-tight text-[#1a365d] sm:text-2xl">
                    {currentSportConfig.name}
                  </h1>

                  <p className="truncate text-sm text-slate-500">
                    {techCenterName} • Squad{' '}
                    {totalMembers}
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
                    <p className="text-sm font-semibold text-slate-800">
                      {user.firstName}{' '}
                      {user.lastName}
                    </p>
                  )}

                  <p className="max-w-[220px] truncate text-xs text-slate-400">
                    {user?.email}
                  </p>
                </div>

                <div className="h-11 w-11 overflow-hidden rounded-full border-2 border-white bg-slate-100 shadow-sm sm:h-12 sm:w-12">
                  {user?.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <User className="h-5 w-5 text-slate-500" />
                    </div>
                  )}
                </div>

                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
              </div>
            </button>
          </header>

          {/* -------------------------------------------------------------
              SPORT NAVIGATION
          -------------------------------------------------------------- */}

          <section className="mb-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                <Gamepad2 className="h-4 w-4 text-[#1a365d]" />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900">
                  Select sport
                </p>

                <p className="text-xs text-slate-400">
                  View your tech center's teams
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {(
                Object.entries(
                  sportConfigs
                ) as [SportType, SportConfig][]
              ).map(([sport, config]) => {
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
                      flex min-w-0 items-center justify-center gap-2
                      rounded-xl border px-3 py-3
                      text-sm font-semibold
                      transition-all duration-200
                      ${
                        isSelected
                          ? 'border-[#1a365d] bg-[#1a365d] text-white shadow-md shadow-blue-100'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-[#1a365d]'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4 shrink-0" />

                    <span className="truncate">
                      {config.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* -------------------------------------------------------------
              INTRO
          -------------------------------------------------------------- */}

          <section className="mb-7">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />

                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    {currentSportConfig.name}
                  </span>
                </div>

                <h2 className="text-3xl font-bold tracking-tight text-[#1a365d] sm:text-4xl">
                  {user?.firstName
                    ? `Welcome, ${user.firstName}!`
                    : `${currentSportConfig.name} Team`}
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                  {currentSportConfig.description}.
                  Browse the members of the{' '}
                  {techCenterName} squad below.
                </p>
              </div>
            </div>
          </section>

          {/* -------------------------------------------------------------
              TEAM VIDEO
          -------------------------------------------------------------- */}

          <section className="mb-7">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                    <PlayCircle className="h-5 w-5 text-[#1a365d]" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-slate-900">
                      Team Preview
                    </h2>

                    <p className="truncate text-sm text-slate-500">
                      Watch the team video whenever
                      you want.
                    </p>
                  </div>
                </div>

                <span className="hidden shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#1a365d] sm:inline-flex">
                  Team Video
                </span>
              </div>

              <div className="bg-slate-950">
                <video
                  ref={videoRef}
                  controls
                  playsInline
                  preload="metadata"
                  className="aspect-video max-h-[520px] w-full object-cover"
                >
                  <source
                    src="/football-video.mp4"
                    type="video/mp4"
                  />

                  Your browser does not support
                  the video player.
                </video>
              </div>

              <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {currentSportConfig.name}
                  </p>

                  <p className="text-xs text-slate-500">
                    {techCenterName} • Team highlights
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <PlayCircle className="h-4 w-4" />
                  <span>
                    Use the controls to play or pause
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* -------------------------------------------------------------
              STATS
          -------------------------------------------------------------- */}

          <section className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
                <Users className="h-4 w-4 text-emerald-600" />
              </div>

              <p className="text-2xl font-bold text-[#1a365d]">
                {totalMembers}
              </p>

              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                Squad members
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                <Shirt className="h-4 w-4 text-blue-600" />
              </div>

              <p className="text-2xl font-bold text-[#1a365d]">
                {
                  teamMembers.filter(
                    (member) =>
                      member.teamRole ===
                      'PLAYER'
                  ).length
                }
              </p>

              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                Players
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
                <Crown className="h-4 w-4 text-amber-600" />
              </div>

              <p className="text-2xl font-bold text-[#1a365d]">
                {
                  teamMembers.filter(
                    (member) =>
                      member.teamRole ===
                      'COACH'
                  ).length
                }
              </p>

              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                Coaches
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50">
                <Sparkles className="h-4 w-4 text-violet-600" />
              </div>

              <p className="text-2xl font-bold text-[#1a365d]">
                {
                  teamMembers.filter(
                    (member) =>
                      member.isActive
                  ).length
                }
              </p>

              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                Active
              </p>
            </div>
          </section>

          {/* -------------------------------------------------------------
              MULTI-SPORT INFORMATION
          -------------------------------------------------------------- */}

          <div className="mb-7 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                <Joystick className="h-5 w-5 text-[#1a365d]" />
              </div>

              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[#1a365d]">
                  Multi-sport teams
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-600">
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
              <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
                {!isEditing ? (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                        <Users className="h-5 w-5 text-emerald-600" />
                      </div>

                      <div>
                        <p className="font-bold text-slate-900">
                          You are on this team
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {
                            getRoleConfig(
                              currentUserMembership.teamRole
                            ).name
                          }{' '}
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
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#1a365d] sm:flex-none"
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
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50 sm:flex-none"
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
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                        <Edit2 className="h-5 w-5 text-[#1a365d]" />
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900">
                          Edit your team details
                        </h3>

                        <p className="text-sm text-slate-500">
                          Update your jersey number
                          or position.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
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
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                          placeholder="e.g. 10"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Position
                        </label>

                        <select
                          value={editPosition}
                          onChange={(event) =>
                            setEditPosition(
                              event.target.value
                            )
                          }
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
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
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1a365d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#153475] disabled:opacity-50"
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
                        className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
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
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1a365d] px-5 py-4 font-semibold text-white shadow-lg shadow-blue-100 transition hover:bg-[#153475]"
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
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-5">
                      <h3 className="text-lg font-bold text-[#1a365d]">
                        Join{' '}
                        {
                          currentSportConfig.name
                        }
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Add your team details
                        below.
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
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
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
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
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
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
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-300 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                          placeholder="e.g. 10"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Position
                        </label>

                        <select
                          value={position}
                          onChange={(event) =>
                            setPosition(
                              event.target.value
                            )
                          }
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
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
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1a365d] px-5 py-3 font-semibold text-white transition hover:bg-[#153475] disabled:opacity-50"
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
                        className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
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
                <h2 className="text-xl font-bold text-[#1a365d] sm:text-2xl">
                  {currentSportConfig.name}{' '}
                  squad
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {totalMembers}{' '}
                  {totalMembers === 1
                    ? 'member'
                    : 'members'}
                </p>
              </div>
            </div>

            {teamMembers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                  <Users className="h-6 w-6 text-slate-400" />
                </div>

                <h3 className="text-lg font-bold text-slate-900">
                  No team members yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
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
                          delay: Math.min(
                            index * 0.025,
                            0.3
                          ),
                        }}
                        onClick={() =>
                          setSelectedMember(
                            member
                          )
                        }
                        className="group w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition duration-200 hover:border-blue-200 hover:shadow-md sm:p-5"
                      >
                        <div className="flex items-center gap-3 sm:gap-4">
                          {/* Number */}

                          <div className="hidden w-7 shrink-0 text-center text-xs font-bold text-slate-300 sm:block">
                            {String(
                              index + 1
                            ).padStart(2, '0')}
                          </div>

                          {/* Avatar */}

                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-slate-100 bg-slate-50 sm:h-16 sm:w-16">
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
                                <span className="text-sm font-bold text-[#1a365d]">
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
                              <h3 className="truncate text-base font-bold text-slate-900 sm:text-lg">
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
                                <span className="hidden shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 sm:inline">
                                  Active
                                </span>
                              )}
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
                              <span>
                                #
                                {member.jerseyNumber ??
                                  '—'}
                              </span>

                              <span className="text-slate-300">
                                •
                              </span>

                              <span className="truncate">
                                {member.position ||
                                  'Team member'}
                              </span>
                            </div>

                            <div className="mt-2 flex items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold ${roleAccent}`}
                              >
                                <RoleIcon className="h-3 w-3" />
                                {
                                  memberRole.name
                                }
                              </span>

                              {member.isActive && (
                                <span className="inline-flex rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 sm:hidden">
                                  Active
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Right side */}

                          <div className="flex shrink-0 items-center gap-2">
                            <Flame className="hidden h-5 w-5 text-slate-200 transition group-hover:text-emerald-500 sm:block" />

                            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 transition group-hover:border-blue-200 group-hover:bg-blue-50">
                              <ArrowLeft className="h-4 w-4 rotate-180 text-slate-400 transition group-hover:text-[#1a365d]" />
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
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm"
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
              className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="font-bold text-slate-900">
                    Profile
                  </h2>

                  <p className="text-xs text-slate-400">
                    Team information
                  </p>
                </div>

                <button
                  onClick={() =>
                    setShowProfileModal(
                      false
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-slate-100 bg-slate-50">
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
                        <User className="h-10 w-10 text-slate-400" />
                      </div>
                    )}
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-[#1a365d]">
                    {user.firstName}{' '}
                    {user.lastName}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {user.email}
                  </p>

                  {user.phoneNumber && (
                    <p className="mt-1 text-xs text-slate-400">
                      {user.phoneNumber}
                    </p>
                  )}
                </div>

                <div className="mt-7 border-t border-slate-100 pt-5">
                  <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Current team
                  </h4>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">
                        Sport
                      </span>

                      <span className="text-sm font-semibold text-slate-900">
                        {
                          currentSportConfig.name
                        }
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">
                        Squad
                      </span>

                      <span className="text-sm font-semibold text-slate-900">
                        {techCenterName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">
                        Members
                      </span>

                      <span className="text-sm font-semibold text-slate-900">
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
                  className="mt-6 w-full rounded-xl bg-[#1a365d] px-4 py-3 font-semibold text-white transition hover:bg-[#153475]"
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
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm"
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
              className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
            >
              {/* Modal header */}

              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="font-bold text-slate-900">
                    Team member
                  </h2>

                  <p className="text-xs text-slate-400">
                    {currentSportConfig.name}
                  </p>
                </div>

                <button
                  onClick={() =>
                    setSelectedMember(null)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-6">
                {/* Avatar */}

                <div className="flex flex-col items-center text-center">
                  <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-slate-100 bg-slate-50">
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
                        <span className="text-2xl font-bold text-[#1a365d]">
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

                  <h3 className="mt-4 text-xl font-bold text-[#1a365d]">
                    {
                      selectedMember.user
                        .firstName
                    }{' '}
                    {
                      selectedMember.user
                        .lastName
                    }
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedMember.user.email}
                  </p>

                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${getRoleAccent(
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
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Active
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}

                <div className="mt-7 space-y-4 border-t border-slate-100 pt-5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-500">
                      Jersey number
                    </span>

                    <span className="text-sm font-bold text-slate-900">
                      #
                      {selectedMember.jerseyNumber ??
                        '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-500">
                      Position
                    </span>

                    <span className="text-right text-sm font-bold text-slate-900">
                      {selectedMember.position ||
                        'Not specified'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-500">
                      Sport
                    </span>

                    <span className="text-sm font-bold text-slate-900">
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
                    <span className="text-sm text-slate-500">
                      Team
                    </span>

                    <span className="max-w-[60%] text-right text-sm font-bold text-slate-900">
                      {
                        selectedMember
                          .techCenter?.name
                      }
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-500">
                      Joined
                    </span>

                    <span className="text-sm font-bold text-slate-900">
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
                  className="mt-7 w-full rounded-xl bg-[#1a365d] px-4 py-3 font-semibold text-white transition hover:bg-[#153475]"
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