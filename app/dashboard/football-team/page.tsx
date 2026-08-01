'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, Trophy, Shirt, Plus, X, Loader2, ArrowLeft, Home } from 'lucide-react';
import { useFootballTeam, useRegisterForFootballTeam, useLeaveFootballTeam } from '@/hooks/useFootballTeam';
import { useAuth } from '@/lib/hooks/useAuth';

export default function FootballTeamPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [position, setPosition] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);

  const techCenterId = user?.techCenterId || null;
  const { data, isLoading, error } = useFootballTeam(techCenterId);
  const registerMutation = useRegisterForFootballTeam();
  const leaveMutation = useLeaveFootballTeam();

  const handleJoinTeam = async () => {
    if (!techCenterId) return;
    try {
      await registerMutation.mutateAsync({
        techCenterId,
        jerseyNumber: jerseyNumber ? parseInt(jerseyNumber) : undefined,
        position: position || undefined
      });
      setShowJoinForm(false);
      setJerseyNumber('');
      setPosition('');
    } catch (error) {
      console.error('Failed to join team:', error);
    }
  };

  const handleLeaveTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to leave the football team?')) return;
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
      <div className="min-h-screen p-6">
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#FB7185]">Failed to load football team data</p>
        </div>
      </div>
    );
  }

  const teamMembers = data?.teamMembers || [];
  const currentUserMembership = data?.currentUserMembership;
  const totalMembers = data?.totalMembers || 0;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-[#2A2438]/50 hover:bg-[#2A2438] text-[#A79C8C] hover:text-[#F5F0E8] transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => router.push('/dashboard')}
          className="p-2 rounded-lg bg-[#2A2438]/50 hover:bg-[#2A2438] text-[#A79C8C] hover:text-[#F5F0E8] transition-all duration-200"
        >
          <Home className="w-5 h-5" />
        </button>
        
        <div className="h-8 w-px bg-[#2A2438]" />
        
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#E8A33D]/20 to-[#C97F1F]/10 border border-[#E8A33D]/20">
            <Trophy className="w-6 h-6 text-[#E8A33D]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#F5F0E8]" style={{ fontFamily: 'var(--font-display)' }}>
              Football Team
            </h1>
            <p className="text-sm text-[#A79C8C]">{teamMembers[0]?.techCenter?.name || 'Tech Center'} Team</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#150F20] border border-[#2A2438] rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-[#E8A33D]/10 border border-[#E8A33D]/20">
              <Users className="w-6 h-6 text-[#E8A33D]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#F5F0E8]">{totalMembers}</p>
              <p className="text-sm text-[#A79C8C]">Team Members</p>
            </div>
          </div>
        </div>

        <div className="bg-[#150F20] border border-[#2A2438] rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-[#14B8A6]/10 border border-[#14B8A6]/20">
              <Shirt className="w-6 h-6 text-[#14B8A6]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#F5F0E8]">{teamMembers.filter(m => m.jerseyNumber).length}</p>
              <p className="text-sm text-[#A79C8C]">Jersey Numbers</p>
            </div>
          </div>
        </div>

        <div className="bg-[#150F20] border border-[#2A2438] rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-[#FB7185]/10 border border-[#FB7185]/20">
              <Trophy className="w-6 h-6 text-[#FB7185]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#F5F0E8]">{currentUserMembership ? 'Member' : 'Not Joined'}</p>
              <p className="text-sm text-[#A79C8C]">Your Status</p>
            </div>
          </div>
        </div>
      </div>

      {/* Join/Leave Action */}
      <div className="mb-8">
        {currentUserMembership ? (
          <div className="bg-[#14B8A6]/10 border border-[#14B8A6]/30 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#14B8A6]/20">
                <Users className="w-5 h-5 text-[#14B8A6]" />
              </div>
              <div>
                <p className="text-[#F5F0E8] font-medium">You are a team member</p>
                <p className="text-sm text-[#A79C8C]">
                  {currentUserMembership.jerseyNumber && `Jersey #${currentUserMembership.jerseyNumber}`}
                  {currentUserMembership.jerseyNumber && currentUserMembership.position && ' • '}
                  {currentUserMembership.position}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleLeaveTeam(currentUserMembership.id)}
              disabled={leaveMutation.isPending}
              className="px-4 py-2 bg-[#FB7185] text-[#0B0912] rounded-lg hover:bg-[#E11D48] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {leaveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
              Leave Team
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowJoinForm(!showJoinForm)}
            className="w-full bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] text-[#0B0912] rounded-xl p-4 font-medium hover:shadow-lg hover:shadow-[#E8A33D]/20 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Join Football Team
          </button>
        )}
      </div>

      {/* Join Form */}
      {showJoinForm && !currentUserMembership && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#150F20] border border-[#2A2438] rounded-xl p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-[#F5F0E8] mb-4">Join the Team</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-[#A79C8C] mb-2">Jersey Number (Optional)</label>
              <input
                type="number"
                value={jerseyNumber}
                onChange={(e) => setJerseyNumber(e.target.value)}
                className="w-full px-4 py-3 bg-[#0B0912] border border-[#2A2438] rounded-xl text-[#F5F0E8] focus:outline-none focus:border-[#E8A33D] transition-all"
                placeholder="e.g., 10"
              />
            </div>
            <div>
              <label className="block text-sm text-[#A79C8C] mb-2">Position (Optional)</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-4 py-3 bg-[#0B0912] border border-[#2A2438] rounded-xl text-[#F5F0E8] focus:outline-none focus:border-[#E8A33D] transition-all"
              >
                <option value="">Select position</option>
                <option value="Goalkeeper">Goalkeeper</option>
                <option value="Defender">Defender</option>
                <option value="Midfielder">Midfielder</option>
                <option value="Forward">Forward</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleJoinTeam}
              disabled={registerMutation.isPending}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] text-[#0B0912] rounded-xl font-medium hover:shadow-lg hover:shadow-[#E8A33D]/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {registerMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Join Team'
              )}
            </button>
            <button
              onClick={() => setShowJoinForm(false)}
              className="px-4 py-3 bg-[#2A2438] text-[#A79C8C] rounded-xl hover:bg-[#3A3448] transition-all"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Team Members List */}
      <div className="bg-[#150F20] border border-[#2A2438] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-[#F5F0E8] mb-4">Team Members</h3>
        
        {teamMembers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-[#6B6358] mx-auto mb-4" />
            <p className="text-[#A79C8C]">No team members yet</p>
            <p className="text-sm text-[#6B6358]">Be the first to join!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.map((member) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0B0912] border border-[#2A2438] rounded-xl p-4 hover:border-[#E8A33D]/50 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  {member.user.profileImageUrl ? (
                    <img
                      src={member.user.profileImageUrl}
                      alt={`${member.user.firstName} ${member.user.lastName}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarColor(`${member.user.firstName} ${member.user.lastName}`)} flex items-center justify-center text-[#0B0912] font-bold`}>
                      {getInitials(member.user.firstName, member.user.lastName)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#F5F0E8] truncate">
                      {member.user.firstName} {member.user.lastName}
                    </p>
                    {member.user.id === user?.id && (
                      <span className="text-xs text-[#E8A33D]">(You)</span>
                    )}
                  </div>
                  {member.jerseyNumber && (
                    <div className="p-2 rounded-lg bg-[#E8A33D]/10 border border-[#E8A33D]/20">
                      <Shirt className="w-4 h-4 text-[#E8A33D]" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {member.jerseyNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-[#6B6358]">Jersey:</span>
                      <span className="text-[#F5F0E8] font-medium">#{member.jerseyNumber}</span>
                    </div>
                  )}
                  {member.position && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-[#6B6358]">Position:</span>
                      <span className="text-[#F5F0E8]">{member.position}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-[#A79C8C]">
                    <span className="text-[#6B6358]">Joined:</span>
                    <span>{new Date(member.joinedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}