'use client';

import {
  Trophy,
  Users,
  Calendar,
  Briefcase,
  Clock,
  BookOpen,
  School,
  ArrowRight,
  Sparkles,
  User,
  Camera,
  LayoutDashboard,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// ============================================
// QUICK ACTION CARD
// ============================================
interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  path: string;
  delay: number;
}

function QuickAction({
  icon,
  label,
  description,
  path,
  delay,
}: QuickActionProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => router.push(path)}
      className="relative group overflow-hidden rounded-2xl bg-[#0D1E35] border border-[#1A3050] p-4 sm:p-6 text-left transition-all duration-500 hover:border-[#E8A33D]/30 hover:shadow-2xl hover:shadow-[#E8A33D]/10 w-full min-w-0"
    >
      {/* Animated gold glow - using your color */}
      <motion.div
        className="absolute inset-0 bg-[#E8A33D]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        animate={
          isHovered
            ? {
                scale: [1, 1.05, 1],
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Teal glow effect - using your color */}
      <motion.div
        className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-[#14B8A6]/5 blur-3xl"
        animate={
          isHovered
            ? {
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.6, 0.3],
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="p-3 rounded-xl bg-[#E8A33D]/10 text-[#E8A33D] flex-shrink-0">
            {icon}
          </div>
          <motion.div
            animate={isHovered ? { x: 0, opacity: 1 } : { x: -10, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-[#E8A33D] flex-shrink-0"
          >
            <ArrowRight className="w-5 h-5" />
          </motion.div>
        </div>
        <h3 className="text-white font-bold text-base sm:text-lg mb-1 truncate">
          {label}
        </h3>
        <p className="text-[#8A8278] text-xs sm:text-sm truncate">
          {description}
        </p>
      </div>

      {/* Animated bottom line with your gradient colors */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-[#E8A33D] to-[#14B8A6]"
        initial={{ width: '0%' }}
        animate={isHovered ? { width: '100%' } : { width: '0%' }}
        transition={{ duration: 0.4 }}
      />
    </motion.button>
  );
}

// ============================================
// MAIN DASHBOARD PAGE
// ============================================
export default function DashboardPage() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [isProfileHovered, setIsProfileHovered] = useState(false);
  
  // Get greeting based on time of day without using effect
  const getGreeting = () => {
    const now = new Date();
    const hours = now.getHours();
    if (hours < 12) return 'Good Morning';
    else if (hours < 17) return 'Good Afternoon';
    else return 'Good Evening';
  };

  const greeting = getGreeting();

  // Quick actions with cleaning rota
  const quickActions = [
    {
      icon: <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />,
      label: 'My Courses',
      description: 'Access your enrolled courses',
      path: '/dashboard/courses',
      delay: 0.5,
    },
    {
      icon: <School className="w-5 h-5 sm:w-6 sm:h-6" />,
      label: 'Tech Centers',
      description: 'Browse all tech centers',
      path: '/dashboard/students', // Changed to students page
      delay: 0.6,
    },
    {
      icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />,
      label: 'Students',
      description: 'View all students',
      path: '/dashboard/students',
      delay: 0.7,
    },
    {
      icon: <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />,
      label: 'Internships',
      description: 'Browse internships',
      path: '/dashboard/internships',
      delay: 0.8,
    },
    {
      icon: <Clock className="w-5 h-5 sm:w-6 sm:h-6" />,
      label: 'Cleaning Rota',
      description: 'View your cleaning schedule',
      path: '/dashboard/cleaning',
      delay: 0.9,
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* ============================================
          BACKGROUND - USING YOUR COLORS
      ============================================ */}

      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(232, 163, 61, 0.15) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Diagonal pattern */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(45deg, transparent 48%, rgba(232, 163, 61, 0.05) 48%, rgba(232, 163, 61, 0.05) 52%, transparent 52%), linear-gradient(-45deg, transparent 48%, rgba(20, 184, 166, 0.05) 48%, rgba(20, 184, 166, 0.05) 52%, transparent 52%)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Animated gold orb - using your color */}
      <motion.div
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#E8A33D]/5 blur-3xl pointer-events-none"
        animate={{
          x: [0, -50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Animated teal orb - using your color */}
      <motion.div
        className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#14B8A6]/5 blur-3xl pointer-events-none"
        animate={{
          x: [0, 40, 0],
          y: [0, -25, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Animated coral orb - using your color */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#FB7185]/3 blur-3xl pointer-events-none"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* ============================================
          ANIMATED DASHBOARD HERO
      ============================================ */}

      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 mb-6 sm:mb-8 overflow-hidden rounded-2xl sm:rounded-3xl bg-[#0D1E35] border border-[#E8A33D]/20"
      >
        {/* Gold glow - using your color */}
        <motion.div
          className="absolute -top-40 -right-32 w-[420px] h-[420px] rounded-full bg-[#E8A33D]/10 blur-3xl pointer-events-none"
          animate={{
            x: [0, -35, 0],
            y: [0, 25, 0],
            scale: [1, 1.12, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Teal glow - using your color */}
        <motion.div
          className="absolute -bottom-40 -left-20 w-[360px] h-[360px] rounded-full bg-[#14B8A6]/10 blur-3xl pointer-events-none"
          animate={{
            x: [0, 45, 0],
            y: [0, -20, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Rotating gold ring - using your color */}
        <motion.div
          className="absolute -right-24 -top-24 w-[300px] h-[300px] rounded-full border border-[#E8A33D]/10 pointer-events-none"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Rotating teal ring - using your color */}
        <motion.div
          className="absolute -right-8 -top-8 w-[190px] h-[190px] rounded-full border border-[#14B8A6]/10 pointer-events-none"
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Floating particles - using your colors */}
        {[...Array(14)].map((_, index) => (
          <motion.span
            key={index}
            className="absolute w-1 h-1 rounded-full bg-[#E8A33D]/50 pointer-events-none"
            style={{
              left: `${5 + index * 7}%`,
              bottom: `${12 + (index % 5) * 13}%`,
            }}
            animate={{
              y: [-10, -55, -10],
              opacity: [0, 0.8, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 4 + (index % 4),
              repeat: Infinity,
              delay: index * 0.35,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Hero Header */}
        <div className="relative z-10 px-4 sm:px-6 md:px-8 pt-5 sm:pt-7 pb-4 sm:pb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Animated vertical line with your gradient */}
            <motion.div
              className="h-8 sm:h-10 w-1 rounded-full bg-gradient-to-b from-[#E8A33D] to-[#14B8A6]"
              animate={{
                scaleY: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Dashboard icon with your colors */}
            <motion.div
              className="relative flex-shrink-0"
              animate={{
                y: [0, -4, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {/* Icon glow with your color */}
              <motion.div
                className="absolute inset-0 rounded-xl bg-[#E8A33D]/30 blur-xl"
                animate={{
                  opacity: [0.3, 0.65, 0.3],
                  scale: [0.9, 1.12, 0.9],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Rotating ring with your color */}
              <motion.div
                className="absolute -inset-2 rounded-2xl border border-[#E8A33D]/20"
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />

              <div className="relative flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#E8A33D] to-[#C97F1F] shadow-xl shadow-[#E8A33D]/20">
                <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </motion.div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.15,
              }}
              className="min-w-0"
            >
              <span className="block text-[8px] sm:text-[10px] md:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[#E8A33D] font-semibold mb-0.5 sm:mb-1">
                {greeting}
              </span>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white truncate">
                Dashboard
              </h1>
            </motion.div>
          </div>
        </div>

        {/* Scrolling Text with your colors */}
        <div className="relative overflow-hidden border-t border-b border-white/5 py-3 sm:py-5">
          {/* Left fade */}
          <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 md:w-28 z-20 bg-gradient-to-r from-[#0D1E35] to-transparent pointer-events-none" />

          {/* Right fade */}
          <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 md:w-28 z-20 bg-gradient-to-l from-[#0D1E35] to-transparent pointer-events-none" />

          <motion.div
            className="flex w-max whitespace-nowrap"
            animate={{
              x: ['0%', '-50%'],
            }}
            transition={{
              duration: 28,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {/* Text items with your colors */}
            {[
              'Internships',
              'Support Groups',
              'Temple Trips',
              'Cleaning Rota',
              'Football Team',
              'Update Profile',
            ].map((text, index) => (
              <div key={index} className="flex items-center gap-5 sm:gap-7 md:gap-9 px-3 sm:px-4 md:px-5">
                <span className="text-xs sm:text-sm md:text-base font-semibold text-white">
                  {text}
                </span>
                <span className="text-[#E8A33D] text-[8px] sm:text-[10px] md:text-xs flex-shrink-0">✦</span>
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {[
              'Internships',
              'Support Groups',
              'Temple Trips',
              'Cleaning Rota',
              'Football Team',
              'Update Profile',
            ].map((text, index) => (
              <div key={`dup-${index}`} className="flex items-center gap-5 sm:gap-7 md:gap-9 px-3 sm:px-4 md:px-5">
                <span className="text-xs sm:text-sm md:text-base font-semibold text-white">
                  {text}
                </span>
                <span className="text-[#14B8A6] text-[8px] sm:text-[10px] md:text-xs flex-shrink-0">✦</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Animated bottom light with your gradient */}
        <motion.div
          className="h-px w-full bg-gradient-to-r from-transparent via-[#E8A33D]/50 to-transparent"
          animate={{
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.section>

      {/* ============================================
          QUICK LINKS SECTION
      ============================================ */}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          delay: 0.3,
        }}
        className="relative z-10 mb-6"
      >
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <motion.div
            className="h-4 sm:h-5 w-1 rounded-full bg-[#E8A33D]"
            animate={{
              scaleY: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          <h2 className="text-base sm:text-lg font-bold text-white">
            Quick Links
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {quickActions.map((action, index) => (
            <QuickAction key={index} {...action} />
          ))}
        </div>
      </motion.div>

      {/* ============================================
          FOOTBALL TEAM PROMOTIONAL CARD
      ============================================ */}

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.6,
          delay: 0.7,
        }}
        className="relative overflow-hidden bg-[#0D1E35] border border-[#E8A33D]/30 rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 group hover:shadow-2xl hover:shadow-[#E8A33D]/20 transition-all duration-500"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Gold glow - using your color */}
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#E8A33D]/10 to-transparent rounded-full blur-3xl"
          animate={
            isHovered
              ? {
                  scale: 1.15,
                  opacity: 0.8,
                }
              : {
                  scale: 1,
                  opacity: 0.5,
                }
          }
          transition={{
            duration: 0.5,
          }}
        />

        {/* Coral glow - using your color */}
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-[#FB7185]/5 to-transparent rounded-full blur-3xl"
          animate={{
            x: [0, 20, 0],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
            {/* Icon with your colors */}
            <motion.div
              className="relative flex-shrink-0"
              animate={{
                y: [0, -3, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#E8A33D] to-[#FB7185] rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />

              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#E8A33D] to-[#C97F1F] flex items-center justify-center shadow-2xl shadow-[#E8A33D]/30">
                <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
            </motion.div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Badge with your colors */}
              <motion.div
                className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1 mb-1.5 sm:mb-2 bg-[#E8A33D]/10 border border-[#E8A33D]/20 rounded-full"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              >
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#E8A33D]" />

                <span className="text-[10px] sm:text-xs font-semibold text-[#E8A33D] whitespace-nowrap">
                  Registration Open
                </span>
              </motion.div>

              <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2 truncate">
                Football Team
              </h3>

              <p className="text-[#8A8278] text-xs sm:text-sm mb-3 sm:mb-4 truncate">
                Represent your tech center in the football league
              </p>

              {/* Feature tags */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {[
                  {
                    icon: Users,
                    label: 'Team Spirit',
                  },
                  {
                    icon: Calendar,
                    label: 'Weekly Matches',
                  },
                ].map((feature, idx) => (
                  <motion.div
                    key={idx}
                    className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-[#112240] border border-[#1A3050] rounded-lg"
                    whileHover={{
                      y: -2,
                    }}
                    transition={{
                      duration: 0.2,
                    }}
                  >
                    <feature.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#E8A33D]" />

                    <span className="text-[10px] sm:text-xs text-[#C4BDB5] whitespace-nowrap">
                      {feature.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA Button with your colors */}
            <motion.button
              onClick={() => router.push('/dashboard/football-team')}
              className="flex-shrink-0 px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] text-[#0A1628] rounded-xl font-bold text-xs sm:text-sm hover:shadow-2xl hover:shadow-[#E8A33D]/40 transition-all duration-300 flex items-center gap-1.5 sm:gap-2"
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
            >
              <span>Join</span>

              <motion.span
                initial={{
                  x: 0,
                }}
                whileHover={{
                  x: 4,
                }}
                transition={{
                  duration: 0.2,
                }}
              >
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </motion.span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ============================================
          PROFILE UPDATE PROMOTIONAL CARD
      ============================================ */}

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.6,
          delay: 0.85,
        }}
        className="relative overflow-hidden bg-[#0D1E35] border border-[#14B8A6]/30 rounded-2xl p-4 sm:p-6 group hover:shadow-2xl hover:shadow-[#14B8A6]/20 transition-all duration-500"
        onMouseEnter={() => setIsProfileHovered(true)}
        onMouseLeave={() => setIsProfileHovered(false)}
      >
        {/* Teal glow - using your color */}
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#14B8A6]/10 to-transparent rounded-full blur-3xl"
          animate={
            isProfileHovered
              ? {
                  scale: 1.15,
                  opacity: 0.8,
                }
              : {
                  scale: 1,
                  opacity: 0.5,
                }
          }
          transition={{
            duration: 0.5,
          }}
        />

        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-[#0D9488]/5 to-transparent rounded-full blur-3xl"
          animate={{
            x: [0, 20, 0],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
            {/* Icon with your colors */}
            <motion.div
              className="relative flex-shrink-0"
              animate={{
                y: [0, -3, 0],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />

              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#14B8A6] to-[#0D9488] flex items-center justify-center shadow-2xl shadow-[#14B8A6]/30">
                <User className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
            </motion.div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Badge with your colors */}
              <motion.div
                className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1 mb-1.5 sm:mb-2 bg-[#14B8A6]/10 border border-[#14B8A6]/20 rounded-full"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              >
                <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#14B8A6]" />

                <span className="text-[10px] sm:text-xs font-semibold text-[#14B8A6] whitespace-nowrap">
                  New Feature
                </span>
              </motion.div>

              <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2 truncate">
                Update Profile
              </h3>

              <p className="text-[#8A8278] text-xs sm:text-sm mb-3 sm:mb-4 truncate">
                Add your profile photo and update your details
              </p>

              {/* Feature tags */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {[
                  {
                    icon: Camera,
                    label: 'Profile Photo',
                  },
                  {
                    icon: Sparkles,
                    label: 'Stand Out',
                  },
                ].map((feature, idx) => (
                  <motion.div
                    key={idx}
                    className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-[#112240] border border-[#1A3050] rounded-lg"
                    whileHover={{
                      y: -2,
                    }}
                    transition={{
                      duration: 0.2,
                    }}
                  >
                    <feature.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#14B8A6]" />

                    <span className="text-[10px] sm:text-xs text-[#C4BDB5] whitespace-nowrap">
                      {feature.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA Button with your colors */}
            <motion.button
              onClick={() => router.push('/dashboard/profile')}
              className="flex-shrink-0 px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white rounded-xl font-bold text-xs sm:text-sm hover:shadow-2xl hover:shadow-[#14B8A6]/40 transition-all duration-300 flex items-center gap-1.5 sm:gap-2"
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
            >
              <span>Update</span>

              <motion.span
                initial={{
                  x: 0,
                }}
                whileHover={{
                  x: 4,
                }}
                transition={{
                  duration: 0.2,
                }}
              >
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </motion.span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ============================================
          FLOATING AI BUTTON
      ============================================ */}

      <Link
        href="/dashboard/ai"
        className="fixed bottom-4 right-4 z-40 flex items-center gap-1.5 sm:gap-2.5 rounded-2xl border-2 border-white/20 bg-gradient-to-br from-[#E8A33D] via-[#FB7185] to-[#14B8A6] px-2.5 sm:px-3.5 py-2 sm:py-3 text-white shadow-2xl shadow-[#E8A33D]/40 transition-all duration-300 hover:scale-105"
      >
        <div className="relative">
          <Image 
            src="/atbriz.png" 
            alt="Atbriz Ai" 
            width={28} 
            height={28} 
            className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl object-cover" 
          />
          <div className="absolute -right-1 -top-1.5 rounded-full bg-green-400 p-1" />
        </div>
        <span className="whitespace-nowrap text-[10px] sm:text-xs font-bold">Atbriz Ai</span>
      </Link>
    </div>
  );
}