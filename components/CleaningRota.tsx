'use client';

import { useState } from 'react';
import { Calendar, Users, Clock, Sparkles, Bell, Shield, Star, Zap, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Exact user data matching your screenshots
const weekData = {
  'First Week': {
    days: [
      {
        day: 'Monday',
        date: 'June 29, 2026',
        users: [
          { name: 'Dira Luke' },
          { name: 'Ddamba Reagan' },
          { name: 'Rubangakene Brian Bernie' },
          { name: 'Nakimali Esther' },
        ]
      },
      {
        day: 'Tuesday',
        date: 'June 30, 2026',
        users: [
          { name: 'Jimmy Kalyango' },
          { name: 'Musanabera Yvonne' },
          { name: 'Ineza Diella' },
          { name: 'Nabulo Rosemary' },
          { name: 'Edwin Kambale' },
        ]
      },
      {
        day: 'Wednesday',
        date: 'July 1, 2026',
        users: [
          { name: 'Michelle Yuku' },
          { name: 'Ayesigwa Skemper' },
          { name: 'lugolobi Tony Leon' },
          { name: 'SENGA SANKY' },
        ]
      },
      {
        day: 'Thursday',
        date: 'July 2, 2026',
        users: [
          { name: 'KANYIKE JONATHAN' },
          { name: 'Fredrick Oketcho' },
          { name: 'Rwotomiyo Isaiah' },
          { name: 'MFITUNDINDA BAKER' },
        ]
      },
      {
        day: 'Friday',
        date: 'July 3, 2026',
        users: [
          { name: 'Dahline Kim' },
          { name: 'Okongo, Richardben' },
          { name: 'Julius Mwanika' },
          { name: 'Marvin Kalule' },
        ]
      }
    ]
  },
  'Second Week': {
    days: [
      {
        day: 'Monday',
        date: 'July 6, 2026',
        users: [
          { name: 'Babriye Badria' },
          { name: 'Brendah Ainembabazi' },
          { name: 'Hyla Nalwadda' },
          { name: 'Masaazi Faswiiha Was...' },
        ]
      },
      {
        day: 'Tuesday',
        date: 'July 7, 2026',
        users: [
          { name: 'Rediat Emmanuel' },
          { name: 'Jordan Edward' },
          { name: 'Mubiru Destiny' },
          { name: 'Kintu Isaac' },
          { name: 'Nalubega Maria' },
        ]
      },
      {
        day: 'Wednesday',
        date: 'July 8, 2026',
        users: [
          { name: 'Apieun Isaac' },
          { name: 'Mutumba Gilbert' },
          { name: 'Adriko Cyrus' },
          { name: 'Tendo Maria' },
        ]
      },
      {
        day: 'Thursday',
        date: 'July 9, 2026',
        users: [
          { name: 'Columbus Olanya' },
          { name: 'Tom Kasozi' },
          { name: 'Roike Junior' },
          { name: 'Chris Bwambale' },
        ]
      },
      {
        day: 'Friday',
        date: 'July 10, 2026',
        users: [
          { name: 'Princess Agatha Natamba' },
          { name: 'Deus Byomuhangi' },
          { name: 'Abaho Ivan' },
          { name: 'Nakyanzi Bridget' },
        ]
      }
    ]
  },
  'Third Week': {
    days: [
      {
        day: 'Monday',
        date: 'July 13, 2026',
        users: [
          { name: 'Gertrude Nakitende' },
          { name: 'Sasli Arafat' },
          { name: 'Lisa Nyangoma' },
          { name: 'Bulyaba Tracy' },
        ]
      },
      {
        day: 'Tuesday',
        date: 'July 14, 2026',
        users: [
          { name: 'Vanessa Lwaya' },
          { name: 'Berna Nakalyango' },
          { name: 'Kabanda Ronald' },
          { name: 'Christine Nasaazi' },
        ]
      },
      {
        day: 'Wednesday',
        date: 'July 15, 2026',
        users: [
          { name: 'ayamo mary' },
          { name: 'Lovely Britney' },
          { name: 'Majok Aguer' },
          { name: 'Ssekyanzi Erick Kityo' },
          { name: 'Samuel Were' },
        ]
      },
      {
        day: 'Thursday',
        date: 'July 16, 2026',
        users: [
          { name: 'Majok Manytil' },
          { name: 'Sayuni Elizabeth' },
          { name: 'Rosemary Maya Atm' },
          { name: 'Maria Akumu' },
          { name: 'Baguma Julius' },
        ]
      },
      {
        day: 'Friday',
        date: 'July 17, 2026',
        users: [
          { name: 'Max Tinka' },
          { name: 'Cyrus Ssekiranda' },
          { name: 'Nalubega Safina' },
          { name: 'Sekirangi Edward Tendo ...' },
          { name: 'Racheal Christian Nakazzi' },
        ]
      }
    ]
  }
};

const getInitials = (name: string) => {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const getAvatarColor = (name: string) => {
  const colors = [
    'from-amber-400 to-amber-600',
    'from-emerald-400 to-emerald-600',
    'from-rose-400 to-rose-600',
    'from-indigo-400 to-indigo-600',
    'from-teal-400 to-teal-600',
    'from-purple-400 to-purple-600',
    'from-pink-400 to-pink-600',
    'from-cyan-400 to-cyan-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const getDayIcon = (day: string) => {
  const icons: Record<string, string> = {
    'Monday': '🌅',
    'Tuesday': '🌤️',
    'Wednesday': '☀️',
    'Thursday': '🌙',
    'Friday': '⭐',
  };
  return icons[day] || '📅';
};

const getDayEmoji = (day: string) => {
  const emojis: Record<string, string> = {
    'Monday': '🔵',
    'Tuesday': '🟢',
    'Wednesday': '🟡',
    'Thursday': '🟠',
    'Friday': '🔴',
  };
  return emojis[day] || '⚪';
};

// Duty Day Card Component
const DutyDayCard = ({ dayData, week, index }: { dayData: any; week: string; index: number }) => {
  const totalUsers = dayData.users.length;
  const dayName = dayData.day;
  const date = dayData.date;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="group relative bg-[#0B0912] border border-[#2A2438] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300"
    >
      {/* Glowing Border Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Top Accent Line */}
      <div className="h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />

      {/* Header */}
      <div className="relative px-5 pt-4 pb-3 border-b border-[#2A2438] bg-gradient-to-r from-[#150F20] to-[#1A1428]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 border border-amber-500/20 flex items-center justify-center text-2xl">
                {getDayIcon(dayName)}
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                  {dayName}
                </span>
                <span className="text-xs text-[#6B6358]">•</span>
                <span className="text-xs text-[#6B6358]">{getDayEmoji(dayName)}</span>
              </div>
              <p className="text-xs text-[#A79C8C]">{date}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
              <span className="text-xs font-bold text-amber-400">
                {totalUsers} Students
              </span>
            </div>
            <span className="text-[10px] text-[#6B6358] uppercase tracking-wider">{week}</span>
          </div>
        </div>
      </div>

      {/* Duty Alert */}
      <div className="relative px-5 py-3 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5 border-b border-[#2A2438]">
        <div className="flex items-start gap-2">
          <Bell className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-[#F5F0E8]">
              <span className="font-bold text-amber-400">Duty Call:</span> Report to Tech Center by{' '}
              <span className="font-bold text-amber-400">10:00 PM</span>
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Shield className="w-3 h-3 text-rose-400" />
              <p className="text-xs text-rose-400/80 font-medium">
                ⚠️ Non-compliance will lead to consequences
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="divide-y divide-[#1A1428]">
        {totalUsers === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-[#6B6358]">No students on duty</p>
          </div>
        ) : (
          dayData.users.map((user: any, userIndex: number) => {
            const initials = getInitials(user.name);
            const avatarColor = getAvatarColor(user.name);
            
            return (
              <motion.div
                key={userIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: userIndex * 0.03 }}
                className="group/user px-5 py-3 hover:bg-[#1A1428] transition-all duration-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-${avatarColor.split(' ')[1]}/20`}>
                      {initials}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-[#0B0912] flex items-center justify-center">
                      <Star className="w-2 h-2 text-[#0B0912]" fill="#0B0912" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#F5F0E8] truncate group-hover/user:text-amber-400 transition-colors">
                      {user.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <div className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      ON DUTY
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-2.5 bg-[#0B0912]/80 border-t border-[#1A1428] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[10px] text-[#6B6358]">
            {totalUsers} student{totalUsers !== 1 ? 's' : ''} assigned
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 text-[#6B6358]" />
          <span className="text-[10px] text-[#6B6358]">10:00 PM deadline</span>
        </div>
      </div>
    </motion.div>
  );
};

interface CleaningRotaProps {
  showTitle?: boolean;
  className?: string;
}

export default function CleaningRota({ showTitle = true, className = '' }: CleaningRotaProps) {
  const [selectedWeek, setSelectedWeek] = useState<'all' | 'First Week' | 'Second Week' | 'Third Week'>('all');
  const [hoveredFilter, setHoveredFilter] = useState<string | null>(null);

  const getCurrentWeekData = () => {
    if (selectedWeek === 'all') {
      const allDays: any[] = [];
      Object.keys(weekData).forEach(week => {
        const weekDays = weekData[week as keyof typeof weekData].days;
        weekDays.forEach(day => {
          allDays.push({
            ...day,
            week: week,
          });
        });
      });
      return allDays;
    }
    return weekData[selectedWeek].days.map(day => ({
      ...day,
      week: selectedWeek,
    }));
  };

  const days = getCurrentWeekData();
  const totalStudents = days.reduce((acc, day) => acc + day.users.length, 0);

  const filters = [
    { id: 'all', label: 'All Weeks', icon: Calendar },
    { id: 'First Week', label: 'Week 1', sub: 'Jun 29 - Jul 3' },
    { id: 'Second Week', label: 'Week 2', sub: 'Jul 6 - 10' },
    { id: 'Third Week', label: 'Week 3', sub: 'Jul 13 - 17' },
  ];

  return (
    <div className={`${className} max-w-4xl mx-auto`}>
      {/* Header */}
      {showTitle && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="relative">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20">
                <Sparkles className="w-7 h-7 text-amber-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 animate-ping" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#F5F0E8]" style={{ fontFamily: 'var(--font-display)' }}>
                Cleaning Rota
              </h2>
              <p className="text-sm text-[#A79C8C] flex items-center gap-2">
                <span>Weekly cleaning duty schedule</span>
                <span className="w-1 h-1 rounded-full bg-[#2A2438]" />
                <span className="text-amber-400 font-medium">{totalStudents} total assignments</span>
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Week Selector */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2 mb-8"
      >
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = selectedWeek === filter.id;
          const isHovered = hoveredFilter === filter.id;

          return (
            <motion.button
              key={filter.id}
              onClick={() => setSelectedWeek(filter.id as any)}
              onMouseEnter={() => setHoveredFilter(filter.id)}
              onMouseLeave={() => setHoveredFilter(null)}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`relative px-5 py-2.5 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-[#0B0912] font-bold shadow-lg shadow-amber-500/30'
                  : 'bg-[#150F20] border border-[#2A2438] text-[#A79C8C] hover:border-amber-500/30 hover:text-[#F5F0E8]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeFilter"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {Icon && <Icon className="w-4 h-4" />}
                <span className="text-sm font-medium">{filter.label}</span>
                {filter.sub && !isActive && (
                  <span className="text-[10px] text-[#6B6358] hidden sm:inline">• {filter.sub}</span>
                )}
                {isActive && filter.sub && (
                  <span className="text-[10px] text-[#0B0912]/70">• {filter.sub}</span>
                )}
              </span>
              {isActive && (
                <motion.div
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-amber-400 rounded-full"
                  layoutId="activeIndicator"
                />
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Duty Cards */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={selectedWeek}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {days.map((dayData, index) => (
            <DutyDayCard 
              key={`${dayData.week}-${dayData.day}-${index}`}
              dayData={dayData}
              week={dayData.week}
              index={index}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Footer Summary */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6"
      >
        <div className="bg-gradient-to-r from-[#150F20] to-[#1A1428] border border-[#2A2438] rounded-2xl p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Users className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#F5F0E8]">
                  {totalStudents} Total Registrations
                </p>
                <p className="text-xs text-[#6B6358]">
                  {selectedWeek === 'all' ? 'All weeks combined' : selectedWeek}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#6B6358]">
              <Clock className="w-4 h-4" />
              <span>
                Updated {new Date().toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}