'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Users, Trophy, Shirt, Plus, X, Loader2, ArrowLeft, Edit2, 
  Save, Megaphone, Package, Stethoscope, Award, UserCog, 
  Circle, Target, Globe, Zap, Search, User, Filter, 
  Calendar, Star, Shield, Menu, Grid, List, Crown,
  Gamepad2, Joystick, Sparkles, Flame, Swords
} from 'lucide-react';
import { useTeam, useRegisterForTeam, useLeaveTeam, useUpdateTeamMembership } from '@/hooks/useTeam';
import { useAuth } from '@/lib/hooks/useAuth';

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

// Gaming-styled sport configurations
const sportConfigs = {
  FOOTBALL: {
    icon: Trophy,
    borderColor: 'border-[#00ff41]',
    bgColor: 'bg-[#00ff41]/5',
    name: 'Football',
    description: 'Join the football squad',
    positions: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'],
    glowColor: 'shadow-[#00ff41]'
  },
  VOLLEYBALL: {
    icon: Circle,
    borderColor: 'border-[#00d4ff]',
    bgColor: 'bg-[#00d4ff]/5',
    name: 'Volleyball',
    description: 'Popular for girls',
    positions: ['Setter', 'Libero', 'Outside Hitter', 'Middle Blocker', 'Opposite'],
    glowColor: 'shadow-[#00d4ff]'
  },
  NETBALL: {
    icon: Target,
    borderColor: 'border-[#b400ff]',
    bgColor: 'bg-[#b400ff]/5',
    name: 'Netball',
    description: 'Popular for girls',
    positions: ['Goal Shooter', 'Goal Attack', 'Wing Attack', 'Center', 'Wing Defense', 'Goal Defense'],
    glowColor: 'shadow-[#b400ff]'
  },
  BASKETBALL: {
    icon: Globe,
    borderColor: 'border-[#ff6b00]',
    bgColor: 'bg-[#ff6b00]/5',
    name: 'Basketball',
    description: 'For both boys and girls',
    positions: ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'],
    glowColor: 'shadow-[#ff6b00]'
  },
  ATHLETICS: {
    icon: Zap,
    borderColor: 'border-[#ffdd00]',
    bgColor: 'bg-[#ffdd00]/5',
    name: 'Athletics',
    description: 'Track & Field events',
    positions: ['Sprinter', 'Distance Runner', 'Jumper', 'Thrower', 'Hurdler', 'Relay Runner'],
    glowColor: 'shadow-[#ffdd00]'
  }
};

// Gaming-styled role configurations
const roleConfigs = {
  PLAYER: {
    icon: Users,
    borderColor: 'border-[#00ff41]',
    bgColor: 'bg-[#00ff41]/5',
    name: 'Players',
    rank: 'Bronze'
  },
  COACH: {
    icon: Trophy,
    borderColor: 'border-[#ffdd00]',
    bgColor: 'bg-[#ffdd00]/5',
    name: 'Coaches',
    rank: 'Gold'
  },
  KIT_MANAGER: {
    icon: Package,
    borderColor: 'border-[#ff6b00]',
    bgColor: 'bg-[#ff6b00]/5',
    name: 'Kit Managers',
    rank: 'Silver'
  },
  CHEERLEADER: {
    icon: Megaphone,
    borderColor: 'border-[#ff00aa]',
    bgColor: 'bg-[#ff00aa]/5',
    name: 'Cheerleaders',
    rank: 'Platinum'
  },
  TEAM_MANAGER: {
    icon: UserCog,
    borderColor: 'border-[#00d4ff]',
    bgColor: 'bg-[#00d4ff]/5',
    name: 'Team Managers',
    rank: 'Diamond'
  },
  MEDICAL: {
    icon: Stethoscope,
    borderColor: 'border-[#ff0044]',
    bgColor: 'bg-[#ff0044]/5',
    name: 'Medical Staff',
    rank: 'Ruby'
  },
  REFEREE: {
    icon: Award,
    borderColor: 'border-[#ffffff]',
    bgColor: 'bg-[#ffffff]/5',
    name: 'Referees',
    rank: 'Elite'
  }
};

export default function FootballTeamPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  // State
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [position, setPosition] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editJerseyNumber, setEditJerseyNumber] = useState('');
  const [editPosition, setEditPosition] = useState('');
  const [selectedRole, setSelectedRole] = useState('PLAYER');
  const [selectedSport, setSelectedSport] = useState('FOOTBALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const techCenterId = user?.techCenterId || null;
  const queryClient = useQueryClient();
  
  const { data, isLoading, error } = useTeam(techCenterId, selectedSport) as { 
    data: TeamData | null, 
    isLoading: boolean, 
    error: any 
  };
  
  const registerMutation = useRegisterForTeam();
  const leaveMutation = useLeaveTeam();
  const updateMutation = useUpdateTeamMembership();

  // Preload all team data
  useEffect(() => {
    if (techCenterId) {
      const sports = ['FOOTBALL', 'VOLLEYBALL', 'NETBALL', 'BASKETBALL', 'ATHLETICS'];
      sports.forEach(sport => {
        queryClient.prefetchQuery({
          queryKey: ['team', techCenterId, sport],
          queryFn: async () => {
            const response = await fetch(`/api/team/${techCenterId}/${sport}`);
            return response.json();
          },
          staleTime: 10 * 60 * 1000,
        });
      });
    }
  }, [techCenterId, queryClient]);

  // Ensure video plays
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.log('Video autoplay failed:', err);
      });
    }
  }, []);

  const teamMembers = data?.teamMembers || [];
  const currentUserMembership = data?.currentUserMembership || null;
  const totalMembers = data?.totalMembers || 0;
  const currentSportConfig = sportConfigs[selectedSport as keyof typeof sportConfigs];

  // Filter and search members
  const filteredMembers = useMemo(() => {
    let filtered = teamMembers;

    // Search filter - enhanced to search by name, email, jersey number, and position
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(member => {
        const fullName = `${member.user.firstName} ${member.user.lastName}`.toLowerCase();
        const email = member.user.email?.toLowerCase() || '';
        const jerseyNumberStr = member.jerseyNumber?.toString() || '';
        const positionStr = member.position?.toLowerCase() || '';

        return (
          fullName.includes(query) ||
          email.includes(query) ||
          jerseyNumberStr.includes(query) ||
          positionStr.includes(query)
        );
      });
    }

    // Role filter
    if (filterRole) {
      filtered = filtered.filter(member => member.teamRole === filterRole);
    }

    return filtered;
  }, [teamMembers, searchQuery, filterRole]);

  // Group members by role for stats
  const membersByRole = Object.keys(roleConfigs).reduce((acc, role) => {
    acc[role] = teamMembers.filter((m: TeamMember) => m.teamRole === role);
    return acc;
  }, {} as Record<string, TeamMember[]>);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRankColor = (role: string) => {
    const rankColors: Record<string, string> = {
      PLAYER: 'text-[#00ff41] border-[#00ff41]',
      COACH: 'text-[#ffdd00] border-[#ffdd00]',
      KIT_MANAGER: 'text-[#ff6b00] border-[#ff6b00]',
      CHEERLEADER: 'text-[#ff00aa] border-[#ff00aa]',
      TEAM_MANAGER: 'text-[#00d4ff] border-[#00d4ff]',
      MEDICAL: 'text-[#ff0044] border-[#ff0044]',
      REFEREE: 'text-[#ffffff] border-[#ffffff]'
    };
    return rankColors[role] || 'text-white border-white';
  };

  const getGlowEffect = (role: string) => {
    const glowColors: Record<string, string> = {
      PLAYER: 'shadow-[0_0_20px_rgba(0,255,65,0.3)]',
      COACH: 'shadow-[0_0_20px_rgba(255,221,0,0.3)]',
      KIT_MANAGER: 'shadow-[0_0_20px_rgba(255,107,0,0.3)]',
      CHEERLEADER: 'shadow-[0_0_20px_rgba(255,0,170,0.3)]',
      TEAM_MANAGER: 'shadow-[0_0_20px_rgba(0,212,255,0.3)]',
      MEDICAL: 'shadow-[0_0_20px_rgba(255,0,68,0.3)]',
      REFEREE: 'shadow-[0_0_20px_rgba(255,255,255,0.3)]'
    };
    return glowColors[role] || '';
  };

  const handleJoinTeam = async () => {
    if (!techCenterId || !jerseyNumber || !position) {
      alert('Please fill in all required fields');
      return;
    }
    try {
      setShowJoinForm(false);
      setJerseyNumber('');
      setPosition('');
      setSelectedRole('PLAYER');

      await registerMutation.mutateAsync({
        techCenterId,
        teamType: selectedSport,
        teamRole: selectedRole,
        jerseyNumber: parseInt(jerseyNumber),
        position: position
      });
    } catch (error) {
      console.error('Failed to join team:', error);
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

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-black/50 border border-[#00ff41]/20 rounded-xl p-6 animate-pulse">
              <div className="h-6 w-48 bg-[#00ff41]/10 rounded mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-16 bg-[#00ff41]/5 rounded-lg" />
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
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <p className="text-[#ff0044] font-mono">ERROR: Failed to load team data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-[#0a0a0a]">
      {/* Video Background */}
      <div className="fixed inset-0 w-full h-full">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover opacity-40"
        >
          <source src="/football-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#0a0a0a]/90" />
        {/* Scanning line effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-[#00ff41]/20 animate-pulse" 
               style={{ boxShadow: '0 0 100px #00ff41' }} />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-[#00ff41]/20 animate-pulse" 
               style={{ boxShadow: '0 0 100px #00ff41' }} />
        </div>
      </div>

      {/* Grid overlay for gaming feel */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 65, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 65, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg bg-black/80 border border-[#00ff41]/30 hover:border-[#00ff41] text-[#00ff41] transition-all duration-300 font-mono text-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="h-8 w-px bg-[#00ff41]/30" />
            
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-black/80 border border-[#00ff41]/30">
                {currentSportConfig && <currentSportConfig.icon className="w-6 h-6 text-[#00ff41]" />}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#00ff41] tracking-wider font-mono" style={{ textShadow: '0 0 20px rgba(0,255,65,0.5)' }}>
                  {currentSportConfig?.name || 'Team'}
                </h1>
                <p className="text-sm text-[#00ff41]/60 font-mono">
                  {teamMembers[0]?.techCenter?.name || 'Tech Center'} • Squad {totalMembers}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Button */}
          <button
            onClick={() => setShowProfileModal(true)}
            className="relative group"
          >
            <div className="w-12 h-12 rounded-full bg-black/80 border-2 border-[#00ff41] flex items-center justify-center overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,65,0.3)]">
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-[#00ff41]" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00ff41] rounded-full border-2 border-[#0a0a0a]" />
            <div className="absolute inset-0 rounded-full animate-ping opacity-0 group-hover:opacity-100 border-2 border-[#00ff41]" />
          </button>
        </div>

        {/* Sport Filter Buttons - Gaming Style */}
        <div className="relative mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Gamepad2 className="w-5 h-5 text-[#00ff41]" />
            <span className="text-[#00ff41]/60 font-mono text-sm">SELECT SPORT</span>
            <div className="flex-1 h-px bg-[#00ff41]/20" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(sportConfigs).map(([sport, config]) => {
              const Icon = config.icon;
              const isSelected = selectedSport === sport;
              
              return (
                <button
                  key={sport}
                  onClick={() => setSelectedSport(sport)}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all duration-300
                    ${isSelected 
                      ? `${config.borderColor} bg-black/80 shadow-[0_0_30px_rgba(0,255,65,0.15)]` 
                      : 'border-[#00ff41]/20 bg-black/50 hover:border-[#00ff41]/50'
                    }
                  `}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-[#00ff41]' : 'text-[#00ff41]/50'}`} />
                    <span className={`text-sm font-mono ${isSelected ? 'text-[#00ff41]' : 'text-[#00ff41]/60'}`}>
                      {config.name}
                    </span>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#00ff41] rounded-full animate-pulse" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Gaming Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-black/80 border border-[#00ff41]/20 rounded-lg p-4 hover:border-[#00ff41]/50 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg border border-[#00ff41]/30">
                <Users className="w-5 h-5 text-[#00ff41]" />
              </div>
              <div>
                <p className="text-xl font-bold text-[#00ff41] font-mono">{totalMembers}</p>
                <p className="text-xs text-[#00ff41]/60 font-mono">TOTAL SQUAD</p>
              </div>
            </div>
          </div>

          <div className="bg-black/80 border border-[#00ff41]/20 rounded-lg p-4 hover:border-[#00ff41]/50 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg border border-[#00d4ff]/30">
                <Shirt className="w-5 h-5 text-[#00d4ff]" />
              </div>
              <div>
                <p className="text-xl font-bold text-[#00d4ff] font-mono">{membersByRole.PLAYER?.length || 0}</p>
                <p className="text-xs text-[#00d4ff]/60 font-mono">PLAYERS</p>
              </div>
            </div>
          </div>

          <div className="bg-black/80 border border-[#00ff41]/20 rounded-lg p-4 hover:border-[#00ff41]/50 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg border border-[#ffdd00]/30">
                <Crown className="w-5 h-5 text-[#ffdd00]" />
              </div>
              <div>
                <p className="text-xl font-bold text-[#ffdd00] font-mono">{membersByRole.COACH?.length || 0}</p>
                <p className="text-xs text-[#ffdd00]/60 font-mono">COACHES</p>
              </div>
            </div>
          </div>

          <div className="bg-black/80 border border-[#00ff41]/20 rounded-lg p-4 hover:border-[#00ff41]/50 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg border border-[#ff00aa]/30">
                <Sparkles className="w-5 h-5 text-[#ff00aa]" />
              </div>
              <div>
                <p className="text-xl font-bold text-[#ff00aa] font-mono">{membersByRole.CHEERLEADER?.length || 0}</p>
                <p className="text-xs text-[#ff00aa]/60 font-mono">CHEERLEADERS</p>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Sport Banner - Gaming Style */}
        <div className="mb-6 bg-black/80 border border-[#00ff41]/20 rounded-lg p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#00ff41]/5" />
          <div className="absolute top-0 left-0 right-0 h-px bg-[#00ff41]/20 animate-pulse" />
          <div className="relative flex items-start gap-3">
            <div className="p-2 rounded-lg border border-[#00ff41]/30">
              <Joystick className="w-5 h-5 text-[#00ff41]" />
            </div>
            <div className="flex-1">
              <p className="text-[#00ff41] font-mono font-medium">MULTI-SPORT UNLOCKED</p>
              <p className="text-sm text-[#00ff41]/60 font-mono mt-1">
                Join multiple sports - Football, Volleyball, Netball, Basketball, and Athletics. 
                Select your sport above to begin.
              </p>
            </div>
            <Swords className="w-5 h-5 text-[#00ff41]/30" />
          </div>
        </div>

        {/* Join/Leave Action */}
        <div className="mb-8">
          {currentUserMembership && currentUserMembership.teamType === selectedSport ? (
            <div className="bg-black/80 border border-[#00ff41]/20 rounded-lg p-4">
              {!isEditing ? (
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg border border-[#00ff41]/30">
                      <Users className="w-5 h-5 text-[#00ff41]" />
                    </div>
                    <div>
                      <p className="text-[#00ff41] font-mono font-medium">
                        STATUS: {roleConfigs[currentUserMembership.teamRole as keyof typeof roleConfigs]?.name?.toUpperCase() || 'MEMBER'}
                      </p>
                      <p className="text-sm text-[#00ff41]/60 font-mono">
                        #{currentUserMembership.jerseyNumber} • {currentUserMembership.position}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <button
                      onClick={handleEditMembership}
                      className="flex-1 md:flex-none px-4 py-2 bg-black/80 border border-[#00ff41]/30 text-[#00ff41] rounded-lg hover:border-[#00ff41] hover:shadow-[0_0_20px_rgba(0,255,65,0.15)] transition-all font-mono text-sm flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      EDIT
                    </button>
                    <button
                      onClick={() => handleLeaveTeam(currentUserMembership.id)}
                      disabled={leaveMutation.isPending}
                      className="flex-1 md:flex-none px-4 py-2 bg-black/80 border border-[#ff0044]/30 text-[#ff0044] rounded-lg hover:border-[#ff0044] hover:shadow-[0_0_20px_rgba(255,0,68,0.15)] transition-all font-mono text-sm flex items-center justify-center gap-2"
                    >
                      {leaveMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                      LEAVE
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg border border-[#00ff41]/30">
                      <Edit2 className="w-5 h-5 text-[#00ff41]" />
                    </div>
                    <p className="text-[#00ff41] font-mono font-medium">EDIT PROFILE</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[#00ff41]/60 font-mono mb-2">JERSEY #</label>
                      <input
                        type="number"
                        value={editJerseyNumber}
                        onChange={(e) => setEditJerseyNumber(e.target.value)}
                        className="w-full px-4 py-3 bg-black/80 border border-[#00ff41]/20 rounded-lg text-[#00ff41] placeholder:text-[#00ff41]/30 focus:outline-none focus:border-[#00ff41] transition-all font-mono"
                        placeholder="e.g., 10"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#00ff41]/60 font-mono mb-2">POSITION</label>
                      <select
                        value={editPosition}
                        onChange={(e) => setEditPosition(e.target.value)}
                        className="w-full px-4 py-3 bg-black/80 border border-[#00ff41]/20 rounded-lg text-[#00ff41] focus:outline-none focus:border-[#00ff41] transition-all font-mono"
                        required
                      >
                        <option value="">SELECT POSITION</option>
                        {currentSportConfig?.positions.map(pos => (
                          <option key={pos} value={pos}>{pos.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleUpdateMembership}
                      disabled={updateMutation.isPending}
                      className="flex-1 px-4 py-3 bg-[#00ff41] text-black rounded-lg font-mono font-medium hover:shadow-[0_0_30px_rgba(0,255,65,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {updateMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          SAVE
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-3 bg-black/80 border border-[#00ff41]/20 text-[#00ff41] rounded-lg hover:border-[#00ff41]/50 transition-all font-mono"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowJoinForm(!showJoinForm)}
              className="w-full bg-[#00ff41] text-black rounded-lg p-4 font-mono font-medium hover:shadow-[0_0_30px_rgba(0,255,65,0.3)] transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              JOIN {currentSportConfig?.name.toUpperCase()} SQUAD
            </button>
          )}
        </div>

        {/* Join Form */}
        <AnimatePresence>
          {showJoinForm && !currentUserMembership && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-black/80 border border-[#00ff41]/20 rounded-lg p-6 mb-8"
            >
              <h3 className="text-lg font-mono font-semibold text-[#00ff41] mb-4">
                JOIN {currentSportConfig?.name.toUpperCase()}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-[#00ff41]/60 font-mono mb-2">ROLE</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-4 py-3 bg-black/80 border border-[#00ff41]/20 rounded-lg text-[#00ff41] focus:outline-none focus:border-[#00ff41] transition-all font-mono"
                  >
                    {Object.entries(roleConfigs).map(([role, config]) => (
                      <option key={role} value={role}>{config.name.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#00ff41]/60 font-mono mb-2">JERSEY #</label>
                  <input
                    type="number"
                    value={jerseyNumber}
                    onChange={(e) => setJerseyNumber(e.target.value)}
                    className="w-full px-4 py-3 bg-black/80 border border-[#00ff41]/20 rounded-lg text-[#00ff41] placeholder:text-[#00ff41]/30 focus:outline-none focus:border-[#00ff41] transition-all font-mono"
                    placeholder="e.g., 10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#00ff41]/60 font-mono mb-2">POSITION</label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-4 py-3 bg-black/80 border border-[#00ff41]/20 rounded-lg text-[#00ff41] focus:outline-none focus:border-[#00ff41] transition-all font-mono"
                    required
                  >
                    <option value="">SELECT POSITION</option>
                    {currentSportConfig?.positions.map(pos => (
                      <option key={pos} value={pos}>{pos.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleJoinTeam}
                  disabled={registerMutation.isPending}
                  className="flex-1 px-4 py-3 bg-[#00ff41] text-black rounded-lg font-mono font-medium hover:shadow-[0_0_30px_rgba(0,255,65,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {registerMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'JOIN SQUAD'
                  )}
                </button>
                <button
                  onClick={() => setShowJoinForm(false)}
                  className="px-4 py-3 bg-black/80 border border-[#00ff41]/20 text-[#00ff41] rounded-lg hover:border-[#00ff41]/50 transition-all font-mono"
                >
                  CANCEL
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search and Filters */}
        <div className="sticky top-0 z-40 mb-6 py-4 bg-gradient-to-b from-black via-black/95 to-transparent backdrop-blur-sm -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00ff41]/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, jersey number, or position..."
                className="w-full pl-12 pr-12 py-4 bg-black/90 border-2 border-[#00ff41]/30 rounded-xl text-[#00ff41] placeholder:text-[#00ff41]/40 focus:outline-none focus:border-[#00ff41] focus:shadow-[0_0_20px_rgba(0,255,65,0.2)] transition-all font-mono text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00ff41]/60 hover:text-[#00ff41] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-4 bg-black/90 border-2 border-[#00ff41]/30 rounded-xl text-[#00ff41] hover:border-[#00ff41] hover:shadow-[0_0_20px_rgba(0,255,65,0.2)] transition-all font-mono flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">FILTER</span>
                {filterRole && <span className="w-2 h-2 bg-[#00ff41] rounded-full animate-pulse" />}
              </button>

              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="px-4 py-4 bg-black/90 border-2 border-[#00ff41]/30 rounded-xl text-[#00ff41] hover:border-[#00ff41] hover:shadow-[0_0_20px_rgba(0,255,65,0.2)] transition-all"
              >
                {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Search Results Counter */}
          {searchQuery && (
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-[#00ff41]/60 font-mono">
                Found {filteredMembers.length} result{filteredMembers.length !== 1 ? 's' : ''} for "{searchQuery}"
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#00ff41]/60 hover:text-[#00ff41] font-mono transition-colors"
              >
                CLEAR SEARCH
              </button>
            </div>
          )}

          {/* Enhanced Filter dropdown */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-4 bg-black/90 border-2 border-[#00ff41]/30 rounded-xl"
              >
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilterRole(null)}
                    className={`px-4 py-2 rounded-lg border-2 font-mono text-sm transition-all ${
                      !filterRole
                        ? 'border-[#00ff41] text-[#00ff41] bg-[#00ff41]/10 shadow-[0_0_15px_rgba(0,255,65,0.2)]'
                        : 'border-[#00ff41]/20 text-[#00ff41]/60 hover:border-[#00ff41]/50 hover:bg-[#00ff41]/5'
                    }`}
                  >
                    ALL ROLES
                  </button>
                  {Object.entries(roleConfigs).map(([role, config]) => (
                    <button
                      key={role}
                      onClick={() => setFilterRole(filterRole === role ? null : role)}
                      className={`px-4 py-2 rounded-lg border-2 font-mono text-sm transition-all ${
                        filterRole === role
                          ? `${config.borderColor} bg-[#00ff41]/10 text-[#00ff41] shadow-[0_0_15px_rgba(0,255,65,0.2)]`
                          : 'border-[#00ff41]/20 text-[#00ff41]/60 hover:border-[#00ff41]/50 hover:bg-[#00ff41]/5'
                      }`}
                    >
                      {config.name}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Team Members */}
        <div className="space-y-6">
          {filterRole ? (
            // Enhanced Filtered view
            <div className="bg-black/90 border-2 border-[#00ff41]/30 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-xl border-2 ${roleConfigs[filterRole as keyof typeof roleConfigs]?.borderColor} bg-black/80`}>
                  {(() => {
                    const IconComponent = roleConfigs[filterRole as keyof typeof roleConfigs]?.icon;
                    if (IconComponent) {
                      return <IconComponent className={`w-6 h-6 ${getRankColor(filterRole).split(' ')[0]}`} />;
                    }
                    return null;
                  })()}
                </div>
                <div>
                  <h3 className="text-xl font-mono font-bold text-[#00ff41]">
                    {roleConfigs[filterRole as keyof typeof roleConfigs]?.name}
                  </h3>
                  <p className="text-sm text-[#00ff41]/70 font-mono">
                    {filteredMembers.length} MEMBERS • RANK {roleConfigs[filterRole as keyof typeof roleConfigs]?.rank}
                  </p>
                </div>
              </div>

              {filteredMembers.length === 0 ? (
                <div className="bg-black/60 rounded-xl p-8 text-center border-2 border-dashed border-[#00ff41]/30">
                  <Users className="w-12 h-12 text-[#00ff41]/40 mx-auto mb-3" />
                  <p className="text-[#00ff41]/60 font-mono text-sm">NO MEMBERS FOUND</p>
                  <p className="text-[#00ff41]/40 font-mono text-xs mt-2">TRY ADJUSTING YOUR SEARCH OR FILTERS</p>
                </div>
              ) : (
                <div className={viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                  : 'space-y-3'
                }>
                  {filteredMembers.map((member: TeamMember) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setSelectedMember(member)}
                      className={`
                        bg-black/60 border-2 rounded-xl p-4 cursor-pointer transition-all duration-300
                        ${viewMode === 'grid' ? '' : 'flex items-center gap-4'}
                        hover:border-[#00ff41]/60 hover:shadow-[0_0_40px_rgba(0,255,65,0.15)] hover:bg-black/70
                        ${getGlowEffect(member.teamRole)}
                      `}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-14 h-14 rounded-full border-2 ${getRankColor(member.teamRole)} flex items-center justify-center flex-shrink-0 bg-black/80 shadow-lg`}>
                          {member.user.profileImageUrl ? (
                            <img
                              src={member.user.profileImageUrl}
                              alt={member.user.firstName}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-bold text-[#00ff41] font-mono">
                              {getInitials(member.user.firstName, member.user.lastName)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-mono font-semibold text-[#00ff41] text-base truncate">
                            {member.user.firstName} {member.user.lastName}
                          </p>
                          <p className="text-xs text-[#00ff41]/70 font-mono truncate mt-1">
                            #{member.jerseyNumber} • {member.position}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-[9px] px-2 py-1 rounded border ${getRankColor(member.teamRole)} bg-black/50 font-mono`}>
                              {roleConfigs[member.teamRole as keyof typeof roleConfigs]?.rank}
                            </span>
                            {member.isActive && (
                              <span className="text-[9px] px-2 py-1 rounded border border-[#00ff41]/30 bg-[#00ff41]/10 text-[#00ff41] font-mono">
                                ACTIVE
                              </span>
                            )}
                          </div>
                        </div>
                        <Flame className="w-5 h-5 text-[#ff6b00]/60" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Enhanced Grouped by role view
            Object.entries(roleConfigs).map(([role, config]) => {
              const roleMembers = filteredMembers.filter(m => m.teamRole === role);

              return (
                <div key={role} className="bg-black/90 border-2 border-[#00ff41]/30 rounded-xl p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`p-3 rounded-xl border-2 ${config.borderColor} bg-black/80`}>
                      {React.createElement(config.icon as React.ComponentType<{ className?: string }>, {
                        className: `w-6 h-6 ${getRankColor(role).split(' ')[0]}`
                      })}
                    </div>
                    <div>
                      <h3 className="text-xl font-mono font-bold text-[#00ff41]">{config.name}</h3>
                      <p className="text-sm text-[#00ff41]/70 font-mono">
                        {roleMembers.length} MEMBERS • RANK {config.rank}
                      </p>
                    </div>
                    <div className="ml-auto">
                      <span className={`text-xs px-3 py-1 rounded border-2 ${getRankColor(role)} bg-black/50 font-mono`}>
                        {config.rank}
                      </span>
                    </div>
                  </div>

                  {roleMembers.length === 0 ? (
                    <div className="bg-black/60 rounded-xl p-8 text-center border-2 border-dashed border-[#00ff41]/30">
                      <Users className="w-12 h-12 text-[#00ff41]/40 mx-auto mb-3" />
                      <p className="text-[#00ff41]/60 font-mono text-sm">NO {config.name.toUpperCase()} REGISTERED</p>
                      <p className="text-[#00ff41]/40 font-mono text-xs mt-2">JOIN AS {config.name.slice(0, -1).toUpperCase()} TO APPEAR HERE</p>
                    </div>
                  ) : (
                    <div className={viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                      : 'space-y-3'
                    }>
                      {roleMembers.map((member: TeamMember) => (
                        <motion.div
                          key={member.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => setSelectedMember(member)}
                          className={`
                            bg-black/60 border-2 rounded-xl p-4 cursor-pointer transition-all duration-300
                            ${viewMode === 'grid' ? '' : 'flex items-center gap-4'}
                            hover:border-[#00ff41]/60 hover:shadow-[0_0_40px_rgba(0,255,65,0.15)] hover:bg-black/70
                            ${getGlowEffect(member.teamRole)}
                          `}
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className={`w-14 h-14 rounded-full border-2 ${getRankColor(member.teamRole)} flex items-center justify-center flex-shrink-0 bg-black/80 shadow-lg`}>
                              {member.user.profileImageUrl ? (
                                <img
                                  src={member.user.profileImageUrl}
                                  alt={member.user.firstName}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-bold text-[#00ff41] font-mono">
                                  {getInitials(member.user.firstName, member.user.lastName)}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-mono font-semibold text-[#00ff41] text-base truncate">
                                {member.user.firstName} {member.user.lastName}
                              </p>
                              <p className="text-xs text-[#00ff41]/70 font-mono truncate mt-1">
                                #{member.jerseyNumber} • {member.position}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`text-[9px] px-2 py-1 rounded border ${getRankColor(member.teamRole)} bg-black/50 font-mono`}>
                                  {roleConfigs[member.teamRole as keyof typeof roleConfigs]?.rank}
                                </span>
                                {member.isActive && (
                                  <span className="text-[9px] px-2 py-1 rounded border border-[#00ff41]/30 bg-[#00ff41]/10 text-[#00ff41] font-mono">
                                    ACTIVE
                                  </span>
                                )}
                              </div>
                            </div>
                            <Star className="w-5 h-5 text-[#ffdd00]/60" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfileModal && user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0a0a0a] border border-[#00ff41]/30 rounded-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-mono font-bold text-[#00ff41]">PROFILE</h2>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="p-2 hover:bg-[#00ff41]/10 rounded-lg transition-all"
                >
                  <X className="w-5 h-5 text-[#00ff41]" />
                </button>
              </div>

              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full border-2 border-[#00ff41] flex items-center justify-center overflow-hidden bg-black/80">
                  {user.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-[#00ff41]" />
                  )}
                </div>
                <h3 className="text-lg font-mono text-[#00ff41] mt-3">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-[#00ff41]/60 font-mono">{user.email}</p>
                {user.phoneNumber && (
                  <p className="text-xs text-[#00ff41]/40 font-mono mt-1">{user.phoneNumber}</p>
                )}
              </div>

              <div className="border-t border-[#00ff41]/20 pt-4">
                <h4 className="text-sm font-mono text-[#00ff41]/60 mb-3">TEAM STATS</h4>
                <div className="space-y-2">
                  {Object.entries(roleConfigs).map(([role, config]) => {
                    const count = teamMembers.filter(m => m.teamRole === role).length;
                    return (
                      <div key={role} className="flex justify-between items-center">
                        <span className="text-sm font-mono text-[#00ff41]/60">{config.name}</span>
                        <span className="text-sm font-mono text-[#00ff41]">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => setShowProfileModal(false)}
                className="w-full mt-6 px-4 py-3 bg-[#00ff41] text-black rounded-lg font-mono font-medium hover:shadow-[0_0_30px_rgba(0,255,65,0.3)] transition-all"
              >
                CLOSE
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Member Detail Modal */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
            onClick={() => setSelectedMember(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0a0a0a] border border-[#00ff41]/30 rounded-xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-mono font-bold text-[#00ff41]">PLAYER INFO</h2>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="p-2 hover:bg-[#00ff41]/10 rounded-lg transition-all"
                >
                  <X className="w-5 h-5 text-[#00ff41]" />
                </button>
              </div>

              <div className="flex flex-col items-center mb-6">
                <div className={`w-24 h-24 rounded-full border-2 ${getRankColor(selectedMember.teamRole)} flex items-center justify-center overflow-hidden bg-black/80`}>
                  {selectedMember.user.profileImageUrl ? (
                    <img
                      src={selectedMember.user.profileImageUrl}
                      alt={selectedMember.user.firstName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-[#00ff41] font-mono">
                      {getInitials(selectedMember.user.firstName, selectedMember.user.lastName)}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-mono text-[#00ff41] mt-3">
                  {selectedMember.user.firstName} {selectedMember.user.lastName}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-3 py-1 rounded border ${getRankColor(selectedMember.teamRole)} bg-black/50 font-mono`}>
                    {roleConfigs[selectedMember.teamRole as keyof typeof roleConfigs]?.rank}
                  </span>
                  <span className="text-xs px-3 py-1 rounded border border-[#00ff41]/30 text-[#00ff41]/60 font-mono">
                    #{selectedMember.jerseyNumber}
                  </span>
                </div>
              </div>

              <div className="border-t border-[#00ff41]/20 pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-mono text-[#00ff41]/60">POSITION</span>
                  <span className="text-sm font-mono text-[#00ff41]">{selectedMember.position}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-mono text-[#00ff41]/60">ROLE</span>
                  <span className="text-sm font-mono text-[#00ff41]">
                    {roleConfigs[selectedMember.teamRole as keyof typeof roleConfigs]?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-mono text-[#00ff41]/60">TEAM</span>
                  <span className="text-sm font-mono text-[#00ff41]">
                    {selectedMember.techCenter?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-mono text-[#00ff41]/60">JOINED</span>
                  <span className="text-sm font-mono text-[#00ff41]">
                    {new Date(selectedMember.joinedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedMember(null)}
                className="w-full mt-6 px-4 py-3 bg-[#00ff41] text-black rounded-lg font-mono font-medium hover:shadow-[0_0_30px_rgba(0,255,65,0.3)] transition-all"
              >
                CLOSE
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}