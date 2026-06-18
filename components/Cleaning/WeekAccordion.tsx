import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import DayCard from './DayCard';

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

interface Week {
  id: string;
  weekLabel: string;
  startDate: string;
  endDate: string;
  registrationEnabled: boolean;
  days: CleaningDay[];
}

interface WeekAccordionProps {
  week: Week;
  isExpanded: boolean;
  onToggle: () => void;
  expandedDays: Set<string>;
  onToggleDay: (dayId: string) => void;
  filter?: 'all' | 'attended' | 'pending' | 'no-show';
  children?: React.ReactNode;
}

export default function WeekAccordion({ 
  week, 
  isExpanded, 
  onToggle, 
  expandedDays, 
  onToggleDay,
  filter = 'all',
  children 
}: WeekAccordionProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden hover:border-purple-500/30 transition-all"
    >
      {/* Week Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggle}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0"
          >
            {isExpanded ? (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
          <div className="text-left">
            <h3 className="text-white font-semibold">
              {week.weekLabel || `Week ${formatDate(week.startDate)}`}
            </h3>
            <p className="text-gray-400 text-xs">
              {formatDate(week.startDate)} - {formatDate(week.endDate)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {week.registrationEnabled ? (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span className="text-xs font-medium text-green-400">Open</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30">
              <XCircle className="w-3 h-3 text-red-400" />
              <span className="text-xs font-medium text-red-400">Closed</span>
            </div>
          )}
          {children}
        </div>
      </div>

      {/* Expanded Days */}
      {isExpanded && (
        <div className="border-t border-white/10">
          <div className="p-4 space-y-3">
            {week.days.map((day) => (
              <DayCard
                key={day.id}
                day={day}
                isExpanded={expandedDays.has(day.id)}
                onToggle={() => onToggleDay(day.id)}
                filter={filter}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
