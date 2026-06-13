'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Users, CheckCircle, XCircle, Clock, ChevronDown, 
  ChevronUp, Sparkles, Filter 
} from 'lucide-react';

interface CleaningStudent {
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
}

// Complete data based on your provided information
const cleaningData: CleaningDay[] = [
  {
    id: '1',
    dayName: 'Monday',
    date: 'Monday, May 4, 2026',
    registered: 5,
    attended: 0,
    pending: 5,
    noShow: 0,
    students: [
      { name: 'Gertrude Nakitende', status: 'pending' },
      { name: 'Lisa Nyangoma', status: 'pending' },
      { name: 'Princess Agatha Natamba', status: 'pending' },
      { name: 'Deus Byomuhangi', status: 'pending' },
      { name: 'Abaho Ivan', status: 'pending' }
    ]
  },
  {
    id: '2',
    dayName: 'Tuesday',
    date: 'Tuesday, May 5, 2026',
    registered: 5,
    attended: 3,
    pending: 0,
    noShow: 2,
    students: [
      { name: 'Akangumya Joan', status: 'attended' },
      { name: 'Reagan Ddamba', status: 'no-show' },
      { name: 'Namuyanja Ruth', status: 'no-show' },
      { name: 'Jordan Edward', status: 'attended' },
      { name: 'Rediat Emmanuel', status: 'attended' }
    ]
  },
  {
    id: '3',
    dayName: 'Wednesday',
    date: 'Wednesday, May 6, 2026',
    registered: 5,
    attended: 3,
    pending: 0,
    noShow: 2,
    students: [
      { name: 'ayamo mary', status: 'no-show' },
      { name: 'Nalubega Maria', status: 'no-show' },
      { name: 'Samuel Were', status: 'attended' },
      { name: 'lugolobi Tony Leon', status: 'attended' },
      { name: 'Adriko Cyrus', status: 'attended' }
    ]
  },
  {
    id: '4',
    dayName: 'Thursday',
    date: 'Thursday, May 7, 2026',
    registered: 2,
    attended: 0,
    pending: 2,
    noShow: 0,
    students: [
      { name: 'Obed Bwende', status: 'pending' },
      { name: 'Racheal Christian Nakazzi', status: 'pending' }
    ]
  },
  {
    id: '5',
    dayName: 'Friday',
    date: 'Friday, May 8, 2026',
    registered: 5,
    attended: 0,
    pending: 5,
    noShow: 0,
    students: [
      { name: 'Nabulo Rosemary', status: 'pending' },
      { name: 'Oliver Kagabane', status: 'pending' },
      { name: 'MASAAZI FASWIHA WASSWA', status: 'pending' },
      { name: 'Max Tinka', status: 'pending' },
      { name: 'Rubangakene Brian Bernie', status: 'pending' }
    ]
  },
  {
    id: '6',
    dayName: 'Monday',
    date: 'Monday, May 11, 2026',
    registered: 4,
    attended: 0,
    pending: 4,
    noShow: 0,
    students: [
      { name: 'Hyla Nalwadda', status: 'pending' },
      { name: 'Gamutambuli Job', status: 'pending' },
      { name: 'Brendah Ainembabazi', status: 'pending' },
      { name: 'Ssali Arafat', status: 'pending' }
    ]
  },
  {
    id: '7',
    dayName: 'Tuesday',
    date: 'Tuesday, May 12, 2026',
    registered: 5,
    attended: 0,
    pending: 5,
    noShow: 0,
    students: [
      { name: 'Ayesigwa Skemper', status: 'pending' },
      { name: 'Tendo Maria', status: 'pending' },
      { name: 'Sekirangi Edward Tendo Kironde', status: 'pending' },
      { name: 'Ssekyanzi Erick Kityo', status: 'pending' },
      { name: 'Lovely Britney', status: 'pending' }
    ]
  },
  {
    id: '8',
    dayName: 'Wednesday',
    date: 'Wednesday, May 13, 2026',
    registered: 2,
    attended: 2,
    pending: 0,
    noShow: 0,
    students: [
      { name: 'Edwin Kambale', status: 'attended' },
      { name: 'Mutumba Gilbert', status: 'attended' }
    ]
  },
  {
    id: '9',
    dayName: 'Thursday',
    date: 'Thursday, May 14, 2026',
    registered: 5,
    attended: 0,
    pending: 5,
    noShow: 0,
    students: [
      { name: 'Fredrick Oketcho', status: 'pending' },
      { name: 'Chris Bwambale', status: 'pending' },
      { name: 'Bulyaba Tracy', status: 'pending' },
      { name: 'Kabanda Ronald', status: 'pending' },
      { name: 'Tom Kasozi', status: 'pending' }
    ]
  },
  {
    id: '10',
    dayName: 'Friday',
    date: 'Friday, May 15, 2026',
    registered: 5,
    attended: 0,
    pending: 5,
    noShow: 0,
    students: [
      { name: 'Sumaya Namaganda', status: 'pending' },
      { name: 'Babirye Badria', status: 'pending' },
      { name: 'Cyrua Ssekiranda', status: 'pending' },
      { name: 'Nakyanzi Bridget', status: 'pending' },
      { name: 'Columbus Olanya', status: 'pending' }
    ]
  },
  {
    id: '11',
    dayName: 'Monday',
    date: 'Monday, May 18, 2026',
    registered: 4,
    attended: 0,
    pending: 4,
    noShow: 0,
    students: [
      { name: 'Dira Luke', status: 'pending' },
      { name: 'Christine Nasaazi', status: 'pending' },
      { name: 'Promise Bella', status: 'pending' },
      { name: 'Joseph Izabayo', status: 'pending' }
    ]
  },
  {
    id: '12',
    dayName: 'Tuesday',
    date: 'Tuesday, May 19, 2026',
    registered: 5,
    attended: 3,
    pending: 0,
    noShow: 2,
    students: [
      { name: 'Baguma Julius', status: 'attended' },
      { name: 'Paul Ethan', status: 'no-show' },
      { name: 'Vanessa Lwaya', status: 'attended' },
      { name: 'Berna Nakalyango', status: 'no-show' },
      { name: 'Kintu Isaac', status: 'attended' }
    ]
  },
  {
    id: '13',
    dayName: 'Wednesday',
    date: 'Wednesday, May 20, 2026',
    registered: 5,
    attended: 0,
    pending: 5,
    noShow: 0,
    students: [
      { name: 'Julius Mwanika', status: 'pending' },
      { name: 'Adiao betty', status: 'pending' },
      { name: 'Apieun Isaac', status: 'pending' },
      { name: 'Sayuni Elizabeth', status: 'pending' },
      { name: 'Majok Manytil', status: 'pending' }
    ]
  },
  {
    id: '14',
    dayName: 'Thursday',
    date: 'Thursday, May 21, 2026',
    registered: 5,
    attended: 0,
    pending: 5,
    noShow: 0,
    students: [
      { name: 'MFITUNDINDA BAKER', status: 'pending' },
      { name: 'Roike Junior', status: 'pending' },
      { name: 'Musanabera Yvonne', status: 'pending' },
      { name: 'Rosemary Maya Atm', status: 'pending' },
      { name: 'Micheal Katende', status: 'pending' }
    ]
  },
  {
    id: '15',
    dayName: 'Friday',
    date: 'Friday, May 22, 2026',
    registered: 5,
    attended: 0,
    pending: 5,
    noShow: 0,
    students: [
      { name: 'Maria Akumu', status: 'pending' },
      { name: 'Okongo. Richardben', status: 'pending' },
      { name: 'Nalubega Safina', status: 'pending' },
      { name: 'Majok Aguer', status: 'pending' },
      { name: 'Mubiru Destiny', status: 'pending' }
    ]
  }
];

const statusConfig = {
  attended: { 
    icon: CheckCircle, 
    label: 'Attended', 
    color: 'text-green-400', 
    bg: 'bg-green-500/20', 
    border: 'border-green-500/30',
    emoji: '✓'
  },
  pending: { 
    icon: Clock, 
    label: 'Pending', 
    color: 'text-yellow-400', 
    bg: 'bg-yellow-500/20', 
    border: 'border-yellow-500/30',
    emoji: '⏳'
  },
  'no-show': { 
    icon: XCircle, 
    label: 'No Show', 
    color: 'text-red-400', 
    bg: 'bg-red-500/20', 
    border: 'border-red-500/30',
    emoji: '✗'
  }
};

export default function CleaningTab() {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set(['1', '2', '3', '4', '5']));
  const [filter, setFilter] = useState<'all' | 'attended' | 'pending' | 'no-show'>('all');

  const toggleDay = (dayId: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dayId)) {
      newExpanded.delete(dayId);
    } else {
      newExpanded.add(dayId);
    }
    setExpandedDays(newExpanded);
  };

  const expandAll = () => {
    setExpandedDays(new Set(cleaningData.map(day => day.id)));
  };

  const collapseAll = () => {
    setExpandedDays(new Set());
  };

  const getFilteredStudents = (students: CleaningStudent[]) => {
    if (filter === 'all') return students;
    return students.filter(student => student.status === filter);
  };

  const getStatusBadge = (count: number, status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    if (count === 0) return null;
    return (
      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${config.bg} border ${config.border}`}>
        {config.icon && <config.icon className={`w-3 h-3 ${config.color}`} />}
        <span className={`text-xs font-medium ${config.color}`}>{count}</span>
      </div>
    );
  };

  const getStatusEmoji = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    return config?.emoji || '⏳';
  };

  // Calculate totals
  const totals = {
    registered: cleaningData.reduce((sum, day) => sum + day.registered, 0),
    attended: cleaningData.reduce((sum, day) => sum + day.attended, 0),
    pending: cleaningData.reduce((sum, day) => sum + day.pending, 0),
    noShow: cleaningData.reduce((sum, day) => sum + day.noShow, 0)
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Cleaning Schedule</h2>
            <p className="text-gray-400 text-sm">Track student attendance for cleaning days</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filter Buttons */}
          <div className="flex bg-white/5 rounded-lg p-1 gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filter === 'all' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('attended')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                filter === 'attended' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <CheckCircle className="w-3 h-3" />
              Attended
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                filter === 'pending' ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Clock className="w-3 h-3" />
              Pending
            </button>
            <button
              onClick={() => setFilter('no-show')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                filter === 'no-show' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <XCircle className="w-3 h-3" />
              No Show
            </button>
          </div>

          {/* Expand/Collapse Buttons */}
          <div className="flex gap-2">
            <button
              onClick={expandAll}
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-purple-500/10 rounded-xl p-3 text-center border border-purple-500/20"
        >
          <Users className="w-5 h-5 text-purple-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{totals.registered}</p>
          <p className="text-gray-400 text-xs">Total Registered</p>
        </motion.div>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-green-500/10 rounded-xl p-3 text-center border border-green-500/20"
        >
          <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{totals.attended}</p>
          <p className="text-gray-400 text-xs">Total Attended</p>
        </motion.div>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-yellow-500/10 rounded-xl p-3 text-center border border-yellow-500/20"
        >
          <Clock className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{totals.pending}</p>
          <p className="text-gray-400 text-xs">Total Pending</p>
        </motion.div>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-red-500/10 rounded-xl p-3 text-center border border-red-500/20"
        >
          <XCircle className="w-5 h-5 text-red-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{totals.noShow}</p>
          <p className="text-gray-400 text-xs">Total No Show</p>
        </motion.div>
      </div>

      {/* Cleaning Days List */}
      <div className="space-y-3">
        {cleaningData.map((day, index) => {
          const isExpanded = expandedDays.has(day.id);
          const filteredStudents = getFilteredStudents(day.students);
          const hasStudents = filteredStudents.length > 0;

          return (
            <motion.div
              key={day.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.02 }}
              className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden hover:border-purple-500/30 transition-all"
            >
              {/* Day Header */}
              <button
                onClick={() => toggleDay(day.id)}
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
                  {/* Status Badges - Showing Registered, Attended, Pending, No Show counts */}
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30">
                      <Users className="w-3 h-3 text-purple-400" />
                      <span className="text-xs font-medium text-purple-400">{day.registered}</span>
                    </div>
                    {getStatusBadge(day.attended, 'attended')}
                    {getStatusBadge(day.pending, 'pending')}
                    {getStatusBadge(day.noShow, 'no-show')}
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
                    <div className="p-4">
                      {hasStudents ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {filteredStudents.map((student, idx) => {
                            const emoji = getStatusEmoji(student.status);
                            const config = statusConfig[student.status];
                            
                            return (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2, delay: idx * 0.01 }}
                                className={`flex items-center justify-between p-2 rounded-lg bg-white/5 border ${config?.border} hover:bg-white/10 transition-all group`}
                              >
                                <span className="text-white text-xs truncate flex-1 mr-2" title={student.name}>
                                  {student.name}
                                </span>
                                <span className="text-sm">{emoji}</span>
                              </motion.div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <Filter className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">No students match the selected filter</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}