'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, Trophy, Shirt, Plus, X, Loader2, ArrowLeft, Home, Volume2, VolumeX, Edit2, Save } from 'lucide-react';
import { useFootballTeam, useRegisterForFootballTeam, useLeaveFootballTeam, useUpdateFootballTeamMembership } from '@/hooks/useFootballTeam';
import { useAuth } from '@/lib/hooks/useAuth';

export default function FootballTeamPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [position, setPosition] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editJerseyNumber, setEditJerseyNumber] = useState('');
  const [editPosition, setEditPosition] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  const techCenterId = user?.techCenterId || null;
  const { data, isLoading, error } = useFootballTeam(techCenterId);
  const registerMutation = useRegisterForFootballTeam();
  const leaveMutation = useLeaveFootballTeam();
  const updateMutation = useUpdateFootballTeamMembership();

  // Ensure video plays and loops
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.log('Video autoplay failed:', err);
      });
    }
  }, []);

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

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
          <p className="text-[#FB7185]">Failed to load football team data</p>
        </div>
      </div>
    );
  }

  const teamMembers = data?.teamMembers || [];
  const currentUserMembership = data?.currentUserMembership;
  const totalMembers = data?.totalMembers || 0;

  const handleEditMembership = () => {
    if (currentUserMembership) {
      setEditJerseyNumber(currentUserMembership.jerseyNumber?.toString() || '');
      setEditPosition(currentUserMembership.position || '');
      setIsEditing(true);
    }
  };

  const handleUpdateMembership = async () => {
    if (!currentUserMembership) return;
    try {
      await updateMutation.mutateAsync({
        teamId: currentUserMembership.id,
        jerseyNumber: editJerseyNumber ? parseInt(editJerseyNumber) : undefined,
        position: editPosition || undefined
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
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6">
        {/* Header - Transparent */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition-all duration-200 border border-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 rounded-lg bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition-all duration-200 border border-white/10"
          >
            <Home className="w-5 h-5" />
          </button>
          
          <div className="h-8 w-px bg-white/20" />
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-black/30 backdrop-blur-sm border border-white/20">
              <Trophy className="w-6 h-6 text-[#E8A33D]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg" style={{ fontFamily: 'var(--font-display)' }}>
                Football Team
              </h1>
              <p className="text-sm text-white/80 drop-shadow-lg">{teamMembers[0]?.techCenter?.name || 'Tech Center'} Team</p>
            </div>
          </div>
        </div>

        {/* Stats - Transparent glass */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-[#E8A33D]/20 border border-[#E8A33D]/30 backdrop-blur-sm">
                <Users className="w-6 h-6 text-[#E8A33D]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white drop-shadow-lg">{totalMembers}</p>
                <p className="text-sm text-white/80">Team Members</p>
              </div>
            </div>
          </div>

          <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-[#14B8A6]/20 border border-[#14B8A6]/30 backdrop-blur-sm">
                <Shirt className="w-6 h-6 text-[#14B8A6]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white drop-shadow-lg">{teamMembers.filter(m => m.jerseyNumber).length}</p>
                <p className="text-sm text-white/80">Jersey Numbers</p>
              </div>
            </div>
          </div>

          <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-[#FB7185]/20 border border-[#FB7185]/30 backdrop-blur-sm">
                <Trophy className="w-6 h-6 text-[#FB7185]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white drop-shadow-lg">{currentUserMembership ? 'Member' : 'Not Joined'}</p>
                <p className="text-sm text-white/80">Your Status</p>
              </div>
            </div>
          </div>
        </div>

        {/* Join/Leave Action - Transparent */}
        <div className="mb-8">
          {currentUserMembership ? (
            <div className="bg-black/30 backdrop-blur-sm border border-[#14B8A6]/30 rounded-xl p-4">
              {!isEditing ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#14B8A6]/20 backdrop-blur-sm">
                      <Users className="w-5 h-5 text-[#14B8A6]" />
                    </div>
                    <div>
                      <p className="text-white font-medium drop-shadow-lg">You are a team member</p>
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
                    <p className="text-white font-medium drop-shadow-lg">Edit Your Team Details</p>
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
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/80 mb-2">Position</label>
                      <select
                        value={editPosition}
                        onChange={(e) => setEditPosition(e.target.value)}
                        className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#E8A33D] transition-all backdrop-blur-sm"
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
              Join Football Team
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
            <h3 className="text-lg font-semibold text-white drop-shadow-lg mb-4">Join the Team</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-white/80 mb-2">Jersey Number (Optional)</label>
                <input
                  type="number"
                  value={jerseyNumber}
                  onChange={(e) => setJerseyNumber(e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:border-[#E8A33D] transition-all backdrop-blur-sm"
                  placeholder="e.g., 10"
                />
              </div>
              <div>
                <label className="block text-sm text-white/80 mb-2">Position (Optional)</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#E8A33D] transition-all backdrop-blur-sm"
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

        {/* Team Members List - Transparent */}
        <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white drop-shadow-lg mb-4">Team Members</h3>
          
          {teamMembers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/80">No team members yet</p>
              <p className="text-sm text-white/50">Be the first to join!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.map((member) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:border-[#E8A33D]/50 transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {member.user.profileImageUrl ? (
                      <img
                        src={member.user.profileImageUrl}
                        alt={`${member.user.firstName} ${member.user.lastName}`}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                      />
                    ) : (
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarColor(`${member.user.firstName} ${member.user.lastName}`)} flex items-center justify-center text-white font-bold border-2 border-white/20`}>
                        {getInitials(member.user.firstName, member.user.lastName)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate drop-shadow-lg">
                        {member.user.firstName} {member.user.lastName}
                      </p>
                      {member.user.id === user?.id && (
                        <span className="text-xs text-[#E8A33D] drop-shadow-lg">(You)</span>
                      )}
                    </div>
                    {member.jerseyNumber && (
                      <div className="p-2 rounded-lg bg-[#E8A33D]/20 border border-[#E8A33D]/30 backdrop-blur-sm">
                        <Shirt className="w-4 h-4 text-[#E8A33D]" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {member.jerseyNumber && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-white/60">Jersey:</span>
                        <span className="text-white font-medium drop-shadow-lg">#{member.jerseyNumber}</span>
                      </div>
                    )}
                    {member.position && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-white/60">Position:</span>
                        <span className="text-white drop-shadow-lg">{member.position}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <span>Joined:</span>
                      <span className="text-white/80">{new Date(member.joinedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Mute/Unmute Button - Floating at bottom center */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-black/50 backdrop-blur-md rounded-full px-4 py-2 border border-white/10">
          <button
            onClick={toggleMute}
            className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <span className="text-white/60 text-xs px-2">Football Highlights</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#E8A33D] animate-pulse" />
        </div>
      </div>
    </div>
  );
}