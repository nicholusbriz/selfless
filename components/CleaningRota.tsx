'use client';

import { useState } from 'react';
import { Calendar, Users, Clock, Sparkles, Bell, Shield, Star, Zap, Award, AlertCircle, MessageCircle, HelpCircle } from 'lucide-react';
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
          { name: 'Masaazi Faswiiha Waswa' },
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
          { name: 'Sekirangi Edward Tendo' },
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

const getDayEmoji = (day: string) => {
  const emojis: Record<string, string> = {
    'Monday': '🌅',
    'Tuesday': '🌤️',
    'Wednesday': '☀️',
    'Thursday': '🌙',
    'Friday': '⭐',
  };
  return emojis[day] || '📅';
};

// New: Get a quirky time-based greeting
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning shift";
  if (hour < 17) return "Afternoon shift";
  return "Evening shift";
};

// Duty Day Card Component - Made more organic and less structured
const DutyDayCard = ({ dayData, week, index }: { dayData: any; week: string; index: number }) => {
  const totalUsers = dayData.users.length;
  const dayName = dayData.day;
  const date = dayData.date;
  const [showHelp, setShowHelp] = useState(false);

  // Random quirky fact about the day
  const dayFacts = {
    'Monday': "Start the week strong! 💪",
    'Tuesday': "Keep the momentum going! 🚀",
    'Wednesday': "Halfway there! 🎯",
    'Thursday': "Almost weekend vibes! ✨",
    'Friday': "Last stretch! 🏁",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className="group relative bg-[#0B0912] border border-[#2A2438] rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all duration-300"
    >
      {/* Subtle gradient background - more organic feel */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      {/* Day header - more casual and friendly */}
      <div className="relative px-5 pt-4 pb-3 border-b border-[#2A2438] bg-[#150F20]/50">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400/10 to-amber-600/10 border border-amber-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
              {getDayEmoji(dayName)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-[#F5F0E8]">
                  {dayName}
                </span>
                <span className="text-xs text-[#6B6358]">•</span>
                <span className="text-xs text-[#A79C8C]">{date}</span>
              </div>
              <p className="text-xs text-[#6B6358] mt-0.5 italic">
                {dayFacts[dayName as keyof typeof dayFacts]}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
              <span className="text-xs font-medium text-amber-400">
                {totalUsers} {totalUsers === 1 ? 'student' : 'students'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Banner - New enhancement */}
      <div className="relative px-5 py-2.5 bg-gradient-to-r from-emerald-500/10 via-amber-500/5 to-emerald-500/10 border-b border-[#2A2438]">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2 py-0.5 bg-emerald-500/20 rounded-full text-emerald-400 font-medium text-[10px] uppercase tracking-wider">
            Open
          </span>
          <span className="text-[#A79C8C]">📢 Registration is ongoing</span>
          <span className="w-1 h-1 rounded-full bg-[#2A2438]" />
          <button 
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center gap-1 text-amber-400/70 hover:text-amber-400 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Need help?</span>
          </button>
        </div>
        
        {/* Help tooltip - New enhancement */}
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-5 right-5 top-full mt-1 p-3 bg-[#1A1428] border border-[#2A2438] rounded-xl shadow-xl z-10"
          >
            <div className="flex items-start gap-2">
              <MessageCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-[#A79C8C]">
                <p className="font-medium text-[#F5F0E8] mb-1">Reach out to your tutors</p>
                <p className="text-[#6B6358]">If you're having any difficulty with your duty schedule, don't hesitate to contact your assigned tutor for guidance.</p>
                <div className="mt-2 flex gap-2">
                  <button className="text-xs px-3 py-1 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors">
                    Contact Tutor
                  </button>
                  <button 
                    onClick={() => setShowHelp(false)}
                    className="text-xs px-3 py-1 bg-[#2A2438] text-[#6B6358] rounded-lg hover:bg-[#3A3458] transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Duty Alert - Made more conversational */}
      <div className="relative px-5 py-2.5 bg-gradient-to-r from-amber-500/5 via-rose-500/5 to-amber-500/5 border-b border-[#2A2438]">
        <div className="flex items-start gap-2">
          <Bell className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-[#F5F0E8]">
              ⏰ <span className="font-medium text-amber-400">Heads up!</span> Please report to the Tech Center by <span className="font-bold text-amber-400">10:00 PM</span>
            </p>
            <div className="flex items-center gap-3 mt-1 text-xs">
              <span className="text-rose-400/80 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Non-compliance may have consequences
              </span>
              <span className="text-[#6B6358]">•</span>
              <span className="text-[#6B6358] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {getGreeting()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Students List - With personal touch */}
      <div className="divide-y divide-[#1A1428]">
        {totalUsers === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-[#6B6358]">No one on duty today 🤷</p>
          </div>
        ) : (
          dayData.users.map((user: any, userIndex: number) => {
            const initials = getInitials(user.name);
            const avatarColor = getAvatarColor(user.name);

            return (
              <motion.div
                key={userIndex}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: userIndex * 0.02 }}
                className="group/user px-5 py-3 hover:bg-[#1A1428]/50 transition-all duration-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-lg flex-shrink-0`}>
                    {initials}
                  </div>

                  <div className="flex-1">
                    <p className="text-sm text-[#F5F0E8] group-hover/user:text-amber-400 transition-colors">
                      {user.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                  <span className="text-[10px] text-amber-400/60">⚡</span>
                  <span className="text-[10px] text-[#6B6358] font-medium">on duty</span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Footer - Made more casual */}
      <div className="px-5 py-2 bg-[#0B0912]/50 border-t border-[#1A1428] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-3.5 h-3.5 text-amber-400/60" />
          <span className="text-[10px] text-[#6B6358]">
            {totalUsers} on duty
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-[#6B6358]">
          <span>🏷️ {week}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            10 PM
          </span>
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

  // Week filter labels with personality
  const filters = [
    { id: 'all', label: '📋 All Weeks', sub: `${totalStudents} students` },
    { id: 'First Week', label: '🌱 Week 1', sub: 'Jun 29 - Jul 3' },
    { id: 'Second Week', label: '🌿 Week 2', sub: 'Jul 6 - 10' },
    { id: 'Third Week', label: '🌳 Week 3', sub: 'Jul 13 - 17' },
  ];

  return (
    <div className={`${className} max-w-4xl mx-auto`}>
      {/* Header - More personality */}
      {showTitle && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 flex-shrink-0">
              <Sparkles className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#F5F0E8]">
                🧹 Cleaning Rota
              </h2>
              <p className="text-sm text-[#A79C8C] mt-0.5">
                <span className="text-amber-400 font-medium">{totalStudents}</span> students registered across all weeks
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs text-[#6B6358]">
                <span>📢 Registration is ongoing</span>
                <span className="w-1 h-1 rounded-full bg-[#2A2438]" />
                <span className="text-amber-400/70">Need help? Reach out to your tutors!</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Week Selector - More tactile */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap gap-2 mb-6"
      >
        {filters.map((filter) => {
          const isActive = selectedWeek === filter.id;

          return (
            <motion.button
              key={filter.id}
              onClick={() => setSelectedWeek(filter.id as any)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-amber-500 text-[#0B0912] font-medium shadow-lg shadow-amber-500/25'
                  : 'bg-[#150F20] border border-[#2A2438] text-[#A79C8C] hover:border-amber-500/30 hover:text-[#F5F0E8]'
              }`}
            >
              <div className="flex items-center gap-2 text-sm">
                <span>{filter.label}</span>
                {filter.sub && (
                  <span className={`text-[10px] ${isActive ? 'text-[#0B0912]/70' : 'text-[#6B6358]'}`}>
                    • {filter.sub}
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Duty Cards */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={selectedWeek}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
          className="space-y-3.5"
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

      {/* Footer Summary - More organic */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-5"
      >
        <div className="bg-[#150F20]/50 border border-[#2A2438] rounded-xl p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Users className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#F5F0E8]">
                  {totalStudents} total registrations
                </p>
                <p className="text-xs text-[#6B6358]">
                  {selectedWeek === 'all' ? 'All weeks combined' : selectedWeek}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#6B6358]">
              <div className="flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400/60" />
                <span>Registration open</span>
              </div>
              <span className="w-px h-4 bg-[#2A2438]" />
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  Updated {new Date().toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
          {/* New: Tutor reach out message */}
          <div className="mt-3 pt-3 border-t border-[#1A1428] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#6B6358]">
              <MessageCircle className="w-3.5 h-3.5 text-amber-400/60" />
              <span>Having difficulties? </span>
              <button className="text-amber-400/70 hover:text-amber-400 transition-colors font-medium">
                Contact your tutor →
              </button>
            </div>
            <span className="text-[10px] text-[#6B6358]">💡 We're here to help</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}