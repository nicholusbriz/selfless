'use client';

import { ArrowRight, Trophy, Users, Calendar, MapPin, Sparkles, User, Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function MyGradesPage() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [isProfileHovered, setIsProfileHovered] = useState(false);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 relative z-10">
        <div className="h-8 w-px bg-[#2A2438]" />
        <h1 className="text-2xl font-bold text-[#F5F0E8]">
          Dashboard
        </h1>
      </div>

      {/* Football Team Promotional Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-gradient-to-br from-[#1A1430] via-[#150F20] to-[#1A1430] border border-[#E8A33D]/20 rounded-3xl p-6 md:p-8 mb-6"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <motion.div
                className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-[#E8A33D]/10 border border-[#E8A33D]/20 rounded-full"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                <Sparkles className="w-4 h-4 text-[#E8A33D]" />
                <span className="text-sm font-medium text-[#E8A33D]">⚽ Registration Open</span>
              </motion.div>

              <motion.h2
                className="text-3xl md:text-4xl font-bold text-[#F5F0E8] mb-3"
              >
                Join Your Tech Center
                <motion.span
                  className="block text-[#E8A33D]"
                  animate={{
                    color: ['#E8A33D', '#14B8A6', '#E8A33D'],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  Football Team! ⚽
                </motion.span>
              </motion.h2>

              <p className="text-[#A79C8C] max-w-lg text-lg">
                Register now to represent your tech center in the football league.
                Show your skills and compete with other centers!
              </p>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 mt-4">
                {[
                  { icon: Trophy, label: 'Win Prizes' },
                  { icon: Users, label: 'Team Spirit' },
                  { icon: Calendar, label: 'Weekly Matches' },
                  { icon: MapPin, label: 'Local League' },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-2 px-3 py-2 bg-[#2A2438]/30 border border-[#2A2438]/50 rounded-lg"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <feature.icon className="w-4 h-4 text-[#E8A33D]" />
                    <span className="text-sm text-[#A79C8C]">{feature.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Side - Video & CTA */}
            <div className="flex flex-col items-center gap-4">
              <motion.div
                className="relative w-48 h-32 md:w-64 md:h-40 rounded-xl overflow-hidden shadow-lg shadow-[#E8A33D]/20 border border-[#E8A33D]/30"
                animate={{
                  scale: isHovered ? 1.05 : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  className="w-full h-full object-cover"
                >
                  <source src="/football.mp4" type="video/mp4" />
                </video>
              </motion.div>

              <motion.button
                onClick={() => router.push('/dashboard/football-team')}
                className="group px-8 py-4 bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] text-[#0B0912] rounded-2xl font-bold hover:shadow-2xl hover:shadow-[#E8A33D]/30 transition-all flex items-center gap-3 relative overflow-hidden w-full justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Join Team Now</span>
                <motion.div
                  animate={{ x: isHovered ? 5 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: '-100%' }}
                  animate={{ x: isHovered ? '100%' : '-100%' }}
                  transition={{ duration: 0.6 }}
                />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Profile Update Promotional Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative overflow-hidden bg-gradient-to-br from-[#1A1430] via-[#150F20] to-[#1A1430] border border-[#14B8A6]/20 rounded-3xl p-6 md:p-8"
        onMouseEnter={() => setIsProfileHovered(true)}
        onMouseLeave={() => setIsProfileHovered(false)}
      >
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <motion.div
                className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-[#14B8A6]/10 border border-[#14B8A6]/20 rounded-full"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                <Camera className="w-4 h-4 text-[#14B8A6]" />
                <span className="text-sm font-medium text-[#14B8A6]">📸 New Feature</span>
              </motion.div>

              <motion.h2
                className="text-3xl md:text-4xl font-bold text-[#F5F0E8] mb-3"
              >
                Update Your
                <motion.span
                  className="block text-[#14B8A6]"
                  animate={{
                    color: ['#14B8A6', '#E8A33D', '#14B8A6'],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  Profile Today!
                </motion.span>
              </motion.h2>

              <p className="text-[#A79C8C] max-w-lg text-lg">
                Add your profile photo and update your personal details. Let your fellow students see who you are!
              </p>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 mt-4">
                {[
                  { icon: User, label: 'Profile Photo' },
                  { icon: Camera, label: 'Personal Details' },
                  { icon: Sparkles, label: 'Stand Out' },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-2 px-3 py-2 bg-[#2A2438]/30 border border-[#2A2438]/50 rounded-lg"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <feature.icon className="w-4 h-4 text-[#14B8A6]" />
                    <span className="text-sm text-[#A79C8C]">{feature.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Side - Profile Icon & CTA */}
            <div className="flex flex-col items-center gap-4">
              <motion.div
                className="relative w-24 h-24 md:w-32 md:h-32"
                animate={{
                  rotate: isProfileHovered ? 360 : 0,
                }}
                transition={{ duration: 2, type: "spring" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6] to-[#E8A33D] rounded-full opacity-20 blur-2xl" />
                <div className="relative w-full h-full bg-gradient-to-br from-[#14B8A6] to-[#0D9488] rounded-full flex items-center justify-center shadow-lg shadow-[#14B8A6]/20">
                  <User className="w-12 h-12 md:w-16 md:h-16 text-[#0B0912]" />
                </div>
              </motion.div>

              <motion.button
                onClick={() => router.push('/dashboard/profile')}
                className="group px-8 py-4 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-[#0B0912] rounded-2xl font-bold hover:shadow-2xl hover:shadow-[#14B8A6]/30 transition-all flex items-center gap-3 relative overflow-hidden w-full justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Update Profile</span>
                <motion.div
                  animate={{ x: isProfileHovered ? 5 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: '-100%' }}
                  animate={{ x: isProfileHovered ? '100%' : '-100%' }}
                  transition={{ duration: 0.6 }}
                />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}