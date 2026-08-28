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
  ChevronRight,
  Calendar,
  Mail,
  Phone,
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
  color: string;
  bgColor: string;
}

interface RoleConfig {
  icon: React.ComponentType<{ className?: string }>;
  name: string;
  rank: string;
}

const sportConfigs: Record<SportType, SportConfig> = {
  FOOTBALL: {
    icon: Trophy,
    name: 'Football',
    description: 'Join the football squad',
    positions: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'],
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
  },
  VOLLEYBALL: {
    icon: Circle,
    name: 'Volleyball',
    description: 'Join the volleyball squad',
    positions: ['Setter', 'Libero', 'Outside Hitter', 'Middle Blocker', 'Opposite'],
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
  },
  NETBALL: {
    icon: Target,
    name: 'Netball',
    description: 'Join the netball squad',
    positions: ['Goal Shooter', 'Goal Attack', 'Wing Attack', 'Center', 'Wing Defense', 'Goal Defense'],
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
  },
  BASKETBALL: {
    icon: Globe,
    name: 'Basketball',
    description: 'Join the basketball squad',
    positions: ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'],
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
  },
  ATHLETICS: {
    icon: Zap,
    name: 'Athletics',
    description: 'Join track and field',
    positions: ['Sprinter', 'Distance Runner', 'Jumper', 'Thrower', 'Hurdler', 'Relay Runner'],
    color: 'text-rose-700',
    bgColor: 'bg-rose-50',
  },
};

const roleConfigs: Record<TeamRole, RoleConfig> = {
  PLAYER: { icon: Users, name: 'Player', rank: 'Player' },
  COACH: { icon: Trophy, name: 'Coach', rank: 'Coach' },
  KIT_MANAGER: { icon: Package, name: 'Kit Manager', rank: 'Staff' },
  CHEERLEADER: { icon: Megaphone, name: 'Cheerleader', rank: 'Support' },
  TEAM_MANAGER: { icon: UserCog, name: 'Team Manager', rank: 'Management' },
  MEDICAL: { icon: Stethoscope, name: 'Medical Staff', rank: 'Medical' },
  REFEREE: { icon: Award, name: 'Referee', rank: 'Official' },
};

export default function FootballTeamPage() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [jerseyNumber, setJerseyNumber] = useState('');
  const [position, setPosition] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editJerseyNumber, setEditJerseyNumber] = useState('');
  const [editPosition, setEditPosition] = useState('');
  const [selectedRole, setSelectedRole] = useState<TeamRole>('PLAYER');
  const [selectedSport, setSelectedSport] = useState<SportType>('FOOTBALL');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const techCenterId = user?.techCenterId || null;

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

  useEffect(() => {
    if (!techCenterId) return;

    const sports: SportType[] = ['FOOTBALL', 'VOLLEYBALL', 'NETBALL', 'BASKETBALL', 'ATHLETICS'];

    sports.forEach((sport) => {
      queryClient.prefetchQuery({
        queryKey: ['team', techCenterId, sport],
        queryFn: async () => {
          const response = await fetch(`/api/team/${techCenterId}/${sport}`);
          if (!response.ok) {
            throw new Error('Failed to load team data');
          }
          return response.json() as Promise<TeamData>;
        },
        staleTime: 10 * 60 * 1000,
      });
    });
  }, [techCenterId, queryClient]);

  const teamMembers = data?.teamMembers ?? [];
  const currentUserMembership = data?.currentUserMembership ?? null;
  const totalMembers = data?.totalMembers ?? teamMembers.length;
  const currentSportConfig = sportConfigs[selectedSport];
  const techCenterName = teamMembers[0]?.techCenter?.name || 'Tech Center';

  const getInitials = (firstName: string, lastName: string) =>
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const getRoleConfig = (role: string) => roleConfigs[role as TeamRole] ?? roleConfigs.PLAYER;

  const getRoleAccent = (role: string) => {
    switch (role) {
      case 'COACH': return 'text-amber-700 border-amber-200 bg-amber-50';
      case 'KIT_MANAGER': return 'text-orange-700 border-orange-200 bg-orange-50';
      case 'CHEERLEADER': return 'text-pink-700 border-pink-200 bg-pink-50';
      case 'TEAM_MANAGER': return 'text-cyan-700 border-cyan-200 bg-cyan-50';
      case 'MEDICAL': return 'text-red-700 border-red-200 bg-red-50';
      case 'REFEREE': return 'text-slate-700 border-slate-200 bg-slate-50';
      default: return 'text-emerald-700 border-emerald-200 bg-emerald-50';
    }
  };

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
      console.error('Failed to join team:', joinError);
    }
  };

  const handleLeaveTeam = async (teamId: string) => {
    if (!window.confirm('Are you sure you want to leave this team?')) return;
    try {
      await leaveMutation.mutateAsync(teamId);
    } catch (leaveError) {
      console.error('Failed to leave team:', leaveError);
    }
  };

  const handleEditMembership = () => {
    if (!currentUserMembership) return;
    setEditJerseyNumber(currentUserMembership.jerseyNumber?.toString() || '');
    setEditPosition(currentUserMembership.position || '');
    setSelectedRole((currentUserMembership.teamRole as TeamRole) || 'PLAYER');
    setIsEditing(true);
  };

  const handleUpdateMembership = async () => {
    if (!currentUserMembership || !editJerseyNumber || !editPosition) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        teamId: currentUserMembership.id,
        jerseyNumber: parseInt(editJerseyNumber, 10),
        position: editPosition,
      });
      setIsEditing(false);
      setEditJerseyNumber('');
      setEditPosition('');
    } catch (updateError) {
      console.error('Failed to update team membership:', updateError);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditJerseyNumber('');
    setEditPosition('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f6f8fb] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#1a365d] border-t-transparent" />
          <p className="text-sm text-slate-500">Loading team...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f6f8fb] flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <X className="h-7 w-7 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Unable to load team</h1>
          <p className="mt-2 text-sm text-slate-500">We could not load the selected sport team. Please try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-[#1a365d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#153475]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        {/* HEADER */}
        <header className="mb-6 flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-[#1a365d]/30 hover:bg-[#f0f4f8] hover:text-[#1a365d]"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="hidden h-8 w-px bg-slate-200 sm:block" />

            <div>
              <h1 className="text-xl font-bold text-[#1a365d] sm:text-2xl">
                {currentSportConfig.name} Team
              </h1>
              <p className="text-sm text-slate-500">{techCenterName} • {totalMembers} members</p>
            </div>
          </div>

          <button
            onClick={() => setShowProfileModal(true)}
            className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm transition hover:border-[#1a365d]/30 hover:bg-[#f0f4f8]"
          >
            <div className="h-8 w-8 overflow-hidden rounded-full bg-slate-100">
              {user?.profileImageUrl ? (
                <img src={user.profileImageUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User className="h-4 w-4 text-slate-500" />
                </div>
              )}
            </div>
            <span className="hidden text-sm font-medium text-slate-700 sm:inline">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </button>
        </header>

        {/* SPORT NAVIGATION */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <Gamepad2 className="h-5 w-5 text-[#1a365d]" />
            <div>
              <p className="text-sm font-bold text-slate-900">Select Sport</p>
              <p className="text-xs text-slate-400">View your tech center's teams</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {(Object.entries(sportConfigs) as [SportType, SportConfig][]).map(([sport, config]) => {
              const Icon = config.icon;
              const isSelected = selectedSport === sport;

              return (
                <button
                  key={sport}
                  onClick={() => {
                    setSelectedSport(sport);
                    setShowJoinForm(false);
                    setIsEditing(false);
                  }}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${
                    isSelected
                      ? 'border-[#1a365d] bg-[#1a365d] text-white shadow-md'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-[#1a365d]/30 hover:bg-[#f0f4f8] hover:text-[#1a365d]'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{config.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* WELCOME SECTION */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1a365d]">
              {React.createElement(currentSportConfig.icon, { className: 'h-6 w-6 text-white' })}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#1a365d]">
                {user?.firstName ? `Welcome, ${user.firstName}!` : `${currentSportConfig.name} Team`}
              </h2>
              <p className="text-sm text-slate-500">
                {currentSportConfig.description}. Browse the {techCenterName} squad below.
              </p>
            </div>
          </div>
        </section>

        {/* VIDEO SECTION */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-3">
            <PlayCircle className="h-5 w-5 text-[#1a365d]" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">Team Preview</h2>
              <p className="text-xs text-slate-500">Watch the team highlights</p>
            </div>
          </div>

          <div className="bg-slate-950">
            <video
              ref={videoRef}
              controls
              playsInline
              preload="metadata"
              className="aspect-video max-h-[400px] w-full object-cover"
            >
              <source src="/football-video.mp4" type="video/mp4" />
              Your browser does not support the video player.
            </video>
          </div>
        </section>

        {/* STATS */}
        <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
              <Users className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-[#1a365d]">{totalMembers}</p>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Members</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
              <Shirt className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-[#1a365d]">
              {teamMembers.filter((m) => m.teamRole === 'PLAYER').length}
            </p>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Players</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
              <Crown className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-[#1a365d]">
              {teamMembers.filter((m) => m.teamRole === 'COACH').length}
            </p>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Coaches</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50">
              <Sparkles className="h-4 w-4 text-violet-600" />
            </div>
            <p className="text-2xl font-bold text-[#1a365d]">
              {teamMembers.filter((m) => m.isActive).length}
            </p>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active</p>
          </div>
        </section>

        {/* CURRENT MEMBERSHIP */}
        <section className="mb-6">
          {currentUserMembership && currentUserMembership.teamType === selectedSport ? (
            <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
              {!isEditing ? (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                      <Users className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">You are on this team</p>
                      <p className="text-sm text-slate-500">
                        {getRoleConfig(currentUserMembership.teamRole).name} • #{currentUserMembership.jerseyNumber} • {currentUserMembership.position}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleEditMembership}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#1a365d]/30 hover:bg-[#f0f4f8] hover:text-[#1a365d]"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleLeaveTeam(currentUserMembership.id)}
                      disabled={leaveMutation.isPending}
                      className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      {leaveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                      Leave
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <Edit2 className="h-5 w-5 text-[#1a365d]" />
                    <div>
                      <h3 className="font-bold text-slate-900">Edit your team details</h3>
                      <p className="text-sm text-slate-500">Update your jersey number or position</p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">Jersey Number</label>
                      <input
                        type="number"
                        value={editJerseyNumber}
                        onChange={(e) => setEditJerseyNumber(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none transition focus:border-[#1a365d] focus:bg-white focus:ring-2 focus:ring-[#1a365d]/10"
                        placeholder="e.g. 10"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">Position</label>
                      <select
                        value={editPosition}
                        onChange={(e) => setEditPosition(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none transition focus:border-[#1a365d] focus:bg-white focus:ring-2 focus:ring-[#1a365d]/10"
                      >
                        <option value="">Select position</option>
                        {currentSportConfig.positions.map((pos) => (
                          <option key={pos} value={pos}>{pos}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={handleUpdateMembership}
                      disabled={updateMutation.isPending}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1a365d] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#153475] disabled:opacity-50"
                    >
                      {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowJoinForm(!showJoinForm)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1a365d] px-5 py-4 font-semibold text-white shadow-md transition hover:bg-[#153475]"
            >
              <Plus className="h-5 w-5" />
              Join {currentSportConfig.name} Team
            </button>
          )}
        </section>

        {/* JOIN FORM */}
        <AnimatePresence>
          {showJoinForm && !currentUserMembership && (
            <motion.section
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="mb-6 overflow-hidden"
            >
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-[#1a365d]">Join {currentSportConfig.name}</h3>
                  <p className="text-sm text-slate-500">Add your team details below</p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Role</label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as TeamRole)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none transition focus:border-[#1a365d] focus:bg-white focus:ring-2 focus:ring-[#1a365d]/10"
                    >
                      {(Object.entries(roleConfigs) as [TeamRole, RoleConfig][]).map(([role, config]) => (
                        <option key={role} value={role}>{config.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Jersey Number</label>
                    <input
                      type="number"
                      value={jerseyNumber}
                      onChange={(e) => setJerseyNumber(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-[#1a365d] focus:bg-white focus:ring-2 focus:ring-[#1a365d]/10"
                      placeholder="e.g. 10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Position</label>
                    <select
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none transition focus:border-[#1a365d] focus:bg-white focus:ring-2 focus:ring-[#1a365d]/10"
                    >
                      <option value="">Select position</option>
                      {currentSportConfig.positions.map((pos) => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={handleJoinTeam}
                    disabled={registerMutation.isPending}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1a365d] px-5 py-2.5 font-semibold text-white transition hover:bg-[#153475] disabled:opacity-50"
                  >
                    {registerMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Join Team
                  </button>
                  <button
                    onClick={() => setShowJoinForm(false)}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* TEAM MEMBERS */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#1a365d]">{currentSportConfig.name} Squad</h2>
              <p className="text-sm text-slate-500">{totalMembers} {totalMembers === 1 ? 'member' : 'members'}</p>
            </div>
          </div>

          {teamMembers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
              <Users className="mx-auto h-10 w-10 text-slate-300" />
              <h3 className="mt-3 text-lg font-bold text-slate-900">No team members yet</h3>
              <p className="mt-1 text-sm text-slate-500">Be the first to join the {techCenterName} squad!</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {teamMembers.map((member, index) => {
                const memberRole = getRoleConfig(member.teamRole);
                const roleAccent = getRoleAccent(member.teamRole);
                const RoleIcon = memberRole.icon;

                return (
                  <motion.button
                    key={member.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
                    onClick={() => setSelectedMember(member)}
                    className="group w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-[#1a365d]/30 hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <span className="hidden w-6 text-center text-xs font-bold text-slate-300 sm:block">
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-slate-100 bg-slate-50 sm:h-14 sm:w-14">
                        {member.user.profileImageUrl ? (
                          <img src={member.user.profileImageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <span className="text-sm font-bold text-[#1a365d]">
                              {getInitials(member.user.firstName, member.user.lastName)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-base font-bold text-slate-900">
                            {member.user.firstName} {member.user.lastName}
                          </h3>
                          {member.isActive && (
                            <span className="hidden shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 sm:inline">
                              Active
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
                          <span>#{member.jerseyNumber ?? '—'}</span>
                          <span className="text-slate-300">•</span>
                          <span>{member.position || 'Team member'}</span>
                        </div>

                        <div className="mt-1.5 flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${roleAccent}`}>
                            <RoleIcon className="h-3 w-3" />
                            {memberRole.name}
                          </span>
                          {member.isActive && (
                            <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 sm:hidden">
                              Active
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronRight className="h-5 w-5 text-slate-300 transition group-hover:text-[#1a365d]" />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* PROFILE MODAL */}
      <AnimatePresence>
        {showProfileModal && user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onClick={() => setShowProfileModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="font-bold text-slate-900">Profile</h2>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-6 text-center">
                <div className="mx-auto h-20 w-20 overflow-hidden rounded-full border-4 border-slate-100 bg-slate-50">
                  {user.profileImageUrl ? (
                    <img src={user.profileImageUrl} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <User className="h-8 w-8 text-slate-400" />
                    </div>
                  )}
                </div>

                <h3 className="mt-3 text-xl font-bold text-[#1a365d]">{user.firstName} {user.lastName}</h3>
                <p className="text-sm text-slate-500">{user.email}</p>
                {user.phoneNumber && <p className="text-xs text-slate-400 mt-1">{user.phoneNumber}</p>}

                <div className="mt-5 border-t border-slate-100 pt-4 text-left">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Current Team</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Sport</span>
                      <span className="text-sm font-semibold text-slate-900">{currentSportConfig.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Squad</span>
                      <span className="text-sm font-semibold text-slate-900">{techCenterName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Members</span>
                      <span className="text-sm font-semibold text-slate-900">{totalMembers}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowProfileModal(false)}
                  className="mt-5 w-full rounded-xl bg-[#1a365d] px-4 py-2.5 font-semibold text-white transition hover:bg-[#153475]"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MEMBER DETAIL MODAL */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onClick={() => setSelectedMember(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="font-bold text-slate-900">Team Member</h2>
                  <p className="text-xs text-slate-400">{currentSportConfig.name}</p>
                </div>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-6 text-center">
                <div className="mx-auto h-20 w-20 overflow-hidden rounded-full border-4 border-slate-100 bg-slate-50">
                  {selectedMember.user.profileImageUrl ? (
                    <img src={selectedMember.user.profileImageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="text-2xl font-bold text-[#1a365d]">
                        {getInitials(selectedMember.user.firstName, selectedMember.user.lastName)}
                      </span>
                    </div>
                  )}
                </div>

                <h3 className="mt-3 text-xl font-bold text-[#1a365d]">
                  {selectedMember.user.firstName} {selectedMember.user.lastName}
                </h3>
                <p className="text-sm text-slate-500">{selectedMember.user.email}</p>

                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getRoleAccent(selectedMember.teamRole)}`}>
                    {getRoleConfig(selectedMember.teamRole).name}
                  </span>
                  {selectedMember.isActive && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Active</span>
                  )}
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4 text-left space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Jersey Number</span>
                    <span className="text-sm font-bold text-slate-900">#{selectedMember.jerseyNumber ?? '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Position</span>
                    <span className="text-sm font-bold text-slate-900">{selectedMember.position || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Sport</span>
                    <span className="text-sm font-bold text-slate-900">
                      {sportConfigs[selectedMember.teamType as SportType]?.name || selectedMember.teamType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Team</span>
                    <span className="text-sm font-bold text-slate-900">{selectedMember.techCenter?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Joined</span>
                    <span className="text-sm font-bold text-slate-900">
                      {new Date(selectedMember.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedMember(null)}
                  className="mt-5 w-full rounded-xl bg-[#1a365d] px-4 py-2.5 font-semibold text-white transition hover:bg-[#153475]"
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