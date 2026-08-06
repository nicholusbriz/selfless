'use client';

import { useState, useRef } from 'react';
import { 
  Calendar, 
  Users, 
  Clock, 
  Sparkles, 
  Bell, 
  Shield, 
  Award, 
  AlertCircle, 
  MessageCircle,
  LayoutDashboard,
  Download,
  Camera,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// DATA - EXACTLY AS YOU HAD IT
// ============================================
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

// ============================================
// HELPERS
// ============================================
const getInitials = (name: string) => {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const getAvatarColor = (name: string) => {
  const colors = [
    'from-[#E8A33D] to-[#C97F1F]',
    'from-[#14B8A6] to-[#0D9488]',
    'from-[#FB7185] to-[#E11D48]',
    'from-[#8B5CF6] to-[#6366F1]',
    'from-[#F59E0B] to-[#D97706]',
    'from-[#10B981] to-[#059669]',
    'from-[#F472B6] to-[#EC4899]',
    'from-[#06B6D4] to-[#0891B2]',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const getDayColor = (day: string) => {
  const colors: Record<string, string> = {
    'Monday': 'border-[#E8A33D]/30',
    'Tuesday': 'border-[#14B8A6]/30',
    'Wednesday': 'border-[#FB7185]/30',
    'Thursday': 'border-[#8B5CF6]/30',
    'Friday': 'border-[#F59E0B]/30',
  };
  return colors[day] || 'border-[#1A3050]';
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning shift";
  if (hour < 17) return "Afternoon shift";
  return "Evening shift";
};

// ============================================
// DUTY DAY CARD COMPONENT
// ============================================
const DutyDayCard = ({ dayData, week, index }: { dayData: any; week: string; index: number }) => {
  const totalUsers = dayData.users.length;
  const dayName = dayData.day;
  const date = dayData.date;
  const dayColor = getDayColor(dayName);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className={`group relative bg-[#0D1E35] border ${dayColor} rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-[#E8A33D]/10 transition-all duration-500`}
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#E8A33D]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      {/* Day header - Clean version with note after date */}
      <div className="relative px-5 pt-4 pb-3 border-b border-[#1A3050] bg-[#112240]/50">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#E8A33D]/20 to-[#FB7185]/20 border border-[#E8A33D]/30 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-300">
              <img src="/freedom.png" alt="Freedom Logo" className="w-full h-full object-contain p-1" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-bold text-white">
                  {dayName}
                </span>
                <span className="text-xs text-[#8A8278]">•</span>
                <span className="text-xs text-[#C4BDB5]">{date}</span>
                <span className="text-xs text-[#8A8278]">|</span>
                <span className="text-xs text-[#8A8278] font-medium">
                  ⏰ Report by 10:00 PM
                </span>
              </div>
              {/* Note section - moved here after date */}
              <div className="flex items-center gap-2 mt-1">
                <MessageCircle className="w-3 h-3 text-[#E8A33D]/60" />
                <p className="text-[11px] text-[#C4BDB5]">
                  Having difficulties? Reach out to your assigned tutor for guidance
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-4">
            <div className="px-3 py-1 bg-[#E8A33D]/10 border border-[#E8A33D]/20 rounded-full">
              <span className="text-xs font-medium text-[#E8A33D]">
                {totalUsers} {totalUsers === 1 ? 'student' : 'students'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Duty Alert */}
      <div className="relative px-5 py-2.5 bg-gradient-to-r from-[#E8A33D]/5 via-[#FB7185]/5 to-[#E8A33D]/5 border-b border-[#1A3050]">
        <div className="flex items-start gap-2">
          <Bell className="w-4 h-4 text-[#E8A33D] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-white">
              <span className="font-medium text-[#E8A33D]">Reminder:</span> Please report to the Tech Center by <span className="font-bold text-[#E8A33D]">10:00 PM</span>
            </p>
            <div className="flex items-center gap-3 mt-1 text-xs">
              <span className="text-[#FB7185]/80 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Non-compliance may have consequences
              </span>
              <span className="text-[#8A8278]">•</span>
              <span className="text-[#8A8278] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {getGreeting()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="divide-y divide-[#112240]">
        {totalUsers === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-[#8A8278]">No one on duty today 🤷</p>
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
                className="group/user px-5 py-3 hover:bg-[#112240]/50 transition-all duration-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[#E8A33D]/20 flex-shrink-0`}>
                    {initials}
                  </div>

                  <div className="flex-1">
                    <p className="text-sm text-white group-hover/user:text-[#E8A33D] transition-colors">
                      {user.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                  <span className="text-[10px] text-[#E8A33D]/60">⚡</span>
                  <span className="text-[10px] text-[#8A8278] font-medium">on duty</span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Footer - Clean version */}
      <div className="px-5 py-3 bg-[#0A1628]/80 border-t border-[#112240]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-[#E8A33D]/60" />
              <span className="text-[10px] text-[#8A8278]">
                {totalUsers} on duty
              </span>
            </div>
            <span className="w-px h-4 bg-[#1A3050]" />
            <span className="text-[10px] text-[#8A8278]">🏷️ {week}</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-[#8A8278]">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              10 PM
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// SCREENSHOT HELPER COMPONENT
// ============================================
const ScreenshotHelper = ({ onCapture }: { onCapture: () => void }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onCapture}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D1E35] border border-[#1A3050] rounded-lg text-xs text-[#C4BDB5] hover:border-[#E8A33D]/30 hover:text-white transition-all duration-300"
      >
        <Camera className="w-3.5 h-3.5" />
        <span>Capture</span>
      </button>
      <button
        onClick={handleCopyLink}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D1E35] border border-[#1A3050] rounded-lg text-xs text-[#C4BDB5] hover:border-[#E8A33D]/30 hover:text-white transition-all duration-300"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-[#14B8A6]" />
            <span className="text-[#14B8A6]">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Link</span>
          </>
        )}
      </button>
      <button
        onClick={() => window.print()}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D1E35] border border-[#1A3050] rounded-lg text-xs text-[#C4BDB5] hover:border-[#E8A33D]/30 hover:text-white transition-all duration-300"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Print</span>
      </button>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
interface CleaningRotaProps {
  showTitle?: boolean;
  className?: string;
}

export default function CleaningRota({ showTitle = true, className = '' }: CleaningRotaProps) {
  const [selectedWeek, setSelectedWeek] = useState<'all' | 'First Week' | 'Second Week' | 'Third Week'>('all');
  const [isCapturing, setIsCapturing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

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
    { id: 'all', label: '📋 All Weeks', sub: `${totalStudents} students` },
    { id: 'First Week', label: '🌱 Week 1', sub: 'Jun 29 - Jul 3' },
    { id: 'Second Week', label: '🌿 Week 2', sub: 'Jul 6 - 10' },
    { id: 'Third Week', label: '🌳 Week 3', sub: 'Jul 13 - 17' },
  ];

  // Screenshot capture handler
  const handleCapture = () => {
    setIsCapturing(true);
    if (contentRef.current) {
      contentRef.current.classList.add('screenshot-mode');
    }
    
    setTimeout(() => {
      setIsCapturing(false);
      if (contentRef.current) {
        contentRef.current.classList.remove('screenshot-mode');
      }
      alert('📸 Screenshot ready! Use your browser\'s screenshot tool or print to save as PDF.');
    }, 500);
  };

  return (
    <div className={`${className} max-w-4xl mx-auto relative`}>
      {/* Background patterns - matching your layout */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
        backgroundSize: '24px 24px'
      }} />

      {/* Header with Screenshot Tools */}
      {showTitle && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 mb-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-4 mb-2">
                <div className="h-8 w-1 rounded-full bg-gradient-to-b from-[#E8A33D] to-[#14B8A6]" />
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="bg-gradient-to-r from-[#E8A33D]/20 to-[#FB7185]/20 p-2 rounded-xl border border-[#E8A33D]/20">
                    <Calendar className="w-5 h-5 text-[#E8A33D]" />
                  </span>
                  Cleaning Rota
                </h1>
              </div>
              <div className="ml-6 flex flex-wrap items-center gap-4">
                <p className="text-sm text-[#C4BDB5]">
                  <span className="text-[#E8A33D] font-medium">{totalStudents}</span> students registered across all weeks
                </p>
                <div className="flex items-center gap-2 text-xs text-[#8A8278]">
                  <span className="px-2 py-0.5 bg-[#14B8A6]/10 border border-[#14B8A6]/20 rounded-full text-[#14B8A6] text-[10px] font-medium">
                    Registration Open
                  </span>
                  <span className="w-1 h-1 rounded-full bg-[#1A3050]" />
                  <span className="text-[#E8A33D]/70 flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    Need help? Reach out to tutors
                  </span>
                </div>
              </div>
            </div>
            
            {/* Screenshot Tools */}
            <div className="flex-shrink-0">
              <ScreenshotHelper onCapture={handleCapture} />
            </div>
          </div>
        </motion.div>
      )}

      {/* Week Selector */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-wrap gap-2 mb-6"
      >
        {filters.map((filter) => {
          const isActive = selectedWeek === filter.id;

          return (
            <motion.button
              key={filter.id}
              onClick={() => setSelectedWeek(filter.id as any)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`px-4 py-2.5 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] text-[#0A1628] font-semibold shadow-lg shadow-[#E8A33D]/30'
                  : 'bg-[#0D1E35] border border-[#1A3050] text-[#C4BDB5] hover:border-[#E8A33D]/30 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2 text-sm">
                <span>{filter.label}</span>
                {filter.sub && (
                  <span className={`text-[10px] ${isActive ? 'text-[#0A1628]/70' : 'text-[#8A8278]'}`}>
                    • {filter.sub}
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Content - Screenshot Ready */}
      <div 
        ref={contentRef}
        className="relative z-10 screenshot-content"
        style={{
          backgroundColor: '#111110',
          padding: '1px',
          borderRadius: '16px',
        }}
      >
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

        {/* Footer Summary - Clean version */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-5"
        >
          <div className="bg-[#0D1E35] border border-[#1A3050] rounded-2xl p-5 hover:shadow-xl hover:shadow-[#E8A33D]/10 transition-all duration-300">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#E8A33D]/10 border border-[#E8A33D]/20">
                  <Users className="w-4 h-4 text-[#E8A33D]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {totalStudents} total registrations
                  </p>
                  <p className="text-xs text-[#8A8278]">
                    {selectedWeek === 'all' ? 'All weeks combined' : selectedWeek}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#8A8278]">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-[#E8A33D]/60" />
                  <span>Registration open</span>
                </div>
                <span className="w-px h-4 bg-[#1A3050]" />
                <div className="flex items-center gap-1.5">
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
            
            {/* Tutor Contact - Clean version */}
            <div className="mt-3 pt-3 border-t border-[#112240]">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-xs text-[#8A8278]">
                  <MessageCircle className="w-3.5 h-3.5 text-[#E8A33D]/60 flex-shrink-0" />
                  <span>Having difficulties? </span>
                  <button className="text-[#E8A33D]/70 hover:text-[#E8A33D] transition-colors font-medium hover:underline">
                    Contact your tutor →
                  </button>
                </div>
                <span className="text-[10px] text-[#8A8278] flex items-center gap-1 ml-auto">
                  <Sparkles className="w-3 h-3 text-[#E8A33D]" />
                  We're here to help
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Screenshot Mode Styles */}
      <style jsx global>{`
        .screenshot-mode {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        
        .screenshot-mode * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        
        @media print {
          .screenshot-content {
            background: #111110 !important;
            padding: 16px !important;
          }
          
          .screenshot-content * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}