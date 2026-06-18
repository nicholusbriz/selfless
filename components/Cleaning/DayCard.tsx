import { motion, AnimatePresence } from 'framer-motion';
import { Users, ChevronDown, ChevronUp } from 'lucide-react';
import StatusBadge from './StatusBadge';
import StudentList from './StudentList';

interface CleaningStudent {
  id: string;
  name: string;
  status: 'attended' | 'pending' | 'no-show';
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.02 }}
      className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden hover:border-purple-500/30 transition-all"
    >
      {/* Day Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">{day.dayName.charAt(0)}</span>
          </div>
          <div className="text-left">
            <h3 className="text-white font-semibold text-sm sm:text-base">{day.dayName}</h3>
            <p className="text-gray-400 text-xs">{day.date}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Badges */}
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30">
              <Users className="w-3 h-3 text-purple-400" />
              <span className="text-xs font-medium text-purple-400">{day.registered}</span>
            </div>
            <StatusBadge count={day.attended} status="attended" />
            <StatusBadge count={day.pending} status="pending" />
            <StatusBadge count={day.noShow} status="no-show" />
          </div>
          
          {/* Expand/Collapse Icon */}
          <div className="text-gray-400 ml-1">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
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
            transition={{ duration: 0.3 }}
            className="border-t border-white/10"
          >
            <StudentList students={day.students} filter={filter} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
