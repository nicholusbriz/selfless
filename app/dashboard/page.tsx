'use client';

import { ArrowRight, Trophy, Users, Calendar, MapPin, Sparkles, User, Camera, Briefcase, HeartHandshake, Building2, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function MyGradesPage() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [isProfileHovered, setIsProfileHovered] = useState(false);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Subtle geometric pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
        backgroundSize: '24px 24px'
      }} />
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
        backgroundImage: `linear-gradient(45deg, transparent 48%, white 48%, white 52%, transparent 52%), linear-gradient(-45deg, transparent 48%, white 48%, white 52%, transparent 52%)`,
        backgroundSize: '60px 60px'
      }} />
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 relative z-10">
        <div className="h-8 w-px bg-[#2A2438]" />
        <h1 className="text-2xl font-bold text-[#F5F0E8]">
          Dashboard
        </h1>
      </div>

      {/* Quick Links Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mb-6"
      >
        <h2 className="text-lg font-bold text-[#F5F0E8] mb-4">Quick Links</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: Briefcase,
              label: 'Internships',
              path: '/dashboard/internships',
              color: 'from-[#E8A33D] to-[#C97F1F]',
              bgColor: 'bg-[#E8A33D]/10',
              borderColor: 'border-[#E8A33D]/20'
            },
            {
              icon: HeartHandshake,
              label: 'Support Groups',
              path: '/dashboard/support-groups',
              color: 'from-[#14B8A6] to-[#0D9488]',
              bgColor: 'bg-[#14B8A6]/10',
              borderColor: 'border-[#14B8A6]/20'
            },
            {
              icon: Building2,
              label: 'Temple Trips',
              path: '/dashboard/temple-trips',
              color: 'from-[#FB7185] to-[#E11D48]',
              bgColor: 'bg-[#FB7185]/10',
              borderColor: 'border-[#FB7185]/20'
            },
            {
              icon: Clock,
              label: 'Cleaning Rota',
              path: '/dashboard/cleaning',
              color: 'from-[#8B5CF6] to-[#6366F1]',
              bgColor: 'bg-[#8B5CF6]/10',
              borderColor: 'border-[#8B5CF6]/20'
            },
          ].map((link, index) => (
            <motion.button
              key={index}
              onClick={() => router.push(link.path)}
              className={`relative overflow-hidden ${link.bgColor} ${link.borderColor} border rounded-2xl p-4 text-left group hover:shadow-lg hover:shadow-[#E8A33D]/20 transition-all`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center mb-3 shadow-lg`}>
                <link.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-sm font-bold text-[#F5F0E8] mb-1">{link.label}</h3>
              <p className="text-xs text-[#A79C8C]">Quick access</p>
              <motion.div
                className="absolute inset-0 bg-white/5"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Football Team Promotional Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative overflow-hidden bg-gradient-to-br from-[#1A1430] via-[#150F20] to-[#1A1430] border border-[#E8A33D]/30 rounded-2xl p-6 mb-6 group hover:shadow-xl hover:shadow-[#E8A33D]/20 transition-all"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative z-10">
          <div className="flex items-start gap-4">
            <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-[#E8A33D] to-[#C97F1F] flex items-center justify-center flex-shrink-0 shadow-lg">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <motion.div
                className="inline-flex items-center gap-2 px-2 py-1 mb-2 bg-[#E8A33D]/10 border border-[#E8A33D]/20 rounded-full"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                <Sparkles className="w-3 h-3 text-[#E8A33D]" />
                <span className="text-xs font-medium text-[#E8A33D]">Registration Open</span>
              </motion.div>

              <h3 className="text-xl font-bold text-[#F5F0E8] mb-2">
                Football Team
              </h3>

              <p className="text-[#A79C8C] text-sm mb-4">
                Represent your tech center in the football league
              </p>

              <div className="flex flex-wrap gap-2">
                {[
                  { icon: Users, label: 'Team Spirit' },
                  { icon: Calendar, label: 'Weekly Matches' },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1.5 px-2 py-1 bg-[#2A2438]/30 border border-[#2A2438]/50 rounded-lg"
                  >
                    <feature.icon className="w-3 h-3 text-[#E8A33D]" />
                    <span className="text-xs text-[#A79C8C]">{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <motion.button
              onClick={() => router.push('/dashboard/football-team')}
              className="px-4 py-2 bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] text-[#0B0912] rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-[#E8A33D]/30 transition-all flex items-center gap-2 flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Join</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Profile Update Promotional Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="relative overflow-hidden bg-gradient-to-br from-[#1A1430] via-[#150F20] to-[#1A1430] border border-[#14B8A6]/30 rounded-2xl p-6 group hover:shadow-xl hover:shadow-[#14B8A6]/20 transition-all"
        onMouseEnter={() => setIsProfileHovered(true)}
        onMouseLeave={() => setIsProfileHovered(false)}
      >
        <div className="relative z-10">
          <div className="flex items-start gap-4">
            <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-[#14B8A6] to-[#0D9488] flex items-center justify-center flex-shrink-0 shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <motion.div
                className="inline-flex items-center gap-2 px-2 py-1 mb-2 bg-[#14B8A6]/10 border border-[#14B8A6]/20 rounded-full"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                <Camera className="w-3 h-3 text-[#14B8A6]" />
                <span className="text-xs font-medium text-[#14B8A6]">New Feature</span>
              </motion.div>

              <h3 className="text-xl font-bold text-[#F5F0E8] mb-2">
                Update Profile
              </h3>

              <p className="text-[#A79C8C] text-sm mb-4">
                Add your profile photo and update your personal details
              </p>

              <div className="flex flex-wrap gap-2">
                {[
                  { icon: Camera, label: 'Profile Photo' },
                  { icon: Sparkles, label: 'Stand Out' },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1.5 px-2 py-1 bg-[#2A2438]/30 border border-[#2A2438]/50 rounded-lg"
                  >
                    <feature.icon className="w-3 h-3 text-[#14B8A6]" />
                    <span className="text-xs text-[#A79C8C]">{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <motion.button
              onClick={() => router.push('/dashboard/profile')}
              className="px-4 py-2 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-[#0B0912] rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-[#14B8A6]/30 transition-all flex items-center gap-2 flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Update</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}