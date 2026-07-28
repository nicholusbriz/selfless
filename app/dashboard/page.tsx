'use client';

import { useState } from 'react';
import { Calendar, Users, Clock, BookOpen, BarChart3, User, Megaphone, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Exact user data 
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

// Get initials for avatar
const getInitials = (name: string) => {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// Get avatar color based on name
const getAvatarColor = (name: string) => {
  const colors = [
    'from-[#E8A33D] to-[#C97F1F]',
    'from-[#14B8A6] to-[#0D9488]',
    'from-[#FB7185] to-[#E11D48]',
    'from-[#6366F1] to-[#4F46E5]',
    'from-[#34D399] to-[#059669]',
    'from-[#F59E0B] to-[#D97706]',
    'from-[#8B5CF6] to-[#7C3AED]',
    'from-[#EC4899] to-[#BE185D]',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Get day icon
const getDayIcon = (day: string) => {
  const icons: Record<string, string> = {
    'Monday': '📅',
    'Tuesday': '📆',
    'Wednesday': '📋',
    'Thursday': '📌',
    'Friday': '🎯',
  };
  return icons[day] || '📅';
};

// Enhanced Duty Day Card Component
const DutyDayCard = ({ dayData, week }: { dayData: any; week: string }) => {
  const totalUsers = dayData.users.length;
  const dayName = dayData.day;
  const date = dayData.date;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#150F20] to-[#1A1428] border-2 border-[#E8A33D]/30 rounded-2xl overflow-hidden shadow-2xl shadow-[#E8A33D]/10 hover:shadow-[#E8A33D]/20 transition-all duration-300"
    >
      {/* DUTY ALERT BANNER */}
      <div className="bg-gradient-to-r from-[#E8A33D]/20 via-[#E8A33D]/10 to-[#C97F1F]/20 px-4 py-3 border-b-2 border-[#E8A33D]/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <span className="text-sm font-bold text-[#E8A33D] uppercase tracking-wider">Duty Alert</span>
          </div>
          <div className="px-3 py-1 bg-[#E8A33D]/20 rounded-full border border-[#E8A33D]/30">
            <span className="text-xs font-medium text-[#E8A33D]">
              {totalUsers} {totalUsers === 1 ? 'Student' : 'Students'}
            </span>
          </div>
        </div>
      </div>

      {/* DAY & DATE */}
      <div className="px-4 py-3 border-b border-[#2A2438]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getDayIcon(dayName)}</span>
            <div>
              <h3 className="text-lg font-bold text-[#F5F0E8]">{dayName}</h3>
              <p className="text-xs text-[#A79C8C]">{date} • {week}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#E8A33D] animate-pulse"></div>
            <span className="text-xs text-[#E8A33D] font-medium">Tomorrow</span>
          </div>
        </div>
      </div>

      {/* DUTY MESSAGE */}
      <div className="px-4 py-3 bg-[#E8A33D]/5 border-b border-[#2A2438]">
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-base mt-0.5">🕐</span>
            <p className="text-sm text-[#F5F0E8]">
              You are required to be at the <span className="font-bold text-[#E8A33D]">Tech Center</span> 
              not later than <span className="font-bold text-[#E8A33D]">10:00 PM</span>
            </p>
          </div>
          <div className="flex items-start gap-2 pl-6">
            <span className="text-base">⚠️</span>
            <p className="text-xs text-[#FB7185] font-medium">
              Failure to comply, be ready to face the consequences.
            </p>
          </div>
        </div>
      </div>

      {/* STUDENTS LIST */}
      <div className="divide-y divide-[#2A2438]">
        {totalUsers === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-[#6B6358]">No students on duty for this day</p>
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
                transition={{ duration: 0.2, delay: userIndex * 0.05 }}
                className="px-4 py-3 hover:bg-[#2A2438]/30 transition-colors duration-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-[#0B0912] font-bold text-sm flex-shrink-0 shadow-lg`}>
                    {initials}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#F5F0E8] truncate">
                      {user.name}
                    </p>
                  </div>
                </div>

                {/* DUTY BADGE */}
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <div className="px-3 py-1 bg-[#E8A33D]/20 border border-[#E8A33D]/30 rounded-full whitespace-nowrap">
                    <span className="text-xs font-medium text-[#E8A33D]">⭐ ON DUTY</span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* FOOTER */}
      <div className="px-4 py-2 bg-[#0B0912]/50 border-t border-[#2A2438]">
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#6B6358]">
            📋 {totalUsers} student{totalUsers !== 1 ? 's' : ''} on duty tomorrow
          </p>
          <p className="text-[10px] text-[#6B6358]">
            ⏰ Report by 10:00 PM
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default function DashboardPage() {
  const [selectedWeek, setSelectedWeek] = useState<'all' | 'First Week' | 'Second Week' | 'Third Week'>('all');

  // Get current week data
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

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#E8A33D]/20 to-[#C97F1F]/10 border border-[#E8A33D]/20">
            <Calendar className="w-6 h-6 text-[#E8A33D]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#F5F0E8]" style={{ fontFamily: 'var(--font-display)' }}>
              Dashboard
            </h1>
            <p className="text-sm text-[#A79C8C]">Welcome to your dashboard</p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-[#F5F0E8] mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/dashboard/courses"
            className="bg-[#150F20] border border-[#2A2438] rounded-xl p-4 hover:border-[#E8A33D]/50 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#14B8A6]/10 group-hover:bg-[#14B8A6]/20 transition-colors">
                <BookOpen className="w-5 h-5 text-[#14B8A6]" />
              </div>
              <div>
                <p className="text-[#F5F0E8] font-medium">My Courses</p>
                <p className="text-xs text-[#6B6358]">View your courses</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/grades"
            className="bg-[#150F20] border border-[#2A2438] rounded-xl p-4 hover:border-[#E8A33D]/50 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#FB7185]/10 group-hover:bg-[#FB7185]/20 transition-colors">
                <BarChart3 className="w-5 h-5 text-[#FB7185]" />
              </div>
              <div>
                <p className="text-[#F5F0E8] font-medium">My Grades</p>
                <p className="text-xs text-[#6B6358]">View your grades</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/profile"
            className="bg-[#150F20] border border-[#2A2438] rounded-xl p-4 hover:border-[#E8A33D]/50 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#8B5CF6]/10 group-hover:bg-[#8B5CF6]/20 transition-colors">
                <User className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <div>
                <p className="text-[#F5F0E8] font-medium">My Profile</p>
                <p className="text-xs text-[#6B6358]">Manage your profile</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/announcements"
            className="bg-[#150F20] border border-[#2A2438] rounded-xl p-4 hover:border-[#E8A33D]/50 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#F59E0B]/10 group-hover:bg-[#F59E0B]/20 transition-colors">
                <Megaphone className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div>
                <p className="text-[#F5F0E8] font-medium">Announcements</p>
                <p className="text-xs text-[#6B6358]">View announcements</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/settings"
            className="bg-[#150F20] border border-[#2A2438] rounded-xl p-4 hover:border-[#E8A33D]/50 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#6366F1]/10 group-hover:bg-[#6366F1]/20 transition-colors">
                <Settings className="w-5 h-5 text-[#6366F1]" />
              </div>
              <div>
                <p className="text-[#F5F0E8] font-medium">Settings</p>
                <p className="text-xs text-[#6B6358]">Account settings</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Week Selector */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={() => setSelectedWeek('all')}
          className={`px-4 py-2 rounded-lg transition-all duration-200 ${
            selectedWeek === 'all'
              ? 'bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] text-[#0B0912] font-medium shadow-lg shadow-[#E8A33D]/20'
              : 'bg-[#2A2438] text-[#A79C8C] hover:bg-[#3A3448] hover:text-[#F5F0E8]'
          }`}
        >
          All Weeks
        </button>
        <button
          onClick={() => setSelectedWeek('First Week')}
          className={`px-4 py-2 rounded-lg transition-all duration-200 ${
            selectedWeek === 'First Week'
              ? 'bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] text-[#0B0912] font-medium shadow-lg shadow-[#E8A33D]/20'
              : 'bg-[#2A2438] text-[#A79C8C] hover:bg-[#3A3448] hover:text-[#F5F0E8]'
          }`}
        >
          First Week (June 29 - July 3)
        </button>
        <button
          onClick={() => setSelectedWeek('Second Week')}
          className={`px-4 py-2 rounded-lg transition-all duration-200 ${
            selectedWeek === 'Second Week'
              ? 'bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] text-[#0B0912] font-medium shadow-lg shadow-[#E8A33D]/20'
              : 'bg-[#2A2438] text-[#A79C8C] hover:bg-[#3A3448] hover:text-[#F5F0E8]'
          }`}
        >
          Second Week (July 6 - 10)
        </button>
        <button
          onClick={() => setSelectedWeek('Third Week')}
          className={`px-4 py-2 rounded-lg transition-all duration-200 ${
            selectedWeek === 'Third Week'
              ? 'bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] text-[#0B0912] font-medium shadow-lg shadow-[#E8A33D]/20'
              : 'bg-[#2A2438] text-[#A79C8C] hover:bg-[#3A3448] hover:text-[#F5F0E8]'
          }`}
        >
          Third Week (July 13 - 17)
        </button>
      </div>

      {/* Duty Cards - Enhanced */}
      <div className="space-y-6 max-w-3xl mx-auto">
        {days.map((dayData, index) => (
          <DutyDayCard 
            key={`${dayData.week}-${dayData.day}-${index}`}
            dayData={dayData}
            week={dayData.week}
          />
        ))}
      </div>

      {/* Total Summary */}
      <div className="mt-8 max-w-3xl mx-auto">
        <div className="bg-[#150F20] border border-[#2A2438] rounded-2xl p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#E8A33D]/10 border border-[#E8A33D]/20">
                <Users className="w-5 h-5 text-[#E8A33D]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#F5F0E8]">
                  Total Registrations: {
                    days.reduce((acc, day) => acc + day.users.length, 0)
                  }
                </p>
                <p className="text-xs text-[#6B6358]">
                  {selectedWeek === 'all' ? 'All weeks' : selectedWeek}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-[#6B6358]">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Last updated: {new Date().toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}