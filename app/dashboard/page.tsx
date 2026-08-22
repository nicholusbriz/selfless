'use client';

import {
  ArrowRight,
  Trophy,
  Users,
  Calendar,
  Sparkles,
  User,
  Camera,
  Briefcase,
  HeartHandshake,
  Building2,
  Clock,
  LayoutDashboard,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function DashboardPage() {
  const router = useRouter();

  const [isHovered, setIsHovered] = useState(false);
  const [isProfileHovered, setIsProfileHovered] = useState(false);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* ============================================
          BACKGROUND - MATCHING YOUR ORIGINAL DESIGN
      ============================================ */}

      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Diagonal pattern */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(45deg, transparent 48%, rgba(255,255,255,0.05) 48%, rgba(255,255,255,0.05) 52%, transparent 52%), linear-gradient(-45deg, transparent 48%, rgba(255,255,255,0.05) 48%, rgba(255,255,255,0.05) 52%, transparent 52%)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* ============================================
          ANIMATED DASHBOARD HERO
      ============================================ */}

      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 mb-8 overflow-hidden rounded-3xl bg-[#0D1E35] border border-[#E8A33D]/20"
      >
        {/* Large ambient gold glow */}
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

        {/* Large ambient teal glow */}
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

        {/* Decorative rotating ring */}
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

        {/* Second decorative rotating ring */}
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

        {/* Floating particles */}
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

        {/* ============================================
            HERO HEADER
        ============================================ */}

        <div className="relative z-10 px-6 md:px-8 pt-7 pb-6">
          <div className="flex items-center gap-4">
            {/* Animated vertical line */}
            <motion.div
              className="h-10 w-1 rounded-full bg-gradient-to-b from-[#E8A33D] to-[#14B8A6]"
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

            {/* Dashboard icon */}
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
              {/* Icon glow */}
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

              {/* Rotating icon ring */}
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

              <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#E8A33D] to-[#C97F1F] shadow-xl shadow-[#E8A33D]/20">
                <LayoutDashboard className="w-6 h-6 text-white" />
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
            >
              <span className="block text-[10px] md:text-xs uppercase tracking-[0.3em] text-[#E8A33D] font-semibold mb-1">
                Welcome
              </span>

              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Dashboard
              </h1>
            </motion.div>
          </div>
        </div>

        {/* ============================================
            SCROLLING TEXT
        ============================================ */}

        <div className="relative overflow-hidden border-t border-b border-white/5 py-5">
          {/* Left fade */}
          <div className="absolute left-0 top-0 bottom-0 w-20 md:w-28 z-20 bg-gradient-to-r from-[#0D1E35] to-transparent pointer-events-none" />

          {/* Right fade */}
          <div className="absolute right-0 top-0 bottom-0 w-20 md:w-28 z-20 bg-gradient-to-l from-[#0D1E35] to-transparent pointer-events-none" />

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
            {/* FIRST TEXT SET */}
            <div className="flex items-center gap-7 md:gap-9 pr-7 md:pr-9">
              <span className="text-sm md:text-base font-semibold text-white">
                Internships
              </span>

              <span className="text-[#E8A33D] text-xs">✦</span>

              <span className="text-sm md:text-base font-semibold text-white">
                Support Groups
              </span>

              <span className="text-[#14B8A6] text-xs">✦</span>

              <span className="text-sm md:text-base font-semibold text-white">
                Temple Trips
              </span>

              <span className="text-[#FB7185] text-xs">✦</span>

              <span className="text-sm md:text-base font-semibold text-white">
                Cleaning Rota
              </span>

              <span className="text-[#E8A33D] text-xs">✦</span>

              <span className="text-sm md:text-base font-semibold text-white">
                Football Team
              </span>

              <span className="text-[#14B8A6] text-xs">✦</span>

              <span className="text-sm md:text-base font-semibold text-white">
                Update Profile
              </span>

              <span className="text-[#E8A33D] text-xs">✦</span>
            </div>

            {/* DUPLICATE SET FOR SEAMLESS LOOP */}
            <div className="flex items-center gap-7 md:gap-9 pr-7 md:pr-9">
              <span className="text-sm md:text-base font-semibold text-white">
                Internships
              </span>

              <span className="text-[#E8A33D] text-xs">✦</span>

              <span className="text-sm md:text-base font-semibold text-white">
                Support Groups
              </span>

              <span className="text-[#14B8A6] text-xs">✦</span>

              <span className="text-sm md:text-base font-semibold text-white">
                Temple Trips
              </span>

              <span className="text-[#FB7185] text-xs">✦</span>

              <span className="text-sm md:text-base font-semibold text-white">
                Cleaning Rota
              </span>

              <span className="text-[#E8A33D] text-xs">✦</span>

              <span className="text-sm md:text-base font-semibold text-white">
                Football Team
              </span>

              <span className="text-[#14B8A6] text-xs">✦</span>

              <span className="text-sm md:text-base font-semibold text-white">
                Update Profile
              </span>

              <span className="text-[#E8A33D] text-xs">✦</span>
            </div>
          </motion.div>
        </div>

        {/* Animated bottom light */}
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
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            className="h-5 w-1 rounded-full bg-[#E8A33D]"
            animate={{
              scaleY: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          <h2 className="text-lg font-bold text-white">
            Quick Links
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: Briefcase,
              label: 'Internships',
              path: '/dashboard/internships',
              color: 'from-[#E8A33D] to-[#C97F1F]',
              bgColor: 'bg-[#E8A33D]/10',
              borderColor: 'border-[#E8A33D]/20',
            },
            {
              icon: HeartHandshake,
              label: 'Support Groups',
              path: '/dashboard/support-groups',
              color: 'from-[#14B8A6] to-[#0D9488]',
              bgColor: 'bg-[#14B8A6]/10',
              borderColor: 'border-[#14B8A6]/20',
            },
            {
              icon: Building2,
              label: 'Temple Trips',
              path: '/dashboard/temple-trips',
              color: 'from-[#FB7185] to-[#E11D48]',
              bgColor: 'bg-[#FB7185]/10',
              borderColor: 'border-[#FB7185]/20',
            },
            {
              icon: Clock,
              label: 'Cleaning Rota',
              path: '/dashboard/cleaning',
              color: 'from-[#8B5CF6] to-[#6366F1]',
              bgColor: 'bg-[#8B5CF6]/10',
              borderColor: 'border-[#8B5CF6]/20',
            },
          ].map((link, index) => (
            <motion.button
              key={index}
              onClick={() => router.push(link.path)}
              className={`relative overflow-hidden ${link.bgColor} ${link.borderColor} border rounded-2xl p-4 text-left group hover:shadow-xl hover:shadow-[#E8A33D]/20 transition-all duration-300`}
              whileHover={{
                scale: 1.03,
                y: -2,
              }}
              whileTap={{
                scale: 0.97,
              }}
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.4,
                delay: 0.4 + index * 0.1,
              }}
            >
              {/* Icon with glow */}
              <div
                className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center mb-3 shadow-lg shadow-[#E8A33D]/20`}
              >
                <link.icon className="w-5 h-5 text-white" />

                {/* Pulse ring */}
                <motion.div
                  className="absolute inset-0 rounded-xl border border-white/20"
                  animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.3, 0, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.3,
                    ease: 'easeInOut',
                  }}
                />

                {/* Hover pulse */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#E8A33D] to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              </div>

              <h3 className="text-sm font-bold text-white mb-1">
                {link.label}
              </h3>

              <p className="text-xs text-[#8A8278]">
                Quick access
              </p>

              {/* Arrow indicator */}
              <motion.div
                className="absolute bottom-4 right-4 text-[#E8A33D] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{
                  x: -10,
                }}
                whileHover={{
                  x: 0,
                }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.div>

              {/* Hover shine */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
                initial={{
                  x: '-100%',
                }}
                whileHover={{
                  x: '100%',
                }}
                transition={{
                  duration: 0.6,
                }}
              />
            </motion.button>
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
        className="relative overflow-hidden bg-[#0D1E35] border border-[#E8A33D]/30 rounded-2xl p-6 mb-6 group hover:shadow-2xl hover:shadow-[#E8A33D]/20 transition-all duration-500"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background glow */}
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
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* Icon with glow */}
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

              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E8A33D] to-[#C97F1F] flex items-center justify-center shadow-2xl shadow-[#E8A33D]/30">
                <Trophy className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Badge */}
              <motion.div
                className="inline-flex items-center gap-2 px-3 py-1 mb-2 bg-[#E8A33D]/10 border border-[#E8A33D]/20 rounded-full"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#E8A33D]" />

                <span className="text-xs font-semibold text-[#E8A33D]">
                  Registration Open
                </span>
              </motion.div>

              <h3 className="text-xl font-bold text-white mb-2">
                Football Team
              </h3>

              <p className="text-[#8A8278] text-sm mb-4">
                Represent your tech center in the football league
              </p>

              {/* Feature tags */}
              <div className="flex flex-wrap gap-2">
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
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#112240] border border-[#1A3050] rounded-lg"
                    whileHover={{
                      y: -2,
                    }}
                    transition={{
                      duration: 0.2,
                    }}
                  >
                    <feature.icon className="w-3.5 h-3.5 text-[#E8A33D]" />

                    <span className="text-xs text-[#C4BDB5]">
                      {feature.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <motion.button
              onClick={() => router.push('/dashboard/football-team')}
              className="flex-shrink-0 px-5 py-2.5 bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] text-[#0A1628] rounded-xl font-bold text-sm hover:shadow-2xl hover:shadow-[#E8A33D]/40 transition-all duration-300 flex items-center gap-2"
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
                <ArrowRight className="w-4 h-4" />
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
        className="relative overflow-hidden bg-[#0D1E35] border border-[#14B8A6]/30 rounded-2xl p-6 group hover:shadow-2xl hover:shadow-[#14B8A6]/20 transition-all duration-500"
        onMouseEnter={() => setIsProfileHovered(true)}
        onMouseLeave={() => setIsProfileHovered(false)}
      >
        {/* Background glow */}
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
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* Icon with glow */}
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

              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#14B8A6] to-[#0D9488] flex items-center justify-center shadow-2xl shadow-[#14B8A6]/30">
                <User className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Badge */}
              <motion.div
                className="inline-flex items-center gap-2 px-3 py-1 mb-2 bg-[#14B8A6]/10 border border-[#14B8A6]/20 rounded-full"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              >
                <Camera className="w-3.5 h-3.5 text-[#14B8A6]" />

                <span className="text-xs font-semibold text-[#14B8A6]">
                  New Feature
                </span>
              </motion.div>

              <h3 className="text-xl font-bold text-white mb-2">
                Update Profile
              </h3>

              <p className="text-[#8A8278] text-sm mb-4">
                Add your profile photo and update your personal details
              </p>

              {/* Feature tags */}
              <div className="flex flex-wrap gap-2">
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
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#112240] border border-[#1A3050] rounded-lg"
                    whileHover={{
                      y: -2,
                    }}
                    transition={{
                      duration: 0.2,
                    }}
                  >
                    <feature.icon className="w-3.5 h-3.5 text-[#14B8A6]" />

                    <span className="text-xs text-[#C4BDB5]">
                      {feature.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <motion.button
              onClick={() => router.push('/dashboard/profile')}
              className="flex-shrink-0 px-5 py-2.5 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white rounded-xl font-bold text-sm hover:shadow-2xl hover:shadow-[#14B8A6]/40 transition-all duration-300 flex items-center gap-2"
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
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}