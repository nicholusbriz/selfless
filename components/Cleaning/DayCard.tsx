import { motion, AnimatePresence } from 'framer-motion';
import { Users, ChevronDown, ChevronUp } from 'lucide-react';
import StatusBadge from './StatusBadge';
import StudentList from './StudentList';

interface CleaningStudent {
  id: string;
  name: string;
  status: 'attended' | 'pending' | 'no-show';
  user?: {
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
}

interface CleaningDay {
  id: string;
  dayName: string;
  date: string;
  registered: number;
  attended: number;
  pending: number;
  noShow: number;
  students: CleaningStudent[];
  isFull: boolean;
  isOpen: boolean;
  weekLabel?: string;
}

interface DayCardProps {
  day: CleaningDay;
  isExpanded: boolean;
  onToggle: () => void;
  filter?: 'all' | 'attended' | 'pending' | 'no-show';
  index?: number;
}

export default function DayCard({ day, isExpanded, onToggle, filter = 'all', index = 0 }: DayCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.03, ease: "easeOut" }}
      className="group relative bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl rounded-2xl border border-white/10 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 overflow-hidden"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Decorative glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
      
      {/* Day Header */}
      <button
        onClick={onToggle}
        className="relative w-full px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-md opacity-50" />
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-white font-bold text-lg">{day.dayName.charAt(0)}</span>
            </div>
          </div>
          <div className="text-left">
            <h3 className="text-white font-bold text-base sm:text-lg group-hover:text-purple-300 transition-colors">{day.dayName}</h3>
            <p className="text-purple-400/80 text-xs font-medium">{day.date}</p>
            {day.weekLabel && (
              <p className="text-gray-500 text-[10px] mt-0.5">{day.weekLabel}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Status Badges */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 backdrop-blur-sm">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs font-bold text-purple-400">{day.registered}</span>
            </div>
            <StatusBadge count={day.attended} status="attended" />
            <StatusBadge count={day.pending} status="pending" />
            <StatusBadge count={day.noShow} status="no-show" />
          </div>
          
          {/* Expand/Collapse Icon */}
          <div className="text-gray-400 ml-1 group-hover:text-purple-300 transition-colors">
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </div>
        </div>
      </button>

      {/* Expanded Students List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative border-t border-white/10 bg-white/5/50"
          >
            <StudentList students={day.students} filter={filter} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
