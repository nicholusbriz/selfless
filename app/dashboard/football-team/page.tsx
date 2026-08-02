'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { Users, Trophy, Shirt, Plus, X, Loader2, ArrowLeft, Edit2, Save, Megaphone, Package, Stethoscope, Award, UserCog, Circle, Target, Globe, Zap } from 'lucide-react';
import { useTeam, useRegisterForTeam, useLeaveTeam, useUpdateTeamMembership } from '@/hooks/useTeam';
import { useAuth } from '@/lib/hooks/useAuth';
import axios from 'axios';

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

export default function FootballTeamPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [position, setPosition] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editJerseyNumber, setEditJerseyNumber] = useState('');
  const [editPosition, setEditPosition] = useState('');
  const [selectedRole, setSelectedRole] = useState('PLAYER');
  const [selectedSport, setSelectedSport] = useState('FOOTBALL');
  const videoRef = useRef<HTMLVideoElement>(null);

  const techCenterId = user?.techCenterId || null;
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useTeam(techCenterId, selectedSport) as { data: TeamData | null, isLoading: boolean, error: any };
  const registerMutation = useRegisterForTeam();
  const leaveMutation = useLeaveTeam();
  const updateMutation = useUpdateTeamMembership();

  // Preload all team data on initial load for instant navigation
  useEffect(() => {
    if (techCenterId) {
      const sports = ['FOOTBALL', 'VOLLEYBALL', 'NETBALL', 'BASKETBALL', 'ATHLETICS'];
      sports.forEach(sport => {
        queryClient.prefetchQuery({
          queryKey: ['team', techCenterId, sport],
          queryFn: async () => {
            const response = await axios.get(`/api/team/${techCenterId}/${sport}`);
            return response.data;
          },
          staleTime: 10 * 60 * 1000,
        });
      });
    }
  }, [techCenterId, queryClient]);

  // Sport configurations
  const sportConfigs = {
    FOOTBALL: {
      icon: Trophy,
      color: 'from-green-500 to-emerald-600',
      borderColor: 'border-green-500/30',
      bgColor: 'bg-green-500/10',
      name: 'Football',
      description: 'Join the football squad',
      positions: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward']
    },
    VOLLEYBALL: {
      icon: Circle,
      color: 'from-blue-500 to-cyan-600',
      borderColor: 'border-blue-500/30',
      bgColor: 'bg-blue-500/10',
      name: 'Volleyball',
      description: 'Popular for girls',
      positions: ['Setter', 'Libero', 'Outside Hitter', 'Middle Blocker', 'Opposite']
    },
    NETBALL: {
      icon: Target,
      color: 'from-purple-500 to-pink-600',
      borderColor: 'border-purple-500/30',
      bgColor: 'bg-purple-500/10',
      name: 'Netball',
      description: 'Popular for girls',
      positions: ['Goal Shooter', 'Goal Attack', 'Wing Attack', 'Center', 'Wing Defense', 'Goal Defense']
    },
    BASKETBALL: {
      icon: Globe,
      color: 'from-orange-500 to-red-600',
      borderColor: 'border-orange-500/30',
      bgColor: 'bg-orange-500/10',
      name: 'Basketball',
      description: 'For both boys and girls',
      positions: ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center']
    },
    ATHLETICS: {
      icon: Zap,
      color: 'from-yellow-500 to-amber-600',
      borderColor: 'border-yellow-500/30',
      bgColor: 'bg-yellow-500/10',
      name: 'Athletics',
      description: 'Track & Field events',
      positions: ['Sprinter', 'Distance Runner', 'Jumper', 'Thrower', 'Hurdler', 'Relay Runner']
    }
  };

  // Role configurations
  const roleConfigs = {
    PLAYER: {
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      borderColor: 'border-blue-500/30',
      bgColor: 'bg-blue-500/10',
      name: 'Players'
    },
    COACH: {
      icon: Trophy,
      color: 'from-yellow-500 to-orange-600',
      borderColor: 'border-yellow-500/30',
      bgColor: 'bg-yellow-500/10',
      name: 'Coaches'
    },
    KIT_MANAGER: {
      icon: Package,
      color: 'from-amber-500 to-yellow-600',
      borderColor: 'border-amber-500/30',
      bgColor: 'bg-amber-500/10',
      name: 'Kit Managers'
    },
    CHEERLEADER: {
      icon: Megaphone,
      color: 'from-pink-500 to-rose-600',
      borderColor: 'border-pink-500/30',
      bgColor: 'bg-pink-500/10',
      name: 'Cheerleaders'
    },
    TEAM_MANAGER: {
      icon: UserCog,
      color: 'from-teal-500 to-cyan-600',
      borderColor: 'border-teal-500/30',
      bgColor: 'bg-teal-500/10',
      name: 'Team Managers'
    },
    MEDICAL: {
      icon: Stethoscope,
      color: 'from-red-500 to-rose-600',
      borderColor: 'border-red-500/30',
      bgColor: 'bg-red-500/10',
      name: 'Medical Staff'
    },
    REFEREE: {
      icon: Award,
      color: 'from-slate-500 to-gray-600',
      borderColor: 'border-slate-500/30',
      bgColor: 'bg-slate-500/10',
      name: 'Referees'
    }
  };

  // Ensure video plays and loops
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.log('Video autoplay failed:', err);
      });
    }
  }, []);

  // Preload all team data on initial load for instant navigation
  useEffect(() => {
    if (techCenterId) {
      const sports = ['FOOTBALL', 'VOLLEYBALL', 'NETBALL', 'BASKETBALL', 'ATHLETICS'];
      sports.forEach(sport => {
        queryClient.prefetchQuery({
          queryKey: ['team', techCenterId, sport],
          queryFn: async () => {
            const response = await axios.get(`/api/team/${techCenterId}/${sport}`);
            return response.data;
          },
          staleTime: 10 * 60 * 1000,
        });
      });
    }
  }, [techCenterId, queryClient]);

  const handleJoinTeam = async () => {
    if (!techCenterId || !jerseyNumber || !position) {
      alert('Please fill in all required fields');
      return;
    }
    try {
      // Close form immediately for instant feedback
      setShowJoinForm(false);
      
      // Clear form
      setJerseyNumber('');
      setPosition('');
      setSelectedRole('PLAYER');

      // Trigger mutation (optimistic update will show user in team immediately)
      await registerMutation.mutateAsync({
        techCenterId,
        teamType: selectedSport,
        teamRole: selectedRole,
        jerseyNumber: parseInt(jerseyNumber),
        position: position
      });
    } catch (error) {
      console.error('Failed to join team:', error);
      // Reopen form on error
      setShowJoinForm(true);
    }
  };

  const handleLeaveTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to leave the team?')) return;
    try {
      await leaveMutation.mutateAsync(teamId);
    } catch (error) {
      console.error('Failed to leave team:', error);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-[#E8A33D] to-[#C97F1F]',
      'from-[#14B8A6] to-[#0D9488]',
      'from-[#FB7185] to-[#E11D48]',
      'from-[#6366F1] to-[#4F46E5]',
      'from-[#34D399] to-[#059669]',
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[Math.abs(hash) % colors.length];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 bg-[#0D1117]">
        <div className="max-w-4xl mx-auto space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#150F20] border border-[#2A2438] rounded-xl p-6">
              <div className="h-6 w-48 bg-[#2A2438] rounded animate-pulse mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-16 bg-[#2A2438] rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D1117]">
        <div className="text-center">
          <p className="text-[#FB7185]">Failed to load team data</p>
        </div>
      </div>
    );
  }

  const teamMembers = data?.teamMembers || [];
  const currentUserMembership = data?.currentUserMembership || null;
  const totalMembers = data?.totalMembers || 0;
  const currentSportConfig = sportConfigs[selectedSport as keyof typeof sportConfigs];

  // Group members by role
  const membersByRole = Object.keys(roleConfigs).reduce((acc, role) => {
    acc[role] = teamMembers.filter((m: TeamMember) => m.teamRole === role);
    return acc;
  }, {} as Record<string, TeamMember[]>);

  const handleEditMembership = () => {
    if (currentUserMembership) {
      setEditJerseyNumber(currentUserMembership.jerseyNumber?.toString() || '');
      setEditPosition(currentUserMembership.position || '');
      setSelectedRole(currentUserMembership.teamRole);
      setIsEditing(true);
    }
  };

  const handleUpdateMembership = async () => {
    if (!currentUserMembership || !editJerseyNumber || !editPosition) {
      alert('Please fill in all required fields');
      return;
    }
    try {
      await updateMutation.mutateAsync({
        teamId: currentUserMembership.id,
        jerseyNumber: parseInt(editJerseyNumber),
        position: editPosition
      });
      setIsEditing(false);
      setEditJerseyNumber('');
      setEditPosition('');
    } catch (error) {
      console.error('Failed to update team membership:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditJerseyNumber('');
    setEditPosition('');
  };

  return (
    <div className="min-h-screen relative">
      {/* Video Background - Auto-playing */}
      <div className="fixed inset-0 w-full h-full">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
        >
          <source src="/football-video.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Content - Directly on top with transparent backgrounds */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        {/* Header - Transparent */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition-all duration-200 border border-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="h-8 w-px bg-white/20" />
          
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl bg-black/30 backdrop-blur-sm border border-white/20`}>
              {currentSportConfig && <currentSportConfig.icon className="w-6 h-6 text-[#E8A33D]" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg" style={{ fontFamily: 'var(--font-display)' }}>
                {currentSportConfig?.name || 'Team'}
              </h1>
              <p className="text-sm text-white/80 drop-shadow-lg">{teamMembers[0]?.techCenter?.name || 'Tech Center'} Team</p>
            </div>
          </div>
        </div>

        {/* Sport Filter Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {Object.entries(sportConfigs).map(([sport, config]) => {
            const Icon = config.icon;
            const isSelected = selectedSport === sport;
            
            return (
              <button
                key={sport}
                onClick={() => setSelectedSport(sport)}
                className={`
                  p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2
                  ${isSelected 
                    ? `${config.borderColor} ${config.bgColor} border-[#E8A33D]` 
                    : 'border-[#2A2438] bg-black/30 hover:border-[#E8A33D]/50'
                  }
                `}
              >
                <div className={`p-2 rounded-lg bg-gradient-to-br ${config.color}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-white">{config.name}</span>
              </button>
            );
          })}
        </div>

        {/* Stats - Transparent glass */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#E8A33D]/20 border border-[#E8A33D]/30 backdrop-blur-sm">
                <Users className="w-5 h-5 text-[#E8A33D]" />
              </div>
              <div>
                <p className="text-xl font-bold text-white drop-shadow-lg">{totalMembers}</p>
                <p className="text-xs text-white/80">Total Members</p>
              </div>
            </div>
          </div>

          <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#14B8A6]/20 border border-[#14B8A6]/30 backdrop-blur-sm">
                <Shirt className="w-5 h-5 text-[#14B8A6]" />
              </div>
              <div>
                <p className="text-xl font-bold text-white drop-shadow-lg">{membersByRole.PLAYER?.length || 0}</p>
                <p className="text-xs text-white/80">Players</p>
              </div>
            </div>
          </div>

          <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#FB7185]/20 border border-[#FB7185]/30 backdrop-blur-sm">
                <Trophy className="w-5 h-5 text-[#FB7185]" />
              </div>
              <div>
                <p className="text-xl font-bold text-white drop-shadow-lg">{membersByRole.COACH?.length || 0}</p>
                <p className="text-xs text-white/80">Coaches</p>
              </div>
            </div>
          </div>

          <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#14B8A6]/20 border border-[#14B8A6]/30 backdrop-blur-sm">
                <Megaphone className="w-5 h-5 text-[#14B8A6]" />
              </div>
              <div>
                <p className="text-xl font-bold text-white drop-shadow-lg">{membersByRole.CHEERLEADER?.length || 0}</p>
                <p className="text-xs text-white/80">Cheerleaders</p>
              </div>
            </div>
          </div>

          <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#14B8A6]/20 border border-[#14B8A6]/30 backdrop-blur-sm">
                <Package className="w-5 h-5 text-[#14B8A6]" />
              </div>
              <div>
                <p className="text-xl font-bold text-white drop-shadow-lg">{membersByRole.KIT_MANAGER?.length || 0}</p>
                <p className="text-xs text-white/80">Kit Managers</p>
              </div>
            </div>
          </div>

          <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#14B8A6]/20 border border-[#14B8A6]/30 backdrop-blur-sm">
                <UserCog className="w-5 h-5 text-[#14B8A6]" />
              </div>
              <div>
                <p className="text-xl font-bold text-white drop-shadow-lg">{membersByRole.TEAM_MANAGER?.length || 0}</p>
                <p className="text-xs text-white/80">Team Managers</p>
              </div>
            </div>
          </div>

          <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#14B8A6]/20 border border-[#14B8A6]/30 backdrop-blur-sm">
                <Stethoscope className="w-5 h-5 text-[#14B8A6]" />
              </div>
              <div>
                <p className="text-xl font-bold text-white drop-shadow-lg">{membersByRole.MEDICAL?.length || 0}</p>
                <p className="text-xs text-white/80">Medical Staff</p>
              </div>
            </div>
          </div>

          <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#14B8A6]/20 border border-[#14B8A6]/30 backdrop-blur-sm">
                <Award className="w-5 h-5 text-[#14B8A6]" />
              </div>
              <div>
                <p className="text-xl font-bold text-white drop-shadow-lg">{membersByRole.REFEREE?.length || 0}</p>
                <p className="text-xs text-white/80">Referees</p>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Sport Communication Banner */}
        <div className="mb-6 bg-gradient-to-r from-[#E8A33D]/20 to-[#C97F1F]/10 border border-[#E8A33D]/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#E8A33D]/20">
              <Trophy className="w-5 h-5 text-[#E8A33D]" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">Multi-Sport Teams Now Available!</p>
              <p className="text-sm text-white/70 mt-1">You can now join multiple sports - Football, Volleyball, Netball, Basketball, and Athletics. Click the sport buttons above to explore each team and register for your favorites!</p>
            </div>
          </div>
        </div>

        {/* Join/Leave Action - Transparent */}
        <div className="mb-8">
          {currentUserMembership && currentUserMembership.teamType === selectedSport ? (
            <div className="bg-black/30 backdrop-blur-sm border border-[#14B8A6]/30 rounded-xl p-4">
              {!isEditing ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#14B8A6]/20 backdrop-blur-sm">
                      <Users className="w-5 h-5 text-[#14B8A6]" />
                    </div>
                    <div>
                      <p className="text-white font-medium drop-shadow-lg">You are a {roleConfigs[currentUserMembership.teamRole as keyof typeof roleConfigs]?.name?.slice(0, -1) || 'team member'} in {currentSportConfig?.name}</p>
                      <p className="text-sm text-white/80">
                        {currentUserMembership.jerseyNumber && `Jersey #${currentUserMembership.jerseyNumber}`}
                        {currentUserMembership.jerseyNumber && currentUserMembership.position && ' • '}
                        {currentUserMembership.position}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleEditMembership}
                      className="px-4 py-2 bg-[#E8A33D] text-white rounded-lg hover:bg-[#C97F1F] transition-colors flex items-center gap-2 font-medium"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleLeaveTeam(currentUserMembership.id)}
                      disabled={leaveMutation.isPending}
                      className="px-4 py-2 bg-[#FB7185] text-white rounded-lg hover:bg-[#E11D48] transition-colors disabled:opacity-50 flex items-center gap-2 font-medium"
                    >
                      {leaveMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                      Leave
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-[#14B8A6]/20 backdrop-blur-sm">
                      <Edit2 className="w-5 h-5 text-[#14B8A6]" />
                    </div>
                    <p className="text-white font-medium drop-shadow-lg">Edit Your {currentSportConfig?.name} Team Details</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-white/80 mb-2">Jersey Number</label>
                      <input
                        type="number"
                        value={editJerseyNumber}
                        onChange={(e) => setEditJerseyNumber(e.target.value)}
                        className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:border-[#E8A33D] transition-all backdrop-blur-sm"
                        placeholder="e.g., 10"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/80 mb-2">Position</label>
                      <select
                        value={editPosition}
                        onChange={(e) => setEditPosition(e.target.value)}
                        className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#E8A33D] transition-all backdrop-blur-sm"
                        required
                      >
                        <option value="">Select position</option>
                        {currentSportConfig?.positions.map(pos => (
                          <option key={pos} value={pos}>{pos}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleUpdateMembership}
                      disabled={updateMutation.isPending}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-[#2FA88A] to-[#45C7A6] text-white rounded-xl font-medium hover:shadow-lg hover:shadow-[#2FA88A]/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {updateMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all"
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
              className="w-full bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] text-[#0B0912] rounded-xl p-4 font-medium hover:shadow-lg hover:shadow-[#E8A33D]/30 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Join {currentSportConfig?.name} Team
            </button>
          )}
        </div>

        {/* Join Form - Transparent */}
        {showJoinForm && !currentUserMembership && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-6 mb-8"
          >
            <h3 className="text-lg font-semibold text-white drop-shadow-lg mb-4">Join the {currentSportConfig?.name || 'Team'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-white/80 mb-2">Select Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#E8A33D] transition-all backdrop-blur-sm"
                >
                  <option value="PLAYER">Player</option>
                  <option value="COACH">Coach</option>
                  <option value="KIT_MANAGER">Kit Manager</option>
                  <option value="CHEERLEADER">Cheerleader</option>
                  <option value="TEAM_MANAGER">Team Manager</option>
                  <option value="MEDICAL">Medical Staff</option>
                  <option value="REFEREE">Referee</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/80 mb-2">Jersey Number</label>
                <input
                  type="number"
                  value={jerseyNumber}
                  onChange={(e) => setJerseyNumber(e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:border-[#E8A33D] transition-all backdrop-blur-sm"
                  placeholder="e.g., 10"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-white/80 mb-2">Position</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#E8A33D] transition-all backdrop-blur-sm"
                  required
                >
                  <option value="">Select position</option>
                  {currentSportConfig?.positions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleJoinTeam}
                disabled={registerMutation.isPending}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] text-[#0B0912] rounded-xl font-medium hover:shadow-lg hover:shadow-[#E8A33D]/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {registerMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Join Team'
                )}
              </button>
              <button
                onClick={() => setShowJoinForm(false)}
                className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Team Members by Role */}
        <div className="space-y-6">
          {Object.entries(roleConfigs).map(([role, config]) => {
            const Icon = config.icon;
            const roleMembers = membersByRole[role] || [];
            
            return (
              <div key={role} className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${config.color}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{config.name}</h3>
                    <p className="text-sm text-white/60">{roleMembers.length} member{roleMembers.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                {roleMembers.length === 0 ? (
                  <div className="bg-black/20 rounded-lg p-6 text-center border border-dashed border-white/10">
                    <Icon className="w-8 h-8 text-white/30 mx-auto mb-2" />
                    <p className="text-white/50 text-sm">No {config.name.toLowerCase()} registered yet</p>
                    <p className="text-white/30 text-xs mt-1">Join as {config.name.slice(0, -1)} to be displayed here</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {roleMembers.map((member: TeamMember) => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-black/20 border ${config.borderColor} rounded-lg p-3 hover:bg-black/30 transition-all`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center flex-shrink-0`}>
                            {member.user.profileImageUrl ? (
                              <img
                                src={member.user.profileImageUrl}
                                alt={member.user.firstName}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-bold text-white">
                                {getInitials(member.user.firstName, member.user.lastName)}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white text-sm truncate">{member.user.firstName} {member.user.lastName}</p>
                            <p className="text-xs text-white/60 truncate">
                              {member.jerseyNumber && `#${member.jerseyNumber}`}
                              {member.jerseyNumber && member.position && ' • '}
                              {member.position}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}